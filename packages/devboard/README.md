# @gocell/devboard

> 开发者平台聚合视图：Cells / Groups / Coverage / Contracts / Deps（Batch 5/6）
>
> **对应后端 cell**：无（聚合派生视图）。Cells 数据由构建期从后端 `../gocell/cells/*/cell.yaml` + `slices/*/slice.yaml` 派生（见下）。

## 对外 exports

- `.` → `src/index.ts`：manifest 类型、`CELL_MANIFEST`、`useCellsStore`、共享组件（`CellDurabilityBadge` / `UnavailablePanel`）
- `./views/cells-list` → `CellsListView.vue`（`/cells` 列表页，T503）
- `./views/cell-detail` → `CellDetailView.vue`（`/cells/:id` 12-tab 详情，T504）

未列出的路径外部不可访问（`package.json#exports` 唯一收口）。

## Cell manifest 派生（T502，AI-robust Hard）

`tools/cell-manifest/` 镜像 `tools/codegen` 模式：构建期读后端 `cell.yaml` + `slice.yaml` → 派生 `src/manifest/cells.generated.ts`（`/* eslint-disable */` + DO-NOT-EDIT banner，prettier-ignored）。

- 单源派生 + CI `git diff --exit-code`（`.github/workflows/cell-manifest-diff.yml`）守门，业务包手改生成物即红 → 违反不可表达（Hard）。
- 本地重跑：`GOCELL_CELLS_DIR=../gocell/cells pnpm cell-manifest`（CI 把 `ghbvf/gocell` checkout 为同级目录，默认路径生效）。
- `slice.yaml` 的 `contractUsages[].role`：`serve`/`publish` → cell **produces**；`call`/`subscribe` → **consumes**；跨 cell 的 consume→produce 解析出 `dependsOnCells` / `requiredByCells`。
- **不可派生字段**（运行时 QPS/p95/健康分、tasks、SLOC、version、oncall）→ 显式降级为 "—" / `UnavailablePanel`，**绝不伪造**。需后端健康端点（BR-001）才补。

## 依赖的 contract

- `http.audit.list.v1`（`HttpAuditListV1Response`）→ Cell detail · Audit tab（经 `@gocell/request` 直调 `/api/v1/audit/`，**不** import `@gocell/audit`）
- `http.config.list.v1`（`HttpConfigListV1Response`）→ Cell detail · Configuration tab（直调 `/api/v1/config/`，**不** import `@gocell/config`）

## 边界

依赖规则见仓库根 `CLAUDE.md` §依赖规则 / `.claude/rules/gocellweb/package-boundaries.md`。跨包仅经 `@gocell/contracts` 类型 + `@gocell/request` client，禁深路径 import。

**已批准设计性例外**：可依赖 `@gocell/access`（消费其 PDP client 能力）——因 devboard 所有页面都依赖 PDP；其他业务包不享有此例外。**禁**直接 import `@gocell/audit` / `@gocell/config`（Audit/Config tab 经 `@gocell/request` + `@gocell/contracts` 复用同一后端端点，T505 边界洁净方案）。

**`<Can>` / PDP 归属**（PRD §9/§211）：`<Can>` 组件 + `useDecision()` 注入点唯一归属 `@gocell/core`；PDP client 实现（`createPdpClient`）归属 `@gocell/access`，由 `apps/web` 装配层注入。Cells 页为只读，页面级 PDP 门由路由守卫（`requiredAction: 'read'`, `requiredResource: 'cell'`，fail-closed）执行。

## 测试

`pnpm -F @gocell/devboard test --run`（manifest 派生器：`pnpm -F @gocell/cell-manifest test --run`）
