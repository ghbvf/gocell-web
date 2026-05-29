/**
 * zh-CN — 简体中文消息表（框架级 key）
 *
 * 命名空间规则：
 *   nav.*       导航项（group label + item label）
 *   shell.*     面包屑 / 搜索 / 主题 / 折叠 / 用户卡
 *   command.*   命令面板占位
 *   errors.*    错误码对照表（key = errors.<CODE>，对应后端 error.code）
 *
 * 业务页面文案逐 batch 补充，本文件只含框架层 key。
 */
const zhCN = {
  nav: {
    group: {
      meta: 'Meta',
      plan: 'Plan',
      build: 'Build',
      access: 'Access',
      operate: 'Operate',
      reserved: '预留',
    },
    coverage: '覆盖率',
    products: '产品',
    backlog: '待办',
    inbox: '收件箱',
    board: '看板',
    sprint: '迭代',
    workflows: '工作流',
    workflow: '工作流',
    dag: '任务 DAG',
    ai: 'AI',
    aiStudio: 'AI Studio',
    sandboxes: '沙箱',
    deps: '依赖',
    contracts: '契约',
    identities: '身份',
    policies: '策略',
    decisions: '决策',
    reviews: '审查',
    audit: '审计日志',
    config: '配置',
    flags: '功能开关',
    cells: 'Cells',
    groups: '智能分组',
    observe: '可观测',
    billing: '计费',
    secrets: '密钥库',
    pill: {
      live: '上线',
      preview: '预览',
      new: '新',
      reserved: '预留',
    },
  },
  shell: {
    brand: 'gocell',
    env: 'prod',
    search: {
      placeholder: '搜索…',
      shortcut: '⌘K',
      label: '打开搜索',
    },
    collapse: {
      collapse: '收起侧边栏',
      expand: '展开侧边栏',
    },
    theme: {
      toggle: '切换主题',
      light: '亮色',
      dark: '暗色',
    },
    locale: {
      toggle: '切换语言',
      zh: '中文',
      en: 'English',
    },
    breadcrumb: {
      root: 'gocell',
    },
    user: {
      guest: '未登录',
      role: '管理员',
    },
    commandPalette: {
      open: '打开命令面板',
      close: '关闭命令面板',
      title: '命令面板',
      escKey: 'Esc',
    },
    sidebar: {
      label: '侧边栏',
    },
    nav: {
      label: '主导航',
    },
    ai: {
      label: 'AI 助手',
      expand: '展开 AI 助手',
      collapse: '收起 AI 助手',
      name: 'AI',
      studioPlaceholder: 'AI Studio · 即将推出',
    },
    skipToContent: '跳到主内容',
  },
  command: {
    searchLabel: '搜索命令',
    placeholder: '输入命令或搜索…',
    empty: '无结果',
    hint: '输入以搜索',
    resultsLabel: '搜索结果',
  },
  errors: {
    unknown: '发生未知错误，请稍后重试',
    network: '网络连接失败，请检查网络后重试',
    ERR_AUTH_LOGIN_FAILED: '用户名或密码错误',
    ERR_AUTH_TOKEN_EXPIRED: '登录已过期，请重新登录',
    ERR_AUTH_UNAUTHORIZED: '无权访问，请检查账号权限',
    ERR_AUTH_FORBIDDEN: '权限不足',
    ERR_VERSION_CONFLICT: '数据版本冲突，请刷新后重试',
    ERR_VALIDATION: '请求参数不合法',
    ERR_NOT_FOUND: '资源不存在',
    ERR_CONFLICT: '资源冲突',
    ERR_INTERNAL: '服务器内部错误，请联系管理员',
    ERR_RATE_LIMIT: '请求过于频繁，请稍后重试',
    ERR_TIMEOUT: '请求超时，请稍后重试',
  },
} as const

export default zhCN

/**
 * Recursively map all leaf string-literal types to `string`.
 * This gives en-US a structural schema to `satisfies` against — enforcing
 * that all keys exist without requiring identical string values.
 */
type Widen<T> = T extends string
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: Widen<T[K]> }
    : T

export type MessageSchema = Widen<typeof zhCN>
