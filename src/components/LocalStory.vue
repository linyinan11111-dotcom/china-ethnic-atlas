<script setup lang="ts">
import {computed} from 'vue';
import {ethnicStories} from '../data/stories';
import Icon from './Icon.vue';
const props=defineProps<{name:string}>();
const story=computed(()=>ethnicStories[props.name]);
const emit=defineEmits<{development:[];map:[]}>();
</script>
<template>
 <article class="local-story" :data-story-ethnic="name" aria-label="地方发展故事">
  <div class="story-margin"><p class="eyebrow">A LOCAL STORY</p><strong :class="{'period-long':story.period.length>4}">{{story.period}}</strong><span>{{story.category}}</span><p><Icon name="pin" :size="14"/>{{story.region}}</p></div>
  <div class="story-copy"><span class="story-label">地方发展故事 · {{name}}</span><h2>{{story.title}}</h2><p class="story-lead">{{story.text}}</p><h3>放回地方生活中阅读</h3><p>{{story.observation}}</p><p class="story-scope">以上事件与观察线索分别呈现：具体建设通常惠及当地各民族，不能据此推算个人收入，也不把一个地方的经历概括为整个民族的经历。</p><div class="story-sources"><a v-for="source in story.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{source.publisher}} · 事件原文<Icon name="external" :size="12"/></a></div><div class="story-actions"><button class="text-button" @click="emit('development')">继续阅读发展历程<Icon name="arrow" :size="15"/></button><button class="text-button" @click="emit('map')">返回分布地图<Icon name="map" :size="15"/></button></div><p class="story-updated">资料核查：{{story.updatedAt}} · 本文为原文支持的地方事件与资料摘述。</p></div>
 </article>
</template>
<style scoped>
.story-margin>strong.period-long{font-size:28px;line-height:1.6;overflow-wrap:anywhere}
.local-story{display:grid;grid-template-columns:220px minmax(0,1fr);gap:34px;border-top:2px solid var(--ink);padding:30px 0;min-width:0}.story-margin{display:flex;flex-direction:column;gap:20px;border-right:1px solid var(--rule);padding-right:25px}.story-margin>strong{font-family:Georgia,serif;font-size:64px;font-weight:400;font-style:italic;color:var(--theme-accent)}.story-margin>span,.story-margin>p:not(.eyebrow){font-size:12px;color:var(--theme-muted);line-height:1.9}.story-margin>p:not(.eyebrow){display:flex;align-items:flex-start;gap:6px}.story-margin svg{margin-top:3px}.story-label{font-size:11px;color:var(--theme-accent);letter-spacing:1px}.story-copy{min-width:0}.story-copy h2{font-family:var(--serif);font-weight:400;font-size:29px;line-height:1.7;color:var(--ink);margin:14px 0 20px}.story-copy p{font-size:13px;line-height:2.1;color:#69735f}.story-copy .story-lead{font-size:15px;line-height:2.2}.story-copy h3{font-size:16px;font-family:var(--serif);font-weight:400;margin:28px 0 13px;color:var(--ink)}.story-copy .story-scope{font-size:11px;color:#808773;border-left:2px solid var(--theme-accent);padding-left:15px;margin-top:22px}.story-sources{display:flex;flex-direction:column;gap:8px;margin-top:24px}.story-sources a{font-size:11px;color:var(--theme-accent);display:flex;gap:6px;align-items:center;line-height:1.9}.story-actions{display:flex;flex-wrap:wrap;gap:22px;border-top:1px solid var(--rule);padding-top:22px;margin-top:22px}.story-copy .story-updated{font-size:10px;color:#7b846f;margin-top:20px}
@media(max-width:760px){.local-story{grid-template-columns:1fr;gap:22px}.story-margin{border-right:0;border-bottom:1px solid var(--rule);padding-bottom:20px;gap:13px}.story-margin>strong{font-size:49px}.story-copy h2{font-size:25px}.story-copy .story-lead{font-size:14px}}
</style>
