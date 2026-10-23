import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parseTaiwanReport } from '../scripts/taiwan-source.mjs';

test('Taiwan statistics match the official snapshot and its own denominator', async () => {
  const record = JSON.parse(await readFile('src/data/taiwan-indigenous.json', 'utf8'));
  const bytes = await readFile(record.snapshot);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256);
  const { retrievedAt, snapshot, sha256, ...statistics } = record;
  assert.deepEqual(parseTaiwanReport(bytes.toString('utf8')), statistics);
  assert.equal(record.period, '2026-09');
  assert.equal(record.publishedAt, '2026-10-08');
  assert.equal(record.population, 641332);
  assert.equal(record.totalPopulation, 23213251);
  assert.equal(Number(((record.population / record.totalPopulation) * 100).toFixed(2)), 2.76);
  assert.deepEqual(
    record.topRegions.map((r) => r.population),
    [95096, 92202, 79758],
  );
  const mainland = JSON.parse(await readFile('public/data/population.json', 'utf8'));
  assert.equal(mainland.regions.length, 31);
  assert(!mainland.regions.some((r) => r.code === '710000'));
  assert.equal(mainland.national.populations['高山族'], 4009);
});

test('Taiwan parser rejects a broken source or a mismatched denominator', async () => {
  const record = JSON.parse(await readFile('src/data/taiwan-indigenous.json', 'utf8'));
  const html = await readFile(record.snapshot, 'utf8');
  assert.throws(() => parseTaiwanReport('<html>官方来源暂不可用</html>'));
  assert.throws(() => parseTaiwanReport(html.replace('23,213,251', '1,000,000')));
});
