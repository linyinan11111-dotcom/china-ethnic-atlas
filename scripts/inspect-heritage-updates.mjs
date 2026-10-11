import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined});
const page=await browser.newPage({javaScriptEnabled:false});
for(const year of [2008,2011,2014]){
 const html=await readFile(`data/raw/development/national-heritage-${year}.html`,'utf8');
 await page.setContent(html,{waitUntil:'domcontentloaded'});
 const rows=await page.locator('tr').evaluateAll(rows=>rows.map(row=>Array.from(row.children).filter(cell=>['TD','TH'].includes(cell.tagName)).map(cell=>cell.textContent.replace(/\s+/g,' ').trim())).filter(cells=>cells.length>=3&&cells[0].match(/^\d+$/)&&cells[1].match(/^[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]/)));
 await writeFile(`data/raw/development/rows-${year}.json`,JSON.stringify(rows,null,2)+'\n');
 console.log(year,rows.length);
 const text=await page.locator('body').textContent();
 await writeFile(`data/raw/development/text-${year}.txt`,text.replace(/\u00a0/g,' ').replace(/\s+/g,' '));
 console.log(rows.filter(cells=>cells.join('').includes('白族')||cells.join('').includes('独龙')||cells.join('').includes('德昂')).map(cells=>cells.join(' | ')).join('\n'));
}
await browser.close();
