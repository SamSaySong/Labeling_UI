import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Accept-Ranges': 'bytes',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.url.slice(7), '.'),
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: 'standalone.html', // Chỉ định file đầu vào là standalone.html
      },
    },
  },
});
