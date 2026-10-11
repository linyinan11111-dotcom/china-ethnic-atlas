import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const centers=await read('data/raw/admin-centers.json');
const manifests=await Promise.all(['data/raw/development/timeline/neac/sources.json','data/raw/development/timeline/neac/lsyg-sources.json','data/raw/development/timeline/neac/fzxz-sources.json','data/raw/culture/sources.json'].map(read));
const recentManifest=await read('data/raw/development/timeline/sources.json');
const yunnan=recentManifest.find(r=>r.id==='recent-yunnan');
const heritageManifest=await read('data/raw/development/sources.json');
const heritage=heritageManifest.find(r=>r.id==='national-heritage-2008');
const clean=html=>html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
manifests.push([{...yunnan,name:'汉族',text:clean(await readFile(yunnan.snapshot,'utf8'))},{...heritage,name:'高山族',snapshot:'data/raw/development/national-heritage-2008.html',publisher:'国务院 · 中国政府网',text:clean(await readFile('data/raw/development/national-heritage-2008.html','utf8'))}]);
// These are administrative reference points, never exact village/heritage-site coordinates.
const selections=[['汉族',440300,'深圳'],['蒙古族',152500,'锡林郭勒'],['回族',640300,'吴忠'],['藏族',540100,'拉萨'],['维吾尔族',653100,'喀什'],['苗族',522600,'黔东南'],['彝族',513400,'凉山'],['壮族',451000,'百色'],['布依族',522700,'黔南'],['朝鲜族',222400,'延边'],['满族',210422,'新宾'],['侗族',450226,'三江'],['瑶族',451129,'金秀'],['白族',532900,'大理'],['土家族',433100,'湘西'],['哈尼族',532500,'红河'],['哈萨克族',654000,'伊犁'],['傣族',532800,'西双版纳'],['黎族',469001,'五指山'],['傈僳族',533300,'怒江'],['佤族',530927,'沧源'],['畲族',331127,'景宁'],['高山族',350629,'华安'],['拉祜族',530828,'澜沧'],['水族',522732,'三都'],['东乡族',622926,'东乡族自治县'],['纳西族',530700,'丽江'],['景颇族',533100,'德宏'],['柯尔克孜族',653000,'克孜勒苏'],['土族',630223,'互助'],['达斡尔族',150722,'莫力达瓦'],['仫佬族',451225,'罗城'],['羌族',513200,'阿坝'],['布朗族',532822,'勐海'],['撒拉族',630225,'循化'],['毛南族',451226,'环江'],['仡佬族',520326,'务川'],['锡伯族',654022,'察布查尔'],['阿昌族',533122,'梁河'],['普米族',530724,'宁蒗'],['塔吉克族',653131,'塔什库尔干'],['怒族',533324,'贡山'],['乌孜别克族',650100,'乌鲁木齐'],['俄罗斯族',654200,'塔城'],['鄂温克族',150724,'鄂温克族自治旗'],['德昂族',533103,'芒市'],['保安族',622927,'积石山'],['裕固族',620721,'肃南'],['京族',450681,'东兴'],['塔塔尔族',654002,'伊宁'],['独龙族',533324,'贡山'],['鄂伦春族',150723,'鄂伦春自治旗'],['赫哲族',230881,'同江'],['门巴族',540529,'隆子'],['珞巴族',540426,'朗县'],['基诺族',532801,'景洪']];
const result=[];
const overrides={汉族:[530114,'呈贡'],回族:[622900,'临夏'],瑶族:[451324,'金秀'],门巴族:[540423,'墨脱']};
for(let [ethnic,code,needle] of selections){
 if(overrides[ethnic])[code,needle]=overrides[ethnic];
 const center=centers.find(c=>c.adcode===code);
 const source=manifests.flatMap(rows=>rows.filter(r=>r.name===ethnic)).find(r=>{const text=r.text.split('中央统战部')[0];return text.slice(text.indexOf('发展现状')+4).includes(needle);});
 if(!center||!source){console.log('UNRESOLVED',ethnic,code,needle);continue;}
 if(!center.name.includes(needle))throw Error('Administrative code does not match selected place '+ethnic+' '+center.name+' '+needle);
 const content=source.text.split('中央统战部')[0];const at=content.lastIndexOf(needle);
 let ancestor=center;while(ancestor.level!=='province'&&ancestor.parent)ancestor=centers.find(c=>c.adcode===ancestor.parent);
 const bytes=await readFile(source.snapshot);
 result.push({id:ethnic+'-'+code,ethnic,name:center.name,code:String(code),provinceCode:String(ancestor.adcode),coordinates:[center.lng,center.lat],kind:center.level==='city'?'州 / 市代表点':'县 / 区 / 旗代表点',evidence:content.slice(Math.max(0,at-70),at+needle.length+100),source:{url:source.url,publisher:source.publisher??'国家民族事务委员会',snapshot:source.snapshot,sha256:createHash('sha256').update(bytes).digest('hex')},coordinateSource:'https://geo.datav.aliyun.com/areas_v3/bound/all.json',updatedAt:'2026-10-10'});
}
await writeFile('src/data/cultural-places.json',JSON.stringify(result,null,2)+'\n');console.log('Built',result.length,'verified representative places');
