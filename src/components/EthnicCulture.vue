<script setup lang="ts">
import {computed,ref,watch,nextTick} from 'vue';
import {cultureProfiles} from '../data/culture';
import Icon from './Icon.vue';
import {scrollToContent} from '../utils/content-navigation';
const props=defineProps<{name:string}>();
const profile=computed(()=>cultureProfiles[props.name]);
const active=ref('language');
const section=computed(()=>profile.value.sections.find(item=>item.id===active.value)!);
const expanded=ref(false);
const panel=ref<HTMLElement|null>(null);
async function chooseTopic(id:string){active.value=id;await nextTick();scrollToContent(panel.value);}
const excerpt=computed(()=>section.value.text.length>210&&!expanded.value?section.value.text.slice(0,210)+'…':section.value.text);
const sourceCount=computed(()=>profile.value.sections.filter(item=>item.sources.length).length);
watch(()=>props.name,()=>{active.value='language';expanded.value=false;});
watch(active,()=>expanded.value=false);
</script>
<template>
 <section class="ethnic-culture" :data-culture-ethnic="name" aria-label="民族文化资料">
  <div class="culture-reader-heading"><div><p class="eyebrow">LANGUAGE · TRADITIONS · EVERYDAY LIFE</p><h2>走进{{name}}的文化</h2></div><span>{{sourceCount}} / 6 栏目有来源</span></div>
  <p class="culture-reader-note">以下为传统文化资料摘读与译述，涉及不同地区和历史时期。语言、服饰与生活习惯因地区、社群和时代而异；文中历史状况不作为当代所有人的生活描述。</p>
  <div class="culture-reader-layout">
   <div class="culture-reader-tabs" role="tablist" :aria-label="name+'文化栏目'">
    <button v-for="(item,index) in profile.sections" :id="'culture-tab-'+item.id" :key="item.id" role="tab" :aria-selected="active===item.id" aria-controls="culture-panel" :class="{selected:active===item.id}" @click="chooseTopic(item.id)"><span>{{String(index+1).padStart(2,'0')}}</span><strong>{{item.label}}</strong><small>{{item.sources.length?'资料摘读':'待补充'}}</small><Icon name="arrow" :size="14"/></button>
   </div>
   <article ref="panel" id="culture-panel" class="culture-reader-article" role="tabpanel" :aria-labelledby="'culture-tab-'+active">
    <span class="culture-reader-category">{{section.sourceType??'资料待补充'}}</span><h3>{{section.title}}</h3><p class="culture-reader-excerpt">{{excerpt}}</p>
    <button v-if="section.text.length>210" class="text-button" :aria-expanded="expanded" @click="expanded=!expanded">{{expanded?'收起摘读':'展开完整摘读'}}<Icon name="chevron" :size="13"/></button>
    <div v-if="section.sources.length" class="culture-reader-sources"><a v-for="source in section.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{source.publisher}} · 阅读原文<Icon name="external" :size="12"/></a></div>
   </article>
  </div>
  <p class="culture-reader-updated">本专题文化资料核查：{{profile.updatedAt}} · 未收录栏目将继续补充有来源的地方资料。</p>
 </section>
</template>
<style scoped>
.ethnic-culture{border-top:1px solid var(--ink);padding:26px 0;min-width:0}.culture-reader-heading{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}.culture-reader-heading h2{font-family:var(--serif);font-size:26px;font-weight:400;color:var(--ink);margin-top:13px}.culture-reader-heading>span{font-size:11px;color:var(--theme-muted)}.culture-reader-note,.culture-reader-updated{font-size:11px;line-height:2;color:#788171;margin-top:17px}.culture-reader-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:34px;margin-top:26px}.culture-reader-tabs{display:flex;flex-direction:column;border-top:1px solid var(--rule)}.culture-reader-tabs button{display:flex;align-items:center;text-align:left;gap:12px;border-bottom:1px solid var(--rule);padding:17px 9px}.culture-reader-tabs button>span{font-family:Georgia,serif;color:var(--theme-accent);font-size:17px;font-style:italic}.culture-reader-tabs strong{font-size:13px;font-weight:400}.culture-reader-tabs small{font-size:9px;margin-left:auto;color:#909887;white-space:nowrap}.culture-reader-tabs svg{color:var(--theme-accent)}.culture-reader-tabs .selected{background:var(--theme-soft);color:var(--theme-accent)}.culture-reader-article{min-width:0;border-left:1px solid var(--rule);padding:6px 0 15px 30px}.culture-reader-category{font-size:10px;color:var(--theme-accent);letter-spacing:1px}.culture-reader-article h3{font-size:26px;font-weight:400;font-family:var(--serif);color:var(--ink);line-height:1.8;margin:18px 0}.culture-reader-excerpt{font-size:14px;line-height:2.2;color:#616b59;white-space:pre-line;overflow-wrap:anywhere}.culture-reader-article>.text-button{margin-top:15px}.culture-reader-sources{border-top:1px solid var(--rule);margin-top:27px;padding-top:18px}.culture-reader-sources a{display:flex;gap:6px;align-items:center;font-size:11px;line-height:1.9;color:var(--theme-accent)}.culture-reader-updated{border-top:1px solid var(--rule);padding-top:15px;font-size:10px}
@media(max-width:760px){.culture-reader-heading h2{font-size:23px}.culture-reader-layout{grid-template-columns:1fr;gap:23px}.culture-reader-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.culture-reader-tabs button{padding:13px 6px;gap:5px;justify-content:center}.culture-reader-tabs strong{font-size:11px}.culture-reader-tabs small,.culture-reader-tabs svg{display:none}.culture-reader-tabs button>span{font-size:13px}.culture-reader-article{padding:0;border-left:0}.culture-reader-article h3{font-size:23px}.culture-reader-excerpt{font-size:13px}}
</style>
