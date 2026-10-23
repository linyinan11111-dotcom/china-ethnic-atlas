import { readFile } from 'node:fs/promises';
const sources = (
  await Promise.all(
    ['sources', 'fzxz-sources', 'lsyg-sources'].map(async (id) =>
      JSON.parse(await readFile('data/raw/development/timeline/neac/' + id + '.json', 'utf8')),
    ),
  )
).flat();
for (const [name, needles] of [
  ['回族', ['银川', '吴忠', '临夏', '郑州']],
  ['瑶族', ['金秀', '江华', '富川']],
  ['门巴族', ['墨脱', '隆子']],
])
  for (const needle of needles) {
    const r = sources.find(
      (r) =>
        r.name === name &&
        r.text
          .split('中央统战部')[0]
          .slice(r.text.indexOf('发展现状') + 4)
          .includes(needle),
    );
    console.log(name, needle, r?.url ?? 'NO');
  }
const places = JSON.parse(await readFile('src/data/cultural-places.json', 'utf8'));
console.log(places.map((p) => p.ethnic + ': ' + p.name).join('\n'));
