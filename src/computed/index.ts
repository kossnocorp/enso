import { ComputedField, Field } from "../field/index.tsx";

export class ComputedMap {
  #map = new Map<string, Set<ComputedField<unknown, unknown>>>();

  at(path: Field.Path): ComputedField<unknown, unknown>[] {
    return Array.from(this.#map.get(Field.nameFromPath(path)) || []);
  }

  add(field: ComputedField<unknown, unknown>) {
    let set = this.#map.get(field.name);
    if (!set) {
      set = new Set();
      this.#map.set(field.name, set);
    }
    set.add(field);
  }

  remove(field: ComputedField<unknown, unknown>) {
    const set = this.#map.get(field.name);
    if (set) {
      set.delete(field);
      if (set.size === 0) {
        this.#map.delete(field.name);
      }
    }
  }

  get all() {
    return this.#map.entries();
  }
}
