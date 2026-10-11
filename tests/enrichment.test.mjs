import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ethnicNames,searchDirectory} from '../src/utils/ethnic-search.mjs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
test('2020 matrix joins all provinces, conserves every ethnic and district total, and matches independent national transcription',()=>{
 const census=read('public/data/population2020.json'),old=read('public/data/population.json');
 assert.equal(census.year,2020);assert.equal(census.regions.length,31);
 assert.deepEqual(census.regions.map(r=>r.code),old.regions.map(r=>r.code));
 const populations=JSON.parse(readFileSync('src/data/catalogue.ts','utf8').match(/const populations = (\[[^;]+\]);/)[1]);
 for(const [index,name] of ethnicNames.entries()){
  assert.equal(census.national.populations[name],populations[index],name);
  assert.equal(census.regions.reduce((s,r)=>s+(r.populations[name]??0),0),populations[index],name);
 }
 for(const region of [census.national,...census.regions]){
  assert.equal(Object.keys(region.populations).length,56);
  assert.equal(Object.values(region.populations).reduce((s,v)=>s+(v??0),0)+(region.unidentified??0)+(region.naturalized??0),region.total,region.name);
  for(const value of Object.values(region.populations))assert.ok(value===null||(Number.isInteger(value)&&value>=0));
 }
 const provenance=read('data/raw/census2020-ocr/verification.json');
 assert.equal(createHash('sha256').update(readFileSync(provenance.snapshot)).digest('hex'),provenance.sha256);
 assert.equal(census.regions.find(r=>r.code==='460000').populations['高山族'],121);
});
test('directory keeps name priority and intersects geographic and cultural filters',()=>{
 const groups=[{name:'白族',majorRegions:['云南'],culture:['扎染'],keywords:['大理白族自治州']},{name:'纳西族',majorRegions:['云南'],culture:['东巴文'],keywords:['文化与白族交流']},{name:'蒙古族',majorRegions:['内蒙古'],culture:['长调'],keywords:['草原']}];
 assert.deepEqual(searchDirectory(groups,'白族').map(g=>g.name),['白族']);
 assert.deepEqual(searchDirectory(groups,'大理').map(g=>g.name),['白族']);
 assert.deepEqual(searchDirectory(groups,'云南 扎染').map(g=>g.name),['白族']);
 assert.deepEqual(searchDirectory(groups,'',{region:'云南',topic:'文'}).map(g=>g.name),['纳西族']);
 assert.equal(searchDirectory(groups,'草原',{region:'云南'}).length,0);
});
test('representative places and recent cases retain exact textual evidence and unchanged snapshots',()=>{
 const places=read('src/data/cultural-places.json'),recent=read('src/data/recent-cases.json');
 assert.equal(new Set(places.map(p=>p.ethnic)).size,places.length);
 for(const place of places){assert.ok(place.coordinates[0]>=73&&place.coordinates[0]<=136);assert.ok(place.coordinates[1]>=18&&place.coordinates[1]<=54);assert.ok(place.code.startsWith(place.provinceCode.slice(0,2)));}
 for(const record of [...places.map(p=>({...p,sources:[{...p.source,evidence:p.evidence}]})),...recent])for(const source of record.sources){
  const bytes=readFileSync(source.snapshot);assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256);
  const text=bytes.toString('utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  assert.ok(text.includes(source.evidence),record.ethnic??record.name);
 }
});
