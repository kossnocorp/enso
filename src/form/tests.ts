import { assert, describe, expect, it, vi } from "vitest";
import { Field } from "./index.tsx";
import { StateChangeType, undefinedValue } from "../state/index.ts";

describe("form", () => {
  describe("Field", () => {
    it("creates a field instance", () => {
      const field = new Field(42);
      expect(field.get()).toBe(42);
    });

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
          expect(field.set(43)).toBe(StateChangeType.Value);
        });

        it("returns value change type if the field has changed", () => {
          const field = new Field<number | string>(42);
          expect(field.set("42")).toBe(StateChangeType.Type);
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
          expect(field.set({ num: 43 })).toBe(StateChangeType.Child);
        });

        it("returns added change type if a child has been added", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          expect(field.set({ num: 42, str: "hello" })).toBe(
            StateChangeType.ChildAdded
          );
        });

        it("returns remove change type if a child has been removed", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          expect(field.set({})).toBe(StateChangeType.ChildRemoved);
        });

        it("returns combined change type", () => {
          const field = new Field<{
            num?: number;
            str?: string;
            bool?: boolean;
          }>({ num: 42, str: "hello" });
          const changed = field.set({ num: 43, bool: true });
          expect(changed & StateChangeType.Child).toBe(StateChangeType.Child);
          expect(changed & StateChangeType.ChildAdded).toBe(
            StateChangeType.ChildAdded
          );
          expect(changed & StateChangeType.ChildRemoved).toBe(
            StateChangeType.ChildRemoved
          );
        });

        it("does not trigger fields updates when removing", () => {
          const field = new Field<{ num?: number; str?: string }>({ num: 42 });
          const spy = vi.fn();
          field.$.num?.watch(spy);
          field.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ detail: StateChangeType.Value })
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
            expect.objectContaining({ detail: StateChangeType.Value })
          );
          field.set({ str: "hello" });
          field.set({ num: 44, str: "hello" });
          const numB = field.$.num;
          expect(numA).toBeInstanceOf(Field);
          expect(numA).toBe(numB);
          expect(spy).toHaveBeenCalledWith(
            44,
            expect.objectContaining({
              detail: StateChangeType.Type | StateChangeType.Created,
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
            expect.objectContaining({ detail: StateChangeType.Value })
          );
          field.set({ str: "hello" });
          field.set({ num: undefined, str: "hello" });
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              detail: StateChangeType.Created,
            })
          );
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
          expect(field.set([1, 2, 1])).toBe(StateChangeType.Child);
        });

        it("returns added change type if a child has been added", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2, 3, 4])).toBe(StateChangeType.ChildAdded);
        });

        it("returns remove change type if a child has been removed", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2])).toBe(StateChangeType.ChildRemoved);
        });

        it("returns combined change type", () => {
          const field = new Field([1, 2]);
          const arr = [0, 2, 3];
          delete arr[1];
          const changed = field.set(arr);
          expect(changed & StateChangeType.Child).toBe(StateChangeType.Child);
          expect(changed & StateChangeType.ChildAdded).toBe(
            StateChangeType.ChildAdded
          );
          expect(changed & StateChangeType.ChildRemoved).toBe(
            StateChangeType.ChildRemoved
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
              detail: StateChangeType.Value,
            })
          );
          field.set([1, 2]);
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed items", () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = field.$(2);
          itemA.watch(spy);
          field.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ detail: StateChangeType.Value })
          );
          field.set([1, 2]);
          field.set([1, 2, 333]);
          const itemB = field.$(2);
          expect(itemA).toBeInstanceOf(Field);
          expect(itemA).toBe(itemB);
          expect(spy).toHaveBeenCalledWith(
            333,
            expect.objectContaining({
              detail: StateChangeType.Type | StateChangeType.Created,
            })
          );
        });

        it("indicates no type change on adding undefined", () => {
          const field = new Field<Array<number | undefined>>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = field.$(2);
          itemA.watch(spy);
          field.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ detail: StateChangeType.Value })
          );
          field.set([1, 2]);
          field.set([1, 2, undefined]);
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              detail: StateChangeType.Created,
            })
          );
        });

        it("does not trigger update when setting undefined value to undefined value", () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          // @ts-ignore: This is fine
          expect(field.$(5).set(undefinedValue)).toBe(0);
        });
      });
    });

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

      it("provides event object with change type as detail", async () =>
        new Promise<void>((resolve) => {
          const field = new Field(42);

          const unsub = field.watch((value, event) => {
            expect(event.detail).toBe(StateChangeType.Value);
            unsub();
            resolve();
          });

          field.set(43);
        }));

      describe("object", () => {
        it("listens to the field changes", async () =>
          new Promise<void>((resolve) => {
            const field = new Field({ num: 42 });

            const unsub = field.watch((value) => {
              expect(value.num).toBe(43);
              unsub();
              resolve();
            });

            field.$.num.set(43);
          }));

        it("listens to fields create", async () =>
          new Promise<void>((resolve) => {
            const field = new Field<{ num: number; str?: string }>({ num: 42 });

            const unsub = field.watch((value) => {
              expect(value.str).toBe("Hello!");
              unsub();
              resolve();
            });

            field.$.str.set("Hello!");
          }));
      });

      describe("array", () => {
        it("listens to the item field changes", async () =>
          new Promise<void>((resolve) => {
            const field = new Field([1, 2, 3]);

            const unsub = field.watch((value) => {
              expect(value[1]).toBe(43);
              unsub();
              resolve();
            });

            field.$(1).set(43);
          }));

        it("listens to items create", async () =>
          new Promise<void>((resolve) => {
            const field = new Field([1, 2, 3]);

            const unsub = field.watch((value) => {
              expect(value[5]).toBe(43);
              unsub();
              resolve();
            });

            field.$(5).set(43);
          }));
      });
    });

    describe("id", () => {
      it("assigns a unique id to each field", () => {
        const field1 = new Field(42);
        const field2 = new Field(42);
        expect(field1.id).toBeTypeOf("string");
        expect(field1.id).not.toBe(field2.id);
      });
    });

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
          numA satisfies Field<number> | undefined;
          expect(numA?.get()).toBe(42);
          const numB = field.$("num");
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
          item satisfies Field<number> | undefined;
          expect(item).toBeInstanceOf(Field);
          expect(item?.get()).toBe(4);
        });

        it("preserves items", () => {
          const field = new Field([1, 2, 3, 4]);
          const itemA = field.$[3];
          const itemB = field.$[3];
          itemA satisfies Field<number> | undefined;
          expect(itemA).toBeInstanceOf(Field);
          expect(itemA).toBe(itemB);
        });

        it("allows to access undefined items", () => {
          const field = new Field([1, 2, 3, 4]);
          const item = field.$(10);
          item satisfies Field<number | undefined>;
          expect(item).toBeInstanceOf(Field);
          expect(item.get()).toBe(undefined);
        });

        it("preserves undefined items", () => {
          const field = new Field([1, 2, 3, 4]);
          const itemA = field.$(10);
          const itemB = field.$(10);
          expect(itemA).toBe(itemB);
        });
      });
    });

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

      function toCodes(message: string) {
        return Array.from(message).map((c) => c.charCodeAt(0));
      }

      function fromCodes(codes: number[]) {
        return codes.map((c) => String.fromCharCode(c)).join("");
      }
    });
  });
});
