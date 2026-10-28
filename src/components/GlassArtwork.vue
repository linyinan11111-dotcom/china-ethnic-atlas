<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { GlassRenderer } from '../vendor/lens/internal/renderer.js';

const props = defineProps<{ accent: string }>();
const stage = ref<HTMLDivElement>();
const canvas = ref<HTMLCanvasElement>();
const state = ref('fallback');
let renderer: GlassRenderer | undefined;
let transparency: MediaQueryList | undefined;

function paint(
  ctx: CanvasRenderingContext2D,
  { width, height }: { width: number; height: number },
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#effbff');
  gradient.addColorStop(0.55, '#dbe9f8');
  gradient.addColorStop(1, '#ece3f8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, height * (0.5 + i * 0.2));
    ctx.bezierCurveTo(
      width * 0.3,
      height * (0.05 + i * 0.2),
      width * 0.65,
      height * (0.95 + i * 0.15),
      width * 1.1,
      height * (0.15 + i * 0.22),
    );
    ctx.lineTo(width * 1.1, height * 1.1);
    ctx.lineTo(-width * 0.1, height * 1.1);
    ctx.closePath();
    ctx.fillStyle = props.accent + ['32', '23', '16'][i];
    ctx.fill();
    ctx.strokeStyle = '#ffffff80';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function updateMaterial() {
  if (transparency?.matches) {
    renderer?.destroy();
    renderer = undefined;
    state.value = 'fallback';
    return;
  }
  if (!stage.value || !canvas.value || renderer) return;
  // Only this small decorative area uses WebGL. Foreground text remains native DOM.
  renderer = new GlassRenderer(canvas.value, stage.value, {
    artwork: paint,
    motion: false,
    brightness: 1,
    refraction: 0.72,
    blur: 0.15,
    dispersion: 0.18,
    onState: (value: string) => {
      state.value = value === 'ready' ? 'ready' : 'fallback';
    },
  });
}
onMounted(() => {
  transparency = window.matchMedia('(prefers-reduced-transparency: reduce)');
  transparency.addEventListener('change', updateMaterial);
  updateMaterial();
});
watch(
  () => props.accent,
  () => renderer?.set({ scene: 'aurora' }),
);
onBeforeUnmount(() => {
  transparency?.removeEventListener('change', updateMaterial);
  renderer?.destroy();
});
</script>

<template>
  <div
    ref="stage"
    class="glass-artwork"
    :data-material="state"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="glass-artwork-canvas"
    />
    <span
      class="portrait-lens"
      data-glass="panel"
    />
    <span
      class="portrait-orbit orbit-one"
      data-glass="small"
    />
    <span
      class="portrait-orbit orbit-two"
      data-glass="small"
    />
  </div>
</template>
