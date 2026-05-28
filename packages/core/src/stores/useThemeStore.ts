import { defineStore } from 'pinia'
import { ref } from 'vue'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'gocell-theme'

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark'
}

/**
 * Read initial theme from the inline FOUC barrier script (which already wrote
 * dataset.theme before JS loaded) so we don't re-derive and cause a second
 * paint flip.
 */
function readInitialTheme(): Theme {
  // 1. Prefer whatever the FOUC barrier already applied to <html data-theme>
  const applied = document.documentElement.dataset['theme']
  if (isTheme(applied)) return applied

  // 2. localStorage fallback (should align with FOUC barrier logic)
  const stored = localStorage.getItem(STORAGE_KEY)
  if (isTheme(stored)) return stored

  // 3. matchMedia
  if (typeof window.matchMedia === 'function') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  }

  return 'light'
}

function applyTheme(t: Theme): void {
  document.documentElement.dataset['theme'] = t
  localStorage.setItem(STORAGE_KEY, t)
}

export const useThemeStore = defineStore('core.theme', () => {
  const theme = ref<Theme>(readInitialTheme())

  // Apply on init in case the store is created after the FOUC barrier
  // (the barrier already wrote it, so this is a no-op write of the same value)
  applyTheme(theme.value)

  // Register OS-level change listener only when user has NOT made an explicit
  // localStorage choice. Flag prevents duplicate registration across HMR.
  let _mediaListenerRegistered = false

  function _registerSystemListener(): void {
    if (_mediaListenerRegistered) return
    if (typeof window.matchMedia !== 'function') return
    _mediaListenerRegistered = true
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => {
      // Only follow system if user has no stored preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  function setTheme(t: Theme): void {
    theme.value = t
    applyTheme(t)
  }

  function toggleTheme(): void {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // Register listener after store is set up
  _registerSystemListener()

  return { theme, setTheme, toggleTheme }
})
