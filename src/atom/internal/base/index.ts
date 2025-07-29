import type { Atom } from "../../definition.ts";

export const externalSymbol = Symbol();

export abstract class AtomValue<Kind extends Atom.Flavor.Kind, Value> {
  constructor(atom: Atom.Envelop<Kind, Atom.Def<Value>>, _value: Value) {
    this.#external = atom;
  }

  //#region Atom

  #external;

  get external() {
    return this.#external;
  }

  //#endregion

  //#region Tree

  try() {
    // @ts-expect-error
    const value = this.value;
    if (value === undefined || value === null) return value;
    return this.external;
  }

  //#endregion

  // @ts-expect-error
  childUpdate(type, _key) {
    return type;
  }

  detached() {
    return false;
  }

  // @ts-expect-error
  discriminate(discriminator) {
    return {
      // @ts-expect-error
      discriminator: this.external.$?.[discriminator]?.value,
      field: this.external,
    };
  }

  // @ts-expect-error
  create(value, parent) {
    // @ts-expect-error
    return this.#external.constructor.create(value, parent);
  }

  //#region Events

  withhold(): void {}

  unleash(): void {}

  //#endregion
}
