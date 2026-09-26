import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6540,
    proxy: {
      "/api": {
        target: process.env.DEV_API || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
