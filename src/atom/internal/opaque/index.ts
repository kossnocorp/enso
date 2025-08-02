import { change } from "../../../change/index.ts";
import { detachedValue } from "../../../detached/index.ts";
import type { AtomImpl } from "../../implementation.ts";
import { AtomValue } from "../base/index.ts";

export class AtomValuePrimitive<Value> extends AtomValue<Value> {
  //#region Instance

  constructor(atom: AtomImpl<unknown>, value: Value) {
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
      changes |= change.field.attach;
    else if (this.#value !== detachedValue && value === detachedValue)
      changes |= change.field.detach;
    else if (
      typeof this.#value !== typeof value ||
      (this.#value &&
        typeof this.#value === "object" &&
        Object.getPrototypeOf(this.#value) !== Object.getPrototypeOf(value))
    )
      changes |= change.field.type;
    else if (this.#value !== value) changes |= change.field.value;

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

  //#region Type

  remove() {
    return this.external.self.remove();
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
