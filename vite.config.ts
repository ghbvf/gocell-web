/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    fs: {
      allow: [path.resolve(__dirname, '../gocell')],
    },
    proxy: {
      '/api/v1/access': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/v1/audit': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/v1/config': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/v1/flags': { target: 'http://localhost:8081', changeOrigin: true },
      '/api/v1/orders': { target: 'http://localhost:8082', changeOrigin: true },
      '/api/v1/devices': { target: 'http://localhost:8083', changeOrigin: true },
      '/sso/healthz': { target: 'http://localhost:8081', rewrite: (path) => path.replace(/^\/sso/, '') },
      '/order/healthz': { target: 'http://localhost:8082', rewrite: (path) => path.replace(/^\/order/, '') },
      '/device/healthz': { target: 'http://localhost:8083', rewrite: (path) => path.replace(/^\/device/, '') },
      '/sso/readyz': { target: 'http://localhost:8081', rewrite: (path) => path.replace(/^\/sso/, '') },
      '/order/readyz': { target: 'http://localhost:8082', rewrite: (path) => path.replace(/^\/order/, '') },
      '/device/readyz': { target: 'http://localhost:8083', rewrite: (path) => path.replace(/^\/device/, '') }
    }
  },
  test: {
    environment: 'jsdom',
  }
})
