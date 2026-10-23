<script setup lang="ts">
import Icon from '../Icon.vue';
import { useAtlas } from '../../composables/atlasContext';
import { navigation } from '../../config/navigation';

const { tab, navigate } = useAtlas();
</script>
<template>
  <nav
    class="ethnic-section-nav card"
    aria-label="民族专题页内导航"
  >
    <button
      v-for="item in navigation"
      :key="item.id"
      :class="{ active: tab === item.id }"
      :aria-current="tab === item.id ? 'location' : undefined"
      @click="navigate(item.id)"
    >
      <Icon
        :name="item.icon"
        :size="16"
      />
      {{ item.label }}
    </button>
  </nav>
</template>
