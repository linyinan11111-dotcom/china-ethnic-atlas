import { ethnicGroups } from './catalogue';
import { cultureProfiles } from './culture';
import { ethnicDevelopment } from './development';
import { culturalPlaces } from './places';
export const directoryGroups = ethnicGroups.map((group) => ({
  ...group,
  keywords: [
    ...group.culture,
    ethnicDevelopment[group.name].feature,
    ...culturalPlaces.filter((p) => p.ethnic === group.name).map((p) => p.name),
    ...cultureProfiles[group.name].sections
      .filter((s) => s.sources.length)
      .flatMap((s) => [s.title, s.text]),
  ],
}));
export const directoryRegions = [...new Set(ethnicGroups.flatMap((g) => g.majorRegions))].sort(
  (a, b) => a.localeCompare(b, 'zh-CN'),
);
export const directoryTopics = [
  '歌舞',
  '刺绣',
  '织锦',
  '建筑',
  '茶',
  '节',
  '文字',
  '史诗',
  '草原',
  '海洋',
];
