import { economy, economySource, economyYear } from '../data/economy';
import type { PopulationData } from '../types';
import { escapeCsv, percentage } from './analysis.mjs';

/** Pure CSV generation keeps missing cells blank and includes both statistical periods. */
export function createPopulationCsv(data: PopulationData, ethnic: string): string {
  const rows = [
    [
      '地区',
      '行政区代码',
      '民族',
      '人口年份',
      '民族人口(人)',
      '地区总人口(人)',
      '地区民族人口占比(%)',
      'GDP年份',
      'GDP(亿元)',
      '人均GDP(元)',
      '人口来源',
      '经济来源',
    ],
  ];
  for (const region of data.regions) {
    const economicData = economy.find((item) => item.code === region.code);
    rows.push([
      region.name,
      region.code,
      ethnic,
      String(data.year),
      String(region.populations[ethnic] ?? ''),
      String(region.total),
      String(percentage(region.populations[ethnic], region.total) ?? ''),
      String(economyYear),
      String(economicData?.gdp ?? ''),
      String(economicData?.perCapita ?? ''),
      data.sourceUrl,
      economySource,
    ]);
  }
  return '\uFEFF' + rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n');
}

export function downloadPopulationCsv(data: PopulationData, ethnic: string) {
  const blob = new Blob([createPopulationCsv(data, ethnic)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${ethnic}_省级分布与经济.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
