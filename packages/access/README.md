# @gocell/access

> 镜像后端 cells/accesscore：auth store / PDP client(useDecision) / Identities / Policies

- **对应后端 cell**：cells/accesscore
- **对外 exports**：`.` → `src/index.ts`（唯一收口；未列出路径外部不可访问）
- **依赖 contract**：（待 Batch 实施时补全）

## 边界

依赖规则见仓库根 `CLAUDE.md` §依赖规则。跨包仅经 `@gocell/contracts` 类型 + `@gocell/request` client，禁深路径 import。
