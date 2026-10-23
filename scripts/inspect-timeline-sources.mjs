import { readFile } from 'node:fs/promises';
const sources = JSON.parse(
  await readFile('data/raw/development/timeline/neac/fzxz-sources.json', 'utf8'),
);
const names = process.argv.slice(2);
for (const source of sources.filter((x) => names.includes(x.name))) {
  const text = source.text.split('中央统战部')[0];
  const dated = [
    ...text.matchAll(/[^。！？]{0,90}(?:18|19|20)\d{2}\s*年[^。！？]{0,200}[。！？]/g),
  ].map((m) => m[0].trim());
  console.log(
    source.name,
    dated
      .filter((s) => /成立|建立|通车|修建|改革|恢复|教育|文化|图书|工业|保护|水利|198|199/.test(s))
      .join(' | '),
  );
}
