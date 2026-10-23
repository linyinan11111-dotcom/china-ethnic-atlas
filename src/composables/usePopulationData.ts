import { computed, onScopeDispose, ref } from 'vue';
import type { PopulationData } from '../types';

export const censusYears = [2020, 2010] as const;
export type CensusYear = (typeof censusYears)[number];

// An unavailable edition must not hide the other edition or leave the year label stale.
export function usePopulationData() {
  const populationYear = ref<CensusYear>(2020);
  const populationEditions = ref<Partial<Record<CensusYear, PopulationData>>>({});
  const editionErrors = ref<Partial<Record<CensusYear, string>>>({});
  const loading = ref(false);
  const data = computed(() => populationEditions.value[populationYear.value] ?? null);
  const regions = computed(() => data.value?.regions ?? []);
  const error = computed(() => Object.values(editionErrors.value).join('；'));
  const status = computed(() =>
    loading.value ? '正在加载数据' : data.value ? '本地统计数据已加载' : '数据加载失败',
  );
  let request: AbortController | undefined;

  async function loadData() {
    request?.abort();
    const current = new AbortController();
    request = current;
    loading.value = true;
    const results = await Promise.allSettled(
      censusYears.map(async (year) => {
        const filename = year === 2010 ? 'population' : 'population2020';
        const response = await fetch(`${import.meta.env.BASE_URL}data/${filename}.json`, {
          signal: current.signal,
        });
        if (!response.ok) throw new Error(`${year}年人口数据加载失败`);
        const edition = (await response.json()) as PopulationData;
        if (
          edition.year !== year ||
          edition.regions?.length !== 31 ||
          !edition.national?.populations
        ) {
          throw new Error(`${year}年人口数据不完整`);
        }
        return edition;
      }),
    );
    if (current.signal.aborted) return;

    const errors: Partial<Record<CensusYear, string>> = {};
    results.forEach((result, index) => {
      const year = censusYears[index];
      if (result.status === 'fulfilled') populationEditions.value[year] = result.value;
      else
        errors[year] =
          result.reason instanceof Error ? result.reason.message : `${year}年人口数据加载失败`;
    });
    editionErrors.value = errors;
    if (!data.value) {
      const availableYear = censusYears.find((year) => populationEditions.value[year]);
      if (availableYear) populationYear.value = availableYear;
    }
    loading.value = false;
  }

  onScopeDispose(() => request?.abort());
  return {
    data,
    regions,
    populationYear,
    populationEditions,
    editionErrors,
    loading,
    error,
    status,
    loadData,
  };
}
