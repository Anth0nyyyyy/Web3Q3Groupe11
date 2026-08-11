// NOUVELLE VERSION CORRIGÉE
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- Le plugin correct, sans "-swc"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})