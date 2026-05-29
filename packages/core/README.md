# @gocell/core

> 对应后端 cell：无（设计系统 / 基础设施层，无业务逻辑）

## 对外 exports

- `.` → `src/index.ts` — 所有公开 Composable + Store 汇总
- `./composables` → `src/composables/index.ts` — Composable 子入口
- `./stores` → `src/stores/index.ts` — Pinia store 子入口（`useThemeStore`）
- `./styles/tokens.css` → `src/styles/tokens.css` — 设计 token（oklch，亮/暗双主题）
- `./styles/v1-linear.scss` → `src/styles/v1-linear.scss` — V1 Linear 风格全局 SCSS 层

## 提供给其他包的能力

| 导出 | 签名 | 用途 |
|---|---|---|
| `useThemeStore` | Pinia store `core.theme` | 主题状态单一来源；持有 `theme` ref + `setTheme`/`toggleTheme` actions |
| `useTheme` | `() => { theme, setTheme, toggleTheme }` | `useThemeStore` 的薄封装，对消费方屏蔽 store 实现细节 |
| `useThemeTokens` | `() => { themeConfig: ComputedRef<ThemeConfig> }` | 读 CSS 变量映射为 AntD seed token；随主题切换 algorithm |

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
