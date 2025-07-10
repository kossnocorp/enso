import { change } from "../../../change/index.ts";
import { detachedValue } from "../../../detached/index.ts";
import type { Atom } from "../../definition.ts";
import { AtomValue } from "../base/index.ts";

export class AtomValuePrimitive<
  Shell extends Atom.Shell,
  Value,
> extends AtomValue<Shell, Value> {
  #value;

  constructor(atom: Atom.Envelop<Shell, Value>, value: Value) {
    super(atom, value);
    this.#value = value;
  }

  #create() {
    // this.#external
  }

  //#region Old

  // @ts-expect-error
  set(value) {
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

  get value() {
    return this.#value === detachedValue ? undefined : this.#value;
  }

  remove() {
    // @ts-expect-error
    return Atom.remove(this.external);
  }

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

  unwatch() {}

  // @ts-expect-error
  dirty(initial) {
    return initial !== this.#value;
  }

  //#endregion
}
