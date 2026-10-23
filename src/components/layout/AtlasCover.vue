<script setup lang="ts">
import Icon from '../Icon.vue';
import EthnicPhoto from '../EthnicPhoto.vue';
import { useAtlas } from '../../composables/atlasContext';
import { sourcesHeading } from '../../config/navigation';

const { tab, ethnicName, ethnic, editionNumber, development, theme, data, exportCsv } = useAtlas();
</script>
<template>
  <section
    class="page-heading"
    :class="{ 'magazine-cover': tab !== 'sources' }"
  >
    <div
      v-if="tab !== 'sources'"
      class="cover-folio"
    >
      <span>山河同心 / 民族人文志</span>
      <span>民族专题 · {{ editionNumber }} / 56</span>
    </div>
    <div class="cover-copy">
      <p class="eyebrow">
        <span></span>
        {{ tab === 'sources' ? 'SOURCES & METHODOLOGY' : 'A PORTRAIT OF COMMUNITY' }}
      </p>
      <h1>{{ tab === 'sources' ? sourcesHeading.title : ethnicName }}</h1>
      <p
        v-if="tab !== 'sources'"
        class="cover-feature"
      >
        {{ development.feature }}
      </p>
      <p class="heading-description">
        {{ tab === 'sources' ? sourcesHeading.description : ethnic.description }}
      </p>
      <div
        v-if="tab !== 'sources'"
        class="cover-regions"
      >
        <Icon
          name="pin"
          :size="14"
        />
        <span>{{ ethnic.majorRegions.slice(0, 5).join(' / ') }}</span>
      </div>
      <div
        v-if="tab !== 'sources'"
        class="cover-keywords"
      >
        <span
          v-for="word in ethnic.culture"
          :key="word"
        >
          {{ word }}
        </span>
      </div>
    </div>
    <EthnicPhoto
      v-if="tab !== 'sources'"
      :name="ethnicName"
      large
      class="cover-photo"
    />
    <div class="heading-tools">
      <span class="theme-indicator">
        <i :style="{ background: theme.accent }" />
        {{ theme.label }}
      </span>
      <span
        v-if="tab !== 'sources'"
        class="cover-reading-note"
      >
        从地域到生活，从文化到发展
      </span>
      <button
        class="outline-button"
        :disabled="!data"
        @click="exportCsv"
      >
        <Icon
          name="download"
          :size="16"
        />
        导出数据
      </button>
    </div>
  </section>
</template>
