# @gocell/core

> 对应后端 cell：无（设计系统 / 基础设施层，无业务逻辑）

## 对外 exports

- `.` → `src/index.ts` — 所有公开 Composable + Store + PDP 契约汇总
- `./composables` → `src/composables/index.ts` — Composable 子入口
- `./stores` → `src/stores/index.ts` — Pinia store 子入口（`useThemeStore`）
- `./components` → `src/components/index.ts` — UI 组件子入口（`Can`）
- `./styles/tokens.css` → `src/styles/tokens.css` — 设计 token（oklch，亮/暗双主题）
- `./styles/v1-linear.scss` → `src/styles/v1-linear.scss` — V1 Linear 风格全局 SCSS 层

## 提供给其他包的能力

| 导出 | 签名 | 用途 |
|---|---|---|
| `useThemeStore` | Pinia store `core.theme` | 主题状态单一来源；持有 `theme` ref + `setTheme`/`toggleTheme` actions |
| `useTheme` | `() => { theme, setTheme, toggleTheme }` | `useThemeStore` 的薄封装，对消费方屏蔽 store 实现细节 |
| `useThemeTokens` | `() => { themeConfig: ComputedRef<ThemeConfig> }` | 读 CSS 变量映射为 AntD seed token；随主题切换 algorithm |
| `PDP_INJECTION_KEY` | `InjectionKey<PdpClient>` | Vue inject key；`@gocell/access` 在 app root provide 实现，`<Can>` / `useDecision` inject |
| `PdpClient` | interface（类型） | PDP client 契约；实现在 `@gocell/access`，core 只持有接口 |
| `useDecision` | `(action, resource?) => ComputedRef<boolean>` | 响应式权限判断；fail-closed（无 provider / pending / error → false） |
| `Can` | Vue SFC 组件 | 授权 UI 壳；`mode='hide'`（默认）或 `mode='disable'`；scoped slot 传 `{ allowed }` |

### PDP 注入契约（供 `@gocell/access` 实现）

```ts
import { PDP_INJECTION_KEY, type PdpClient } from '@gocell/core'

// 在 @gocell/access 的装配入口：
app.provide(PDP_INJECTION_KEY, pdpClientImpl)
```

### `<Can>` 用法示例

```vue
<!-- mode=hide（默认）：无权限时隐藏 -->
<Can action="cell.read" resource="cell:123">
  <template #default="{ allowed }">
    <button :disabled="!allowed">查看</button>
  </template>
  <template #denied>
    <span>无权限</span>
  </template>
</Can>

<!-- mode=disable：无权限时灰化 + inert -->
<Can action="cell.delete" mode="disable">
  <DeleteButton />
</Can>
```

## 依赖的 contract

无（@gocell/core 不依赖 @gocell/contracts）

## 边界

- 只依赖 `@gocell/shared`（如需）、Vue、Pinia、ant-design-vue
- 不依赖任何业务 cell（`access` / `audit` / `config` / `observability` / `devboard`）
- 跨包仅经 `@gocell/contracts` 类型 + `@gocell/request` client，禁深路径 import

## 测试

```
pnpm -F @gocell/core test --run
pnpm -F @gocell/core test:coverage
```

覆盖率门槛：≥ 90%（core 包要求）

## 维护者

ghbvf（项目负责人）
