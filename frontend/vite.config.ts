import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to Home Assistant during development
      "/api/haboard": {
        target: process.env.HA_URL || "http://localhost:8123",
        changeOrigin: true,
      },
    },
  },
});
