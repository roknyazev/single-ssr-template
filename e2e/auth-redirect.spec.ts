import { expect, test } from './fixtures'

test('unauthenticated visitor is bounced to sign-in', async ({ page }) => {
  await page.goto('/')
  await page.waitForURL(/\/sign-in/)
  const url = new URL(page.url())
  expect(url.pathname).toBe('/sign-in')
  expect(url.searchParams.get('redirect')).toBe('/')
  await expect(page.getByLabel('Email')).toBeVisible()
})
