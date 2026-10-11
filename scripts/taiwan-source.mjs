import assert from 'node:assert/strict';
export const taiwanSourceUrl='https://www.moi.gov.tw/News_Content.aspx?n=9&sms=9009&s=342353';
const number=text=>Number(text.replaceAll(',',''));
export function parseTaiwanReport(html){
 const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 const period=text.match(/民國(\d+)年(\d+)月戶口統計資料分析/);
 const overall=text.match(/二、\s*\d+年\d+月底人口數為([\d,]+)人/);
 const section=text.match(/九、\s*([\s\S]*?)(?=十、)/)?.[1];
 assert(period&&overall&&section,'Official household report structure changed');
 const population=section.match(/原住民人口數為([\d,]+)人/);
 const share=section.match(/占總人口比率([\d.]+)%/);
 const top=[...section.matchAll(/(花蓮縣|桃園市|臺東縣)([\d,]+)人/g)].map(m=>({name:m[1],population:number(m[2])}));
 const smallest=[...section.matchAll(/(連江縣|澎湖縣|金門縣)[^\d]*([\d,]+)人/g)].map(m=>({name:m[1],population:number(m[2])}));
 assert(population&&share&&top.length===3&&smallest.length===3,'Indigenous statistics incomplete');
 const total=number(overall[1]),count=number(population[1]);
 assert.equal(Number((count/total*100).toFixed(2)),Number(share[1]),'Official population and percentage disagree');
 const release=text.match(/發布日期：\s*(\d+)-(\d+)-(\d+)/);
 assert(release,'Publication date missing');
 return {period:`${Number(period[1])+1911}-${period[2].padStart(2,'0')}`,publishedAt:`${Number(release[1])+1911}-${release[2]}-${release[3]}`,title:period[0],publisher:'台湾内政部门 · 户政司',category:'原住民户籍登记人口',population:count,totalPopulation:total,share:Number(share[1]),topRegions:top,smallestRegions:smallest,sourceUrl:taiwanSourceUrl};
}
