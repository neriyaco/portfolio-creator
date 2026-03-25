import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/media': {
          target: `${env.VITE_SUPABASE_URL}/storage/v1/object/public/portfolio`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/media/, ''),
        },
      },
    },
  }
})
