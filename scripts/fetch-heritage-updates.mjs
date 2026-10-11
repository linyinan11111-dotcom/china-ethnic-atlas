import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sources=[
 ['national-heritage-2011','https://www.gov.cn/zwgk/2011-06/09/content_1880635.htm'],
 ['national-heritage-2014','https://www.gov.cn/zhengce/content/2014-12/03/content_9286.htm'],
 ['national-heritage-2021','https://www.gov.cn/zhengce/content/2021-06/10/content_5616457.htm'],
];
await mkdir('data/raw/development',{recursive:true});
const manifest=JSON.parse(await readFile('data/raw/development/sources.json','utf8'));
for(const [id,url] of sources){
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  const text=bytes.toString('utf8');const title=text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if(!title?.includes('非物质文化遗产'))throw Error('Unexpected page: '+title);
  await writeFile(`data/raw/development/${id}.html`,bytes);
  const record={id,url:response.url,title,sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:new Date().toISOString()};
  const index=manifest.findIndex(r=>r.id===id);if(index>=0)manifest[index]=record;else manifest.push(record);
  console.log(id,title,bytes.length);
 }catch(error){console.log(id,error.message);process.exitCode=1;}
}
await writeFile('data/raw/development/sources.json',JSON.stringify(manifest,null,2)+'\n');
