import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const clean=s=>s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
if(process.argv[2]==='links'){
 const url=process.argv[3];const h=await(await fetch(url)).text();
 for(const m of h.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/g)){
  const label=clean(m[2]);if(new RegExp(process.argv[4]||'.').test(label))console.log(new URL(m[1],url).href,label);
 }
}else if(process.argv[2]==='search'){
 for(const query of process.argv.slice(3)){
  const url='https://www.bing.com/search?q='+encodeURIComponent(query);
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
  const html=await response.text();
  console.log('\nQUERY',query);
  const results=[...html.matchAll(/<li class="b_algo"[\s\S]*?<\/li>/g)];
  for(const [i,item] of results.slice(0,6).entries()){
   let href=item[0].match(/<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"/)?.[1]?.replace(/&amp;/g,'&');
   if(href?.includes('bing.com/ck/')){const u=new URL(href).searchParams.get('u');if(u?.startsWith('a1'))href=Buffer.from(u.slice(2),'base64').toString();}
   console.log(i,href,clean(item[0]));
  }
 }
}else if(process.argv[2]==='ethnics'){
 const base='https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml';
 const h=await(await fetch(base)).text();
 const section=process.argv[3]||'gk';
 const tasks=[...h.matchAll(/<a[^>]*href=["']([^"']+\/gk.shtml)["'][^>]*>([\s\S]*?)<\/a>/g)].map(m=>({name:clean(m[2]),url:new URL(m[1].replace('gk.shtml',section+'.shtml'),base).href}));
 await mkdir('data/raw/development/timeline/neac',{recursive:true});
 const records=[];let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<tasks.length){
  const task=tasks[cursor++];const r=await fetch(task.url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(task.name+' '+r.status);
  const bytes=Buffer.from(await r.arrayBuffer());const html=bytes.toString('utf8');
  const title=clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??'');
  if(title==='国家民族事务委员会'){console.log('SKIPPED',task.name,section,'site homepage returned');continue;}
  const snapshot=`data/raw/development/timeline/neac/${task.name}-${section}.html`;await writeFile(snapshot,bytes);
  const text=clean(html);const dated=[...text.matchAll(/[^。！？]{0,100}(?:18|19|20)\d{2}\s*年[^。！？]{0,260}[。！？]/g)].map(m=>m[0].trim());
  records.push({...task,url:r.url,snapshot,sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:new Date().toISOString(),title,dated,text});
  console.log(task.name,dated.filter(s=>/成立|建立|通车|修建|生产|改革|恢复|1979|教育|198|19[567]\d/.test(s)).slice(-9).join(' | '));
 }}));
 await writeFile(`data/raw/development/timeline/neac/${section}-sources.json`,JSON.stringify(records.sort((a,b)=>a.name.localeCompare(b.name)),null,2)+'\n');
}else{
 await mkdir('data/raw/development/timeline',{recursive:true});
 const manifest=JSON.parse(await readFile('data/raw/development/timeline/sources.json','utf8').catch(()=>'[]'));
 const tasks=process.argv.slice(2).map(arg=>{const index=arg.indexOf('=');return [arg.slice(0,index),arg.slice(index+1)];});
 const settled=await Promise.allSettled(tasks.map(async([id,url])=>{
  const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(id+' HTTP '+r.status);
  const bytes=Buffer.from(await r.arrayBuffer());
  const utf=bytes.toString('utf8');const html=new TextDecoder(/charset=["']?gb/i.test(utf.slice(0,5000))?'gb18030':'utf-8').decode(bytes);
  const snapshot=`data/raw/development/timeline/${id}.html`;
  await writeFile(snapshot,bytes);
  const text=clean(html);await writeFile(`data/raw/development/timeline/${id}.txt`,text);
  const record={id,url:r.url,snapshot,sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:new Date().toISOString(),title:clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??'')};
  console.log(id,record.title,text.slice(0,18000));return record;
 }));
 for(const result of settled){if(result.status==='fulfilled'){const index=manifest.findIndex(x=>x.id===result.value.id);if(index>=0)manifest[index]=result.value;else manifest.push(result.value);}else console.log('FAILED',result.reason.message);}
 await writeFile('data/raw/development/timeline/sources.json',JSON.stringify(manifest,null,2)+'\n');
}
