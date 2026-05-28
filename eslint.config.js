/**
 * ESLint flat config — gocell-web
 * AI-robust Hard: 边界双锁 (T022)
 *
 * ── BLIND SPOTS (ai-robust §盲区自检，此规则不覆盖的形态) ──────────────────────
 * 1. 运行时动态 `import(someVar)` — AST 无法静态析出目标路径，import-x 不报告
 * 2. 字符串拼接路径 `require('./pkg/' + name)` — 同上，动态形态无法拦截
 * 3. `type-only import` (import type { … } from '…') — no-restricted-paths 和
 *    no-restricted-imports 默认也拦截 type-only；若需豁免须在消费侧加 eslint-disable
 * 4. monorepo 内 `workspace:*` 包在 tsconfig paths 解析的别名
 *    —— eslint-import-resolver-typescript 已接管路径解析，但若 tsconfig.json
 *    未正确引用 base，可能漏报深路径（本 config 通过 tsconfigRootDir 指向根解决）
 * 5. `packages/contracts/src/**` 被 ignore，其内部深路径不受 no-internal-modules 检查
 * 6. 跨包 `devDependencies` 的测试文件（*.spec.ts）中的 import 受同样规则约束，
 *    但 fixture 字符串路径在测试文件中是 lintText 模式，只检查 lint 报告
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 反向自检测试：eslint.config.spec.ts (vitest, ESLint Node API)
 * 合规代码 → 0 boundary error; 违规代码 fixture → 被对应 ruleId 报错
 */

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import pluginImportX from 'eslint-plugin-import-x'
import pluginA11y from 'eslint-plugin-vuejs-accessibility'
import configPrettier from 'eslint-config-prettier'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Absolute paths for zone rules ────────────────────────────────────────────
const pkg = (name) => path.resolve(__dirname, 'packages', name)
const apps = path.resolve(__dirname, 'apps')
const pkgsDir = path.resolve(__dirname, 'packages')
const toolsDir = path.resolve(__dirname, 'tools')

// Business cell package names (for no-restricted-imports cross-cell rules)
const BUSINESS_CELLS = ['access', 'audit', 'config', 'observability', 'devboard']

export default tseslint.config(
  // ── Global ignores ──────────────────────────────────────────────────────────
  {
    ignores: [
      'packages/contracts/src/**', // codegen-生成物，不 lint
      '**/dist/**',
      '**/coverage/**',
      'pnpm-lock.yaml',
      'worktrees/**',
      '.specify/**',
      'docs/design/**/*.jsx', // 设计稿 JSX 非源码
      '**/node_modules/**',
    ],
  },

  // ── Base JS recommended ─────────────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript recommended ──────────────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ── Vue flat/recommended (covers .vue files) ────────────────────────────────
  ...pluginVue.configs['flat/recommended'],

  // ── Global settings for all TS/Vue files ────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'import-x': pluginImportX,
      'vuejs-accessibility': pluginA11y,
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
          project: path.resolve(__dirname, 'tsconfig.base.json'),
        }),
      ],
    },
    rules: {
      // ── TypeScript ────────────────────────────────────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // ── Vue ───────────────────────────────────────────────────────────────
      'vue/multi-word-component-names': 'off', // barrel index files 豁免
      'vue/block-lang': [
        'error',
        {
          script: { lang: 'ts' },
        },
      ],
      'vue/component-api-style': ['error', ['script-setup']], // 强制 <script setup>
      'vue/define-macros-order': [
        'error',
        { order: ['defineProps', 'defineEmits', 'defineSlots'] },
      ],

      // ── Vue <script setup> 已知误报规则 ──────────────────────────────────
      // vue/no-dupe-keys: <script setup> 中 ref/reactive 变量在模板也可见，规则误
      // 报重复 key；此规则仅对 Options API 有意义，setup 模式关闭。
      // 豁免原因：误报率 100%（所有 <script setup> 文件），无实际拦截价值。
      'vue/no-dupe-keys': 'off',
      // vue/require-default-prop: TypeScript 定义的可选 prop（prop?: T）已明确表达
      // 可选性，无需额外 default value；此规则对 TS typed props 有 100% 误报率。
      'vue/require-default-prop': 'off',

      // ── a11y ──────────────────────────────────────────────────────────────
      ...pluginA11y.configs['flat/recommended'].rules,

      // ── import-x 基础 ─────────────────────────────────────────────────────
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 3 }],

      // ── 边界锁 2: 深路径禁止 (Hard) ───────────────────────────────────────
      // 禁止 @gocell/*/src/** 深路径，强制走 package.json#exports 入口
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@gocell/[^/]+/src/',
              message:
                '深路径 import 被禁止。请只用 package.json#exports 暴露的入口（如 @gocell/foo, @gocell/foo/composables）。',
            },
          ],
        },
      ],

      // ── no-direct-axios (Hard): 仅 packages/request 可 import axios ──────
      // 在 packages/request 外再配置覆盖规则
    },
  },

  // ── packages/request: 允许 import axios ────────────────────────────────────
  {
    files: ['packages/request/src/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  // ── packages/request 以外的所有包: 禁止直接 import axios ──────────────────
  {
    files: [
      'packages/core/src/**/*.{ts,vue}',
      'packages/shared/src/**/*.{ts,vue}',
      'packages/access/src/**/*.{ts,vue}',
      'packages/audit/src/**/*.{ts,vue}',
      'packages/config/src/**/*.{ts,vue}',
      'packages/observability/src/**/*.{ts,vue}',
      'packages/devboard/src/**/*.{ts,vue}',
      'apps/web/src/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@gocell/[^/]+/src/',
              message:
                '深路径 import 被禁止。请只用 package.json#exports 暴露的入口（如 @gocell/foo, @gocell/foo/composables）。',
            },
          ],
          paths: [
            {
              name: 'axios',
              message:
                'HTTP 单点：禁止在业务包直接 import axios。请通过 @gocell/request 暴露的 http 实例发请求。',
            },
          ],
        },
      ],
    },
  },

  // ── 边界锁 1: packages/contracts — 不得 import 任何 packages/* / apps/* ───
  {
    files: ['packages/contracts/src/**/*.ts'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: path.relative(__dirname, pkg('contracts')),
              from: pkgsDir,
              except: ['contracts'],
              message: '@gocell/contracts 是纯类型包，禁止 import 任何其他 @gocell/* 包。',
            },
            {
              target: path.relative(__dirname, pkg('contracts')),
              from: apps,
              message: '@gocell/contracts 是纯类型包，禁止 import apps/*。',
            },
          ],
        },
      ],
    },
  },

  // ── 边界锁 1: packages/shared — 不得 import 任何 @gocell/* ────────────────
  {
    files: ['packages/shared/src/**/*.ts'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: path.relative(__dirname, pkg('shared')),
              from: pkgsDir,
              except: ['shared'],
              message: '@gocell/shared 不允许依赖任何 @gocell/* 包（含 contracts/core）。',
            },
          ],
        },
      ],
    },
  },

  // ── 边界锁 1: packages/core — 不得 import 业务 cell ─────────────────────
  {
    files: ['packages/core/src/**/*.{ts,vue}'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: BUSINESS_CELLS.map((cell) => ({
            target: path.relative(__dirname, pkg('core')),
            from: pkg(cell),
            message: `@gocell/core 禁止 import 业务 cell @gocell/${cell}。`,
          })),
        },
      ],
    },
  },

  // ── 边界锁 1: packages/request — 只许 contracts/shared，禁业务 cell + core ─
  {
    files: ['packages/request/src/**/*.ts'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            ...BUSINESS_CELLS.map((cell) => ({
              target: path.relative(__dirname, pkg('request')),
              from: pkg(cell),
              message: `@gocell/request 禁止 import 业务 cell @gocell/${cell}。`,
            })),
            {
              target: path.relative(__dirname, pkg('request')),
              from: pkg('core'),
              message: '@gocell/request 禁止 import @gocell/core（只许 contracts/shared）。',
            },
          ],
        },
      ],
    },
  },

  // ── 边界锁 1: 业务 cells 之间禁止横向 import ─────────────────────────────
  // access / audit / config / observability: 禁止 import 其他业务 cell
  {
    files: [
      'packages/access/src/**/*.{ts,vue}',
      'packages/audit/src/**/*.{ts,vue}',
      'packages/config/src/**/*.{ts,vue}',
      'packages/observability/src/**/*.{ts,vue}',
    ],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: BUSINESS_CELLS.map((cell) => ({
            // 这些包禁止 import 其他任何业务 cell（自身例外由 from 匹配）
            target: path.relative(__dirname, pkgsDir),
            from: pkg(cell),
            message: `业务 cell 之间禁止横向 import（违反包边界规则）。跨域请走 @gocell/contracts + @gocell/request。`,
          })),
        },
      ],
    },
  },

  // ── 边界锁 1: devboard 可 import access（PDP 例外），禁其他业务 cell ──────
  {
    files: ['packages/devboard/src/**/*.{ts,vue}'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: BUSINESS_CELLS.filter((cell) => cell !== 'access' && cell !== 'devboard').map(
            (cell) => ({
              target: path.relative(__dirname, pkg('devboard')),
              from: pkg(cell),
              message: `@gocell/devboard 禁止 import @gocell/${cell}。设计性例外仅 @gocell/access（PDP client）。`,
            }),
          ),
        },
      ],
    },
  },

  // ── 边界锁 1: 所有 packages/* + tools/* 禁止 import apps/* ──────────────
  {
    files: ['packages/**/*.{ts,vue}', 'tools/**/*.ts'],
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: path.relative(__dirname, pkgsDir),
              from: apps,
              message: 'packages/* 禁止反向 import apps/*。',
            },
            {
              target: path.relative(__dirname, toolsDir),
              from: apps,
              message: 'tools/* 禁止反向 import apps/*。',
            },
          ],
        },
      ],
    },
  },

  // ── tools/codegen — 禁止 import 任何 @gocell/* ────────────────────────────
  {
    files: ['tools/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^@gocell/',
              message: 'tools/codegen 禁止 import @gocell/* 包。',
            },
          ],
        },
      ],
    },
  },

  // ── 测试文件: 豁免特定规则 ────────────────────────────────────────────────
  {
    files: ['**/*.spec.ts'],
    rules: {
      // vitest importOriginal<typeof import('...')>() 语法触发 consistent-type-imports。
      // 豁免原因：vitest mock 工厂泛型参数必须用 import() 类型表达式，无法改写为 import type。
      '@typescript-eslint/consistent-type-imports': 'off',
      // 测试文件需要定义多个内联 fixture 组件，one-component-per-file 100% 误报。
      'vue/one-component-per-file': 'off',
      // 测试 fixture 的 Options API 组件 components/setup 顺序不关键。
      'vue/order-in-components': 'off',
    },
  },

  // ── vite.config.ts + tsconfig.node.json 覆盖范围的配置文件 ────────────────
  // vite.config.ts 由 tsconfig.node.json 覆盖，不被 tsconfig.json 包含。
  // 关闭 type-aware 规则，避免 "no tsconfig includes this file" 解析错误。
  {
    files: ['**/vite.config.ts'],
    languageOptions: {
      parserOptions: {
        project: null, // 不使用 type-aware project
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ── tools/codegen vitest.config.ts ────────────────────────────────────────
  {
    files: ['tools/codegen/vitest.config.ts'],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, 'tools/codegen/tsconfig.json'),
      },
    },
  },

  // ── Prettier: 放最后关闭格式类规则，交给 prettier ─────────────────────────
  configPrettier,
)
