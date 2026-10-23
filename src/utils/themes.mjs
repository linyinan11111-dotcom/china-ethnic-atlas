import { ethnicNames } from './ethnic-search.mjs';
const custom = {
  汉族: ['#9c4448', '朱砂红'],
  蒙古族: ['#326a97', '草原蓝'],
  回族: ['#277568', '青玉绿'],
  藏族: ['#98516c', '绛紫红'],
  维吾尔族: ['#217987', '绿松石'],
  苗族: ['#79549a', '紫藤色'],
  彝族: ['#a25439', '赤陶色'],
  壮族: ['#38648b', '织锦蓝'],
  布依族: ['#467660', '竹青色'],
  朝鲜族: ['#a65376', '海棠粉'],
  满族: ['#886a36', '琥珀金'],
  侗族: ['#4c628c', '山岚蓝'],
  瑶族: ['#a34556', '胭脂红'],
  白族: ['#4e8494', '苍山青'],
  土家族: ['#9b5c38', '暖赭色'],
  哈尼族: ['#647b3d', '梯田绿'],
  哈萨克族: ['#337d78', '湖水绿'],
  傣族: ['#3d846c', '孔雀绿'],
  黎族: ['#a26146', '木棉色'],
  傈僳族: ['#835c96', '丁香紫'],
  佤族: ['#975747', '栗棕色'],
  畲族: ['#776294', '鸢尾紫'],
  高山族: ['#a85d57', '珊瑚红'],
  拉祜族: ['#95723b', '麦穗金'],
  水族: ['#407e8e', '水雾蓝'],
  东乡族: ['#68784b', '橄榄绿'],
  纳西族: ['#557499', '远山蓝'],
  景颇族: ['#a34b64', '石榴红'],
  柯尔克孜族: ['#946047', '铜棕色'],
  土族: ['#92743d', '秋叶金'],
  达斡尔族: ['#507965', '松叶绿'],
  仫佬族: ['#575f8e', '暮色蓝'],
  羌族: ['#98643e', '山岩赭'],
  布朗族: ['#72803e', '茶山绿'],
  撒拉族: ['#367779', '碧湖青'],
  毛南族: ['#677345', '苔青色'],
  仡佬族: ['#966851', '枫木棕'],
  锡伯族: ['#536d98', '晴空蓝'],
  阿昌族: ['#876297', '春兰紫'],
  普米族: ['#997948', '浅琥珀'],
  塔吉克族: ['#a04a49', '落日红'],
  怒族: ['#488175', '峡谷青'],
  乌孜别克族: ['#447e94', '天青色'],
  俄罗斯族: ['#8a5678', '玫瑰紫'],
  鄂温克族: ['#5b7852', '森林绿'],
  德昂族: ['#827c40', '嫩茶绿'],
  保安族: ['#3f7680', '青黛色'],
  裕固族: ['#a67a35', '沙金色'],
  京族: ['#387c98', '海湾蓝'],
  塔塔尔族: ['#755c8e', '烟紫色'],
  独龙族: ['#397d70', '雨林绿'],
  鄂伦春族: ['#717b45', '白桦绿'],
  赫哲族: ['#46768d', '江水蓝'],
  门巴族: ['#a2714c', '山茶褐'],
  珞巴族: ['#805c45', '林木棕'],
  基诺族: ['#6a8245', '茶芽绿'],
};
export function mixColor(first, second, ratio) {
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const a = rgb(first),
    b = rgb(second);
  return (
    '#' +
    a
      .map((v, i) =>
        Math.round(v * (1 - ratio) + b[i] * ratio)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
export const ethnicThemes = Object.fromEntries(
  ethnicNames.map((name, index) => {
    const [accent, label] = custom[name];
    const palette = [0.92, 0.74, 0.5, 0.23, 0].map((r) => mixColor(accent, '#ffffff', r));
    return [
      name,
      {
        id: `ethnic-${index + 1}`,
        name,
        label,
        accent,
        deep: mixColor(accent, '#24252a', 0.27),
        muted: mixColor(accent, '#75746a', 0.45),
        soft: mixColor(accent, '#ffffff', 0.93),
        pale: mixColor(accent, '#ffffff', 0.97),
        border: mixColor(accent, '#ffffff', 0.8),
        palette,
      },
    ];
  }),
);
export function getEthnicTheme(name) {
  return ethnicThemes[name] ?? ethnicThemes['壮族'];
}
export function themeVariables(theme) {
  return {
    '--green': theme.accent,
    '--theme-accent': theme.accent,
    '--theme-ink': theme.deep,
    '--theme-muted': theme.muted,
    '--theme-soft': theme.soft,
    '--theme-pale': theme.pale,
    '--theme-border': theme.border,
    '--theme-tint': theme.palette[1],
    '--theme-light': theme.palette[0],
    '--theme-middle': theme.palette[2],
    '--theme-hill': theme.palette[3],
    '--theme-page': mixColor(theme.accent, '#f8f8f5', 0.96),
  };
}
