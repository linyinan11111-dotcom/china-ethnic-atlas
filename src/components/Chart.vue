<script setup lang="ts">
import {ref,onMounted,onBeforeUnmount,watch} from 'vue';
import {init,use,type EChartsCoreOption,type ECharts} from 'echarts/core';
import {BarChart,LineChart,PieChart} from 'echarts/charts';
import {GridComponent,TooltipComponent,LegendComponent,TitleComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
use([BarChart,LineChart,PieChart,GridComponent,TooltipComponent,LegendComponent,TitleComponent,CanvasRenderer]);
const props=withDefaults(defineProps<{option:EChartsCoreOption;height?:number;label:string}>(),{height:290});
const emit=defineEmits<{select:[name:string]}>();
const element=ref<HTMLDivElement>();
let chart:ECharts|undefined;
let observer:ResizeObserver|undefined;
onMounted(()=>{
 chart=init(element.value!);
 chart.setOption(props.option);
 chart.on('click',event=>emit('select',String(event.name)));
 observer=new ResizeObserver(()=>chart?.resize());observer.observe(element.value!);
});
watch(()=>props.option,value=>chart?.setOption(value,{notMerge:true}),{deep:true});
onBeforeUnmount(()=>{observer?.disconnect();chart?.dispose();});
</script>
<template><div ref="element" :style="{height:height+'px',width:'100%'}" role="img" :aria-label="label"/></template>
