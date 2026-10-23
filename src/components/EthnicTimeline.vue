<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { ethnicTimelines } from '../data/ethnic-timeline';
import { ethnicDevelopment } from '../data/development';
import Icon from './Icon.vue';
import { scrollToContent } from '../utils/content-navigation';
const props = defineProps<{ name: string }>();
const events = computed(() => ethnicTimelines[props.name]);
const profile = computed(() => ethnicDevelopment[props.name]);
const selectedId = ref('');
const list = ref<HTMLElement | null>(null);
const detail = ref<HTMLElement | null>(null);
const selected = computed(
  () => events.value.find((item) => item.id === selectedId.value) ?? events.value[0],
);
const categories = computed(() => [...new Set(events.value.map((item) => item.category))]);
watch(
  () => props.name,
  async () => {
    selectedId.value = (events.value.find((item) => item.year >= 1978) ?? events.value[0]).id;
    await nextTick();
    list.value?.scrollTo({ top: 0, left: 0 });
  },
  { immediate: true },
);
const previous = computed(
  () => events.value.findIndex((item) => item.id === selected.value.id) - 1,
);
async function selectEvent(id: string) {
  selectedId.value = id;
  await nextTick();
  const node = list.value?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (node && list.value) {
    const container = list.value.getBoundingClientRect(),
      rect = node.getBoundingClientRect();
    if (window.matchMedia('(max-width:650px)').matches)
      list.value.scrollLeft += rect.left - container.left;
    else if (rect.top < container.top || rect.bottom > container.bottom)
      list.value.scrollTop += rect.top - container.top;
  }
  scrollToContent(detail.value);
}
function step(offset: number) {
  const index = events.value.findIndex((item) => item.id === selected.value.id) + offset;
  if (index >= 0 && index < events.value.length) {
    selectEvent(events.value[index].id);
  }
}
</script>

<template>
  <section
    class="card ethnic-timeline"
    :data-timeline-ethnic="name"
    aria-labelledby="ethnic-timeline-title"
  >
    <div class="ethnic-timeline-heading">
      <div>
        <p class="eyebrow">A COMMUNITY THROUGH TIME</p>
        <h2 id="ethnic-timeline-title">{{ name }} · 发展历程时间轴</h2>
      </div>
      <span class="tiny-badge">
        {{ events.length }} 个节点 · {{ events[0].period }}—{{ events[events.length - 1].period }}
      </span>
    </div>
    <p class="ethnic-timeline-intro">
      {{ profile.feature }}。沿着本民族的历史、生活与文化记录，阅读{{ profile.place }}的发展变化。
    </p>
    <div class="ethnic-timeline-topics">
      <span
        v-for="category in categories"
        :key="category"
      >
        {{ category }}
      </span>
    </div>
    <p
      v-if="name === '高山族'"
      class="ethnic-timeline-scope"
    >
      台湾社群的教育文化历程与大陆福建的保护项目分别标注；不以大陆改革开放政策替代台湾社群的发展史。
    </p>
    <div class="ethnic-timeline-layout">
      <div
        ref="list"
        class="ethnic-timeline-list"
        role="group"
        :aria-label="name + '发展节点'"
      >
        <button
          v-for="event in events"
          :key="event.id"
          class="ethnic-timeline-node"
          :class="{ selected: event.id === selected.id }"
          :aria-pressed="event.id === selected.id"
          :aria-label="event.period + ' · ' + event.title"
          @click="selectEvent(event.id)"
        >
          <span class="ethnic-timeline-dot" />
          <strong>{{ event.period }}</strong>
          <span class="ethnic-timeline-node-copy">
            <small>{{ event.category }}</small>
            <span>{{ event.title }}</span>
          </span>
        </button>
      </div>
      <article
        ref="detail"
        class="ethnic-timeline-detail"
        aria-live="polite"
        aria-atomic="true"
      >
        <div class="ethnic-timeline-detail-top">
          <span class="ethnic-timeline-period">{{ selected.period }}</span>
          <span class="tiny-badge">
            {{
              name === '高山族'
                ? selected.category === '文化保护'
                  ? '大陆文化保护'
                  : '台湾社群历程'
                : selected.year < 1978
                  ? '历史基础'
                  : '改革开放以来'
            }}
          </span>
        </div>
        <span class="ethnic-timeline-category">{{ selected.category }}</span>
        <h3>{{ selected.title }}</h3>
        <p class="ethnic-timeline-region">
          <Icon
            name="pin"
            :size="14"
          />
          {{ selected.region }}
        </p>
        <p>{{ selected.text }}</p>
        <ul
          v-if="selected.items"
          class="ethnic-timeline-records"
        >
          <li
            v-for="item in selected.items"
            :key="item.title"
          >
            <strong>{{ item.title }}</strong>
            <p>{{ item.text }}</p>
          </li>
        </ul>
        <div class="ethnic-timeline-sources">
          <a
            v-for="source in selected.sources"
            :key="source.url"
            :href="source.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ source.publisher }} · 阅读原文
            <Icon
              name="external"
              :size="12"
            />
          </a>
        </div>
        <div class="ethnic-timeline-paging">
          <button
            class="text-button"
            :disabled="previous < 0"
            aria-label="上一个发展节点"
            @click="step(-1)"
          >
            ← 上一节点
          </button>
          <span>{{ previous + 2 }} / {{ events.length }}</span>
          <button
            class="text-button"
            :disabled="previous + 2 >= events.length"
            aria-label="下一个发展节点"
            @click="step(1)"
          >
            下一节点 →
          </button>
        </div>
      </article>
    </div>
    <p class="ethnic-timeline-note">
      按事件发生时间排列，同一年可有多个独立节点。地区建设通常惠及当地各民族；这里收录的是有来源的精选历程，历史资料中的状态不作为今日统计。
    </p>
  </section>
</template>

<style scoped>
.ethnic-timeline {
  padding: 26px;
  min-width: 0;
}
.ethnic-timeline-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.ethnic-timeline-heading h2 {
  font-family: var(--serif);
  color: var(--theme-ink);
  font-size: 24px;
  margin-top: 10px;
  line-height: 1.5;
}
.ethnic-timeline-intro {
  font-size: 12px;
  line-height: 2;
  color: #657365;
  margin-top: 14px;
}
.ethnic-timeline-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 16px 0 20px;
}
.ethnic-timeline-topics span {
  font-size: 10px;
  color: var(--theme-accent);
  border: 1px solid var(--theme-border);
  border-radius: 20px;
  padding: 5px 10px;
}
.ethnic-timeline-layout {
  display: grid;
  grid-template-columns: minmax(210px, 0.85fr) minmax(0, 1.4fr);
  gap: 23px;
  align-items: start;
}
.ethnic-timeline-list {
  max-height: 540px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--theme-border) transparent;
  padding: 2px 8px 2px 0;
}
.ethnic-timeline-node {
  position: relative;
  display: grid;
  grid-template-columns: 14px 75px minmax(0, 1fr);
  align-items: start;
  gap: 9px;
  padding: 15px 10px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  line-height: 1.7;
}
.ethnic-timeline-node:before {
  content: '';
  position: absolute;
  width: 1px;
  background: var(--theme-border);
  top: 0;
  bottom: 0;
  left: 17px;
}
.ethnic-timeline-node:first-child:before {
  top: 22px;
}
.ethnic-timeline-node:last-child:before {
  bottom: calc(100% - 23px);
}
.ethnic-timeline-dot {
  position: relative;
  width: 8px;
  height: 8px;
  background: #c4cdc1;
  border: 2px solid #fffefb;
  border-radius: 50%;
  margin-top: 7px;
  z-index: 1;
}
.ethnic-timeline-node > strong {
  color: var(--theme-accent);
  font-family: var(--serif);
  font-size: 17px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
.ethnic-timeline-node-copy {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 11px;
  color: var(--theme-ink);
  overflow-wrap: anywhere;
}
.ethnic-timeline-node-copy small {
  color: #758278;
  font-size: 10px;
}
.ethnic-timeline-node:hover {
  background: var(--theme-pale);
}
.ethnic-timeline-node.selected {
  background: var(--theme-soft);
}
.ethnic-timeline-node.selected .ethnic-timeline-dot {
  background: var(--theme-accent);
  box-shadow: 0 0 0 3px var(--theme-light);
}
.ethnic-timeline-node.selected .ethnic-timeline-node-copy {
  font-weight: 600;
}
.ethnic-timeline-detail {
  min-width: 0;
  padding: 25px;
  background: var(--theme-pale);
  border: 1px solid var(--theme-border);
  border-radius: 9px;
}
.ethnic-timeline-detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
}
.ethnic-timeline-period {
  font-family: var(--serif);
  font-size: 43px;
  color: var(--theme-accent);
  line-height: 1.2;
}
.ethnic-timeline-category {
  display: block;
  color: var(--theme-accent);
  font-size: 10px;
  margin-top: 23px;
  letter-spacing: 1px;
}
.ethnic-timeline-detail h3 {
  font-family: var(--serif);
  color: var(--theme-ink);
  font-size: 23px;
  line-height: 1.65;
  margin: 8px 0 13px;
  overflow-wrap: anywhere;
}
.ethnic-timeline-detail p {
  font-size: 12px;
  color: #657365;
  line-height: 2;
}
.ethnic-timeline-detail .ethnic-timeline-region {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-bottom: 15px;
  color: var(--theme-accent);
  font-size: 11px;
}
.ethnic-timeline-region svg {
  margin-top: 4px;
}
.ethnic-timeline-sources {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.ethnic-timeline-sources a {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--theme-accent);
  font-size: 10px;
  line-height: 1.8;
}
.ethnic-timeline-sources a:hover {
  text-decoration: underline;
}
.ethnic-timeline-paging {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  border-top: 1px solid var(--theme-border);
  margin-top: 25px;
  padding-top: 18px;
}
.ethnic-timeline-paging > span {
  font-size: 10px;
  color: #758278;
}
.ethnic-timeline-note {
  font-size: 10px;
  line-height: 1.9;
  color: #758278;
  margin-top: 19px;
}
.ethnic-timeline-scope {
  font-size: 11px;
  line-height: 1.9;
  padding: 13px;
  border-left: 3px solid var(--theme-accent);
  background: var(--theme-pale);
  color: #657365;
  margin-bottom: 18px;
}
.ethnic-timeline-records {
  padding-left: 16px;
  margin: 18px 0 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--theme-accent);
}
.ethnic-timeline-records strong {
  font-size: 12px;
  line-height: 1.8;
  color: var(--theme-ink);
}
.ethnic-timeline-records p {
  font-size: 11px;
  margin-top: 5px;
}
@media (max-width: 1100px) {
  .ethnic-timeline-layout {
    grid-template-columns: minmax(180px, 1fr) minmax(0, 1.3fr);
    gap: 15px;
  }
  .ethnic-timeline-node {
    grid-template-columns: 14px 56px minmax(0, 1fr);
    gap: 7px;
  }
  .ethnic-timeline-node > strong {
    font-size: 15px;
  }
  .ethnic-timeline-detail {
    padding: 21px;
  }
}
@media (max-width: 650px) {
  .ethnic-timeline {
    padding: 22px 18px;
  }
  .ethnic-timeline-heading h2 {
    font-size: 21px;
  }
  .ethnic-timeline-intro {
    font-size: 11px;
  }
  .ethnic-timeline-layout {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .ethnic-timeline-list {
    display: flex;
    max-height: none;
    overflow-x: auto;
    gap: 8px;
    padding: 5px 2px 14px;
  }
  .ethnic-timeline-node {
    display: flex;
    flex-direction: column;
    flex: 0 0 155px;
    gap: 8px;
    border: 1px solid var(--theme-border);
    padding: 13px;
    min-height: 145px;
    scroll-margin: 6px;
  }
  .ethnic-timeline-node:before,
  .ethnic-timeline-dot {
    display: none;
  }
  .ethnic-timeline-node > strong {
    font-size: 22px;
  }
  .ethnic-timeline-node-copy {
    font-size: 11px;
    gap: 7px;
  }
  .ethnic-timeline-detail h3 {
    font-size: 22px;
  }
  .ethnic-timeline-period {
    font-size: 39px;
  }
  .ethnic-timeline-topics {
    margin-bottom: 15px;
  }
}
</style>
