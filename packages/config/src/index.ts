// config domain public API
export { useConfigStore } from './stores'
export type { ConfigEntry } from './api/config'

// flags domain public API
export { useFlagsStore } from './stores'
export { useFlag } from './composables/useFlag'
export { FLAG_KEYS, type FlagKey } from './flags/registry'
export type { FeatureFlag } from './api/flags'
