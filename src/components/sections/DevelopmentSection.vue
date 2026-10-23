<script setup lang="ts">
import Icon from '../Icon.vue';
import EthnicDevelopment from '../EthnicDevelopment.vue';
import { useAtlas } from '../../composables/atlasContext';
import { reformEvents, reformSource } from '../../data/reform';

const { ethnicName, ethnic, isGaoshan, regions, navigate, exploreDevelopmentRegion } = useAtlas();
</script>
<template>
  <section
    id="section-reform"
    class="ethnic-page-section reform-page"
    aria-label="民族发展"
  >
    <div class="unified-section-title">
      <span>05</span>
      <h2>{{ ethnicName }} · 民族发展</h2>
      <small>民族自身的历程</small>
    </div>
    <EthnicDevelopment
      :ethnic="ethnic"
      :regions="regions"
      embedded
      @map="navigate('map')"
      @region="exploreDevelopmentRegion"
    />
    <details class="card national-reform-context">
      <summary>
        全国共同政策背景
        <span>展开参考 · 1978—2021</span>
      </summary>
      <p>
        以下为大陆改革开放与减贫的共同政策背景。各民族的具体事件、地区与来源已在上方时间轴分别展示。
        <span v-if="isGaoshan">台湾社群的发展历程采用独立的文化教育资料。</span>
      </p>
      <ol>
        <li
          v-for="event in reformEvents"
          :key="event.year"
        >
          <strong>{{ event.year }} · {{ event.title }}</strong>
          <p>{{ event.description }}</p>
        </li>
      </ol>
      <a
        :href="reformSource"
        target="_blank"
        rel="noopener noreferrer"
      >
        《人类减贫的中国实践》白皮书
        <Icon
          name="external"
          :size="13"
        />
      </a>
    </details>
  </section>
</template>
