import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({
  channel: process.platform === 'win32' ? 'msedge' : undefined,
});
await mkdir('docs/screenshots', { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto('http://127.0.0.1:5173/#ethnic?ethnic=' + encodeURIComponent('白族'));
await page.locator('[data-ethnic-page="白族"]').waitFor();
await page.locator('.map-canvas[data-rendered="true"]').waitFor();
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.screenshot({ path: 'docs/screenshots/民族专题一页式桌面.png' });
await page
  .getByRole('navigation', { name: '民族专题页内导航' })
  .getByRole('button', { name: '民族介绍', exact: true })
  .click();
await page.waitForFunction(
  () => document.querySelector('#section-culture').getBoundingClientRect().top < 130,
);
await page.screenshot({ path: 'docs/screenshots/民族专题一页式介绍.png' });
for (const [name, tab, file] of [
  ['白族', 'reform', '白族发展专题'],
  ['独龙族', 'culture', '独龙族介绍与发展'],
  ['高山族', 'reform', '高山族发展专题'],
]) {
  await page.goto('http://127.0.0.1:5173/#' + tab + '?ethnic=' + encodeURIComponent(name));
  await page.locator(`[data-development-ethnic="${name}"]`).waitFor();
  await page.waitForFunction(() =>
    document.querySelector('.site-footer')?.textContent.includes('本地统计数据已加载'),
  );
  await page
    .locator('.ethnic-photo-image')
    .first()
    .evaluate((img) => img.decode());
  await page.screenshot({ path: `docs/screenshots/${file}.png`, fullPage: true });
  if (tab === 'reform')
    await page
      .locator('.ethnic-timeline')
      .screenshot({ path: `docs/screenshots/${name}发展时间轴.png` });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:5173/#ethnic?ethnic=' + encodeURIComponent('白族'));
await page.locator('[data-ethnic-page="白族"]').waitFor();
await page.locator('.map-canvas[data-rendered="true"]').waitFor();
await page
  .getByRole('navigation', { name: '民族专题页内导航' })
  .getByRole('button', { name: '民族分布', exact: true })
  .click();
await page.waitForFunction(
  () => document.querySelector('#section-map').getBoundingClientRect().top < 100,
);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
await page.waitForFunction(() =>
  document
    .querySelector('.ethnic-section-nav [aria-current="location"]')
    ?.textContent.includes('民族分布'),
);
await page.screenshot({ path: 'docs/screenshots/民族专题一页式移动端.png' });
await page.goto('http://127.0.0.1:5173/#reform?ethnic=' + encodeURIComponent('乌孜别克族'));
await page.locator('[data-ethnic-page="乌孜别克族"]').waitFor();
await page.locator('.development-year').waitFor();
await page.screenshot({ path: 'docs/screenshots/民族发展专题移动端.png', fullPage: true });
await page
  .locator('.ethnic-timeline')
  .screenshot({ path: 'docs/screenshots/民族时间轴移动端.png' });
await browser.close();
