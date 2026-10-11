import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const parentUrl='https://www.gov.cn/zhengce/content/2021-06/10/content_5616457.htm';
const html=await readFile('data/raw/development/national-heritage-2021.html','utf8');
const urls=[...html.matchAll(/src="([^" ]*W020[^" ]+\.jpg)"/g)].map(m=>new URL(m[1],parentUrl).href);
await mkdir('data/raw/development/2021',{recursive:true});
const manifest=[];let cursor=0;
await Promise.all(Array.from({length:4},async()=>{while(cursor<urls.length){const i=cursor++;const url=urls[i];const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('HTTP '+response.status);const bytes=Buffer.from(await response.arrayBuffer());const file=`page-${String(i+1).padStart(2,'0')}.jpg`;await writeFile(`data/raw/development/2021/${file}`,bytes);manifest.push({page:i+1,file,url,sha256:createHash('sha256').update(bytes).digest('hex')});}}));
manifest.sort((a,b)=>a.page-b.page);await writeFile('data/raw/development/2021/sources.json',JSON.stringify(manifest,null,2)+'\n');console.log('Saved official 2021 attachment pages:',manifest.length);
