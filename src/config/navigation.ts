export const navigation = [
  { id: 'map', label: '民族分布', icon: 'map' },
  { id: 'culture', label: '民族介绍', icon: 'book' },
  { id: 'analysis', label: '分布分析', icon: 'chart' },
  { id: 'economy', label: '地区经济', icon: 'trend' },
  { id: 'reform', label: '民族发展', icon: 'clock' },
] as const;

export type SectionId = (typeof navigation)[number]['id'];
export type PageId = SectionId | 'sources';

export function isPageId(value: string): value is PageId {
  return value === 'sources' || navigation.some((item) => item.id === value);
}

export const sourcesHeading = {
  title: '每一份数据，都有来处。',
  description: '明确来源、统计口径与计算方法，让探索有据可循。',
};
