<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { EthnicGroup, PopulationRegion } from '../types';
import { ethnicDevelopment, sharedDevelopmentAchievement } from '../data/development';
import { economy, economySource } from '../data/economy';
import { rankRegions, formatPeople } from '../utils/analysis.mjs';
import EthnicPhoto from './EthnicPhoto.vue';
import Icon from './Icon.vue';
import EthnicTimeline from './EthnicTimeline.vue';
import DevelopmentCases from './DevelopmentCases.vue';
const props = withDefaults(
  defineProps<{
    ethnic: EthnicGroup;
    regions: PopulationRegion[];
    compact?: boolean;
    embedded?: boolean;
  }>(),
  { compact: false, embedded: false },
);
const emit = defineEmits<{ explore: []; map: []; region: [code: string] }>();
const profile = computed(() => ethnicDevelopment[props.ethnic.name]);
const achievementYear = ref('all');
const achievementYears = computed(() =>
  Array.from(new Set(profile.value.achievements.map((item) => item.year))).sort((a, b) => b - a),
);
const visibleAchievements = computed(() =>
  profile.value.achievements.filter(
    (item) => achievementYear.value === 'all' || item.year === Number(achievementYear.value),
  ),
);
watch(
  () => props.ethnic.name,
  () => (achievementYear.value = 'all'),
);
const regionalRows = computed(() => {
  const names =
    props.ethnic.name === '汉族'
      ? rankRegions(props.regions, props.ethnic.name)
          .slice(0, 3)
          .map((r) => r.name)
      : props.ethnic.majorRegions
          .filter((name) => economy.some((r) => r.name === name))
          .slice(0, 3);
  return names.map((name) => ({
    economy: economy.find((r) => r.name === name)!,
    population: props.regions.find((r) => r.name === name)?.populations[props.ethnic.name],
  }));
});
const populationYear = computed(() => props.regions[0]?.year ?? 2020);
const relatedToShared = computed(() => props.ethnic.name !== '高山族');
</script>

<template>
  <section
    class="ethnic-development"
    :class="{ 'development-compact': compact }"
    :data-development-ethnic="ethnic.name"
  >
    <div
      v-if="!embedded"
      class="development-heading"
    >
      <div>
        <p class="eyebrow">COMMUNITY & DEVELOPMENT</p>
        <h2>{{ ethnic.name }} · 民族发展</h2>
      </div>
      <span class="tiny-badge">{{ compact ? '民族专题' : '随民族切换' }}</span>
    </div>
    <div
      class="development-intro"
      :class="{ card: !compact, 'development-embedded': embedded }"
    >
      <div class="development-copy">
        <span class="topic-pill">{{ profile.feature }}</span>
        <h3>{{ profile.place }}</h3>
        <p>{{ profile.path }}</p>
        <div class="development-distribution">
          <Icon
            name="pin"
            :size="15"
          />
          <span>主要分布：{{ ethnic.majorRegions.join('、') }}</span>
          <button
            class="text-button"
            @click="emit('map')"
          >
            查看分布
            <Icon
              name="arrow"
              :size="13"
            />
          </button>
        </div>
      </div>
      <EthnicPhoto
        v-if="!compact && !embedded"
        :name="ethnic.name"
      />
    </div>
    <template v-if="compact">
      <div
        v-if="profile.achievements[0]"
        class="development-preview"
      >
        <span>
          {{ profile.achievements[0].year }} · {{ profile.achievements[0].scope }} · 已收录
          {{ profile.achievements.length }} 条
        </span>
        <h3>{{ profile.achievements[0].title }}</h3>
        <a
          :href="profile.achievements[0].url"
          target="_blank"
          rel="noopener noreferrer"
        >
          查看成果来源
          <Icon
            name="external"
            :size="12"
          />
        </a>
      </div>
      <p
        v-else
        class="development-compact-note"
      >
        地区发展数据与文化背景资料可在该民族专题中查看。
      </p>
      <button
        class="primary-button"
        @click="emit('explore')"
      >
        探索{{ ethnic.name }}发展专题
        <Icon
          name="arrow"
          :size="15"
        />
      </button>
    </template>
    <template v-else>
      <EthnicTimeline :name="ethnic.name" />
      <DevelopmentCases :name="ethnic.name" />
      <section
        v-if="profile.achievements.length"
        class="development-achievements"
      >
        <div class="development-achievement-heading">
          <div class="section-label">
            <Icon
              name="book"
              :size="18"
            />
            <h2>已核查的文化保护成果</h2>
          </div>
          <span class="tiny-badge">
            {{ profile.achievements.length }} 条记录 · {{ achievementYears.length }} 个年份
          </span>
        </div>
        <div
          class="development-year-filters"
          role="group"
          aria-label="文化成果年份筛选"
        >
          <button
            :class="{ selected: achievementYear === 'all' }"
            @click="achievementYear = 'all'"
          >
            全部年份
          </button>
          <button
            v-for="year in achievementYears"
            :key="year"
            :class="{ selected: achievementYear === String(year) }"
            @click="achievementYear = String(year)"
          >
            {{ year }} 年
          </button>
        </div>
        <p class="development-record-note">
          按年份从新到旧展示。扩展项目指新增申报地区或保护范围，年份不代表传统文化的起源。
        </p>
        <div class="development-achievement-grid">
          <article
            v-for="item in visibleAchievements"
            :key="`${item.year}-${item.title}`"
            class="card development-achievement"
          >
            <div>
              <span class="development-year">{{ item.year }}</span>
              <span class="tiny-badge">{{ item.scope }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
            <a
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.publisher }}
              <Icon
                name="external"
                :size="12"
              />
            </a>
          </article>
        </div>
      </section>
      <section class="card development-regions">
        <div class="development-heading">
          <div>
            <p class="eyebrow">REGIONAL CONTEXT</p>
            <h2>主要分布地区的发展截面</h2>
          </div>
          <a
            :href="economySource"
            target="_blank"
            rel="noopener noreferrer"
          >
            统计年鉴原表
            <Icon
              name="external"
              :size="12"
            />
          </a>
        </div>
        <p>
          {{
            ethnic.name === '汉族'
              ? '选取所选普查年份汉族人口最多的三个省份。'
              : '选取统计年鉴所列主要分布地区中已收录经济数据的前三个省区。'
          }}人口为{{ populationYear }}年，经济为2023年；GDP属于全地区各民族共同参与的经济活动。
        </p>
        <p
          v-if="ethnic.name === '高山族'"
          class="development-scope-note"
        >
          台湾采用独立的原住民户籍分类，未接入同口径经济数据。下方福建数据仅描述大陆分布地区。
        </p>
        <div class="development-region-grid">
          <button
            v-for="row in regionalRows"
            :key="row.economy.code"
            class="development-region"
            @click="emit('region', row.economy.code)"
          >
            <span>
              {{ row.economy.name }}
              <Icon
                name="arrow"
                :size="14"
              />
            </span>
            <strong>
              {{ row.economy.gdp.toLocaleString('zh-CN') }}
              <small>亿元</small>
            </strong>
            <em>2023 年地区生产总值</em>
            <div>
              <span>当地{{ ethnic.name }}人口 · {{ populationYear }}</span>
              <b>{{ formatPeople(row.population) }} 人</b>
            </div>
            <div>
              <span>人均 GDP · 2023</span>
              <b>{{ row.economy.perCapita.toLocaleString('zh-CN') }} 元</b>
            </div>
          </button>
        </div>
      </section>
      <section
        v-if="relatedToShared"
        class="card development-shared"
      >
        <div>
          <span class="topic-tag">{{ sharedDevelopmentAchievement.scope }}</span>
          <h3>{{ sharedDevelopmentAchievement.title }}</h3>
          <p>{{ sharedDevelopmentAchievement.text }}</p>
        </div>
        <a
          :href="sharedDevelopmentAchievement.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          2021 年官方白皮书
          <Icon
            name="external"
            :size="12"
          />
        </a>
      </section>
      <p class="development-method">
        特色与发展线索为资料编辑概述；成果条目标注发生年份与原文，地区经济不作为某民族收入或政策效果的估计。
        <a
          :href="profile.cultureUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          阅读文化背景资料
          <Icon
            name="external"
            :size="12"
          />
        </a>
      </p>
    </template>
  </section>
</template>
