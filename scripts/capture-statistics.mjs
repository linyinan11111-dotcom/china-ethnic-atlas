import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({
  channel: process.platform === 'win32' ? 'msedge' : undefined,
});
await mkdir('docs/screenshots', { recursive: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1040 } });
await page.goto('http://127.0.0.1:5173/#map?ethnic=' + encodeURIComponent('高山族'));
await page.locator('.map-canvas[data-rendered="true"]').waitFor();
await page.locator('.ethnic-photo-image').evaluate((img) => img.decode());
await page.screenshot({ path: 'docs/screenshots/高山族与台湾户籍参考.png', fullPage: true });
await page.getByRole('button', { name: '分布分析', exact: true }).click();
await page.locator('.chart-card canvas').waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: 'docs/screenshots/高山族排名百分比.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
await page.screenshot({ path: 'docs/screenshots/排名百分比移动端.png', fullPage: true });
await page.goto('http://127.0.0.1:5173/#analysis?ethnic=' + encodeURIComponent('汉族'));
await page.locator('.chart-card canvas').waitFor();
await page.waitForTimeout(500);
await page.screenshot({ path: 'docs/screenshots/汉族排名百分比移动端.png', fullPage: true });
await browser.close();
