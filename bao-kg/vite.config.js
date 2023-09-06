import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
    base: command === 'serve' ? '' : '/admin/MemberNote/',
    plugins: [react()]
}))