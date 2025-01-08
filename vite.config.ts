// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
import path from "path";

export default defineConfig({
  plugins: [
    react(), // Gera arquivos .br comprimidos
    compression({ algorithm: "gzip" }), // Gera arquivos .gz comprimidos
    visualizer({
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2015", // ou 'esnext' se você não precisa suportar navegadores mais antigos
    minify: "terser", // Usar Terser para minificação mais agressiva
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs
        drop_debugger: true, // Remove declarações debugger
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.warn",
        ],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React e dependências relacionadas
          "vendor-react": ["react", "react-router-dom"],
        },
        // Otimiza o nome dos chunks
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    // Otimizações adicionais
    chunkSizeWarningLimit: 1000, // Ajusta o limite de aviso de tamanho do chunk
    cssCodeSplit: true, // Separa CSS em chunks
    sourcemap: false, // Desativa sourcemaps em produção
    assetsInlineLimit: 4096, // Inline de arquivos pequenos em base64
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      // Adicione outras dependências frequentemente usadas
    ],
  },
});
