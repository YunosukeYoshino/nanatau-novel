import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        sourcemap: true,
        minify: 'terser',
        target: ['es2020', 'chrome70', 'firefox70', 'safari13'],
        rollupOptions: {
            input: {
                main: './index.html',
            },
            output: {
                manualChunks: {
                    vendor: ['@drincs/pixi-vn'],
                    core: ['./src/core/index.ts'],
                    ui: ['./src/ui/index.ts'],
                },
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        chunkSizeWarningLimit: 1000,
        reportCompressedSize: false,
    },
    server: {
        port: 5173,
        host: true,
        open: false,
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    optimizeDeps: {
        include: ['@drincs/pixi-vn'],
        exclude: [],
    },
    define: {
        __DEV__: JSON.stringify(process.env['NODE_ENV'] === 'development'),
        __VERSION__: JSON.stringify(process.env['npm_package_version'] || '1.0.0'),
    },
});