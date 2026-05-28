import { test, expect } from '@playwright/test'

/**
 * 冒烟测试 — Batch 0 shell 骨架
 *
 * ① shell 渲染：'/' 加载后 sidebar（nav）+ topbar（header）存在
 * ② 主题切换：点击主题按钮后 html[data-theme] 在 light/dark 间切换
 *
 * 说明：
 * - '/' 路由有 requiresAuth: false（在 router/index.ts 显式设置），
 *   setup-status fail-open 保证首次加载不因 API 失败而重定向。
 *   登录/first-run 重定向冒烟留 Batch 1。
 */

test.describe('AppShell 骨架渲染', () => {
  test('sidebar nav 和 topbar header 存在', async ({ page }) => {
    await page.goto('/')

    // Sidebar renders a <nav> element
    const sidebar = page.locator('nav').first()
    await expect(sidebar).toBeVisible()

    // TopBar renders a <header> element
    const topbar = page.locator('header').first()
    await expect(topbar).toBeVisible()
  })

  test('页面标题或品牌文案可见（shell 正常挂载）', async ({ page }) => {
    await page.goto('/')
    // HomeView renders h1 with brand key
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })
})

test.describe('主题切换', () => {
  test('点击主题按钮后 html[data-theme] 变化', async ({ page }) => {
    await page.goto('/')

    // TopBar 主题切换按钮：用 data-testid 稳定定位（与 locale 无关，避免 aria-label i18n 文案耦合）
    const themeBtn = page.locator('[data-testid="theme-toggle"]')
    await expect(themeBtn).toBeVisible()

    // 读取当前主题
    const before = await page.locator('html').getAttribute('data-theme')

    await themeBtn.click()

    // 等待 data-theme 变化（点击后 nextTick 写入 html[data-theme]）
    await expect.poll(async () => page.locator('html').getAttribute('data-theme')).not.toBe(before)
    const after = await page.locator('html').getAttribute('data-theme')

    // 验证值域：只允许 light 或 dark
    expect(['light', 'dark']).toContain(after)
  })
})
