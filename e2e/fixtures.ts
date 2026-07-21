import { test as base, expect, type Page } from '@playwright/test'

export const test = base.extend<Record<string, unknown>>({
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page)
    page.goto = (async (
      url: Parameters<Page['goto']>[0],
      options?: Parameters<Page['goto']>[1],
    ) => {
      const response = await originalGoto(url, options)
      await page
        .waitForSelector("html[data-hydrated='true']", { timeout: 10000 })
        .catch(() => undefined)
      return response
    }) as Page['goto']
    await use(page)
  },
})

export { expect }
