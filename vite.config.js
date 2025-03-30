import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages
  // Uses the repository name in production, empty string in development
  base: process.env.NODE_ENV === 'production' ? '/birbwatching/' : '/',
  
  resolve: {
    alias: {
      'three': resolve(__dirname, 'node_modules/three/build/three.module.js')
    }
  },
  
  server: {
    port: 3001,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three']
        }
      }
    }
  }
}); 