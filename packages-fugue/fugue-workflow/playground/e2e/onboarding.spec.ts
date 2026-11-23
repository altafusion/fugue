import { expect, test } from '@playwright/test'

async function continueWizard(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Continue' }).click()
}

test.describe('onboarding playground', () => {
  test('happy path: viewer through confirm', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page.getByRole('heading', { name: 'Choose Your Role' })).toBeVisible({
      timeout: 60_000,
    })

    await page.getByText('Viewer', { exact: true }).click()
    await continueWizard(page)

    await expect(page.getByRole('heading', { name: 'Layout Preference' })).toBeVisible()
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Guided' }).click()
    await continueWizard(page)

    await expect(page.getByRole('heading', { name: 'Pin Areas & Home Label' })).toBeVisible()
    await page.getByRole('textbox').fill('My Home')
    await continueWizard(page)

    await expect(page.getByRole('heading', { name: 'Review & Submit' })).toBeVisible()
    await page.getByRole('button', { name: 'Complete Onboarding' }).click()

    await expect(page.getByRole('heading', { name: 'Onboarding Complete' })).toBeVisible({
      timeout: 30_000,
    })
  })

  test('branch: INVALID-RECOVER returns to resources', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page.getByRole('heading', { name: 'Choose Your Role' })).toBeVisible({
      timeout: 60_000,
    })

    await page.getByText('Viewer', { exact: true }).click()
    await continueWizard(page)

    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: 'Guided' }).click()
    await continueWizard(page)

    await page.getByRole('textbox').fill('INVALID-RECOVER')
    await continueWizard(page)

    await page.getByRole('button', { name: 'Complete Onboarding' }).click()

    await expect(page.getByRole('heading', { name: 'Pin Areas & Home Label' })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText(/cannot be submitted/i)).toBeVisible()
  })
})
