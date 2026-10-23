import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { ethnicNames, provinceCodes, parsePopulation } from './fetch-data.mjs';
const data = JSON.parse(await readFile('public/data/population.json', 'utf8'));
const boundary = JSON.parse(await readFile('public/china-provinces.geojson', 'utf8'));
assert.equal(data.year, 2010);
assert.equal(data.regions.length, 31);
assert.equal(new Set(data.regions.map((r) => r.code)).size, 31);
const mapCodes = new Set(boundary.features.map((f) => String(f.properties.adcode)));
for (const r of data.regions) {
  assert(mapCodes.has(r.code), `Boundary missing: ${r.code}`);
  assert(provinceCodes.includes(r.code));
  assert.equal(Object.keys(r.populations).length, 56);
  assert(r.total > 0);
  for (const name of ethnicNames)
    assert(
      r.populations[name] === null ||
        (Number.isInteger(r.populations[name]) && r.populations[name] >= 0),
      `${r.name} ${name}`,
    );
  assert(
    Object.values(r.populations).reduce((s, p) => s + (p ?? 0), 0) <= r.total,
    `Over-count ${r.name}`,
  );
}
const parsed = parsePopulation(
  new TextDecoder('gb18030').decode(await readFile('data/raw/census2010.html')),
);
assert.deepEqual(parsed, data, 'Saved population data does not match source snapshot');
assert.equal(
  data.regions.reduce((s, r) => s + r.total, 0),
  data.national.total,
  'National/province totals mismatch',
);
for (const name of ethnicNames)
  assert.equal(
    data.regions.reduce((s, r) => s + (r.populations[name] ?? 0), 0),
    data.national.populations[name],
    `Ethnic sum mismatch ${name}`,
  );
const national2020 = JSON.parse(await readFile('src/data/national-population2020.json', 'utf8'));
assert.equal(national2020.length, 56);
assert.equal(
  national2020.reduce((s, p) => s + p, 0) + 836488 + 16595,
  1409778724,
  '2020 transcription sum mismatch',
);
console.log(
  `Validated 31 boundary joins, 56 ethnic groups, national/province sums, source snapshot and 2020 transcription. ${data.regions.reduce((s, r) => s + Object.values(r.populations).filter((p) => p === null).length, 0)} source blanks preserved.`,
);
