import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: process.env.CI ? '/PortfolioSite-main/' : '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        open: true,
    },
});
