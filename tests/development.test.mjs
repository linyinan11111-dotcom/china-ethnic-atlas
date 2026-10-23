import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import ts from 'typescript';
import { ethnicNames } from '../src/utils/ethnic-search.mjs';
const cultureSources = JSON.parse(
  await readFile('data/raw/development/culture/sources.json', 'utf8'),
);
const additions = JSON.parse(await readFile('src/data/heritage-additions.json', 'utf8'));
const source = await readFile('src/data/development.ts', 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const context = {
  exports: {},
  require: (id) => {
    if (id === './heritage-additions.json') return { default: additions };
    if (id.endsWith('sources.json')) return { default: cultureSources };
    if (id === './reform')
      return { reformSource: 'https://www.gov.cn/zhengce/2021-04/06/content_5597952.htm' };
    throw Error('Unexpected import: ' + id);
  },
};
vm.runInNewContext(code, context);
const records = Object.values(context.exports.ethnicDevelopment);
const clean = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
test('all 56 groups have distinct development context and a dated, verified heritage achievement', async () => {
  assert.deepEqual(records.map((r) => r.name).sort(), [...ethnicNames].sort());
  assert.equal(new Set(records.map((r) => r.path)).size, 56);
  const first = clean(await readFile('data/raw/development/national-heritage-2006.html', 'utf8'));
  const second = clean(await readFile('data/raw/development/national-heritage-2008.html', 'utf8'));
  for (const record of records) {
    assert.ok(record.place && record.feature && record.path, record.name);
    assert.ok(record.achievements.length >= 1, record.name);
    const item = record.achievements.find(
      (item) => item.title === record.project + '列入国家级非遗名录',
    );
    assert.ok(
      (item.year === 2006 ? first : second).includes(record.project),
      `${record.name}: ${record.project} not found in cited year`,
    );
    assert.ok(item.url.includes(item.year === 2006 ? '297946' : '1016331'));
  }
  const gaoshan = context.exports.ethnicDevelopment['高山族'];
  assert.ok(
    gaoshan.achievements
      .find((item) => item.title === '高山族拉手舞列入国家级非遗名录')
      .text.includes('福建省华安县'),
  );
  assert.ok(gaoshan.path.includes('台湾社群另'));
});
test('development source snapshots retain provenance and match their checksums', async () => {
  const sources = JSON.parse(await readFile('data/raw/development/sources.json', 'utf8'));
  assert.equal(sources.length, 12);
  for (const source of sources) {
    const bytes = await readFile(`data/raw/development/${source.id}.html`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.id);
    assert.ok(source.url.startsWith('https://'));
  }
  for (const culture of cultureSources)
    assert.ok((await readFile(culture.snapshot)).length > 1000, culture.name);
  assert.equal(cultureSources.length, 55);
});

test('later heritage achievements cite the correct year, section and preserved attachment', async () => {
  const candidates = JSON.parse(await readFile('data/raw/development/candidates.json', 'utf8'));
  const images = JSON.parse(await readFile('data/raw/development/2021/sources.json', 'utf8'));
  assert.equal(additions.length, 113);
  assert.equal(new Set(additions.map((item) => item.name)).size, 51);
  for (const item of additions) {
    if (item.year === 2021) {
      const page = images.find((image) => image.page === item.evidence.page);
      assert.ok(page, item.project);
      assert.equal(item.kind, item.evidence.page < 10 ? 'new' : 'extension');
      assert.equal(
        createHash('sha256')
          .update(await readFile(item.evidence.snapshot))
          .digest('hex'),
        page.sha256,
      );
    } else {
      const evidence = candidates.find(
        (row) => row.year === item.year && row.kind === item.kind && row.code === item.code,
      );
      assert.ok(evidence?.excerpt.includes(item.project), item.project);
      const html = clean(await readFile(item.evidence.snapshot, 'utf8')).replace(/\s/g, '');
      assert.ok(
        html.includes(item.project.replace(/\s/g, '')),
        `${item.project} absent from original HTML`,
      );
    }
  }
  for (const record of records) {
    assert.equal(
      new Set(record.achievements.map((item) => `${item.year}-${item.title}`)).size,
      record.achievements.length,
      record.name,
    );
    assert.ok(
      record.achievements.every(
        (item, i) => i === 0 || item.year <= record.achievements[i - 1].year,
      ),
    );
  }
  const bai = context.exports.ethnicDevelopment['白族'];
  assert.deepEqual(
    Array.from(new Set(bai.achievements.map((item) => item.year))),
    [2021, 2014, 2008, 2006],
  );
  assert.ok(
    bai.achievements.some(
      (item) => item.title === '茶俗（白族三道茶）扩展保护范围' && item.year === 2014,
    ),
  );
  assert.ok(
    context.exports.ethnicDevelopment['独龙族'].achievements.some(
      (item) => item.year === 2021 && item.title.includes('独龙族民歌'),
    ),
  );
});
