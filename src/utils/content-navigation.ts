// Account for the actual sticky navigation height, including mobile text wrapping.
const arrivalTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();
export function scrollToContent(target: HTMLElement | null) {
  if (!target) return;
  const navigation = document.querySelector('.ethnic-section-nav')?.getBoundingClientRect();
  const offset = (navigation?.height ?? 0) + 22;
  const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.classList.remove('navigation-arrival');
  void target.offsetWidth;
  target.classList.add('navigation-arrival');
  const previous = arrivalTimers.get(target);
  if (previous) clearTimeout(previous);
  arrivalTimers.set(
    target,
    setTimeout(() => {
      target.classList.remove('navigation-arrival');
      arrivalTimers.delete(target);
    }, 2800),
  );
  window.scrollTo({
    top,
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  });
}
