/**
 * @gocell/codegen — 契约类型单向派生器
 *
 * 从后端 `gocell/contracts/{http,shared}/**\/*.schema.json` 派生 TS 类型到
 * `packages/contracts/src/`，镜像源目录结构 + 全局去重 barrel。
 *
 * 这是 AI-robust「Hard」约束的执行体（ai-robust.md §载体决策原则 第 1 条）：
 * 单源 schema → 派生执行体，CI 跑 `git diff --exit-code packages/contracts/src/`
 * 校验业务包未手改生成物。确定性由「排序遍历 + 版本锁定的 json-schema-to-typescript」保证。
 */
import { readdirSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { compileFromFile } from 'json-schema-to-typescript'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, '../../..')
const CONTRACTS_DIR = resolve(
  process.env.GOCELL_CONTRACTS_DIR ?? join(REPO_ROOT, '../gocell/contracts'),
)
const OUT_DIR = join(REPO_ROOT, 'packages/contracts/src')

/** 派生的命名空间（镜像 contracts 下这些子树）。 */
const NAMESPACES = ['http', 'shared'] as const

function fileBanner(relSchemaPath: string): string {
  return [
    '/* eslint-disable */',
    '/**',
    ' * AUTO-GENERATED — DO NOT EDIT BY HAND.',
    ` * Source: gocell/contracts/${relSchemaPath}`,
    ' * 由 `pnpm codegen` 派生；CI 经 `git diff --exit-code` 守门只读。',
    ' */',
  ].join('\n')
}

/** 递归收集某目录下全部 *.schema.json，返回相对 CONTRACTS_DIR 的 POSIX 路径，已排序。 */
function collectSchemas(nsRoot: string): string[] {
  const out: string[] = []
  const walk = (abs: string): void => {
    for (const entry of readdirSync(abs, { withFileTypes: true })) {
      const child = join(abs, entry.name)
      if (entry.isDirectory()) walk(child)
      else if (entry.name.endsWith('.schema.json')) out.push(child)
    }
  }
  if (existsSync(nsRoot)) walk(nsRoot)
  return out.sort()
}

const toPosix = (p: string): string => p.split(sep).join('/')

/** 抽取生成文件中的全部导出类型名（用于 barrel 再导出）。 */
function extractExportedNames(source: string): string[] {
  const names: string[] = []
  const re = /export (?:interface|type) (\w+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) names.push(m[1]!)
  return names
}

async function main(): Promise<void> {
  if (!existsSync(CONTRACTS_DIR)) {
    throw new Error(
      `契约源目录不存在：${CONTRACTS_DIR}\n` +
        `请将后端仓库 ghbvf/gocell checkout 为本仓库同级目录，` +
        `或设置环境变量 GOCELL_CONTRACTS_DIR 指向 contracts 目录。`,
    )
  }

  // 全量重建：先清空 OUT_DIR，保证删除的 schema 在产物中同步消失（确定性 diff）。
  rmSync(OUT_DIR, { recursive: true, force: true })
  mkdirSync(OUT_DIR, { recursive: true })

  const schemaFiles = NAMESPACES.flatMap((ns) => collectSchemas(join(CONTRACTS_DIR, ns)))

  // name -> barrel 相对路径（首次出现胜出，去重跨文件内联的共享类型如 ExpectedVersion）。
  const exportToModule = new Map<string, string>()
  // 按 module 聚合再导出名，保持稳定顺序。
  const moduleExports = new Map<string, string[]>()

  for (const absSchema of schemaFiles) {
    const relSchema = toPosix(relative(CONTRACTS_DIR, absSchema))
    const relModule = relSchema.replace(/\.schema\.json$/, '')
    const outPath = join(OUT_DIR, `${relModule}.ts`)

    const compiled = await compileFromFile(absSchema, {
      cwd: dirname(absSchema),
      bannerComment: fileBanner(relSchema),
      declareExternallyReferenced: true,
      additionalProperties: false,
    })

    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, compiled)

    for (const name of extractExportedNames(compiled)) {
      if (exportToModule.has(name)) continue
      exportToModule.set(name, `./${relModule}`)
      const list = moduleExports.get(`./${relModule}`) ?? []
      list.push(name)
      moduleExports.set(`./${relModule}`, list)
    }
  }

  // barrel：按 module 路径排序，type-only 再导出（verbatimModuleSyntax 兼容）。
  const lines = [fileBanner('(barrel)'), '']
  for (const mod of [...moduleExports.keys()].sort()) {
    const names = moduleExports.get(mod)!.slice().sort()
    lines.push(`export type { ${names.join(', ')} } from '${mod}'`)
  }
  writeFileSync(join(OUT_DIR, 'index.ts'), lines.join('\n') + '\n')

  console.log(
    `codegen: 从 ${schemaFiles.length} 个 schema 派生 ${exportToModule.size} 个导出类型 → ${toPosix(relative(REPO_ROOT, OUT_DIR))}`,
  )
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
