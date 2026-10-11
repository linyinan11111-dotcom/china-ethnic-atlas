<script setup lang="ts">
import taiwan from '../data/taiwan-indigenous.json';
import {formatPercent,percentage,escapeCsv} from '../utils/analysis.mjs';
import Icon from './Icon.vue';
withDefaults(defineProps<{compact?:boolean}>(),{compact:false});
const emit=defineEmits<{select:[]}>();
const simplify=(name:string)=>name.replace('花蓮','花莲').replace('桃園','桃园').replace('臺東','台东').replace('縣','县');
function exportReference(){
 const rows=[['地区','统计对象','统计时点','人口/人','占台湾原住民人口份额/%','来源','说明'],['台湾',taiwan.category,taiwan.period,taiwan.population,100,taiwan.sourceUrl,'户籍统计；不合并2010大陆省级排名'],...taiwan.topRegions.map(r=>[r.name,taiwan.category,taiwan.period,r.population,percentage(r.population,taiwan.population),taiwan.sourceUrl,'原文列出的前三个县市，并非完整县市表'])];
 const blob=new Blob(['\ufeff'+rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
 const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`台湾原住民户籍人口_${taiwan.period}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
</script>
<template>
 <section class="taiwan-population" :class="{compact}" data-statistic-scope="taiwan-household">
  <div class="taiwan-heading"><div><p class="eyebrow">TAIWAN · HOUSEHOLD STATISTICS</p><h2>台湾原住民户籍人口</h2></div><span class="tiny-badge">{{taiwan.period}} 月底</span></div>
  <div class="taiwan-totals"><div><span>原住民登记人口</span><strong>{{taiwan.population.toLocaleString('zh-CN')}}<small>人</small></strong></div><div><span>占当地总人口</span><strong>{{formatPercent(taiwan.share)}}</strong></div><div v-if="!compact"><span>同月户籍总人口</span><strong>{{taiwan.totalPopulation.toLocaleString('zh-CN')}}<small>人</small></strong></div></div>
  <p class="taiwan-scope">大陆 2020 年普查的高山族为 <b>3,479 人</b>，不包含台湾。这里采用台湾官方“原住民”户籍分类；统计时间、分类与大陆普查不同，两组人口分别展示。</p>
  <div v-if="!compact" class="taiwan-counties"><h3>原文列出的前三个县市 <small>份额 = 该县市原住民人口 ÷ 台湾原住民总人口；满格为 100%</small></h3><div v-for="region in taiwan.topRegions" :key="region.name" class="taiwan-county"><span>{{simplify(region.name)}}</span><div class="taiwan-bar"><i :style="{width:`${region.population/taiwan.population*100}%`}"/></div><strong>{{region.population.toLocaleString('zh-CN')}} 人</strong><small>{{formatPercent(percentage(region.population,taiwan.population))}}</small></div></div>
  <div class="taiwan-source"><a :href="taiwan.sourceUrl" target="_blank" rel="noopener noreferrer">台湾官方户口统计原文<Icon name="external" :size="12"/></a><button v-if="!compact" class="text-button" @click="emit('select')">查看台湾地图详情<Icon name="pin" :size="13"/></button><button v-if="!compact" class="text-button" @click="exportReference">导出台湾户籍参考<Icon name="download" :size="13"/></button><small>发布于 {{taiwan.publishedAt}}</small></div>
 </section>
</template>
