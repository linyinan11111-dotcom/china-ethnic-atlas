import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const selections=await json('scripts/culture-selections.json');
const culture=await json('data/raw/culture/sources.json');
const overview=await json('data/raw/development/timeline/neac/sources.json');
const history=await json('data/raw/development/timeline/neac/lsyg-sources.json');
const current=await json('data/raw/development/timeline/neac/fzxz-sources.json');
const translations=await json('scripts/culture-translations.json');
const english=await json('data/raw/development/culture/history-excerpts.json');
const heritageManifest=await json('data/raw/development/sources.json');
const heritage=[];
for(const record of heritageManifest.filter(row=>['national-heritage-2006','national-heritage-2008'].includes(row.id))){const bytes=await readFile('data/raw/development/'+record.id+'.html');const text=bytes.toString('utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();heritage.push({...record,snapshot:'data/raw/development/'+record.id+'.html',text});}
const labels=['语言文字','节庆习俗','饮食文化','建筑聚落','传统服饰','艺术技艺'];
const ids=['language','festivals','food','architecture','clothing','arts'];
const profiles=[];
let missing=0;
function body(source){const text=source.text.split('中央统战部')[0];const start=text.indexOf('发展现状');return (start>=0?text.slice(start+4):text).split(/（摘自|\(摘自/)[0].trim();}
for(const [name,...needles] of selections){
 const sections=[];
 for(const [index,needle] of needles.entries()){
  const translation=translations.find(row=>row.name===name&&row.id===ids[index]);
  if(translation){
   const record=english.find(row=>row.name===name);
   const bytes=await readFile(record.snapshot);
   const text=new TextDecoder('gb18030').decode(bytes).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
   const at=text.indexOf(translation.needle);
   if(at<0)throw Error(name+' translated evidence missing '+translation.needle);
   const evidence=text.slice(Math.max(0,at-20),at+translation.needle.length+350);
   sections.push({id:ids[index],label:labels[index],title:translation.title,text:translation.text,sourceType:'文化资料译述',sources:[{url:record.url,publisher:'中国网 · 民族资料',snapshot:record.snapshot,sha256:createHash('sha256').update(bytes).digest('hex'),retrievedAt:null,evidence}]});continue;
  }
  const sources=(index===0?[overview,culture,history,current]:[culture,overview,history,current]).map(rows=>rows.find(row=>row.name===name)).filter(Boolean);
  let source=needle?sources.find(row=>body(row).includes(needle)):undefined;
  if(!source&&index===5&&needle)source=heritage.find(row=>row.text.includes(needle));
  if(!source){missing++;console.log('MISSING',name,labels[index],needle);sections.push({id:ids[index],label:labels[index],title:'待补充核查',text:'当前选定资料尚不足以形成独立介绍，待补充具体地区的原文资料。',sources:[]});continue;}
  const content=body(source);
  const at=content.indexOf(needle);
  let start=at;while(start>0&&!/[。！？]/.test(content[start-1]))start--;
  let end=at+needle.length;while(end<content.length&&!/[。！？]/.test(content[end]))end++;
  const isHeritage=source.id?.startsWith('national-heritage-');
  const evidence=isHeritage?content.slice(Math.max(0,at-70),at+needle.length+100):content.slice(start,end+1).trim();
  if(at<0)throw Error(name+' '+needle+' is not in source body');
  const snapshot=await readFile(source.snapshot);
  sections.push({id:ids[index],label:labels[index],title:needle,text:isHeritage?`本民族专题收录的“${needle}”相关项目见国务院国家级非物质文化遗产名录。这是文化保护记录，具体项目名称与申报地区请阅读原文。`:evidence,sourceType:isHeritage?'文化保护名录':'传统文化资料摘读',sources:[{url:source.url,publisher:isHeritage?'国务院 · 中国政府网':'国家民族事务委员会',snapshot:source.snapshot,sha256:createHash('sha256').update(snapshot).digest('hex'),retrievedAt:source.retrievedAt,evidence}]});
 }
 profiles.push({name,updatedAt:'2026-10-10',sections});
}
if(process.argv.includes('--draft')){console.log('Draft',profiles.length,'groups, missing',missing);}
else{await writeFile('src/data/culture-profiles.json',JSON.stringify(profiles,null,2)+'\n');console.log('Built',profiles.length,'groups, missing',missing);}
