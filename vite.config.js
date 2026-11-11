import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  base: '/1_Portfolio/',
  server: {
    port: 5173,
    strictPort: true
  },
    build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
})
