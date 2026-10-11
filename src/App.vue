<script setup lang="ts">
import {computed,ref,watch,onMounted,onBeforeUnmount,defineAsyncComponent,nextTick} from 'vue';
import type {EChartsCoreOption} from 'echarts/core';
import ChinaMap from './components/ChinaMap.vue';
import Icon from './components/Icon.vue';
const chartComponent=import('./components/Chart.vue');
const Chart=defineAsyncComponent(()=>chartComponent);
import EthnicPhoto from './components/EthnicPhoto.vue';
import TaiwanPopulation from './components/TaiwanPopulation.vue';
import EthnicDevelopment from './components/EthnicDevelopment.vue';
import EthnicCulture from './components/EthnicCulture.vue';
import LocalStory from './components/LocalStory.vue';
import CulturalPlaces from './components/CulturalPlaces.vue';
import EthnicCompare from './components/EthnicCompare.vue';
import ModuleMeta from './components/ModuleMeta.vue';
import type {CulturalPlace} from './data/places';
import {directoryGroups,directoryRegions,directoryTopics} from './data/directory';
import {ethnicDevelopment} from './data/development';
import taiwan from './data/taiwan-indigenous.json';
import {buildRankingChart} from './utils/ranking-chart.mjs';
import {avatarUrl,avatarSource} from './data/avatars';
import {scrollToContent} from './utils/content-navigation';
import EthnicSearch from './components/EthnicSearch.vue';
import {searchDirectory} from './utils/ethnic-search.mjs';
import {getEthnicTheme,themeVariables} from './utils/themes.mjs';
import {ethnicGroups,catalogueSource,nationalSource} from './data/catalogue';
import {economy,economySource,economyYear} from './data/economy';
import {reformEvents,reformSource} from './data/reform';
import type {PopulationData} from './types';
import {rankRegions,concentration,formatPeople,formatMetric,formatPercent,mapValue,percentage,escapeCsv} from './utils/analysis.mjs';

const navigation=[{id:'map',label:'民族分布',icon:'map'},{id:'culture',label:'民族介绍',icon:'book'},{id:'analysis',label:'分布分析',icon:'chart'},{id:'economy',label:'地区经济',icon:'trend'},{id:'reform',label:'民族发展',icon:'clock'}];
const initial=()=>{const hash=location.hash.slice(1).split('?');const params=new URLSearchParams(hash[1]??'');return {tab:[...navigation.map(x=>x.id),'sources'].includes(hash[0])?hash[0]:'map',ethnic:ethnicGroups.some(e=>e.name===params.get('ethnic'))?params.get('ethnic')!:'壮族'};};
const tab=ref(initial().tab);
const ethnicName=ref(initial().ethnic);
const search=ref('');
const searchOpen=ref(false);
const filter=ref('all');
const metric=ref('share');
const labels=ref(true);
const placesVisible=ref(true);
const selectedPlace=ref<string|null>(null);
const directoryRegion=ref('');
const directoryTopic=ref('');
const selectedCode=ref<string|null>('450000');
const data=ref<PopulationData|null>(null);
const populationYear=ref(2020);
const populationEditions=ref<Record<number,PopulationData>>({});
const error=ref('');
const status=ref('正在加载数据');
const mobileMenu=ref(false);
const economyScope=ref('related');
const economyMetric=ref('gdp');
const comparisonCodes=ref(['450000','150000','650000']);
const toast=ref('');
let toastTimer:ReturnType<typeof setTimeout>|undefined;
const ethnic=computed(()=>ethnicGroups.find(e=>e.name===ethnicName.value)!);
const editionNumber=computed(()=>String(ethnicGroups.findIndex(e=>e.name===ethnicName.value)+1).padStart(2,'0'));
const development=computed(()=>ethnicDevelopment[ethnicName.value]);
const isGaoshan=computed(()=>ethnicName.value==='高山族');
const theme=computed(()=>getEthnicTheme(ethnicName.value));
const themeStyles=computed(()=>themeVariables(theme.value));
const palette=computed(()=>theme.value.palette);
const popular=['壮族','回族','维吾尔族','苗族','满族','彝族','土家族','藏族','蒙古族','侗族','白族','傣族'];
const visibleEthnics=computed(()=>searchDirectory(directoryGroups,search.value,{region:directoryRegion.value,topic:directoryTopic.value}).filter(e=>search.value.trim()||filter.value==='all'||popular.includes(e.name)));
const regions=computed(()=>data.value?.regions??[]);
const ranking=computed(()=>rankRegions(regions.value,ethnicName.value,metric.value));
const topPopulation=computed(()=>rankRegions(regions.value,ethnicName.value));
const covered=computed(()=>regions.value.filter(r=>r.populations[ethnicName.value]!==null&&r.populations[ethnicName.value]!==undefined).length);
const concentrationValue=computed(()=>concentration(regions.value,ethnicName.value));
const selectedRegion=computed(()=>regions.value.find(r=>r.code===selectedCode.value));
const selectedEconomy=computed(()=>economy.find(r=>r.code===selectedCode.value));
const national2010=computed(()=>populationEditions.value[2010]?.national.populations[ethnicName.value]??null);
const populationChange=computed(()=>national2010.value ? (ethnic.value.national2020/national2010.value-1)*100 : null);
const relatedEconomyCodes=computed(()=>ethnicName.value==='汉族'?topPopulation.value.slice(0,3).map(r=>r.code):economy.filter(r=>ethnic.value.majorRegions.includes(r.name)).map(r=>r.code));
const economyRows=computed(()=>economy.filter(r=>economyScope.value==='all'||(economyScope.value==='related'?relatedEconomyCodes.value.includes(r.code):r.autonomous)).sort((a,b)=>economyMetric.value==='gdp'?b.gdp-a.gdp:b.perCapita-a.perCapita));
const comparison=computed(()=>economy.filter(r=>comparisonCodes.value.includes(r.code)));
const sourceEntries=[
 {name:'台湾原住民户籍人口 · '+taiwan.period,publisher:taiwan.publisher,url:taiwan.sourceUrl,description:'官方月度户口统计：原住民登记人口641,332人，占同月总人口2.76%。原文列出花莲、桃园、台东三个县市的原住民人口。与大陆高山族普查采用不同时间及分类，单独展示并导出。'},
 {name:'民族服饰插画头像',publisher:'昵图网 · 用户提供图片',url:avatarSource,description:'按用户提供的8列×7行服饰插画裁切56个本地头像，保留背景与原有水印。插画是服饰示意，不代表当代所有人的穿着。裁切表记录原图位置。原图未提供开放许可。'},
 {name:'省级民族人口 · 2010',publisher:'国家统计局 · 第六次全国人口普查',url:'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm',description:'表1-6：各地区分性别、民族的人口。自动采集31省区市、56民族的小计列；人口单位为人。'},
 {name:'省级民族人口 · 2020',publisher:'国家统计局 · 第七次全国人口普查',url:'https://www.stats.gov.cn/sj/pcsj/rkpc/7rp/zk/html/A0104.jpg',description:'表1-4：各地区分性别、民族的人口。按官方图片表的小计列整理31省区市、56民族；307个单元格逐格目视核对。核对民族纵向合计、地区横向合计与独立全国表。空白保持缺失，不发布未核查的男女人口识别列。'},
 {name:'语言、节庆与日常文化',publisher:'国家民族事务委员会 · 中国网 · 国务院',url:'https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml',description:'六类文化栏目覆盖56民族。原文与保存快照支持319个栏目，其余17个栏目明确待核查；传统记述保留地域与年代背景，不能概括为当代所有人的习惯。'},
 {name:'州县文化代表点',publisher:'国家民族事务委员会 · 国务院 · DataV',url:'https://geo.datav.aliyun.com/areas_v3/bound/all.json',description:'56个民族各有一个原文支持的州、市、县、区或旗代表地区。坐标采用公开行政区参考点，不能解释为村落、具体建筑或文化项目精确位置；点位不提供县级人口估计。'},
 {name:'大陆民族人口 · 2020',publisher:'国家统计局 · 第七次全国人口普查',url:nationalSource,description:'表2-1：全国各民族人口及比重。该表民族数据不含港澳台地区，页面标注为大陆普查口径。根据官方图片表逐项转录；表内总计为1,409,778,724人，按该表口径展示。'},
 {name:'主要分布地区',publisher:'国家统计局 · 中国统计年鉴2024',url:catalogueSource,description:'表25-18：少数民族分布的主要地区及人口。主要分布地区为定性信息，不是独占范围或完整人口分布。'},
 {name:'地区经济 · 2023',publisher:'国家统计局 · 中国统计年鉴2024',url:economySource,description:'表3-9：地区生产总值。原表为2023年初步核算数；GDP单位为亿元、人均GDP单位为元，增长率由可比价格指数减100得到。'},
 {name:'民族发展专题',publisher:'国家民委 · 中国政府网 · 中国网 · UNESCO',url:'https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml',description:'56个民族各有独立时间轴：140个历史、教育、交通、产业等节点，新补11条2025—2026地方案例，结合176条已核查文化保护记录按发生时间排列；同年不同事件分别保留。每个节点标注地区、原文和资料来源。旧资料只用于历史叙述，地区成就不归为单一民族独占。全国政策收为可展开背景，台湾社群与大陆案例分别标注。'},
 {name:'省级行政区边界',publisher:'阿里云 DataV · 公开边界服务',url:'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',description:'本地保存全国省级边界，保留来源中的南海诸岛几何。本版不叠加在线底图；边界仅用于省级专题展示。'},
];
const chartBase={textStyle:{fontFamily:'"Microsoft YaHei", sans-serif',color:'#758278',fontSize:11},tooltip:{trigger:'axis',renderMode:'richText'},grid:{left:14,right:38,top:8,bottom:15,containLabel:true}};
const rankChart=computed<EChartsCoreOption>(()=>buildRankingChart(ranking.value,metric.value,theme.value,selectedCode.value));
const sectorChart=computed<EChartsCoreOption>(()=>({
 textStyle:chartBase.textStyle,tooltip:{trigger:'item',renderMode:'richText'},legend:{bottom:0,icon:'circle',itemWidth:9,textStyle:{color:'#718074',fontSize:11}},series:[{type:'pie',radius:['47%','72%'],center:['50%','42%'],label:{show:false},data:(selectedEconomy.value?.sectors??[]).map((v,i)=>({name:['第一产业','第二产业','第三产业'][i],value:v,itemStyle:{color:[theme.value.palette[2],theme.value.accent,'#d5b982'][i]}}))}]
}));
const economyChart=computed<EChartsCoreOption>(()=>({
 ...chartBase,grid:{left:16,right:16,top:25,bottom:25,containLabel:true},xAxis:{type:'category',data:comparison.value.map(r=>r.name),axisLine:{lineStyle:{color:'#e6eae3'}},axisTick:{show:false}},yAxis:{type:'value',name:economyMetric.value==='gdp'?'亿元':'元',splitLine:{lineStyle:{color:'#edf0e9'}}},series:[{type:'bar',barMaxWidth:48,data:comparison.value.map((r,i)=>({value:economyMetric.value==='gdp'?r.gdp:r.perCapita,itemStyle:{color:[theme.value.accent,theme.value.palette[3],'#bc9c61',theme.value.palette[2],theme.value.deep][i],borderRadius:[5,5,0,0]}}))}]
}));
const legendLabels=computed(()=>metric.value==='share'?['< 0.1%','0.1–1%','1–5%','5–20%','≥ 20%']:['< 1千','1千–1万','1万–10万','10万–100万','≥ 100万']);
const pageTitles:Record<string,{eyebrow:string;title:string;description:string}>={
 map:{eyebrow:'CHINA ETHNIC ATLAS',title:'看见山河，读懂民族。',description:'从一幅地图出发，探索民族分布、文化与地区发展的联系。'},
 culture:{eyebrow:'CULTURE & COMMUNITY',title:'各美其美，美美与共。',description:'认识不同地区的文化传统，理解多元一体的中华民族。'},
 analysis:{eyebrow:'POPULATION & DISTRIBUTION',title:'让分布，成为可读的数据。',description:'比较地区人口数量与占比，发现人口分布的空间特征。'},
 economy:{eyebrow:'REGIONAL DEVELOPMENT',title:'在发展中，看见生活。',description:'以地区经济指标为窗口，观察不同地区的发展面貌。'},
 reform:{eyebrow:'COMMUNITY & DEVELOPMENT',title:'山河见证，发展同行。',description:'回望各民族的发展历程，认识文化传承与地区发展的联系。'},
 sources:{eyebrow:'SOURCES & METHODOLOGY',title:'每一份数据，都有来处。',description:'明确来源、统计口径与计算方法，让探索有据可循。'},
};
let sectionObserver:IntersectionObserver|undefined;
function syncHash(){const hash=`#${tab.value==='sources'?'sources':'ethnic'}?ethnic=${encodeURIComponent(ethnicName.value)}`;if(location.hash!==hash)history.replaceState(null,'',hash);}
function observeSections(){sectionObserver?.disconnect();sectionObserver=new IntersectionObserver(()=>{const sections=Array.from(document.querySelectorAll('.ethnic-page-section'));const active=sections.filter(section=>section.getBoundingClientRect().top<=window.innerHeight*.3).at(-1)??sections[0];if(active)tab.value=active.id.replace('section-','');},{rootMargin:'-15% 0px -65% 0px',threshold:0});document.querySelectorAll('.ethnic-page-section').forEach(section=>sectionObserver?.observe(section));}
async function navigate(id:string,selector?:string){if(id==='sources')sectionObserver?.disconnect();tab.value=id;syncHash();mobileMenu.value=false;await nextTick();if(id==='sources'){scrollToContent(document.querySelector('.page-heading'));notify('已打开数据说明');return;}observeSections();scrollToContent(selector?document.querySelector(selector):document.getElementById('section-'+id));notify('已定位到'+(navigation.find(item=>item.id===id)?.label??'对应内容'));}
function chooseEthnic(name:string){ethnicName.value=name;economyScope.value='related';const group=ethnicGroups.find(e=>e.name===name)!;comparisonCodes.value=(name==='汉族'?rankRegions(regions.value,name).slice(0,3).map(r=>r.code):economy.filter(r=>group.majorRegions.includes(r.name)).slice(0,3).map(r=>r.code));if(name==='高山族'){selectedCode.value='710000';return;}const region=regions.value.find(r=>r.name===group.majorRegions[0]);selectedCode.value=region?.code??rankRegions(regions.value,name)[0]?.code??null;}
async function openEthnic(name:string){chooseEthnic(name);tab.value='map';mobileMenu.value=false;syncHash();await nextTick();observeSections();scrollToContent(document.querySelector('.magazine-cover'));notify('已打开'+name+'专题');}
function selectByName(name:string){const code=regions.value.find(r=>r.name===name)?.code;if(code)selectMapRegion(code);}
async function selectMapRegion(code:string){selectedCode.value=code;await navigate('map','#region-details');notify('已选择'+(selectedRegion.value?.name??(code==='710000'?'台湾':'当前地区'))+'，查看地区详情');}
async function choosePlace(place:CulturalPlace,fromMap=false){selectedPlace.value=place.id;selectedCode.value=place.provinceCode;placesVisible.value=true;await navigate('map',fromMap?'[data-place="'+place.id+'"]':'.map-card');notify(fromMap?'已打开'+place.name+'文化线索':'已定位'+place.name+'代表点');}
function readStory(){navigate('culture','.local-story');}
function exploreDevelopmentRegion(code:string){selectedCode.value=code;economyScope.value='all';navigate('economy','#economy-details');}
function selectEconomyRegion(code:string){selectedCode.value=code;navigate('economy','#economy-details');}
function notify(message:string){toast.value=message;if(toastTimer)clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.value='',2800);}
function toggleCompare(code:string){const index=comparisonCodes.value.indexOf(code);if(index>=0){comparisonCodes.value.splice(index,1);}else if(comparisonCodes.value.length<5){comparisonCodes.value.push(code);}else notify('最多选择 5 个地区进行对比');}
function exportCsv(){
 const rows=[['地区','行政区代码','民族','人口年份','民族人口(人)','地区总人口(人)','地区民族人口占比(%)','GDP年份','GDP(亿元)','人均GDP(元)','人口来源','经济来源']];
 for(const region of regions.value){const e=economy.find(x=>x.code===region.code);rows.push([region.name,region.code,ethnicName.value,String(populationYear.value),String(region.populations[ethnicName.value]??''),String(region.total),String(percentage(region.populations[ethnicName.value],region.total)??''),'2023',String(e?.gdp??''),String(e?.perCapita??''),data.value?.sourceUrl??'',economySource]);}
 const blob=new Blob(['\uFEFF'+rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8;'});
 const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=`${ethnicName.value}_省级分布与经济.csv`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('数据已导出，包含年份、单位和来源');
}
async function loadData(){error.value='';status.value='正在加载数据';try{const results=await Promise.all([2010,2020].map(async year=>{const response=await fetch(`${import.meta.env.BASE_URL}data/${year===2010?'population':'population2020'}.json`);if(!response.ok)throw new Error(year+'人口数据加载失败');const result=await response.json();if(result.regions?.length!==31||result.year!==year)throw new Error(year+'人口数据不完整');return result as PopulationData;}));populationEditions.value=Object.fromEntries(results.map(result=>[result.year,result]));data.value=populationEditions.value[populationYear.value];chooseEthnic(ethnicName.value);status.value='本地统计数据已加载';}catch(e){error.value=e instanceof Error?e.message:'数据加载失败';status.value='数据加载失败';}}
function onHash(){const state=initial();chooseEthnic(state.ethnic);navigate(state.tab);syncHash();}
function openGlobalSearch(){mobileMenu.value=false;searchOpen.value=true;}
function pickSearchResult(name:string){searchOpen.value=false;openEthnic(name);}
function searchShortcut(event:KeyboardEvent){if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();searchOpen.value=!searchOpen.value;}}
watch(ethnicName,syncHash);
watch(ethnicName,()=>selectedPlace.value=null);
watch(populationYear,year=>{if(populationEditions.value[year])data.value=populationEditions.value[year];});
onMounted(async()=>{const startingSection=tab.value;const deepLink=[...navigation.map(item=>item.id),'sources'].includes(location.hash.slice(1).split('?')[0]);window.addEventListener('hashchange',onHash);window.addEventListener('keydown',searchShortcut);await Promise.all([loadData(),chartComponent]);await nextTick();if(deepLink)navigate(startingSection);else observeSections();syncHash();});
onBeforeUnmount(()=>{sectionObserver?.disconnect();window.removeEventListener('hashchange',onHash);window.removeEventListener('keydown',searchShortcut);if(toastTimer)clearTimeout(toastTimer);});
</script>

<template>
 <div class="atlas-app" :style="themeStyles" :data-theme="ethnicName">
 <header class="site-header">
  <a class="brand" href="#map" @click.prevent="navigate('map')"><span class="brand-mark"><Icon name="mountain" :size="26"/></span><span><strong>山河同心</strong><small>中国民族分布图谱</small></span></a>
  <div class="header-topic"><span>PEOPLE · PLACES · STORIES</span><small>民族 · 地域 · 生活</small></div>
  <div class="header-utilities"><button class="header-search" aria-label="打开民族搜索" @click="openGlobalSearch"><Icon name="search" :size="16"/><span>搜索民族</span><kbd>Ctrl K</kbd></button><button class="source-link" :class="{active:tab==='sources'}" @click="navigate('sources')"><Icon name="info" :size="17"/>数据说明</button></div>
 </header>
 <main class="page-shell">
  <section class="page-heading" :class="{'magazine-cover':tab!=='sources'}">
   <div v-if="tab!=='sources'" class="cover-folio"><span>山河同心 / 民族人文志</span><span>民族专题 · {{editionNumber}} / 56</span></div>
   <div class="cover-copy"><p class="eyebrow"><span></span>{{tab==='sources'?'SOURCES & METHODOLOGY':'A PORTRAIT OF COMMUNITY'}}</p><h1>{{tab==='sources'?pageTitles.sources.title:ethnicName}}</h1><p v-if="tab!=='sources'" class="cover-feature">{{development.feature}}</p><p class="heading-description">{{tab==='sources'?pageTitles.sources.description:ethnic.description}}</p><div v-if="tab!=='sources'" class="cover-regions"><Icon name="pin" :size="14"/><span>{{ethnic.majorRegions.slice(0,5).join(' / ')}}</span></div><div v-if="tab!=='sources'" class="cover-keywords"><span v-for="word in ethnic.culture" :key="word">{{word}}</span></div></div>
   <EthnicPhoto v-if="tab!=='sources'" :name="ethnicName" large class="cover-photo"/>
   <div class="heading-tools"><span class="theme-indicator"><i :style="{background:theme.accent}"/>{{theme.label}}</span><span v-if="tab!=='sources'" class="cover-reading-note">从地域到生活，从文化到发展</span><button class="outline-button" :disabled="!data" @click="exportCsv"><Icon name="download" :size="16"/>导出数据</button></div>
  </section>
  <div v-if="error" class="error-banner" role="alert">{{error}}<button @click="loadData">重新加载</button></div>
  <div class="mobile-picker"><button class="outline-button" @click="mobileMenu=!mobileMenu"><Icon name="users" :size="17"/>当前民族：{{ethnicName}}<Icon name="chevron" :size="15"/></button></div>
  <div class="workspace" :class="{'full-page':tab==='sources'}">
   <aside v-if="tab!=='sources'" class="ethnic-sidebar card" :class="{expanded:mobileMenu}">
    <div class="sidebar-top"><div class="section-label"><Icon name="users" :size="17"/><h2>民族目录</h2><span class="count-badge">56</span></div><p>翻阅下一篇民族故事</p></div>
    <label class="search-field"><Icon name="search" :size="16"/><input v-model="search" placeholder="民族 / 地区 / 文化关键词" aria-label="搜索民族名称" @keydown.enter="visibleEthnics[0]&&openEthnic(visibleEthnics[0].name)"/><button v-if="search" class="clear-search" aria-label="清空搜索" @click="search=''"><Icon name="close" :size="13"/></button></label>
    <div class="directory-filters"><select v-model="directoryRegion" aria-label="按主要分布地区筛选"><option value="">全部主要地区</option><option v-for="region in directoryRegions" :key="region">{{region}}</option></select><select v-model="directoryTopic" aria-label="按文化主题筛选"><option value="">全部文化主题</option><option v-for="topic in directoryTopics" :key="topic">{{topic}}</option></select><button v-if="directoryRegion||directoryTopic" class="text-button" @click="directoryRegion='';directoryTopic=''">重置筛选</button></div>
    <p v-if="search.trim()||directoryRegion||directoryTopic" class="sidebar-search-count" aria-live="polite">找到 {{visibleEthnics.length}} 个民族 · Enter 选择首项</p>
    <div class="sidebar-tabs"><button :class="{selected:filter==='all'}" @click="filter='all'">全部民族</button><button :class="{selected:filter==='popular'}" @click="filter='popular'">常用选择</button></div>
    <div class="ethnic-list"><button v-for="e in visibleEthnics" :key="e.name" class="ethnic-option" :class="{selected:e.name===ethnicName}" @click="openEthnic(e.name)"><span class="ethnic-avatar" :style="{background:getEthnicTheme(e.name).soft}"><img :src="avatarUrl(e.name)" alt="" loading="lazy"/></span><span class="ethnic-option-copy"><strong>{{e.name}}</strong><small>{{e.majorRegions.slice(0,2).join(' · ')}}</small></span><i class="ethnic-theme-dot" :style="{background:getEthnicTheme(e.name).accent}"/><Icon v-if="e.name===ethnicName" name="check" :size="16"/><Icon v-else name="chevron" :size="14"/></button><div v-if="!visibleEthnics.length" class="empty-search">未找到相关民族<br/><button @click="search='';filter='all'">查看全部民族</button></div></div>
    <div class="sidebar-note"><Icon name="globe" :size="17"/><span>多元一体，交融共生<small>共同书写中华民族的故事</small></span></div>
   </aside>

   <div v-if="tab!=='sources'" class="ethnic-page" :data-ethnic-page="ethnicName">
   <nav class="ethnic-section-nav card" aria-label="民族专题页内导航"><button v-for="item in navigation" :key="item.id" :class="{active:tab===item.id}" :aria-current="tab===item.id?'location':undefined" @click="navigate(item.id)"><Icon :name="item.icon" :size="16"/>{{item.label}}</button></nav>
   <section id="section-map" class="ethnic-page-section" aria-label="民族分布"><div class="unified-section-title"><span>01</span><h2>{{ethnicName}} · 民族分布</h2><small>人口与地域</small></div><div class="map-workspace">
    <div class="map-main-column">
     <div class="overview-strip">
      <div><span>大陆{{ethnicName}}人口 <small>2020</small></span><strong>{{formatPeople(ethnic.national2020)}}<em>人</em></strong></div>
      <div v-if="isGaoshan"><span>台湾原住民人口 <small>{{taiwan.period}}</small></span><strong>{{formatPeople(taiwan.population)}}<em>人</em></strong></div><div v-else><span>省级数据覆盖 <small>{{populationYear}}</small></span><strong>{{covered}}<em>/ 31 地区</em></strong></div>
      <div><span>主要分布地区</span><strong class="region-stat">{{ethnic.majorRegions.slice(0,2).join('、')}}<em v-if="ethnic.majorRegions.length>2">等地</em></strong></div>
     </div>
     <section class="map-card card">
      <div class="map-card-header"><div class="section-label"><Icon name="map" :size="18"/><h2>{{ethnicName}}人口分布</h2></div><div class="segmented"><button :class="{selected:metric==='share'}" @click="metric='share'">人口占比</button><button :class="{selected:metric==='population'}" @click="metric='population'">人口数量</button></div></div>
      <div class="population-edition"><label>人口普查年份<select v-model="populationYear" aria-label="人口普查年份"><option :value="2020">2020 · 第七次普查</option><option :value="2010">2010 · 第六次普查</option></select></label><span>地图、地区排名、比较与导出同步切换</span></div>
      <ChinaMap v-if="data" :regions="regions" :ethnic="ethnicName" :metric="metric" :selected="selectedCode" :labels="labels" :year="populationYear" :places="placesVisible" :place="selectedPlace" @select="selectMapRegion" @site="choosePlace($event,true)" />
      <div v-else class="data-map-placeholder"><span class="spinner"/>{{error||'正在读取人口分布数据…'}}</div>
      <div class="map-legend"><div><span class="legend-title">{{metric==='share'?'地区人口占比':'民族人口 / 人'}}</span><span v-for="(color,i) in palette" :key="color" class="legend-item"><i :style="{background:color}"/>{{legendLabels[i]}}</span><span class="legend-item"><i class="no-data"/>暂无数据</span></div><label class="label-toggle"><input v-model="labels" type="checkbox"/>地区名称</label></div>
      <div class="map-source">来源：大陆省级普查（{{populationYear}}）<span v-if="isGaoshan" class="taiwan-map-note"> · 台湾虚线区域：2026-09 户籍参考</span><button @click="navigate('sources')">查看口径<Icon name="external" :size="12"/></button></div>
     </section>
     <section class="quick-analysis card"><div class="quick-analysis-icon"><Icon name="chart" :size="22"/></div><div><h3>从空间分布，发现更多</h3><p v-if="topPopulation.length">{{populationYear}} 年已收录地区中，{{ethnicName}}人口数量最多的地区为<strong>{{topPopulation[0]?.name}}</strong>，前五地区合计占已收录该民族人口的 <strong>{{concentrationValue?.toFixed(1)}}%</strong>。</p><p v-else>选择民族查看人口分布分析。</p></div><button class="text-button" @click="navigate('analysis')">完整分析<Icon name="arrow" :size="16"/></button></section>
     <ModuleMeta :period="`省级人口${populationYear}年；定性地区资料另见原文`" scope="县级代表点仅提供地方阅读入口，底图不表示县级人口密度。" :sources="[{name:'省级人口原表',url:data?.sourceUrl??'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm'}]"/>
     <label class="places-toggle"><input v-model="placesVisible" type="checkbox"/> 显示州县文化代表点（点击查看线索）</label>
     <CulturalPlaces :name="ethnicName" :selected="selectedPlace" @select="choosePlace" @culture="navigate('culture')" @story="readStory"/>
     <TaiwanPopulation v-if="isGaoshan" class="card" @select="selectMapRegion('710000')"/>
    </div>
    <aside class="detail-column">
     <section id="region-details" class="region-detail card"><div class="section-label"><Icon name="pin" :size="17"/><h2>{{selectedRegion?.name??(isGaoshan&&selectedCode==='710000'?'台湾':'地区详情')}}</h2><span class="tiny-badge">{{selectedRegion||(isGaoshan&&selectedCode==='710000')?'已选择':'点击地图'}}</span></div><template v-if="selectedRegion"><p class="detail-subtitle">{{ethnicName}} · {{populationYear}} 年人口普查</p><dl class="detail-metrics"><div><dt>民族人口</dt><dd>{{formatPeople(selectedRegion.populations[ethnicName])}}<small>人</small></dd></div><div><dt>当地人口占比</dt><dd>{{formatMetric(mapValue(selectedRegion,ethnicName,'share'),'share')}}</dd></div></dl><div class="economic-preview"><span>地区生产总值 <small>2023</small></span><strong>{{selectedEconomy?.gdp.toLocaleString('zh-CN')}}<em>亿元</em></strong><button class="text-button" @click="navigate('economy')">查看地区经济<Icon name="chevron" :size="14"/></button></div></template><TaiwanPopulation v-else-if="isGaoshan&&selectedCode==='710000'" compact/><div v-else class="empty-detail"><Icon name="map" :size="30"/><p>{{['710000','810000','820000'].includes(selectedCode??'')?'本版未收录该地区同口径人口和经济数据。':'点击地图中的地区，查看人口与经济信息。'}}</p></div></section>
     <section class="reform-entry" @click="navigate('reform')"><span class="reform-entry-icon"><Icon name="clock" :size="22"/></span><div><small>民族发展专题</small><h3>{{ethnicName}} · 民族发展</h3><p>{{development.feature}}</p></div><button :aria-label="`查看${ethnicName}民族发展专题`"><Icon name="arrow" :size="19"/></button></section>
    </aside>
   </div></section>

   <section id="section-culture" class="ethnic-page-section content-column" aria-label="民族介绍"><div class="unified-section-title"><span>02</span><h2>{{ethnicName}} · 民族介绍</h2><small>文化与生活</small></div>
    <section class="culture-hero card"><div class="culture-margin"><span>CULTURE & LIFE</span><strong>各美其美<br/>美美与共</strong><small>服饰、语言与日常生活<br/>共同构成文化的面貌</small></div><div class="culture-hero-copy"><p class="eyebrow">CULTURAL PORTRAIT</p><h2>{{ethnicName}}的文化与生活</h2><p>{{ethnic.description}}</p><div class="culture-tags"><span v-for="c in ethnic.culture" :key="c">{{c}}</span></div><p class="photo-art-note">开篇服饰插画为文化示意；同一民族的服饰也因地区、场合和时代而异。</p></div></section>
    <div class="three-cards"><section class="card info-card"><Icon name="users"/><span>大陆普查人口 · 2020</span><strong>{{formatPeople(ethnic.national2020)}}人</strong><a :href="nationalSource" target="_blank" rel="noopener noreferrer">人口普查原表<Icon name="external" :size="13"/></a></section><section class="card info-card"><Icon name="pin"/><span>主要分布地区</span><strong class="small-text">{{ethnic.majorRegions.join('、')}}</strong><a :href="catalogueSource" target="_blank" rel="noopener noreferrer">统计年鉴原表<Icon name="external" :size="13"/></a></section><section class="card info-card"><Icon name="book"/><span>语言概况</span><strong class="small-text">{{ethnic.language}}</strong><small>文化简介为编辑概述</small></section></div>
    <EthnicCulture :name="ethnicName"/>
    <LocalStory :name="ethnicName" @development="navigate('reform')" @map="navigate('map')"/>
    <ModuleMeta period="传统文化背景资料；人口2020年" scope="文化材料记述历史传统与地方例子，不表示当代所有人的生活习惯。" :sources="[{name:'国家民委民族资料',url:'https://www.neac.gov.cn/seac/ztzl/zgmzjs/index.shtml'},{name:'主要分布地区',url:catalogueSource}]"/>
   </section>

   <section id="section-analysis" class="ethnic-page-section content-column" aria-label="分布分析"><div class="unified-section-title"><span>03</span><h2>{{ethnicName}} · 分布分析</h2><small>数量与占比</small></div>
    <EthnicCompare :name="ethnicName" :regions="regions" @choose="openEthnic"/>
    <div class="section-page-head"><div><h2>{{ethnicName}} · 分布分析</h2><p>大陆省级数据：{{populationYear}} 年人口普查 · 同一口径下比较数量与占比</p></div><div class="segmented"><button :class="{selected:metric==='population'}" @click="metric='population'">人口数量</button><button :class="{selected:metric==='share'}" @click="metric='share'">人口占比</button></div></div>
    <div class="three-cards"><section class="card info-card"><span>人口数量最多地区</span><strong>{{topPopulation[0]?.name??'—'}}</strong><small>{{formatPeople(topPopulation[0]?.value)}}人 · {{populationYear}}</small></section><section class="card info-card"><span>前五地区人口集中度</span><strong>{{concentrationValue?.toFixed(1)??'—'}}<em>%</em></strong><small>分母为已收录地区的该民族人口合计</small></section><section class="card info-card"><span>有效地区数</span><strong>{{covered}}<em>/ 31</em></strong><small>空白单元格保留为缺失，不计入排名</small></section></div>
    <div class="analysis-grid"><section class="card chart-card"><div class="section-label"><Icon name="chart"/><h2>大陆地区排名 TOP 8</h2><span class="tiny-badge">{{populationYear}}</span></div><Chart :option="rankChart" :height="320" :label="`${ethnicName}地区排名：${ranking.slice(0,8).map(r=>r.name+' '+formatMetric(r.value,metric)).join('；')}`" @select="selectByName"/><p class="chart-caption">点击柱形可选择地区；占比 = 当地该民族人口 ÷ 当地总人口。</p></section><section class="card prose-card insight-card"><p class="eyebrow">READ THE DATA</p><h2>数量与占比，回答不同问题。</h2><p>人口数量反映某民族在一个地区的人口规模；当地占比反映该民族在当地人口中的比重。两种排名可能不同。</p><TaiwanPopulation v-if="isGaoshan&&selectedCode==='710000'" compact/><div v-else class="insight-highlight"><strong>{{selectedRegion?.name??'当前地区'}}</strong><span>{{ethnicName}}人口：{{formatPeople(selectedRegion?.populations[ethnicName])}}人</span><span>当地占比：{{selectedRegion?formatMetric(mapValue(selectedRegion,ethnicName,'share'),'share'):'—'}}</span></div><small>这里的“集中度”基于当前已收录地区计算，不包含未收录地区与特殊统计项目。</small></section></div>
    <section class="card table-card analysis-table"><div class="table-heading"><h2>大陆省级地区明细</h2><span>{{populationYear}} 年 · {{ethnicName}}</span></div><div class="table-scroll"><table><thead><tr><th>排名</th><th>地区</th><th>民族人口 / 人</th><th>当地人口占比</th><th>该民族地区分布份额</th><th>操作</th></tr></thead><tbody><tr v-for="(r,index) in ranking" :key="r.code" :class="{highlight:r.code===selectedCode}"><td>{{String(index+1).padStart(2,'0')}}</td><td>{{r.name}}</td><td>{{r.populations[ethnicName]?.toLocaleString('zh-CN')}}</td><td>{{formatPercent(percentage(r.populations[ethnicName],r.total))}}</td><td>{{formatPercent(percentage(r.populations[ethnicName],topPopulation.reduce((s,p)=>s+p.value,0)))}}</td><td><button class="text-button" @click="selectMapRegion(r.code)">地图查看<Icon name="chevron" :size="13"/></button></td></tr></tbody></table></div></section>
    <ModuleMeta :period="`${populationYear}年省级人口；2020年大陆民族人口`" scope="数量与占比使用同一年省级普查。缺失值保留为空，不以全国比例分配到各省。" :sources="[{name:populationYear+'省级普查原表',url:data?.sourceUrl??'https://www.stats.gov.cn/sj/pcsj/rkpc/6rp/html/A0106a.htm'},{name:'2020全国普查原表',url:nationalSource}]"/>
   </section>

   <section id="section-economy" class="ethnic-page-section content-column" aria-label="地区经济"><div class="unified-section-title"><span>04</span><h2>{{ethnicName}} · 地区经济</h2><small>区域发展</small></div>
    <div class="section-page-head"><div><h2>主要分布地区经济 · {{economyYear}}</h2><p>地区整体经济指标 · 中国统计年鉴 2024 初步核算数</p></div><div class="segmented economy-scope"><button :class="{selected:economyScope==='related'}" @click="economyScope='related'">本民族分布地区</button><button :class="{selected:economyScope==='autonomous'}" @click="economyScope='autonomous'">五个自治区</button><button :class="{selected:economyScope==='all'}" @click="economyScope='all'">全部省区市</button></div></div>
    <div class="notice-inline"><Icon name="info" :size="17"/><p>这里展示的是地区整体经济，不能解释为某个民族的收入或经济贡献。人口分布数据为 {{populationYear}} 年，经济数据为 2023 年。</p></div>
    <div id="economy-details" class="three-cards"><section class="card info-card"><span>当前地区</span><strong>{{selectedEconomy?.name??(selectedCode==='710000'?'台湾':'暂无地区数据')}}</strong><small>{{selectedEconomy?(selectedEconomy.autonomous?'民族自治区':'省级地区')+' · 2023 年':'未收录同口径经济数据'}}</small></section><section class="card info-card"><span>地区生产总值</span><strong>{{selectedEconomy?.gdp.toLocaleString('zh-CN')??'—'}}<em>亿元</em></strong><small>按当年价格计算</small></section><section class="card info-card"><span>人均地区生产总值</span><strong>{{selectedEconomy?.perCapita.toLocaleString('zh-CN')??'—'}}<em>元</em></strong><small>不同于居民人均可支配收入</small></section></div>
    <div class="economy-grid"><section class="card chart-card"><div class="chart-head"><div class="section-label"><Icon name="chart"/><h2>地区发展对比</h2></div><select v-model="economyMetric" aria-label="经济对比指标"><option value="gdp">地区 GDP / 亿元</option><option value="perCapita">人均 GDP / 元</option></select></div><div class="comparison-chips"><button v-for="r in economy.filter(r=>comparisonCodes.includes(r.code))" :key="r.code" @click="toggleCompare(r.code)">{{r.name}}<Icon name="close" :size="12"/></button><span v-if="!comparisonCodes.length">在下方表格选择地区进行对比</span></div><Chart v-if="comparison.length" :option="economyChart" :height="285" label="2023年所选地区GDP或人均GDP对比"/><div v-else class="chart-empty">尚未选择对比地区</div><p class="chart-caption">在表格中勾选最多 5 个地区，比较同年同口径指标。</p></section><section class="card chart-card"><div class="section-label"><Icon name="layers"/><h2>{{selectedEconomy?.name??'—'}}产业结构</h2></div><Chart v-if="selectedEconomy" :option="sectorChart" :height="260" :label="`${selectedEconomy.name}三次产业增加值：${selectedEconomy.sectors.join('、')}亿元`"/><p class="chart-caption">三次产业增加值 · 2023 年</p></section></div>
    <section class="card table-card economy-table"><div class="table-heading"><h2>{{economyScope==='related'?ethnicName+'主要分布地区经济概况':economyScope==='autonomous'?'五个自治区经济概况':'省区市经济概况'}}</h2><a :href="economySource" target="_blank" rel="noopener noreferrer">查看原表<Icon name="external" :size="13"/></a></div><div class="table-scroll"><table><thead><tr><th>对比</th><th>地区</th><th>GDP / 亿元</th><th>人均 GDP / 元</th><th>实际增长率</th><th>地区详情</th></tr></thead><tbody><tr v-for="r in economyRows" :key="r.code" :class="{highlight:r.code===selectedCode}"><td><input type="checkbox" :checked="comparisonCodes.includes(r.code)" :aria-label="`对比${r.name}`" @change="toggleCompare(r.code)"/></td><td>{{r.name}}<span v-if="r.autonomous" class="autonomous-dot" title="民族自治区"></span></td><td>{{r.gdp.toLocaleString('zh-CN')}}</td><td>{{r.perCapita.toLocaleString('zh-CN')}}</td><td class="green-text">{{r.growth.toFixed(1)}}%</td><td><button class="text-button" @click="selectEconomyRegion(r.code)">选择地区<Icon name="chevron" :size="13"/></button></td></tr></tbody></table></div></section>
    <ModuleMeta period="2023年地区经济；年鉴2024版" scope="地区GDP、人均GDP及产业结构属于全地区，不等于某民族收入。原表为初步核算数。" :sources="[{name:'统计年鉴经济原表',url:economySource}]"/>
   </section>

   <section id="section-reform" class="ethnic-page-section reform-page" aria-label="民族发展"><div class="unified-section-title"><span>05</span><h2>{{ethnicName}} · 民族发展</h2><small>民族自身的历程</small></div>
    <EthnicDevelopment :ethnic="ethnic" :regions="regions" embedded @map="navigate('map')" @region="exploreDevelopmentRegion"/>
    <details class="card national-reform-context"><summary>全国共同政策背景 <span>展开参考 · 1978—2021</span></summary><p>以下为大陆改革开放与减贫的共同政策背景。各民族的具体事件、地区与来源已在上方时间轴分别展示。<span v-if="isGaoshan">台湾社群的发展历程采用独立的文化教育资料。</span></p><ol><li v-for="event in reformEvents" :key="event.year"><strong>{{event.year}} · {{event.title}}</strong><p>{{event.description}}</p></li></ol><a :href="reformSource" target="_blank" rel="noopener noreferrer">《人类减贫的中国实践》白皮书<Icon name="external" :size="13"/></a></details>
   </section>
   </div>

   <div v-else-if="tab==='sources'" class="sources-page">
    <div class="sources-intro card"><span class="source-check"><Icon name="check" :size="24"/></span><div><h2>公开资料，本地保存，明确口径。</h2><p>大陆省级分布：2010 / 2020 年 · 大陆普查人口：2020 年 · 地区经济：2023 年 · 台湾户籍参考：2026 年 9 月。不同年份分别展示，不混用为同年数据。文化简介为编辑概述，文化摘读保留原文依据与地域背景。</p></div><span class="tiny-badge">第一版</span></div>
    <div class="source-grid"><section v-for="(source,i) in sourceEntries" :key="source.name" class="card source-card"><span class="source-number">{{String(i+1).padStart(2,'0')}}</span><h3>{{source.name}}</h3><small>{{source.publisher}}</small><p>{{source.description}}</p><a :href="source.url" target="_blank" rel="noopener noreferrer">查看公开来源<Icon name="external" :size="14"/></a></section></div>
    <section class="card methodology"><div class="section-label"><Icon name="book"/><h2>怎样理解图表</h2></div><div class="method-grid"><div><h3>数量与占比</h3><p>地区民族人口占比 = 当地某民族人口 ÷ 当地总人口。地区分布份额 = 当地某民族人口 ÷ 已收录地区该民族人口合计。</p></div><div><h3>集中度与缺失数据</h3><p>前五地区集中度基于已收录地区的该民族人口合计计算。源表空白保留为缺失；零值和缺失值使用不同表现。大陆31个省区市之外未接入同口径普查数据；高山族另提供2026年9月台湾原住民户籍参考，不参与上述排名和集中度。</p></div><div><h3>行政边界与人口口径</h3><p>当前省级边界用于匹配2010 / 2020年省级人口，不能用于县级历史分析。民族人口表含未识别民族、外国人加入中国籍等项目，因此56民族之和不必等于地区总人口。</p></div><div><h3>经济与发展解读</h3><p>GDP、产业增加值按当年价格计算；增长率按可比价格计算。五个自治区是行政区域分类，其他省份同样有民族人口和自治地方。单年指标不代表长期发展趋势或政策因果效应。</p></div></div></section>
   </div>
  </div>
  <footer class="site-footer"><span><span class="live-dot"/>{{status}}</span><p>山河同心 · 民族人文志 <i> / </i> 记录地域，认识彼此</p><button @click="navigate('sources')">来源与方法<Icon name="arrow" :size="13"/></button></footer>
 </main>
 <Transition name="toast"><div v-if="toast" class="toast-message" role="status"><Icon name="check" :size="18"/>{{toast}}</div></Transition>
 <Transition name="search-modal"><EthnicSearch v-if="searchOpen" :selected="ethnicName" @choose="pickSearchResult" @close="searchOpen=false"/></Transition>
 </div>
</template>
