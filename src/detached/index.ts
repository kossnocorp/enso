export const detachedValue = Symbol();

export type DetachedValue = typeof detachedValue;

export class UndefinedStateRegistry {
  #external;
  #refsMap = new Map();
  #registry;

  // @ts-expect-error
  constructor(external) {
    this.#external = external;
    this.#registry = new FinalizationRegistry((key) =>
      this.#refsMap.delete(key),
    );
  }

  // @ts-expect-error
  register(key, field) {
    const fieldRef = new WeakRef(field);
    this.#refsMap.set(key, fieldRef);
    this.#registry.register(fieldRef, key);
  }

  // @ts-expect-error
  claim(key) {
    // Look up if the undefined field exists
    const ref = this.#refsMap.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregister the field and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#refsMap.delete(key);
    return registered;
  }

  // @ts-expect-error
  ensure(key) {
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
