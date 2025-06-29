import { describe, expect, it, vi } from "vitest";
import { fieldEach, fieldInsert, fieldMap, fieldPush } from "./index.ts";
import { Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";
import { postpone } from "../../../tests/utils.ts";
import { change } from "../../change/index.ts";

describe(fieldEach, () => {
  describe("array fields", () => {
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

  describe("object fields", () => {
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
  describe("array fields", () => {
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

  describe("object fields", () => {
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
