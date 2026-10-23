<script setup lang="ts">
import Icon from '../Icon.vue';
import EthnicCulture from '../EthnicCulture.vue';
import LocalStory from '../LocalStory.vue';
import ModuleMeta from '../ModuleMeta.vue';
import { useAtlas } from '../../composables/atlasContext';
import { catalogueSource, nationalSource } from '../../data/catalogue';
import { formatPeople } from '../../utils/analysis.mjs';

const { ethnicName, ethnic, navigate } = useAtlas();
</script>
<template>
  <section
    id="section-culture"
    class="ethnic-page-section content-column"
    aria-label="民族介绍"
  >
    <div class="unified-section-title">
      <span>02</span>
      <h2>{{ ethnicName }} · 民族介绍</h2>
      <small>文化与生活</small>
    </div>
    <section class="culture-hero card">
      <div class="culture-margin">
        <span>CULTURE & LIFE</span>
        <strong>
          各美其美
          <br />
          美美与共
        </strong>
        <small>
          服饰、语言与日常生活
          <br />
          共同构成文化的面貌
        </small>
      </div>
      <div class="culture-hero-copy">
        <p class="eyebrow">CULTURAL PORTRAIT</p>
        <h2>{{ ethnicName }}的文化与生活</h2>
        <p>{{ ethnic.description }}</p>
        <div class="culture-tags">
          <span
            v-for="c in ethnic.culture"
            :key="c"
          >
            {{ c }}
          </span>
        </div>
        <p class="photo-art-note">
          开篇服饰插画为文化示意；同一民族的服饰也因地区、场合和时代而异。
        </p>
      </div>
    </section>
    <div class="three-cards">
      <section class="card info-card">
        <Icon name="users" />
        <span>大陆普查人口 · 2020</span>
        <strong>{{ formatPeople(ethnic.national2020) }}人</strong>
        <a
          :href="nationalSource"
          target="_blank"
          rel="noopener noreferrer"
        >
          人口普查原表
          <Icon
            name="external"
            :size="13"
          />
        </a>
      </section>
      <section class="card info-card">
        <Icon name="pin" />
        <span>主要分布地区</span>
        <strong class="small-text">{{ ethnic.majorRegions.join('、') }}</strong>
        <a
          :href="catalogueSource"
          target="_blank"
          rel="noopener noreferrer"
        >
          统计年鉴原表
          <Icon
            name="external"
            :size="13"
          />
        </a>
      </section>
      <section class="card info-card">
        <Icon name="book" />
        <span>语言概况</span>
        <strong class="small-text">{{ ethnic.language }}</strong>
        <small>文化简介为编辑概述</small>
      </section>
    </div>
    <EthnicCulture :name="ethnicName" />
    <LocalStory
      :name="ethnicName"
      @development="navigate('reform')"
      @map="navigate('map')"
    />
    <ModuleMeta
      period="传统文化背景资料；人口2020年"
      scope="文化材料记述历史传统与地方例子，不表示当代所有人的生活习惯。"
      :sources="[
        {
          name: '国家民委民族资料',
          url: 'https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml',
        },
        { name: '主要分布地区', url: catalogueSource },
      ]"
    />
  </section>
</template>
