import type { CustomMatchers } from "./unit.d.ts";
import "@vitest/browser/matchers.d.ts";
import { TestingLibraryMatchers } from "@vitest/browser/jest-dom.js";

declare module "vitest" {
  interface JestAssertion<T = any>
    extends TestingLibraryMatchers<void, T>,
      CustomMatchers<T> {}
}
