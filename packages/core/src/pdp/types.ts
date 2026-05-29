import type { ComputedRef, InjectionKey } from 'vue'

/**
 * PDP 客户端契约；实现在 @gocell/access。
 * @gocell/core 只持有 UI 壳 + 注入契约，不含业务逻辑。
 */
export interface PdpClient {
  /**
   * 响应式、fail-closed：仅当后端明确 allow 时为 true。
   * pending / error → false（绝不 fail-open）。
   */
  can(action: string, resource?: string): ComputedRef<boolean>
}

/**
 * Vue injection key for PdpClient.
 * 由 @gocell/access 在应用装配层 provide；
 * @gocell/core 的 useDecision / Can 通过此 key inject。
 */
export const PDP_INJECTION_KEY: InjectionKey<PdpClient> = Symbol('gocell.pdp')
