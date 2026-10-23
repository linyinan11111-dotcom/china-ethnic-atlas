import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  // Relative assets work on both username.github.io and username.github.io/repository/.
  base: './',
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/echarts/') || id.includes('/node_modules/zrender/'))
            return 'charts';
          if (id.includes('/node_modules/ol/')) return 'maps';
          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/')) return 'vue';
        },
      },
    },
  },
});
