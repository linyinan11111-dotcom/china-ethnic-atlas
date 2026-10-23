<script setup lang="ts">
import { computed } from 'vue';
import { culturalPlaces, type CulturalPlace } from '../data/places';
import { ethnicDevelopment } from '../data/development';
const props = defineProps<{ name: string; selected: string | null }>();
const emit = defineEmits<{ select: [place: CulturalPlace]; culture: []; story: [] }>();
const places = computed(() => culturalPlaces.filter((p) => p.ethnic === props.name));
</script>
<template>
  <section
    class="cultural-places"
    aria-label="代表性地区与文化线索"
  >
    <div class="table-heading">
      <h2>走近具体的地方</h2>
      <span>州县代表点 · 文化与生活</span>
    </div>
    <p class="places-note">
      代表点定位到行政地区，不是村落或景点的精确位置，也不表示完整聚居范围。{{
        name === '高山族' ? '这里的点位仅对应大陆记录；台湾社群见独立户籍资料。' : ''
      }}
    </p>
    <article
      v-for="place in places"
      :key="place.id"
      :data-place="place.id"
      :class="{ chosen: selected === place.id }"
    >
      <button
        class="place-select"
        @click="emit('select', place)"
      >
        <span>{{ place.kind }}</span>
        <strong>{{ place.name }}</strong>
        <small>地图定位 ↗</small>
      </button>
      <div class="place-copy">
        <p>{{ ethnicDevelopment[name].feature }}</p>
        <div>
          <button
            class="text-button"
            @click="emit('culture')"
          >
            阅读文化栏目
          </button>
          <button
            class="text-button"
            @click="emit('story')"
          >
            阅读地方故事
          </button>
          <a
            :href="place.source.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            地区资料原文 ↗
          </a>
        </div>
      </div>
    </article>
    <p
      v-if="!places.length"
      class="places-note"
    >
      本民族的州县点位尚待补充核查，可以先阅读省级分布与地方故事。
    </p>
    <p class="places-meta">地区资料核查：2026-10-10 · 坐标：DataV 行政区参考点 · 无县级人口估算</p>
  </section>
</template>
<style scoped>
.cultural-places {
  border-top: 1px solid var(--rule);
  padding: 24px 0;
}
.places-note {
  font-size: 12px;
  line-height: 1.9;
  color: #727a69;
  margin: 15px 0;
}
.cultural-places article {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  border-top: 1px solid var(--rule);
  padding: 22px 0;
  gap: 24px;
}
.place-select {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: 10px;
  background: none;
  color: var(--ink);
}
.place-select span,
.place-select small {
  font-size: 11px;
  color: var(--theme-accent);
}
.place-select strong {
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.7;
}
.place-copy p {
  font-size: 14px;
  line-height: 1.9;
  color: #65705d;
}
.place-copy > div {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 18px;
  align-items: center;
}
.place-copy a {
  font-size: 11px;
  color: var(--theme-accent);
}
.chosen {
  border-left: 3px solid var(--theme-accent);
  padding-left: 15px !important;
}
.places-meta {
  font-size: 10px;
  color: #7b846f;
  margin-top: 15px;
}
@media (max-width: 760px) {
  .cultural-places article {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .table-heading {
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
