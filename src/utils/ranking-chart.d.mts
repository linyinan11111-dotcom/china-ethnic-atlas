import type { PopulationRegion } from '../types';
import type { EChartsCoreOption } from 'echarts/core';
export function buildRankingChart(
  ranking: (PopulationRegion & { value: number })[],
  metric: string,
  theme: { deep: string; accent: string },
  selectedCode: string | null,
): EChartsCoreOption;
