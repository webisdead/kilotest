import { defineConfig } from 'vite';

export default defineConfig({
  base: '/kilotest/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
});