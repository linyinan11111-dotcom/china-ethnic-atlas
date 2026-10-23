export const palette = ['#e4eee7', '#bed9c7', '#89b79c', '#508b6c', '#21634e'];
export function percentage(value, total) {
  return value === null ||
    value === undefined ||
    !Number.isFinite(value) ||
    !Number.isFinite(total) ||
    total <= 0
    ? null
    : (value / total) * 100;
}
export function mapValue(region, ethnic, metric) {
  const p = region?.populations[ethnic];
  return p === undefined || p === null
    ? null
    : metric === 'share'
      ? percentage(p, region.total)
      : p;
}
export function classIndex(value, metric) {
  if (value === null || !Number.isFinite(value)) return -1;
  const limits = metric === 'share' ? [0.1, 1, 5, 20] : [1000, 10000, 100000, 1000000];
  return limits.findIndex((limit) => value < limit) === -1
    ? 4
    : limits.findIndex((limit) => value < limit);
}
export function rankRegions(regions, ethnic, metric = 'population') {
  return regions
    .map((r) => ({ ...r, value: mapValue(r, ethnic, metric) }))
    .filter((r) => r.value !== null)
    .sort((a, b) => b.value - a.value);
}
export function concentration(regions, ethnic, count = 5) {
  const values = rankRegions(regions, ethnic).map((r) => r.value);
  const covered = values.reduce((a, b) => a + b, 0);
  return covered === 0 ? null : (values.slice(0, count).reduce((a, b) => a + b, 0) / covered) * 100;
}
export function formatPeople(value) {
  return value === null || value === undefined
    ? '暂无数据'
    : value >= 100000000
      ? `${(value / 100000000).toFixed(2)} 亿`
      : value >= 10000
        ? `${(value / 10000).toFixed(2)} 万`
        : Number(value).toLocaleString('zh-CN');
}
export function formatPercent(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '暂无数据';
  if (value === 0) return '0%';
  if (Math.abs(value) < 0.0001) return `${value < 0 ? '-' : ''}<0.0001%`;
  const digits = Math.abs(value) < 0.01 ? 4 : Math.abs(value) < 0.1 ? 3 : 2;
  return `${value.toFixed(digits).replace(/\.?0+$/, '')}%`;
}
export function formatMetric(value, metric) {
  return value === null || value === undefined
    ? '暂无数据'
    : metric === 'share'
      ? formatPercent(value)
      : `${formatPeople(value)}人`;
}
export function escapeCsv(value) {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
