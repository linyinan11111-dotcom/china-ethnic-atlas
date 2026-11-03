import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ethnicNames, ethnicSearchIndex, searchEthnics } from '../src/utils/ethnic-search.mjs';
import { ethnicThemes, getEthnicTheme } from '../src/utils/themes.mjs';
import { readFile } from 'node:fs/promises';

const groups = ethnicNames.map((name) => ({ name }));
test('all 56 ethnic groups have a distinct theme and ordered map palette', () => {
  assert.equal(Object.keys(ethnicThemes).length, 56);
  assert.equal(new Set(Object.values(ethnicThemes).map((t) => t.accent)).size, 56);
  for (const name of ethnicNames) {
    const theme = getEthnicTheme(name);
    assert.match(theme.accent, /^#[0-9a-f]{6}$/i);
    assert.equal(theme.palette.length, 5);
    assert.equal(theme.palette[4], theme.accent);
  }
});
test('search accepts names, pinyin, initials, mixed case and accents', () => {
  for (const name of ethnicNames) {
    assert.equal(searchEthnics(groups, ethnicSearchIndex[name].pinyin)[0].name, name);
  }
  assert.equal(searchEthnics(groups, 'Měng Gǔ Zú')[0].name, '蒙古族');
  assert.equal(searchEthnics(groups, 'mgz')[0].name, '蒙古族');
  assert.equal(searchEthnics(groups, 'weiwuer')[0].name, '维吾尔族');
  assert.equal(searchEthnics(groups, '仡佬')[0].name, '仡佬族');
  assert.equal(searchEthnics(groups, 'huanghuanghuang').length, 0);
  assert.equal(searchEthnics(groups, '').length, 56);
});
test('all 56 ethnic groups have a distinct local avatar illustration', async () => {
  const catalogue = JSON.parse(await readFile('src/data/ethnic-avatars.json', 'utf8'));
  const records = catalogue.records;
  assert.equal(Object.keys(records).length, 56);
  const files = new Set();
  for (const name of ethnicNames) {
    const record = records[name];
    assert.equal(record.name, name);
    assert.match(record.source, /^https?:\/\//);
    assert(record.publisher);
    assert.equal(record.file, 'avatars/' + getEthnicTheme(name).id + '.png');
    assert(!files.has(record.file));
    files.add(record.file);
    const bytes = await readFile('public/' + record.file);
    assert.equal(bytes[0], 0x89);
    assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
    assert(bytes.length > 100);
  }
});
