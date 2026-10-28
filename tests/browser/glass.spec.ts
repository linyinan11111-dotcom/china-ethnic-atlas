import { test, expect } from '@playwright/test';

test('glass cover stays readable at high pixel density and narrow widths', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('/');
    await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
    const artwork = page.locator('.glass-artwork');
    await expect(artwork).toBeVisible();
    const hasWebGL = await artwork
      .locator('canvas')
      .evaluate((canvas: HTMLCanvasElement) => Boolean(canvas.getContext('webgl2')));
    await expect(artwork).toHaveAttribute('data-material', hasWebGL ? 'ready' : 'fallback');
    expect(
      await page
        .locator('.heading-description')
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(16);
    await page.getByRole('button', { name: '打开民族搜索' }).click();
    await page.getByLabel('全局民族搜索').fill('柯尔克孜');
    await page.locator('.search-result').click();
    await expect(page.locator('.cover-copy h1')).toHaveText('柯尔克孜族');
    for (const width of [1920, 1024, 390, 360]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
    await page.getByRole('button', { name: '民族发展', exact: true }).click();
    await expect(page.locator('#section-reform')).toBeFocused();
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
});

test('without WebGL the avatar, map, search and remounted cover remain usable', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === 'webgl2') return null;
      return Reflect.apply(getContext, this, [type, ...args]);
    } as typeof getContext;
  });
  await page.goto('/');
  await expect(page.locator('.glass-artwork')).toHaveAttribute('data-material', 'fallback');
  await expect(page.locator('.ethnic-photo-image')).toBeVisible();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await page.getByRole('button', { name: '数据说明', exact: true }).click();
  await expect(page.locator('.source-card')).toHaveCount(11);
  await page.locator('.brand').click();
  await expect(page.locator('.glass-artwork')).toHaveAttribute('data-material', 'fallback');
  await page.getByRole('button', { name: '打开民族搜索' }).click();
  await page.getByLabel('全局民族搜索').fill('白族');
  await page.locator('.search-result').click();
  await expect(page.locator('.cover-copy h1')).toHaveText('白族');
  expect(errors).toEqual([]);
});

test('reduced transparency uses solid surfaces and restores the material when changed', async ({
  page,
}) => {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }],
  });
  await page.goto('/');
  await expect(page.locator('.glass-artwork')).toHaveAttribute('data-material', 'fallback');
  await expect(page.locator('.site-header')).toHaveCSS('backdrop-filter', 'none');
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await session.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }],
  });
  await expect(page.locator('.site-header')).not.toHaveCSS('backdrop-filter', 'none');
  await session.detach();
});
