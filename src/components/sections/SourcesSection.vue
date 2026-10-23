<script setup lang="ts">
import Icon from '../Icon.vue';
import { sourceEntries } from '../../data/sources';
</script>
<template>
  <div class="sources-page">
    <div class="sources-intro card">
      <span class="source-check">
        <Icon
          name="check"
          :size="24"
        />
      </span>
      <div>
        <h2>公开资料，本地保存，明确口径。</h2>
        <p>
          大陆省级分布：2010 / 2020 年 · 大陆普查人口：2020 年 · 地区经济：2023 年 ·
          台湾户籍参考：2026 年 9
          月。不同年份分别展示，不混用为同年数据。文化简介为编辑概述，文化摘读保留原文依据与地域背景。
        </p>
      </div>
      <span class="tiny-badge">第一版</span>
    </div>
    <div class="source-grid">
      <section
        v-for="(source, i) in sourceEntries"
        :key="source.name"
        class="card source-card"
      >
        <span class="source-number">{{ String(i + 1).padStart(2, '0') }}</span>
        <h3>{{ source.name }}</h3>
        <small>{{ source.publisher }}</small>
        <p>{{ source.description }}</p>
        <a
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          查看公开来源
          <Icon
            name="external"
            :size="14"
          />
        </a>
      </section>
    </div>
    <section class="card methodology">
      <div class="section-label">
        <Icon name="book" />
        <h2>怎样理解图表</h2>
      </div>
      <div class="method-grid">
        <div>
          <h3>数量与占比</h3>
          <p>
            地区民族人口占比 = 当地某民族人口 ÷ 当地总人口。地区分布份额 = 当地某民族人口 ÷
            已收录地区该民族人口合计。
          </p>
        </div>
        <div>
          <h3>集中度与缺失数据</h3>
          <p>
            前五地区集中度基于已收录地区的该民族人口合计计算。源表空白保留为缺失；零值和缺失值使用不同表现。大陆31个省区市之外未接入同口径普查数据；高山族另提供2026年9月台湾原住民户籍参考，不参与上述排名和集中度。
          </p>
        </div>
        <div>
          <h3>行政边界与人口口径</h3>
          <p>
            当前省级边界用于匹配2010 /
            2020年省级人口，不能用于县级历史分析。民族人口表含未识别民族、外国人加入中国籍等项目，因此56民族之和不必等于地区总人口。
          </p>
        </div>
        <div>
          <h3>经济与发展解读</h3>
          <p>
            GDP、产业增加值按当年价格计算；增长率按可比价格计算。五个自治区是行政区域分类，其他省份同样有民族人口和自治地方。单年指标不代表长期发展趋势或政策因果效应。
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
