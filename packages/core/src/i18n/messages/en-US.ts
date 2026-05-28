/**
 * en-US — English messages (framework-level keys)
 *
 * Mirrors zh-CN schema exactly. All keys must be present.
 */
const enUS = {
  nav: {
    group: {
      meta: 'Meta',
      plan: 'Plan',
      build: 'Build',
      access: 'Access',
      operate: 'Operate',
    },
    coverage: 'Coverage',
    products: 'Products',
    backlog: 'Backlog',
    inbox: 'Inbox',
    board: 'Board',
    sprint: 'Sprint',
    workflows: 'Workflows',
    dag: 'Task DAG',
    aiStudio: 'AI Studio',
    sandboxes: 'Sandboxes',
    deps: 'Dependencies',
    contracts: 'Contracts',
    identities: 'Identities',
    policies: 'Policies',
    decisions: 'Decisions',
    reviews: 'Reviews',
    audit: 'Audit log',
    config: 'Configuration',
    flags: 'Feature flags',
    cells: 'Cells',
    groups: 'Smart Groups',
    observe: 'Observability',
    billing: 'Billing',
    secrets: 'Secrets vault',
    pill: {
      live: 'Live',
      preview: 'Preview',
      new: 'New',
      reserved: 'Reserved',
    },
  },
  shell: {
    brand: 'gocell',
    env: 'prod',
    search: {
      placeholder: 'Search…',
      shortcut: '⌘K',
      label: 'Open search',
    },
    collapse: {
      collapse: 'Collapse sidebar',
      expand: 'Expand sidebar',
    },
    theme: {
      toggle: 'Toggle theme',
      light: 'Light',
      dark: 'Dark',
    },
    locale: {
      toggle: 'Switch language',
      zh: 'Chinese',
      en: 'English',
    },
    breadcrumb: {
      root: 'gocell',
    },
    user: {
      guest: 'Not signed in',
      role: 'Admin',
    },
    commandPalette: {
      open: 'Open command palette',
    },
  },
  command: {
    placeholder: 'Type a command or search…',
    empty: 'No results',
    hint: 'Type to search',
  },
  errors: {
    unknown: 'An unknown error occurred. Please try again.',
    network: 'Network connection failed. Please check your connection.',
    ERR_AUTH_LOGIN_FAILED: 'Invalid username or password',
    ERR_AUTH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
    ERR_AUTH_UNAUTHORIZED: 'Unauthorized. Please check your account permissions.',
    ERR_AUTH_FORBIDDEN: 'You do not have permission to perform this action.',
    ERR_VERSION_CONFLICT: 'Data version conflict. Please refresh and try again.',
    ERR_VALIDATION: 'Invalid request parameters.',
    ERR_NOT_FOUND: 'Resource not found.',
    ERR_CONFLICT: 'Resource conflict.',
    ERR_INTERNAL: 'Internal server error. Please contact your administrator.',
    ERR_RATE_LIMIT: 'Too many requests. Please slow down.',
    ERR_TIMEOUT: 'Request timed out. Please try again.',
  },
} as const

export default enUS
