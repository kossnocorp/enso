import { AtomImpl } from "../implementation.ts";
import { AtomValueArray } from "./array/index.ts";
import { AtomValueObject } from "./object/index.ts";
import { AtomValuePrimitive } from "./opaque/index.ts";

export function detectInternalConstructor<Value>(
  value: Value,
): AtomValue.Constructor<AtomValue<Value>> {
  if (value !== null && typeof value === "object")
    return Array.isArray(value)
      ? AtomValueArray
      : Object.prototype.toString.call(value) === "[object Object]"
        ? AtomValueObject
        : AtomValuePrimitive;
  return AtomValuePrimitive;
}

export type AtomValue<Value> =
  | AtomValueArray<Value>
  | AtomValueObject<Value>
  | AtomValuePrimitive<Value>;

export namespace AtomValue {
  export interface Constructor<Value> {
    new (atom: AtomImpl<Value>, value: Value): AtomValue<Value>;
  }
}
