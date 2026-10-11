import {formatMetric,formatPercent} from './analysis.mjs';
export function buildRankingChart(ranking,metric,theme,selectedCode){
 const rows=ranking.slice(0,8).reverse();
 return {animationDuration:250,textStyle:{fontFamily:'"Microsoft YaHei", sans-serif',color:'#758278',fontSize:11},
  tooltip:{trigger:'axis',renderMode:'richText',valueFormatter:value=>formatMetric(Number(value),metric)},
  grid:{left:10,right:metric==='share'?80:66,top:14,bottom:40,containLabel:true},
  xAxis:{type:'value',min:0,max:metric==='share'&&ranking[0]?.value>80?100:undefined,splitNumber:3,name:metric==='share'?'当地人口占比':'人口 / 人',nameLocation:'middle',nameGap:28,
   axisLabel:{hideOverlap:true,formatter:value=>metric==='share'?formatPercent(value):value>=10000?`${Number((value/10000).toFixed(2))}万`:String(Number(value.toFixed(4)))},splitLine:{lineStyle:{color:'#edf0e9'}}},
  yAxis:{type:'category',data:rows.map(r=>r.name),axisLine:{show:false},axisTick:{show:false}},
  series:[{type:'bar',data:rows.map(r=>({value:r.value,itemStyle:{color:r.code===selectedCode?theme.deep:theme.accent,borderRadius:[0,4,4,0]}})),barWidth:12,
   label:{show:true,position:'right',fontSize:10,color:'#718074',formatter:p=>metric==='share'?formatPercent(p.value):p.value>=10000?`${Number((p.value/10000).toFixed(2))}万`:String(p.value)}}]};
}
