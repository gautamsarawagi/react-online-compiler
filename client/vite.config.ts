import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import netlify from "@netlify/vite-plugin";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), netlify()],
})