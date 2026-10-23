import { test, expect } from '@playwright/test';

test('one ethnic page contains every module and navigation preserves map selection', async ({
  page,
}) => {
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('白族'));
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await expect(page.locator('.ethnic-page-section')).toHaveCount(5);
  await expect(page.locator('.unified-section-title h2')).toHaveText([
    '白族 · 民族分布',
    '白族 · 民族介绍',
    '白族 · 分布分析',
    '白族 · 地区经济',
    '白族 · 民族发展',
  ]);
  await page
    .locator('.analysis-table tbody tr')
    .filter({ has: page.getByRole('cell', { name: '贵州', exact: true }) })
    .getByRole('button', { name: '地图查看' })
    .click();
  await expect(page.locator('.region-detail h2')).toHaveText('贵州');
  const map = await page.locator('.map-canvas').elementHandle();
  for (const label of ['民族介绍', '分布分析', '地区经济', '民族发展', '民族分布']) {
    await page
      .getByRole('navigation', { name: '民族专题页内导航' })
      .getByRole('button', { name: label, exact: true })
      .click();
    await expect
      .poll(() =>
        page
          .locator(`section[aria-label="${label}"]`)
          .evaluate((e) => e.getBoundingClientRect().top),
      )
      .toBeGreaterThanOrEqual(0);
    await expect
      .poll(() =>
        page
          .locator(`section[aria-label="${label}"]`)
          .evaluate((e) => e.getBoundingClientRect().top),
      )
      .toBeLessThan(130);
    await expect(
      page
        .getByRole('navigation', { name: '民族专题页内导航' })
        .getByRole('button', { name: label, exact: true }),
    ).toHaveAttribute('aria-current', 'location');
    expect(await map!.evaluate((e) => e === document.querySelector('.map-canvas'))).toBe(true);
    expect(decodeURIComponent(new URL(page.url()).hash)).toBe('#ethnic?ethnic=白族');
  }
  await expect(page.locator('.region-detail h2')).toHaveText('贵州');
  await page
    .getByRole('navigation', { name: '民族专题页内导航' })
    .getByRole('button', { name: '分布分析', exact: true })
    .click();
  await expect
    .poll(() => page.locator('#section-analysis').evaluate((e) => e.getBoundingClientRect().top))
    .toBeLessThan(130);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(
    page
      .getByRole('navigation', { name: '民族专题页内导航' })
      .getByRole('button', { name: '民族分布', exact: true }),
  ).toHaveAttribute('aria-current', 'location');
});

test('ethnic selection updates all five modules and resets related economic regions', async ({
  page,
}) => {
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('白族'));
  await expect(page.locator('.economy-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.economy-table tbody')).toContainText('云南');
  await expect(page.locator('.economy-table tbody')).toContainText('贵州');
  await expect(page.locator('.economy-table tbody')).toContainText('湖南');
  await page.getByLabel('搜索民族名称').fill('蒙古族');
  await page.locator('.ethnic-option').click();
  await expect(page.locator('.unified-section-title h2')).toHaveText([
    '蒙古族 · 民族分布',
    '蒙古族 · 民族介绍',
    '蒙古族 · 分布分析',
    '蒙古族 · 地区经济',
    '蒙古族 · 民族发展',
  ]);
  await expect(page.locator('.ethnic-photo')).toHaveAttribute('data-ethnic', '蒙古族');
  await expect(page.locator('[data-development-ethnic]')).toHaveAttribute(
    'data-development-ethnic',
    '蒙古族',
  );
  await expect(page.locator('.economy-table tbody')).toContainText('内蒙古');
  await expect(page.locator('.comparison-chips')).toContainText('内蒙古');
  await expect(page.locator('.comparison-chips')).not.toContainText('云南');
  await expect(page.locator('.region-detail h2')).toHaveText('内蒙古');
  await page.reload();
  await expect(page.locator('[data-ethnic-page]')).toHaveAttribute('data-ethnic-page', '蒙古族');
  await expect(page.locator('.ethnic-page-section')).toHaveCount(5);
});

test('legacy links open the matching section of the unified page on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#reform?ethnic=' + encodeURIComponent('白族'));
  await expect(page.locator('[data-development-ethnic]')).toHaveAttribute(
    'data-development-ethnic',
    '白族',
  );
  await expect
    .poll(() => page.locator('#section-reform').evaluate((e) => e.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(0);
  await expect
    .poll(() => page.locator('#section-reform').evaluate((e) => e.getBoundingClientRect().top))
    .toBeLessThan(130);
  expect(decodeURIComponent(new URL(page.url()).hash)).toBe('#ethnic?ethnic=白族');
  const nav = page.getByRole('navigation', { name: '民族专题页内导航' });
  await expect.poll(() => nav.evaluate((e) => e.getBoundingClientRect().top)).toBeLessThan(10);
  await nav.getByRole('button', { name: '民族分布', exact: true }).click();
  await expect
    .poll(() => page.locator('#section-map').evaluate((e) => e.getBoundingClientRect().top))
    .toBeLessThan(100);
  await expect(page.locator('.ethnic-page-section')).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: '数据说明', exact: true }).click();
  await expect(page.locator('.source-card')).toHaveCount(11);
  await page.locator('.brand').click();
  await expect(page.locator('.ethnic-page-section')).toHaveCount(5);
  await expect(page.locator('[data-ethnic-page]')).toHaveAttribute('data-ethnic-page', '白族');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => (location.hash = 'culture?ethnic=' + encodeURIComponent('独龙族')));
  await expect(page.locator('[data-ethnic-page]')).toHaveAttribute('data-ethnic-page', '独龙族');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => (location.hash = 'ethnic?ethnic=' + encodeURIComponent('白族')));
  await expect(page.locator('[data-ethnic-page]')).toHaveAttribute('data-ethnic-page', '白族');
});
