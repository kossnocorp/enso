import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      include: ["src/**/tests.ts"],
      name: "unit",
      environment: "node",
    },
  },
  {
    test: {
      include: ["src/**/tests.tsx"],
      name: "browser",
      browser: {
        enabled: true,
        name: "chrome",
      },
    },
  },
]);
