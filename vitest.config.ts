import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/tests.ts", "src/**/tests.tsx"],
    restoreMocks: true,
    environment: "happy-dom",
    testTimeout: 100,
  },
});
