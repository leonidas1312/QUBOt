import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '/components': path.resolve(__dirname, './components'),
      '/pages': path.resolve(__dirname, './pages'),
      '/lib': path.resolve(__dirname, './lib'),
      '/hooks': path.resolve(__dirname, './hooks'),
    },
  },
  server: {
    port: 8080,
  },
})