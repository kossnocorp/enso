import { assert, describe, expect, it, vi } from "vitest";
import { Field, fieldChange, undefinedValue } from "./index.tsx";
import { FieldRef } from "./ref/index.ts";

describe("Field", () => {
  it("creates a field instance", () => {
    const field = new Field(42);
    expect(field.get()).toBe(42);
  });

  describe("attributes", () => {
    describe("id", () => {
      it("assigns a unique id to each field", () => {
        const field1 = new Field(42);
        const field2 = new Field(42);
        expect(field1.id).toBeTypeOf("string");
        expect(field1.id).not.toBe(field2.id);
      });

      it("computed fields returns unique ids", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.id).not.toBe(field.$.name.$.first.id);
      });
    });

    describe("key", () => {
      it("returns the field key", () => {
        const field = new Field({ name: { first: "Sasha" } });
        expect(field.$.name.$.first.key).toBe("first");
      });

      it("returns undefined for root field", () => {
        const field = new Field({ name: { first: "Sasha" } });
        expect(field.key).toBe(undefined);
      });

      it("returns the source key for computed fields", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.key).toBe("first");
      });
    });

    describe("path", () => {
      it("returns tha path to the field", () => {
        const field = new Field({ address: { name: { first: "Sasha" } } });
        expect(field.$.address.$.name.$.first.path).toEqual([
          "address",
          "name",
          "first",
        ]);
      });

      it("returns empty array for root field", () => {
        const field = new Field({ name: { first: "Sasha" } });
        expect(field.path).toEqual([]);
      });

      it("returns the source path for computed fields", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.path).toEqual(["name", "first"]);
      });
    });

    describe("parent", () => {
      it("returns the parent field", () => {
        const field = new Field({ name: { first: "Sasha" } });
        expect(field.$.name.$.first.parent).toBe(field.$.name);
      });

      it("returns undefined for root field", () => {
        const field = new Field({ name: { first: "Sasha" } });
        expect(field.parent).toBe(undefined);
      });

      it("returns the source parent for computed fields", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.parent).toBe(field.$.name);
      });
    });
  });

  describe("value", () => {
    describe("set", () => {
      describe("primitive", () => {
        it("sets a new field", () => {
          const field = new Field(42);
          field.set(43);
          expect(field.get()).toBe(43);
        });

        it("returns 0 if the field has not changed", () => {
          const field = new Field(42);
          expect(field.set(42)).toBe(0);
        });

        it("returns value change type if the field has changed", () => {
          const field = new Field(42);
          expect(field.set(43)).toBe(fieldChange.value);
        });

        it("returns value change type if the field has changed", () => {
          const field = new Field<number | string>(42);
          expect(field.set("42")).toBe(fieldChange.type);
        });
      });

      describe("object", () => {
        it("sets the object field", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          field.set({ num: 43 });
          expect(field.get()).toEqual({ num: 43 });
          field.set({ num: 44, str: "hello" });
          expect(field.get()).toEqual({ num: 44, str: "hello" });
          field.set({ str: "world" });
          expect(field.get()).toEqual({ str: "world" });
          field.set({});
          expect(field.get()).toEqual({});
        });

        it("returns 0 if the field has not changed", () => {
          const field = new Field({ num: 42 });
          expect(field.set({ num: 42 })).toBe(0);
        });

        it("returns child change type if a child field has changed", () => {
          const field = new Field({ num: 42 });
          expect(field.set({ num: 43 })).toBe(fieldChange.child);
        });

        it("returns added change type if a child has been added", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          expect(field.set({ num: 42, str: "hello" })).toBe(
            fieldChange.childCreated
          );
        });

        it("returns child removed change type if a child has been removed", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          expect(field.set({})).toBe(fieldChange.childRemoved);
        });

        it("returns combined change type", () => {
          const field = new Field<{
            num?: number;
            str?: string;
            bool?: boolean;
          }>({ num: 42, str: "hello" });
          const change = field.set({ num: 43, bool: true });
          expect(change & fieldChange.child).toBe(fieldChange.child);
          expect(change & fieldChange.childCreated).toBe(
            fieldChange.childCreated
          );
          expect(change & fieldChange.childRemoved).toBe(
            fieldChange.childRemoved
          );
        });

        it("does not trigger fields updates when removing", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          const spy = vi.fn();
          field.$.num?.watch(spy);
          field.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: fieldChange.value })
          );
          field.set({ str: "hello" });
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed fields", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          const spy = vi.fn();
          const numA = field.$.num;
          numA?.watch(spy);
          field.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: fieldChange.value })
          );
          field.set({ str: "hello" });
          field.set({ num: 44, str: "hello" });
          const numB = field.$.num;
          expect(numA).toBeInstanceOf(Field);
          expect(numA).toBe(numB);
          expect(spy).toHaveBeenCalledWith(
            44,
            expect.objectContaining({
              changes: fieldChange.type | fieldChange.created,
            })
          );
        });

        it("indicates no type change on adding undefined", () => {
          const field = new Field<{ num?: number | undefined; str?: string }>({
            num: 42,
          });
          const spy = vi.fn();
          const numA = field.$.num;
          numA?.watch(spy);
          field.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: fieldChange.value })
          );
          field.set({ str: "hello" });
          field.set({ num: undefined, str: "hello" });
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              changes: fieldChange.created,
            })
          );
        });

        it("works when assigning undefined instead of an object item", () => {
          const field = new Field<Record<string, { n: number }>>({
            one: { n: 1 },
            two: { n: 2 },
            three: { n: 3 },
          });
          const changes = field.set({ one: { n: 1 }, two: { n: 2 } });
          expect(changes).toBe(fieldChange.childRemoved);
          expect(field.get()).toEqual({ one: { n: 1 }, two: { n: 2 } });
        });

        it("works when assigning object instead of an undefined item", () => {
          const field = new Field<Record<string, { n: number }>>({
            one: { n: 1 },
            two: { n: 2 },
          });
          const spy = vi.fn();
          const undefinedField = field.at("three");
          // @ts-expect-error: This is fine!
          undefinedField.map(spy);
          expect(spy).not.toBeCalled();
          expect(undefinedField.get()).toBe(undefined);
          const changes = field.set({
            one: { n: 1 },
            two: { n: 2 },
            three: { n: 3 },
          });
          expect(changes).toBe(fieldChange.childCreated);
          expect(field.get()).toEqual({
            one: { n: 1 },
            two: { n: 2 },
            three: { n: 3 },
          });
          // @ts-expect-error: This is fine!
          undefinedField.map(spy);
          expect(spy).toBeCalled();
        });

        it("returns created event when adding a new field", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          const changes = field.at("str").set("hello");
          expect(changes).toBe(fieldChange.type | fieldChange.created);
        });
      });

      describe("array", () => {
        it("sets the array field", () => {
          const field = new Field<number[]>([1, 2, 3, 4, 5]);
          field.set([1, 2, 3]);
          expect(field.get()).toEqual([1, 2, 3]);
          field.set([1, 2, 3, 4]);
          expect(field.get()).toEqual([1, 2, 3, 4]);
          const arr = new Array(5);
          arr[3] = 5;
          field.set(arr);
          expect(field.get()).toEqual(arr);
          field.set([]);
          expect(field.get()).toEqual([]);
        });

        it("returns 0 if the field has not changed", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2, 3])).toBe(0);
        });

        it("returns child change type if a child field has changed", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2, 1])).toBe(fieldChange.child);
        });

        it("returns added change type if a child has been added", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2, 3, 4])).toBe(fieldChange.childCreated);
        });

        it("returns child removed change type if a child has been removed", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2])).toBe(fieldChange.childRemoved);
        });

        it("returns combined change type", () => {
          const field = new Field([1, 2]);
          const arr = [0, 2, 3];
          delete arr[1];
          const change = field.set(arr);
          expect(change & fieldChange.child).toBe(fieldChange.child);
          expect(change & fieldChange.childCreated).toBe(
            fieldChange.childCreated
          );
          expect(change & fieldChange.childRemoved).toBe(
            fieldChange.childRemoved
          );
        });

        it("does not trigger item updates when removing", () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          field.$[2]?.watch(spy);
          field.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({
              changes: fieldChange.value,
            })
          );
          field.set([1, 2]);
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed items", () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = field.at(2);
          itemA.watch(spy);
          field.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ changes: fieldChange.value })
          );
          field.set([1, 2]);
          field.set([1, 2, 333]);
          const itemB = field.at(2);
          expect(itemA).toBeInstanceOf(Field);
          expect(itemA).toBe(itemB);
          expect(spy).toHaveBeenCalledWith(
            333,
            expect.objectContaining({
              changes: fieldChange.type | fieldChange.created,
            })
          );
        });

        it("indicates no type change on adding undefined", () => {
          const field = new Field<Array<number | undefined>>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = field.at(2);
          itemA.watch(spy);
          field.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ changes: fieldChange.value })
          );
          field.set([1, 2]);
          field.set([1, 2, undefined]);
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              changes: fieldChange.created,
            })
          );
        });

        it("does not trigger update when setting undefined value to undefined value", () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          expect(field.at(5).set(undefinedValue)).toBe(0);
        });

        it("works when assigning undefined instead of an object item", () => {
          const field = new Field<Array<{ n: number }>>([
            { n: 1 },
            { n: 2 },
            { n: 3 },
          ]);
          const changes = field.set([{ n: 1 }, { n: 2 }]);
          expect(changes).toBe(fieldChange.childRemoved);
          expect(field.get()).toEqual([{ n: 1 }, { n: 2 }]);
        });

        it("works when assigning object instead of an undefined item", () => {
          const field = new Field<Array<{ n: number }>>([{ n: 1 }, { n: 2 }]);
          const spy = vi.fn();
          const undefinedField = field.at(2);
          // @ts-expect-error: This is fine!
          undefinedField.map(spy);
          expect(undefinedField.get()).toBe(undefined);
          const changes = field.set([{ n: 1 }, { n: 2 }, { n: 3 }]);
          expect(changes).toBe(fieldChange.childCreated);
          expect(field.get()).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
          // @ts-expect-error: This is fine!
          undefinedField.map(spy);
          expect(spy).toBeCalled();
        });

        it("returns created event when adding a new field", () => {
          const field = new Field<number[]>([1, 2]);
          const changes = field.at(2).set(3);
          expect(changes).toBe(fieldChange.type | fieldChange.created);
        });
      });
    });

    describe("initial", () => {
      it("returns the initial field", () => {
        const field = new Field(42);
        field.set(43);
        expect(field.initial).toBe(42);
      });

      it("preserves the initial value on type change", () => {
        const field = new Field<number | object>(42);
        field.set({ hello: "world" });
        expect(field.initial).toBe(42);
      });
    });

    describe("dirty", () => {
      describe("primitive", () => {
        it("returns true if the field has changed", () => {
          const field = new Field(42);
          expect(field.dirty).toBe(false);
          field.set(43);
          expect(field.dirty).toBe(true);
        });

        it("returns false after restoring to the initial value", () => {
          const field = new Field(42);
          expect(field.dirty).toBe(false);
          field.set(43);
          field.set(42);
          expect(field.dirty).toBe(false);
        });
      });

      describe("object", () => {
        it("returns true if any of the children has changed", () => {
          const field = new Field({ name: { first: "Alexander", last: "" } });
          expect(field.dirty).toBe(false);
          expect(field.$.name.dirty).toBe(false);
          expect(field.$.name.$.first.dirty).toBe(false);
          expect(field.$.name.$.last.dirty).toBe(false);
          field.$.name.$.first.set("Sasha");
          expect(field.dirty).toBe(true);
          expect(field.$.name.dirty).toBe(true);
          expect(field.$.name.$.first.dirty).toBe(true);
          expect(field.$.name.$.last.dirty).toBe(false);
        });

        it("returns false after restoring to the initial value", () => {
          const field = new Field({ name: { first: "Alexander", last: "" } });
          field.$.name.$.first.set("Sasha");
          field.$.name.$.first.set("Alexander");
          expect(field.dirty).toBe(false);
          expect(field.$.name.dirty).toBe(false);
          expect(field.$.name.$.first.dirty).toBe(false);
          expect(field.$.name.$.last.dirty).toBe(false);
        });

        it("returns true if a child changed type", () => {
          const field = new Field<{
            name: { first: string; last: string } | string;
          }>({ name: { first: "Alexander", last: "" } });
          expect(field.dirty).toBe(false);
          expect(field.$.name.dirty).toBe(false);
          field.$.name.set("Alexander");
          expect(field.dirty).toBe(true);
          expect(field.$.name.dirty).toBe(true);
        });

        it("returns true if a child changed shape", () => {
          const field = new Field<{
            name: { first?: string; last?: string };
          }>({ name: { first: "Alexander" } });
          expect(field.dirty).toBe(false);
          expect(field.$.name.dirty).toBe(false);
          field.$.name.set({ last: "Koss" });
          expect(field.dirty).toBe(true);
          expect(field.$.name.dirty).toBe(true);
          expect(field.$.name.$.last.dirty).toBe(false);
        });
      });

      describe("array", () => {
        it("returns true if any of the items has changed", () => {
          const field = new Field<number[][]>([[1, 2], [3]]);
          expect(field.dirty).toBe(false);
          expect(field.at(0).dirty).toBe(false);
          expect(field.try(0)?.try(0)?.dirty).toBe(false);
          expect(field.try(0)?.try(1)?.dirty).toBe(false);
          expect(field.try(1)?.try(0)?.dirty).toBe(false);
          field.try(1)?.at(0).set(5);
          expect(field.dirty).toBe(true);
          expect(field.try(0)?.dirty).toBe(false);
          expect(field.try(0)?.try(0)?.dirty).toBe(false);
          expect(field.try(0)?.try(1)?.dirty).toBe(false);
          expect(field.try(1)?.try(0)?.dirty).toBe(true);
        });

        it("returns false after restoring to the initial value", () => {
          const field = new Field<number[][]>([[1, 2], [3]]);
          field.try(1)?.at(0).set(5);
          field.try(1)?.at(0).set(3);
          expect(field.dirty).toBe(false);
          expect(field.try(0)?.dirty).toBe(false);
          expect(field.try(0)?.try(0)?.dirty).toBe(false);
          expect(field.try(0)?.try(1)?.dirty).toBe(false);
          expect(field.try(1)?.try(0)?.dirty).toBe(false);
        });

        it("returns true if a child changed type", () => {
          const field = new Field<Array<string | object>>(["hello", {}]);
          expect(field.dirty).toBe(false);
          field.at(0).set({});
          expect(field.dirty).toBe(true);
          expect(field.at(0).dirty).toBe(true);
          expect(field.at(1).dirty).toBe(false);
        });

        it("returns true if a child changed shape", () => {
          const field = new Field<Array<{ first?: string; last?: string }>>([
            { first: "Alexander" },
            { first: "Sasha" },
          ]);
          expect(field.dirty).toBe(false);
          field.at(0).set({ last: "Koss" });
          expect(field.dirty).toBe(true);
          expect(field.at(0).dirty).toBe(true);
          expect(field.at(1).dirty).toBe(false);
        });
      });

      describe("computed", () => {
        it("returns true if the source field has changed", () => {
          const field = new Field<string | undefined>("Hello");
          const computed = field.into(toString).from(fromString);
          expect(computed.dirty).toBe(false);
          field.set("Hi");
          expect(computed.dirty).toBe(true);
        });

        it("returns false if the source field didn't change", () => {
          const field = new Field<string | undefined>(undefined);
          const computed = field.into(toString).from(fromString);
          expect(computed.dirty).toBe(false);
          field.set(" ");
          expect(computed.dirty).toBe(false);
        });

        function toString(value: string | undefined) {
          return value ?? "";
        }

        function fromString(value: string) {
          return value.trim() || undefined;
        }
      });
    });

    describe("commit", () => {
      it("commits the current field as the initial field", () => {
        const field = new Field(42);
        field.set(43);
        field.commit();
        expect(field.initial).toBe(43);
        expect(field.dirty).toBe(false);
      });

      it("commits the current field as the initial field for children", () => {
        const field = new Field({
          name: { first: "Alexander" },
          codes: [1, 2, 3],
        });
        field.$.name.$.first.set("Sasha");
        field.$.codes.at(1).set(5);
        field.commit();
        expect(field.initial).toEqual({
          name: { first: "Sasha" },
          codes: [1, 5, 3],
        });
        expect(field.get()).toEqual({
          name: { first: "Sasha" },
          codes: [1, 5, 3],
        });
        expect(field.dirty).toBe(false);
        expect(field.$.name.$.first.initial).toBe("Sasha");
        expect(field.$.name.$.first.dirty).toBe(false);
        expect(field.$.codes.at(1).initial).toBe(5);
        expect(field.$.codes.at(1).dirty).toBe(false);
      });
    });

    describe("reset", () => {
      it("resets the current field to initial state", () => {
        const field = new Field(42);
        field.set(43);
        expect(field.dirty).toBe(true);
        field.reset();
        expect(field.initial).toBe(42);
        expect(field.dirty).toBe(false);
      });

      it("resets the nested children", () => {
        const field = new Field({
          name: { first: "Alexander" },
          codes: [1, 2, 3],
        });
        field.$.name.$.first.set("Sasha");
        field.$.codes.at(1).set(5);
        expect(field.dirty).toBe(true);
        expect(field.$.name.$.first.dirty).toBe(true);
        expect(field.$.codes.at(1).dirty).toBe(true);
        field.reset();
        expect(field.get()).toEqual({
          name: { first: "Alexander" },
          codes: [1, 2, 3],
        });
        expect(field.dirty).toBe(false);
        expect(field.$.name.$.first.dirty).toBe(false);
        expect(field.$.codes.at(1).dirty).toBe(false);
      });
    });
  });

  describe("tree", () => {
    describe("$", () => {
      it("points to itself for a primitive", () => {
        const field = new Field(42);
        expect(field.$).toBe(field);
      });

      describe("object", () => {
        it("allows to access fields", () => {
          const field = new Field({ num: 42 });
          const num = field.$.num;
          num satisfies Field<number>;
          expect(num).toBeInstanceOf(Field);
          expect(num.get()).toBe(42);
        });

        it("allows to access record fields", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          const numA = field.$["num"];
          numA satisfies Field<number | undefined> | undefined;
          expect(numA?.get()).toBe(42);
          const numB = field.at("num");
          numB satisfies Field<number | undefined>;
          expect(numB.get()).toBe(42);
        });

        it("preserves fields", () => {
          const field = new Field({ num: 42 });
          const numA = field.$.num;
          const numB = field.$.num;
          numA satisfies Field<number>;
          expect(numA).toBeInstanceOf(Field);
          expect(numA).toBe(numB);
        });

        it("allows to access undefined fields", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          const str = field.$.str;
          str satisfies Field<string | undefined>;
          expect(str).toBeInstanceOf(Field);
          expect(str.get()).toBe(undefined);
        });

        it("preserves undefined fields", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          const fieldA = field.$.str;
          const fieldB = field.$.str;
          expect(fieldA).toBe(fieldB);
        });
      });

      describe("array", () => {
        it("allows to access items", () => {
          const field = new Field([1, 2, 3, 4]);
          const item = field.$[3];
          item satisfies Field<number | undefined> | undefined;
          expect(item).toBeInstanceOf(Field);
          expect(item?.get()).toBe(4);
        });

        it("preserves items", () => {
          const field = new Field([1, 2, 3, 4]);
          const itemA = field.$[3];
          const itemB = field.$[3];
          itemA satisfies Field<number | undefined> | undefined;
          expect(itemA).toBeInstanceOf(Field);
          expect(itemA).toBe(itemB);
        });

        it("allows to access undefined items", () => {
          const field = new Field([1, 2, 3, 4]);
          const item = field.at(10);
          item satisfies Field<number | undefined>;
          expect(item).toBeInstanceOf(Field);
          expect(item.get()).toBe(undefined);
        });

        it("preserves undefined items", () => {
          const field = new Field([1, 2, 3, 4]);
          const itemA = field.at(10);
          const itemB = field.at(10);
          expect(itemA).toBe(itemB);
        });
      });
    });

    describe("try", () => {
      describe("primitive", () => {
        it("returns the field if it's defined", () => {
          const field = new Field<string | number | undefined>(42);
          const num = field.try;
          num satisfies Field<string | number> | undefined;
          expect(num).toBe(field);
          expect(num).toBeInstanceOf(Field);
          expect(num?.get()).toBe(42);
        });

        it("returns undefined if field doesn't exist", () => {
          const field = new Field<string | number | undefined>(
            undefinedValue as any
          );
          const num = field.try;
          expect(num).toBe(undefined);
        });

        it("returns undefined/null if field is undefined/null", () => {
          const undefinedState = new Field<string | undefined>(undefined);
          expect(undefinedState.try).toBe(undefined);
          const nullState = new Field<string | null>(null);
          nullState.try satisfies Field<string> | null;
          expect(nullState.try).toBe(null);
        });
      });

      describe("object", () => {
        it("returns the field if it exists", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          const num = field.try("num");
          num satisfies Field<number> | undefined;
          expect(num).toBeInstanceOf(Field);
          expect(num?.get()).toBe(42);
        });

        it("returns undefined if field doesn't exist", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          const bum = field.try("bum");
          expect(bum).toBe(undefined);
        });

        it("returns undefined/null if field is undefined/null", () => {
          const field = new Field<Record<string, number | undefined | null>>({
            num: 42,
            bum: undefined,
            hum: null,
          });
          field.try("bum") satisfies Field<number> | undefined | null;
          expect(field.try("bum")).toBe(undefined);
          expect(field.try("hum")).toBe(null);
        });
      });

      describe("array", () => {
        it("returns the item if it exists", () => {
          const field = new Field<Array<number>>([1, 2, 3]);
          const num = field.try(1);
          num satisfies Field<number> | undefined;
          expect(num).toBeInstanceOf(Field);
          expect(num?.get()).toBe(2);
        });

        it("returns undefined if item doesn't exist", () => {
          const field = new Field<Array<number>>([1, 2, 3]);
          const num = field.try(5);
          expect(num).toBe(undefined);
        });

        it("returns undefined/null if item is undefined/null", () => {
          const field = new Field<Array<number | undefined | null>>([
            1,
            undefined,
            null,
          ]);
          field.try(0) satisfies Field<number> | undefined | null;
          expect(field.try(1)).toBe(undefined);
          expect(field.try(2)).toBe(null);
        });
      });
    });
  });

  describe("events", () => {
    describe("trigger", () => {
      it("triggers the watchers", () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        field.trigger(fieldChange.value);
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ changes: fieldChange.value })
        );
      });

      it("doesn't trigger parent fields", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.$.num.trigger(fieldChange.value);
        expect(spy).not.toHaveBeenCalled();
      });

      it("allows to notify parent fields", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.$.num.trigger(fieldChange.value, true);
        expect(spy).toHaveBeenCalledWith(
          { num: 42 },
          expect.objectContaining({ changes: fieldChange.child })
        );
      });

      it("notifies parents about child blurring", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.$.num.trigger(fieldChange.blurred, true);
        expect(spy).toHaveBeenCalledWith(
          { num: 42 },
          expect.objectContaining({
            changes: fieldChange.child | fieldChange.childBlurred,
          })
        );
      });

      it("notifies parents about nested child blurring", () => {
        const field = new Field({ user: { name: { first: "Sasha" } } });
        const spy = vi.fn();
        field.watch(spy);
        field.$.user.$.name.$.first.trigger(fieldChange.blurred, true);
        expect(spy).toHaveBeenCalledWith(
          { user: { name: { first: "Sasha" } } },
          expect.objectContaining({
            changes: fieldChange.child | fieldChange.childBlurred,
          })
        );
      });
    });

    describe("withhold", () => {
      it("allows to withhold the events until it's unleashed", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.withhold();
        field.$.num.trigger(fieldChange.value, true);
        field.$.num.trigger(fieldChange.childRemoved, true);
        field.$.num.trigger(fieldChange.childCreated, true);

        expect(spy).not.toHaveBeenCalled();

        field.unleash();

        expect(spy).toHaveBeenCalledWith(
          { num: 42 },
          expect.objectContaining({ changes: fieldChange.child })
        );
      });

      it("combines the changes into a single event", () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        field.withhold();
        field.trigger(fieldChange.value, true);
        field.trigger(fieldChange.childRemoved, true);
        field.trigger(fieldChange.childCreated, true);

        expect(spy).not.toHaveBeenCalled();

        field.unleash();

        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({
            changes:
              fieldChange.value |
              fieldChange.childRemoved |
              fieldChange.childCreated,
          })
        );
      });

      it("neutralizes valid/invalid changes", () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        field.withhold();
        field.trigger(fieldChange.value, true);
        field.trigger(fieldChange.invalid, true);
        field.trigger(fieldChange.valid, true);

        expect(spy).not.toHaveBeenCalled();

        field.unleash();

        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ changes: fieldChange.value })
        );
      });
    });
  });

  describe("watching", () => {
    describe("watch", () => {
      it("allows to subscribe for field changes", async () =>
        new Promise<void>((resolve) => {
          const field = new Field(42);

          const unsub = field.watch((value) => {
            expect(value).toBe(43);
            unsub();
            // Check if the callback is not called after unsub
            field.set(44);
            setTimeout(resolve);
          });

          field.set(43);
        }));

      it("provides event object with change type as changes", async () =>
        new Promise<void>((resolve) => {
          const field = new Field(42);

          const unsub = field.watch((value, event) => {
            expect(event.changes).toBe(fieldChange.value);
            unsub();
            resolve();
          });

          field.set(43);
        }));

      describe("object", () => {
        it("listens to the field changes", async () =>
          new Promise<void>((resolve) => {
            const field = new Field({ num: 42 });

            const unsub = field.watch((value, event) => {
              expect(event.changes).toBe(fieldChange.child);
              expect(value.num).toBe(43);
              unsub();
              resolve();
            });

            field.$.num.set(43);
          }));

        it("listens to fields create", async () =>
          new Promise<void>((resolve) => {
            const field = new Field<{ num: number; str?: string }>({
              num: 42,
            });

            const unsub = field.watch((value, event) => {
              expect(event.changes).toBe(
                fieldChange.childCreated | fieldChange.child
              );
              expect(value.str).toBe("Hello!");
              unsub();
              resolve();
            });

            field.$.str.set("Hello!");
          }));

        it("listens to field object create", async () =>
          new Promise<void>((resolve) => {
            const field = new Field<Record<number, { n: number }>>({
              1: { n: 1 },
              2: { n: 2 },
            });

            const unsub = field.watch((value, event) => {
              expect(event.changes).toBe(
                fieldChange.childCreated | fieldChange.child
              );
              expect(value[3]).toEqual({ n: 3 });
              unsub();
              resolve();
            });

            field.at(3).set({ n: 3 });
          }));
      });

      describe("array", () => {
        it("listens to the item field changes", async () =>
          new Promise<void>((resolve) => {
            const field = new Field([1, 2, 3]);

            const unsub = field.watch((value, event) => {
              expect(event.changes).toBe(fieldChange.child);
              expect(value[1]).toBe(43);
              unsub();
              resolve();
            });

            field.at(1).set(43);
          }));

        it("listens to items create", async () =>
          new Promise<void>((resolve) => {
            const field = new Field([1, 2, 3]);

            const unsub = field.watch((value, event) => {
              expect(event.changes).toBe(
                fieldChange.childCreated | fieldChange.child
              );
              expect(value[5]).toBe(43);
              unsub();
              resolve();
            });

            field.at(5).set(43);
          }));

        it("listens to items object create", async () =>
          new Promise<void>((resolve) => {
            const field = new Field<Array<{ n: number }>>([{ n: 1 }, { n: 2 }]);

            const unsub = field.watch((value, event) => {
              expect(event.changes).toBe(
                fieldChange.childCreated | fieldChange.child
              );
              expect(value[2]).toEqual({ n: 3 });
              unsub();
              resolve();
            });

            field.at(2).set({ n: 3 });
          }));
      });
    });

    describe("unwatch", () => {
      it("unsubscribes all watchers", () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        field.unwatch();
        field.set(43);
        expect(spy).not.toHaveBeenCalled();
      });

      it("unsubscribes all children", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.$.num?.watch(spy);
        field.unwatch();
        field.$.num?.set(43);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe("mapping", () => {
    describe("discriminate", () => {
      interface Cat {
        type: "cat";
        meow: true;
      }

      interface Dog {
        type: "dog";
        bark: true;
      }

      it("allows to discriminate the field type", () => {
        const field = new Field<Cat | Dog>({ type: "cat", meow: true });
        const discriminated = field.discriminate("type");
        if (discriminated.discriminator === "cat") {
          expect(discriminated.field.get().meow).toBe(true);
          return;
        }
        assert(false, "Should not reach here");
      });

      it("handles undefineds", () => {
        const field = new Field<Cat | Dog | undefined>(undefined);
        const discriminated = field.discriminate("type");
        if (!discriminated.discriminator) {
          expect(discriminated.field.get()).toBe(undefined);
          return;
        }
        assert(false, "Should not reach here");
      });
    });

    describe("decompose", () => {
      it("allows to decompose the field type", () => {
        const field = new Field<string | number | Record<string, number>>(
          "Hello, world!"
        );
        const decomposed = field.decompose();
        if (typeof decomposed.value === "string") {
          expect(decomposed.field.get()).toBe("Hello, world!");
          return;
        }
        assert(false, "Should not reach here");
      });
    });

    describe("narrow", () => {
      it("allows to narrow the field type", () => {
        const field = new Field<string | number>("Hello, world!");
        const narrowed = field.narrow(
          (value, ok) => typeof value === "string" && ok(value)
        );
        narrowed satisfies Field<string> | undefined;
        expect(narrowed?.get()).toBe("Hello, world!");
      });
    });

    describe("into", () => {
      it("allows to create a computed field", () => {
        const field = new Field({ message: "Hello, world!" });
        const computed = field.$.message.into(toCodes).from(fromCodes);
        expect(computed.get()).toEqual([
          72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33,
        ]);
      });

      it("updates the field back from computed", () => {
        const field = new Field({ message: "Hello, world!" });
        const computed = field.$.message.into(toCodes).from(fromCodes);
        computed.set([72, 105, 33]);
        expect(field.get()).toEqual({ message: "Hi!" });
      });

      it("triggers field update", async () =>
        new Promise<void>((resolve) => {
          const field = new Field({ message: "Hello, world!" });
          const computed = field.$.message.into(toCodes).from(fromCodes);

          const unsub = field.$.message.watch((value) => {
            expect(value).toBe("Hi!");
            unsub();
            resolve();
          });

          computed.set([72, 105, 33]);
        }));
    });
  });

  describe("collections", () => {
    describe("remove", () => {
      describe("object", () => {
        it("removes a record field by key", () => {
          const field = new Field<Record<string, number>>({
            one: 1,
            two: 2,
            three: 3,
          });
          field.remove("one");
          expect(field.get()).toEqual({ two: 2, three: 3 });
        });

        it("removes a optional field by key", () => {
          const field = new Field<{ one: 1; two: 2 | undefined; three?: 3 }>({
            one: 1,
            two: 2,
            three: 3,
          });
          field.remove("three");
          expect(field.get()).toEqual({ one: 1, two: 2 });
          // @ts-expect-error
          field.remove("one");
          // @ts-expect-error
          field.remove("two");
        });

        it("doesn't throw on removing non-existing field", () => {
          const field = new Field<Record<string, number>>({ one: 1 });
          expect(() => field.remove("two")).not.toThrow();
        });
      });

      describe("array", () => {
        it("removes a field by index", () => {
          const field = new Field([1, 2, 3]);
          field.remove(1);
          expect(field.get()).toEqual([1, 3]);
        });

        it("doesn't throw on removing non-existing item", () => {
          const field = new Field([1, 2, 3]);
          expect(() => field.remove(6)).not.toThrow();
        });
      });

      describe("item", () => {
        it("removes an item in an object", () => {
          const field = new Field<{
            one?: number;
            two?: number;
            three?: number;
          }>({ one: 1, two: 2, three: 3 });
          field.$.two.remove();
          expect(field.get()).toEqual({ one: 1, three: 3 });
        });

        it("removes an item in an array", () => {
          const field = new Field([1, 2, 3]);
          field.at(1).remove();
          expect(field.get()).toEqual([1, 3]);
        });
      });
    });
  });

  describe("array", () => {
    describe("length", () => {
      it("returns the length of the array", () => {
        const field = new Field([1, 2, 3]);
        expect(field.length).toBe(3);
      });

      it("updates the length of the array", () => {
        const field = new Field([1, 2, 3]);
        field.push(4);
        expect(field.length).toBe(4);
        field.at(1).remove();
        expect(field.length).toBe(3);
        expect(field.get()).toEqual([1, 3, 4]);
      });
    });

    describe("forEach", () => {
      it("iterates the array", () => {
        const field = new Field([1, 2, 3]);
        const mapped: number[] = [];
        field.forEach((item, index) => mapped.push(item.get() * index));
        expect(mapped).toEqual([0, 2, 6]);
      });
    });

    describe("map", () => {
      it("maps the array", () => {
        const field = new Field([1, 2, 3]);
        const mapped = field.map((item, index) => item.get() * index);
        expect(mapped).toEqual([0, 2, 6]);
      });
    });

    describe("push", () => {
      it("adds an item to the end of the array", () => {
        const field = new Field([1, 2, 3]);
        field.push(4);
        expect(field.get()).toEqual([1, 2, 3, 4]);
      });

      it("returns the new length of the array", () => {
        const field = new Field([1, 2, 3]);
        expect(field.push(4)).toBe(4);
      });
    });
  });

  describe("input", () => {
    describe("input", () => {
      it("generates props for a field", () => {
        const field = new Field({ name: { first: "Alexander" } });
        const props = field.$.name.$.first.input();
        expect(props.name).toEqual("name.first");
        expect(props.ref).toBe(field.$.name.$.first.ref);
      });

      it("assigns . name for the root field", () => {
        const field = new Field({ name: { first: "Alexander" } });
        const props = field.input();
        expect(props.name).toEqual(".");
      });
    });
  });

  describe("errors", () => {
    describe("setError", () => {
      it("assigns an error to the field", () => {
        const field = new Field(42);
        field.setError("Something went wrong");
        expect(field.error).toEqual({ message: "Something went wrong" });
      });

      it("allows to pass error object", () => {
        const field = new Field(42);
        field.setError({ type: "internal", message: "Something went wrong" });
        expect(field.error).toEqual({
          type: "internal",
          message: "Something went wrong",
        });
      });

      it("allows to clear the error", () => {
        const field = new Field(42);
        field.setError("Something went wrong");
        field.setError();
        expect(field.error).toBe(undefined);
      });

      it("triggers the invalid update", () =>
        new Promise<void>((resolve) => {
          const field = new Field(42);
          const spy = vi.fn();
          field.watch(spy);
          field.setError("Something went wrong");
          setTimeout(() => {
            expect(spy).toHaveBeenCalledWith(
              42,
              expect.objectContaining({ changes: fieldChange.invalid })
            );
            resolve();
          });
        }));

      it("clearing triggers the valid update", () =>
        new Promise<void>((resolve) => {
          const field = new Field(42);
          const spy = vi.fn();
          field.watch(spy);
          field.setError("Something went wrong");
          field.setError();
          setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith(
              42,
              expect.objectContaining({ changes: fieldChange.valid })
            );
            resolve();
          });
        }));

      it("sets the error to the source field for computed fields", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        computed.setError("Something went wrong");
        expect(field.$.name.$.first.error).toEqual({
          message: "Something went wrong",
        });
        expect(computed.error).toBe(field.error);
      });
    });

    describe("invalids", () => {
      it("collects map all children errors", () => {
        const field = new Field({
          name: { first: "" },
          age: 370,
          ids: [123, 456],
        });
        field.setError("Something is wrong");
        field.$.age.setError("Are you an immortal?");
        field.$.name.$.first.setError("First name is required");
        field.$.ids.at(1).setError("Is it a valid ID?");
        const { invalids } = field;
        expect(invalids.size).toBe(4);
        // @ts-expect-error: [TODO]
        expect(invalids.get(field)).toEqual({ message: "Something is wrong" });
        // @ts-expect-error: [TODO]
        expect(invalids.get(field.$.age)).toEqual({
          message: "Are you an immortal?",
        });
        // @ts-expect-error: [TODO]
        expect(invalids.get(field.$.name.$.first)).toEqual({
          message: "First name is required",
        });
        // @ts-expect-error: [TODO]
        expect(invalids.get(field.$.ids.at(1))).toEqual({
          message: "Is it a valid ID?",
        });
      });

      it("returns the source field errors for computed fields", () => {
        const field = new Field({ name: { first: "", last: "" } });
        const computed = field.$.name.into(toFullName).from(fromFullName);
        field.$.name.$.first.setError("First name is required");
        field.$.name.$.last.setError("Last name is required");
        const { invalids } = computed;
        expect(invalids.size).toBe(2);
        // @ts-expect-error: [TODO]
        expect(invalids.get(field.$.name.$.first)).toEqual({
          message: "First name is required",
        });
        // @ts-expect-error: [TODO]
        expect(invalids.get(field.$.name.$.last)).toEqual({
          message: "Last name is required",
        });
      });
    });

    describe("valid", () => {
      it("is false if any of the children is invalid", () => {
        const field = new Field({
          name: { first: "" },
          age: 370,
          ids: [123, 456],
        });
        expect(field.valid).toBe(true);
        expect(field.$.name.valid).toBe(true);
        field.$.name.$.first.setError("First name is required");
        expect(field.valid).toBe(false);
        expect(field.$.name.valid).toBe(false);
        field.$.name.$.first.setError();
        expect(field.valid).toBe(true);
        expect(field.$.name.valid).toBe(true);
      });

      it("is false if the source field is invalid", () => {
        const field = new Field({ name: { first: "", last: "" } });
        const computed = field.$.name.into(toFullName).from(fromFullName);
        expect(computed.valid).toBe(true);
        field.$.name.$.first.setError("First name is required");
        field.$.name.$.last.setError("Last name is required");
        expect(computed.valid).toBe(false);
      });
    });

    describe("expunge", () => {
      it("clears all errors", () => {
        const field = new Field({
          name: { first: "" },
          age: 370,
          ids: [123, 456],
        });
        field.setError("Something is wrong");
        field.$.age.setError("Are you an immortal?");
        field.$.name.$.first.setError("First name is required");
        field.$.ids.at(1).setError("Is it a valid ID?");
        expect(field.valid).toBe(false);
        expect(field.invalids.size).toBe(4);
        field.expunge();
        expect(field.invalids.size).toBe(0);
        expect(field.valid).toBe(true);
      });
    });
  });

  describe("validation", () => {
    describe("primitive", () => {
      it("allows to validate the state", () => {
        const field = new Field(42);
        field.validate((ref) => {
          if (ref.get() !== 43) {
            ref.setError("Invalid");
          }
        });
        expect(field.valid).toBe(false);
        expect(field.error).toEqual({ message: "Invalid" });
      });

      it("clears previous errors on validation", () => {
        function validateNum(ref: FieldRef<number>) {
          if (ref.get() !== 43) {
            ref.setError("Invalid");
          }
        }
        const field = new Field(42);
        field.validate(validateNum);
        field.set(43);
        field.validate(validateNum);
        expect(field.valid).toBe(true);
      });
    });

    describe("object", () => {
      it("allows to validate the state", () => {
        const field = new Field<Name>({ first: "" });

        field.validate(validateName);

        expect(field.valid).toBe(false);
        expect(field.$.first.error).toEqual({ message: "Required" });
        expect(field.$.last.error).toEqual({ message: "Required" });
      });

      it("clears previous errors on validation", () => {
        const field = new Field<Name>({ first: "" });

        field.validate(validateName);

        expect(field.valid).toBe(false);
        expect(field.$.first.error).toEqual({ message: "Required" });
        expect(field.$.last.error).toEqual({ message: "Required" });

        field.set({ first: "Sasha", last: "Koss" });
        field.validate(validateName);

        expect(field.valid).toBe(true);
        expect(field.$.first.error).toBe(undefined);
        expect(field.$.last.error).toBe(undefined);
      });

      it("sends a single watch event on validation", async () => {
        const field = new Field<Name>({ first: "" });

        const fieldSpy = vi.fn();
        const nameSpy = vi.fn();
        field.watch(fieldSpy);
        field.$.first.watch(nameSpy);

        await field.validate(validateName);

        expect(fieldSpy).toHaveBeenCalledOnce();
        expect(fieldSpy).toHaveBeenCalledWith(
          { first: "" },
          expect.objectContaining({ changes: fieldChange.child })
        );

        expect(nameSpy).toHaveBeenCalledOnce();
        expect(nameSpy).toHaveBeenCalledWith(
          "",
          expect.objectContaining({ changes: fieldChange.invalid })
        );
      });

      it("allows to iterate the fields", () => {
        const field = new Field<{ first: string; last?: string | undefined }>({
          first: "",
          last: undefined,
        });
        field.validate((ref) => {
          ref.forEach((valueRef, key) => {
            if (!valueRef.get()?.trim()) {
              valueRef.setError("Required");
            }
          });
        });
        expect(field.valid).toBe(false);
        expect(field.$.first.error).toEqual({ message: "Required" });
        expect(field.$.last.error).toEqual({ message: "Required" });
      });

      it("allows to validate records", () => {
        const field = new Field<Record<string, number>>({
          one: 1,
          two: 2,
        });
        field.validate((ref) => {
          ref.at("two").setError("Invalid");
        });
        expect(field.valid).toBe(false);
        expect(field.at("two").error).toEqual({ message: "Invalid" });
      });
    });
  });
});

interface Name {
  first: string;
  last?: string | undefined;
}

function toFullName(name: Required<Name>) {
  return `${name.first} ${name.last}`;
}

function fromFullName(fullName: string) {
  const [first = "", last = ""] = fullName.split(" ");
  return { first, last };
}

function toCodes(message: string) {
  return Array.from(message).map((c) => c.charCodeAt(0));
}

function fromCodes(codes: number[]) {
  return codes.map((c) => String.fromCharCode(c)).join("");
}

const field = new Field<Name>({ first: "" });

function validateRequired(ref: FieldRef.Variable<string | undefined>) {
  if (!ref.get()?.trim()) ref.setError("Required");
}

function validateName(ref: FieldRef<Name>) {
  validateRequired(ref.$.first);
  validateRequired(ref.$.last);
}
