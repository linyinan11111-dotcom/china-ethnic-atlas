<script setup lang="ts">
import ChinaMap from '../ChinaMap.vue';
import { ref } from 'vue';
import taiwan from '../../data/taiwan-indigenous.json';
import type { CulturalPlace } from '../../data/places';
import Icon from '../Icon.vue';
import TaiwanPopulation from '../TaiwanPopulation.vue';
import CulturalPlaces from '../CulturalPlaces.vue';
import ModuleMeta from '../ModuleMeta.vue';
import { useAtlas } from '../../composables/atlasContext';
import { formatPeople, formatMetric, mapValue } from '../../utils/analysis.mjs';

const {
  ethnicName,
  ethnic,
  development,
  isGaoshan,
  palette,
  metric,
  labels,
  placesVisible,
  selectedPlace,
  selectedCode,
  data,
  regions,
  populationYear,
  populationEditions,
  error,
  selectedRegion,
  selectedEconomy,
  topPopulation,
  covered,
  concentrationValue,
  legendLabels,
  navigate,
  selectMapRegion,
  choosePlace,
  readStory,
} = useAtlas();

const mapView = ref<InstanceType<typeof ChinaMap>>();
async function locatePlace(place: CulturalPlace) {
  await choosePlace(place);
  // Repeating the same button must refocus after zoom/reset as well.
  mapView.value?.focusPlace(place);
}
</script>
<template>
  <section
    id="section-map"
    class="ethnic-page-section"
    aria-label="民族分布"
  >
    <div class="unified-section-title">
      <span>01</span>
      <h2>{{ ethnicName }} · 民族分布</h2>
      <small>人口与地域</small>
    </div>
    <div class="map-workspace">
      <div class="map-main-column">
        <div class="overview-strip">
          <div>
            <span>
              大陆{{ ethnicName }}人口
              <small>2020</small>
            </span>
            <strong>
              {{ formatPeople(ethnic.national2020) }}
              <em>人</em>
            </strong>
          </div>
          <div v-if="isGaoshan">
            <span>
              台湾原住民人口
              <small>{{ taiwan.period }}</small>
            </span>
            <strong>
              {{ formatPeople(taiwan.population) }}
              <em>人</em>
            </strong>
          </div>
          <div v-else>
            <span>
              省级数据覆盖
              <small>{{ populationYear }}</small>
            </span>
            <strong>
              {{ covered }}
              <em>/ 31 地区</em>
            </strong>
          </div>
          <div>
            <span>主要分布地区</span>
            <strong class="region-stat">
              {{ ethnic.majorRegions.slice(0, 2).join('、') }}
              <em v-if="ethnic.majorRegions.length > 2">等地</em>
            </strong>
          </div>
        </div>
        <section class="map-card card">
          <div class="map-card-header">
            <div class="section-label">
              <Icon
                name="map"
                :size="18"
              />
              <h2>{{ ethnicName }}人口分布</h2>
            </div>
            <div class="segmented">
              <button
                :class="{ selected: metric === 'share' }"
                @click="metric = 'share'"
              >
                人口占比
              </button>
              <button
                :class="{ selected: metric === 'population' }"
                @click="metric = 'population'"
              >
                人口数量
              </button>
            </div>
          </div>
          <div class="population-edition">
            <label>
              人口普查年份
              <select
                v-model="populationYear"
                aria-label="人口普查年份"
              >
                <option
                  :value="2020"
                  :disabled="!populationEditions[2020]"
                >
                  2020 · 第七次普查
                </option>
                <option
                  :value="2010"
                  :disabled="!populationEditions[2010]"
                >
                  2010 · 第六次普查
                </option>
              </select>
            </label>
            <span>地图、地区排名、比较与导出同步切换</span>
          </div>
          <ChinaMap
            ref="mapView"
            v-if="data"
            :regions="regions"
            :ethnic="ethnicName"
            :metric="metric"
            :selected="selectedCode"
            :labels="labels"
            :year="populationYear"
            :places="placesVisible"
            :place="selectedPlace"
            @select="selectMapRegion"
            @site="choosePlace($event, true)"
          />
          <div
            v-else
            class="data-map-placeholder"
          >
            <span class="spinner" />
            {{ error || '正在读取人口分布数据…' }}
          </div>
          <div class="map-legend">
            <div>
              <span class="legend-title">
                {{ metric === 'share' ? '地区人口占比' : '民族人口 / 人' }}
              </span>
              <span
                v-for="(color, i) in palette"
                :key="color"
                class="legend-item"
              >
                <i :style="{ background: color }" />
                {{ legendLabels[i] }}
              </span>
              <span class="legend-item">
                <i class="no-data" />
                暂无数据
              </span>
            </div>
            <label class="label-toggle">
              <input
                v-model="labels"
                type="checkbox"
              />
              地区名称
            </label>
          </div>
          <div class="map-source">
            来源：大陆省级普查（{{ populationYear }}）
            <span
              v-if="isGaoshan"
              class="taiwan-map-note"
            >
              · 台湾虚线区域：2026-09 户籍参考
            </span>
            <button @click="navigate('sources')">
              查看口径
              <Icon
                name="external"
                :size="12"
              />
            </button>
          </div>
        </section>
        <section class="quick-analysis card">
          <div class="quick-analysis-icon">
            <Icon
              name="chart"
              :size="22"
            />
          </div>
          <div>
            <h3>从空间分布，发现更多</h3>
            <p v-if="topPopulation.length">
              {{ populationYear }} 年已收录地区中，{{ ethnicName }}人口数量最多的地区为
              <strong>{{ topPopulation[0]?.name }}</strong>
              ，前五地区合计占已收录该民族人口的
              <strong>{{ concentrationValue?.toFixed(1) }}%</strong>
              。
            </p>
            <p v-else>选择民族查看人口分布分析。</p>
          </div>
          <button
            class="text-button"
            @click="navigate('analysis')"
          >
            完整分析
            <Icon
              name="arrow"
              :size="16"
            />
          </button>
        </section>
        <ModuleMeta
          :period="`省级人口${populationYear}年；定性地区资料另见原文`"
          scope="县级代表点仅提供地方阅读入口，底图不表示县级人口密度。"
          :sources="[
            {
              name: '省级人口原表',
              url: data?.sourceUrl ?? 'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm',
            },
          ]"
        />
        <label class="places-toggle">
          <input
            v-model="placesVisible"
            type="checkbox"
          />
          显示州县文化代表点（点击查看线索）
        </label>
        <CulturalPlaces
          :name="ethnicName"
          :selected="selectedPlace"
          @select="locatePlace"
          @culture="navigate('culture')"
          @story="readStory"
        />
        <TaiwanPopulation
          v-if="isGaoshan"
          class="card"
          @select="selectMapRegion('710000')"
        />
      </div>
      <aside class="detail-column">
        <section
          id="region-details"
          class="region-detail card"
        >
          <div class="section-label">
            <Icon
              name="pin"
              :size="17"
            />
            <h2>
              {{
                selectedRegion?.name ??
                (isGaoshan && selectedCode === '710000' ? '台湾' : '地区详情')
              }}
            </h2>
            <span class="tiny-badge">
              {{
                selectedRegion || (isGaoshan && selectedCode === '710000') ? '已选择' : '点击地图'
              }}
            </span>
          </div>
          <template v-if="selectedRegion">
            <p class="detail-subtitle">{{ ethnicName }} · {{ populationYear }} 年人口普查</p>
            <dl class="detail-metrics">
              <div>
                <dt>民族人口</dt>
                <dd>
                  {{ formatPeople(selectedRegion.populations[ethnicName]) }}
                  <small>人</small>
                </dd>
              </div>
              <div>
                <dt>当地人口占比</dt>
                <dd>
                  {{ formatMetric(mapValue(selectedRegion, ethnicName, 'share'), 'share') }}
                </dd>
              </div>
            </dl>
            <div class="economic-preview">
              <span>
                地区生产总值
                <small>2023</small>
              </span>
              <strong>
                {{ selectedEconomy?.gdp.toLocaleString('zh-CN') }}
                <em>亿元</em>
              </strong>
              <button
                class="text-button"
                @click="navigate('economy')"
              >
                查看地区经济
                <Icon
                  name="chevron"
                  :size="14"
                />
              </button>
            </div>
          </template>
          <TaiwanPopulation
            v-else-if="isGaoshan && selectedCode === '710000'"
            compact
          />
          <div
            v-else
            class="empty-detail"
          >
            <Icon
              name="map"
              :size="30"
            />
            <p>
              {{
                ['710000', '810000', '820000'].includes(selectedCode ?? '')
                  ? '本版未收录该地区同口径人口和经济数据。'
                  : '点击地图中的地区，查看人口与经济信息。'
              }}
            </p>
          </div>
        </section>
        <section
          class="reform-entry"
          @click="navigate('reform')"
        >
          <span class="reform-entry-icon">
            <Icon
              name="clock"
              :size="22"
            />
          </span>
          <div>
            <small>民族发展专题</small>
            <h3>{{ ethnicName }} · 民族发展</h3>
            <p>{{ development.feature }}</p>
          </div>
          <button :aria-label="`查看${ethnicName}民族发展专题`">
            <Icon
              name="arrow"
              :size="19"
            />
          </button>
        </section>
      </aside>
    </div>
  </section>
</template>
