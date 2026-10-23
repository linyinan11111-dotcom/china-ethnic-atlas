<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ethnicGroups, nationalSource, catalogueSource } from '../data/catalogue';
import { cultureProfiles } from '../data/culture';
import { ethnicTimelines } from '../data/ethnic-timeline';
import { ethnicDevelopment } from '../data/development';
import type { PopulationRegion } from '../types';
import { rankRegions, formatPeople, concentration } from '../utils/analysis.mjs';
import { getEthnicTheme } from '../utils/themes.mjs';
const props = defineProps<{ name: string; regions: PopulationRegion[] }>();
const emit = defineEmits<{ choose: [name: string] }>();
const left = ref(props.name),
  right = ref(props.name === '白族' ? '纳西族' : '白族'),
  category = ref('language');
const year = computed(() => props.regions[0]?.year ?? 2020);
watch(
  () => props.name,
  (name) => {
    left.value = name;
    if (right.value === name) right.value = ethnicGroups.find((g) => g.name !== name)!.name;
  },
);
function preventSame(side: string) {
  if (left.value === right.value) {
    if (side === 'left') right.value = ethnicGroups.find((g) => g.name !== left.value)!.name;
    else left.value = ethnicGroups.find((g) => g.name !== right.value)!.name;
  }
}
function swap() {
  const value = left.value;
  left.value = right.value;
  right.value = value;
}
const columns = computed(() =>
  [left.value, right.value].map((name) => ({
    group: ethnicGroups.find((g) => g.name === name)!,
    profile: ethnicDevelopment[name],
    culture: cultureProfiles[name].sections.find((s) => s.id === category.value)!,
    ranking: rankRegions(props.regions, name),
    concentration: concentration(props.regions, name),
    latest: ethnicTimelines[name].slice(-2),
    theme: getEthnicTheme(name),
  })),
);
</script>
<template>
  <section
    class="ethnic-comparison"
    aria-label="两民族专题比较"
  >
    <div class="table-heading">
      <h2>两篇民族专题，一起阅读</h2>
      <span>从相同维度理解不同地方</span>
    </div>
    <div class="compare-controls">
      <label>
        第一篇
        <select
          v-model="left"
          aria-label="第一比较民族"
          @change="preventSame('left')"
        >
          <option
            v-for="group in ethnicGroups"
            :key="group.name"
          >
            {{ group.name }}
          </option>
        </select>
      </label>
      <button
        class="outline-button"
        @click="swap"
      >
        ⇄ 交换
      </button>
      <label>
        第二篇
        <select
          v-model="right"
          aria-label="第二比较民族"
          @change="preventSame('right')"
        >
          <option
            v-for="group in ethnicGroups"
            :key="group.name"
          >
            {{ group.name }}
          </option>
        </select>
      </label>
    </div>
    <p class="compare-note">
      全国人口为大陆2020年普查；省级排名与集中度为{{
        year
      }}年。同年同口径比较，高山族的台湾户籍数据另列；文化条目展示地方差异。
    </p>
    <label class="compare-category">
      文化阅读栏目
      <select
        v-model="category"
        aria-label="比较文化栏目"
      >
        <option
          v-for="section in cultureProfiles[left].sections"
          :key="section.id"
          :value="section.id"
        >
          {{ section.label }}
        </option>
      </select>
    </label>
    <div class="compare-columns">
      <article
        v-for="column in columns"
        :key="column.group.name"
        :style="{ '--compare-accent': column.theme.accent }"
        :data-compare-ethnic="column.group.name"
      >
        <header>
          <span>ETHNIC PORTRAIT</span>
          <h3>{{ column.group.name }}</h3>
        </header>
        <dl>
          <div>
            <dt>大陆人口 · 2020</dt>
            <dd>
              {{ formatPeople(column.group.national2020) }} 人
              <a
                :href="nationalSource"
                target="_blank"
                rel="noopener noreferrer"
              >
                原表 ↗
              </a>
            </dd>
          </div>
          <div>
            <dt>主要分布地区 · 定性资料</dt>
            <dd>
              {{ column.group.majorRegions.join('、') }}
              <a
                :href="catalogueSource"
                target="_blank"
                rel="noopener noreferrer"
              >
                原表 ↗
              </a>
            </dd>
          </div>
          <div>
            <dt>省级人口最多地区 · {{ year }}</dt>
            <dd>
              {{ column.ranking[0]?.name ?? '—' }} · {{ formatPeople(column.ranking[0]?.value) }} 人
            </dd>
          </div>
          <div>
            <dt>前五地区集中度 · {{ year }}</dt>
            <dd>
              {{ column.concentration?.toFixed(1) ?? '—' }}%
              <small>分母：已收录地区本民族人口合计</small>
            </dd>
          </div>
          <div>
            <dt>语言概况</dt>
            <dd>{{ column.group.language }}</dd>
          </div>
        </dl>
        <section class="compare-culture">
          <h4>{{ column.culture.label }} · {{ column.culture.title }}</h4>
          <p>{{ column.culture.text }}</p>
          <a
            v-for="source in column.culture.sources"
            :key="source.url"
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ source.publisher }} · 原文 ↗
          </a>
        </section>
        <section class="compare-development">
          <h4>发展阅读线索</h4>
          <p>{{ column.profile.path }}</p>
          <div
            v-for="event in column.latest"
            :key="event.id"
          >
            <span>{{ event.period }} · {{ event.region }}</span>
            <strong>{{ event.title }}</strong>
            <a
              v-for="source in event.sources"
              :key="source.url"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ source.publisher }} ↗
            </a>
          </div>
        </section>
        <button
          class="text-button"
          @click="emit('choose', column.group.name)"
        >
          打开{{ column.group.name }}完整专题 →
        </button>
      </article>
    </div>
    <p class="compare-note">
      文化与发展资料核查：2026-10-10。所列最新节点是已收录资料的末端，不能据此判断发展程度或文化价值。
    </p>
  </section>
</template>
<style scoped>
.compare-columns {
  grid-template-rows: auto repeat(5, auto) auto auto auto;
}
.compare-columns article {
  display: grid;
  grid-row: 1 / span 9;
  grid-template-rows: subgrid;
}
.compare-columns dl {
  display: contents;
}
.compare-columns .text-button {
  align-self: start;
  justify-self: start;
}
@media (max-width: 760px) {
  .compare-columns dd {
    margin: 0;
  }
  .table-heading span {
    white-space: normal;
    line-height: 1.9;
  }
}
.ethnic-comparison {
  border-top: 2px solid var(--ink);
  padding: 28px 0;
}
.table-heading {
  flex-wrap: wrap;
  gap: 12px;
}
.compare-controls {
  display: flex;
  align-items: end;
  gap: 18px;
  margin: 24px 0;
}
.compare-controls label,
.compare-category {
  font-size: 12px;
  color: #727a69;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.compare-controls label {
  flex: 1;
}
.compare-controls select,
.compare-category select {
  background: #fffaf1;
  border: 1px solid var(--rule);
  padding: 10px;
  color: var(--ink);
  min-width: 0;
  max-width: 100%;
}
.compare-note {
  font-size: 11px;
  line-height: 1.9;
  color: #78816f;
  margin: 15px 0;
}
.compare-category {
  max-width: 220px;
  margin: 22px 0;
}
.compare-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}
.compare-columns article {
  min-width: 0;
  border-top: 3px solid var(--compare-accent);
  padding: 24px 0;
}
.compare-columns header span {
  letter-spacing: 2px;
  font-size: 10px;
  color: var(--compare-accent);
}
.compare-columns h3 {
  font-family: var(--serif);
  font-size: 30px;
  font-weight: 400;
  margin: 16px 0;
}
.compare-columns dl > div {
  padding: 14px 0;
  border-bottom: 1px solid var(--rule);
  min-height: 85px;
}
.compare-columns dt {
  font-size: 11px;
  color: #78816f;
  margin-bottom: 10px;
}
.compare-columns dd {
  font-size: 14px;
  line-height: 1.9;
  color: var(--ink);
}
.compare-columns a {
  font-size: 10px;
  color: var(--compare-accent);
  overflow-wrap: anywhere;
}
.compare-columns small {
  display: block;
  font-size: 10px;
  color: #7b846f;
}
.compare-columns h4 {
  font-family: var(--serif);
  font-size: 18px;
  font-weight: 400;
  margin: 25px 0 14px;
  line-height: 1.9;
}
.compare-columns p {
  font-size: 12px;
  line-height: 2.1;
  color: #69735f;
}
.compare-culture {
  min-height: 200px;
}
.compare-development > div {
  border-top: 1px solid var(--rule);
  margin: 18px 0;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.compare-development span {
  font-size: 10px;
  line-height: 1.9;
  color: #78816f;
}
.compare-development strong {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.9;
}
.compare-columns .text-button {
  margin-top: 18px;
}
@media (max-width: 760px) {
  .compare-columns {
    gap: 16px;
  }
  .compare-columns h3 {
    font-size: 23px;
  }
  .compare-controls {
    gap: 8px;
  }
  .compare-controls .outline-button {
    padding: 10px;
    font-size: 11px;
  }
  .compare-columns dd {
    font-size: 12px;
  }
  .compare-columns h4 {
    font-size: 15px;
  }
  .compare-culture {
    min-height: 0;
  }
}
</style>
