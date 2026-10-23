import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const base = 'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm';
export const ethnicNames =
  '汉族 蒙古族 回族 藏族 维吾尔族 苗族 彝族 壮族 布依族 朝鲜族 满族 侗族 瑶族 白族 土家族 哈尼族 哈萨克族 傣族 黎族 傈僳族 佤族 畲族 高山族 拉祜族 水族 东乡族 纳西族 景颇族 柯尔克孜族 土族 达斡尔族 仫佬族 羌族 布朗族 撒拉族 毛南族 仡佬族 锡伯族 阿昌族 普米族 塔吉克族 怒族 乌孜别克族 俄罗斯族 鄂温克族 德昂族 保安族 裕固族 京族 塔塔尔族 独龙族 鄂伦春族 赫哲族 门巴族 珞巴族 基诺族'.split(
    ' ',
  );
export const provinceNames =
  '北京 天津 河北 山西 内蒙古 辽宁 吉林 黑龙江 上海 江苏 浙江 安徽 福建 江西 山东 河南 湖北 湖南 广东 广西 海南 重庆 四川 贵州 云南 西藏 陕西 甘肃 青海 宁夏 新疆'.split(
    ' ',
  );
export const provinceCodes = [
  '110000',
  '120000',
  '130000',
  '140000',
  '150000',
  '210000',
  '220000',
  '230000',
  '310000',
  '320000',
  '330000',
  '340000',
  '350000',
  '360000',
  '370000',
  '410000',
  '420000',
  '430000',
  '440000',
  '450000',
  '460000',
  '500000',
  '510000',
  '520000',
  '530000',
  '540000',
  '610000',
  '620000',
  '630000',
  '640000',
  '650000',
];
export function parsePopulation(html) {
  const clean = (text) =>
    text
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;|&#160;/g, '')
      .replace(/\s/g, '');
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((m) =>
    [...m[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => clean(c[1])),
  );
  const records = [];
  let national = null;
  for (const row of rows) {
    const p = provinceNames.indexOf(row[0]);
    if (p < 0 && row[0] !== '全国') continue;
    if (row.length !== 178)
      throw new Error(`Unexpected table shape ${row[0]}: ${row.length}, expected 178`);
    // An empty source cell remains null; no implicit zero conversion.
    const numeric = (value) =>
      value === ''
        ? null
        : /^\d+$/.test(value)
          ? Number(value)
          : (() => {
              throw new Error(`Invalid number ${value}`);
            })();
    const total = numeric(row[1]);
    const populations = Object.fromEntries(
      ethnicNames.map((name, i) => [name, numeric(row[4 + i * 3])]),
    );
    const record = {
      code: p < 0 ? '100000' : provinceCodes[p],
      name: row[0],
      total,
      populations,
      year: 2010,
      sourceId: 'census2010',
    };
    if (p < 0) national = record;
    else records.push(record);
  }
  if (records.length !== 31 || !national)
    throw new Error(`Incomplete population table: ${records.length}`);
  for (const record of [...records, national]) {
    const sum = Object.values(record.populations).reduce((a, b) => a + (b ?? 0), 0);
    if (sum > record.total || sum < record.total * 0.98)
      throw new Error(`Invalid population sum for ${record.name}`);
  }
  return { year: 2010, sourceUrl: base, national, regions: records };
}

if (process.argv[1]?.endsWith('fetch-data.mjs')) {
  await mkdir('data/raw', { recursive: true });
  await mkdir('public/data', { recursive: true });
  const manifest = [];
  async function download(url, path) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(45000),
      headers: { 'User-Agent': 'EthnicAtlas-Educational/1.0' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(path, bytes);
    manifest.push({
      url,
      path,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      retrievedAt: new Date().toISOString(),
    });
    return bytes;
  }
  const raw = await download(base, 'data/raw/census2010.html');
  const html = new TextDecoder('gb18030').decode(raw);
  const data = parsePopulation(html);
  await writeFile('public/data/population.json', JSON.stringify(data, null, 2));
  const map = await download(
    'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
    'public/china-provinces.geojson',
  );
  if (JSON.parse(map).features.length < 34) throw new Error('Incomplete boundary file');
  await writeFile('data/manifest.json', JSON.stringify(manifest, null, 2));
  console.log(
    `Fetched and validated ${data.regions.length} provinces × ${ethnicNames.length} ethnic groups. Empty cells preserved as null.`,
  );
}
