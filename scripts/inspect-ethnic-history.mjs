import {readFile,writeFile} from 'node:fs/promises';
const sources=JSON.parse(await readFile('data/raw/development/culture/sources.json','utf8'));
const records=[];
for(const source of sources){
 const raw=await readFile(source.snapshot);
 const text=new TextDecoder('gb18030').decode(raw).replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&quot;|&#160;/g,' ').replace(/\s+/g,' ');
 const dated=[...text.matchAll(/[^.!?]{0,200}\b(?:18|19|20)\d{2}\b[^.!?]{0,260}[.!?]/g)].map(m=>m[0].trim());
 records.push({...source,dated,text});
}
await writeFile('data/raw/development/culture/history-excerpts.json',JSON.stringify(records,null,2)+'\n');
for(const record of records)console.log(record.name,record.dated.filter(s=>/autonom|establish|founded|197|198|recogniz|road|railway|bridge/i.test(s)).slice(0,3).join(' | ')||record.dated.slice(-2).join(' | '));
