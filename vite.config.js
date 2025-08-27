import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cancer_studies_deployment/',
  plugins: [react()],
})