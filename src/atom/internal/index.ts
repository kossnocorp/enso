import { AtomValueArray } from "./array/index.ts";
import { AtomValueObject } from "./object/index.ts";
import { AtomValuePrimitive } from "./opaque/index.ts";

export function detectInternalConstructor(value: unknown) {
  if (value !== null && typeof value === "object")
    return Array.isArray(value)
      ? AtomValueArray
      : Object.prototype.toString.call(value) === "[object Object]"
        ? AtomValueObject
        : AtomValuePrimitive;
  return AtomValuePrimitive;
}
