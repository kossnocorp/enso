import { change } from "../../../change/index.ts";
import { detachedValue } from "../../../detached/index.ts";
import type { AtomImpl } from "../../implementation.ts";
import { AtomInternal } from "../base/index.ts";

export class AtomInternalOpaque<Value> extends AtomInternal<Value> {
  //#region Instance

  constructor(atom: AtomImpl<Value>, value: Value) {
    super(atom, value);
    this.#value = value;
  }

  //#endregion

  //#region Value

  #value;

  get value(): Value {
    return this.#value === detachedValue ? (undefined as any) : this.#value;
  }

  set(value: Value) {
    let changes = 0n;
    if (this.#value === detachedValue && value !== detachedValue)
      changes |= change.atom.attach;
    else if (this.#value !== detachedValue && value === detachedValue)
      changes |= change.atom.detach;
    else if (
      typeof this.#value !== typeof value ||
      (this.#value &&
        typeof this.#value === "object" &&
        Object.getPrototypeOf(this.#value) !== Object.getPrototypeOf(value))
    )
      changes |= change.atom.type;
    else if (this.#value !== value) changes |= change.atom.value;

    if (this.#value !== value) this.#value = value;

    return changes;
  }

  dirty(initial: Value): boolean {
    return initial !== this.#value;
  }

  override detached(): boolean {
    return this.#value === detachedValue;
  }

  //#endregion

  //#region Tree

  $() {
    return undefined;
  }

  // @ts-expect-error
  lookup(path) {
    if (path.length === 0) return this.external;
    return undefined;
  }

  //#endregion

  //#region Events

  unwatch() {}

  //#endregion
}
