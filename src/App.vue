<script setup lang="ts">
import Icon from './components/Icon.vue';
import EthnicSearch from './components/EthnicSearch.vue';
import { provideAtlas } from './composables/atlasContext';
import { useAtlasController } from './composables/useAtlasController';
import { ref } from 'vue';
import { useGlassLight } from './composables/useGlassLight';
import AtlasHeader from './components/layout/AtlasHeader.vue';
import AtlasCover from './components/layout/AtlasCover.vue';
import EthnicDirectory from './components/layout/EthnicDirectory.vue';
import EthnicSectionNav from './components/layout/EthnicSectionNav.vue';
import DistributionSection from './components/sections/DistributionSection.vue';
import CultureSection from './components/sections/CultureSection.vue';
import AnalysisSection from './components/sections/AnalysisSection.vue';
import EconomySection from './components/sections/EconomySection.vue';
import DevelopmentSection from './components/sections/DevelopmentSection.vue';
import SourcesSection from './components/sections/SourcesSection.vue';
import AtlasFooter from './components/layout/AtlasFooter.vue';
const atlas = useAtlasController();
const surface = ref<HTMLElement>();
useGlassLight(surface);
provideAtlas(atlas);
const {
  themeStyles,
  ethnicName,
  tab,
  error,
  loading,
  loadData,
  mobileMenu,
  toast,
  searchOpen,
  pickSearchResult,
} = atlas;
</script>
<template>
  <div
    ref="surface"
    class="atlas-app"
    :style="themeStyles"
    :data-theme="ethnicName"
  >
    <AtlasHeader />
    <main class="page-shell">
      <AtlasCover />
      <div
        v-if="error"
        class="error-banner"
        role="alert"
      >
        {{ error }}
        <button
          :disabled="loading"
          @click="loadData"
        >
          {{ loading ? '正在重试…' : '重新加载' }}
        </button>
      </div>
      <div class="mobile-picker">
        <button
          class="outline-button"
          @click="mobileMenu = !mobileMenu"
        >
          <Icon
            name="users"
            :size="17"
          />
          当前民族：{{ ethnicName }}
          <Icon
            name="chevron"
            :size="15"
          />
        </button>
      </div>
      <div
        class="workspace"
        :class="{ 'full-page': tab === 'sources' }"
      >
        <EthnicDirectory v-show="tab !== 'sources'" />

        <div
          v-if="tab !== 'sources'"
          class="ethnic-page"
          :data-ethnic-page="ethnicName"
        >
          <EthnicSectionNav />
          <DistributionSection />

          <CultureSection />

          <AnalysisSection />

          <EconomySection />

          <DevelopmentSection />
        </div>

        <SourcesSection v-else />
      </div>
      <AtlasFooter />
    </main>
    <Transition name="toast">
      <div
        v-if="toast"
        class="toast-message"
        role="status"
      >
        <Icon
          name="check"
          :size="18"
        />
        {{ toast }}
      </div>
    </Transition>
    <Transition name="search-modal">
      <EthnicSearch
        v-if="searchOpen"
        :selected="ethnicName"
        @choose="pickSearchResult"
        @close="searchOpen = false"
      />
    </Transition>
  </div>
</template>
