import { readFile, writeFile } from 'node:fs/promises';
const root = 'data/raw/census2020-ocr/';
const read = async (p) => JSON.parse(await readFile(root + p, 'utf8'));
const cells = await read('review.json'),
  values = (await read('review-values.json')).flat();
if (cells.length !== values.length) throw Error('Review count mismatch');
const repairs = cells.map((cell, i) => ({
  row: cell.row,
  group: cell.group,
  sex: 0,
  value: values[i],
  method: '逐格目视核对官方图片',
  snapshot: 'data/raw/A0104.jpg',
  reviewImage: root + 'review-' + Math.floor(i / 40) + '.png',
}));
await writeFile(root + 'corrections.json', JSON.stringify(repairs, null, 2));
console.log('Recorded', repairs.length, 'visual checks');
