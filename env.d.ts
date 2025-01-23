import "vitest";
import type { FieldChange } from "./src/change/index.ts";

interface CustomMatchers<R = unknown> {
  toMatchChanges: (expected: FieldChange) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
