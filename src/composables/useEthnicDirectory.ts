import { computed, ref } from 'vue';
import { directoryGroups } from '../data/directory';
import { searchDirectory } from '../utils/ethnic-search.mjs';

const popular = new Set([
  '壮族',
  '回族',
  '维吾尔族',
  '苗族',
  '满族',
  '彝族',
  '土家族',
  '藏族',
  '蒙古族',
  '侗族',
  '白族',
  '傣族',
]);

export function useEthnicDirectory() {
  const search = ref('');
  const filter = ref('all');
  const directoryRegion = ref('');
  const directoryTopic = ref('');
  const visibleEthnics = computed(() =>
    searchDirectory(directoryGroups, search.value, {
      region: directoryRegion.value,
      topic: directoryTopic.value,
    }).filter((group) => search.value.trim() || filter.value === 'all' || popular.has(group.name)),
  );

  function resetDirectory() {
    search.value = '';
    filter.value = 'all';
    directoryRegion.value = '';
    directoryTopic.value = '';
  }

  return { search, filter, directoryRegion, directoryTopic, visibleEthnics, resetDirectory };
}
