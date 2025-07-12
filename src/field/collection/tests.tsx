import { describe, expect, it, vi } from "vitest";
import { postpone } from "../../../tests/utils.ts";
import { change } from "../../change/index.ts";
import { FieldOld } from "../old.tsx";
import { FieldRefOld, MaybeFieldRefOld } from "../ref/definition.ts";
import {
  fieldEach,
  fieldFilter,
  fieldFind,
  fieldInsert,
  fieldMap,
  fieldPush,
  fieldRemove,
  fieldSize,
} from "./index.ts";

describe(fieldEach, () => {
  describe(Array, () => {
    const field = new FieldOld([1, 2, 3]);
    const fieldUnd = new FieldOld<number[] | undefined>(undefined);

    describe(FieldOld, () => {
      it("iterates items", () => {
        const mapped: [number, number][] = [];
        fieldEach(field, (item, index) => mapped.push([index, item.get() * 2]));
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const spy = vi.fn();
        fieldEach(fieldUnd.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(FieldRefOld, () => {
      it("iterates items", () => {
        const ref = new FieldRefOld(field);
        const mapped: [number, number][] = [];
        fieldEach(ref, (item, index) => {
          mapped.push([index, item.get() * 2]);
          expect(item).toBeInstanceOf(FieldRefOld);
        });
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRefOld(fieldUnd);
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("iterates items", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const mapped: [number, number][] = [];
        fieldEach(ref, (item, index) => {
          mapped.push([index, item.get() * 2]);
          expect(item).toBeInstanceOf(MaybeFieldRefOld);
        });
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe(Object, () => {
    const field = new FieldOld({ a: 1, b: 2, c: 3 });
    const fieldUnd = new FieldOld<{ [k: string]: number } | undefined>(
      undefined,
    );

    describe(FieldOld, () => {
      it("iterates items and keys", () => {
        const mapped: [string, number][] = [];
        fieldEach(field, (item, key) => mapped.push([key, item.get()]));
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const spy = vi.fn();
        fieldEach(fieldUnd.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(FieldRefOld, () => {
      it("iterates items and keys", () => {
        const ref = new FieldRefOld(field);
        const mapped: [string, number][] = [];
        fieldEach(ref, (item, key) => {
          mapped.push([key, item.get()]);
          expect(item).toBeInstanceOf(FieldRefOld);
        });
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRefOld(fieldUnd);
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("iterates items and keys", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const mapped: [string, number][] = [];
        fieldEach(ref, (item, key) => {
          mapped.push([key, item.get()]);
          expect(item).toBeInstanceOf(MaybeFieldRefOld);
        });
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});

describe(fieldMap, () => {
  describe(Array, () => {
    const field = new FieldOld([1, 2, 3]);
    const fieldUnd = new FieldOld<number[] | undefined>(undefined);

    describe(FieldOld, () => {
      it("maps items", () => {
        const mapped = fieldMap(field, (item, index) => [
          index,
          item.get() * 2,
        ]);
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const spy = vi.fn();
        fieldMap(fieldUnd.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(FieldRefOld, () => {
      it("maps items", () => {
        const ref = new FieldRefOld(field);
        const mapped = fieldMap(ref, (item, index) => {
          expect(item).toBeInstanceOf(FieldRefOld);
          return [index, item.get() * 2];
        });
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRefOld(fieldUnd);
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("maps items", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const mapped = fieldMap(ref, (item, index) => {
          expect(item).toBeInstanceOf(MaybeFieldRefOld);
          return [index, item.get() * 2];
        });
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe(Object, () => {
    const field = new FieldOld({ a: 1, b: 2, c: 3 });
    const fieldUnd = new FieldOld<{ [k: string]: number } | undefined>(
      undefined,
    );

    describe(FieldOld, () => {
      it("maps items and keys", () => {
        const mapped = fieldMap(field, (item, key) => [key, item.get()]);
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const spy = vi.fn();
        fieldMap(fieldUnd.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(FieldRefOld, () => {
      it("maps items and keys", () => {
        const ref = new FieldRefOld(field);
        const mapped = fieldMap(ref, (item, key) => {
          expect(item).toBeInstanceOf(FieldRefOld);
          return [key, item.get()];
        });
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRefOld(fieldUnd);
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("maps items and keys", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const mapped = fieldMap(ref, (item, key) => {
          expect(item).toBeInstanceOf(MaybeFieldRefOld);
          return [key, item.get()];
        });
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRefOld({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});

describe(fieldSize, () => {
  describe(Array, () => {
    describe(FieldOld, () => {
      it("returns size", () => {
        const field = new FieldOld([1, 2, 3]);
        expect(fieldSize(field)).toBe(3);
      });
    });

    describe(FieldRefOld, () => {
      it("returns size", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new FieldRefOld(field);
        expect(fieldSize(ref)).toBe(3);
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("returns size", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        expect(fieldSize(ref)).toBe(3);
      });
    });
  });

  describe(Object, () => {
    describe(FieldOld, () => {
      it("returns size", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        expect(fieldSize(field)).toBe(3);
      });
    });

    describe(FieldRefOld, () => {
      it("returns size", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new FieldRefOld(field);
        expect(fieldSize(ref)).toBe(3);
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("returns size", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        expect(fieldSize(ref)).toBe(3);
      });
    });
  });
});

describe(fieldFind, () => {
  describe(Array, () => {
    describe(FieldOld, () => {
      it("finds an item in the array", () => {
        const field = new FieldOld([1, 2, 3]);
        const item = fieldFind(field, (item) => item.get() === 2);
        expect(item?.get()).toBe(2);
      });

      it("returns undefined if item not found", () => {
        const field = new FieldOld([1, 2, 3]);
        const item = fieldFind(field, (item) => item.get() === 4);
        expect(item).toBe(undefined);
      });

      it("passes index to the predicate", () => {
        const field = new FieldOld([1, 2, 3]);
        const item = fieldFind(
          field,
          (item, index) => item.get() === 2 && index === 1,
        );
        expect(item?.get()).toBe(2);
      });
    });

    describe(FieldRefOld, () => {
      it("finds an item in the array", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new FieldRefOld(field);
        const item = fieldFind(ref, (item) => item.get() === 2);
        expect(item).toBeInstanceOf(FieldRefOld);
        expect(item?.get()).toBe(2);
      });

      it("returns undefined if item not found", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new FieldRefOld(field);
        const item = fieldFind(ref, (item) => item.get() === 4);
        expect(item).toBe(undefined);
      });

      it("passes index to the predicate", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new FieldRefOld(field);
        const item = fieldFind(
          ref,
          (item, index) => item.get() === 2 && index === 1,
        );
        expect(item?.get()).toBe(2);
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("finds an item in the array", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const item = fieldFind(ref, (item) => item.get() === 2);
        expect(item).toBeInstanceOf(MaybeFieldRefOld);
        expect(item?.get()).toBe(2);
      });

      it("returns undefined if item not found", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const item = fieldFind(ref, (item) => item.get() === 4);
        expect(item).toBe(undefined);
      });

      it("passes index to the predicate", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const item = fieldFind(
          ref,
          (item, index) => item.get() === 2 && index === 1,
        );
        expect(item?.get()).toBe(2);
      });
    });
  });

  describe(Object, () => {
    describe(FieldOld, () => {
      it("finds an item in the object", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const item = fieldFind(field, (item) => item.get() === 2);
        expect(item?.get()).toBe(2);
      });

      it("returns undefined if item not found", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const item = fieldFind(field, (item) => item.get() === 4);
        expect(item).toBe(undefined);
      });

      it("passes key to the predicate", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const item = fieldFind(
          field,
          (item, key) => item.get() === 2 && key === "b",
        );
        expect(item?.get()).toBe(2);
      });
    });

    describe(FieldRefOld, () => {
      it("finds an item in the object", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new FieldRefOld(field);
        const item = fieldFind(ref, (item) => item.get() === 2);
        expect(item).toBeInstanceOf(FieldRefOld);
        expect(item?.get()).toBe(2);
      });

      it("returns undefined if item not found", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new FieldRefOld(field);
        const item = fieldFind(ref, (item) => item.get() === 4);
        expect(item).toBe(undefined);
      });

      it("passes key to the predicate", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new FieldRefOld(field);
        const item = fieldFind(
          ref,
          (item, key) => item.get() === 2 && key === "b",
        );
        expect(item?.get()).toBe(2);
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("finds an item in the object", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const item = fieldFind(ref, (item) => item.get() === 2);
        expect(item).toBeInstanceOf(MaybeFieldRefOld);
        expect(item?.get()).toBe(2);
      });

      it("returns undefined if item not found", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const item = fieldFind(ref, (item) => item.get() === 4);
        expect(item).toBe(undefined);
      });

      it("passes key to the predicate", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const item = fieldFind(
          ref,
          (item, key) => item.get() === 2 && key === "b",
        );
        expect(item?.get()).toBe(2);
      });
    });
  });
});

describe(fieldFilter, () => {
  describe(Array, () => {
    describe(FieldOld, () => {
      it("filters items in the array", () => {
        const field = new FieldOld([1, 2, 3, 4]);
        const items = fieldFilter(field, (item) => item.get() % 2 === 0);
        expect(items.map((f) => f.get())).toEqual([2, 4]);
      });

      it("returns empty array if none match", () => {
        const field = new FieldOld([1, 3, 5]);
        const items = fieldFilter(field, (item) => item.get() === 2);
        expect(items).toEqual([]);
      });

      it("passes index to the predicate", () => {
        const field = new FieldOld([1, 2, 3]);
        const items = fieldFilter(field, (item, index) => index === 1);
        expect(items.map((f) => f.get())).toEqual([2]);
      });
    });

    describe(FieldRefOld, () => {
      it("filters items in the array", () => {
        const field = new FieldOld([1, 2, 3, 4]);
        const ref = new FieldRefOld(field);
        const items = fieldFilter(ref, (item) => item.get() % 2 === 0);
        items.forEach((item) => expect(item).toBeInstanceOf(FieldRefOld));
        expect(items.map((f) => f.get())).toEqual([2, 4]);
      });

      it("returns empty array if none match", () => {
        const field = new FieldOld([1, 3, 5]);
        const ref = new FieldRefOld(field);
        const items = fieldFilter(ref, (item) => item.get() === 2);
        expect(items).toEqual([]);
      });

      it("passes index to the predicate", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new FieldRefOld(field);
        const items = fieldFilter(ref, (item, index) => index === 1);
        expect(items.map((f) => f.get())).toEqual([2]);
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("filters items in the array", () => {
        const field = new FieldOld([1, 2, 3, 4]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const items = fieldFilter(ref, (item) => item.get() % 2 === 0);
        items.forEach((item) => expect(item).toBeInstanceOf(MaybeFieldRefOld));
        expect(items.map((f) => f.get())).toEqual([2, 4]);
      });

      it("returns empty array if none match", () => {
        const field = new FieldOld([1, 3, 5]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const items = fieldFilter(ref, (item) => item.get() === 2);
        expect(items).toEqual([]);
      });

      it("passes index to the predicate", () => {
        const field = new FieldOld([1, 2, 3]);
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const items = fieldFilter(ref, (item, index) => index === 1);
        expect(items.map((f) => f.get())).toEqual([2]);
      });
    });
  });

  describe(Object, () => {
    describe(FieldOld, () => {
      it("filters items in the object", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3, d: 4 });
        const items = fieldFilter(field, (item) => item.get() % 2 === 0);
        expect(items.map((f) => f.get())).toEqual([2, 4]);
      });

      it("returns empty array if none match", () => {
        const field = new FieldOld({ a: 1, b: 3 });
        const items = fieldFilter(field, (item) => item.get() === 2);
        expect(items).toEqual([]);
      });

      it("passes key to the predicate", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const items = fieldFilter(field, (item, key) => key === "b");
        expect(items.map((f) => f.get())).toEqual([2]);
      });
    });

    describe(FieldRefOld, () => {
      it("filters items in the object", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3, d: 4 });
        const ref = new FieldRefOld(field);
        const items = fieldFilter(ref, (item) => item.get() % 2 === 0);
        items.forEach((item) => expect(item).toBeInstanceOf(FieldRefOld));
        expect(items.map((f) => f.get())).toEqual([2, 4]);
      });

      it("returns empty array if none match", () => {
        const field = new FieldOld({ a: 1, b: 3 });
        const ref = new FieldRefOld(field);
        const items = fieldFilter(ref, (item) => item.get() === 2);
        expect(items).toEqual([]);
      });

      it("passes key to the predicate", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new FieldRefOld(field);
        const items = fieldFilter(ref, (item, key) => key === "b");
        expect(items.map((f) => f.get())).toEqual([2]);
      });
    });

    describe(MaybeFieldRefOld, () => {
      it("filters items in the object", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3, d: 4 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const items = fieldFilter(ref, (item) => item.get() % 2 === 0);
        items.forEach((item) => expect(item).toBeInstanceOf(MaybeFieldRefOld));
        expect(items.map((f) => f.get())).toEqual([2, 4]);
      });

      it("returns empty array if none match", () => {
        const field = new FieldOld({ a: 1, b: 3 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const items = fieldFilter(ref, (item) => item.get() === 2);
        expect(items).toEqual([]);
      });

      it("passes key to the predicate", () => {
        const field = new FieldOld({ a: 1, b: 2, c: 3 });
        const ref = new MaybeFieldRefOld({ type: "direct", field });
        const items = fieldFilter(ref, (item, key) => key === "b");
        expect(items.map((f) => f.get())).toEqual([2]);
      });
    });
  });
});

describe(fieldPush, () => {
  it("pushes items to array fields", () => {
    const field = new FieldOld([1, 2, 3]);
    fieldPush(field, 4);
    expect(field.get()).toEqual([1, 2, 3, 4]);
  });

  it("returns new field", () => {
    const field = new FieldOld([1, 2, 3]);
    const result = fieldPush(field, 4);
    expect(result).toBeInstanceOf(FieldOld);
    expect(result.get()).toEqual(4);
  });

  describe("changes", () => {
    describe("field", () => {
      it("triggers updates", async () => {
        const field = new FieldOld([1, 2, 3]);
        const spy = vi.fn();
        field.watch(spy);
        fieldPush(field, 4);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual([1, 2, 3, 4]);
        expect(event.changes).toMatchChanges(
          change.field.shape | change.child.attach,
        );
      });
    });

    describe("child", () => {
      it("triggers updates", async () => {
        const field = new FieldOld([[1, 2, 3]]);
        const spy = vi.fn();
        field.watch(spy);
        fieldPush(field.at(0).try(), 4);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual([[1, 2, 3, 4]]);
        expect(event.changes).toMatchChanges(
          change.child.shape | change.subtree.attach,
        );
      });
    });

    describe("subtree", () => {
      it("triggers updates", async () => {
        const field = new FieldOld([[[1, 2, 3]]]);
        const spy = vi.fn();
        field.watch(spy);
        fieldPush(field.at(0).try()?.at(0).try(), 4);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual([[[1, 2, 3, 4]]]);
        expect(event.changes).toMatchChanges(
          change.subtree.shape | change.subtree.attach,
        );
      });
    });
  });
});

describe(fieldInsert, () => {
  it("inserts an item at given index", () => {
    const field = new FieldOld([1, 2, 3]);
    fieldInsert(field, 0, 4);
    expect(field.get()).toEqual([4, 1, 2, 3]);
    fieldInsert(field, 2, 5);
    expect(field.get()).toEqual([4, 1, 5, 2, 3]);
  });

  it("returns new field", () => {
    const field = new FieldOld([1, 2, 3]);
    const newField = fieldInsert(field, 0, 4);
    expect(newField).toBeInstanceOf(FieldOld);
    expect(newField.get()).toEqual(4);
  });

  describe("changes", () => {
    describe("field", () => {
      it("triggers updates", async () => {
        const field = new FieldOld([1, 2, 3]);
        const spy = vi.fn();
        field.watch(spy);
        fieldInsert(field, 0, 4);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual([4, 1, 2, 3]);
        expect(event.changes).toMatchChanges(
          change.field.shape | change.child.attach,
        );
      });
    });

    describe("child", () => {
      it("triggers updates", async () => {
        const field = new FieldOld([[1, 2, 3]]);
        const spy = vi.fn();
        field.watch(spy);
        fieldInsert(field.at(0).try(), 0, 4);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual([[4, 1, 2, 3]]);
        expect(event.changes).toMatchChanges(
          change.child.shape | change.subtree.attach,
        );
      });
    });

    describe("subtree", () => {
      it("triggers updates", async () => {
        const field = new FieldOld([[[1, 2, 3]]]);
        const spy = vi.fn();
        field.watch(spy);
        fieldInsert(field.at(0).try()?.at(0).try(), 0, 4);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual([[[4, 1, 2, 3]]]);
        expect(event.changes).toMatchChanges(
          change.subtree.shape | change.subtree.attach,
        );
      });
    });
  });
});

describe(fieldRemove, () => {
  describe(Object, () => {
    it("removes a record field by key", () => {
      const field = new FieldOld<Record<string, number>>({
        one: 1,
        two: 2,
        three: 3,
      });
      fieldRemove(field, "one");
      expect(field.get()).toEqual({ two: 2, three: 3 });
    });

    it("returns the removed field", () => {
      const field = new FieldOld<Record<string, number>>({
        one: 1,
        two: 2,
        three: 3,
      });
      const oneField = field.$.one;
      const removedField = fieldRemove(field, "one");
      expect(removedField).toBe(oneField);
      expect(removedField.get()).toBe(undefined);
    });

    it("removes child", () => {
      const parent = new FieldOld<Record<string, number>>({
        one: 1,
        two: 2,
        three: 3,
      });
      const field = parent.at("one");
      fieldRemove(field);
      expect(parent.get()).toEqual({ two: 2, three: 3 });
      expect(field.get()).toBe(undefined);
    });

    it("removes a optional field by key", () => {
      const field = new FieldOld<{ one: 1; two: 2 | undefined; three?: 3 }>({
        one: 1,
        two: 2,
        three: 3,
      });
      fieldRemove(field, "three");
      expect(field.get()).toEqual({ one: 1, two: 2 });
    });

    it("doesn't throw on removing non-existing field", () => {
      const field = new FieldOld<Record<string, number>>({ one: 1 });
      expect(() => fieldRemove(field, "two")).not.toThrow();
    });

    describe("changes", () => {
      describe("child", () => {
        it("triggers updates", async () => {
          const spy = vi.fn();
          const field = new FieldOld<Record<string, number>>({
            one: 1,
            two: 2,
            three: 3,
          });
          field.watch(spy);
          fieldRemove(field, "one");
          await postpone();
          const [[value, event]]: any = spy.mock.calls;
          expect(value).toEqual({ two: 2, three: 3 });
          expect(event.changes).toMatchChanges(
            change.field.shape | change.child.detach,
          );
        });
      });

      describe("subtree", () => {
        it("triggers updates", async () => {
          const spy = vi.fn();
          const field = new FieldOld<{ qwe: Record<string, number> }>({
            qwe: {
              one: 1,
              two: 2,
              three: 3,
            },
          });
          field.watch(spy);
          fieldRemove(field.$.qwe, "one");
          await postpone();
          const [[value, event]]: any = spy.mock.calls;
          expect(value).toEqual({ qwe: { two: 2, three: 3 } });
          expect(event.changes).toMatchChanges(
            change.child.shape | change.subtree.detach,
          );
        });
      });
    });
  });

  describe(Array, () => {
    it("removes a field by index", () => {
      const field = new FieldOld([1, 2, 3]);
      fieldRemove(field, 1);
      expect(field.get()).toEqual([1, 3]);
    });

    it("returns the removed field", () => {
      const field = new FieldOld([1, 2, 3]);
      const oneField = field.at(1);
      const removedField = fieldRemove(field, 1);
      expect(removedField).toBe(oneField);
      expect(removedField.get()).toBe(undefined);
    });

    it("removes child", () => {
      const parent = new FieldOld([1, 2, 3]);
      const field = parent.at(1);
      fieldRemove(field);
      expect(parent.get()).toEqual([1, 3]);
      expect(field.get()).toBe(undefined);
    });

    it("doesn't throw on removing non-existing item", () => {
      const field = new FieldOld([1, 2, 3]);
      expect(() => fieldRemove(field, 6)).not.toThrow();
    });

    it("updates the children indices", () => {
      const field = new FieldOld([1, 2, 3, 4]);
      fieldRemove(field, 1);
      expect(field.at(0).key).toBe("0");
      expect(field.at(1).key).toBe("1");
      expect(field.at(2).key).toBe("2");
    });

    describe("changes", () => {
      describe("child", () => {
        it("triggers updates", async () => {
          const spy = vi.fn();
          const field = new FieldOld([1, 2, 3, 4]);
          field.watch(spy);
          fieldRemove(field, 1);
          await postpone();
          const [[value, event]]: any = spy.mock.calls;
          expect(value).toEqual([1, 3, 4]);
          expect(event.changes).toMatchChanges(
            change.field.shape | change.child.detach,
          );
        });
      });

      describe("subtree", () => {
        it("triggers updates", async () => {
          const spy = vi.fn();
          const field = new FieldOld([[1, 2, 3, 4]]);
          field.watch(spy);
          fieldRemove(field.at(0).try(), 1);
          await postpone();
          const [[value, event]]: any = spy.mock.calls;
          expect(value).toEqual([[1, 3, 4]]);
          expect(event.changes).toMatchChanges(
            change.child.shape | change.subtree.detach,
          );
        });
      });
    });
  });
});
