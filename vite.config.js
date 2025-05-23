import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

/** @type {import('tailwindcss').Config} */
export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.glb", "**/*.xlsx", "**/*.unityweb"],
  optimizeDeps: {
    include: ["@emotion/styled", "@emotion/react"],
  },
});
