import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "unit",
      setupFiles: ["./tests/setup.ts"],
      include: ["src/**/tests.ts"],
      restoreMocks: true,
      environment: "node",
      testTimeout: 100,
    },
  },
  {
    test: {
      name: "browser",
      setupFiles: ["./tests/setup.ts"],
      include: ["src/**/tests.tsx"],
      browser: {
        enabled: true,
        name: "chromium",
        provider: "playwright",
        headless: true,
      },
    },
  },
]);
