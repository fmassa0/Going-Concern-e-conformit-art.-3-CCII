import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLE=1 → build single-page: tutto (JS, CSS, Chart.js, ExcelJS) inline in un
// unico index.html apribile da file:// senza server. Altrimenti build normale.
const single = process.env.SINGLE === '1'

export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  base: './',
  server: { port: 5175, open: true },
  build: {
    chunkSizeWarningLimit: 1100,
    ...(single ? { outDir: 'dist-single' } : {}),
  },
})
