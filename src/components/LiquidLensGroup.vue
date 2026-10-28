<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    as?: string;
    activeKey: string;
    draggable?: boolean;
  }>(),
  { as: 'div', draggable: false },
);
const emit = defineEmits<{ choose: [key: string] }>();
const root = ref<HTMLElement>();
const filterId = 'liquid-lens-' + useId().replace(/[^a-z0-9-]/gi, '');
const normalMap = ref('');
const visible = ref(false);
const dragging = ref(false);
const lens = ref({ transform: '', width: '0px', height: '0px' });
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const position = { x: 0, y: 0, w: 0, h: 0 };
const target = { ...position };
const velocity = { ...position };
let frame = 0;
let lastTime = 0;
let initialized = false;
let hovered: HTMLElement | undefined;
let observer: ResizeObserver | undefined;
let childrenObserver: MutationObserver | undefined;
let gesture:
  | { id: number; x: number; y: number; key: string; moved: boolean; capture: HTMLElement }
  | undefined;
let ignoreClickUntil = 0;
let normalSize = '';

function buttons() {
  return Array.from(root.value?.querySelectorAll<HTMLElement>('[data-lens-key]') ?? []);
}
function activeButton() {
  return buttons().find((button) => button.dataset.lensKey === props.activeKey);
}

// The same normal-map rim technique as the local reference bends the actual
// backdrop. Only the material distorts; labels remain accessible native text.
function updateNormal(width: number, height: number) {
  const size = `${Math.round(width)}:${Math.round(height)}`;
  if (size === normalSize) return;
  normalSize = size;
  const ratio = Math.min(1, 320 / Math.max(width, height));
  const w = Math.max(1, Math.round(width * ratio));
  const h = Math.max(1, Math.round(height * ratio));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const pixels = ctx.createImageData(w, h);
  const radius = Math.min(22 * ratio, w / 2, h / 2);
  const band = Math.min(18 * ratio, h / 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - w / 2;
      const py = y + 0.5 - h / 2;
      const qx = Math.abs(px) - w / 2 + radius;
      const qy = Math.abs(py) - h / 2 + radius;
      const ox = Math.max(qx, 0),
        oy = Math.max(qy, 0);
      const distanceToCorner = Math.hypot(ox, oy);
      const distance = distanceToCorner + Math.min(Math.max(qx, qy), 0) - radius;
      const strength =
        distance <= 0 && distance > -band ? Math.sin((-distance / band) * Math.PI) * 0.9 : 0;
      const nx = distanceToCorner ? ox / distanceToCorner : qx > qy ? 1 : 0;
      const ny = distanceToCorner ? oy / distanceToCorner : qy >= qx ? 1 : 0;
      const offset = (y * w + x) * 4;
      pixels.data[offset] = 128 + Math.sign(px) * nx * strength * 127;
      pixels.data[offset + 1] = 128 + Math.sign(py) * ny * strength * 127;
      pixels.data[offset + 2] = 128;
      pixels.data[offset + 3] = 255;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  normalMap.value = canvas.toDataURL();
}
function draw() {
  const stretch = reducedMotion.matches ? 1 : 1 + Math.min(Math.abs(velocity.x) / 4500, 0.07);
  lens.value = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${stretch}, ${1 / stretch})`,
    width: `${Math.max(1, position.w)}px`,
    height: `${Math.max(1, position.h)}px`,
  };
}
function animate(now: number) {
  const dt = Math.min((now - (lastTime || now - 16)) / 1000, 0.032);
  lastTime = now;
  let moving = false;
  for (const key of ['x', 'y', 'w', 'h'] as const) {
    // A damped spring settles with a small overshoot, without an idle loop.
    velocity[key] += ((target[key] - position[key]) * 420 - velocity[key] * 32) * dt;
    position[key] += velocity[key] * dt;
    if (Math.abs(target[key] - position[key]) > 0.08 || Math.abs(velocity[key]) > 0.3)
      moving = true;
  }
  draw();
  frame = moving ? requestAnimationFrame(animate) : 0;
  if (!moving) {
    Object.assign(position, target);
    Object.keys(velocity).forEach((key) => {
      velocity[key as keyof typeof velocity] = 0;
    });
    lastTime = 0;
    draw();
  }
}
function follow(button?: HTMLElement, immediate = false) {
  if (!root.value || !button) {
    visible.value = false;
    return;
  }
  const box = button.getBoundingClientRect();
  const group = root.value.getBoundingClientRect();
  Object.assign(target, {
    x: box.left - group.left + root.value.scrollLeft - root.value.clientLeft,
    y: box.top - group.top + root.value.scrollTop - root.value.clientTop,
    w: box.width,
    h: box.height,
  });
  visible.value = true;
  updateNormal(target.w, target.h);
  if (!initialized || immediate || reducedMotion.matches) {
    initialized = true;
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    Object.assign(position, target);
    Object.assign(velocity, { x: 0, y: 0, w: 0, h: 0 });
    draw();
  } else if (!frame) frame = requestAnimationFrame(animate);
}
function underPointer(event: PointerEvent) {
  return (event.target as Element).closest<HTMLElement>('[data-lens-key]') ?? undefined;
}
function nearest(clientX: number) {
  return buttons().reduce<HTMLElement | undefined>((closest, button) => {
    const box = button.getBoundingClientRect();
    const other = closest?.getBoundingClientRect();
    return !other ||
      Math.abs(clientX - box.left - box.width / 2) <
        Math.abs(clientX - other.left - other.width / 2)
      ? button
      : closest;
  }, undefined);
}
function pointerDown(event: PointerEvent) {
  if (!props.draggable || !event.isPrimary || event.button !== 0) return;
  const button = underPointer(event);
  if (!button) return;
  gesture = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    key: button.dataset.lensKey!,
    moved: false,
    capture: button,
  };
  button.setPointerCapture(event.pointerId);
}
function pointerMove(event: PointerEvent) {
  if (!gesture) {
    if (!props.draggable && event.pointerType !== 'touch') {
      hovered = underPointer(event);
      follow(hovered ?? activeButton());
    }
    return;
  }
  if (gesture.id !== event.pointerId || !root.value) return;
  const deltaX = event.clientX - gesture.x;
  const deltaY = event.clientY - gesture.y;
  if (!gesture.moved && Math.abs(deltaY) > 9 && Math.abs(deltaY) > Math.abs(deltaX)) {
    cancelGesture();
    return;
  }
  if (!gesture.moved && Math.abs(deltaX) < 6) return;
  gesture.moved = true;
  dragging.value = true;
  const box = root.value.getBoundingClientRect();
  if (event.clientX > box.right - 32) root.value.scrollLeft += 14;
  else if (event.clientX < box.left + 32) root.value.scrollLeft -= 14;
  const button = nearest(event.clientX);
  if (!button) return;
  gesture.key = button.dataset.lensKey!;
  follow(button);
  // Free movement between detents while the pointer is held.
  target.x = Math.max(
    5,
    Math.min(
      root.value.scrollWidth - target.w - 5,
      event.clientX - box.left + root.value.scrollLeft - target.w / 2,
    ),
  );
  if (reducedMotion.matches) {
    position.x = target.x;
    draw();
  }
}
function pointerUp(event: PointerEvent) {
  if (!gesture || gesture.id !== event.pointerId) return;
  const { moved, key, capture, id } = gesture;
  gesture = undefined;
  dragging.value = false;
  if (capture.hasPointerCapture(id)) capture.releasePointerCapture(id);
  if (moved) {
    ignoreClickUntil = performance.now() + 350;
    follow(buttons().find((button) => button.dataset.lensKey === key));
    emit('choose', key);
  }
}
function cancelGesture() {
  if (!gesture) return;
  const previous = gesture;
  gesture = undefined;
  dragging.value = false;
  if (previous?.capture.hasPointerCapture(previous.id))
    previous.capture.releasePointerCapture(previous.id);
  follow(activeButton());
}
function clickCapture(event: MouseEvent) {
  if (performance.now() < ignoreClickUntil) {
    event.preventDefault();
    event.stopPropagation();
  }
}
function keydown(event: KeyboardEvent) {
  if (!props.draggable || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const options = buttons();
  const index = options.indexOf(document.activeElement as HTMLElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? options.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
  options[next]?.focus({ preventScroll: true });
  options[next]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  emit('choose', options[next]!.dataset.lensKey!);
}
function restore() {
  hovered = undefined;
  if (!gesture) follow(activeButton());
}
function refresh() {
  nextTick(() => {
    if (!gesture) follow(hovered?.isConnected ? hovered : activeButton());
  });
}
watch(
  () => props.activeKey,
  () => {
    hovered = undefined;
    refresh();
  },
);
onMounted(() => {
  observer = new ResizeObserver(refresh);
  observer.observe(root.value!);
  observer.observe(root.value!.parentElement!);
  childrenObserver = new MutationObserver(refresh);
  childrenObserver.observe(root.value!, { childList: true });
  refresh();
});
onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  childrenObserver?.disconnect();
  const previous = gesture;
  gesture = undefined;
  if (previous?.capture.hasPointerCapture(previous.id))
    previous.capture.releasePointerCapture(previous.id);
});
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="liquid-lens-group"
    :class="{ 'lens-draggable': draggable, 'lens-dragging': dragging }"
    :style="{ '--lens-filter': `url(#${filterId})` }"
    @pointerdown="pointerDown"
    @pointermove="pointerMove"
    @pointerup="pointerUp"
    @pointercancel="cancelGesture"
    @lostpointercapture="cancelGesture"
    @pointerleave="restore"
    @focusout="restore"
    @keydown="keydown"
    @click.capture="clickCapture"
    @focusin="
      !draggable &&
      follow(($event.target as Element).closest<HTMLElement>('[data-lens-key]') ?? undefined)
    "
  >
    <svg
      class="lens-filter-defs"
      aria-hidden="true"
      width="0"
      height="0"
    >
      <defs>
        <filter
          :id="filterId"
          x="0"
          y="0"
          width="100%"
          height="100%"
          color-interpolation-filters="sRGB"
        >
          <feImage
            :href="normalMap"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="normal"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="normal"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
    <span
      class="liquid-selection-lens"
      :class="{ 'is-visible': visible }"
      :style="lens"
      aria-hidden="true"
    />
    <slot />
  </component>
</template>
