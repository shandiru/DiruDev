import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// /api is proxied to the backend, so the same code works in dev, preview and
// any online preview window (no CORS, no hard-coded localhost in the browser).
const proxy = { "/api": { target: process.env.API_TARGET || "http://localhost:5000", changeOrigin: true } };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { host: true, port: 5173, allowedHosts: true, proxy },
  preview: { host: true, port: 4173, allowedHosts: true, proxy },
});
