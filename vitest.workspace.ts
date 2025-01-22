import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      include: ["src/**/tests.ts"],
      restoreMocks: true,
      name: "unit",
      environment: "node",
    },
  },
  // {
  //   test: {
  //     include: ["src/**/tests.tsx"],
  //     name: "browser",
  //     browser: {
  //       enabled: true,
  //       name: "chromium",
  //       provider: "playwright",
  //       headless: true,
  //     },
  //   },
  // },
]);
