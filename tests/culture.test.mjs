import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ethnicNames} from '../src/utils/ethnic-search.mjs';
const profiles=JSON.parse(readFileSync('src/data/culture-profiles.json','utf8'));
const cache=new Map();
test('culture readers cover all groups, expose six topics and distinguish missing evidence',()=>{
 assert.deepEqual(profiles.map(row=>row.name).sort(),[...ethnicNames].sort());
 for(const profile of profiles){
  assert.deepEqual(profile.sections.map(section=>section.id),['language','festivals','food','architecture','clothing','arts']);
  assert.ok(profile.sections[0].sources.length,profile.name+' language');
  assert.ok(profile.sections.filter(section=>section.sources.length).length>=3,profile.name);
  for(const section of profile.sections)if(!section.sources.length)assert.equal(section.title,'待补充核查');
 }
 const korean=profiles.find(row=>row.name==='朝鲜族');
 assert.ok(korean.sections.some(section=>section.text.includes('温突儿邦')));
 assert.ok(korean.sections.some(section=>section.text.includes('冷面')));
 const bai=profiles.find(row=>row.name==='白族');
 assert.ok(bai.sections.some(section=>section.text.includes('三坊一照壁')));
});
test('every culture excerpt is backed by a preserved, unchanged source snapshot',()=>{
 for(const profile of profiles)for(const section of profile.sections)for(const source of section.sources){
  assert.match(source.url,/^https?:\/\//);
  if(!cache.has(source.snapshot)){
   const bytes=readFileSync(source.snapshot);
   const chinese=bytes.toString('utf8').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
   const english=new TextDecoder('gb18030').decode(bytes).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
   cache.set(source.snapshot,{hash:createHash('sha256').update(bytes).digest('hex'),chinese,english});
  }
  const record=cache.get(source.snapshot);
  assert.equal(record.hash,source.sha256,source.snapshot);
  assert.ok(record.chinese.includes(source.evidence)||record.english.includes(source.evidence),profile.name+' '+section.id+' evidence');
 }
});
