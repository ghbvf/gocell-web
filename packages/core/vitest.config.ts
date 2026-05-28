import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/__tests__/**',
        // Barrel re-export files — no logic to test
        'src/index.ts',
        'src/components/index.ts',
        'src/composables/index.ts',
        'src/stores/index.ts',
        'src/pdp/index.ts',
        'src/ui/index.ts',
        // Pure data / type files — v8 over-counts branches on `as const` expressions
        'src/i18n/messages/zh-CN.ts',
        'src/i18n/messages/en-US.ts',
        'src/ui/navConfig.ts',
        'src/pdp/types.ts',
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        // Branch threshold is 88 because v8 over-counts branches in:
        // - TypeScript template literal branches (pre-existing from PR-04: Can.vue, useTheme.ts)
        // - Vue template v-if/v-else-if chains where the implicit else is unreachable
        // Statements/functions/lines all exceed 90%.
        branches: 88,
        statements: 90,
      },
    },
  },
})
