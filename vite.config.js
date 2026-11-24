import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": { target: `http://localhost:${process.env.PORT || 3001}`, changeOrigin: false } },
  },
  build: { chunkSizeWarningLimit: 600 },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{js,jsx}"],
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
