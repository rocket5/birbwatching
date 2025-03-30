import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base path for GitHub Pages, use '/' if deploying to custom domain or root
  base: '/birbwatching/',
  
  resolve: {
    alias: {
      'three': resolve(__dirname, 'node_modules/three')
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
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
}); 