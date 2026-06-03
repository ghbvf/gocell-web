import { test, expect, type Page } from '@playwright/test'
import { stubHealthEndpoints } from './helpers'

/**
 * Batch 1 认证入口冒烟 — login 重定向 + first-run 全流程。
 *
 * 后端用 page.route 拦截（不依赖真实 accesscore）：仅验证前端的守卫重定向、
 * 表单提交、向导步进与最终落点等关键路径，不做页面级 E2E。
 */

const STATUS_URL = '**/api/v1/access/setup/status'
const ADMIN_URL = '**/api/v1/access/setup/admin'
const LOGIN_URL = '**/api/v1/access/sessions/login'

async function stubSetupStatus(page: Page, hasAdmin: boolean): Promise<void> {
  await page.route(STATUS_URL, (route) => route.fulfill({ json: { data: { hasAdmin } } }))
}

test.describe('Login', () => {
  test('/login 直接渲染独立登录页（不套 AppShell）', async ({ page }) => {
    // 受保护路由→/login 的重定向冒烟见 e2e/health.spec.ts（Batch 7 起 home 为
    // requiresAuth:true）；此处直接验证 /login 独立渲染、不套 AppShell。
    await stubSetupStatus(page, true) // setup done → first-run gate passes
    await page.goto('/login')
    await expect(page.locator('#login-username')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    // standalone layout: no AppShell sidebar nav
    await expect(page.locator('.wizard')).toHaveCount(0)
  })

  test('登录成功后跳转回受保护页并挂载 AppShell', async ({ page }) => {
    await stubSetupStatus(page, true)
    // '/' mounts LandingView (Batch 7), which polls health/system on mount —
    // stub them so the poll never reaches the proxy and bounces to /login.
    await stubHealthEndpoints(page)
    await page.route(LOGIN_URL, (route) =>
      route.fulfill({
        status: 201,
        json: {
          data: {
            accessToken: 'a',
            refreshToken: 'r',
            expiresAt: '2099-01-01T00:00:00Z',
            sessionId: 's1',
            userId: 'u1',
            passwordResetRequired: false,
          },
        },
      }),
    )

    await page.goto('/login')
    await page.fill('#login-username', 'admin')
    await page.fill('#login-password', 'SecretPass!23')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/$/)
    // AppShell mounted → sidebar nav present
    await expect(page.locator('nav').first()).toBeVisible()
  })
})

test.describe('First-run', () => {
  test('未初始化访问 / 被重定向到 first-run 向导', async ({ page }) => {
    await stubSetupStatus(page, false)
    await page.goto('/')
    await expect(page).toHaveURL(/\/first-run-setup$/)
    await expect(page.locator('.wizard')).toBeVisible()
  })

  test('走完向导创建 admin 后跳转 /login', async ({ page }) => {
    await stubSetupStatus(page, false)
    await page.route(ADMIN_URL, (route) =>
      route.fulfill({
        status: 201,
        json: {
          data: { id: 'u1', username: 'admin', email: 'admin@corp.example', createdAt: 'x' },
        },
      }),
    )

    await page.goto('/first-run-setup')
    await expect(page.locator('.wizard')).toBeVisible()

    await page.click('.wizard__next') // preflight → planes
    await page.click('.wizard__next') // planes → operator
    await page.fill('#op-username', 'ops')
    await page.fill('#op-password', 'rootpass1')
    await page.click('.wizard__next') // operator → admin
    await page.fill('#admin-username', 'admin')
    await page.fill('#admin-email', 'admin@corp.example')
    await page.fill('#admin-password', 'SecretPass!23')
    await page.fill('#admin-confirm', 'SecretPass!23')
    await page.click('.wizard__next') // admin → submit
    await page.click('.wizard__submit')

    await expect(page.locator('.wizard__login')).toBeVisible()
    // Admin now provisioned → backend would report hasAdmin=true; re-stub so the
    // first-run guard lets /login through instead of bouncing back to the wizard.
    await stubSetupStatus(page, true)
    await page.click('.wizard__login')
    await expect(page).toHaveURL(/\/login$/)
  })
})
