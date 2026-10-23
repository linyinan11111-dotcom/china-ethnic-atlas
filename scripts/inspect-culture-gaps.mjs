import { readFile } from 'node:fs/promises';
const sources = JSON.parse(await readFile('data/raw/culture/sources.json', 'utf8'));
const overview = JSON.parse(
  await readFile('data/raw/development/timeline/neac/sources.json', 'utf8'),
);
const patterns = {
  节庆: /[^。！？]{0,50}(?:过年|年节|节日|过节|佳节|古尔|开斋|撒班|泼水)[^。！？]{0,100}[。！？]/g,
  饮食: /[^。！？]{0,35}(?:吃|饭|食物|米|麦|酸|奶)[^。！？]{0,100}[。！？]/g,
  建筑: /[^。！？]{0,35}(?:住|房|屋|庭院|土木)[^。！？]{0,100}[。！？]/g,
  服饰: /[^。！？]{0,35}(?:穿|帽|衣|服饰|披|裙)[^。！？]{0,100}[。！？]/g,
  艺术: /[^。！？]{0,35}(?:歌|舞|艺术|民间文学|织|绣|乐器)[^。！？]{0,100}[。！？]/g,
};
for (const arg of process.argv.slice(2)) {
  const [name, label] = arg.split(':');
  const source = sources.find((x) => x.name === name) ?? overview.find((x) => x.name === name);
  console.log(
    name,
    label,
    [...source.text.matchAll(patterns[label])]
      .slice(0, 5)
      .map((m) => m[0])
      .join(' | '),
  );
}
