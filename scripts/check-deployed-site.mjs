import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const siteUrl = process.argv[2];
if (!siteUrl || !siteUrl.startsWith('https://'))
  throw new Error('Pass the deployed HTTPS website URL.');
const base = new URL(siteUrl.endsWith('/') ? siteUrl : siteUrl + '/');
async function fetchPublished(path) {
  const url = new URL(path, base);
  let failure;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status} at ${url}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      failure = error;
      if (attempt < 5) await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw failure;
}
const html = (await fetchPublished('')).toString('utf8');
if (!html.includes('id="app"') || !html.includes('山河同心'))
  throw new Error('The public response is not the atlas page.');
const avatars = JSON.parse(await readFile('src/data/ethnic-avatars.json', 'utf8'));
const files = [
  'data/population.json',
  'data/population2020.json',
  ...Object.values(avatars.records).map((record) => record.file),
];
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
for (let offset = 0; offset < files.length; offset += 6) {
  await Promise.all(
    files.slice(offset, offset + 6).map(async (path) => {
      const [published, source] = await Promise.all([
        fetchPublished(path),
        readFile('public/' + path),
      ]);
      if (digest(published) !== digest(source))
        throw new Error('Published content does not match the deployed source: ' + path);
    }),
  );
}
const assets = [...html.matchAll(/(?:src|href)="([^"\s]+\.(?:js|css))"/g)].map((match) => match[1]);
if (!assets.length) throw new Error('The public page has no application assets.');
await Promise.all(assets.map((asset) => fetchPublished(asset)));
console.log(
  `Verified ${base}: HTML, ${files.length} population/avatar files and ${assets.length} application assets.`,
);
