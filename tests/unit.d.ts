import "vitest";
import type { FieldChange } from "../src/change/index.ts";

export interface CustomMatchers<R = unknown> {
  toMatchChanges: (expected: FieldChange) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
}
