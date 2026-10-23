import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const records = JSON.parse(
  await readFile('data/raw/development/timeline/neac/sources.json', 'utf8'),
);
const directory = 'data/raw/culture';
await mkdir(directory, { recursive: true });
let cursor = 0;
const sources = [];
await Promise.all(
  Array.from({ length: 2 }, async () => {
    while (cursor < records.length) {
      const record = records[cursor++];
      const url = record.url.replace('/gk.shtml', '/fsxg.shtml');
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!response.ok) throw Error('HTTP ' + response.status);
        const bytes = Buffer.from(await response.arrayBuffer());
        const html = bytes.toString('utf8');
        const clean = (s) =>
          s
            .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;|&#160;/g, ' ')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/\s+/g, ' ')
            .trim();
        const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
        if (!title.includes('风俗')) throw Error('Unexpected page ' + title);
        const snapshot = directory + '/' + record.name + '.html';
        await writeFile(snapshot, bytes);
        sources.push({
          name: record.name,
          url: response.url,
          title,
          snapshot,
          sha256: createHash('sha256').update(bytes).digest('hex'),
          retrievedAt: new Date().toISOString(),
          text: clean(html).split('中央统战部')[0],
        });
      } catch (error) {
        console.log('FAILED', record.name, error.message);
      }
    }
  }),
);
await writeFile(
  directory + '/sources.json',
  JSON.stringify(
    sources.sort((a, b) => a.name.localeCompare(b.name)),
    null,
    2,
  ) + '\n',
);
console.log(`Saved ${sources.length}/${records.length} culture sources.`);
