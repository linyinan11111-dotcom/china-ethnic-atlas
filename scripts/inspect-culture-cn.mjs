import {readFile} from 'node:fs/promises';
const culture=JSON.parse(await readFile('data/raw/culture/sources.json','utf8'));
const overview=JSON.parse(await readFile('data/raw/development/timeline/neac/sources.json','utf8'));
const specs=[['语言',/[^。！？]{0,35}(?:语言属于|语言是|语言为|语属|语言通称|使用.*?语)[^。！？]{0,110}[。！？]/],['节庆',/[^。！？]{0,20}(?:节日|泼水节|火把节|春节|端节)[^。！？]{0,140}[。！？]/],['饮食',/[^。！？]{0,25}(?:主食|饮食|冷面|三道茶|酸茶)[^。！？]{0,140}[。！？]/],['建筑',/[^。！？]{0,25}(?:建筑|房屋|民居|干栏|毡房)[^。！？]{0,140}[。！？]/],['服饰',/[^。！？]{0,25}(?:服饰|服装|衣着|穿着)[^。！？]{0,140}[。！？]/],['艺术',/[^。！？]{0,25}(?:舞蹈|民歌|文学|乐器|织锦|刺绣|音乐|剪纸)[^。！？]{0,140}[。！？]/]];
for(const item of overview.filter(x=>!process.argv[2]||process.argv.slice(2).includes(x.name))){
 const c=culture.find(x=>x.name===item.name)?.text??item.text;
 console.log(item.name,specs.map(([label,regex])=>label+':'+((label==='语言'?item.text:c).match(regex)?.[0]??'缺')).join(' | '));
}
