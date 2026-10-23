<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import milestones from '../data/ethnic-milestones.json';
import recentCases from '../data/recent-cases.json';
import { ethnicDevelopment } from '../data/development';
const props = defineProps<{ name: string }>();
const category = ref('all');
const records = computed(() =>
  [...milestones, ...recentCases]
    .filter((item) => item.name === props.name && item.year >= 1978)
    .sort((a, b) => b.year - a.year),
);
const categories = computed(() => [...new Set(records.value.map((r) => r.category))]);
const visible = computed(() =>
  records.value.filter((r) => category.value === 'all' || r.category === category.value),
);
const recent = computed(() => ethnicDevelopment[props.name].achievements[0]);
watch(
  () => props.name,
  () => (category.value = 'all'),
);
</script>
<template>
  <section
    class="development-cases"
    aria-label="具体地区发展案例"
  >
    <div class="table-heading">
      <h2>把发展放回具体的地方</h2>
      <span>{{ records.length }} 个已核查案例</span>
    </div>
    <p class="cases-intro">
      交通、教育与生产生活，分别对应地方的具体变化。按原文支持的事件年份展示；不同民族的案例数量与年份可以不同。
    </p>
    <div
      class="case-filters"
      role="group"
      aria-label="发展案例类别筛选"
    >
      <button
        :class="{ selected: category === 'all' }"
        @click="category = 'all'"
      >
        全部案例
      </button>
      <button
        v-for="item in categories"
        :key="item"
        :class="{ selected: category === item }"
        @click="category = item"
      >
        {{ item }}
      </button>
    </div>
    <div class="cases-grid">
      <article
        v-for="item in visible"
        :key="item.year + item.title"
      >
        <span>{{ item.period }} · {{ item.category }}</span>
        <h3>{{ item.title }}</h3>
        <small>{{ item.region }}</small>
        <p>{{ item.text }}</p>
        <a
          v-for="source in item.sources"
          :key="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ source.publisher }} · 原文 ↗
        </a>
      </article>
    </div>
    <p
      v-if="!visible.length"
      class="cases-intro"
    >
      该类别的具体地区案例尚待补充原文核查。
    </p>
    <aside v-if="recent">
      <span>较近的文化保护记录 · {{ recent.year }}</span>
      <strong>{{ recent.title }}</strong>
      <p>{{ recent.text }}</p>
      <a
        :href="recent.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ recent.publisher }} · 阅读原文 ↗
      </a>
    </aside>
    <p class="cases-meta">
      资料核查：2026-10-10 ·
      “较近”指已收录记录的年份，不代表当地最新统计。产业、就业和公共服务的新增成效仅在取得具体原文后收录。
    </p>
  </section>
</template>
<style scoped>
.development-cases {
  border-top: 1px solid var(--rule);
  padding: 28px 0;
}
.cases-intro {
  font-size: 12px;
  line-height: 2;
  color: #727a69;
  margin: 16px 0;
}
.case-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 22px 0;
}
.case-filters button {
  font-size: 11px;
  color: #6c765f;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--rule);
}
.case-filters button.selected {
  background: var(--theme-soft);
  color: var(--theme-deep);
  border-color: var(--theme-accent);
}
.cases-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}
.cases-grid article {
  border-top: 1px solid var(--rule);
  padding: 22px 0;
  min-width: 0;
}
.cases-grid article > span,
.development-cases aside > span {
  font-size: 11px;
  color: var(--theme-accent);
}
.cases-grid h3 {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.8;
  margin: 16px 0;
}
.cases-grid small {
  font-size: 11px;
  color: #7b846f;
}
.cases-grid p,
.development-cases aside p {
  font-size: 13px;
  line-height: 2.1;
  color: #69735f;
  margin: 15px 0;
}
.cases-grid a,
.development-cases aside a {
  display: block;
  font-size: 11px;
  line-height: 1.9;
  color: var(--theme-accent);
}
.development-cases aside {
  padding: 24px;
  background: var(--theme-pale);
  margin: 24px 0;
}
.development-cases aside strong {
  display: block;
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 400;
  line-height: 1.9;
  margin-top: 12px;
}
.cases-meta {
  font-size: 10px;
  line-height: 1.9;
  color: #7b846f;
}
@media (max-width: 760px) {
  .cases-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .table-heading {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
