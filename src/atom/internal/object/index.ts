import {
  change,
  shapeChanges,
  shiftChildChanges,
} from "../../../change/index.ts";
import { UndefinedStateRegistry } from "../../../detached/index.ts";
import type { AtomImpl } from "../../implementation.ts";
import { externalSymbol } from "../base/index.ts";
import { AtomInternalCollection } from "../collection/index.ts";

export class AtomInternalObject<
  Value extends object,
> extends AtomInternalCollection<Value> {
  //#region Instance

  constructor(external: AtomImpl<Value>, value: Value) {
    super(external, value);
    this.#undefined = new UndefinedStateRegistry(external);
  }

  //#endregion

  //#region Value

  #children = new Map();
  #undefined: UndefinedStateRegistry<AtomImpl<unknown>>;

  set(newValue: Value) {
    let changes = 0n;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[externalSymbol].clear();
        this.#undefined.register(key, child);
        changes |= change.child.detach;
      }
    });

    for (const [key, value] of Object.entries(newValue)) {
      const child = this.#children.get(key);
      if (child) {
        child.set(value, false);
        changes |= shiftChildChanges(child.lastChanges);
      } else {
        const undefinedState = this.#undefined.claim(key);
        if (undefinedState) undefinedState[externalSymbol].create(value);

        const newChild =
          undefinedState ||
          this.create(value, {
            key,
            [(this.external.constructor as any).prop]: this.external,
          });
        this.#children.set(key, newChild);
        changes |= change.child.attach;
      }
    }

    // Apply shape change
    changes |= shapeChanges(changes);

    return changes;
  }

  get value() {
    return Object.fromEntries(
      Array.from(this.#children.entries()).map(([k, v]) => [k, v.value]),
    );
  }

  // @ts-expect-error
  dirty(initial) {
    if (!initial || typeof initial !== "object" || Array.isArray(initial))
      return true;

    const entries = Object.entries(initial);
    if (entries.length !== this.#children.size) return true;

    for (const [key, value] of entries) {
      const atom = this.#children.get(key);

      if (!atom || atom.initial !== value || atom.dirty) return true;
    }

    return false;
  }

  //#endregion

  //#region Type

  get size(): number {
    return this.#children.size;
  }

  remove(key: keyof Value) {
    return this.at(key).self.remove();
  }

  forEach(callback: AtomInternalCollection.Callback<Value>): void {
    this.#children.forEach((atom, key) => callback(atom, key));
  }

  map<Result>(
    callback: AtomInternalCollection.Callback<Value, Result>,
  ): Result[] {
    const result: Result[] = [];
    this.#children.forEach((atom, key) => result.push(callback(atom, key)));
    return result;
  }

  find(
    predicate: AtomInternalCollection.Predicate<Value>,
  ): AtomImpl<unknown> | undefined {
    for (const [key, value] of this.#children.entries()) {
      if (predicate(value, key)) return value;
    }
  }

  filter(
    predicate: AtomInternalCollection.Predicate<Value>,
  ): AtomImpl<unknown>[] {
    return Array.from(this.#children.entries()).reduce<AtomImpl<unknown>[]>(
      (acc, [key, value]) =>
        predicate(value, key) ? (acc.push(value), acc) : acc,
      [],
    );
  }

  //#endregion

  //#region Tree

  $() {
    return this.#$;
  }

  #$ = new Proxy(
    {},
    {
      get: (_, key) => this.#$atom(key),
    },
  );

  // @ts-expect-error
  at(key) {
    return this.#$atom(String(key));
  }

  // @ts-expect-error
  lookup(path) {
    if (path.length === 0) return this.external;
    const [key, ...restPath] = path;
    return this.#$atom(String(key))?.lookup(restPath);
  }

  // @ts-expect-error
  #$atom(key) {
    const atom = this.#children.get(key);
    if (atom) return atom;

    return this.#undefined.ensure(key);
  }

  // @ts-expect-error
  try(key) {
    if (key !== undefined && key !== null) {
      return this.#children.get(key)?.self.try();
    } else {
      return this.external;
    }
  }

  //#endregion

  //#region Events

  // @ts-expect-error
  childUpdate(childChanges, key) {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.atom.attach) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child atom when updating");

      this.#children.set(key, child);
      changes |= change.child.attach;
    }

    if (childChanges & change.atom.detach) {
      const child = this.#children.get(key);
      if (!child)
        throw new Error("Failed to find the child atom when updating");

      this.#children.delete(key);
      child.unwatch();
      changes |= change.child.detach;

      this.#undefined.register(key, child);
    }

    return changes;
  }

  unwatch() {
    this.#children.forEach((child) => child.unwatch());
    this.#children.clear();
  }

  override withhold() {
    this.#children.forEach((atom) => atom.withhold());
  }

  override unleash() {
    this.#children.forEach((atom) => atom.unleash());
  }

  //#endregion
}
