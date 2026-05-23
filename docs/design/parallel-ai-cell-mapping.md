# 并行 AI 实施 · 前端 Cell 映射方案

> 版本：**v1.0** · 起草日期：2026-05-23
> 仓库：`ghbvf/gocell-web`
> 关闭：PRD §12 未决项「前端架构原则（cell/slice 边界 → AI 并行隔离）」
> 替换：PRD §9 目录结构

---

## 0. TL;DR

把 gocell-web 从单 app 扁平结构升级为 **pnpm workspace monorepo**：

- `apps/web/` —— 主应用（路由聚合 + 装配层）
- `packages/<cell>/` —— 每个业务包对齐后端一个 cell；包之间通过 `package.json#dependencies` 显式声明
- `packages/{core, shared, contracts, request}` —— 基础设施层

**物理隔离**走 git worktree；**逻辑隔离**走 pnpm `workspace:*` + 每包唯一 `src/index.ts` 导出口。这套组合等价于后端 Cell/Slice/Contract 的边界约束。

---

## 1. 背景

PRD §0 已锁定 5 项决策（D1–D5），但 §12 留了一项未决：

> 前端架构原则（cell/slice 边界 → AI 并行隔离） · **沟通中**
> 用户对"照搬 gocell 目录"提出质疑，需另起讨论：前端原生的隔离机制（chunk / TS project refs / 自动注册）。本 PRD 不锁定，待对齐后单独成文。

本文档关闭这一项。

### 1.1 核心诉求

让多个 AI agent 能在同一仓库上**并行实施不同业务模块**，互不破坏。具体需求：

1. **物理隔离**：每个 agent 在独立 worktree 工作，文件改动不串
2. **逻辑隔离**：A agent 改 access 时，不能误碰 audit 的私有实现
3. **契约边界**：跨业务交互必须显式声明（PR diff 能看出来）
4. **对齐后端**：前端业务模块名 = 后端 cell 名，issue 跨前后端复用

### 1.2 调研结论（要点）

| 选项 | 结论 |
|---|---|
| Feature-Sliced Design (FSD) | Vue 圈非主流，头部项目 0 个使用；React 圈热 |
| 单 app + 扁平 `src/{api,store,views}/` | Vue 圈主流（Vben/JeecgBoot/Pure Admin 都是），但 AI 并行时容易冲突 |
| **pnpm workspace + 平铺 packages**（本方案） | **Vue 圈头部项目主流**（Vben 31.8k star 同此结构）；天然提供包级隔离 |

详见 §9 决策记录。

---

## 2. 目标与非目标

### 2.1 目标
- **G1** 多 AI agent 并行时，业务包之间不能误改对方私有 src/
- **G2** 跨包依赖必须在 `package.json` 显式声明，PR diff 一眼可见
- **G3** 前端业务包名 = 后端 cell 名（access / audit / config / observability）
- **G4** 对 PRD §3 锁定的技术栈（Vue 3 + Vite + TS + Pinia + Vue Router + AntD Vue）零冲突

### 2.2 非目标
- 不做微前端（module federation）
- 不强制 FSD 的 layer/slice/segment 三轴术语
- 不引入 Nx（pnpm workspace 已够用）

---

## 3. 设计原则

从后端 Cell/Slice/Contract 模型抽取的不变量：

| 后端原则 | 前端映射 |
|---|---|
| Cell 是域单元，有 `owner` + `schema.primary` 边界 | 一个 package 对应一个 cell，`package.json#name` 是唯一标识 |
| Slice 用 `belongsToCell` 声明归属 | 包内 `src/` 默认私有，不允许跨包深路径 import |
| Slice 用 `contractUsages` 声明依赖 | 跨包依赖必须在 `package.json#dependencies` 显式列出 |
| Slice 用 `allowedFiles: cells/X/slices/Y/**` 锁修改范围 | git worktree + 包目录隔离 = 修改范围天然受限 |
| Contract 用 `ownerCell` + `endpoints.clients` 白名单 | 包的 `src/index.ts` 是唯一导出口；不导出 = 私有 |
| archtest 跨边界 import 检测 | pnpm `workspace:*` 解析 + tsconfig 路径解析联合校验 |

---

## 4. 目标骨架

```
gocell-web/
│
├── apps/
│   └── web/                                # @gocell/web        主应用
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── router/                     # 聚合各 package 导出的 routes
│           ├── stores/                     # 应用级 store：auth / theme / i18n
│           ├── layouts/                    # AppShell / AuthShell
│           ├── views/                      # 薄页面壳（主体在 packages/*）
│           └── styles/                     # 全局 SCSS 入口
│
├── packages/                               # 平铺
│   │
│   │ ── 基础设施层（4 个）
│   ├── core/                               # @gocell/core           tokens + UI 原子 + theme/i18n composables
│   ├── shared/                             # @gocell/shared         utils / constants / types
│   ├── contracts/                          # @gocell/contracts      后端 schema → ts 派生（PRD D1）
│   ├── request/                            # @gocell/request        axios 实例 + 拦截器
│   │
│   │ ── 业务能力层（对齐后端 cells/*）
│   ├── access/                             # @gocell/access         ← cells/accesscore
│   ├── audit/                              # @gocell/audit          ← cells/auditcore
│   ├── config/                             # @gocell/config         ← cells/configcore
│   └── observability/                      # @gocell/observability  ← BR-003 LGTM
│
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

### 4.1 业务 package 内部约定

所有 `packages/<cell>/` 统一遵循：

```
packages/access/
├── package.json                            # name: @gocell/access
├── tsconfig.json
└── src/
    ├── api/                                # 调 backend HTTP；import @gocell/contracts、@gocell/request
    ├── components/                         # 业务组件（IdentityList、PolicyForm…）
    ├── composables/                        # useIdentities、usePolicies
    ├── stores/                             # 包内 Pinia store
    ├── routes.ts                           # 路由声明（由 apps/web/router 聚合）
    └── index.ts                            # ★ 唯一对外导出口
```

**关键约束**：包外只能 `import { x } from '@gocell/access'`，不允许 `import { x } from '@gocell/access/src/stores/foo'`。

---

## 5. 跨包依赖规则

### 5.1 依赖声明

```json
// packages/access/package.json
{
  "name": "@gocell/access",
  "dependencies": {
    "@gocell/contracts": "workspace:*",
    "@gocell/core": "workspace:*",
    "@gocell/request": "workspace:*",
    "@gocell/shared": "workspace:*"
  }
}
```

→ `@gocell/access` 不能 `import` `@gocell/audit` 或 `@gocell/config` 的任何东西（不在 deps 里 = 解析失败）。

### 5.2 跨业务包通信（极少数情况）

如果 `access` 真的需要 `audit` 的能力，**两条路**：

1. **下沉**：把共用部分移到 `@gocell/shared`，两边都引
2. **显式依赖**：在 `access/package.json#dependencies` 加 `@gocell/audit`，PR 中显式可见，由审查者判断是否合理

不允许的：用相对路径 `../../audit/src/...` 绕开（pnpm + tsconfig 都不解析）。

### 5.3 装配层依赖

```json
// apps/web/package.json
{
  "name": "@gocell/web",
  "dependencies": {
    "@gocell/access": "workspace:*",
    "@gocell/audit": "workspace:*",
    "@gocell/config": "workspace:*",
    "@gocell/observability": "workspace:*",
    "@gocell/core": "workspace:*",
    "@gocell/contracts": "workspace:*",
    "@gocell/request": "workspace:*",
    "@gocell/shared": "workspace:*"
  }
}
```

---

## 6. 隔离机制总览

| 层 | 机制 | 等价于后端 |
|---|---|---|
| 物理 | git worktree | git worktree |
| 包边界 | `package.json#dependencies` + pnpm `workspace:*` | `slice.yaml#contractUsages` |
| 跨包入口 | `src/index.ts` 唯一导出 | Contract 的 `ownerCell` + `endpoints.clients` 白名单 |
| 类型契约 | `@gocell/contracts`（schema 派生，CI 校验只读） | `contracts/http/**/*.schema.json` |
| 版本一致 | `pnpm-workspace.yaml` 的 `catalog:` 段（Vue/Pinia/AntD 钉死） | go.mod |

---

## 7. AI 并行工作流

### 7.1 worktree 命名约定（沿用后端）

格式：`<issue-num>-<short-slug>`

例：
- `101-access-identities-pagination` → 改 `packages/access/`
- `102-audit-export-csv` → 改 `packages/audit/`
- `103-config-feature-flag-cache` → 改 `packages/config/`

### 7.2 一次并行实施示例

| Agent | worktree | 业务包 | PR 涉及目录 |
|---|---|---|---|
| A | `101-access-identities-pagination` | `@gocell/access` | `packages/access/**` |
| B | `102-audit-export-csv` | `@gocell/audit` | `packages/audit/**` |
| C | `103-config-flag-cache` | `@gocell/config` | `packages/config/**` |

三个 agent 同时跑，**git 层无冲突**（不同目录），**包层无串改**（pnpm 解析阻止）。

### 7.3 PR 审查要点

- diff 是否只动了自己业务包目录？跨包改动需说明
- `package.json#dependencies` 是否新增了业务包依赖？需评审合理性
- `src/index.ts` 是否新导出了之前私有的符号？需评审是否过度暴露

---

## 8. 路由聚合方式

### 8.1 包内声明

```ts
// packages/access/src/routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const accessRoutes: RouteRecordRaw[] = [
  { path: '/access/identities', component: () => import('./components/IdentitiesPage.vue') },
  { path: '/access/policies',   component: () => import('./components/PoliciesPage.vue') },
  // ...
];
```

### 8.2 装配层聚合

```ts
// apps/web/src/router/index.ts
import { accessRoutes } from '@gocell/access';
import { auditRoutes } from '@gocell/audit';
import { configRoutes } from '@gocell/config';

const routes = [
  ...accessRoutes,
  ...auditRoutes,
  ...configRoutes,
];
```

不走 file-based 自动注册（避免隐式约定）；显式聚合便于审查路由总表。

---

## 9. 关键决策记录

### D-A · 为什么 pnpm workspace 而非 Nx
pnpm 自带 `workspace:*` 协议，无需额外工具；Nx 提供的 ESLint 边界规则用包名解析已经能替代。Vben Admin（Vue 圈最高 star）同选择。

### D-B · 为什么平铺 packages 而非 `packages/cells/<x>` 分组
Vue 圈头部项目（vuejs/core、Pinia、Nuxt、Vben）全部平铺。子目录分组（Vben 用过 `packages/effects/`）是 Vben 自创术语，主流不用。

### D-C · 为什么单 app 仍保留 `apps/web/` 层
未来要加 storybook、e2e、移动端壳都能进 `apps/`，避免后期重构。Vben 单 app 模板也走 `apps/` 层。

### D-D · 为什么 scope 用 `@gocell`
- 后端不发 npm 包，scope 无冲突
- 同 org 表达"GoCell 产品族"统一性
- Vue 圈惯例（@vben、@nuxt、@element-plus）

### D-E · 为什么 Pinia store 放在每个包内而非集中
集中 stores（如 Vben）破坏包自治。store 是业务实现细节，应随业务包走；跨包共享的全局 store（auth / theme / i18n）留在 `apps/web/src/stores/`。

### D-F · 为什么类型派生放 `@gocell/contracts` 而非 `apps/web/src/api/types/`
所有业务包都要引契约类型；若放 app，业务包反向依赖 app，违反方向。`@gocell/contracts` 作为根基础设施包，被所有业务包 import。

---

## 10. 与 PRD 的关系

| PRD 章节 | 本文档关系 |
|---|---|
| §0 D1（类型生成） | 类型派生目标改为 `packages/contracts/src/`（替换原 `src/api/types/`） |
| §3 技术栈 | 完全兼容，无修改 |
| §9 目录结构 | **被本方案完整替换** |
| §12 未决项 5（前端架构原则） | **本文档关闭** |

---

## 11. 落地清单

> 不在本 PRD 锁定的 MVP 范围内强制实施；建议在 Batch 0（基建）阶段一次性搭起骨架。

### Phase 1 · 骨架搭建（Batch 0 内）
- [ ] 根 `package.json` + `pnpm-workspace.yaml` + `tsconfig.base.json`
- [ ] `apps/web/` 空 app（main.ts + App.vue + router 空聚合）
- [ ] `packages/{core, shared, contracts, request}` 空骨架（仅 package.json + 空 index.ts）
- [ ] `packages/{access, audit, config, observability}` 空骨架
- [ ] catalog 钉死 Vue / Pinia / Vue Router / AntD Vue / Vite 版本

### Phase 2 · 基础设施迁移（Batch 0 后期）
- [ ] tokens.css / SCSS 移到 `packages/core/src/styles/`
- [ ] AppShell / Sidebar / TopBar / CommandPalette 移到 `packages/core/src/ui/`
- [ ] axios 封装移到 `packages/request/src/`
- [ ] `tools/codegen/` 输出到 `packages/contracts/src/`

### Phase 3 · 业务包按 Batch 填充
- Batch 1 → `@gocell/access`（first-run-setup + login）
- Batch 2 → `@gocell/access`（identities）
- Batch 3 → `@gocell/access`（policies + `<Can>`）
- Batch 4 → `@gocell/audit` + `@gocell/config`（flags）
- Batch 5 → 健康/Cells/Groups（落在 `@gocell/core` 或新包，待 Batch 5 启动时决）
- Batch 6 → Contracts / Deps（落在新包）
- Batch 7 → `@gocell/observability`

---

## 12. 参考资料

### 外部
- [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin) —— Vue 圈最高 star 的 pnpm workspace 实践
- [pnpm Workspace 文档](https://pnpm.io/workspaces)
- [pnpm Catalog 协议](https://pnpm.io/catalogs)

### 内部
- 后端 Cell/Slice/Contract 模型：`../gocell/CLAUDE.md` + `../gocell/.claude/rules/gocell/ai-collab.md`
- 后端 cell 示例：`../gocell/cells/accesscore/cell.yaml`
- 后端 slice 示例：`../gocell/cells/configcore/slices/configread/slice.yaml`
- PRD：`docs/prd/PRD.md`
