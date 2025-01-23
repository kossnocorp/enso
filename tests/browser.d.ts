import type { CustomMatchers } from "./unit.d.ts";
import "@vitest/browser/matchers.d.ts";
import type jsdomMatchers from "@vitest/browser/jest-dom.js";

declare module "vitest" {
  interface JestAssertion<T = any>
    extends jsdomMatchers.default.TestingLibraryMatchers<void, T>,
      CustomMatchers<T> {}
}
