import {
  change,
  shapeChanges,
  shiftChildChanges,
} from "../../../change/index.ts";
import { UndefinedStateRegistry } from "../../../detached/index.ts";
import type { Atom } from "../../definition.ts";
import { AtomValue, externalSymbol } from "../base/index.ts";

export class AtomValueArray<
  Kind extends Atom.Flavor.Kind,
  Value,
> extends AtomValue<Kind, Value> {
  #children = [];
  #undefined;

  constructor(external: Atom.Envelop<Kind, Value>, value: Value) {
    super(external, value);

    this.#undefined = new UndefinedStateRegistry(external);
  }

  get value() {
    // @ts-expect-error
    return this.#children.map((child) => child.value);
  }

  // @ts-expect-error
  set(newValue) {
    let changes = 0n;

    this.#children.forEach((item, index) => {
      if (!(index in newValue)) {
        delete this.#children[index];
        // @ts-expect-error
        item[externalSymbol].clear();
        this.#undefined.register(index.toString(), item);
        changes |= change.child.detach;
      }
    });

    // @ts-expect-error
    this.#children = newValue.map((value, index) => {
      const child = this.#children[index];
      if (child) {
        // @ts-expect-error
        child.set(value, false);
        // @ts-expect-error
        changes |= shiftChildChanges(child.lastChanges);
        return child;
      } else {
        const undefinedState = this.#undefined.claim(index.toString());
        if (undefinedState) undefinedState[externalSymbol].create(value);

        const newChild =
          undefinedState ||
          this.create(value, {
            key: String(index),
            field: this.external,
          });
        changes |= change.child.attach;
        return newChild;
      }
    });

    // Apply shape change
    changes |= shapeChanges(changes);

    return changes;
  }

  //#region Tree

  $() {
    return this.#$;
  }

  #$ = new Proxy(
    {},
    {
      get: (_, index) => this.#item(Number(index)),
    },
  );

  // @ts-expect-error
  at(key) {
    return this.#item(Number(key));
  }

  // @ts-expect-error
  #item(index) {
    const item = this.#children[index];
    if (item) return item;

    const indexStr = index.toString();
    return this.#undefined.ensure(indexStr);
  }

  // @ts-expect-error
  try(index) {
    if (index !== undefined && index !== null) {
      return this.#item(index)?.try();
    } else {
      return this.external;
    }
  }

  // @ts-expect-error
  lookup(path) {
    if (path.length === 0) return this.external;
    const [index, ...restPath] = path;
    return this.#item(Number(index))?.lookup(restPath);
  }

  //#endregion

  // @ts-expect-error
  childUpdate(childChanges, key) {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.field.attach) {
      const item = this.#undefined.claim(key);
      if (!item)
        throw new Error("Failed to find the child field when updating");

      const idx = Number(key);
      const existingItem = this.#children[idx];
      // Item already exists at this index, so we need to move it
      if (existingItem) {
        // Insert the attaching item
        // @ts-expect-error
        this.#children.splice(idx, 0, item);

        // Shift children keys
        this.#children.slice(idx).forEach((item, index) => {
          // @ts-expect-error
          item[externalSymbol].move(String(idx + index));
        });
      } else {
        // @ts-expect-error
        this.#children[idx] = item;
      }

      // TODO: Update keys for the rest of the children and trigger move change
      changes |= change.child.attach;
    }

    // Handle when child goes from defined to undefined
    if (childChanges & change.field.detach) {
      const item = this.#children[Number(key)];
      if (!item)
        throw new Error("Failed to find the child field when updating");

      // Remove the child from the array
      const idx = Number(key);
      this.#children.splice(idx, 1);
      // @ts-expect-error
      item.unwatch();
      changes |= change.child.detach;

      // Shift children keys
      this.#children.slice(idx).forEach((item, index) => {
        // @ts-expect-error
        item[externalSymbol].move(String(idx + index));
      });

      this.#undefined.register(key, item);
    }

    return changes;
  }

  unwatch() {
    // @ts-expect-error
    this.#children.forEach((child) => child.unwatch());
    this.#children.length = 0;
  }

  // @ts-expect-error
  dirty(initial) {
    if (!initial || typeof initial !== "object" || !Array.isArray(initial))
      return true;

    if (initial.length !== this.#children.length) return true;

    for (const index in initial) {
      const value = initial[index];
      const field = this.#children[index];

      // @ts-expect-error
      if (!field || field.initial !== value || field.dirty) return true;
    }

    return false;
  }

  withhold() {
    // @ts-expect-error
    this.#children.forEach((field) => field.withhold());
  }

  unleash() {
    // @ts-expect-error
    this.#children.forEach((field) => field.unleash());
  }

  //#region Collection

  get length() {
    return this.#children.length;
  }

  forEach(callback: AtomInternalArray.Callback) {
    this.#children.forEach(callback);
  }

  map(callback: AtomInternalArray.Callback) {
    return this.#children.map(callback);
  }

  size() {
    return this.#children.length;
  }

  // @ts-expect-error
  push(item) {
    const length = this.#children.length;
    const field = this.create(item, {
      key: String(length),
      field: this.external,
    });
    // @ts-expect-error
    this.#children[length] = field;

    this.external.trigger(change.field.shape | change.child.attach, true);
    return field;
  }

  // @ts-expect-error
  insert(index, item) {
    const field = this.create(item, {
      key: String(index),
      field: this.external,
    });
    // @ts-expect-error
    this.#children.splice(index, 0, field);

    this.#children.slice(index).forEach((item, index) => {
      // @ts-expect-error
      item[externalSymbol].move(String(index));
    });

    this.external.trigger(change.field.shape | change.child.attach, true);
    return field;
  }

  remove(key: number) {
    return this.at(key).remove();
  }

  // @ts-expect-error
  find(predicate) {
    return this.#children.find(predicate);
  }

  // @ts-expect-error
  filter(predicate) {
    return this.#children.filter(predicate);
  }

  //#endregion
}

export namespace AtomInternalArray {
  export interface Callback {
    (item: unknown, index: number): void;
  }
}
