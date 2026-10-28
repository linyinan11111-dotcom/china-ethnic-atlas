import { test, expect, type Locator } from '@playwright/test';

async function expectLensOn(group: Locator, target: Locator) {
  await expect(group.locator('.liquid-selection-lens')).toHaveClass(/is-visible/);
  await expect
    .poll(async () => {
      const lens = await group.locator('.liquid-selection-lens').boundingBox();
      const button = await target.boundingBox();
      return lens && button ? Math.abs(lens.x - button.x) + Math.abs(lens.y - button.y) : 999;
    })
    .toBeLessThan(2);
}

test('chapter lens drags, snaps, scrolls to its result and keeps click and keyboard navigation', async ({
  page,
}) => {
  await page.goto('/');
  const nav = page.getByRole('navigation');
  const map = nav.getByRole('button', { name: '民族分布', exact: true });
  const economy = nav.getByRole('button', { name: '地区经济', exact: true });
  await map.scrollIntoViewIfNeeded();
  await expectLensOn(nav, map);
  const start = (await map.boundingBox())!;
  const finish = (await economy.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(finish.x + finish.width / 2, finish.y + finish.height / 2, { steps: 16 });
  await expect(nav).toHaveClass(/lens-dragging/);
  await expect(map).toHaveAttribute('aria-current', 'location');
  await page.mouse.up();
  await expect(economy).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('#section-economy')).toBeFocused();
  await expectLensOn(nav, economy);
  await economy.focus();
  await page.keyboard.press('ArrowRight');
  await expect(nav.getByRole('button', { name: '民族发展', exact: true })).toHaveAttribute(
    'aria-current',
    'location',
  );
  await page.keyboard.press('Home');
  await expect(map).toHaveAttribute('aria-current', 'location');
  await nav.getByRole('button', { name: '民族介绍', exact: true }).click();
  await expect(page.locator('#section-culture')).toBeFocused();
  await expect(page.locator('.theme-indicator')).toHaveCount(0);
});

test('ethnic glass overlay follows hover, filtering and keyboard search', async ({ page }) => {
  await page.goto('/');
  const directory = page.locator('.ethnic-list');
  const mongol = directory.locator('[data-lens-key="蒙古族"]');
  await mongol.hover();
  await expectLensOn(directory, mongol);
  await mongol.click();
  await expect(page.locator('.cover-copy h1')).toHaveText('蒙古族');
  await page.getByLabel('搜索民族名称').fill('白族');
  const bai = directory.locator('[data-lens-key="白族"]');
  await bai.hover();
  await expectLensOn(directory, bai);
  await page.getByRole('button', { name: '打开民族搜索' }).click();
  await page.getByLabel('全局民族搜索').fill('族');
  await page.getByLabel('全局民族搜索').press('ArrowDown');
  const results = page.locator('.global-search-results');
  await expectLensOn(results, page.locator('.search-result.keyboard-active'));
  await page.getByLabel('全局民族搜索').fill('没有这个民族');
  await expect(results.locator('.liquid-selection-lens')).not.toHaveClass(/is-visible/);
  await page.keyboard.press('Escape');
});

test('touch drag on the mobile chapter bar selects a chapter without page overflow', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    const first = nav.getByRole('button', { name: '民族分布', exact: true });
    await first.scrollIntoViewIfNeeded();
    const start = (await first.boundingBox())!;
    const finish = (await nav
      .getByRole('button', { name: '分布分析', exact: true })
      .boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const x = start.x + start.width / 2,
      y = start.y + start.height / 2;
    const endX = Math.min(355, finish.x + finish.width / 2);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 12; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x + ((endX - x) * step) / 12, y }],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(nav.getByRole('button', { name: '分布分析', exact: true })).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(page.locator('#section-analysis')).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
    await cdp.detach();
  } finally {
    await context.close();
  }
});
