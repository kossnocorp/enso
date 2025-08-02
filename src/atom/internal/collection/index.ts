import { DetachedValue } from "../../../detached/index.ts";
import type { AtomImpl } from "../../implementation.ts";
import { AtomInternal } from "../base/index.ts";

export abstract class AtomInternalCollection<
  Value,
> extends AtomInternal<Value> {
  //#region Type

  abstract get size(): number;

  abstract remove(key: keyof Value): AtomImpl<DetachedValue>;

  abstract forEach(callback: AtomInternalCollection.Callback<Value>): void;

  abstract map<Result>(
    callback: AtomInternalCollection.Callback<Value, Result>,
  ): Result[];

  abstract find(
    predicate: AtomInternalCollection.Predicate<Value>,
  ): AtomImpl<unknown> | undefined;

  abstract filter(
    predicate: AtomInternalCollection.Predicate<Value>,
  ): AtomImpl<unknown>[];

  //#endregion
}

export namespace AtomInternalCollection {
  export interface Callback<Value, Result = void> {
    (item: AtomImpl<unknown>, index: keyof Value): Result;
  }

  export interface Predicate<Value> {
    (item: AtomImpl<unknown>, index: keyof Value): boolean;
  }
}
