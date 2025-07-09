import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// This version avoids dynamic await imports, which are not supported in build environments like Vercel
export default defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Optional: skip Replit-specific plugin if not running on Replit
    // cartographer is excluded here for compatibility
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
