import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('data/raw', { recursive: true });
for (const url of process.argv.slice(2)) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`${r.status}: ${url}`);
  const path = 'data/raw/' + url.split('/').pop();
  await writeFile(path, new Uint8Array(await r.arrayBuffer()));
  console.log(path);
}
