import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import {ethnicNames} from '../src/utils/ethnic-search.mjs';
const json=path=>JSON.parse(readFileSync(path,'utf8'));
const cache=new Map();
function load(path){
 path=resolve(path);if(cache.has(path))return cache.get(path);
 const exports={};cache.set(path,exports);
 const code=ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 vm.runInNewContext(code,{exports,require:id=>id.endsWith('.json')?{default:json(resolve(dirname(path),id))}:load(resolve(dirname(path),id+'.ts'))});
 return exports;
}
const {ethnicTimelines}=load('src/data/ethnic-timeline.ts');
const milestones=json('src/data/ethnic-milestones.json');

test('all 56 timelines have sourced individual history, variable chronology and unique same-year IDs',()=>{
 assert.deepEqual(Object.keys(ethnicTimelines).sort(),[...ethnicNames].sort());
 assert.equal(new Set(milestones.map(item=>item.name)).size,56);
 assert.ok(new Set(Object.values(ethnicTimelines).map(events=>events.map(item=>item.year).join(','))).size>40);
 assert.ok(new Set(Object.values(ethnicTimelines).map(events=>events.length)).size>3);
 for(const [name,events] of Object.entries(ethnicTimelines)){
  assert.ok(milestones.filter(item=>item.name===name).length>=2,name);
  assert.equal(new Set(events.map(item=>item.id)).size,events.length,name);
  for(const [i,event] of events.entries()){
   assert.ok(i===0||event.year>=events[i-1].year,name);
   assert.ok(event.region&&event.text&&event.title&&event.sources.length,name);
   assert.ok(event.sources.every(source=>/^https?:\/\//.test(source.url)&&source.publisher));
  }
 }
 const bai=ethnicTimelines['白族'];
 assert.equal(bai.filter(item=>item.year===1982).length,2);
 assert.ok(bai.some(item=>item.year===1995&&item.title.includes('机场')));
 assert.ok(ethnicTimelines['达斡尔族'].some(item=>item.year===1982&&item.title.includes('亚洲杯')));
 assert.ok(ethnicTimelines['独龙族'].some(item=>item.year===1999&&item.title.includes('公路')));
 assert.ok(ethnicTimelines['高山族'].find(item=>item.year===2004).region.includes('台湾'));
 assert.ok(ethnicTimelines['高山族'].find(item=>item.year===2008).region.includes('大陆'));
});

test('each historical milestone retains evidence in a preserved snapshot and verified source URL',()=>{
 const manifests=['data/raw/development/culture/sources.json',...['sources','fzxz-sources','lsyg-sources'].map(id=>'data/raw/development/timeline/neac/'+id+'.json')].flatMap(path=>json(path));
 const checked=new Set();
 for(const item of milestones){
  for(const source of item.sources){
   const bytes=readFileSync(source.snapshot);
   const encoding=source.publisher.startsWith('中国网')?'gb18030':'utf-8';
   const text=new TextDecoder(encoding).decode(bytes).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,'');
   assert.ok(text.includes(source.evidence.replace(/\s+/g,'')),`${item.name} ${item.year} ${item.title}`);
   const manifest=manifests.find(record=>record.snapshot===source.snapshot);
   if(manifest){
    assert.equal(source.url,manifest.url);
    if(manifest.sha256&&!checked.has(source.snapshot))assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);
    checked.add(source.snapshot);
   }else assert.equal(source.snapshot,'data/raw/content_5597952.htm');
  }
 }
});
