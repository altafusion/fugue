import { expect, test } from '@playwright/test'

async function expectSocialMeta(
  page: import('@playwright/test').Page,
  expected: {
    ogTitle: string
    ogDescription: string
    twitterCard: string
  },
) {
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', expected.ogTitle)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', expected.ogDescription)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/favicon\.svg$/)
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', expected.twitterCard)
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', expected.ogTitle)
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /\/favicon\.svg$/)
}

test.describe('fugue-content-site social meta', () => {
  test('home uses content frontmatter for OG on /', async ({ page }) => {
    await page.goto('http://localhost:8001/')
    await expectSocialMeta(page, {
      ogTitle: 'Fugue Content',
      ogDescription: 'Starter landing page powered by @altafusion/fugue-content',
      twitterCard: 'summary_large_image',
    })
  })

  test('about uses page frontmatter for OG', async ({ page }) => {
    await page.goto('http://localhost:8001/about')
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /About/)
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
  })

  test('spanish about keeps locale-prefixed og:url', async ({ page }) => {
    await page.goto('http://localhost:8001/es/about')
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/es\/about$/)
  })
})
