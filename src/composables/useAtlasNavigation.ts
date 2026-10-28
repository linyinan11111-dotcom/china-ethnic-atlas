import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue';
import { ethnicGroups } from '../data/catalogue';
import { isPageId, navigation, type PageId } from '../config/navigation';
import { scrollToContent } from '../utils/content-navigation';

export function readAtlasLocation() {
  const [page, query = ''] = location.hash.slice(1).split('?');
  const requestedEthnic = new URLSearchParams(query).get('ethnic');
  return {
    tab: isPageId(page) ? page : ('map' as PageId),
    ethnic: ethnicGroups.some((group) => group.name === requestedEthnic)
      ? requestedEthnic!
      : '壮族',
    deepLink: isPageId(page),
  };
}

interface NavigationOptions {
  ethnicName: Ref<string>;
  mobileMenu: Ref<boolean>;
  chooseEthnic: (name: string) => void;
  notify: (message: string) => void;
  loadInitialData: () => Promise<void>;
}

export function useAtlasNavigation(options: NavigationOptions) {
  const initial = readAtlasLocation();
  const tab = ref<PageId>(initial.tab);
  let observer: IntersectionObserver | undefined;
  let scrollFrame = 0;
  let navigationVersion = 0;
  let disposed = false;
  let navigating = false;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  function syncHash() {
    const page = tab.value === 'sources' ? 'sources' : 'ethnic';
    const hash = `#${page}?ethnic=${encodeURIComponent(options.ethnicName.value)}`;
    if (location.hash !== hash) history.replaceState(null, '', hash);
  }

  function updateActiveSection() {
    // A smooth jump passes through earlier chapters. Those scroll observations
    // must not pull the selected lens back before the destination is reached.
    if (tab.value === 'sources' || navigating) return;
    const sections = [...document.querySelectorAll<HTMLElement>('.ethnic-page-section')];
    const active =
      sections
        .filter((section) => section.getBoundingClientRect().top <= window.innerHeight * 0.3)
        .at(-1) ?? sections[0];
    const id = active?.id.replace('section-', '');
    if (id && isPageId(id)) tab.value = id;
  }

  function onScroll() {
    if (navigating) {
      scheduleSettle();
      return;
    }
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateActiveSection);
  }

  function finishNavigation() {
    clearTimeout(settleTimer);
    navigating = false;
    updateActiveSection();
  }

  function scheduleSettle() {
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finishNavigation, 160);
  }

  function interruptScroll(event: Event) {
    if (!navigating) return;
    if (
      event instanceof KeyboardEvent &&
      !['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)
    )
      return;
    if (event.target instanceof Element && event.target.closest('input, select, textarea')) return;
    if (
      event instanceof KeyboardEvent &&
      event.target instanceof Element &&
      event.target.closest('.ethnic-section-nav')
    )
      return;
    finishNavigation();
  }

  function observeSections() {
    observer?.disconnect();
    observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0,
    });
    document
      .querySelectorAll('.ethnic-page-section')
      .forEach((section) => observer?.observe(section));
  }

  async function navigate(id: PageId, selector?: string) {
    const version = ++navigationVersion;
    clearTimeout(settleTimer);
    cancelAnimationFrame(scrollFrame);
    navigating = true;
    if (id === 'sources') observer?.disconnect();
    tab.value = id;
    syncHash();
    options.mobileMenu.value = false;
    await nextTick();
    if (disposed || version !== navigationVersion) return;
    if (id === 'sources') {
      scrollToContent(document.querySelector('.page-heading'));
      scheduleSettle();
      options.notify('已打开数据说明');
      return;
    }
    observeSections();
    scrollToContent(
      selector ? document.querySelector(selector) : document.getElementById('section-' + id),
    );
    scheduleSettle();
    options.notify('已定位到' + (navigation.find((item) => item.id === id)?.label ?? '对应内容'));
  }

  async function openEthnic(name: string) {
    options.chooseEthnic(name);
    await navigate('map', '.magazine-cover');
    options.notify('已打开' + name + '专题');
  }

  function onHashChange() {
    const state = readAtlasLocation();
    // Moving between sections must preserve the selected region and comparison basket.
    if (state.ethnic !== options.ethnicName.value) options.chooseEthnic(state.ethnic);
    void navigate(state.tab);
  }

  watch(options.ethnicName, syncHash);
  onMounted(async () => {
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', interruptScroll, { passive: true });
    window.addEventListener('touchstart', interruptScroll, { passive: true });
    window.addEventListener('keydown', interruptScroll);
    const version = navigationVersion;
    await options.loadInitialData();
    await nextTick();
    // A visitor may navigate while data is loading; never pull them back afterwards.
    if (disposed || version !== navigationVersion) return;
    if (initial.deepLink) await navigate(initial.tab);
    else observeSections();
    syncHash();
  });
  onBeforeUnmount(() => {
    disposed = true;
    navigationVersion++;
    observer?.disconnect();
    cancelAnimationFrame(scrollFrame);
    clearTimeout(settleTimer);
    window.removeEventListener('hashchange', onHashChange);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('wheel', interruptScroll);
    window.removeEventListener('touchstart', interruptScroll);
    window.removeEventListener('keydown', interruptScroll);
  });

  return { tab, navigate, openEthnic };
}
