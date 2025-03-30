import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Use '/' for local development to avoid path issues
  base: '/birbwatching/',
  
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