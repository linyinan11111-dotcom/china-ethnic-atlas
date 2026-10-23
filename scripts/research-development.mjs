import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const sources = [
  ['national-heritage-2008', 'https://www.gov.cn/zwgk/2008-06/14/content_1016331.htm'],
  ['national-heritage-2006', 'https://www.gov.cn/zwgk/2006-06/02/content_297946.htm'],
  ['muqam', 'https://ich.unesco.org/en/RL/uyghur-muqam-of-xinjiang-00109'],
  ['dong-song', 'https://ich.unesco.org/en/RL/grand-song-of-the-dong-ethnic-group-00202'],
  ['long-song', 'https://ich.unesco.org/en/RL/urtiin-duu-traditional-folk-long-song-00115'],
  [
    'korean-dance',
    'https://ich.unesco.org/en/RL/farmers-dance-of-chinas-korean-ethnic-group-00213',
  ],
  ['tibetan-opera', 'https://ich.unesco.org/en/RL/tibetan-opera-00208'],
  ['qiang-new-year', 'https://ich.unesco.org/en/USL/qiang-new-year-festival-00305'],
  ['manas', 'https://ich.unesco.org/en/RL/manas-00209'],
];
await mkdir('data/raw/development', { recursive: true });
const existing = JSON.parse(
  await readFile('data/raw/development/sources.json', 'utf8').catch(() => '[]'),
);
const manifest = existing.filter((record) => !sources.some(([id]) => id === record.id));
let cursor = 0;
let fetched = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < sources.length) {
      const [id, url] = sources[cursor++];
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
        if (!response.ok) throw Error('HTTP ' + response.status);
        const bytes = Buffer.from(await response.arrayBuffer());
        await writeFile(`data/raw/development/${id}.html`, bytes);
        const html = new TextDecoder('utf-8').decode(bytes);
        const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
        manifest.push({
          id,
          url: response.url,
          title,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          retrievedAt: new Date().toISOString(),
        });
        fetched++;
        console.log(id, title, bytes.length);
      } catch (error) {
        console.log(id, error.message);
      }
    }
  }),
);
await writeFile('data/raw/development/sources.json', JSON.stringify(manifest, null, 2) + '\n');
if (fetched !== sources.length) throw Error('Some development sources could not be fetched.');
