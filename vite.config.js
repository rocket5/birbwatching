import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for GitHub Pages
  // Uses the repository name in production, empty string in development
  base: process.env.NODE_ENV === 'production' ? '/birbwatching/' : '/',
  
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
  }
}); 