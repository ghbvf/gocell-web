import { test, expect, type Page } from '@playwright/test'

/**
 * Batch 7 health-overview + observe smoke tests.
 *
 * Covers:
 *   1. Health overview degraded: endpoints 404 → degraded banner visible, no blank/error page.
 *   2. Health overview OK: endpoints return minimal payload → summary section visible.
 *   3. Observe smoke: tablist renders; switching to Logs tab works.
 *   4. Protected redirect: unauthenticated '/' → redirected to /login.
 *
 * Backend is stubbed via page.route() (no real accesscore / observability backend needed).
 * Auth is established via the login flow (token is in-memory Pinia state — no localStorage).
 */

const STATUS_URL = '**/api/v1/access/setup/status'
const LOGIN_URL = '**/api/v1/access/sessions/login'
const HEALTH_CELLS_URL = '**/api/v1/admin/health/cells'
const SYSTEM_URL = '**/api/v1/admin/system'

async function stubSetupDone(page: Page): Promise<void> {
  await page.route(STATUS_URL, (route) => route.fulfill({ json: { data: { hasAdmin: true } } }))
}

/**
 * Establish an authenticated session by stubbing the login API and
 * submitting the login form, mirroring the pattern in auth.spec.ts.
 */
async function loginAs(page: Page, username = 'admin', password = 'SecretPass!23'): Promise<void> {
  await page.route(LOGIN_URL, (route) =>
    route.fulfill({
      status: 201,
      json: {
        data: {
          accessToken: 'tok-test',
          refreshToken: 'rt-test',
          expiresAt: '2099-01-01T00:00:00Z',
          sessionId: 's-test-1',
          userId: 'u-test-1',
          passwordResetRequired: false,
        },
      },
    }),
  )

  await page.goto('/login')
  await page.fill('#login-username', username)
  await page.fill('#login-password', password)
  await page.click('button[type="submit"]')
  // After successful login the router lands on '/' (AppShell mounted)
  await expect(page.locator('nav').first()).toBeVisible()
}

// ─── Health overview — degraded ───────────────────────────────────────────────

test.describe('Health overview — degraded (BR-001/002 endpoints absent)', () => {
  test('renders degraded banner when health endpoints return 404', async ({ page }) => {
    await stubSetupDone(page)

    // Stub both health endpoints as 404 → store transitions to unavailable
    await page.route(HEALTH_CELLS_URL, (route) => route.fulfill({ status: 404 }))
    await page.route(SYSTEM_URL, (route) => route.fulfill({ status: 404 }))

    await loginAs(page)

    // Navigate to home (already there after login, but be explicit)
    await page.goto('/')

    // Page must render (h1 visible) — not a blank/error screen
    await expect(page.locator('h1').first()).toBeVisible()

    // Degraded banner must appear
    await expect(page.locator('[data-testid="health-degraded"]')).toBeVisible()
  })
})

// ─── Health overview — OK ─────────────────────────────────────────────────────

test.describe('Health overview — OK (minimal payload)', () => {
  test('renders summary section when health endpoint returns one cell', async ({ page }) => {
    await stubSetupDone(page)

    // Minimal valid health/cells payload: one healthy cell
    await page.route(HEALTH_CELLS_URL, (route) =>
      route.fulfill({
        json: {
          data: {
            summary: {
              totalCells: 1,
              healthy: 1,
              degraded: 0,
              down: 0,
              lastCheckAt: new Date().toISOString(),
            },
            cells: [
              {
                name: 'accesscore',
                status: 'healthy',
                checkedAt: new Date().toISOString(),
                latencyMs: 12,
                message: null,
              },
            ],
          },
        },
      }),
    )

    await page.route(SYSTEM_URL, (route) =>
      route.fulfill({
        json: {
          data: {
            build: { version: '0.1.0', commit: 'abc123', buildTime: new Date().toISOString() },
            runtime: { goVersion: 'go1.22', os: 'linux', arch: 'amd64', numCPU: 4 },
            assembly: { cells: 1, groups: 0 },
            environment: { name: 'test' },
          },
        },
      }),
    )

    await loginAs(page)
    await page.goto('/')

    // h1 visible — page renders
    await expect(page.locator('h1').first()).toBeVisible()

    // Summary section heading is visible (the section rendered by isLoaded path)
    // The summary section is a <section> aria-labelledby landing-summary-heading
    await expect(page.locator('#landing-summary-heading')).toBeVisible()
  })
})

// ─── Observe smoke ────────────────────────────────────────────────────────────

test.describe('Observe view smoke', () => {
  test('tablist renders and switching to Logs tab works', async ({ page }) => {
    await stubSetupDone(page)

    // Observe view does not call health endpoints directly, but stub to be safe
    await page.route(HEALTH_CELLS_URL, (route) => route.fulfill({ status: 404 }))
    await page.route(SYSTEM_URL, (route) => route.fulfill({ status: 404 }))
    // Stub LGTM-related endpoints (Prometheus / Loki / Tempo — BR-003) as 404
    // so the panels degrade gracefully without blocking render.
    await page.route('**/api/v1/observability/**', (route) => route.fulfill({ status: 404 }))

    await loginAs(page)
    await page.goto('/observe')

    // h1 visible — page renders
    await expect(page.locator('h1').first()).toBeVisible()

    // Tab bar renders
    await expect(page.locator('[role="tablist"]')).toBeVisible()

    // Click the Logs tab (id: observe-tab-logs) and verify it becomes selected
    const logsTab = page.locator('[role="tab"]#observe-tab-logs')
    await expect(logsTab).toBeVisible()
    await logsTab.click()
    await expect(logsTab).toHaveAttribute('aria-selected', 'true')
  })
})

// ─── Protected redirect ───────────────────────────────────────────────────────

test.describe('Protected route redirect', () => {
  test('unauthenticated access to "/" redirects to /login', async ({ page }) => {
    await stubSetupDone(page)

    // No login — navigate directly to '/'
    await page.goto('/')

    // The auth guard must redirect to /login
    await expect(page).toHaveURL(/\/login(\?.*)?$/)
  })
})
