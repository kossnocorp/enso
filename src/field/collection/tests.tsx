import { describe, expect, it, vi } from "vitest";
import { postpone } from "../../../tests/utils.ts";
import { change } from "../../change/index.ts";
import { Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";
import {
  fieldEach,
  fieldInsert,
  fieldMap,
  fieldPush,
  fieldRemove,
} from "./index.ts";

describe(fieldEach, () => {
  describe(Array, () => {
    const field = new Field([1, 2, 3]);
    const fieldUnd = new Field<number[] | undefined>(undefined);

    describe(Field, () => {
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

    describe(FieldRef, () => {
      it("iterates items", () => {
        const ref = new FieldRef(field);
        const mapped: [number, number][] = [];
        fieldEach(ref, (item, index) => mapped.push([index, item.get() * 2]));
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRef(fieldUnd);
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRef, () => {
      it("iterates items", () => {
        const ref = new MaybeFieldRef({ type: "direct", field });
        const mapped: [number, number][] = [];
        fieldEach(ref, (item, index) => mapped.push([index, item.get() * 2]));
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRef({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe(Object, () => {
    const field = new Field({ a: 1, b: 2, c: 3 });
    const fieldUnd = new Field<{ [k: string]: number } | undefined>(undefined);

    describe(Field, () => {
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

    describe(FieldRef, () => {
      it("iterates items and keys", () => {
        const ref = new FieldRef(field);
        const mapped: [string, number][] = [];
        fieldEach(ref, (item, key) => mapped.push([key, item.get()]));
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRef(fieldUnd);
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRef, () => {
      it("iterates items and keys", () => {
        const ref = new MaybeFieldRef({ type: "direct", field });
        const mapped: [string, number][] = [];
        fieldEach(ref, (item, key) => mapped.push([key, item.get()]));
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRef({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldEach(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});

describe(fieldMap, () => {
  describe(Array, () => {
    const field = new Field([1, 2, 3]);
    const fieldUnd = new Field<number[] | undefined>(undefined);

    describe(Field, () => {
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

    describe(FieldRef, () => {
      it("maps items", () => {
        const ref = new FieldRef(field);
        const mapped = fieldMap(ref, (item, index) => [index, item.get() * 2]);
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRef(fieldUnd);
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRef, () => {
      it("maps items", () => {
        const ref = new MaybeFieldRef({ type: "direct", field });
        const mapped = fieldMap(ref, (item, index) => [index, item.get() * 2]);
        expect(mapped).toEqual([
          [0, 2],
          [1, 4],
          [2, 6],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRef({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe(Object, () => {
    const field = new Field({ a: 1, b: 2, c: 3 });
    const fieldUnd = new Field<{ [k: string]: number } | undefined>(undefined);

    describe(Field, () => {
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

    describe(FieldRef, () => {
      it("maps items and keys", () => {
        const ref = new FieldRef(field);
        const mapped = fieldMap(ref, (item, key) => [key, item.get()]);
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new FieldRef(fieldUnd);
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe(MaybeFieldRef, () => {
      it("maps items and keys", () => {
        const ref = new MaybeFieldRef({ type: "direct", field });
        const mapped = fieldMap(ref, (item, key) => [key, item.get()]);
        expect(mapped).toEqual([
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ]);
      });

      it("accepts undefined field", () => {
        const ref = new MaybeFieldRef({ type: "direct", field: fieldUnd });
        const spy = vi.fn();
        fieldMap(ref.try(), spy);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});

describe(fieldPush, () => {
  it("pushes items to array fields", () => {
    const field = new Field([1, 2, 3]);
    fieldPush(field, 4);
    expect(field.get()).toEqual([1, 2, 3, 4]);
  });

  // it("assigns last changes", () => {
  //   const field = new Field([1, 2, 3]);
  //   fieldPush(field, 4);
  //   expect(field.lastChanges).toMatchChanges(change.child.attach);
  // });

  it("returns new field", () => {
    const field = new Field([1, 2, 3]);
    const result = fieldPush(field, 4);
    expect(result).toBeInstanceOf(Field);
    expect(result.get()).toEqual(4);
  });

  describe("changes", () => {
    describe("field", () => {
      it("triggers updates", async () => {
        const field = new Field([1, 2, 3]);
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
        const field = new Field([[1, 2, 3]]);
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
        const field = new Field([[[1, 2, 3]]]);
        const spy = vi.fn();
        field.watch(spy);
        // @ts-expect-error: This is fine!
        fieldPush(field.at(0).at(0), 4);
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
    const field = new Field([1, 2, 3]);
    fieldInsert(field, 0, 4);
    expect(field.get()).toEqual([4, 1, 2, 3]);
    fieldInsert(field, 2, 5);
    expect(field.get()).toEqual([4, 1, 5, 2, 3]);
  });

  it("returns new field", () => {
    const field = new Field([1, 2, 3]);
    const newField = fieldInsert(field, 0, 4);
    expect(newField).toBeInstanceOf(Field);
    expect(newField.get()).toEqual(4);
  });

  describe("changes", () => {
    describe("field", () => {
      it("triggers updates", async () => {
        const field = new Field([1, 2, 3]);
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
        const field = new Field([[1, 2, 3]]);
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
        const field = new Field([[[1, 2, 3]]]);
        const spy = vi.fn();
        field.watch(spy);
        // @ts-expect-error: This is fine!
        fieldInsert(field.at(0).at(0), 0, 4);
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
      const field = new Field<Record<string, number>>({
        one: 1,
        two: 2,
        three: 3,
      });
      fieldRemove(field, "one");
      expect(field.get()).toEqual({ two: 2, three: 3 });
    });

    it("returns the removed field", () => {
      const field = new Field<Record<string, number>>({
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
      const parent = new Field<Record<string, number>>({
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
      const field = new Field<{ one: 1; two: 2 | undefined; three?: 3 }>({
        one: 1,
        two: 2,
        three: 3,
      });
      fieldRemove(field, "three");
      expect(field.get()).toEqual({ one: 1, two: 2 });
    });

    it("doesn't throw on removing non-existing field", () => {
      const field = new Field<Record<string, number>>({ one: 1 });
      expect(() => fieldRemove(field, "two")).not.toThrow();
    });

    describe("changes", () => {
      describe("child", () => {
        it("triggers updates", async () => {
          const spy = vi.fn();
          const field = new Field<Record<string, number>>({
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
          const field = new Field<{ qwe: Record<string, number> }>({
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
      const field = new Field([1, 2, 3]);
      fieldRemove(field, 1);
      expect(field.get()).toEqual([1, 3]);
    });

    it("returns the removed field", () => {
      const field = new Field([1, 2, 3]);
      const oneField = field.at(1);
      const removedField = fieldRemove(field, 1);
      expect(removedField).toBe(oneField);
      expect(removedField.get()).toBe(undefined);
    });

    it("removes child", () => {
      const parent = new Field([1, 2, 3]);
      const field = parent.at(1);
      fieldRemove(field);
      expect(parent.get()).toEqual([1, 3]);
      expect(field.get()).toBe(undefined);
    });

    it("doesn't throw on removing non-existing item", () => {
      const field = new Field([1, 2, 3]);
      expect(() => fieldRemove(field, 6)).not.toThrow();
    });

    it("updates the children indices", () => {
      const field = new Field([1, 2, 3, 4]);
      fieldRemove(field, 1);
      expect(field.at(0).key).toBe("0");
      expect(field.at(1).key).toBe("1");
      expect(field.at(2).key).toBe("2");
    });

    describe("changes", () => {
      describe("child", () => {
        it("triggers updates", async () => {
          const spy = vi.fn();
          const field = new Field([1, 2, 3, 4]);
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
          const field = new Field([[1, 2, 3, 4]]);
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
