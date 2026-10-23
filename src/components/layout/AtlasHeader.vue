<script setup lang="ts">
import Icon from '../Icon.vue';
import { useAtlas } from '../../composables/atlasContext';

const { tab, navigate, openGlobalSearch } = useAtlas();
</script>
<template>
  <header class="site-header">
    <a
      class="brand"
      href="#map"
      @click.prevent="navigate('map')"
    >
      <span class="brand-mark">
        <Icon
          name="mountain"
          :size="26"
        />
      </span>
      <span>
        <strong>山河同心</strong>
        <small>中国民族分布图谱</small>
      </span>
    </a>
    <div class="header-topic">
      <span>PEOPLE · PLACES · STORIES</span>
      <small>民族 · 地域 · 生活</small>
    </div>
    <div class="header-utilities">
      <button
        class="header-search"
        aria-label="打开民族搜索"
        @click="openGlobalSearch"
      >
        <Icon
          name="search"
          :size="16"
        />
        <span>搜索民族</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button
        class="source-link"
        :class="{ active: tab === 'sources' }"
        @click="navigate('sources')"
      >
        <Icon
          name="info"
          :size="17"
        />
        数据说明
      </button>
    </div>
  </header>
</template>
