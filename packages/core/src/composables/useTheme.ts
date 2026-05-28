import { readonly, ref } from 'vue'
import type { Ref } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'gocell-theme'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

function resolveInitialTheme(): Theme {
  // Priority 1: localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isTheme(stored)) return stored

  // Priority 2: matchMedia
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }

  // Priority 3: default light
  return 'light'
}

function applyTheme(t: Theme): void {
  document.documentElement.dataset['theme'] = t
  localStorage.setItem(STORAGE_KEY, t)
}

// Module-level singleton — no FOUC: resolveInitialTheme runs at import time
const _theme: Ref<Theme> = ref(resolveInitialTheme())
applyTheme(_theme.value)

export function useTheme(): {
  theme: Readonly<Ref<Theme>>
  setTheme: (t: Theme) => void
  toggleTheme: () => void
} {
  function setTheme(t: Theme): void {
    _theme.value = t
    applyTheme(t)
  }

  function toggleTheme(): void {
    setTheme(_theme.value === 'light' ? 'dark' : 'light')
  }

  return {
    theme: readonly(_theme),
    setTheme,
    toggleTheme,
  }
}
