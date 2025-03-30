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
  
  // Configure assets handling to ensure GLB files are treated correctly
  assetsInclude: ['**/*.glb'],
  
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
        },
        // Make sure binary files aren't transformed
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.glb')) {
            return 'assets/models/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
}); 