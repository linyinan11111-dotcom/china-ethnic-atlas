import { computed, onMounted, onScopeDispose, ref, watch } from 'vue';
import { ethnicGroups } from '../data/catalogue';
import { ethnicDevelopment } from '../data/development';
import { economy } from '../data/economy';
import type { CulturalPlace } from '../data/places';
import { concentration, rankRegions } from '../utils/analysis.mjs';
import { getEthnicTheme, themeVariables } from '../utils/themes.mjs';
import { downloadPopulationCsv } from '../utils/export-csv';
import { readAtlasLocation, useAtlasNavigation } from './useAtlasNavigation';
import { usePopulationData } from './usePopulationData';
import { useToast } from './useToast';
import { useAtlasCharts } from './useAtlasCharts';

/** Shared selection and actions for one ethnic profile; directory filters stay local. */
export function useAtlasController() {
  const ethnicName = ref(readAtlasLocation().ethnic);
  const mobileMenu = ref(false);
  const searchOpen = ref(false);
  const metric = ref('share');
  const labels = ref(true);
  const placesVisible = ref(true);
  const selectedPlace = ref<string | null>(null);
  const selectedCode = ref<string | null>(null);
  const economyScope = ref('related');
  const economyMetric = ref('gdp');
  const comparisonCodes = ref<string[]>([]);
  const population = usePopulationData();
  const { regions, populationEditions } = population;
  const { toast, notify } = useToast();
  const ethnic = computed(() => ethnicGroups.find((group) => group.name === ethnicName.value)!);
  const editionNumber = computed(() =>
    String(ethnicGroups.indexOf(ethnic.value) + 1).padStart(2, '0'),
  );
  const development = computed(() => ethnicDevelopment[ethnicName.value]);
  const isGaoshan = computed(() => ethnicName.value === '高山族');
  const theme = computed(() => getEthnicTheme(ethnicName.value));
  const themeStyles = computed(() => themeVariables(theme.value));
  const palette = computed(() => theme.value.palette);
  const ranking = computed(() => rankRegions(regions.value, ethnicName.value, metric.value));
  const topPopulation = computed(() => rankRegions(regions.value, ethnicName.value));
  const covered = computed(
    () => regions.value.filter((region) => region.populations[ethnicName.value] != null).length,
  );
  const concentrationValue = computed(() => concentration(regions.value, ethnicName.value));
  const selectedRegion = computed(() =>
    regions.value.find((region) => region.code === selectedCode.value),
  );
  const selectedEconomy = computed(() =>
    economy.find((region) => region.code === selectedCode.value),
  );
  const national2010 = computed(
    () => populationEditions.value[2010]?.national.populations[ethnicName.value] ?? null,
  );
  const populationChange = computed(() =>
    national2010.value ? (ethnic.value.national2020 / national2010.value - 1) * 100 : null,
  );
  const relatedEconomyCodes = computed(() =>
    ethnicName.value === '汉族'
      ? topPopulation.value.slice(0, 3).map((region) => region.code)
      : economy
          .filter((region) => ethnic.value.majorRegions.includes(region.name))
          .map((region) => region.code),
  );
  const economyRows = computed(() =>
    economy
      .filter(
        (region) =>
          economyScope.value === 'all' ||
          (economyScope.value === 'related'
            ? relatedEconomyCodes.value.includes(region.code)
            : region.autonomous),
      )
      .sort((a, b) => (economyMetric.value === 'gdp' ? b.gdp - a.gdp : b.perCapita - a.perCapita)),
  );
  const comparison = computed(() =>
    economy.filter((region) => comparisonCodes.value.includes(region.code)),
  );
  const legendLabels = computed(() =>
    metric.value === 'share'
      ? ['< 0.1%', '0.1–1%', '1–5%', '5–20%', '≥ 20%']
      : ['< 1千', '1千–1万', '1万–10万', '10万–100万', '≥ 100万'],
  );

  function defaultRegion() {
    if (isGaoshan.value) return '710000';
    return (
      regions.value.find((region) => region.name === ethnic.value.majorRegions[0])?.code ??
      topPopulation.value[0]?.code ??
      null
    );
  }

  function chooseEthnic(name: string) {
    if (!ethnicGroups.some((group) => group.name === name)) return;
    ethnicName.value = name;
    economyScope.value = 'related';
    comparisonCodes.value = relatedEconomyCodes.value.slice(0, 3);
    selectedCode.value = defaultRegion();
    selectedPlace.value = null;
  }

  const { tab, navigate, openEthnic } = useAtlasNavigation({
    ethnicName,
    mobileMenu,
    chooseEthnic,
    notify,
    loadInitialData: population.loadData,
  });
  const charts = useAtlasCharts({
    ranking,
    metric,
    theme,
    selectedCode,
    selectedEconomy,
    comparison,
    economyMetric,
  });

  async function selectMapRegion(code: string) {
    selectedCode.value = code;
    await navigate('map', '#region-details');
    notify(
      '已选择' +
        (selectedRegion.value?.name ?? (code === '710000' ? '台湾' : '当前地区')) +
        '，查看地区详情',
    );
  }

  function selectByName(name: string) {
    const code = regions.value.find((region) => region.name === name)?.code;
    if (code) void selectMapRegion(code);
  }

  async function choosePlace(place: CulturalPlace, fromMap = false) {
    selectedPlace.value = place.id;
    selectedCode.value = place.provinceCode;
    placesVisible.value = true;
    await navigate('map', fromMap ? `[data-place="${place.id}"]` : '.map-card');
    notify(fromMap ? '已打开' + place.name + '文化线索' : '已定位' + place.name + '代表点');
  }

  function readStory() {
    void navigate('culture', '.local-story');
  }
  function exploreDevelopmentRegion(code: string) {
    economyScope.value = 'all';
    selectEconomyRegion(code);
  }
  function selectEconomyRegion(code: string) {
    selectedCode.value = code;
    void navigate('economy', '#economy-details');
  }
  function toggleCompare(code: string) {
    const index = comparisonCodes.value.indexOf(code);
    if (index >= 0) comparisonCodes.value.splice(index, 1);
    else if (comparisonCodes.value.length < 5) comparisonCodes.value.push(code);
    else notify('最多选择 5 个地区进行对比');
  }
  function exportCsv() {
    if (!population.data.value) return;
    downloadPopulationCsv(population.data.value, ethnicName.value);
    notify('数据已导出，包含年份、单位和来源');
  }
  function openGlobalSearch() {
    mobileMenu.value = false;
    searchOpen.value = true;
  }
  function pickSearchResult(name: string) {
    searchOpen.value = false;
    void openEthnic(name);
  }
  function searchShortcut(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      searchOpen.value = !searchOpen.value;
    }
  }

  // A late response or retry must not reset a region/basket chosen by the visitor.
  watch(regions, () => {
    if (selectedCode.value === null) selectedCode.value = defaultRegion();
    if (!comparisonCodes.value.length && !initializedComparison) {
      comparisonCodes.value = relatedEconomyCodes.value.slice(0, 3);
      initializedComparison = true;
    }
  });
  let initializedComparison = false;
  chooseEthnic(ethnicName.value);
  initializedComparison = comparisonCodes.value.length > 0;
  onMounted(() => {
    window.addEventListener('keydown', searchShortcut);
  });
  onScopeDispose(() => window.removeEventListener('keydown', searchShortcut));

  return {
    ...population,
    ...charts,
    tab,
    ethnicName,
    ethnic,
    editionNumber,
    development,
    isGaoshan,
    theme,
    themeStyles,
    palette,
    metric,
    labels,
    placesVisible,
    selectedPlace,
    selectedCode,
    selectedRegion,
    selectedEconomy,
    ranking,
    topPopulation,
    covered,
    concentrationValue,
    national2010,
    populationChange,
    relatedEconomyCodes,
    economyScope,
    economyMetric,
    economyRows,
    comparisonCodes,
    comparison,
    legendLabels,
    mobileMenu,
    searchOpen,
    toast,
    notify,
    navigate,
    openEthnic,
    selectMapRegion,
    selectByName,
    choosePlace,
    readStory,
    exploreDevelopmentRegion,
    selectEconomyRegion,
    toggleCompare,
    exportCsv,
    openGlobalSearch,
    pickSearchResult,
  };
}
