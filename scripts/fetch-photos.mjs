import { mkdir, writeFile } from 'node:fs/promises';
import { ethnicNames } from '../src/utils/ethnic-search.mjs';
import { getEthnicTheme } from '../src/utils/themes.mjs';
const root = 'http://www.china.org.cn/e-groups/shaoshu/';
const slugs = {
  蒙古族: 'mongolian',
  回族: 'hui',
  藏族: 'tibetan',
  维吾尔族: 'uygur',
  苗族: 'miao',
  彝族: 'yi',
  壮族: 'zhuang',
  布依族: 'bouyei',
  朝鲜族: 'korean',
  满族: 'manchu',
  侗族: 'dong',
  瑶族: 'yao',
  白族: 'bai',
  土家族: 'tujia',
  哈尼族: 'hani',
  哈萨克族: 'kazak',
  傣族: 'dai',
  黎族: 'li',
  傈僳族: 'lisu',
  佤族: 'va',
  畲族: 'she',
  高山族: 'gaoshan',
  拉祜族: 'lahu',
  水族: 'shui',
  东乡族: 'dongxiang',
  纳西族: 'naxi',
  景颇族: 'jingp',
  柯尔克孜族: 'kirgiz',
  土族: 'tu',
  达斡尔族: 'daur',
  仫佬族: 'mulam',
  羌族: 'qiang',
  布朗族: 'blang',
  撒拉族: 'salar',
  毛南族: 'maonan',
  仡佬族: 'gelo',
  锡伯族: 'xibe',
  阿昌族: 'achang',
  普米族: 'pumi',
  塔吉克族: 'tajik',
  怒族: 'nu',
  乌孜别克族: 'ozbek',
  俄罗斯族: 'russian',
  鄂温克族: 'ewenki',
  德昂族: 'de%27ang',
  保安族: 'bonan',
  裕固族: 'yugur',
  京族: 'jing',
  塔塔尔族: 'tartar',
  独龙族: 'drung',
  鄂伦春族: 'oroqen',
  赫哲族: 'hezhe',
  门巴族: 'moinba',
  珞巴族: 'lhoba',
  基诺族: 'jino',
};
await mkdir('public/photos', { recursive: true });
await mkdir('data/raw/photos', { recursive: true });
async function request(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw Error(`${r.status} ${url}`);
      return r;
    } catch (e) {
      if (attempt === 2) throw e;
    }
  }
}
// Selected after reviewing the source photos: prefer clear views of distinctive dress.
const preferred = {
  苗族: 2,
  布依族: 2,
  朝鲜族: 2,
  满族: 2,
  佤族: 2,
  东乡族: 2,
  纳西族: 2,
  水族: 2,
  柯尔克孜族: 2,
  羌族: 1,
  毛南族: 2,
  锡伯族: 2,
  阿昌族: 2,
  塔塔尔族: 2,
  鄂温克族: 2,
  鄂伦春族: 2,
  赫哲族: 2,
  基诺族: 2,
  门巴族: 1,
  珞巴族: 2,
};
const catalogue = {};
for (let i = 0; i < ethnicNames.length; i += 4) {
  await Promise.allSettled(
    ethnicNames.slice(i, i + 4).map(async (name) => {
      if (!slugs[name]) return;
      const id = getEthnicTheme(name).id;
      const page = root + `shao-${slugs[name]}.htm`;
      try {
        const html = await (await request(page)).text();
        await writeFile(`data/raw/photos/${id}.html`, html);
        const images = [...html.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)]
          .map((m) => new URL(m[1], page).href)
          .filter((u) => /\.jpg$/i.test(u) && !u.includes('shao-02'));
        if (!images.length) throw Error('No subject photos');
        const photos = [];
        const url = [...new Set(images)][(preferred[name] ?? 1) - 1];
        const r = await request(url);
        const bytes = new Uint8Array(await r.arrayBuffer());
        if (!r.headers.get('content-type')?.startsWith('image/')) throw Error('Not image');
        const file = `photos/${id}.jpg`;
        await writeFile(`public/${file}`, bytes);
        photos.push({ file, original: url });
        catalogue[name] = {
          name,
          source: page,
          publisher: '中国网 · Ethnic Groups',
          author: '原页面未标注摄影者',
          license: '原页面未提供开放许可；版权归原权利人',
          retrieved: new Date().toISOString().slice(0, 10),
          photos,
        };
        console.log(name, photos.length);
      } catch (e) {
        console.log('FAILED', name, e.message);
      }
    }),
  );
}
const hanSource =
  'https://www.chinahighlights.com/travelguide/traditional-chinese-clothes-hanfu.htm';
const hanImage =
  'https://images.chinahighlights.com/allpicture/2017/11/ecd0288cabf440bebb590f90_300x200.jpg';
await writeFile('data/raw/photos/ethnic-1.html', await (await request(hanSource)).text());
await writeFile(
  'public/photos/ethnic-1.jpg',
  new Uint8Array(await (await request(hanImage)).arrayBuffer()),
);
catalogue['汉族'] = {
  name: '汉族',
  source: hanSource,
  publisher: 'China Highlights · Hanfu',
  author: '原页面未标注摄影者',
  license: '原页面未提供开放许可；版权归原权利人',
  retrieved: new Date().toISOString().slice(0, 10),
  photos: [{ file: 'photos/ethnic-1.jpg', original: hanImage }],
};
const missing = ethnicNames.filter((name) => !catalogue[name]);
if (missing.length)
  throw Error(
    'Photo catalogue incomplete; existing catalogue preserved. Missing: ' + missing.join('、'),
  );
await writeFile('src/data/ethnic-photos.json', JSON.stringify(catalogue, null, 2) + '\n');
console.log(
  'COVERAGE',
  Object.keys(catalogue).length,
  'MISSING',
  ethnicNames.filter((x) => !catalogue[x]),
);
