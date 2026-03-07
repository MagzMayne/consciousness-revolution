// RootIB: RB-20260307022444-DDE13EBB
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api/* to the Express backend during development
      "/api": "http://localhost:4000"
    }
  }
});
