import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    environmentOptions: {
      jsdom: {
        url: "http://localhost",
      },
    },
    env: {
      VITE_API_URL: "",
      VITE_PUBLIC_URL: "http://localhost:5173",
      VITE_DEMO_MODE: "true",
    },
  },
});
