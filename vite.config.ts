import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      sourcemap: !isProd,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) return 'vendor'
            if (id.includes('node_modules/lucide-react')) return 'icons'
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase'
            if (id.includes('node_modules/recharts')) return 'recharts'
          },
        },
      },
    },
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
  }
})
