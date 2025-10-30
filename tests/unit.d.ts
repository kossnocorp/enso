import "vitest";
import type { AtomChange } from "../src/change/index.ts";

export interface CustomMatchers<R = unknown> {
  toMatchChanges: (expected: AtomChange) => R;

  toReceiveChanges: (expected: AtomChange) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
}
