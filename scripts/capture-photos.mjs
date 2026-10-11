import {chromium} from '@playwright/test';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {ethnicNames} from '../src/utils/ethnic-search.mjs';
const records=JSON.parse(await readFile('src/data/ethnic-photos.json','utf8'));
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined});
await mkdir('docs/screenshots',{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
for(const [name,tab,file] of [['鄂伦春族','map','民族分布.png'],['苗族','culture','民族介绍.png'],['汉族','culture','汉服照片.png']]){
 await page.goto('http://127.0.0.1:5173/#'+tab+'?ethnic='+encodeURIComponent(name));
 await page.locator('.ethnic-photo-image').waitFor();await page.locator('.ethnic-photo-image').evaluate(img=>img.decode());
 if(tab==='map')await page.locator('.map-canvas[data-rendered="true"]').waitFor();
 await page.screenshot({path:'docs/screenshots/'+file,fullPage:true});
}
await page.getByRole('button',{name:'打开民族搜索'}).click();await page.getByLabel('全局民族搜索').fill('m');
await page.locator('.search-result img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
await page.screenshot({path:'docs/screenshots/民族搜索.png',fullPage:true});await page.keyboard.press('Escape');await page.locator('.search-overlay').waitFor({state:'detached'});
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/#culture?ethnic='+encodeURIComponent('苗族'));await page.locator('.ethnic-photo-image').evaluate(img=>img.decode());
await page.screenshot({path:'docs/screenshots/民族照片移动端.png',fullPage:true});
const gallery=await browser.newPage({viewport:{width:1440,height:900}});
await gallery.setContent(`<style>body{margin:28px;font-family:'Microsoft YaHei';background:#faf9f5;color:#35424c}h1{font-size:25px}p{font-size:12px;color:#73806c}.grid{display:grid;grid-template-columns:repeat(8,1fr);gap:12px}figure{margin:0;padding:8px;background:#fff;border:1px solid #e2e5df;border-radius:7px}img{display:block;width:100%;height:156px;object-fit:contain}figcaption{text-align:center;font-size:12px;margin:10px 0 3px}</style><h1>山河同心 · 56 民族服饰照片图鉴</h1><p>资料人物照片 · 55个少数民族：中国网 / 汉服：China Highlights · 单张照片展示部分地域与场合的服饰文化</p><div class="grid">${ethnicNames.map(name=>`<figure><img src="http://127.0.0.1:5173/${records[name].photos[0].file}"><figcaption>${name}</figcaption></figure>`).join('')}</div>`);
await gallery.waitForFunction(()=>[...document.images].every(img=>img.complete&&img.naturalWidth>0));
const dimensions=await gallery.locator('img').evaluateAll(imgs=>imgs.map(img=>({width:img.naturalWidth,height:img.naturalHeight})));
await gallery.screenshot({path:'docs/screenshots/56民族服饰照片图鉴.png',fullPage:true});
const lines=['# 民族服饰照片来源','','56张本地人物照片，按来源的民族栏目及服饰说明收录。人物民族身份不根据外貌推断。汉族栏目采用汉服文化体验照片；同一民族的服饰有地区、时代与使用场合差异。','','55个少数民族：中国网 Ethnic Groups；汉服：China Highlights。原页面未提供照片拍摄时间，多数未标注摄影者。保留原图，无AI生成、换脸或扩图。','','**许可状态：原网站未提供开放许可；保留来源署名不等于已取得再发布授权。公开发布到GitHub Pages前应取得权利人授权，或换成自有/有明确开放许可的照片。**','','采集日期：'+records['汉族'].retrieved+'。原文快照位于 `data/raw/photos/ethnic-N.html`，机器可读来源为 `src/data/ethnic-photos.json`。','','| 民族 | 本地文件 | 尺寸 | 来源原文 | 原始图片 |','| --- | --- | --- | --- | --- |'];
for(const [i,name] of ethnicNames.entries()){const r=records[name],p=r.photos[0],d=dimensions[i];lines.push(`| ${name} | ${p.file} | ${d.width}×${d.height} | [${r.publisher}](${r.source}) | [原图](${p.original}) |`);}
await writeFile('docs/PHOTO_SOURCES.md',lines.join('\n')+'\n');
await browser.close();console.log('Decoded all 56 photos; captured desktop, search, mobile and gallery previews.');
