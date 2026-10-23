<script setup lang="ts">
import Icon from '../Icon.vue';
import { defineAsyncComponent } from 'vue';
import ModuleMeta from '../ModuleMeta.vue';
import { useAtlas } from '../../composables/atlasContext';
import { economy, economySource, economyYear } from '../../data/economy';

const Chart = defineAsyncComponent(() => import('../Chart.vue'));

const {
  ethnicName,
  selectedCode,
  populationYear,
  selectedEconomy,
  economyScope,
  economyMetric,
  economyRows,
  comparisonCodes,
  comparison,
  selectEconomyRegion,
  toggleCompare,
  sectorChart,
  economyChart,
} = useAtlas();
</script>
<template>
  <section
    id="section-economy"
    class="ethnic-page-section content-column"
    aria-label="地区经济"
  >
    <div class="unified-section-title">
      <span>04</span>
      <h2>{{ ethnicName }} · 地区经济</h2>
      <small>区域发展</small>
    </div>
    <div class="section-page-head">
      <div>
        <h2>主要分布地区经济 · {{ economyYear }}</h2>
        <p>地区整体经济指标 · 中国统计年鉴 2024 初步核算数</p>
      </div>
      <div class="segmented economy-scope">
        <button
          :class="{ selected: economyScope === 'related' }"
          @click="economyScope = 'related'"
        >
          本民族分布地区
        </button>
        <button
          :class="{ selected: economyScope === 'autonomous' }"
          @click="economyScope = 'autonomous'"
        >
          五个自治区
        </button>
        <button
          :class="{ selected: economyScope === 'all' }"
          @click="economyScope = 'all'"
        >
          全部省区市
        </button>
      </div>
    </div>
    <div class="notice-inline">
      <Icon
        name="info"
        :size="17"
      />
      <p>
        这里展示的是地区整体经济，不能解释为某个民族的收入或经济贡献。人口分布数据为
        {{ populationYear }} 年，经济数据为 2023 年。
      </p>
    </div>
    <div
      id="economy-details"
      class="three-cards"
    >
      <section class="card info-card">
        <span>当前地区</span>
        <strong>
          {{ selectedEconomy?.name ?? (selectedCode === '710000' ? '台湾' : '暂无地区数据') }}
        </strong>
        <small>
          {{
            selectedEconomy
              ? (selectedEconomy.autonomous ? '民族自治区' : '省级地区') + ' · 2023 年'
              : '未收录同口径经济数据'
          }}
        </small>
      </section>
      <section class="card info-card">
        <span>地区生产总值</span>
        <strong>
          {{ selectedEconomy?.gdp.toLocaleString('zh-CN') ?? '—' }}
          <em>亿元</em>
        </strong>
        <small>按当年价格计算</small>
      </section>
      <section class="card info-card">
        <span>人均地区生产总值</span>
        <strong>
          {{ selectedEconomy?.perCapita.toLocaleString('zh-CN') ?? '—' }}
          <em>元</em>
        </strong>
        <small>不同于居民人均可支配收入</small>
      </section>
    </div>
    <div class="economy-grid">
      <section class="card chart-card">
        <div class="chart-head">
          <div class="section-label">
            <Icon name="chart" />
            <h2>地区发展对比</h2>
          </div>
          <select
            v-model="economyMetric"
            aria-label="经济对比指标"
          >
            <option value="gdp">地区 GDP / 亿元</option>
            <option value="perCapita">人均 GDP / 元</option>
          </select>
        </div>
        <div class="comparison-chips">
          <button
            v-for="r in economy.filter((r) => comparisonCodes.includes(r.code))"
            :key="r.code"
            @click="toggleCompare(r.code)"
          >
            {{ r.name }}
            <Icon
              name="close"
              :size="12"
            />
          </button>
          <span v-if="!comparisonCodes.length">在下方表格选择地区进行对比</span>
        </div>
        <Chart
          v-if="comparison.length"
          :option="economyChart"
          :height="285"
          label="2023年所选地区GDP或人均GDP对比"
        />
        <div
          v-else
          class="chart-empty"
        >
          尚未选择对比地区
        </div>
        <p class="chart-caption">在表格中勾选最多 5 个地区，比较同年同口径指标。</p>
      </section>
      <section class="card chart-card">
        <div class="section-label">
          <Icon name="layers" />
          <h2>{{ selectedEconomy?.name ?? '—' }}产业结构</h2>
        </div>
        <Chart
          v-if="selectedEconomy"
          :option="sectorChart"
          :height="260"
          :label="`${selectedEconomy.name}三次产业增加值：${selectedEconomy.sectors.join('、')}亿元`"
        />
        <p class="chart-caption">三次产业增加值 · 2023 年</p>
      </section>
    </div>
    <section class="card table-card economy-table">
      <div class="table-heading">
        <h2>
          {{
            economyScope === 'related'
              ? ethnicName + '主要分布地区经济概况'
              : economyScope === 'autonomous'
                ? '五个自治区经济概况'
                : '省区市经济概况'
          }}
        </h2>
        <a
          :href="economySource"
          target="_blank"
          rel="noopener noreferrer"
        >
          查看原表
          <Icon
            name="external"
            :size="13"
          />
        </a>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>对比</th>
              <th>地区</th>
              <th>GDP / 亿元</th>
              <th>人均 GDP / 元</th>
              <th>实际增长率</th>
              <th>地区详情</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in economyRows"
              :key="r.code"
              :class="{ highlight: r.code === selectedCode }"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="comparisonCodes.includes(r.code)"
                  :aria-label="`对比${r.name}`"
                  @change="toggleCompare(r.code)"
                />
              </td>
              <td>
                {{ r.name }}
                <span
                  v-if="r.autonomous"
                  class="autonomous-dot"
                  title="民族自治区"
                ></span>
              </td>
              <td>{{ r.gdp.toLocaleString('zh-CN') }}</td>
              <td>{{ r.perCapita.toLocaleString('zh-CN') }}</td>
              <td class="green-text">{{ r.growth.toFixed(1) }}%</td>
              <td>
                <button
                  class="text-button"
                  @click="selectEconomyRegion(r.code)"
                >
                  选择地区
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
      period="2023年地区经济；年鉴2024版"
      scope="地区GDP、人均GDP及产业结构属于全地区，不等于某民族收入。原表为初步核算数。"
      :sources="[{ name: '统计年鉴经济原表', url: economySource }]"
    />
  </section>
</template>
