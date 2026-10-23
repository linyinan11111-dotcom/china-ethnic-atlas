import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });
const profile = '/#ethnic?ethnic=' + encodeURIComponent('白族');

for (const missingYear of [2010, 2020]) {
  test(`unavailable ${missingYear} census retains the working edition and can retry`, async ({
    page,
  }) => {
    const filename = missingYear === 2010 ? 'population.json' : 'population2020.json';
    await page.route(`**/data/${filename}`, (route) =>
      route.fulfill({ status: 503, body: 'unavailable' }),
    );
    await page.goto(profile);
    const availableYear = missingYear === 2010 ? '2020' : '2010';
    await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
    await expect(page.getByLabel('人口普查年份')).toHaveValue(availableYear);
    await expect(page.locator('.map-year')).toContainText(availableYear);
    await expect(
      page.getByLabel('人口普查年份').locator(`option[value="${missingYear}"]`),
    ).toHaveJSProperty('disabled', true);
    await expect(page.getByRole('alert')).toContainText(`${missingYear}年人口数据加载失败`);
    await page.unroute(`**/data/${filename}`);
    await page.getByRole('alert').getByRole('button', { name: '重新加载' }).click();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await expect(
      page.getByLabel('人口普查年份').locator(`option[value="${missingYear}"]`),
    ).toHaveJSProperty('disabled', false);
    await page.getByLabel('人口普查年份').selectOption(String(missingYear));
    await expect(page.locator('.map-year')).toContainText(String(missingYear));
  });
}

test('both failed censuses can recover without a reload', async ({ page }) => {
  await page.route('**/data/population*.json', (route) => route.fulfill({ status: 503, body: '' }));
  await page.goto(profile);
  await expect(page.getByRole('alert')).toContainText('2020年人口数据加载失败');
  await expect(page.locator('.map-canvas')).toHaveCount(0);
  await page.unroute('**/data/population*.json');
  await page.getByRole('alert').getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.region-detail h2')).toHaveText('云南');
});

test('same ethnic section hashes preserve the chosen region and comparison basket', async ({
  page,
}) => {
  await page.goto(profile);
  await page.getByRole('navigation').getByRole('button', { name: '地区经济', exact: true }).click();
  await page.getByLabel('对比云南', { exact: true }).uncheck();
  await page
    .locator('.economy-table tbody tr')
    .filter({ has: page.getByRole('cell', { name: '贵州', exact: true }) })
    .getByRole('button', { name: '选择地区' })
    .click();
  const chips = await page.locator('.comparison-chips').innerText();
  await page.evaluate(() => {
    location.hash = 'analysis?ethnic=' + encodeURIComponent('白族');
  });
  await expect(page.locator('#section-analysis')).toBeFocused();
  await expect(page.locator('.region-detail h2')).toHaveText('贵州');
  await expect(page.locator('.comparison-chips')).toHaveText(chips);
});

test('late census responses preserve ethnic selection and the current reading section', async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/data/population*.json', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/#reform?ethnic=' + encodeURIComponent('白族'));
  await page.getByLabel('搜索民族名称').fill('蒙古');
  await page.locator('.ethnic-option').click();
  await page.getByRole('navigation').getByRole('button', { name: '民族介绍', exact: true }).click();
  release();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await expect(page.locator('.magazine-cover h1')).toHaveText('蒙古族');
  await expect(page.locator('.region-detail h2')).toHaveText('内蒙古');
  await expect(page.locator('#section-culture')).toBeFocused();
});

test('directory empty-state action clears every filter', async ({ page }) => {
  await page.goto(profile);
  await page.getByLabel('按主要分布地区筛选').selectOption('内蒙古');
  await page.getByLabel('搜索民族名称').fill('not-a-group');
  await expect(page.locator('.ethnic-option')).toHaveCount(0);
  await page.getByRole('button', { name: '查看全部民族', exact: true }).click();
  await expect(page.locator('.ethnic-option')).toHaveCount(56);
  await expect(page.getByLabel('按主要分布地区筛选')).toHaveValue('');
  await expect(page.getByLabel('搜索民族名称')).toHaveValue('');
  await page.getByLabel('搜索民族名称').fill('白族');
  await page.getByRole('button', { name: '数据说明', exact: true }).click();
  await page.locator('.brand').click();
  await expect(page.getByLabel('搜索民族名称')).toHaveValue('白族');
  await expect(page.locator('.ethnic-option')).toHaveCount(1);
});

test('boundary fetch is cancelled when leaving the map and a new map mounts cleanly', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  let requested!: () => void;
  let release!: () => void;
  const started = new Promise<void>((resolve) => {
    requested = resolve;
  });
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const failures: string[] = [];
  page.on('requestfailed', (request) => {
    if (request.url().includes('china-provinces.geojson'))
      failures.push(request.failure()?.errorText ?? '');
  });
  await page.route('**/china-provinces.geojson', async (route) => {
    requested();
    await gate;
    await route.continue().catch(() => {});
  });
  await page.goto(profile);
  await started;
  await page.getByRole('button', { name: '数据说明', exact: true }).click();
  await expect(page.locator('.source-card')).toHaveCount(11);
  release();
  await expect.poll(() => failures.length).toBeGreaterThan(0);
  await page.unroute('**/china-provinces.geojson');
  await page.locator('.brand').click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  expect(errors).toEqual([]);
});

test('map boundary failure can retry and repeated place selection restores its view', async ({
  page,
}) => {
  await page.route('**/china-provinces.geojson', (route) =>
    route.fulfill({ status: 503, body: '' }),
  );
  await page.goto(profile);
  await expect(page.locator('.map-loading')).toContainText('地图边界加载失败');
  await page.unroute('**/china-provinces.geojson');
  await page.locator('.map-loading').getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await page.locator('.place-select').click();
  await page.mouse.move(0, 0);
  const target = page.locator('.ol-target');
  const focused = await target.screenshot();
  await page.getByRole('button', { name: '回到全国视图', exact: true }).click();
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await target.screenshot()).equals(focused)).toBe(false);
  await page.locator('.place-select').click();
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await target.screenshot()).equals(focused)).toBe(true);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({ width: 1000, height: 900 });
  await expect.poll(async () => (await target.screenshot()).equals(focused)).toBe(false);
  await page.setViewportSize(viewport);
  await expect.poll(async () => (await target.screenshot()).equals(focused)).toBe(true);
});

test('search arrows work on results and do not hijack the close button', async ({ page }) => {
  await page.goto(profile);
  await page.getByRole('button', { name: '打开民族搜索' }).click();
  await page.locator('.search-result').first().focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.search-result').nth(1)).toBeFocused();
  const active = await page.locator('.search-result.keyboard-active strong').innerText();
  await page.getByRole('button', { name: '关闭民族搜索' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: '关闭民族搜索' })).toBeFocused();
  await expect(page.locator('.search-result.keyboard-active strong')).toHaveText(active);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '打开民族搜索' })).toBeFocused();
});
