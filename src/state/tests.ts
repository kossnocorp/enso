import { assert, describe, expect, it, vi } from "vitest";
import { State, StateChangeType } from ".";

describe("state", () => {
  describe("State", () => {
    it("creates a state instance", () => {
      const state = new State(42);
      expect(state.get()).toBe(42);
    });

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
          expect(state.set(43)).toBe(StateChangeType.Value);
        });

        it("returns value change type if the state has changed", () => {
          const state = new State<number | string>(42);
          expect(state.set("42")).toBe(StateChangeType.Type);
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
          expect(state.set({ num: 43 })).toBe(StateChangeType.Child);
        });

        it("returns added change type if a child has been added", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          expect(state.set({ num: 42, str: "hello" })).toBe(
            StateChangeType.Added
          );
        });

        it("returns remove change type if a child has been removed", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          expect(state.set({})).toBe(StateChangeType.Removed);
        });

        it("returns combined change type", () => {
          const state = new State<{
            num?: number;
            str?: string;
            bool?: boolean;
          }>({ num: 42, str: "hello" });
          const changed = state.set({ num: 43, bool: true });
          expect(changed & StateChangeType.Child).toBe(StateChangeType.Child);
          expect(changed & StateChangeType.Added).toBe(StateChangeType.Added);
          expect(changed & StateChangeType.Removed).toBe(
            StateChangeType.Removed
          );
        });

        it("frees nested children when removing object fields", () => {
          const state = new State<{ num?: number; str?: string }>({ num: 42 });
          const spy = vi.fn();
          state.$.num?.watch(spy);
          state.set({ num: 43 });
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ detail: StateChangeType.Value })
          );
          state.set({ str: "hello" });
          expect(spy).toHaveBeenCalledOnce();
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
          expect(state.set([1, 2, 1])).toBe(StateChangeType.Child);
        });

        it("returns added change type if a child has been added", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2, 3, 4])).toBe(StateChangeType.Added);
        });

        it("returns remove change type if a child has been removed", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2])).toBe(StateChangeType.Removed);
        });

        it("returns combined change type", () => {
          const state = new State([1, 2]);
          const arr = [0, 2, 3];
          delete arr[1];
          const changed = state.set(arr);
          expect(changed & StateChangeType.Child).toBe(StateChangeType.Child);
          expect(changed & StateChangeType.Added).toBe(StateChangeType.Added);
          expect(changed & StateChangeType.Removed).toBe(
            StateChangeType.Removed
          );
        });

        it("frees nested children when removing array items", () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          state.$[2]?.watch(spy);
          state.set([1, 2, 33, 4]);
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({
              detail: StateChangeType.Value,
            })
          );
          state.set([1, 2]);
          expect(spy).toHaveBeenCalledOnce();
        });
      });
    });

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

      it("listens to the children state changes", async () =>
        new Promise<void>((resolve) => {
          const state = new State({ num: 42 });

          const unsub = state.watch((value) => {
            expect(value.num).toBe(43);
            unsub();
            resolve();
          });

          state.$.num.set(43);
        }));

      it("provides event object with change type as detail", async () =>
        new Promise<void>((resolve) => {
          const state = new State(42);

          const unsub = state.watch((value, event) => {
            expect(event.detail).toBe(StateChangeType.Value);
            unsub();
            resolve();
          });

          state.set(43);
        }));

      describe("object", () => {
        it.todo("sends the children change type");
      });

      describe("array", () => {
        it.todo("sends the rearrange change type");
      });
    });

    describe("id", () => {
      it("assigns a unique id to each state", () => {
        const state1 = new State(42);
        const state2 = new State(42);
        expect(state1.id).toBeTypeOf("string");
        expect(state1.id).not.toBe(state2.id);
      });
    });

    describe("$", () => {
      it("points to itself for a primitive", () => {
        const state = new State(42);
        expect(state.$).toBe(state);
      });

      describe("object", () => {
        it("allows to access fields", () => {
          const state = new State({ num: 42 });
          const num = state.$.num;
          num satisfies State<number> | undefined;
          expect(num).toBeInstanceOf(State);
          expect(num.get()).toBe(42);
        });

        it("allows to access record fields", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          expect(state.$.whatever?.get).toBe(undefined);
          const num = state.$["num"];
          if (num) {
            expect(num.get()).toBe(42);
            return;
          }
          assert(false, "Should not reach here");
        });
      });

      describe("array", () => {
        it("allows to access items", () => {
          const state = new State([1, 2, 3, 4]);
          const item = state.$[3];
          item satisfies State<number> | undefined;
          expect(item).toBeInstanceOf(State);
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
        if (decomposed.value === "Hello, world!") {
          expect(decomposed.state.get()).toBe("Hello, world!");
          return;
        }
        assert(false, "Should not reach here");
      });
    });
  });
});
