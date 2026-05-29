# @gocell/devboard

> 开发者平台聚合视图：Cells / Groups / Coverage / Contracts / Deps

- **对应后端 cell**：无（聚合派生视图）
- **对外 exports**：`.` → `src/index.ts`（唯一收口；未列出路径外部不可访问）
- **依赖 contract**：（待 Batch 实施时补全）

## 边界

依赖规则见仓库根 `CLAUDE.md` §依赖规则。跨包仅经 `@gocell/contracts` 类型 + `@gocell/request` client，禁深路径 import。

**已批准设计性例外**：可依赖 `@gocell/access`（消费其 PDP client 能力）——因 devboard 所有页面都依赖 PDP；其他业务包不享有此例外。

**`<Can>` / PDP 归属**（PRD §9/§211）：`<Can>` 组件 + `useDecision()` 注入点唯一归属 `@gocell/core`（UI 壳，全包可消费）；PDP client 实现（`createPdpClient`）归属 `@gocell/access`，由 `apps/web` 装配层注入。devboard 经 `@gocell/core` 的 `<Can>`/`useDecision` 消费 PDP，与其他消费方一致。
