import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base relative so the build can be opened/served from any sub-path.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5175, open: true },
  // exceljs è caricato on-demand in un chunk separato: il limite alza solo il warning.
  build: { chunkSizeWarningLimit: 1100 },
})
