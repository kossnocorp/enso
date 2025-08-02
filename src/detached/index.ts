import type { Atom } from "../atom/index.js";

export const detachedValue = Symbol();

export type DetachedValue = typeof detachedValue;

export class UndefinedStateRegistry<AtomType extends object> {
  #external;
  #refsMap = new Map();
  #registry = new FinalizationRegistry((key) => this.#refsMap.delete(key));

  constructor(external: any) {
    this.#external = external;
  }

  register(key: string, atom: AtomType) {
    const ref = new WeakRef(atom);
    this.#refsMap.set(key, ref);
    this.#registry.register(ref, key);
  }

  claim(key: string) {
    // Look up if the undefined field exists
    const ref = this.#refsMap.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregister the field and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#refsMap.delete(key);
    return registered;
  }

  ensure(key: string) {
    // Try to look up registered undefined item
    const registered = this.#refsMap.get(key)?.deref();
    if (registered) return registered;

    // Or create and register a new one
    const field = this.#external.constructor.create(detachedValue, {
      key,
      field: this.#external,
    });
    this.register(key, field);
    return field;
  }
}
