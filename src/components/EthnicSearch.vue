<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { directoryGroups } from '../data/directory';
import { searchDirectory, ethnicSearchIndex } from '../utils/ethnic-search.mjs';
import { getEthnicTheme } from '../utils/themes.mjs';
import { avatarUrl } from '../data/avatars';
import Icon from './Icon.vue';
defineProps<{ selected: string }>();
const emit = defineEmits<{ choose: [name: string]; close: [] }>();
const input = ref<HTMLInputElement>();
const query = ref('');
const activeIndex = ref(0);
const results = computed(() => searchDirectory(directoryGroups, query.value));
const previousFocus = document.activeElement as HTMLElement | null;
const previousOverflow = document.body.style.overflow;
function choose(name: string) {
  emit('choose', name);
  emit('close');
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }
  const target = event.target as HTMLElement | null;
  const resultButton = target?.closest('.search-result');
  if (
    (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
    (target === input.value || resultButton)
  ) {
    event.preventDefault();
    activeIndex.value = results.value.length
      ? (activeIndex.value + (event.key === 'ArrowDown' ? 1 : -1) + results.value.length) %
        results.value.length
      : 0;
    nextTick(() => {
      const active = document.querySelector<HTMLElement>('.search-result.keyboard-active');
      active?.scrollIntoView({ block: 'nearest' });
      if (resultButton) active?.focus({ preventScroll: true });
    });
  } else if (
    event.key === 'Enter' &&
    event.target === input.value &&
    results.value[activeIndex.value]
  ) {
    event.preventDefault();
    choose(results.value[activeIndex.value].name);
  } else if (event.key === 'Tab') {
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.ethnic-search-dialog button, .ethnic-search-dialog input',
      ),
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }
}
watch(query, () => (activeIndex.value = 0));
onMounted(() => {
  document.body.style.overflow = 'hidden';
  input.value?.focus();
  document.addEventListener('keydown', keydown);
});
onBeforeUnmount(() => {
  document.body.style.overflow = previousOverflow;
  document.removeEventListener('keydown', keydown);
  previousFocus?.focus({ preventScroll: true });
});
</script>
<template>
  <div
    class="search-overlay"
    @click.self="emit('close')"
  >
    <section
      class="ethnic-search-dialog card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ethnic-search-title"
    >
      <div class="search-dialog-heading">
        <div>
          <p class="eyebrow">FIND YOUR NEXT DISCOVERY</p>
          <h2 id="ethnic-search-title">搜索民族，遇见新的故事。</h2>
        </div>
        <button
          class="dialog-close"
          aria-label="关闭民族搜索"
          @click="emit('close')"
        >
          <Icon name="close" />
        </button>
      </div>
      <div class="global-search-input">
        <Icon
          name="search"
          :size="22"
        />
        <input
          ref="input"
          v-model="query"
          placeholder="民族名称、拼音或首字母，例如：蒙古 / menggu / mgz"
          aria-label="全局民族搜索"
          aria-controls="ethnic-search-results"
        />
        <button
          v-if="query"
          aria-label="清空全局搜索"
          @click="query = ''"
        >
          <Icon
            name="close"
            :size="16"
          />
        </button>
        <kbd v-else>ESC</kbd>
      </div>
      <div
        class="search-results-summary"
        aria-live="polite"
      >
        <span>{{ query ? `找到 ${results.length} 个民族` : '探索全部 56 个民族' }}</span>
        <small>名称 · 拼音 · 地区 · 文化关键词</small>
      </div>
      <div
        id="ethnic-search-results"
        class="global-search-results"
      >
        <button
          v-for="(group, index) in results"
          :key="group.name"
          class="search-result"
          :class="{ 'keyboard-active': index === activeIndex, selected: group.name === selected }"
          :style="{
            '--result-accent': getEthnicTheme(group.name).accent,
            '--result-soft': getEthnicTheme(group.name).soft,
          }"
          @click="choose(group.name)"
          @mouseenter="activeIndex = index"
          @focus="activeIndex = index"
        >
          <img
            :src="avatarUrl(group.name)"
            alt=""
            loading="lazy"
          />
          <span>
            <strong>{{ group.name }}</strong>
            <small>
              {{ ethnicSearchIndex[group.name].pinyin }} ·
              {{ group.majorRegions.slice(0, 2).join('、') }}
            </small>
          </span>
          <i :style="{ background: getEthnicTheme(group.name).accent }" />
          <Icon
            :name="group.name === selected ? 'check' : 'chevron'"
            :size="16"
          />
        </button>
        <div
          v-if="!results.length"
          class="search-no-results"
        >
          <Icon
            name="search"
            :size="30"
          />
          <h3>暂未找到匹配的民族</h3>
          <p>试试民族、地区或文化名称；多个关键词用空格分隔。</p>
          <button
            class="outline-button"
            @click="query = ''"
          >
            查看全部民族
          </button>
        </div>
      </div>
      <div class="search-dialog-footer">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          选择
          <kbd>Enter</kbd>
          打开
        </span>
        <small>选择后同步更新地图、介绍与主题色</small>
      </div>
    </section>
  </div>
</template>
