import type { Decision } from '@gocell/core'

/**
 * Mock-first PDP 决策源——替代尚未上线的后端 `POST /api/v1/access/decide`
 * （BR-004 §4.1，后端跟踪 gocell#1863）。
 *
 * 前端按 epic #62「mock-first」原则不等后端：本模块用确定性 RBAC grant 评估
 * (action, resource)，返回 BR-004 §3.2 `Decision` 的前端消费子集。后端端点交付后，
 * 把 createPdpClient 的默认 `decide` 换成对真实端点的调用（响应映射回 `Decision`）即可，
 * 本模块整体删除——其余 PDP 链路（缓存 / TTL / 守卫 / <Can>）不变。
 */

/** PDP 决策入参。对标 BR-004 §3.1 请求的 MVP 子集（仅 action + 可选 resource）。 */
export interface DecisionRequest {
  action: string
  // 显式允许 undefined：can()/decide() 的 resource 可省略，透传到此处（exactOptionalPropertyTypes）。
  resource?: string | undefined
}

/**
 * 决策函数签名。注入到 createPdpClient，是「mock ↔ 真实后端」的唯一替换缝。
 */
export type DecideFn = (req: DecisionRequest) => Promise<Decision>

/**
 * 授权 grant：`"<action>:<resource>"` 规则集合，`*` 为通配。
 * 形如 `"*:*"`（全放行）/ `"read:*"`（只读全资源）/ `"write:config"`（精确）。
 * 命中任一规则即 allow。
 */
export type Grant = readonly string[]

/**
 * MVP 默认主体 = first-run 创建的唯一 admin → 全量授权。
 * 单管理员部署下管理员本就该看到一切，故默认 grant-all 是诚实建模而非"假放行"；
 * deny 分支由受限 grant（如 VIEWER_GRANT）在测试 / 演示中真实触发。
 */
export const ADMIN_GRANT: Grant = ['*:*']

/** 只读演示 grant：仅 read 全资源；写操作 → deny（驱动 <Can> 隐藏写按钮）。 */
export const VIEWER_GRANT: Grant = ['read:*']

/** 单条 grant 规则是否命中 (action, resource)。非法规则（无 `:`）→ 不匹配（fail-closed）。 */
function ruleMatches(rule: string, action: string, resource: string): boolean {
  const sep = rule.indexOf(':')
  if (sep < 0) return false
  const ruleAction = rule.slice(0, sep)
  const ruleResource = rule.slice(sep + 1)
  const actionOk = ruleAction === '*' || ruleAction === action
  const resourceOk = ruleResource === '*' || ruleResource === resource
  return actionOk && resourceOk
}

/**
 * 用 grant 评估 (action, resource) → 结构化 Decision。
 * 命中 → allow；未命中 → deny（reasonCode `role-missing`，对应 i18n 拒绝文案）。
 */
export function evaluateGrant(grant: Grant, req: DecisionRequest): Decision {
  const resource = req.resource ?? ''
  const allowed = grant.some((rule) => ruleMatches(rule, req.action, resource))
  return allowed
    ? { effect: 'allow', reasonCode: '' }
    : { effect: 'deny', reasonCode: 'role-missing' }
}

/**
 * 创建 mock 决策函数。默认 ADMIN_GRANT（MVP 单管理员 → 全量放行，全站路由可达）。
 * 测试 / 演示传入受限 grant 即可驱动真实 deny 路径。
 */
export function createMockDecide(grant: Grant = ADMIN_GRANT): DecideFn {
  return (req) => Promise.resolve(evaluateGrant(grant, req))
}
