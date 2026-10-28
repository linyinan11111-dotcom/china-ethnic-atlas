<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getEthnicAvatar, avatarUrl } from '../data/avatars';
import Icon from './Icon.vue';
import GlassArtwork from './GlassArtwork.vue';
import { getEthnicTheme } from '../utils/themes.mjs';
const props = withDefaults(defineProps<{ name: string; large?: boolean }>(), { large: false });
const record = computed(() => getEthnicAvatar(props.name));
const source = computed(() => avatarUrl(props.name));
const failed = ref(false);
watch(source, () => (failed.value = false));
const description = computed(() => `${props.name}民族服饰插画头像`);
</script>
<template>
  <figure
    class="ethnic-photo"
    :class="{ 'ethnic-photo-large': large }"
    :data-ethnic="name"
  >
    <div class="photo-frame">
      <GlassArtwork
        v-if="large"
        :accent="getEthnicTheme(name).accent"
      />
      <img
        v-if="source && !failed"
        :key="source"
        class="ethnic-photo-image"
        :src="source"
        :alt="description"
        @error="failed = true"
      />
      <div
        v-else
        class="photo-unavailable"
      >
        <Icon
          name="book"
          :size="30"
        />
        <span>头像暂时无法显示</span>
      </div>
      <span class="photo-label">服饰插画 · {{ name }}</span>
    </div>
    <figcaption
      v-if="record"
      class="photo-credit"
    >
      <span>图片来源：昵图网 · 用户提供</span>
      <a
        :href="record.source"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`查看${name}头像来源`"
      >
        查看原图
        <Icon
          name="external"
          :size="11"
        />
      </a>
    </figcaption>
  </figure>
</template>
