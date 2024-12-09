import { assert, describe, expect, it, vi } from "vitest";
import { State, stateChangeType, undefinedValue } from "./index.tsx";

describe("State", () => {
  it("creates a state instance", () => {
    const state = new State(42);
    expect(state.get()).toBe(42);
  });

  describe("attributes", () => {
    describe("id", () => {
      it("assigns a unique id to each state", () => {
        const state1 = new State(42);
        const state2 = new State(42);
        expect(state1.id).toBeTypeOf("string");
        expect(state1.id).not.toBe(state2.id);
      });

      it("returns the source id for computed states", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.id).toBe(state.$.name.$.first.id);
      });
    });

    describe("key", () => {
      it("returns the state key", () => {
        const state = new State({ name: { first: "Sasha" } });
        expect(state.$.name.$.first.key).toBe("first");
      });

      it("returns undefined for root state", () => {
        const state = new State({ name: { first: "Sasha" } });
        expect(state.key).toBe(undefined);
      });

      it("returns the source key for computed states", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.key).toBe("first");
      });
    });

    describe("path", () => {
      it("returns tha path to the state", () => {
        const state = new State({ address: { name: { first: "Sasha" } } });
        expect(state.$.address.$.name.$.first.path).toEqual([
          "address",
          "name",
          "first",
        ]);
      });

      it("returns empty array for root state", () => {
        const state = new State({ name: { first: "Sasha" } });
        expect(state.path).toEqual([]);
      });

      it("returns the source path for computed states", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.path).toEqual(["name", "first"]);
      });
    });

    describe("parent", () => {
      it("returns the parent state", () => {
        const state = new State({ name: { first: "Sasha" } });
        expect(state.$.name.$.first.parent).toBe(state.$.name);
      });

      it("returns undefined for root state", () => {
        const state = new State({ name: { first: "Sasha" } });
        expect(state.parent).toBe(undefined);
      });

      it("returns the source parent for computed states", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.parent).toBe(state.$.name);
      });
    });
  });

  describe("value", () => {
    describe("set", () => {
      describe("primitive", () => {
        it("sets a new state", () => {
          const state = new State(42);
          state.set(43);
          expect(state.get()).toBe(43);
        });

        it("returns 0 if the state has not changed", () => {
          const state = new State(42);
          expect(state.set(42)).toBe(0);
        });

        it("returns value change type if the state has changed", () => {
          const state = new State(42);
          expect(state.set(43)).toBe(stateChangeType.value);
        });

        it("returns value change type if the state has changed", () => {
          const state = new State<number | string>(42);
          expect(state.set("42")).toBe(stateChangeType.type);
        });
      });

      describe("object", () => {
        it("sets the object state", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          state.set({ num: 43 });
          expect(state.get()).toEqual({ num: 43 });
          state.set({ num: 44, str: "hello" });
          expect(state.get()).toEqual({ num: 44, str: "hello" });
          state.set({ str: "world" });
          expect(state.get()).toEqual({ str: "world" });
          state.set({});
          expect(state.get()).toEqual({});
        });

        it("returns 0 if the state has not changed", () => {
          const state = new State({ num: 42 });
          expect(state.set({ num: 42 })).toBe(0);
        });

        it("returns child change type if a child state has changed", () => {
          const state = new State({ num: 42 });
          expect(state.set({ num: 43 })).toBe(stateChangeType.child);
        });

        it("returns added change type if a child has been added", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          expect(state.set({ num: 42, str: "hello" })).toBe(
            stateChangeType.childAdded
          );
        });

        it("returns remove change type if a child has been removed", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          expect(state.set({})).toBe(stateChangeType.childRemoved);
        });

        it("returns combined change type", () => {
          const state = new State<{
            num?: number;
            str?: string;
            bool?: boolean;
          }>({ num: 42, str: "hello" });
          const change = state.set({ num: 43, bool: true });
          expect(change & stateChangeType.child).toBe(stateChangeType.child);
          expect(change & stateChangeType.childAdded).toBe(
            stateChangeType.childAdded
          );
          expect(change & stateChangeType.childRemoved).toBe(
            stateChangeType.childRemoved
          );
        });

        it("does not trigger states updates when removing", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          const spy = vi.fn();
          state.$.num?.watch(spy);
          state.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ detail: stateChangeType.value })
          );
          state.set({ str: "hello" });
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed states", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          const spy = vi.fn();
          const numA = state.$.num;
          numA?.watch(spy);
          state.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ detail: stateChangeType.value })
          );
          state.set({ str: "hello" });
          state.set({ num: 44, str: "hello" });
          const numB = state.$.num;
          expect(numA).toBeInstanceOf(State);
          expect(numA).toBe(numB);
          expect(spy).toHaveBeenCalledWith(
            44,
            expect.objectContaining({
              detail: stateChangeType.type | stateChangeType.created,
            })
          );
        });

        it("indicates no type change on adding undefined", () => {
          const state = new State<{ num?: number | undefined; str?: string }>({
            num: 42,
          });
          const spy = vi.fn();
          const numA = state.$.num;
          numA?.watch(spy);
          state.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ detail: stateChangeType.value })
          );
          state.set({ str: "hello" });
          state.set({ num: undefined, str: "hello" });
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              detail: stateChangeType.created,
            })
          );
        });
      });

      describe("array", () => {
        it("sets the array state", () => {
          const state = new State<number[]>([1, 2, 3, 4, 5]);
          state.set([1, 2, 3]);
          expect(state.get()).toEqual([1, 2, 3]);
          state.set([1, 2, 3, 4]);
          expect(state.get()).toEqual([1, 2, 3, 4]);
          const arr = new Array(5);
          arr[3] = 5;
          state.set(arr);
          expect(state.get()).toEqual(arr);
          state.set([]);
          expect(state.get()).toEqual([]);
        });

        it("returns 0 if the state has not changed", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2, 3])).toBe(0);
        });

        it("returns child change type if a child state has changed", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2, 1])).toBe(stateChangeType.child);
        });

        it("returns added change type if a child has been added", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2, 3, 4])).toBe(stateChangeType.childAdded);
        });

        it("returns remove change type if a child has been removed", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2])).toBe(stateChangeType.childRemoved);
        });

        it("returns combined change type", () => {
          const state = new State([1, 2]);
          const arr = [0, 2, 3];
          delete arr[1];
          const change = state.set(arr);
          expect(change & stateChangeType.child).toBe(stateChangeType.child);
          expect(change & stateChangeType.childAdded).toBe(
            stateChangeType.childAdded
          );
          expect(change & stateChangeType.childRemoved).toBe(
            stateChangeType.childRemoved
          );
        });

        it("does not trigger item updates when removing", () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          state.$[2]?.watch(spy);
          state.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({
              detail: stateChangeType.value,
            })
          );
          state.set([1, 2]);
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed items", () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = state.$(2);
          itemA.watch(spy);
          state.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ detail: stateChangeType.value })
          );
          state.set([1, 2]);
          state.set([1, 2, 333]);
          const itemB = state.$(2);
          expect(itemA).toBeInstanceOf(State);
          expect(itemA).toBe(itemB);
          expect(spy).toHaveBeenCalledWith(
            333,
            expect.objectContaining({
              detail: stateChangeType.type | stateChangeType.created,
            })
          );
        });

        it("indicates no type change on adding undefined", () => {
          const state = new State<Array<number | undefined>>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = state.$(2);
          itemA.watch(spy);
          state.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ detail: stateChangeType.value })
          );
          state.set([1, 2]);
          state.set([1, 2, undefined]);
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              detail: stateChangeType.created,
            })
          );
        });

        it("does not trigger update when setting undefined value to undefined value", () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          // @ts-ignore: This is fine
          expect(state.$(5).set(undefinedValue)).toBe(0);
        });
      });
    });

    describe("initial", () => {
      it("returns the initial state", () => {
        const state = new State(42);
        state.set(43);
        expect(state.initial).toBe(42);
      });

      it("preserves the initial value on type change", () => {
        const state = new State<number | object>(42);
        state.set({ hello: "world" });
        expect(state.initial).toBe(42);
      });
    });

    describe("dirty", () => {
      describe("primitive", () => {
        it("returns true if the state has changed", () => {
          const state = new State(42);
          expect(state.dirty).toBe(false);
          state.set(43);
          expect(state.dirty).toBe(true);
        });

        it("returns false after restoring to the initial value", () => {
          const state = new State(42);
          expect(state.dirty).toBe(false);
          state.set(43);
          state.set(42);
          expect(state.dirty).toBe(false);
        });
      });

      describe("object", () => {
        it("returns true if any of the children has changed", () => {
          const state = new State({ name: { first: "Alexander", last: "" } });
          expect(state.dirty).toBe(false);
          expect(state.$.name.dirty).toBe(false);
          expect(state.$.name.$.first.dirty).toBe(false);
          expect(state.$.name.$.last.dirty).toBe(false);
          state.$.name.$.first.set("Sasha");
          expect(state.dirty).toBe(true);
          expect(state.$.name.dirty).toBe(true);
          expect(state.$.name.$.first.dirty).toBe(true);
          expect(state.$.name.$.last.dirty).toBe(false);
        });

        it("returns false after restoring to the initial value", () => {
          const state = new State({ name: { first: "Alexander", last: "" } });
          state.$.name.$.first.set("Sasha");
          state.$.name.$.first.set("Alexander");
          expect(state.dirty).toBe(false);
          expect(state.$.name.dirty).toBe(false);
          expect(state.$.name.$.first.dirty).toBe(false);
          expect(state.$.name.$.last.dirty).toBe(false);
        });

        it("returns true if a child changed type", () => {
          const state = new State<{
            name: { first: string; last: string } | string;
          }>({ name: { first: "Alexander", last: "" } });
          expect(state.dirty).toBe(false);
          expect(state.$.name.dirty).toBe(false);
          state.$.name.set("Alexander");
          expect(state.dirty).toBe(true);
          expect(state.$.name.dirty).toBe(true);
        });

        it("returns true if a child changed shape", () => {
          const state = new State<{
            name: { first?: string; last?: string };
          }>({ name: { first: "Alexander" } });
          expect(state.dirty).toBe(false);
          expect(state.$.name.dirty).toBe(false);
          state.$.name.set({ last: "Koss" });
          expect(state.dirty).toBe(true);
          expect(state.$.name.dirty).toBe(true);
          expect(state.$.name.$.last.dirty).toBe(false);
        });
      });

      describe("array", () => {
        it("returns true if any of the items has changed", () => {
          const state = new State<number[][]>([[1, 2], [3]]);
          expect(state.dirty).toBe(false);
          expect(state.$(0).dirty).toBe(false);
          expect(state.try(0)?.try(0)?.dirty).toBe(false);
          expect(state.try(0)?.try(1)?.dirty).toBe(false);
          expect(state.try(1)?.try(0)?.dirty).toBe(false);
          state.try(1)?.$(0).set(5);
          expect(state.dirty).toBe(true);
          expect(state.try(0)?.dirty).toBe(false);
          expect(state.try(0)?.try(0)?.dirty).toBe(false);
          expect(state.try(0)?.try(1)?.dirty).toBe(false);
          expect(state.try(1)?.try(0)?.dirty).toBe(true);
        });

        it("returns false after restoring to the initial value", () => {
          const state = new State<number[][]>([[1, 2], [3]]);
          state.try(1)?.$(0).set(5);
          state.try(1)?.$(0).set(3);
          expect(state.dirty).toBe(false);
          expect(state.try(0)?.dirty).toBe(false);
          expect(state.try(0)?.try(0)?.dirty).toBe(false);
          expect(state.try(0)?.try(1)?.dirty).toBe(false);
          expect(state.try(1)?.try(0)?.dirty).toBe(false);
        });

        it("returns true if a child changed type", () => {
          const state = new State<Array<string | object>>(["hello", {}]);
          expect(state.dirty).toBe(false);
          state.$(0).set({});
          expect(state.dirty).toBe(true);
          expect(state.$(0).dirty).toBe(true);
          expect(state.$(1).dirty).toBe(false);
        });

        it("returns true if a child changed shape", () => {
          const state = new State<Array<{ first?: string; last?: string }>>([
            { first: "Alexander" },
            { first: "Sasha" },
          ]);
          expect(state.dirty).toBe(false);
          state.$(0).set({ last: "Koss" });
          expect(state.dirty).toBe(true);
          expect(state.$(0).dirty).toBe(true);
          expect(state.$(1).dirty).toBe(false);
        });
      });

      describe("computed", () => {
        it("returns true if the source state has changed", () => {
          const state = new State<string | undefined>("Hello");
          const computed = state.into(toString).from(fromString);
          expect(computed.dirty).toBe(false);
          state.set("Hi");
          expect(computed.dirty).toBe(true);
        });

        it("returns false if the source state didn't change", () => {
          const state = new State<string | undefined>(undefined);
          const computed = state.into(toString).from(fromString);
          expect(computed.dirty).toBe(false);
          state.set(" ");
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
  });

  describe("tree", () => {
    describe("$", () => {
      it("points to itself for a primitive", () => {
        const state = new State(42);
        expect(state.$).toBe(state);
      });

      describe("object", () => {
        it("allows to access states", () => {
          const state = new State({ num: 42 });
          const num = state.$.num;
          num satisfies State<number>;
          expect(num).toBeInstanceOf(State);
          expect(num.get()).toBe(42);
        });

        it("allows to access record states", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          const numA = state.$["num"];
          numA satisfies State<number | undefined> | undefined;
          expect(numA?.get()).toBe(42);
          const numB = state.$("num");
          numB satisfies State<number | undefined>;
          expect(numB.get()).toBe(42);
        });

        it("preserves states", () => {
          const state = new State({ num: 42 });
          const numA = state.$.num;
          const numB = state.$.num;
          numA satisfies State<number>;
          expect(numA).toBeInstanceOf(State);
          expect(numA).toBe(numB);
        });

        it("allows to access undefined states", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          const str = state.$.str;
          str satisfies State<string | undefined>;
          expect(str).toBeInstanceOf(State);
          expect(str.get()).toBe(undefined);
        });

        it("preserves undefined states", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          const stateA = state.$.str;
          const stateB = state.$.str;
          expect(stateA).toBe(stateB);
        });
      });

      describe("array", () => {
        it("allows to access items", () => {
          const state = new State([1, 2, 3, 4]);
          const item = state.$[3];
          item satisfies State<number | undefined> | undefined;
          expect(item).toBeInstanceOf(State);
          expect(item?.get()).toBe(4);
        });

        it("preserves items", () => {
          const state = new State([1, 2, 3, 4]);
          const itemA = state.$[3];
          const itemB = state.$[3];
          itemA satisfies State<number | undefined> | undefined;
          expect(itemA).toBeInstanceOf(State);
          expect(itemA).toBe(itemB);
        });

        it("allows to access undefined items", () => {
          const state = new State([1, 2, 3, 4]);
          const item = state.$(10);
          item satisfies State<number | undefined>;
          expect(item).toBeInstanceOf(State);
          expect(item.get()).toBe(undefined);
        });

        it("preserves undefined items", () => {
          const state = new State([1, 2, 3, 4]);
          const itemA = state.$(10);
          const itemB = state.$(10);
          expect(itemA).toBe(itemB);
        });
      });
    });

    describe("try", () => {
      describe("primitive", () => {
        it("returns the state if it's defined", () => {
          const state = new State<string | number | undefined>(42);
          const num = state.try;
          num satisfies State<string | number> | undefined;
          expect(num).toBe(state);
          expect(num).toBeInstanceOf(State);
          expect(num?.get()).toBe(42);
        });

        it("returns undefined if state doesn't exist", () => {
          const state = new State<string | number | undefined>(
            undefinedValue as any
          );
          const num = state.try;
          expect(num).toBe(undefined);
        });

        it("returns undefined/null if state is undefined/null", () => {
          const undefinedState = new State<string | undefined>(undefined);
          expect(undefinedState.try).toBe(undefined);
          const nullState = new State<string | null>(null);
          nullState.try satisfies State<string> | null;
          expect(nullState.try).toBe(null);
        });
      });

      describe("object", () => {
        it("returns the field if it exists", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          const num = state.try("num");
          num satisfies State<number> | undefined;
          expect(num).toBeInstanceOf(State);
          expect(num?.get()).toBe(42);
        });

        it("returns undefined if field doesn't exist", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          const bum = state.try("bum");
          expect(bum).toBe(undefined);
        });

        it("returns undefined/null if field is undefined/null", () => {
          const state = new State<Record<string, number | undefined | null>>({
            num: 42,
            bum: undefined,
            hum: null,
          });
          state.try("bum") satisfies State<number> | undefined | null;
          expect(state.try("bum")).toBe(undefined);
          expect(state.try("hum")).toBe(null);
        });
      });

      describe("array", () => {
        it("returns the item if it exists", () => {
          const state = new State<Array<number>>([1, 2, 3]);
          const num = state.try(1);
          num satisfies State<number> | undefined;
          expect(num).toBeInstanceOf(State);
          expect(num?.get()).toBe(2);
        });

        it("returns undefined if item doesn't exist", () => {
          const state = new State<Array<number>>([1, 2, 3]);
          const num = state.try(5);
          expect(num).toBe(undefined);
        });

        it("returns undefined/null if item is undefined/null", () => {
          const state = new State<Array<number | undefined | null>>([
            1,
            undefined,
            null,
          ]);
          state.try(0) satisfies State<number> | undefined | null;
          expect(state.try(1)).toBe(undefined);
          expect(state.try(2)).toBe(null);
        });
      });
    });
  });

  describe("watching", () => {
    describe("watch", () => {
      it("allows to subscribe for state changes", async () =>
        new Promise<void>((resolve) => {
          const state = new State(42);

          const unsub = state.watch((value) => {
            expect(value).toBe(43);
            unsub();
            // Check if the callback is not called after unsub
            state.set(44);
            setTimeout(resolve);
          });

          state.set(43);
        }));

      it("provides event object with change type as detail", async () =>
        new Promise<void>((resolve) => {
          const state = new State(42);

          const unsub = state.watch((value, event) => {
            expect(event.detail).toBe(stateChangeType.value);
            unsub();
            resolve();
          });

          state.set(43);
        }));

      describe("object", () => {
        it("listens to the state changes", async () =>
          new Promise<void>((resolve) => {
            const state = new State({ num: 42 });

            const unsub = state.watch((value) => {
              expect(value.num).toBe(43);
              unsub();
              resolve();
            });

            state.$.num.set(43);
          }));

        it("listens to states create", async () =>
          new Promise<void>((resolve) => {
            const state = new State<{ num: number; str?: string }>({
              num: 42,
            });

            const unsub = state.watch((value) => {
              expect(value.str).toBe("Hello!");
              unsub();
              resolve();
            });

            state.$.str.set("Hello!");
          }));
      });

      describe("array", () => {
        it("listens to the item state changes", async () =>
          new Promise<void>((resolve) => {
            const state = new State([1, 2, 3]);

            const unsub = state.watch((value) => {
              expect(value[1]).toBe(43);
              unsub();
              resolve();
            });

            state.$(1).set(43);
          }));

        it("listens to items create", async () =>
          new Promise<void>((resolve) => {
            const state = new State([1, 2, 3]);

            const unsub = state.watch((value) => {
              expect(value[5]).toBe(43);
              unsub();
              resolve();
            });

            state.$(5).set(43);
          }));
      });
    });

    describe("unwatch", () => {
      it("unsubscribes all watchers", () => {
        const state = new State(42);
        const spy = vi.fn();
        state.watch(spy);
        state.unwatch();
        state.set(43);
        expect(spy).not.toHaveBeenCalled();
      });

      it("unsubscribes all children", () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.$.num?.watch(spy);
        state.unwatch();
        state.$.num?.set(43);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe("trigger", () => {
      it("triggers the watchers", () => {
        const state = new State(42);
        const spy = vi.fn();
        state.watch(spy);
        state.trigger(stateChangeType.value);
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ detail: stateChangeType.value })
        );
      });

      it("doesn't trigger parent states", () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.watch(spy);
        state.$.num.trigger(stateChangeType.value);
        expect(spy).not.toHaveBeenCalled();
      });

      it("allows to notify parent states", () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.watch(spy);
        state.$.num.trigger(stateChangeType.value, true);
        expect(spy).toHaveBeenCalledWith(
          { num: 42 },
          expect.objectContaining({ detail: stateChangeType.child })
        );
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

      it("allows to discriminate the state type", () => {
        const state = new State<Cat | Dog>({ type: "cat", meow: true });
        const discriminated = state.discriminate("type");
        if (discriminated.discriminator === "cat") {
          expect(discriminated.state.get().meow).toBe(true);
          return;
        }
        assert(false, "Should not reach here");
      });

      it("handles undefineds", () => {
        const state = new State<Cat | Dog | undefined>(undefined);
        const discriminated = state.discriminate("type");
        if (!discriminated.discriminator) {
          expect(discriminated.state.get()).toBe(undefined);
          return;
        }
        assert(false, "Should not reach here");
      });
    });

    describe("decompose", () => {
      it("allows to decompose the state type", () => {
        const state = new State<string | number | Record<string, number>>(
          "Hello, world!"
        );
        const decomposed = state.decompose();
        if (typeof decomposed.value === "string") {
          expect(decomposed.state.get()).toBe("Hello, world!");
          return;
        }
        assert(false, "Should not reach here");
      });
    });

    describe("narrow", () => {
      it("allows to narrow the state type", () => {
        const state = new State<string | number>("Hello, world!");
        const narrowed = state.narrow(
          (value, ok) => typeof value === "string" && ok(value)
        );
        narrowed satisfies State<string> | undefined;
        expect(narrowed?.get()).toBe("Hello, world!");
      });
    });

    describe("into", () => {
      it("allows to create a computed state", () => {
        const state = new State({ message: "Hello, world!" });
        const computed = state.$.message.into(toCodes).from(fromCodes);
        expect(computed.get()).toEqual([
          72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33,
        ]);
      });

      it("updates the state back from computed", () => {
        const state = new State({ message: "Hello, world!" });
        const computed = state.$.message.into(toCodes).from(fromCodes);
        computed.set([72, 105, 33]);
        expect(state.get()).toEqual({ message: "Hi!" });
      });

      it("triggers state update", async () =>
        new Promise<void>((resolve) => {
          const state = new State({ message: "Hello, world!" });
          const computed = state.$.message.into(toCodes).from(fromCodes);

          const unsub = state.$.message.watch((value) => {
            expect(value).toBe("Hi!");
            unsub();
            resolve();
          });

          computed.set([72, 105, 33]);
        }));
    });
  });

  describe("array", () => {
    describe("length", () => {
      it("returns the length of the array", () => {
        const state = new State([1, 2, 3]);
        expect(state.length).toBe(3);
      });
    });

    describe("forEach", () => {
      it("iterates the array", () => {
        const state = new State([1, 2, 3]);
        const mapped: number[] = [];
        state.forEach((item, index) => mapped.push(item.get() * index));
        expect(mapped).toEqual([0, 2, 6]);
      });
    });

    describe("map", () => {
      it("maps the array", () => {
        const state = new State([1, 2, 3]);
        const mapped = state.map((item, index) => item.get() * index);
        expect(mapped).toEqual([0, 2, 6]);
      });
    });

    describe("push", () => {
      it("adds an item to the end of the array", () => {
        const state = new State([1, 2, 3]);
        state.push(4);
        expect(state.get()).toEqual([1, 2, 3, 4]);
      });

      it("returns the new length of the array", () => {
        const state = new State([1, 2, 3]);
        expect(state.push(4)).toBe(4);
      });
    });
  });

  describe("input", () => {
    describe("input", () => {
      it("generates props for a state", () => {
        const state = new State({ name: { first: "Alexander" } });
        const props = state.$.name.$.first.input();
        expect(props.name).toEqual("name.first");
        expect(props.ref).toBe(state.$.name.$.first.ref);
      });

      it("assigns . name for the root state", () => {
        const state = new State({ name: { first: "Alexander" } });
        const props = state.input();
        expect(props.name).toEqual(".");
      });
    });
  });

  describe("errors", () => {
    describe("setError", () => {
      it("assigns an error to the state", () => {
        const state = new State(42);
        state.setError("Something went wrong");
        expect(state.error).toEqual({ message: "Something went wrong" });
      });

      it("allows to pass error object", () => {
        const state = new State(42);
        state.setError({ type: "internal", message: "Something went wrong" });
        expect(state.error).toEqual({
          type: "internal",
          message: "Something went wrong",
        });
      });

      it("allows to clear the error", () => {
        const state = new State(42);
        state.setError("Something went wrong");
        state.setError();
        expect(state.error).toBe(undefined);
      });

      it("triggers the invalid update", () =>
        new Promise<void>((resolve) => {
          const state = new State(42);
          const spy = vi.fn();
          state.watch(spy);
          state.setError("Something went wrong");
          setTimeout(() => {
            expect(spy).toHaveBeenCalledWith(
              42,
              expect.objectContaining({ detail: stateChangeType.invalid })
            );
            resolve();
          });
        }));

      it("clearing triggers the valid update", () =>
        new Promise<void>((resolve) => {
          const state = new State(42);
          const spy = vi.fn();
          state.watch(spy);
          state.setError("Something went wrong");
          state.setError();
          setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(2);
            expect(spy).toHaveBeenCalledWith(
              42,
              expect.objectContaining({ detail: stateChangeType.valid })
            );
            resolve();
          });
        }));

      it("sets the error to the source state for computed states", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        computed.setError("Something went wrong");
        expect(state.$.name.$.first.error).toEqual({
          message: "Something went wrong",
        });
        expect(computed.error).toBe(state.error);
      });
    });

    describe("invalids", () => {
      it("collects map all children errors", () => {
        const state = new State({
          name: { first: "" },
          age: 370,
          ids: [123, 456],
        });
        state.setError("Something is wrong");
        state.$.age.setError("Are you an immortal?");
        state.$.name.$.first.setError("First name is required");
        state.$.ids.$(1).setError("Is it a valid ID?");
        const { invalids } = state;
        expect(invalids.size).toBe(4);
        // @ts-ignore: [TODO]
        expect(invalids.get(state)).toEqual({ message: "Something is wrong" });
        // @ts-ignore: [TODO]
        expect(invalids.get(state.$.age)).toEqual({
          message: "Are you an immortal?",
        });
        // @ts-ignore: [TODO]
        expect(invalids.get(state.$.name.$.first)).toEqual({
          message: "First name is required",
        });
        // @ts-ignore: [TODO]
        expect(invalids.get(state.$.ids.$(1))).toEqual({
          message: "Is it a valid ID?",
        });
      });

      it("returns the source state errors for computed states", () => {
        const state = new State({ name: { first: "", last: "" } });
        const computed = state.$.name.into(toFullName).from(fromFullName);
        state.$.name.$.first.setError("First name is required");
        state.$.name.$.last.setError("Last name is required");
        const { invalids } = computed;
        expect(invalids.size).toBe(2);
        // @ts-ignore: [TODO]
        expect(invalids.get(state.$.name.$.first)).toEqual({
          message: "First name is required",
        });
        // @ts-ignore: [TODO]
        expect(invalids.get(state.$.name.$.last)).toEqual({
          message: "Last name is required",
        });
      });
    });

    describe("valid", () => {
      it("is false if any of the children is invalid", () => {
        const state = new State({
          name: { first: "" },
          age: 370,
          ids: [123, 456],
        });
        expect(state.valid).toBe(true);
        expect(state.$.name.valid).toBe(true);
        state.$.name.$.first.setError("First name is required");
        expect(state.valid).toBe(false);
        expect(state.$.name.valid).toBe(false);
        state.$.name.$.first.setError();
        expect(state.valid).toBe(true);
        expect(state.$.name.valid).toBe(true);
      });

      it("is false if the source state is invalid", () => {
        const state = new State({ name: { first: "", last: "" } });
        const computed = state.$.name.into(toFullName).from(fromFullName);
        expect(computed.valid).toBe(true);
        state.$.name.$.first.setError("First name is required");
        state.$.name.$.last.setError("Last name is required");
        expect(computed.valid).toBe(false);
      });
    });
  });
});

function toCodes(message: string) {
  return Array.from(message).map((c) => c.charCodeAt(0));
}

function fromCodes(codes: number[]) {
  return codes.map((c) => String.fromCharCode(c)).join("");
}

function toFullName(name: { first: string; last: string }) {
  return `${name.first} ${name.last}`;
}

function fromFullName(fullName: string) {
  const [first = "", last = ""] = fullName.split(" ");
  return { first, last };
}
