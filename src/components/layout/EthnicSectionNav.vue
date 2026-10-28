<script setup lang="ts">
import Icon from '../Icon.vue';
import { useAtlas } from '../../composables/atlasContext';
import { navigation } from '../../config/navigation';
import LiquidLensGroup from '../LiquidLensGroup.vue';
import type { SectionId } from '../../config/navigation';

const { tab, navigate } = useAtlas();
</script>
<template>
  <LiquidLensGroup
    as="nav"
    :active-key="tab"
    draggable
    class="ethnic-section-nav card"
    aria-label="民族专题页内导航"
    @choose="navigate($event as SectionId)"
  >
    <button
      v-for="item in navigation"
      :key="item.id"
      :data-lens-key="item.id"
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
  </LiquidLensGroup>
</template>
