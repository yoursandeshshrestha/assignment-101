import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    css: true,
    testTimeout: 10000, // 10 seconds timeout for individual tests
    hookTimeout: 10000, // 10 seconds timeout for setup/teardown hooks
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test-utils/",
        "**/*.d.ts",
        "**/*.config.*",
        "dist/",
        "build/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
