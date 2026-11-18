import { test, expect, type Page } from '@playwright/test';

test.setTimeout(120000);
async function captureOverview(page: Page, path: string) {
  for (const panel of await page.locator('main .panel').all()) {
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toHaveCSS('opacity', '1');
  }
  const canvas = page.locator('canvas');
  if (await canvas.count()) await expect(canvas).toHaveAttribute('data-rendered', 'true');
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ ...viewport, height: await page.evaluate(() => document.documentElement.scrollHeight) });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))));
  await page.screenshot({ path, fullPage: true });
  await page.setViewportSize(viewport);
}

test('desktop analytics, journey controls, filters, export and themes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Product overview');
  await expect(page.locator('.hero')).toHaveCount(0);
  await expect(page.locator('.kpi-grid').getByRole('button', { name: 'New teams' })).toBeVisible();
  await page.locator('.journey-panel').scrollIntoViewIfNeeded();
  await expect(page.locator('canvas')).toBeVisible({ timeout: 30000 });
  await page.getByRole('button', { name: '2D', exact: true }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  const stage = page.locator('.journey-stages').getByRole('button', { name: /First conversation/ });
  await stage.focus();
  await expect(stage).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.journey-detail strong')).toHaveText('First conversation');
  await page.getByRole('button', { name: '3D', exact: true }).click();
  await expect(page.locator('canvas')).toBeVisible();
  const series = page.locator('.legend-controls').getByRole('button', { name: 'New teams', exact: true });
  await series.click();
  await expect(series).toHaveAttribute('aria-pressed', 'false');
  await series.click();
  await expect(series).toHaveAttribute('aria-pressed', 'true');
  await captureOverview(page, 'docs/dashboard-light.png');
  const before = await page.locator('.kpi-value').first().innerText();
  await page.getByLabel('Signup period', { exact: true }).selectOption('7');
  await expect(page.locator('.kpi-value').first()).not.toHaveText(before);
  await page.getByLabel('Subscription plan').selectOption('Enterprise');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByLabel('Signup period', { exact: true })).toHaveValue('30');
  await page.locator('.kpi-grid').getByRole('button', { name: 'New teams' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report' }).click();
  expect((await download).suggestedFilename()).toBe('prism-synthetic-30d.json');
  for (const name of ['Funnels', 'Cohorts', 'Experiments', 'AI Performance', 'Segments', 'Data Quality', 'Decisions']) {
    await page.getByRole('link', { name, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
    await expect(page.locator('[data-view]')).toHaveAttribute('data-view', name);
    await expect(page.locator('main .panel').first()).toBeVisible();
  }
  await page.getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.locator('.journey-panel')).toBeAttached();
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await captureOverview(page, 'docs/dashboard-dark.png');
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(page.getByRole('button', { name: 'Expand sidebar' })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('mobile navigation, reduced motion and no 3D download', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('.spatial-fallback')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await captureOverview(page, 'docs/dashboard-mobile.png');
  expect(requests.some(url => /spatial[-.]/i.test(url))).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('link', { name: 'Cohorts', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveAttribute('aria-expanded', 'false');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Cohorts', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cohorts');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#overview');
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('tablet and narrow mobile screens keep tables inside the layout', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [900, 360]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const name of ['Overview', 'Funnels', 'Cohorts', 'Experiments', 'AI Performance', 'Segments', 'Data Quality', 'Decisions']) {
      await page.goto(`/#${name.toLowerCase().replaceAll(' ', '-')}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name === 'Overview' ? 'Product overview' : name);
      await expect(page.locator('main .panel').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} at ${width}px`).toBe(true);
    }
  }
});



