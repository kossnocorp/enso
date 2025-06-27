import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "node",
          setupFiles: ["./tests/setup.ts"],
          include: ["src/**/tests.ts", "src/**/tests.tsx"],
          restoreMocks: true,
          environment: "happy-dom",
          testTimeout: 100,
        },
      },
      {
        test: {
          name: "browser",
          setupFiles: ["./tests/setup.ts"],
          include: ["src/**/tests.browser.tsx"],
          testTimeout: 500,
          browser: {
            enabled: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
                headless: true,
              },
            ],
          },
        },
      },
    ],
  },
});
