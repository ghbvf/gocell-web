# @gocell/devboard

> 开发者平台聚合视图：Cells / Groups / Coverage / Contracts / Deps

- **对应后端 cell**：无（聚合派生视图）
- **对外 exports**：`.` → `src/index.ts`（唯一收口；未列出路径外部不可访问）
- **依赖 contract**：（待 Batch 实施时补全）

## 边界

依赖规则见仓库根 `CLAUDE.md` §依赖规则。跨包仅经 `@gocell/contracts` 类型 + `@gocell/request` client，禁深路径 import。

**已批准设计性例外**：可消费 `@gocell/access` 暴露的 PDP client（`<Can>` 组件、`useDecision()` composable）——因 devboard 所有页面都依赖 PDP。其他业务包不享有此例外；`<Can>`/PDP client 唯一归属 `@gocell/access`，不在 `@gocell/core` 复刻。
