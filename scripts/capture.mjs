import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
await mkdir('docs/screenshots',{recursive:true});
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined});
const page=await browser.newPage({viewport:{width:1440,height:1040},deviceScaleFactor:1});
await page.goto('http://127.0.0.1:5173/');
await page.locator('.map-canvas[data-rendered="true"]').waitFor();
await page.screenshot({path:'docs/screenshots/民族分布.png',fullPage:true});
for(const [name,file] of [['民族介绍','民族介绍'],['分布分析','分布分析'],['地区经济','地区经济'],['民族发展','民族发展']]){
 await page.getByRole('button',{name,exact:true}).click();
 if(name==='分布分析'||name==='地区经济'){await page.locator('.chart-card canvas').first().waitFor();await page.waitForTimeout(1100);}
 await page.screenshot({path:`docs/screenshots/${file}.png`,fullPage:true});
}
await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:'民族分布',exact:true}).click();
await page.locator('.map-canvas[data-rendered="true"]').waitFor();
await page.screenshot({path:'docs/screenshots/移动端.png',fullPage:true});
await browser.close();
console.log('Saved 6 reviewed page screenshots to docs/screenshots');
