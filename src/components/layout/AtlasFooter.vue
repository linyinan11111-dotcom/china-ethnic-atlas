<script setup lang="ts">
import Icon from '../Icon.vue';
import { useAtlas } from '../../composables/atlasContext';

const { status, navigate } = useAtlas();
</script>
<template>
  <footer class="site-footer">
    <span>
      <span class="live-dot" />
      {{ status }}
    </span>
    <p>
      山河同心 · 民族人文志
      <i>/</i>
      记录地域，认识彼此
    </p>
    <button @click="navigate('sources')">
      来源与方法
      <Icon
        name="arrow"
        :size="13"
      />
    </button>
  </footer>
</template>
