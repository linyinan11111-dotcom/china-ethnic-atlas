import { readFile, writeFile } from 'node:fs/promises';
const provinces =
  '北京 天津 河北 山西 内蒙古 辽宁 吉林 黑龙江 上海 江苏 浙江 安徽 福建 江西 山东 河南 湖北 湖南 广东 广西 海南 重庆 四川 贵州 云南 西藏 陕西 甘肃 青海 宁夏 新疆 香港 澳门 中国 文化部'.split(
    ' ',
  );
const all = [];
for (const year of [2008, 2011, 2014]) {
  const text = await readFile(`data/raw/development/text-${year}.txt`, 'utf8');
  const boundary = text.lastIndexOf(
    year === 2008
      ? '第一批国家级非物质文化遗产扩展项目名录'
      : year === 2011
        ? '国家级非物质文化遗产扩展项目名录'
        : '国家级非物质文化遗产代表性项目名录扩展项目名录',
  );
  const matches = [...text.matchAll(/(?:^|\s)(\d{1,4})\s+([ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩIVX]+[-—－]\d+)\s+/g)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const excerpt = text.slice(m.index + m[0].length, matches[i + 1]?.index ?? text.length).trim();
    const cut = Math.min(...provinces.map((p) => excerpt.indexOf(p)).filter((pos) => pos > 0));
    const project = excerpt.slice(0, Number.isFinite(cut) ? cut : 200).trim();
    all.push({
      year,
      kind: m.index > boundary && boundary > 0 ? 'extension' : 'new',
      number: m[1],
      code: m[2],
      project,
      excerpt: excerpt.slice(0, 600),
    });
  }
}
await writeFile('data/raw/development/candidates.json', JSON.stringify(all, null, 2) + '\n');
const source = await readFile('src/data/development.ts', 'utf8');
const names = [...source.matchAll(/\['([^']+族)'/g)].map((m) => m[1]);
for (const name of names) {
  const token = name === '蒙古族' ? '蒙古' : name;
  console.log(
    name,
    all
      .filter((r) => r.project.includes(token))
      .map((r) => `${r.year} ${r.kind} ${r.code} ${r.project}`)
      .join(' | '),
  );
}
