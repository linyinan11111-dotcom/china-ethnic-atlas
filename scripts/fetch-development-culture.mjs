import { readFile, writeFile, mkdir } from 'node:fs/promises';
const photos = JSON.parse(await readFile('src/data/ethnic-photos.json', 'utf8'));
await mkdir('data/raw/development/culture', { recursive: true });
let cursor = 0;
const entries = Object.values(photos).filter((r) => r.name !== '汉族');
const records = [];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < entries.length) {
      const record = entries[cursor++];
      try {
        const id = record.photos[0].file.match(/ethnic-\d+/)[0];
        const raw = await readFile(`data/raw/photos/${id}.html`);
        const html = new TextDecoder('gb18030').decode(raw);
        const href = html.match(/href="(shao-2-[^"]+)"/i)?.[1];
        if (!href) throw Error('Missing culture link');
        const url = new URL(href, record.source).href;
        const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw Error('HTTP ' + response.status);
        await writeFile(
          `data/raw/development/culture/${id}.html`,
          Buffer.from(await response.arrayBuffer()),
        );
        records.push({
          name: record.name,
          url,
          snapshot: `data/raw/development/culture/${id}.html`,
        });
      } catch (error) {
        console.log(record.name, error.message);
      }
    }
  }),
);
await writeFile(
  'data/raw/development/culture/sources.json',
  JSON.stringify(records, null, 2) + '\n',
);
console.log(
  `Saved ${records.length}/55 cultural background sources; historical population figures are not used.`,
);
