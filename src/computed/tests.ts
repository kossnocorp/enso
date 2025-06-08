import { describe, expect, it } from "vitest";
import { ComputedMap } from "./index.ts";
import { ComputedField, Field } from "../field/index.tsx";
import { nanoid } from "nanoid";

describe(ComputedMap, () => {
  describe(ComputedMap.prototype.at, () => {
    it("returns empty array for non-existent path", () => {
      const map = new ComputedMap();
      expect(map.at(["non", "existent"])).toEqual([]);
    });

    it("returns fields at the given path", () => {
      const map = new ComputedMap();
      const computed1 = fakeComputedField([]);
      const computed2 = fakeComputedField(["a", "b"]);
      const computed3 = fakeComputedField(["a", "b", "c"]);
      const computed4 = fakeComputedField(["a", "b", "c"]);
      map.add(computed1);
      map.add(computed2);
      map.add(computed3);
      map.add(computed4);
      expect(map.at([])).toEqual([computed1]);
      expect(map.at(["a", "b"])).toEqual([computed2]);
      expect(map.at(["a", "b", "c"])).toEqual([computed3, computed4]);
    });
  });

  describe(ComputedMap.prototype.add, () => {
    it("adds a computed at the given path", () => {
      const map = new ComputedMap();
      const computed1 = fakeComputedField([]);
      const computed2 = fakeComputedField(["a", "b"]);
      const computed3 = fakeComputedField(["a", "b", "c"]);
      map.add(computed1);
      map.add(computed2);
      map.add(computed3);
      expect(map.at([])).toEqual([computed1]);
      expect(map.at(["a", "b"])).toEqual([computed2]);
      expect(map.at(["a", "b", "c"])).toEqual([computed3]);
    });
  });

  describe(ComputedField.prototype.remove, () => {
    it("removes a computed from the map", () => {
      const map = new ComputedMap();
      const computed1 = fakeComputedField([]);
      const computed2 = fakeComputedField(["a", "b"]);
      const computed3 = fakeComputedField(["a", "b", "c"]);
      const computed4 = fakeComputedField(["a", "b", "c"]);
      map.add(computed1);
      map.add(computed2);
      map.add(computed3);
      map.add(computed4);
      expect(map.at([])).toEqual([computed1]);
      expect(map.at(["a", "b"])).toEqual([computed2]);
      expect(map.at(["a", "b", "c"])).toEqual([computed3, computed4]);
      map.remove(computed1);
      map.remove(computed2);
      map.remove(computed3);
      expect(map.at([])).toEqual([]);
      expect(map.at(["a", "b"])).toEqual([]);
      expect(map.at(["a", "b", "c"])).toEqual([computed4]);
    });
  });
});

function fakeComputedField(path: Field.Path): ComputedField<unknown, unknown> {
  return {
    id: nanoid(),
    path,
    name: Field.nameFromPath(path),
  } as ComputedField<unknown, unknown>;
}
