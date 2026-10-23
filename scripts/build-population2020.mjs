import { readFile, writeFile } from 'node:fs/promises';
import { ethnicNames } from '../src/utils/ethnic-search.mjs';
import { createHash } from 'node:crypto';
const root = 'data/raw/census2020-ocr/';
const json = async (p) => JSON.parse((await readFile(p, 'utf8')).replace(/^\uFEFF/, ''));
const metadata = await json(root + 'panels.json');
const rowY = [
  190, 254, 286, 318, 350, 382, 446, 478, 510, 574, 606, 638, 670, 702, 734, 766, 830, 862, 894,
  926, 958, 990, 1054, 1086, 1118, 1150, 1182, 1246, 1278, 1310, 1342, 1374,
];
const raw = Array.from({ length: 32 }, () => Array.from({ length: 59 }, () => [null, null, null]));
for (const panel of metadata) {
  const words = await json(root + panel.name + '.json');
  const cells = new Map();
  for (const word of words) {
    const x = panel.start + (word.x + word.width / 2) / panel.scale,
      y = panel.top + (word.y + word.height / 2) / panel.scale;
    const row = rowY.findIndex((center) => Math.abs(y - center) < 12),
      col = Math.floor((x - 72) / 86);
    if (row < 0 || col < 0 || col >= 177) continue;
    const key = row + ':' + col;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(word);
  }
  for (const [key, words] of cells) {
    const [row, col] = key.split(':').map(Number);
    const text = words
      .sort((a, b) => a.x - b.x)
      .map((w) => w.text)
      .join('')
      .replace(/[，,\s]/g, '');
    if (/^\d+$/.test(text)) raw[row][Math.floor(col / 3)][col % 3] = Number(text);
  }
}
const repairs = await json(root + 'corrections.json').catch(() => []);
for (const item of repairs) raw[item.row][item.group][item.sex] = item.value;
const issues = [];
for (let row = 0; row < 32; row++)
  for (let group = 0; group < 59; group++) {
    const [total, male, female] = raw[row][group];
    if (total !== null && male !== null && female !== null && total !== male + female)
      issues.push({
        row,
        group,
        name: group === 0 ? '合计' : (ethnicNames[group - 1] ?? '特殊项目'),
        values: raw[row][group],
        issue: 'subtotal',
      });
  }
for (let group = 0; group < 59; group++) {
  const total = raw[0][group][0],
    sum = raw.slice(1).reduce((s, r) => s + (r[group][0] ?? 0), 0);
  if (total !== sum)
    issues.push({
      group,
      name: group === 0 ? '合计' : (ethnicNames[group - 1] ?? '特殊项目'),
      total,
      sum,
      difference: (total ?? 0) - sum,
      issue: 'province-sum',
    });
}
for (let row = 1; row < 32; row++) {
  const total = raw[row][0][0],
    sum = raw[row].slice(1).reduce((s, g) => s + (g[0] ?? 0), 0);
  if (total !== sum)
    issues.push({ row, total, sum, difference: (total ?? 0) - sum, issue: 'row-sum' });
}
await writeFile(root + 'matrix-draft.json', JSON.stringify(raw));
await writeFile(root + 'issues.json', JSON.stringify(issues, null, 2));
console.log(
  'OCR review:',
  raw.flat(2).filter((v) => v !== null).length,
  'numeric cells;',
  issues.filter((i) => i.issue !== 'subtotal').length,
  'total-column issues;',
  issues.filter((i) => i.issue === 'subtotal').length,
  'gender diagnostics (not published).',
);
if (process.argv.includes('--publish')) {
  const fatal = issues.filter((item) => item.issue !== 'subtotal');
  if (fatal.length) throw Error('Population totals have unresolved issues');
  const ink = await json(root + 'ink.json');
  for (const cell of ink)
    if (cell.ink && raw[cell.row][cell.group][0] === null)
      throw Error('A printed total cell is still missing');
  const old = await json('public/data/population.json');
  const official = await json('src/data/national-population2020.json');
  ethnicNames.forEach((name, i) => {
    if (raw[0][i + 1][0] !== official[i]) throw Error('National ethnic total mismatch ' + name);
  });
  const sourceUrl = 'https://www.stats.gov.cn/sj/pcsj/rkpc/7rp/zk/html/A0104.jpg';
  const region = (index, template) => ({
    ...template,
    year: 2020,
    total: raw[index][0][0],
    populations: Object.fromEntries(ethnicNames.map((name, i) => [name, raw[index][i + 1][0]])),
    unidentified: raw[index][57][0],
    naturalized: raw[index][58][0],
    sourceId: 'census2020-A0104',
  });
  const output = {
    year: 2020,
    sourceUrl,
    updatedAt: '2026-10-10',
    national: region(0, old.national),
    regions: old.regions.map((r, i) => region(i + 1, r)),
  };
  await writeFile('public/data/population2020.json', JSON.stringify(output, null, 2) + '\n');
  const bytes = await readFile('data/raw/A0104.jpg');
  await writeFile(
    root + 'verification.json',
    JSON.stringify(
      {
        sourceUrl,
        snapshot: 'data/raw/A0104.jpg',
        sha256: createHash('sha256').update(bytes).digest('hex'),
        checkedAt: '2026-10-10',
        method: 'Windows OCR预读；307格目视核对；仅发布小计列；男女人口识别列不发布',
        checks: [
          '31省级地区合计等于全国总计',
          '56民族逐列省级合计等于全国小计',
          '每省含未识别民族与入籍外国人的横向合计一致',
          '56民族全国值与A0201独立转录一致',
          '所有有印刷数字的小计单元格非缺失',
        ],
        gendersPublished: false,
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Published verified 2020 totals for 31 provinces and 56 groups');
}
