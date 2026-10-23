<script setup lang="ts">
import Icon from '../Icon.vue';
import { defineAsyncComponent } from 'vue';
import TaiwanPopulation from '../TaiwanPopulation.vue';
import EthnicCompare from '../EthnicCompare.vue';
import ModuleMeta from '../ModuleMeta.vue';
import { useAtlas } from '../../composables/atlasContext';
import { nationalSource } from '../../data/catalogue';
import {
  formatPeople,
  formatMetric,
  formatPercent,
  mapValue,
  percentage,
} from '../../utils/analysis.mjs';

const Chart = defineAsyncComponent(() => import('../Chart.vue'));

const {
  ethnicName,
  isGaoshan,
  metric,
  selectedCode,
  data,
  regions,
  populationYear,
  selectedRegion,
  ranking,
  topPopulation,
  covered,
  concentrationValue,
  openEthnic,
  selectMapRegion,
  selectByName,
  rankChart,
} = useAtlas();
</script>
<template>
  <section
    id="section-analysis"
    class="ethnic-page-section content-column"
    aria-label="分布分析"
  >
    <div class="unified-section-title">
      <span>03</span>
      <h2>{{ ethnicName }} · 分布分析</h2>
      <small>数量与占比</small>
    </div>
    <EthnicCompare
      :name="ethnicName"
      :regions="regions"
      @choose="openEthnic"
    />
    <div class="section-page-head">
      <div>
        <h2>{{ ethnicName }} · 分布分析</h2>
        <p>大陆省级数据：{{ populationYear }} 年人口普查 · 同一口径下比较数量与占比</p>
      </div>
      <div class="segmented">
        <button
          :class="{ selected: metric === 'population' }"
          @click="metric = 'population'"
        >
          人口数量
        </button>
        <button
          :class="{ selected: metric === 'share' }"
          @click="metric = 'share'"
        >
          人口占比
        </button>
      </div>
    </div>
    <div class="three-cards">
      <section class="card info-card">
        <span>人口数量最多地区</span>
        <strong>{{ topPopulation[0]?.name ?? '—' }}</strong>
        <small>{{ formatPeople(topPopulation[0]?.value) }}人 · {{ populationYear }}</small>
      </section>
      <section class="card info-card">
        <span>前五地区人口集中度</span>
        <strong>
          {{ concentrationValue?.toFixed(1) ?? '—' }}
          <em>%</em>
        </strong>
        <small>分母为已收录地区的该民族人口合计</small>
      </section>
      <section class="card info-card">
        <span>有效地区数</span>
        <strong>
          {{ covered }}
          <em>/ 31</em>
        </strong>
        <small>空白单元格保留为缺失，不计入排名</small>
      </section>
    </div>
    <div class="analysis-grid">
      <section class="card chart-card">
        <div class="section-label">
          <Icon name="chart" />
          <h2>大陆地区排名 TOP 8</h2>
          <span class="tiny-badge">{{ populationYear }}</span>
        </div>
        <Chart
          :option="rankChart"
          :height="320"
          :label="`${ethnicName}地区排名：${ranking
            .slice(0, 8)
            .map((r) => r.name + ' ' + formatMetric(r.value, metric))
            .join('；')}`"
          @select="selectByName"
        />
        <p class="chart-caption">点击柱形可选择地区；占比 = 当地该民族人口 ÷ 当地总人口。</p>
      </section>
      <section class="card prose-card insight-card">
        <p class="eyebrow">READ THE DATA</p>
        <h2>数量与占比，回答不同问题。</h2>
        <p>
          人口数量反映某民族在一个地区的人口规模；当地占比反映该民族在当地人口中的比重。两种排名可能不同。
        </p>
        <TaiwanPopulation
          v-if="isGaoshan && selectedCode === '710000'"
          compact
        />
        <div
          v-else
          class="insight-highlight"
        >
          <strong>{{ selectedRegion?.name ?? '当前地区' }}</strong>
          <span>
            {{ ethnicName }}人口：{{ formatPeople(selectedRegion?.populations[ethnicName]) }}人
          </span>
          <span>
            当地占比：{{
              selectedRegion
                ? formatMetric(mapValue(selectedRegion, ethnicName, 'share'), 'share')
                : '—'
            }}
          </span>
        </div>
        <small>这里的“集中度”基于当前已收录地区计算，不包含未收录地区与特殊统计项目。</small>
      </section>
    </div>
    <section class="card table-card analysis-table">
      <div class="table-heading">
        <h2>大陆省级地区明细</h2>
        <span>{{ populationYear }} 年 · {{ ethnicName }}</span>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>排名</th>
              <th>地区</th>
              <th>民族人口 / 人</th>
              <th>当地人口占比</th>
              <th>该民族地区分布份额</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, index) in ranking"
              :key="r.code"
              :class="{ highlight: r.code === selectedCode }"
            >
              <td>{{ String(index + 1).padStart(2, '0') }}</td>
              <td>{{ r.name }}</td>
              <td>{{ r.populations[ethnicName]?.toLocaleString('zh-CN') }}</td>
              <td>{{ formatPercent(percentage(r.populations[ethnicName], r.total)) }}</td>
              <td>
                {{
                  formatPercent(
                    percentage(
                      r.populations[ethnicName],
                      topPopulation.reduce((s, p) => s + p.value, 0),
                    ),
                  )
                }}
              </td>
              <td>
                <button
                  class="text-button"
                  @click="selectMapRegion(r.code)"
                >
                  地图查看
                  <Icon
                    name="chevron"
                    :size="13"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    <ModuleMeta
      :period="`${populationYear}年省级人口；2020年大陆民族人口`"
      scope="数量与占比使用同一年省级普查。缺失值保留为空，不以全国比例分配到各省。"
      :sources="[
        {
          name: populationYear + '省级普查原表',
          url: data?.sourceUrl ?? 'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm',
        },
        { name: '2020全国普查原表', url: nationalSource },
      ]"
    />
  </section>
</template>
