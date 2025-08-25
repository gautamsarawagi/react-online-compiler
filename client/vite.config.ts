import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(() => {   
  const API_URL = 'https://react-online-compiler.onrender.com/';

  return {  
    plugins: [react(), tsconfigPaths()],
    server: {
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
  }
})