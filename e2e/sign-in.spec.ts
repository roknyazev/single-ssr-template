import { expect, test } from './fixtures'

test('wrong credentials show a translated inline form error, not a toast', async ({
  page,
}) => {
  await page.goto('/sign-in/password')
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.getByLabel('Password', { exact: true }).fill('definitely-wrong-1')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.locator('[data-slot="form-error"]')).toContainText(
    'Invalid email or password',
  )
  await expect(page.locator('[data-sonner-toast]')).toHaveCount(0)
})

test('transport failure surfaces the global toast, not an inline error', async ({
  page,
}) => {
  await page.goto('/sign-in/password')
  await page.route('**/api/auth/sign-in/email', route => route.abort())
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.getByLabel('Password', { exact: true }).fill('irrelevant-123')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.locator('[data-sonner-toast]')).toBeVisible()
  await expect(page.locator('[data-slot="form-error"]')).toBeHidden()
})

test('email field validates blur-first, then revalidates on change', async ({
  page,
}) => {
  await page.goto('/sign-in/password')
  const email = page.getByLabel('Email')
  await email.fill('not-an-email')
  await expect(page.getByText('Invalid email')).toBeHidden()
  await email.blur()
  await expect(page.getByText('Invalid email')).toBeVisible()
  const errorId = await email.getAttribute('aria-describedby')
  expect(errorId).toBeTruthy()
  await expect(page.locator(`#${errorId}`)).toHaveText('Invalid email')
  await email.fill('valid@example.com')
  await expect(page.getByText('Invalid email')).toBeHidden()
  await expect(email).not.toHaveAttribute('aria-describedby')
})

test('password visibility toggle exposes pressed state', async ({ page }) => {
  await page.goto('/sign-in/password')
  const toggle = page.getByRole('button', { name: 'Show password' })
  const password = page.getByLabel('Password', { exact: true })
  await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  await expect(password).toHaveAttribute('type', 'password')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect(password).toHaveAttribute('type', 'text')
})

test('requesting a sign-in code advances to the code step', async ({
  page,
}) => {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.waitForURL(/\/sign-in\/code/)
  await expect(
    page.getByText('Enter the 6-digit code we sent to nobody@example.com'),
  ).toBeVisible()
})
