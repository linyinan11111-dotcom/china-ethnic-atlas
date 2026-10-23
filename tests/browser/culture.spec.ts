import { test, expect } from '@playwright/test';
import { ethnicNames } from '../../src/utils/ethnic-search.mjs';
test.use({ reducedMotion: 'reduce' });
test('all culture readers switch their own six sourced topics and reset selection', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/#culture?ethnic=' + encodeURIComponent('朝鲜族'));
  const reader = page.locator('.ethnic-culture');
  await reader.getByRole('tab', { name: /饮食文化/ }).click();
  await expect(reader.getByRole('tabpanel')).toContainText('冷面');
  await reader.getByRole('tab', { name: /建筑聚落/ }).click();
  await expect(reader.getByRole('tabpanel')).toContainText('温突儿邦');
  for (const name of ethnicNames) {
    await page.evaluate(
      (name) => (location.hash = 'culture?ethnic=' + encodeURIComponent(name)),
      name,
    );
    await expect(reader).toHaveAttribute('data-culture-ethnic', name);
    await expect(reader.getByRole('tab')).toHaveCount(6);
    await expect(reader.getByRole('tab', { name: /语言文字/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      reader.getByRole('tabpanel').getByRole('link', { name: /阅读原文/ }),
    ).toHaveAttribute('href', /^https?:\/\//);
    await reader.getByRole('tab', { name: /艺术技艺/ }).click();
    await expect(reader.getByRole('tabpanel')).not.toContainText('待补充核查');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(reader.getByRole('tab')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
