import { onMounted, onScopeDispose, type Ref } from 'vue';

/** Light follows control surfaces; text and map geometry never transform. */
export function useGlassLight(root: Ref<HTMLElement | undefined>) {
  let frame = 0;
  let current: HTMLElement | null = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  function move(event: PointerEvent) {
    if (reduced.matches || event.pointerType === 'touch') return;
    const panel = (event.target as HTMLElement).closest<HTMLElement>(
      '.site-header, .ethnic-section-nav, .ethnic-sidebar, .heading-tools, .map-actions',
    );
    if (!panel) return;
    if (current !== panel) {
      current?.style.removeProperty('--glass-light-x');
      current?.style.removeProperty('--glass-light-y');
    }
    current = panel;
    cancelAnimationFrame(frame);
    const { clientX, clientY } = event;
    frame = requestAnimationFrame(() => {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty('--glass-light-x', `${((clientX - rect.left) / rect.width) * 100}%`);
      panel.style.setProperty('--glass-light-y', `${((clientY - rect.top) / rect.height) * 100}%`);
    });
  }
  onMounted(() => root.value?.addEventListener('pointermove', move, { passive: true }));
  onScopeDispose(() => {
    cancelAnimationFrame(frame);
    root.value?.removeEventListener('pointermove', move);
  });
}
