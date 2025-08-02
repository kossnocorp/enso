import { FieldChange } from "../../../change/index.ts";
import { DetachedValue } from "../../../detached/index.ts";
import type { AtomImpl } from "../../implementation.ts";

export const externalSymbol = Symbol();

export abstract class AtomInternal<Value> {
  //#region Instance

  constructor(atom: AtomImpl<Value>, _value: Value) {
    this.#external = atom;
  }

  //#endregion

  //#region Atom

  #external;

  get external() {
    return this.#external;
  }

  // @ts-expect-error
  create(value, parent) {
    // @ts-expect-error
    return this.#external.constructor.create(value, parent);
  }

  //#endregion

  //#region Value

  abstract set(value: Value | DetachedValue): FieldChange;

  abstract get value(): Value;

  // TODO: Find a better name for it.
  detached(): boolean {
    return false;
  }

  //#endregion

  //#region Tree

  try() {
    const value = this.value;
    if (value === undefined || value === null) return value;
    return this.external;
  }

  //#endregion

  //#region Events

  withhold(): void {}

  unleash(): void {}

  // TODO: It is not needed in the base class, but it makes it easier to use.
  // I should probably use `in` operator instead.
  childUpdate(changes: FieldChange, _key: keyof Value): FieldChange {
    return changes;
  }

  //#endregion

  //#region Transform

  // @ts-expect-error
  discriminate(discriminator) {
    return {
      // @ts-expect-error
      discriminator: this.external.$?.[discriminator]?.value,
      field: this.external,
    };
  }

  //#endregion
}
