import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('Gaoshan distinguishes mainland census and official Taiwan registration in map, culture and export',async({page})=>{
 await page.goto('/#map?ethnic='+encodeURIComponent('高山族'));
 await page.getByLabel('人口普查年份').selectOption('2010');
 await expect(page.locator('.overview-strip')).toContainText('大陆高山族人口');
 await expect(page.locator('.overview-strip')).toContainText('3,479');
 await expect(page.locator('.overview-strip')).toContainText('台湾原住民人口');
 await expect(page.locator('.ol-target')).toHaveAttribute('data-reference-region','710000');
 await expect(page.locator('.region-detail h2').first()).toHaveText('台湾');
 await expect(page.locator('.region-detail')).toContainText('641,332');
 await expect(page.locator('.region-detail')).toContainText('2.76%');
 const source=page.locator('.map-main-column .taiwan-population');
 await expect(source).toContainText('2026-09');await expect(source).toContainText('95,096');
 const downloadEvent=page.waitForEvent('download');
 await source.getByRole('button',{name:'导出台湾户籍参考'}).click();
 const download=await downloadEvent;const path=await download.path();
 const text=await readFile(path!,'utf8');
 expect(text).toContain('641332');expect(text).toContain('原住民户籍登记人口');expect(text).toContain('2026-09');
 expect(text).not.toContain('2010,641332');
 await page.getByRole('button',{name:'民族介绍',exact:true}).click();
 await expect(page.locator('.info-card').first()).toContainText('大陆普查人口');
 await expect(source).toContainText('641,332');
 await page.getByRole('button',{name:'分布分析',exact:true}).click();
 await expect(page.locator('.analysis-table tbody tr')).toHaveCount(31);
 await expect(page.locator('.analysis-table tbody')).not.toContainText('台湾');
 await page.locator('.analysis-table tbody tr').first().getByRole('button').click();
 await expect(page.locator('.region-detail h2').first()).toHaveText('海南');
 await source.getByRole('button',{name:'查看台湾地图详情'}).click();
 await expect(page.locator('.region-detail h2').first()).toHaveText('台湾');
});

test('tiny ranking percentages agree with the table on a narrow screen',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/#analysis?ethnic='+encodeURIComponent('高山族'));
 await page.getByLabel('人口普查年份').selectOption('2010');
 const chart=page.locator('#section-analysis .chart-card [role=img]');
 await expect(chart).toHaveAttribute('aria-label',/海南 0\.0013%/);
 await expect(chart).toHaveAttribute('aria-label',/福建 0\.0011%/);
 await expect(page.locator('.analysis-table tbody tr').first().locator('td').nth(3)).toHaveText('0.0013%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await expect(page.locator('#section-analysis .chart-card canvas')).toBeVisible();
 await page.locator('#section-analysis').getByRole('button',{name:'人口数量',exact:true}).click();
 await expect(page.locator('.analysis-table tbody tr').first()).toContainText('河南');
 await expect(chart).toHaveAttribute('aria-label',/河南 780人/);
});
