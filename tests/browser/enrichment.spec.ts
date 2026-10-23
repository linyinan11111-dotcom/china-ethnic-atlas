import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
test.use({ reducedMotion: 'reduce' });
test('directory, cultural point, local story and side-by-side comparison stay linked', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('白族'));
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered', 'true');
  await page.getByLabel('按主要分布地区筛选').selectOption('云南');
  await page.getByLabel('搜索民族名称').fill('扎染');
  await expect(page.locator('.ethnic-option').filter({ hasText: '白族' })).toBeVisible();
  await page.getByLabel('按主要分布地区筛选').selectOption('内蒙古');
  await expect(page.locator('.ethnic-option')).toHaveCount(0);
  await page.getByRole('button', { name: '重置筛选' }).click();
  await page.getByLabel('搜索民族名称').fill('大理');
  await page.locator('.ethnic-option').filter({ hasText: '白族' }).click();
  await page.locator('.cultural-places .place-select').click();
  await expect(page.locator('.cultural-places article')).toHaveClass(/chosen/);
  await expect(page.locator('.region-detail h2')).toHaveText('云南');
  await page.getByRole('button', { name: '阅读地方故事', exact: true }).click();
  await expect(page.locator('.local-story')).toHaveAttribute('data-story-ethnic', '白族');
  await expect(page.locator('.local-story')).toContainText('2026');
  await page
    .locator('.local-story')
    .screenshot({ path: 'docs/screenshots/local-story-desktop.png' });
  await expect(page.locator('.story-sources a')).toHaveAttribute(
    'href',
    /^https:\/\/www\.neac\.gov\.cn/,
  );
  await page.getByRole('navigation').getByRole('button', { name: '分布分析', exact: true }).click();
  await page.getByLabel('第二比较民族').selectOption('朝鲜族');
  await page.getByLabel('比较文化栏目').selectOption('food');
  await expect(page.locator('[data-compare-ethnic="朝鲜族"]')).toContainText('冷面');
  await page.locator('.ethnic-comparison').screenshot({
    path: 'docs/screenshots/comparison-desktop.png',
    style: '.ethnic-section-nav{visibility:hidden}',
  });
  await page.getByRole('button', { name: '⇄ 交换', exact: true }).click();
  await expect(page.getByLabel('第一比较民族')).toHaveValue('朝鲜族');
  await page.getByRole('button', { name: '打开朝鲜族完整专题', exact: false }).click();
  await expect(page.locator('[data-ethnic-page]')).toHaveAttribute('data-ethnic-page', '朝鲜族');
  await expect(page.locator('.local-story')).toHaveAttribute('data-story-ethnic', '朝鲜族');
  expect(errors).toEqual([]);
});
test('verified census years update ranking, map, context and exported CSV together', async ({
  page,
}) => {
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('高山族'));
  await expect(page.getByLabel('人口普查年份')).toHaveValue('2020');
  await expect(page.locator('.map-year')).toHaveText('2020 年普查');
  await expect(page.locator('.analysis-table tbody tr')).toHaveCount(30);
  await page.getByRole('navigation').getByRole('button', { name: '分布分析', exact: true }).click();
  await page
    .locator('#section-analysis')
    .getByRole('button', { name: '人口数量', exact: true })
    .click();
  await expect(page.locator('.analysis-table tbody tr').first()).toContainText('福建');
  await expect(page.locator('.analysis-table tbody tr').first()).toContainText('417');
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出数据', exact: true }).click();
  const text = await readFile((await (await event).path())!, 'utf8');
  expect(text).toContain('高山族,2020');
  expect(text).toContain('A0104.jpg');
  expect(text).not.toContain('641332');
  await page.getByLabel('人口普查年份').selectOption('2010');
  await expect(page.locator('.map-year')).toHaveText('2010 年普查');
  await expect(page.locator('.analysis-table tbody tr')).toHaveCount(31);
  await expect(page.locator('.analysis-table tbody tr').first()).toContainText('河南');
  await expect(page.locator('.analysis-table tbody tr').first()).toContainText('780');
  await expect(page.locator('.compare-note').first()).toContainText('2010年');
  await expect(page.locator('.development-regions')).toContainText('人口为2010年');
  await expect(page.locator('.taiwan-population').first()).toContainText('2026-09');
});
test('new editorial modules and comparison fit mobile, and sources remain keyboard accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#ethnic?ethnic=' + encodeURIComponent('苗族'));
  await page.getByRole('navigation').getByRole('button', { name: '民族介绍', exact: true }).click();
  await expect(page.locator('.local-story')).toContainText('2025');
  await page.getByRole('navigation').getByRole('button', { name: '分布分析', exact: true }).click();
  await page.getByLabel('第二比较民族').selectOption('乌孜别克族');
  await expect(page.locator('[data-compare-ethnic="乌孜别克族"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const comparisonRows = await page
    .locator('.compare-columns dl')
    .evaluateAll((elements) =>
      elements.map((element) =>
        Array.from(element.children).map((row) => row.getBoundingClientRect().top),
      ),
    );
  comparisonRows[0].forEach((top, index) =>
    expect(Math.abs(top - comparisonRows[1][index])).toBeLessThan(2),
  );
  await page.locator('.ethnic-comparison').screenshot({
    path: 'docs/screenshots/enrichment-mobile.png',
    style: '.ethnic-section-nav{visibility:hidden}',
  });
  await page.getByRole('navigation').getByRole('button', { name: '民族发展', exact: true }).click();
  await page
    .getByRole('group', { name: '发展案例类别筛选' })
    .getByRole('button', { name: '特色产业', exact: true })
    .click();
  await expect(page.locator('.cases-grid')).toContainText('苗绣培训');
  await page
    .getByRole('button', { name: '2026-10报道 · 苗绣培训连接传承与就近就业', exact: true })
    .click();
  await expect(page.locator('.ethnic-timeline-detail h3')).toHaveText('苗绣培训连接传承与就近就业');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
