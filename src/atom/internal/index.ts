import { AtomImpl } from "../implementation.ts";
import { AtomInternalArray } from "./array/index.ts";
import { AtomInternalObject } from "./object/index.ts";
import { AtomInternalOpaque } from "./opaque/index.ts";

export function detectInternalConstructor(
  value: unknown,
): AtomInternalConstructor {
  if (value !== null && typeof value === "object")
    return Array.isArray(value)
      ? AtomInternalArray
      : Object.prototype.toString.call(value) === "[object Object]"
        ? AtomInternalObject
        : AtomInternalOpaque;
  return AtomInternalOpaque;
}

export type AtomInternal =
  | AtomInternalArray<any>
  | AtomInternalObject<any>
  | AtomInternalOpaque<any>;

export interface AtomInternalConstructor {
  new (atom: AtomImpl<any>, value: any): AtomInternal;
}
