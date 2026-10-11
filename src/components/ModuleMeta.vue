<script setup lang="ts">
defineProps<{period:string;scope:string;sources:{name:string;url:string}[]}>();
</script>
<template><footer class="module-meta"><div><span>资料时间：{{period}}</span><span>页面资料核查：2026-10-10</span></div><p>{{scope}}</p><div><a v-for="source in sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{source.name}} ↗</a></div></footer></template>
<style scoped>
.module-meta{border-top:1px solid var(--rule);padding:18px 0;margin-top:20px;font-size:10px;line-height:1.9;color:#7b846f}.module-meta>div{display:flex;gap:16px;flex-wrap:wrap}.module-meta p{margin:8px 0}.module-meta a{color:var(--theme-accent)}
</style>
