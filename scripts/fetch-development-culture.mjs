import { readFile, writeFile } from 'node:fs/promises';

const sourcesPath = 'data/raw/development/culture/sources.json';
const sources = JSON.parse(await readFile(sourcesPath, 'utf8'));
let cursor = 0;
let saved = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < sources.length) {
      const record = sources[cursor++];
      try {
        const response = await fetch(record.url, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw Error('HTTP ' + response.status);
        await writeFile(record.snapshot, Buffer.from(await response.arrayBuffer()));
        saved++;
      } catch (error) {
        console.log(record.name, error.message);
      }
    }
  }),
);
console.log(
  `Saved ${saved}/${sources.length} cultural background sources; historical population figures are not used.`,
);
