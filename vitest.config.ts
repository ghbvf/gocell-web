import { defineConfig } from 'vitest/config'

// Root-level vitest config: covers repo-root spec files (ESLint boundary self-check etc.)
export default defineConfig({
  test: {
    name: 'root',
    environment: 'node',
    // Explicitly include root-level spec files, bypassing default excludes
    include: ['*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
