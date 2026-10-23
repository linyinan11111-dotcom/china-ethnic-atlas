export const ethnicNames =
  '汉族 蒙古族 回族 藏族 维吾尔族 苗族 彝族 壮族 布依族 朝鲜族 满族 侗族 瑶族 白族 土家族 哈尼族 哈萨克族 傣族 黎族 傈僳族 佤族 畲族 高山族 拉祜族 水族 东乡族 纳西族 景颇族 柯尔克孜族 土族 达斡尔族 仫佬族 羌族 布朗族 撒拉族 毛南族 仡佬族 锡伯族 阿昌族 普米族 塔吉克族 怒族 乌孜别克族 俄罗斯族 鄂温克族 德昂族 保安族 裕固族 京族 塔塔尔族 独龙族 鄂伦春族 赫哲族 门巴族 珞巴族 基诺族'.split(
    ' ',
  );
const syllables = [
  'han zu',
  'meng gu zu',
  'hui zu',
  'zang zu',
  'wei wu er zu',
  'miao zu',
  'yi zu',
  'zhuang zu',
  'bu yi zu',
  'chao xian zu',
  'man zu',
  'dong zu',
  'yao zu',
  'bai zu',
  'tu jia zu',
  'ha ni zu',
  'ha sa ke zu',
  'dai zu',
  'li zu',
  'li su zu',
  'wa zu',
  'she zu',
  'gao shan zu',
  'la hu zu',
  'shui zu',
  'dong xiang zu',
  'na xi zu',
  'jing po zu',
  'ke er ke zi zu',
  'tu zu',
  'da wo er zu',
  'mu lao zu',
  'qiang zu',
  'bu lang zu',
  'sa la zu',
  'mao nan zu',
  'ge lao zu',
  'xi bo zu',
  'a chang zu',
  'pu mi zu',
  'ta ji ke zu',
  'nu zu',
  'wu zi bie ke zu',
  'e luo si zu',
  'e wen ke zu',
  'de ang zu',
  'bao an zu',
  'yu gu zu',
  'jing zu',
  'ta ta er zu',
  'du long zu',
  'e lun chun zu',
  'he zhe zu',
  'men ba zu',
  'luo ba zu',
  'ji nuo zu',
];
export const ethnicSearchIndex = Object.fromEntries(
  ethnicNames.map((name, i) => [
    name,
    {
      pinyin: syllables[i].replaceAll(' ', ''),
      initials: syllables[i]
        .split(' ')
        .map((s) => s[0])
        .join(''),
      short: name.slice(0, -1),
    },
  ]),
);
export function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s'’\-]/g, '');
}
export function searchEthnics(groups, query) {
  const q = normalizeSearch(query);
  if (!q) return groups;
  return groups
    .map((group, index) => {
      const fields = ethnicSearchIndex[group.name];
      if (!fields) return null;
      let score = -1;
      if (
        group.name === q ||
        fields.short === q ||
        fields.pinyin === q ||
        fields.pinyin.replace(/zu$/, '') === q
      )
        score = 100;
      else if (group.name.startsWith(q) || fields.pinyin.startsWith(q)) score = 80;
      else if (fields.initials === q || fields.initials.replace(/z$/, '') === q) score = 70;
      else if (group.name.includes(q) || fields.pinyin.includes(q) || fields.initials.startsWith(q))
        score = 50;
      return score < 0 ? null : { group, index, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((r) => r.group);
}
export function searchDirectory(groups, query, { region = '', topic = '' } = {}) {
  const tokens = String(query ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const eligible = groups.filter(
    (g) =>
      (!region || g.majorRegions?.includes(region)) &&
      (!topic || [...(g.culture ?? []), ...(g.keywords ?? [])].some((v) => v.includes(topic))),
  );
  if (!tokens.length) return eligible;
  const primary = searchEthnics(eligible, query);
  if (primary.length) return primary;
  const rank = new Map(primary.map((g, i) => [g.name, i]));
  return eligible
    .filter(
      (g) =>
        rank.has(g.name) ||
        tokens.every(
          (token) =>
            searchEthnics([g], token).length ||
            [...(g.majorRegions ?? []), ...(g.culture ?? []), ...(g.keywords ?? [])].some((v) =>
              normalizeSearch(v).includes(normalizeSearch(token)),
            ),
        ),
    )
    .sort((a, b) => (rank.get(a.name) ?? 1000) - (rank.get(b.name) ?? 1000));
}
