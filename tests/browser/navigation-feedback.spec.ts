import { test, expect, type Page } from '@playwright/test';

async function expectArrived(page: Page, selector: string) {
  await expect(page.locator(selector)).toHaveClass(/navigation-arrival/);
  await expect
    .poll(() => page.locator(selector).evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(0);
  await expect
    .poll(() => page.locator(selector).evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThan(130);
  await expect(page.locator(selector)).toBeFocused();
}

test('navigation scrolls to visible sections and provides feedback with ordinary motion', async ({
  page,
}) => {
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('朝鲜族'));
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  for (const [name, id] of [
    ['民族发展', 'reform'],
    ['民族介绍', 'culture'],
    ['地区经济', 'economy'],
    ['分布分析', 'analysis'],
    ['民族分布', 'map'],
  ]) {
    await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
    await expectArrived(page, '#section-' + id);
    await expect(page.getByRole('status')).toContainText('已定位到' + name);
  }
  await page.getByRole('navigation').getByRole('button', { name: '民族分布', exact: true }).click();
  await expectArrived(page, '#section-map');
  await page.screenshot({
    path: 'docs/screenshots/avatar-navigation-desktop.png',
    fullPage: false,
  });
});

test('economic selection and story buttons bring the changed content into view', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('白族'));
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await page.getByRole('navigation').getByRole('button', { name: '地区经济', exact: true }).click();
  const row = page.locator('.economy-table tbody tr').first();
  const region = await row.locator('td').nth(1).innerText();
  await row.getByRole('button', { name: '选择地区' }).click();
  await expectArrived(page, '#economy-details');
  await expect(page.locator('#economy-details')).toContainText(region);
  await page.getByRole('button', { name: '阅读地方故事', exact: true }).click();
  await expectArrived(page, '.local-story');
  await page.getByRole('button', { name: '返回分布地图', exact: true }).click();
  await expectArrived(page, '#section-map');
  await page.locator('.cultural-places .place-select').click();
  await expectArrived(page, '.map-card');
});

test('mobile timeline, region and ethnic switches reveal their results', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('朝鲜族'));
  await page.getByRole('navigation').getByRole('button', { name: '民族发展', exact: true }).click();
  await page.locator('.ethnic-timeline-node').last().click();
  await expectArrived(page, '.ethnic-timeline-detail');
  await page.locator('.development-region').first().click();
  await expectArrived(page, '#economy-details');
  await page.getByRole('navigation').getByRole('button', { name: '分布分析', exact: true }).click();
  await page
    .locator('.analysis-table tbody tr')
    .first()
    .getByRole('button', { name: '地图查看' })
    .click();
  await expectArrived(page, '#region-details');
  await page.getByRole('navigation').getByRole('button', { name: '分布分析', exact: true }).click();
  await page.getByLabel('第二比较民族').selectOption('蒙古族');
  await page.getByRole('button', { name: '打开蒙古族完整专题 →', exact: true }).click();
  await expect(page.locator('.magazine-cover h1')).toHaveText('蒙古族');
  await expect(page.locator('.magazine-cover')).toBeFocused();
  await expect(page.locator('.ethnic-photo-image')).toHaveAttribute(
    'src',
    /avatars\/ethnic-2\.png$/,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'docs/screenshots/avatar-navigation-mobile.png' });
});

test('all directory and search thumbnails use locally served clothing avatars', async ({
  page,
}) => {
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('朝鲜族'));
  await expect(page.locator('.ethnic-option img')).toHaveCount(56);
  await expect(page.locator('.cover-photo img')).toHaveAttribute('src', /avatars\/ethnic-10\.png$/);
  const urls = await page
    .locator('.ethnic-option img')
    .evaluateAll((images) => images.map((image) => (image as HTMLImageElement).src));
  for (const url of urls) {
    const response = await page.request.get(url);
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('image/png');
  }
  await page.getByRole('button', { name: '打开民族搜索' }).click();
  await expect(page.locator('.search-result img')).toHaveCount(56);
  await page.getByLabel('全局民族搜索').fill('蒙古');
  await page.locator('.search-result').first().click();
  await expect(page.locator('.magazine-cover h1')).toHaveText('蒙古族');
  await expect(page.locator('.magazine-cover')).toBeFocused();
});
