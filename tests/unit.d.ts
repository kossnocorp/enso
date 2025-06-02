import "vitest";
import type { FieldChange } from "../src/change/index.ts";
import { Mock } from "vitest";

export interface CustomMatchers<R = unknown> {
  toMatchChanges: (expected: FieldChange) => R;

  toReceiveChanges: (expected: FieldChange) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
}
