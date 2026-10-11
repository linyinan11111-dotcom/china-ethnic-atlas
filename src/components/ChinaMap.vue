<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, watch} from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Point from 'ol/geom/Point';
import {Fill,Stroke,Style,Text,Circle as CircleStyle} from 'ol/style';
import {culturalPlaces,type CulturalPlace} from '../data/places';
import {fromLonLat,transformExtent} from 'ol/proj';
import {defaults as defaultControls} from 'ol/control';
import {unByKey} from 'ol/Observable';
import type {EventsKey} from 'ol/events';
import type {PopulationRegion} from '../types';
import {mapValue,classIndex,formatMetric} from '../utils/analysis.mjs';
import {getEthnicTheme} from '../utils/themes.mjs';
import taiwan from '../data/taiwan-indigenous.json';
import Icon from './Icon.vue';

const props=withDefaults(defineProps<{regions:PopulationRegion[];ethnic:string;metric:string;selected:string|null;labels:boolean;places?:boolean;place?:string|null;year?:number}>(),{places:true,place:null,year:2020});
const emit=defineEmits<{select:[code:string];site:[place:CulturalPlace];ready:[];error:[message:string]}>();
const target=ref<HTMLDivElement>();
const inset=ref<HTMLDivElement>();
const error=ref('');
const loading=ref(true);
const rendered=ref(false);
const hover=ref<{name:string;label:string;value:string;x:number;y:number}|null>(null);
let map:Map|undefined;
let insetMap:Map|undefined;
let layer:VectorLayer<VectorSource<Feature<Geometry>>>|undefined;
let insetLayer:VectorLayer<VectorSource<Feature<Geometry>>>|undefined;
let placeLayer:VectorLayer<VectorSource<Feature<Geometry>>>|undefined;
let observer:ResizeObserver|undefined;
const eventKeys:EventsKey[]=[];
const countryExtent=transformExtent([73.4,17.8,135.2,54.2],'EPSG:4326','EPSG:3857');
const shortName=(name:string)=>name.replace(/壮族自治区|维吾尔自治区|回族自治区|自治区|特别行政区|省|市/g,'');
const getRegion=(code:string)=>props.regions.find(r=>r.code===code);
function style(feature:Feature<Geometry>,resolution:number){
 const code=String(feature.get('adcode'));
 const name=feature.get('name') as string;
 const region=getRegion(code);
 const value=mapValue(region,props.ethnic,props.metric);
 const i=classIndex(value,props.metric);
 const theme=getEthnicTheme(props.ethnic);
 const active=code===props.selected;
 const hoverActive=name===hover.value?.name;
 const reference=props.ethnic==='高山族'&&code==='710000';
 const border=new Style({fill:new Fill({color:reference?theme.soft:i<0?'#e7e7e1':theme.palette[i]}),stroke:new Stroke({color:active?theme.deep:reference||hoverActive?theme.accent:'#ffffff',width:active?2.8:reference||hoverActive?1.8:1.1,lineDash:reference?[4,3]:undefined}),zIndex:active?3:1});
 const styles=[border];
 if(props.labels && name){
   const coordinates=feature.get('centroid')??feature.get('center');
   if(coordinates){
     styles.push(new Style({geometry:new Point(fromLonLat(coordinates)),text:new Text({text:shortName(name)+(reference?'*':''),font:`${active?'600':'400'} 11px "Microsoft YaHei",sans-serif`,fill:new Fill({color:i>=3?'#ffffff':theme.deep}),stroke:new Stroke({color:i>=3?theme.accent:theme.pale,width:2}),overflow:reference}),zIndex:4}));
   }
 }
 return styles;
}
function reset(animate=true){map?.getView().fit(countryExtent,{padding:[24,20,20,18],duration:animate?250:0});}
function zoom(delta:number){if(map)map.getView().animate({zoom:(map.getView().getZoom()??4)+delta,duration:200});}
function updatePlaces(){
 const source=placeLayer?.getSource();if(!source)return;source.clear();placeLayer?.setVisible(props.places);
 source.addFeatures(culturalPlaces.filter(p=>p.ethnic===props.ethnic).map(p=>new Feature({geometry:new Point(fromLonLat(p.coordinates)),site:p,name:p.name})));
 placeLayer?.changed();
}
function focusPlace(place:CulturalPlace){map?.getView().animate({center:fromLonLat(place.coordinates),zoom:6.2,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:350});}
async function load(){
 error.value='';loading.value=true;
 try{
   const response=await fetch(`${import.meta.env.BASE_URL}china-provinces.geojson`);
   if(!response.ok)throw new Error('地图边界加载失败，请检查网络后重试。');
   const json=await response.json();
   const source=new VectorSource<Feature<Geometry>>({features:new GeoJSON().readFeatures(json,{featureProjection:'EPSG:3857'})});
   layer=new VectorLayer({source,declutter:true,style:(feature,resolution)=>style(feature as Feature<Geometry>,resolution)});
   placeLayer=new VectorLayer({source:new VectorSource<Feature<Geometry>>(),style:feature=>{const theme=getEthnicTheme(props.ethnic);return new Style({image:new CircleStyle({radius:feature.get('site').id===props.place?9:6,fill:new Fill({color:theme.deep}),stroke:new Stroke({color:'#fffaf1',width:2})}),text:new Text({text:feature.get('name'),offsetY:-18,font:'600 11px "Microsoft YaHei",sans-serif',fill:new Fill({color:theme.deep}),stroke:new Stroke({color:'#fffaf1',width:3})}),zIndex:10});}});
   map=new Map({target:target.value,layers:[layer,placeLayer],controls:defaultControls({zoom:false,rotate:false,attribution:false}),view:new View({center:fromLonLat([104,36]),zoom:4,minZoom:2.5,maxZoom:9,extent:transformExtent([48,-12,160,68],'EPSG:4326','EPSG:3857'),showFullExtent:true})});
   updatePlaces();
   insetLayer=new VectorLayer({source,style:()=>{const theme=getEthnicTheme(props.ethnic);return new Style({fill:new Fill({color:theme.palette[1]}),stroke:new Stroke({color:theme.accent,width:.6})});}});
   insetMap=new Map({target:inset.value,layers:[insetLayer],controls:[],interactions:[],view:new View({center:fromLonLat([114,13]),zoom:3.5})});
   insetMap.getView().fit(transformExtent([105,2,124,24],'EPSG:4326','EPSG:3857'),{padding:[3,3,3,3]});
   eventKeys.push(map.on('pointermove',event=>{
     if(event.dragging)return;
     const hit=map!.forEachFeatureAtPixel(event.pixel,f=>f,{hitTolerance:3});
     if(hit?.get('name')){
       const region=getRegion(String(hit.get('adcode')));
       const reference=props.ethnic==='高山族'&&String(hit.get('adcode'))==='710000';
       hover.value={name:hit.get('name'),label:hit.get('site')?'文化与地区线索':reference?'原住民户籍 · '+taiwan.period:props.ethnic,value:hit.get('site')?'点击阅读':reference?formatMetric(props.metric==='share'?taiwan.share:taiwan.population,props.metric):formatMetric(mapValue(region,props.ethnic,props.metric),props.metric),x:Math.max(8,Math.min(event.pixel[0]+14,(target.value?.clientWidth??600)-185)),y:Math.max(8,Math.min(event.pixel[1]+14,(target.value?.clientHeight??500)-78))};
       target.value!.style.cursor='pointer';
     }else{hover.value=null;target.value!.style.cursor='grab';}
     layer?.changed();
   }));
   eventKeys.push(map.on('singleclick',event=>{
     const hit=map!.forEachFeatureAtPixel(event.pixel,f=>f,{hitTolerance:3});
     if(hit?.get('site'))emit('site',hit.get('site'));
     else if(hit?.get('adcode'))emit('select',String(hit.get('adcode')));
   }));
   eventKeys.push(map.on('rendercomplete',()=>{rendered.value=true;}));
   observer=new ResizeObserver(()=>{map?.updateSize();insetMap?.updateSize();reset(false);});
   if(target.value)observer.observe(target.value);
   reset(false);loading.value=false;emit('ready');
 }catch(e){error.value=e instanceof Error?e.message:'地图加载失败';loading.value=false;emit('error',error.value);}
}
watch(()=>[props.ethnic,props.metric,props.selected,props.labels,props.year],()=>{hover.value=null;layer?.changed();insetLayer?.changed();});
watch(()=>[props.ethnic,props.places],updatePlaces);
watch(()=>props.place,id=>{placeLayer?.changed();const place=culturalPlaces.find(p=>p.id===id);if(place)focusPlace(place);});
onMounted(load);
onBeforeUnmount(()=>{observer?.disconnect();unByKey(eventKeys);map?.dispose();insetMap?.dispose();});
defineExpose({reset,focusPlace});
</script>

<template>
 <div class="map-canvas" :data-rendered="rendered" @mouseleave="hover=null">
  <div ref="target" class="ol-target" :data-reference-region="ethnic==='高山族'?'710000':undefined" tabindex="0" aria-label="中国民族人口分布地图，可拖动和缩放；也可使用下方地区排名选择省份" />
  <div class="map-caption"><span class="live-dot"></span>省级人口分布 <span class="map-year">{{year}} 年普查</span></div>
  <div class="map-compass"><span>N</span><svg viewBox="0 0 24 36" width="21" height="32"><path d="M12 2 21 29 12 23Z" fill="var(--theme-accent)"/><path d="M12 2 3 29 12 23Z" fill="var(--theme-tint)"/></svg></div>
  <div class="map-actions">
   <button title="放大地图" aria-label="放大地图" @click="zoom(1)"><Icon name="plus" :size="18" /></button>
   <button title="缩小地图" aria-label="缩小地图" @click="zoom(-1)"><Icon name="minus" :size="18" /></button>
   <button title="回到全国视图" aria-label="回到全国视图" @click="reset()"><Icon name="reset" :size="17" /></button>
  </div>
  <div class="south-sea"><div ref="inset" class="inset-map"/><span>南海诸岛</span></div>
  <div v-if="hover" class="map-tooltip" :style="{left:hover.x+'px',top:hover.y+'px'}"><strong>{{hover.name}}</strong><span>{{hover.label}} · {{hover.value}}</span></div>
  <div v-if="loading" class="map-loading"><span class="spinner"/>正在加载中国地图…</div>
  <div v-if="error" class="map-loading"><Icon name="info"/><p>{{error}}</p><button class="primary-button" @click="load">重新加载</button></div>
  <div class="map-coordinate">CHINA / ETHNIC ATLAS <span>滚轮缩放 · 点击地区查看详情</span></div>
 </div>
</template>
