import { inject, provide, type InjectionKey } from 'vue';
import type { useAtlasController } from './useAtlasController';

type AtlasContext = ReturnType<typeof useAtlasController>;
const atlasKey: InjectionKey<AtlasContext> = Symbol('atlas');

export function provideAtlas(context: AtlasContext) {
  provide(atlasKey, context);
}

export function useAtlas() {
  const context = inject(atlasKey);
  if (!context) throw new Error('Atlas components must be rendered inside App.vue.');
  return context;
}
