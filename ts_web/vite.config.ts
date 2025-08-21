import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'app.js',
        chunkFileNames: 'app.js',
        assetFileNames: 'app.[ext]'
      }
    }
  },
  plugins: [
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html
          .replace(/crossorigin/g, '')
          .replace(/type="module"/g, '')
          .replace(/src="\/[^"]*"/g, 'src="./app.js"');
      }
    }
  ]
})