import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import inject from '@rollup/plugin-inject';
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    inject({
      styled: ['@mui/material/styles', 'styled'],
    }),
  ],

  resolve: {
    alias: {
        '@': path.resolve(__dirname, './src'),
    },
},
  build: {
    // minify: false,
    // sourcemap: process.env.NODE_ENV !== 'production',
    outDir: path.resolve(__dirname, '../../dist'),
    rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'assets/[name].js'
      }
    }
  }
})
