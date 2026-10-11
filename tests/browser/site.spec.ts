import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import type {AddressInfo} from 'node:net';
import {ethnicNames} from '../../src/utils/ethnic-search.mjs';
import {getEthnicTheme} from '../../src/utils/themes.mjs';

test('map, ethnic selection, search and export work',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('.map-card h2')).toHaveText('壮族人口分布');
 await expect(page.locator('.ol-target canvas')).toBeVisible();
 await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered','true');
 await expect(page.locator('.overview-strip')).toContainText('31');
 await page.getByLabel('搜索民族名称').fill('蒙古');
 await page.locator('.ethnic-option').click();
 await expect(page.locator('.map-card h2')).toHaveText('蒙古族人口分布');
 await expect(page.locator('.region-detail')).toContainText('内蒙古');
 await page.locator('#section-map').getByRole('button',{name:'人口数量',exact:true}).click();
 await expect(page.locator('.legend-title')).toHaveText('民族人口 / 人');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'导出数据',exact:true}).click();
 expect((await download).suggestedFilename()).toContain('蒙古族');
 await expect(page.locator('.toast-message')).not.toBeVisible();
 await page.screenshot({path:'test-results/map-desktop.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('analysis, economy and reform contain real interactive content',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.getByRole('button',{name:'分布分析',exact:true}).click();
 await expect(page.locator('.analysis-table tbody tr')).toHaveCount(31);
 await page.locator('#section-analysis').getByRole('button',{name:'人口数量',exact:true}).click();
 await expect(page.locator('.analysis-table tbody tr').first()).toContainText('广西');
 await page.getByRole('button',{name:'地区经济',exact:true}).click();
 await page.getByRole('button',{name:'五个自治区',exact:true}).click();
 await expect(page.locator('.economy-table tbody tr')).toHaveCount(5);
 await page.getByRole('button',{name:'全部省区市',exact:true}).click();
 await expect(page.locator('.economy-table tbody tr')).toHaveCount(31);
 await page.getByLabel('经济对比指标').selectOption('perCapita');
 await page.getByRole('button',{name:'民族发展',exact:true}).click();
 await page.getByRole('button',{name:'1958 · 广西壮族自治区成立',exact:true}).click();
 await expect(page.locator('.ethnic-timeline-detail h3')).toHaveText('广西壮族自治区成立');
 await page.screenshot({path:'test-results/reform-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'数据说明',exact:true}).click();
 await expect(page.locator('.source-card')).toHaveCount(11);
 expect(errors).toEqual([]);
});
test('mobile layout fits viewport and opens ethnic picker',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await expect(page.locator('.ol-target canvas')).toBeVisible();
 await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered','true');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.locator('.mobile-picker button').click();
 await page.getByLabel('搜索民族名称').fill('藏族');
 await page.locator('.ethnic-option').click();
 await expect(page.locator('.map-card h2')).toHaveText('藏族人口分布');
 await page.screenshot({path:'test-results/map-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'民族发展',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.screenshot({path:'test-results/reform-mobile.png',fullPage:true});
});

test('production assets and hash refresh work under a GitHub Pages repository prefix',async({page})=>{
 const root=resolve('dist');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const failed:string[]=[];page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
 const types:Record<string,string>={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.geojson':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg'};
 const server=createServer(async(req,res)=>{
  try{
   const url=new URL(req.url!,'http://localhost');
   if(!url.pathname.startsWith('/ethnic-atlas/')){res.writeHead(404);res.end();return;}
   const relative=decodeURIComponent(url.pathname.slice('/ethnic-atlas/'.length))||'index.html';
   const path=resolve(root,relative);
   if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
   const content=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]??'application/octet-stream'});res.end(content);
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise<void>(ready=>server.listen(0,'127.0.0.1',ready));
 try{
  const port=(server.address() as AddressInfo).port;
  await page.goto(`http://127.0.0.1:${port}/ethnic-atlas/#map?ethnic=${encodeURIComponent('回族')}`);
  await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered','true');
  await expect(page.locator('.map-card h2')).toHaveText('回族人口分布');
  await expect(page.locator('.cover-photo .ethnic-photo-image')).toHaveAttribute('src',/avatars\/ethnic-3\.png$/);
  await expect.poll(()=>page.locator('.cover-photo .ethnic-photo-image').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.region-detail .section-label h2')).toHaveText('宁夏');
  await page.getByRole('button',{name:'分布分析',exact:true}).click();
  await expect(page.locator('#section-analysis .chart-card canvas')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-ethnic-page]')).toHaveAttribute('data-ethnic-page','回族');
  await expect(page.locator('.analysis-table tbody tr')).toHaveCount(31);
  await page.getByRole('button',{name:'民族介绍',exact:true}).click();
  await expect.poll(()=>page.locator('.ethnic-photo-image').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
  expect(errors).toEqual([]);expect(failed).toEqual([]);
 }finally{await new Promise<void>(done=>server.close(()=>done()));}
});

test('all ethnic clothing avatars decode and link to their source',async({page})=>{
 await page.goto('/#culture');
 for(const name of ethnicNames){
  await page.evaluate(name=>location.hash='culture?ethnic='+encodeURIComponent(name),name);
  await expect(page.locator('.ethnic-photo')).toHaveAttribute('data-ethnic',name);
  await expect(page.locator('.ethnic-photo-image')).toHaveAttribute('src',new RegExp(`avatars/${getEthnicTheme(name).id}\\.png$`));
  await expect.poll(()=>page.locator('.ethnic-photo-image').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByRole('link',{name:`查看${name}头像来源`})).toHaveAttribute('href',/^https?:\/\//);
 }
 await expect(page.getByRole('button',{name:'小姑娘',exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'小少年',exact:true})).toHaveCount(0);
});

test('global pinyin search changes the map theme and photo; sidebar searches ignore common filter',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('.map-canvas')).toHaveAttribute('data-rendered','true');
 const original=await page.locator('.atlas-app').evaluate(e=>getComputedStyle(e).getPropertyValue('--theme-accent'));
 await page.getByRole('button',{name:'打开民族搜索'}).click();
 await page.getByLabel('全局民族搜索').fill('Měng Gǔ');
 await expect(page.locator('.search-result')).toHaveCount(1);
 await page.getByLabel('全局民族搜索').press('Enter');
 await expect(page.locator('[role=dialog]')).not.toBeVisible();
 await expect(page.locator('.map-card h2')).toHaveText('蒙古族人口分布');
 await expect(page.locator('.ethnic-photo')).toHaveAttribute('data-ethnic','蒙古族');
 expect(await page.locator('.atlas-app').evaluate(e=>getComputedStyle(e).getPropertyValue('--theme-accent'))).not.toEqual(original);
 await expect(page.locator('.ethnic-photo-image')).toHaveAttribute('src',/avatars\/ethnic-2\.png$/);
 await expect.poll(()=>page.locator('.ethnic-photo-image').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('.photo-credit')).toContainText('昵图网');
 await page.getByRole('button',{name:'常用选择',exact:true}).click();
 await page.getByLabel('搜索民族名称').fill('dulong');
 await expect(page.locator('.ethnic-option')).toHaveCount(1);
 await page.getByLabel('搜索民族名称').press('Enter');
 await expect(page.locator('.map-card h2')).toHaveText('独龙族人口分布');
 await page.keyboard.press('Control+k');
 await expect(page.getByLabel('全局民族搜索')).toBeFocused();
 await page.getByLabel('全局民族搜索').fill('not-an-ethnic');
 await expect(page.locator('.search-no-results')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('[role=dialog]')).not.toBeVisible();
 expect(errors).toEqual([]);
});

test('mobile global search and themed photo fit the screen',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('button',{name:'打开民族搜索'}).click();
 await page.getByLabel('全局民族搜索').fill('miao');
 await page.locator('.search-result').click();
 await expect(page.locator('.ethnic-photo')).toHaveAttribute('data-ethnic','苗族');
 await expect.poll(()=>page.locator('.ethnic-photo-image').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'民族介绍',exact:true}).click();
 await expect(page.locator('.ethnic-photo-large')).toBeVisible();
 await expect.poll(()=>page.locator('.ethnic-photo-image').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
