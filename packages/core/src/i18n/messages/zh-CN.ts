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
  access: {
    login: {
      title: '登录',
      subtitle: '使用管理员账号登录控制台',
      brand: 'gocell',
      username: { label: '用户名', placeholder: 'admin' },
      password: { label: '密码', placeholder: '请输入密码' },
      passwordShow: '显示密码',
      passwordHide: '隐藏密码',
      submit: '登录',
      submitPending: '登录中…',
      usernameRequired: '请输入用户名',
      passwordRequired: '请输入密码',
      sessionExpired: '会话已过期，请重新登录',
    },
    firstRun: {
      brand: 'gocell',
      brandTag: '首次运行',
      stepsNav: '设置步骤',
      stepCompleted: '已完成',
      backBtn: '返回',
      nextBtn: '继续',
      checking: '正在检查系统状态…',
      checkFailed: '无法连接到后端，请确认服务已启动后重试',
      steps: {
        preflight: {
          nav: '预检',
          eyebrow: '步骤 0 · 预检',
          title: '确认环境与端点就绪',
          deck: '发送凭据前，先确认部署清单中已设置操作员引导环境变量，且后端尚未完成初始化。',
        },
        planes: {
          nav: '两个平面',
          eyebrow: '步骤 1 · 设计',
          title: '两个身份平面 — 操作员与管理员',
          deck: 'setup/admin 由环境注入的操作员 Basic Auth 守护；你要创建的管理员与操作员无关。',
        },
        operator: {
          nav: '操作员凭据',
          eyebrow: '步骤 2 · 操作员',
          title: '操作员凭据（环境变量）',
          deck: '与部署清单中的 GOCELL_BOOTSTRAP_ADMIN_USERNAME / _PASSWORD 一致。它们鉴权本次以及未来每一次 setup/admin 调用。',
        },
        admin: {
          nav: '管理员身份',
          eyebrow: '步骤 3 · 管理员',
          title: '管理员身份（请求 body）',
          deck: '即将创建的用户。密码以 bcrypt cost=12 哈希后入库，明文不进日志。',
        },
        submit: {
          nav: '提交',
          eyebrow: '步骤 4 · 提交',
          title: '复核并发送 POST setup/admin',
          deck: '请求报文如实展示。提交成功后该端点将永久关闭。',
        },
        done: {
          nav: '完成',
          eyebrow: '步骤 5 · 完成',
          title: '管理员已创建 — 前往登录',
          deck: '引导窗口已永久关闭。使用新管理员凭据登录。',
        },
      },
      preflight: {
        needsSetupTitle: '系统尚未初始化',
        needsSetupBody: '未检测到管理员账号，可继续创建首位管理员。',
        envReminderTitle: '继续前请确认',
        envReminderItem1: '部署清单已设置 GOCELL_BOOTSTRAP_ADMIN_USERNAME',
        envReminderItem2: '部署清单已设置 GOCELL_BOOTSTRAP_ADMIN_PASSWORD',
      },
      planes: {
        operatorTitle: '操作员（环境变量）',
        operatorTag: '平面 A · 鉴权方',
        operatorDesc: '持久化 HTTP Basic Auth，校验「谁有权调用」setup/admin，从不写入用户表。',
        adminTitle: '管理员（请求 body）',
        adminTag: '平面 B · 主体',
        adminDesc: '真正被创建的用户。密码 bcrypt cost=12 哈希入库，经 sessions/login 登录。',
        whyTitle: '为何分两层？',
        whyBody:
          '操作员 Basic Auth 永久守护端点，避免首次运行窗口被任意访问者抢占管理员；你创建的管理员与操作员无关。',
      },
      operator: {
        cardTitle: '操作员（环境变量）',
        tag: 'Basic Auth',
        username: { label: '用户名', placeholder: 'ops', hint: 'GOCELL_BOOTSTRAP_ADMIN_USERNAME' },
        password: {
          label: '密码',
          placeholder: '≥ 8 字节，可打印 ASCII',
          hint: 'GOCELL_BOOTSTRAP_ADMIN_PASSWORD',
        },
        passwordShow: '显示密码',
        passwordHide: '隐藏密码',
        usernameRequired: '请输入操作员用户名',
        passwordRequired: '请输入操作员密码',
        passwordTooShort: '至少 8 字节（已去除首尾空白）',
        controlChar: '不能包含控制字符',
        trimNote: '首尾空白会被自动去除（兼容 K8s Secret 行尾换行）。',
      },
      admin: {
        cardTitle: '管理员用户（body）',
        tag: 'request body',
        username: {
          label: '用户名',
          placeholder: 'admin',
          required: '请输入用户名',
          format: '3–32 字符，字母 / 数字 / . _ -',
        },
        email: {
          label: '邮箱',
          // vue-i18n 把 `@` 当作 linked-message 前缀，邮箱示例须用字面插值转义
          placeholder: "admin{'@'}corp.example",
          required: '请输入邮箱',
          format: '请输入有效的邮箱地址',
        },
        password: {
          label: '密码',
          placeholder: '长口令，大小写 + 数字 + 符号',
          hint: '8–72 字节 · bcrypt cost=12',
          required: '请输入密码',
          tooShort: '需 8–72 字节（bcrypt 上限）',
          controlChar: '不能包含控制字符',
        },
        passwordShow: '显示密码',
        passwordHide: '隐藏密码',
        confirm: { label: '确认密码', required: '请再次输入密码', mismatch: '两次密码不一致' },
        strength: { label: '密码强度', weak: '弱', mid: '中', strong: '强' },
        checks: {
          len: '8–72 字节',
          ctrl: '无控制字符',
          case: '大小写混合',
          num: '含数字',
          sym: '含符号',
        },
        checkMet: '已满足',
        checkUnmet: '未满足',
      },
      submit: {
        reviewTitle: '复核请求',
        reviewTag: '明文密码不会被记录',
        wireMethod: 'POST',
        wireAuthorization: 'Authorization: Basic ••••••••',
        wireContentType: 'Content-Type: application/json',
        submitBtn: '提交 setup/admin',
        submitPending: '提交中…',
        successTransition: '管理员已创建，正在跳转…',
      },
      done: {
        badge: 'setup/admin · 201',
        body: '管理员已创建并写入用户表，引导端点已永久返回 410 Gone。',
        loginBtn: '前往登录',
      },
    },
    identities: {
      title: '身份',
      subtitle: '管理用户主体 — 创建、编辑、锁定与改密',
      tabs: {
        label: '主体类型',
        users: '用户',
        serviceAccounts: '服务账号',
        serviceAccountsHint: '服务账号经 API 管理，暂未开放',
      },
      filter: {
        label: '筛选',
        placeholder: '按用户名或邮箱搜索…',
      },
      table: {
        label: '用户列表',
        username: '用户名',
        email: '邮箱',
        status: '状态',
        createdAt: '创建时间',
        actions: '操作',
      },
      status: {
        active: '正常',
        locked: '已锁定',
      },
      loading: '正在加载用户…',
      empty: '暂无用户',
      loadMore: '加载更多',
      actions: {
        create: '新建用户',
        edit: '编辑',
        changePassword: '改密',
        lock: '锁定',
        unlock: '解锁',
        delete: '删除',
        // 行操作按钮的读屏后缀：拼在动作名后给出用户名上下文（如「编辑 alice」）
        rowSuffix: ' {username}',
      },
      form: {
        createTitle: '新建用户',
        editTitle: '编辑用户',
        username: {
          label: '用户名',
          placeholder: 'alice',
          required: '请输入用户名',
          format: '3–32 字符，字母 / 数字 / . _ -',
        },
        email: {
          label: '邮箱',
          // vue-i18n 把 `@` 当作 linked-message 前缀，邮箱示例须用字面插值转义
          placeholder: "alice{'@'}corp.example",
          required: '请输入邮箱',
          format: '请输入有效的邮箱地址',
        },
        password: {
          label: '初始密码',
          placeholder: '长口令，大小写 + 数字 + 符号',
          required: '请输入密码',
          tooShort: '需 8–72 字节（bcrypt 上限）',
          controlChar: '不能包含控制字符',
        },
        requirePasswordReset: '要求首次登录后修改密码',
        cancel: '取消',
        submit: '保存',
        submitting: '保存中…',
      },
      password: {
        title: '修改密码',
        old: { label: '当前密码' },
        new: { label: '新密码' },
        confirm: { label: '确认新密码' },
        oldRequired: '请输入当前密码',
        newRequired: '请输入新密码',
        newTooShort: '需 8–72 字节（bcrypt 上限）',
        newControlChar: '不能包含控制字符',
        confirmRequired: '请再次输入新密码',
        confirmMismatch: '两次密码不一致',
        cancel: '取消',
        submit: '修改密码',
        submitting: '提交中…',
      },
      confirm: {
        cancel: '取消',
        lock: {
          title: '锁定用户',
          message: '锁定后该用户将无法登录，可随时解锁。确认锁定？',
          confirm: '锁定',
        },
        unlock: {
          title: '解锁用户',
          message: '解锁后该用户可恢复登录。确认解锁？',
          confirm: '解锁',
        },
        delete: {
          title: '删除用户',
          message: '删除后该用户及其会话将被移除，且不可恢复。确认删除？',
          confirm: '删除',
        },
      },
    },
  },
  errors: {
    unknown: '发生未知错误，请稍后重试',
    network: '网络连接失败，请检查网络后重试',
    ERR_AUTH_LOGIN_FAILED: '用户名或密码错误',
    ERR_AUTH_BOOTSTRAP_FAILED: '操作员凭据验证失败',
    ERR_AUTH_REFRESH_FAILED: '会话已失效，请重新登录',
    ERR_AUTH_ADMIN_ALREADY_EXISTS: '该用户名已被占用，请更换后重试',
    ERR_SETUP_ALREADY_INITIALIZED: '系统已完成初始化，请前往登录',
    ERR_RATE_LIMITED: '操作过于频繁，请稍后再试',
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
    ERR_REQUEST_TOO_LARGE: '请求体过大，请减小后重试',
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
