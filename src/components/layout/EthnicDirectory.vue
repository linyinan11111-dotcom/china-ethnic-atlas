<script setup lang="ts">
import Icon from '../Icon.vue';
import { useAtlas } from '../../composables/atlasContext';
import { avatarUrl } from '../../data/avatars';
import { directoryRegions, directoryTopics } from '../../data/directory';
import { getEthnicTheme } from '../../utils/themes.mjs';
import { useEthnicDirectory } from '../../composables/useEthnicDirectory';

const { ethnicName, mobileMenu, openEthnic } = useAtlas();

const { search, filter, directoryRegion, directoryTopic, visibleEthnics, resetDirectory } =
  useEthnicDirectory();
</script>
<template>
  <aside
    class="ethnic-sidebar card"
    :class="{ expanded: mobileMenu }"
  >
    <div class="sidebar-top">
      <div class="section-label">
        <Icon
          name="users"
          :size="17"
        />
        <h2>民族目录</h2>
        <span class="count-badge">56</span>
      </div>
      <p>翻阅下一篇民族故事</p>
    </div>
    <label class="search-field">
      <Icon
        name="search"
        :size="16"
      />
      <input
        v-model="search"
        placeholder="民族 / 地区 / 文化关键词"
        aria-label="搜索民族名称"
        @keydown.enter="visibleEthnics[0] && openEthnic(visibleEthnics[0].name)"
      />
      <button
        v-if="search"
        class="clear-search"
        aria-label="清空搜索"
        @click="search = ''"
      >
        <Icon
          name="close"
          :size="13"
        />
      </button>
    </label>
    <div class="directory-filters">
      <select
        v-model="directoryRegion"
        aria-label="按主要分布地区筛选"
      >
        <option value="">全部主要地区</option>
        <option
          v-for="region in directoryRegions"
          :key="region"
        >
          {{ region }}
        </option>
      </select>
      <select
        v-model="directoryTopic"
        aria-label="按文化主题筛选"
      >
        <option value="">全部文化主题</option>
        <option
          v-for="topic in directoryTopics"
          :key="topic"
        >
          {{ topic }}
        </option>
      </select>
      <button
        v-if="directoryRegion || directoryTopic"
        class="text-button"
        @click="
          directoryRegion = '';
          directoryTopic = '';
        "
      >
        重置筛选
      </button>
    </div>
    <p
      v-if="search.trim() || directoryRegion || directoryTopic"
      class="sidebar-search-count"
      aria-live="polite"
    >
      找到 {{ visibleEthnics.length }} 个民族 · Enter 选择首项
    </p>
    <div class="sidebar-tabs">
      <button
        :class="{ selected: filter === 'all' }"
        @click="filter = 'all'"
      >
        全部民族
      </button>
      <button
        :class="{ selected: filter === 'popular' }"
        @click="filter = 'popular'"
      >
        常用选择
      </button>
    </div>
    <div class="ethnic-list">
      <button
        v-for="e in visibleEthnics"
        :key="e.name"
        class="ethnic-option"
        :class="{ selected: e.name === ethnicName }"
        @click="openEthnic(e.name)"
      >
        <span
          class="ethnic-avatar"
          :style="{ background: getEthnicTheme(e.name).soft }"
        >
          <img
            :src="avatarUrl(e.name)"
            alt=""
            loading="lazy"
          />
        </span>
        <span class="ethnic-option-copy">
          <strong>{{ e.name }}</strong>
          <small>{{ e.majorRegions.slice(0, 2).join(' · ') }}</small>
        </span>
        <i
          class="ethnic-theme-dot"
          :style="{ background: getEthnicTheme(e.name).accent }"
        />
        <Icon
          v-if="e.name === ethnicName"
          name="check"
          :size="16"
        />
        <Icon
          v-else
          name="chevron"
          :size="14"
        />
      </button>
      <div
        v-if="!visibleEthnics.length"
        class="empty-search"
      >
        未找到相关民族
        <br />
        <button @click="resetDirectory">查看全部民族</button>
      </div>
    </div>
    <div class="sidebar-note">
      <Icon
        name="globe"
        :size="17"
      />
      <span>
        多元一体，交融共生
        <small>共同书写中华民族的故事</small>
      </span>
    </div>
  </aside>
</template>
