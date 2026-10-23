import { computed, type Ref } from 'vue';
import type { EChartsCoreOption } from 'echarts/core';
import type { EconomyRegion } from '../types';
import { buildRankingChart } from '../utils/ranking-chart.mjs';
import { rankRegions } from '../utils/analysis.mjs';
import { getEthnicTheme } from '../utils/themes.mjs';
interface ChartState {
  ranking: Ref<ReturnType<typeof rankRegions>>;
  metric: Ref<string>;
  theme: Ref<ReturnType<typeof getEthnicTheme>>;
  selectedCode: Ref<string | null>;
  selectedEconomy: Ref<EconomyRegion | undefined>;
  comparison: Ref<EconomyRegion[]>;
  economyMetric: Ref<string>;
}
export function useAtlasCharts({
  ranking,
  metric,
  theme,
  selectedCode,
  selectedEconomy,
  comparison,
  economyMetric,
}: ChartState) {
  const chartBase = {
    textStyle: { fontFamily: '"Microsoft YaHei", sans-serif', color: '#758278', fontSize: 11 },
    tooltip: { trigger: 'axis', renderMode: 'richText' },
    grid: { left: 14, right: 38, top: 8, bottom: 15, containLabel: true },
  };
  const rankChart = computed<EChartsCoreOption>(() =>
    buildRankingChart(ranking.value, metric.value, theme.value, selectedCode.value),
  );
  const sectorChart = computed<EChartsCoreOption>(() => ({
    textStyle: chartBase.textStyle,
    tooltip: { trigger: 'item', renderMode: 'richText' },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 9,
      textStyle: { color: '#718074', fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['47%', '72%'],
        center: ['50%', '42%'],
        label: { show: false },
        data: (selectedEconomy.value?.sectors ?? []).map((v, i) => ({
          name: ['第一产业', '第二产业', '第三产业'][i],
          value: v,
          itemStyle: { color: [theme.value.palette[2], theme.value.accent, '#d5b982'][i] },
        })),
      },
    ],
  }));
  const economyChart = computed<EChartsCoreOption>(() => ({
    ...chartBase,
    grid: { left: 16, right: 16, top: 25, bottom: 25, containLabel: true },
    xAxis: {
      type: 'category',
      data: comparison.value.map((r) => r.name),
      axisLine: { lineStyle: { color: '#e6eae3' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: economyMetric.value === 'gdp' ? '亿元' : '元',
      splitLine: { lineStyle: { color: '#edf0e9' } },
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 48,
        data: comparison.value.map((r, i) => ({
          value: economyMetric.value === 'gdp' ? r.gdp : r.perCapita,
          itemStyle: {
            color: [
              theme.value.accent,
              theme.value.palette[3],
              '#bc9c61',
              theme.value.palette[2],
              theme.value.deep,
            ][i],
            borderRadius: [5, 5, 0, 0],
          },
        })),
      },
    ],
  }));

  return { rankChart, sectorChart, economyChart };
}
