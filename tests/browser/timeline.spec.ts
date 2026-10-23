import { test, expect } from '@playwright/test';
import { ethnicNames } from '../../src/utils/ethnic-search.mjs';

test('individual milestones, same-year events, source links and switching to a shorter timeline work', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#reform?ethnic=' + encodeURIComponent('白族'));
  const timeline = page.locator('.ethnic-timeline');
  await expect(timeline).toHaveAttribute('data-timeline-ethnic', '白族');
  await expect(timeline.locator('h2')).toContainText('白族');
  await expect(timeline.locator('.ethnic-timeline-detail h3')).toHaveText('白文方案修订为“新白文”');
  await timeline.getByRole('button', { name: '1982 · 大理州民族中学创建', exact: true }).click();
  await expect(timeline.locator('.ethnic-timeline-detail h3')).toHaveText('大理州民族中学创建');
  await expect(timeline.locator('.ethnic-timeline-sources a')).toHaveAttribute(
    'href',
    'https://www.neac.gov.cn/seac/ztzl/bz/fzxz.shtml',
  );
  await timeline.getByRole('button', { name: '1995 · 大理机场建成通航', exact: true }).click();
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('交通通信');
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('云南大理');
  await timeline.getByRole('button', { name: '下一个发展节点' }).click();
  await expect(timeline.locator('.ethnic-timeline-period')).toHaveText('2006');
  await expect(timeline.locator('.ethnic-timeline-records')).toContainText('白族扎染');
  await timeline.getByRole('button', { name: '下一个发展节点' }).click();
  await expect(page.locator('.national-reform-context')).not.toHaveAttribute('open');
  await page.getByLabel('搜索民族名称').fill('乌孜');
  await page.locator('.ethnic-option').click();
  await expect(timeline).toHaveAttribute('data-timeline-ethnic', '乌孜别克族');
  await expect(timeline.locator('.ethnic-timeline-detail h3')).toHaveText(
    '大南沟乌孜别克民族乡成立',
  );
  await expect(timeline).not.toContainText('白族扎染');
  await page.evaluate(() => (location.hash = 'reform?ethnic=' + encodeURIComponent('独龙族')));
  await timeline.getByRole('button', { name: '1999 · 独龙江公路全线通车', exact: true }).click();
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('1999年9月9日');
  await timeline
    .getByRole('button', { name: '2004 · 独龙江乡开通卫星移动电话', exact: true })
    .click();
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('2004年10月2日');
  expect(errors).toEqual([]);
});

test('all ethnic timelines render their own history without runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#reform');
  for (const name of ethnicNames) {
    await page.evaluate(
      (name) => (location.hash = 'reform?ethnic=' + encodeURIComponent(name)),
      name,
    );
    await expect(page.locator('.ethnic-timeline')).toHaveAttribute('data-timeline-ethnic', name);
    await expect(page.locator('.ethnic-timeline-detail h3')).not.toBeEmpty();
    await expect(page.locator('.ethnic-timeline-node[aria-pressed=true]')).toHaveCount(1);
    await expect(page.locator('.ethnic-timeline-sources a').first()).toHaveAttribute(
      'href',
      /^https?:\/\//,
    );
  }
  expect(errors).toEqual([]);
});

test('mobile timeline contains scrolling nodes and keeps Taiwanese records separate', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#reform?ethnic=' + encodeURIComponent('白族'));
  const timeline = page.locator('.ethnic-timeline');
  await expect(
    timeline.getByRole('button', { name: '1982 · 大理州民族中学创建', exact: true }),
  ).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(
    await page.locator('.ethnic-timeline-list').evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  await timeline.getByRole('button', { name: '上一个发展节点' }).click();
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('历史基础');
  await page.evaluate(() => (location.hash = 'reform?ethnic=' + encodeURIComponent('高山族')));
  await expect(page.locator('.ethnic-timeline-scope')).toContainText('台湾社群');
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('台湾社群历程');
  await timeline.getByRole('button', { name: '下一个发展节点' }).click();
  await timeline.getByRole('button', { name: '下一个发展节点' }).click();
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('大陆 · 福建华安');
  await expect(timeline.locator('.ethnic-timeline-detail')).toContainText('大陆文化保护');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await timeline.screenshot({ path: 'test-results/ethnic-timeline-mobile.png' });
});
