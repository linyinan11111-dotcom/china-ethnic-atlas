import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  percentage,
  classIndex,
  mapValue,
  rankRegions,
  concentration,
  escapeCsv,
  formatPercent,
  formatMetric,
} from '../src/utils/analysis.mjs';
import { buildRankingChart } from '../src/utils/ranking-chart.mjs';
import { readFile } from 'node:fs/promises';

test('missing statistics remain distinct from zero', () => {
  assert.equal(percentage(null, 100), null);
  assert.equal(percentage(0, 100), 0);
  assert.equal(percentage(10, 0), null);
  assert.equal(mapValue(undefined, '壮族', 'population'), null);
  assert.equal(classIndex(null, 'share'), -1);
  assert.equal(classIndex(0, 'share'), 0);
});
test('color boundaries match legend intervals', () => {
  assert.deepEqual(
    [0, 0.099, 0.1, 0.999, 1, 4.99, 5, 19.99, 20].map((v) => classIndex(v, 'share')),
    [0, 0, 1, 1, 2, 2, 3, 3, 4],
  );
  assert.deepEqual(
    [0, 999, 1000, 9999, 10000, 99999, 100000, 999999, 1000000].map((v) =>
      classIndex(v, 'population'),
    ),
    [0, 0, 1, 1, 2, 2, 3, 3, 4],
  );
});
test('quantity ranking and local share ranking answer different questions', () => {
  const rows = [
    { name: '甲', total: 1000, populations: { 测试: 100 } },
    { name: '乙', total: 100, populations: { 测试: 50 } },
    { name: '缺失', total: 80, populations: { 测试: null } },
    { name: '零', total: 10, populations: { 测试: 0 } },
  ];
  assert.deepEqual(
    rankRegions(rows, '测试').map((r) => r.name),
    ['甲', '乙', '零'],
  );
  assert.deepEqual(
    rankRegions(rows, '测试', 'share').map((r) => r.name),
    ['乙', '甲', '零'],
  );
  assert.equal(concentration(rows, '测试', 1), (100 / 150) * 100);
  assert.equal(concentration([{ populations: { 测试: 0 } }], '测试'), null);
});
test('CSV preserves punctuation and missing values', () => {
  assert.equal(escapeCsv(null), '');
  assert.equal(escapeCsv('a,b'), '"a,b"');
  assert.equal(escapeCsv('a"b'), '"a""b"');
});

test('percent labels remove floating-point tails and preserve very small populations', () => {
  assert.equal(formatPercent(0.00030000000000000003), '0.0003%');
  assert.equal(formatPercent(0.01 + 0.02), '0.03%');
  assert.equal(formatPercent(0.01234), '0.012%');
  assert.equal(formatPercent(96.666666666666), '96.67%');
  assert.equal(formatPercent(0.000009), '<0.0001%');
  assert.equal(formatPercent(0), '0%');
  assert.equal(formatPercent(null), '暂无数据');
  assert.equal(formatPercent(NaN), '暂无数据');
  assert.equal(formatMetric(0.0003, 'share'), '0.0003%');
  assert.equal(formatMetric(42, 'population'), '42人');
});

test('Gaoshan chart keeps numeric statistics and shows nonzero precise percentages', async () => {
  const data = JSON.parse(await readFile('public/data/population.json', 'utf8'));
  const ranking = rankRegions(data.regions, '高山族', 'share');
  const chart = buildRankingChart(ranking, 'share', { deep: '#223344', accent: '#556677' }, null);
  const series = chart.series[0];
  assert.equal(series.data.length, 8);
  for (const item of series.data) {
    assert.equal(typeof item.value, 'number');
    assert(item.value > 0);
    assert.notEqual(series.label.formatter({ value: item.value }), '0%');
    assert.notEqual(series.label.formatter({ value: item.value }), '0.0%');
  }
  assert.equal(chart.xAxis.axisLabel.formatter(0.00030000000000000003), '0.0003%');
  assert.equal(chart.tooltip.valueFormatter(ranking[0].value), formatPercent(ranking[0].value));
  assert.equal(series.data.at(-1).value, ranking[0].value);
  const majority = buildRankingChart(
    rankRegions(data.regions, '汉族', 'share'),
    'share',
    { deep: '#223344', accent: '#556677' },
    null,
  );
  assert.equal(majority.xAxis.max, 100);
  const population = buildRankingChart(
    rankRegions(data.regions, '高山族'),
    'population',
    { deep: '#223344', accent: '#556677' },
    null,
  );
  assert.equal(population.tooltip.valueFormatter(42), '42人');
});
