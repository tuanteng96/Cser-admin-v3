import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  base: command === 'serve' ? '' : '/Admin/Points/',
  plugins: [react()],
  resolve: {
      alias: {
          src: "/src",
      },
  },
  server: {
      port: 5002,
      host: true
  },
}))
