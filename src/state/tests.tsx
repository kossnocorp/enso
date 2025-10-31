import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React, { useMemo, useRef, useState } from "react";
import { assert, beforeEach, describe, expect, it, vi } from "vitest";
import { actClick, postpone, useRenderCount } from "../../tests/utils.ts";
import { change } from "../change/index.ts";
import { DetachedValue, detachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { State } from "./index.js";

describe("State", () => {
  describe("static", () => {
    describe(".use", () => {
      beforeEach(cleanup);

      it("creates State instance", async () => {
        render(<Component />);
        expect(screen.getByTestId("instanceof").textContent).toBe("true");
        expect(screen.getByTestId("value").textContent).toBe("hello");

        await act(() => screen.getByText("Set hi").click());
        expect(screen.getByTestId("value").textContent).toBe("hi");
      });

      it("preserves instance of initial value change", async () => {
        render(<Component />);
        expect(screen.getByTestId("instanceof").textContent).toBe("true");

        await act(() => screen.getByText("Set initial hola").click());
        expect(screen.getByTestId("value").textContent).toBe("hello");

        expect(screen.getByTestId("instanceof").textContent).toBe("true");
      });

      function Component() {
        const [initialValue, setInitialValue] = useState("hello");
        const state = State.use(initialValue, []);
        const initialRef = useRef(state);
        const value = state.useValue();

        return (
          <>
            <ul>
              <li data-testid="instanceof">{String(state instanceof State)}</li>
              <li data-testid="value">{value}</li>
              <li data-testid="instance">
                {String(initialRef.current === state)}
              </li>
            </ul>

            <button
              onClick={() => {
                state.set("hi");
              }}
            >
              Set hi
            </button>

            <button onClick={() => setInitialValue("hola")}>
              Set initial hola
            </button>

            <button onClick={() => setInitialValue("privet")}>
              Set initial privet
            </button>
          </>
        );
      }
    });

    describe(".useEnsure", () => {
      beforeEach(cleanup);

      it("allows to ensure presence of a state", async () => {
        function Component() {
          const count = useRenderCount();
          const [state, setState] = useState<State<string> | undefined>();
          const actualState = State.use("Hello!", []);
          const ensuredState = State.useEnsure(state);
          // eslint-disable-next-line react-hooks/exhaustive-deps
          const dummyState = useMemo(() => ensuredState, []);
          const stateValue = ensuredState.useValue();
          const dummyValue = dummyState.useValue();

          return (
            <div>
              <div data-testid="render-ensure">{count}</div>

              <button onClick={() => setState(actualState)}>Set actual</button>

              <button onClick={() => dummyState.set("Hi!")}>
                Update dummy
              </button>

              <div data-testid="ensured-value">{String(stateValue)}</div>
              <div data-testid="dummy-value">{String(dummyValue)}</div>

              <div data-testid="actual-id">{actualState.id}</div>
              <div data-testid="ensured-id">{ensuredState.id}</div>
              <div data-testid="dummy-id">{dummyState.id}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("ensured-value").textContent).toBe(
          "undefined",
        );
        expect(screen.getByTestId("dummy-value").textContent).toBe("undefined");

        const actualId1 = screen.getByTestId("actual-id").textContent;
        const ensuredId1 = screen.getByTestId("ensured-id").textContent;
        const dummyId1 = screen.getByTestId("dummy-id").textContent;

        expect(ensuredId1).toBe(dummyId1);
        expect(actualId1).not.toBe(ensuredId1);

        expect(screen.getByTestId("render-ensure").textContent).toBe("1");

        await act(() => screen.getByText("Set actual").click());

        expect(screen.getByTestId("ensured-value").textContent).toBe("Hello!");
        expect(screen.getByTestId("dummy-value").textContent).toBe("undefined");

        const actualId2 = screen.getByTestId("actual-id").textContent;
        const ensuredId2 = screen.getByTestId("ensured-id").textContent;
        const dummyId2 = screen.getByTestId("dummy-id").textContent;

        expect(ensuredId2).toBe(actualId2);
        expect(actualId2).not.toBe(dummyId2);
        expect(dummyId2).toBe(dummyId1);

        expect(screen.getByTestId("render-ensure").textContent).toBe("2");

        await act(() => screen.getByText("Update dummy").click());

        expect(screen.getByTestId("ensured-value").textContent).toBe("Hello!");
        expect(screen.getByTestId("dummy-value").textContent).toBe("undefined");

        const dummyId3 = screen.getByTestId("dummy-id").textContent;

        expect(dummyId3).toBe(dummyId2);

        expect(screen.getByTestId("render-ensure").textContent).toBe("2");
      });

      it("allows to pass falsy values", async () => {
        function Component() {
          const state = State.useEnsure(
            false as unknown as State<string> | false,
          );
          const value = state.useValue();

          return (
            <div>
              <div data-testid="value">{String(value)}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("value").textContent).toBe("undefined");
      });

      it("allows to map nested state", async () => {
        function Component() {
          const count = useRenderCount();
          const [state, setState] = useState<
            State<{ hello: string }> | undefined
          >();
          const actualState = State.use({ hello: "Hello!" }, []);
          const ensuredState = State.useEnsure(state, (f) => f.$.hello);
          const dummyState = useMemo(() => ensuredState, []);
          const stateValue = ensuredState.useValue();
          const dummyValue = dummyState.useValue();

          return (
            <div>
              <div data-testid="render-ensure">{count}</div>

              <button onClick={() => setState(actualState)}>Set actual</button>

              <button onClick={() => dummyState.set("Hi!")}>
                Update dummy
              </button>

              <div data-testid="ensured-value">{String(stateValue)}</div>
              <div data-testid="dummy-value">{String(dummyValue)}</div>

              <div data-testid="actual-id">{actualState.$.hello.id}</div>
              <div data-testid="ensured-id">{ensuredState.id}</div>
              <div data-testid="dummy-id">{dummyState.id}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("ensured-value").textContent).toBe(
          "undefined",
        );
        expect(screen.getByTestId("dummy-value").textContent).toBe("undefined");

        const actualId1 = screen.getByTestId("actual-id").textContent;
        const ensuredId1 = screen.getByTestId("ensured-id").textContent;
        const dummyId1 = screen.getByTestId("dummy-id").textContent;

        expect(ensuredId1).toBe(dummyId1);
        expect(actualId1).not.toBe(ensuredId1);

        expect(screen.getByTestId("render-ensure").textContent).toBe("1");

        await act(() => screen.getByText("Set actual").click());

        expect(screen.getByTestId("ensured-value").textContent).toBe("Hello!");
        expect(screen.getByTestId("dummy-value").textContent).toBe("undefined");

        const actualId2 = screen.getByTestId("actual-id").textContent;
        const ensuredId2 = screen.getByTestId("ensured-id").textContent;
        const dummyId2 = screen.getByTestId("dummy-id").textContent;

        expect(ensuredId2).toBe(actualId2);
        expect(actualId2).not.toBe(dummyId2);
        expect(dummyId2).toBe(dummyId1);

        expect(screen.getByTestId("render-ensure").textContent).toBe("2");

        await act(() => screen.getByText("Update dummy").click());

        expect(screen.getByTestId("ensured-value").textContent).toBe("Hello!");
        expect(screen.getByTestId("dummy-value").textContent).toBe("undefined");

        const dummyId3 = screen.getByTestId("dummy-id").textContent;

        expect(dummyId3).toBe(dummyId2);

        expect(screen.getByTestId("render-ensure").textContent).toBe("2");
      });
    });
  });

  describe("instance", () => {
    describe("constructor", () => {
      it("creates a state instance", () => {
        const state = new State(42);
        expect(state.value).toBe(42);
      });
    });
  });

  describe("attributes", () => {
    describe("#id", () => {
      it("assigns a unique id to each state", () => {
        const state1 = new State(42);
        const state2 = new State(42);
        expect(state1.id).toBeTypeOf("string");
        expect(state1.id).not.toBe(state2.id);
      });

      it(" states returns unique ids", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.id).not.toBe(state.$.name.$.first.id);
      });
    });
  });

  describe("value", () => {
    describe("#useValue", () => {
      beforeEach(cleanup);

      it("allows to watch for state", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use({ name: { first: "Alexander" } }, []);
          const name = state.$.name.useValue();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => state.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <div data-testid="name">{name.first}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("name").textContent).toBe("Alexander");
        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Rename").click());

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("2");
      });

      it("depends on the state id", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use(
            [{ name: "Alexander" }, { name: "Sasha" }],
            [],
          );
          const [index, setIndex] = useState(0);
          const item = state.at(index).useValue();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="name">{item?.name}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("name").textContent).toBe("Alexander");
        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("2");
      });

      it("updates the watcher on state id change", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use(
            [{ name: "Alexander" }, { name: "Sasha" }],
            [],
          );
          const [index, setIndex] = useState(0);
          const item = state.at(index).useValue();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => state.at(0).set({ name: "Alex" })}>
                Rename 0 to Alex
              </button>

              <button onClick={() => state.at(1).set({ name: "Sashka" })}>
                Rename 1 to Sashka
              </button>

              <div data-testid="name">{item?.name}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("name").textContent).toBe("Alexander");
        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("2");

        await act(() => screen.getByText("Rename 0 to Alex").click());

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("2");

        await act(() => screen.getByText("Rename 1 to Sashka").click());

        expect(screen.getByTestId("name").textContent).toBe("Sashka");
        expect(screen.getByTestId("render-watch").textContent).toBe("3");
      });

      it("doesn't rerender when setting the same primitive", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use({ name: "Sasha" }, []);
          const user = state.useValue();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => state.$.name.set("Sasha")}>
                Assign same name
              </button>

              <div data-testid="name">{user?.name}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Assign same name").click());

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("1");
      });
    });

    describe("#set", () => {
      describe("primitive", () => {
        it("sets a new state", () => {
          const state = new State(42);
          state.set(43);
          expect(state.value).toBe(43);
        });

        describe("changes", () => {
          it("assigns 0 if the state is not changed", () => {
            const state = new State(42);
            expect(state.set(42).lastChanges).toMatchChanges(0n);
          });

          it("assigns type change when type changes", () => {
            const state = new State<number | string>(42);
            expect(state.set("42").lastChanges).toMatchChanges(
              change.atom.type,
            );
          });

          it("assigns value change when value changes", () => {
            const state = new State(42);
            expect(state.set(43).lastChanges).toMatchChanges(change.atom.value);
          });

          it("assigns detach change when setting to detached value", () => {
            const state = new State(42);
            // @ts-expect-error -- TODO: Types revamp
            expect(state.set(detachedValue).lastChanges).toMatchChanges(
              change.atom.detach,
            );
          });

          it("assigns attach change when setting from detached value", () => {
            const state = new State<number | DetachedValue>(detachedValue);
            expect(state.set(42).lastChanges).toMatchChanges(
              change.atom.attach,
            );
          });

          it("assigns type change when setting undefined", () => {
            const state = new State<number | undefined>(42);
            expect(state.set(undefined).lastChanges).toMatchChanges(
              change.atom.type,
            );
          });
        });
      });

      describe("object", () => {
        it("sets object state", () => {
          const state = new State<{ num?: number; str?: string }>({
            num: 42,
          });
          state.set({ num: 43 });
          expect(state.value).toEqual({ num: 43 });
          state.set({ num: 44, str: "hello" });
          expect(state.value).toEqual({ num: 44, str: "hello" });
          state.set({ str: "world" });
          expect(state.value).toEqual({ str: "world" });
          state.set({});
          expect(state.value).toEqual({});
        });

        it("does not trigger child states updates when detached", async () => {
          const state = new State<{ num?: number; str?: string }>({
            num: 42,
          });
          const spy = vi.fn();
          state.$.num?.watch(spy);
          state.set({ num: 43 });
          await postpone();
          expect(spy).toHaveBeenCalledOnce();
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: change.atom.value }),
          );
          state.set({ str: "hello" });
          await postpone();
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves detached states", async () => {
          const state = new State<{ num?: number; str?: string }>({
            num: 42,
          });
          const spy = vi.fn();
          const numA = state.$.num;
          numA?.watch(spy);
          state.set({ num: 43 });

          await postpone();
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: change.atom.value }),
          );
          state.set({ str: "hello" });
          state.set({ num: 44, str: "hello" });
          const numB = state.$.num;
          expect(numA).toBeInstanceOf(State);
          expect(numA).toBe(numB);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            44,
            expect.objectContaining({
              changes: change.atom.type | change.atom.attach,
            }),
          );
        });

        it("allows to re-attach child states", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          const childState = state.at("num");
          childState.self.remove();
          childState.set(9);
          expect(state.value).toEqual({ num: 9 });
        });

        describe("changes", () => {
          describe("state", () => {
            it("assigns 0 if the state is not changed", () => {
              const state = new State({ num: 42 });
              expect(state.set({ num: 42 }).lastChanges).toMatchChanges(0n);
            });

            it("assigns type change when type changes", () => {
              const state = new State<object | number>({ num: 42 });
              expect(state.set(42).lastChanges).toMatchChanges(
                change.atom.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const state = new State<{ name?: object }>({});
              expect(
                state.$.name.set({ first: "Sasha" }).lastChanges,
              ).toMatchChanges(change.atom.attach);
            });

            it("assigns detach change when detaching", () => {
              const state = new State<{ name?: object }>({
                name: { first: "Sasha" },
              });
              expect(
                // @ts-expect-error -- TODO: Types revamp
                state.$.name.set(detachedValue).lastChanges,
              ).toMatchChanges(change.atom.detach);
            });

            it("assigns type change when setting undefined", () => {
              const state = new State<object | undefined>({ num: 42 });
              expect(state.set(undefined).lastChanges).toMatchChanges(
                change.atom.type,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const state = new State<object>({ num: 42 });
                expect(
                  state.set({ num: 42, str: "hello" }).lastChanges,
                ).toMatchChanges(change.atom.shape | change.child.attach);
              });

              it("assigns change when child detaches", () => {
                const state = new State<object>({ num: 42, str: "hello" });
                expect(state.set({ num: 42 }).lastChanges).toMatchChanges(
                  change.atom.shape | change.child.detach,
                );
              });
            });
          });

          describe("child", () => {
            it("assigns type change when type changes", () => {
              const state = new State<object>({ num: 42 });
              expect(state.set({ num: "42" }).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const state = new State<object>({});
              expect(
                state.set({ name: { first: "Sasha" } }).lastChanges,
              ).toMatchChanges(change.atom.shape | change.child.attach);
            });

            it("assigns detach change when detaching", () => {
              const state = new State<object>({
                name: { first: "Sasha" },
              });
              expect(state.set({}).lastChanges).toMatchChanges(
                change.atom.shape | change.child.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const state = new State<object>({
                name: { first: "Sasha" },
              });
              expect(state.set({ name: undefined }).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns combined changes", () => {
              const state = new State<object>({ num: 42, str: "hello" });
              expect(
                state.set({ num: 43, bool: true }).lastChanges,
              ).toMatchChanges(
                change.atom.shape |
                  change.child.value |
                  change.child.attach |
                  change.child.detach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const state = new State<object>({ obj: { num: 42 } });
                expect(
                  state.set({ obj: { num: 42, str: "hello" } }).lastChanges,
                ).toMatchChanges(change.child.shape | change.subtree.attach);
              });

              it("assigns change when child detaches", () => {
                const state = new State<object>({
                  obj: { num: 42, str: "hello" },
                });
                expect(
                  state.set({ obj: { num: 42 } }).lastChanges,
                ).toMatchChanges(change.child.shape | change.subtree.detach);
              });
            });
          });

          describe("subtree", () => {
            it("assigns type change when type changes", () => {
              const state = new State<{ obj: object }>({ obj: { num: 42 } });
              expect(
                state.set({ obj: { num: "42" } }).lastChanges,
              ).toMatchChanges(change.subtree.type);
            });

            it("assigns attach change when attaching", () => {
              const state = new State<{ obj: object }>({ obj: {} });
              expect(
                state.set({ obj: { name: { first: "Sasha" } } }).lastChanges,
              ).toMatchChanges(change.child.shape | change.subtree.attach);
            });

            it("assigns detach change when detaching", () => {
              const state = new State<{ obj: object }>({
                obj: { name: { first: "Sasha" } },
              });
              expect(state.set({ obj: {} }).lastChanges).toMatchChanges(
                change.child.shape | change.subtree.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const state = new State<{ obj: object }>({
                obj: { name: { first: "Sasha" } },
              });
              expect(
                state.set({ obj: { name: undefined } }).lastChanges,
              ).toMatchChanges(change.subtree.type);
            });

            it("assigns combined changes", () => {
              const state = new State<object>({
                obj: { num: 42, str: "hello" },
              });
              expect(
                state.set({ obj: { num: 43, bool: true } }).lastChanges,
              ).toMatchChanges(
                change.child.shape |
                  change.subtree.value |
                  change.subtree.attach |
                  change.subtree.detach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const state = new State<object>({
                  obj: { obj: { num: 42 } },
                });
                expect(
                  state.set({ obj: { obj: { num: 42, str: "hello" } } })
                    .lastChanges,
                ).toMatchChanges(change.subtree.shape | change.subtree.attach);
              });

              it("assigns change when child detaches", () => {
                const state = new State<object>({
                  obj: {
                    obj: { num: 42, str: "hello" },
                  },
                });
                expect(
                  state.set({ obj: { obj: { num: 42 } } }).lastChanges,
                ).toMatchChanges(change.subtree.shape | change.subtree.detach);
              });
            });
          });
        });
      });

      describe("array", () => {
        it("sets the array state", () => {
          const state = new State<number[]>([1, 2, 3, 4, 5]);
          state.set([1, 2, 3]);
          expect(state.value).toEqual([1, 2, 3]);
          state.set([1, 2, 3, 4]);
          expect(state.value).toEqual([1, 2, 3, 4]);
          const arr = new Array(5);
          arr[3] = 5;
          state.set(arr);
          expect(state.value).toEqual(arr);
          state.set([]);
          expect(state.value).toEqual([]);
        });

        it("assigns 0 if the state has not changed", () => {
          const state = new State([1, 2, 3]);
          state.set([1, 2, 3]);
          expect(state.lastChanges).toBe(0n);
        });

        it("assigns child change type if a child state has changed", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2, 1]).lastChanges).toMatchChanges(
            change.child.value,
          );
        });

        it("assigns added change type if a child has been added", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2, 3, 4]).lastChanges).toMatchChanges(
            change.atom.shape | change.child.attach,
          );
        });

        it("assigns child removed change type if a child has been removed", () => {
          const state = new State([1, 2, 3]);
          expect(state.set([1, 2]).lastChanges).toMatchChanges(
            change.atom.shape | change.child.detach,
          );
        });

        it("assigns combined change type", () => {
          const state = new State([1, 2]);
          const arr = [0, 2, 3];
          delete arr[1];
          state.set(arr);
          expect(state.lastChanges & change.atom.shape).toBe(change.atom.shape);
          expect(state.lastChanges & change.child.attach).toBe(
            change.child.attach,
          );
          expect(state.lastChanges & change.child.detach).toBe(
            change.child.detach,
          );
        });

        it("does not trigger item updates when removing", async () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          state.$[2]?.watch(spy);
          state.set([1, 2, 33, 4]);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({
              changes: change.atom.value,
            }),
          );
          state.set([1, 2]);

          await postpone();
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed items", async () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = state.at(2);
          itemA.watch(spy);
          state.set([1, 2, 33, 4]);

          await postpone();
          state.set([1, 2]);
          state.set([1, 2, 333]);
          const itemB = state.at(2);
          expect(itemA).toBeInstanceOf(State);
          expect(itemA).toBe(itemB);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ changes: change.atom.value }),
          );

          expect(spy).toHaveBeenCalledWith(
            333,
            expect.objectContaining({
              changes: change.atom.type | change.atom.attach,
            }),
          );
        });

        it("indicates no type change on adding undefined", async () => {
          const state = new State<Array<number | undefined>>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = state.at(2);
          itemA.watch(spy);
          state.set([1, 2, 33, 4]);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ changes: change.atom.value }),
          );

          state.set([1, 2]);
          state.set([1, 2, undefined]);

          await postpone();
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              changes: change.atom.attach,
            }),
          );
        });

        it("does not trigger update when setting undefined value to undefined value", () => {
          const state = new State<number[]>([1, 2, 3, 4]);
          const child = state.at(5);
          // @ts-expect-error -- TODO: Types revamp
          child.set(detachedValue);
          expect(child.lastChanges).toBe(0n);
        });

        it("works when assigning undefined instead of an object item", () => {
          const state = new State<Array<{ n: number }>>([
            { n: 1 },
            { n: 2 },
            { n: 3 },
          ]);
          expect(state.set([{ n: 1 }, { n: 2 }]).lastChanges).toMatchChanges(
            change.atom.shape | change.child.detach,
          );
          expect(state.value).toEqual([{ n: 1 }, { n: 2 }]);
        });

        it("works when assigning object instead of an undefined item", () => {
          const state = new State<Array<{ n: number }>>([{ n: 1 }, { n: 2 }]);
          const spy = vi.fn();
          const undefinedState = state.at(2);
          state.map(spy);
          expect(undefinedState.value).toBe(undefined);
          expect(
            state.set([{ n: 1 }, { n: 2 }, { n: 3 }]).lastChanges,
          ).toMatchChanges(change.atom.shape | change.child.attach);
          expect(state.value).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
          state.map(spy);
          expect(spy).toBeCalled();
        });

        it("assigns created changes when adding a new state", () => {
          const state = new State<number[]>([1, 2]);
          expect(state.at(2).set(3).lastChanges).toMatchChanges(
            change.atom.attach,
          );
        });

        it("allows to re-attach item states", () => {
          const state = new State<number[]>([1, 2, 3]);
          const itemState = state.remove(1);
          itemState.set(9);
          expect(state.value).toEqual([1, 9, 3]);
        });

        it("shifts children when re-attaching item state", () => {
          const state = new State<number[]>([1, 2, 3]);
          const itemState = state.remove(1);

          expect(state.value).toEqual([1, 3]);
          expect(state.at(0).key).toBe("0");
          expect(state.at(1).key).toBe("1");

          itemState.set(9);
          expect(state.value).toEqual([1, 9, 3]);
          expect(state.at(0).key).toBe("0");
          expect(state.at(1).key).toBe("1");
        });

        describe("changes", () => {
          describe("state", () => {
            it("assigns 0 if the state is not changed", () => {
              const state = new State([1, 2, 3]);
              state.set([1, 2, 3]);
              expect(state.lastChanges).toMatchChanges(0n);
            });

            it("assigns type change when type changes", () => {
              const state = new State<number[] | number>([1, 2, 3]);
              expect(state.set(123).lastChanges).toMatchChanges(
                change.atom.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const state = new State<number[]>([]);
              expect(state.at(0).set(1).lastChanges).toMatchChanges(
                change.atom.attach,
              );
            });

            it("assigns detach change when detaching", () => {
              const state = new State<number[]>([1, 2, 3]);
              // @ts-expect-error -- TODO: Types revamp
              expect(state.at(2).set(detachedValue).lastChanges).toMatchChanges(
                change.atom.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const state = new State<number[] | undefined>([1, 2, 3]);
              expect(state.set(undefined).lastChanges).toMatchChanges(
                change.atom.type,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const state = new State<number[]>([1, 2]);
                expect(state.set([1, 2, 3]).lastChanges).toMatchChanges(
                  change.atom.shape | change.child.attach,
                );
              });

              it("assigns change when child detaches", () => {
                const state = new State<number[]>([1, 2, 3]);
                expect(state.set([1, 2]).lastChanges).toMatchChanges(
                  change.atom.shape | change.child.detach,
                );
              });
            });
          });

          describe("child", () => {
            it("assigns type change when type changes", () => {
              const state = new State<any[]>([1, 2, 3]);
              expect(state.set([1, 2, "3"]).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const state = new State<any[]>([1, 2]);
              expect(state.set([1, 2, 3]).lastChanges).toMatchChanges(
                change.atom.shape | change.child.attach,
              );
            });

            it("assigns detach change when detaching", () => {
              const state = new State<any[]>([1, 2, 3]);
              expect(state.set([1, 2]).lastChanges).toMatchChanges(
                change.atom.shape | change.child.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const state = new State<any[]>([1, 2, 3]);
              expect(state.set([1, 2, undefined]).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns combined changes", () => {
              const state = new State<any[]>([1, 2]);
              expect(state.set([1, "2", 3]).lastChanges).toMatchChanges(
                change.atom.shape | change.child.type | change.child.attach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const state = new State<any[][]>([[1, 2]]);
                expect(state.set([[1, 2, 3]]).lastChanges).toMatchChanges(
                  change.child.shape | change.subtree.attach,
                );
              });

              it("assigns change when child detaches", () => {
                const state = new State<any[][]>([[1, 2, 3]]);
                expect(state.set([[1, 2]]).lastChanges).toMatchChanges(
                  change.child.shape | change.subtree.detach,
                );
              });
            });
          });

          describe("subtree", () => {
            it("assigns type change when type changes", () => {
              const state = new State<any[][]>([[1, 2, 3]]);
              expect(state.set([[1, 2, "3"]]).lastChanges).toMatchChanges(
                change.subtree.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const state = new State<any[][]>([[1, 2]]);
              expect(state.set([[1, 2, 3]]).lastChanges).toMatchChanges(
                change.child.shape | change.subtree.attach,
              );
            });

            it("assigns detach change when detaching", () => {
              const state = new State<any[][]>([[1, 2, 3]]);
              expect(state.set([[1, 2]]).lastChanges).toMatchChanges(
                change.child.shape | change.subtree.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const state = new State<any[][]>([[1, 2, 3]]);
              expect(state.set([[1, 2, undefined]]).lastChanges).toMatchChanges(
                change.subtree.type,
              );
            });

            it("assigns combined changes", () => {
              const state = new State<any[][]>([[1, 2]]);
              expect(state.set([[1, "2", 3]]).lastChanges).toMatchChanges(
                change.child.shape |
                  change.subtree.type |
                  change.subtree.attach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const state = new State<any[][]>([[[1, 2]]]);
                expect(state.set([[[1, 2, 3]]]).lastChanges).toMatchChanges(
                  change.subtree.shape | change.subtree.attach,
                );
              });

              it("assigns change when child detaches", () => {
                const state = new State<any[][]>([[[1, 2, 3]]]);
                expect(state.set([[[1, 2]]]).lastChanges).toMatchChanges(
                  change.subtree.shape | change.subtree.detach,
                );
              });
            });
          });
        });
      });

      describe("instance", () => {
        it("sets instance state", () => {
          const map = new Map<string, number>();
          map.set("num", 42);
          const state = new State(map);
          expect(Object.fromEntries(state.value)).toEqual({
            num: 42,
          });
          {
            const newMap = new Map<string, number>();
            newMap.set("num", 43);
            state.set(newMap);
            expect(Object.fromEntries(state.value)).toEqual({
              num: 43,
            });
          }
          {
            const newMap = new Map<string, number>();
            newMap.set("num", 44);
            newMap.set("qwe", 123);
            state.set(newMap);
            expect(Object.fromEntries(state.value)).toEqual({
              num: 44,
              qwe: 123,
            });
          }
          {
            const newMap = new Map<string, number>();
            state.set(newMap);
            expect(Object.fromEntries(state.value)).toEqual({});
          }
        });

        it("does not confuse null with instances", () => {
          const state = new State(null);
          expect(state.value).toBe(null);
          state.set(null);
          expect(state.value).toBe(null);
        });

        describe("changes", () => {
          it("assigns 0 if the state is not changed", () => {
            const map = new Map();
            const state = new State(map);
            state.set(map);
            expect(state.lastChanges).toMatchChanges(0n);
          });

          it("assigns type change when type changes", () => {
            const state = new State<Map<string, string> | Set<string>>(
              new Map(),
            );
            expect(state.set(new Set<string>()).lastChanges).toMatchChanges(
              change.atom.type,
            );
          });

          it("assigns value change when value changes", () => {
            const state = new State(new Map());
            expect(state.set(new Map()).lastChanges).toMatchChanges(
              change.atom.value,
            );
          });

          it("assigns detach change when setting to detached value", () => {
            const state = new State<Map<any, any>, "detachable">(new Map());
            // @ts-expect-error -- TODO: Types revamp
            expect(state.set(detachedValue).lastChanges).toMatchChanges(
              change.atom.detach,
            );
          });

          it("assigns attach change when setting from detached value", () => {
            const state = new State<Map<string, string> | DetachedValue>(
              detachedValue,
            );
            expect(state.set(new Map()).lastChanges).toMatchChanges(
              change.atom.attach,
            );
          });

          it("assigns type change when setting undefined", () => {
            const state = new State<Map<string, string> | undefined>(new Map());
            expect(state.set(undefined).lastChanges).toMatchChanges(
              change.atom.type,
            );
          });
        });
      });
    });

    describe("#pave", () => {
      it("returns state set to the given value if it's null or undefined", () => {
        const state = new State<string | undefined>(undefined);
        const pavedState = state.pave("Hello");
        expect(pavedState.value).toBe("Hello");
        expect(pavedState).toBe(state);
      });

      it("returns same state if it's already set", () => {
        const state = new State<string | undefined>("Hi");
        const pavedState = state.pave("Hello");
        expect(pavedState.value).toBe("Hi");
      });

      it("allows to pave through nested states", () => {
        const state = new State<
          { name?: { first?: string; last?: string } } | undefined
        >({});
        state.pave({}).$.name.pave({}).$.first.pave("Alexander");
        expect(state.value).toEqual({
          name: { first: "Alexander" },
        });
      });
    });

    describe("#compute", () => {
      it("allows to compute value", () => {
        const state = new State<UserName>({ first: "Sasha" });
        expect(state.compute(toFullName)).toBe("Sasha");

        state.$.last.set("Koss");
        expect(state.compute(toFullName)).toBe("Sasha Koss");
      });
    });

    describe("#useCompute", () => {
      beforeEach(cleanup);

      it("allows to compute value", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<User>(
            { name: { first: "Alexander" }, email: undefined },
            [],
          );
          const hasLastName = state.$.name.useCompute(
            (name) => !!name.last,
            [],
          );

          return (
            <div>
              <div data-testid="render-compute">{count}</div>

              <button
                onClick={() =>
                  state.$.name.$.first.set(`Sasha ${Math.random()}`)
                }
              >
                Rename first
              </button>

              <button
                onClick={() =>
                  state.$.email.set(`koss+${Date.now()}@nocorp.me`)
                }
              >
                Set email
              </button>

              <button onClick={() => state.$.name.$.last.set("Koss")}>
                Set last name
              </button>

              <button onClick={() => state.$.name.$.last.set(undefined)}>
                Clear last name
              </button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("computed").textContent).toBe("false");
        expect(screen.getByTestId("render-compute").textContent).toBe("1");

        await act(() => screen.getByText("Set email").click());
        await act(() => screen.getByText("Rename first").click());
        await act(() => screen.getByText("Set email").click());
        await act(() => screen.getByText("Rename first").click());

        expect(screen.getByTestId("render-compute").textContent).toBe("1");

        await act(() => screen.getByText("Set last name").click());

        expect(screen.getByTestId("computed").textContent).toBe("true");
        expect(screen.getByTestId("render-compute").textContent).toBe("2");

        await act(() => screen.getByText("Set email").click());
        await act(() => screen.getByText("Rename first").click());
        await act(() => screen.getByText("Set email").click());
        await act(() => screen.getByText("Rename first").click());

        expect(screen.getByTestId("render-compute").textContent).toBe("2");

        await act(() => screen.getByText("Clear last name").click());

        expect(screen.getByTestId("computed").textContent).toBe("false");
        expect(screen.getByTestId("render-compute").textContent).toBe("3");
      });

      it("depends on the state id", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<UserName[]>(
            [{ first: "Alexander" }, { first: "Sasha", last: "Koss" }],
            [],
          );
          const [index, setIndex] = useState(0);
          const hasLastName = state
            .at(index)
            .useCompute((name) => !!name?.last, []);

          return (
            <div>
              <div data-testid="render-computed">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("computed").textContent).toBe("false");
        expect(screen.getByTestId("render-computed").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("computed").textContent).toBe("true");
        expect(screen.getByTestId("render-computed").textContent).toBe("2");
      });

      it("updates the watcher on state id change", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<UserName[]>(
            [{ first: "Alexander" }, { first: "Sasha", last: "Koss" }],
            [],
          );
          const [index, setIndex] = useState(0);
          const hasLastName = state
            .at(index)
            .useCompute((name) => !!name?.last, []);

          return (
            <div>
              <div data-testid="render-computed">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() =>
                  state.at(0).set({ first: "Alexander", last: "Koss" })
                }
              >
                Give item 0 last name
              </button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("computed").textContent).toBe("false");
        expect(screen.getByTestId("render-computed").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("computed").textContent).toBe("true");
        expect(screen.getByTestId("render-computed").textContent).toBe("2");

        await act(() => screen.getByText("Give item 0 last name").click());

        expect(screen.getByTestId("computed").textContent).toBe("true");
      });

      it("doesn't rerender when setting the same primitive", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<UserName>({ first: "Alexander" }, []);
          const hasLastName = state.useCompute((name) => !!name?.last, []);

          return (
            <div>
              <div data-testid="render-computed">{count}</div>

              <button onClick={() => state.set({ first: "Alex" })}>
                Rename item 0
              </button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("computed").textContent).toBe("false");
        expect(screen.getByTestId("render-computed").textContent).toBe("1");

        await act(() => screen.getByText("Rename item 0").click());

        expect(screen.getByTestId("computed").textContent).toBe("false");
        expect(screen.getByTestId("render-computed").textContent).toBe("1");
      });

      it("allows to specify dependencies", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use("Alexander", []);
          const [lastName, setLastName] = useState("Koss");
          const fullName = state.useCompute(
            (name) => `${name} ${lastName}`,
            [lastName],
          );

          return (
            <div>
              <div data-testid="render-compute">{count}</div>

              <button onClick={() => state.set("Sasha")}>Rename first</button>

              <button onClick={() => setLastName("K.")}>Rename last</button>

              <div data-testid="computed">{fullName}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("computed").textContent).toBe(
          "Alexander Koss",
        );
        expect(screen.getByTestId("render-compute").textContent).toBe("1");

        await act(() => screen.getByText("Rename last").click());

        expect(screen.getByTestId("computed").textContent).toBe("Alexander K.");
        expect(screen.getByTestId("render-compute").textContent).toBe("3");

        await act(() => screen.getByText("Rename first").click());

        expect(screen.getByTestId("computed").textContent).toBe("Sasha K.");
        expect(screen.getByTestId("render-compute").textContent).toBe("4");
      });
    });
  });

  describe("meta", () => {
    describe("#useMeta", () => {
      beforeEach(cleanup);

      it("allows to listen to meta information", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use(
            { name: { first: "Alexander", last: "" } },
            [],
          );
          const meta = state.useMeta();

          return (
            <div>
              <div data-testid="render-meta">{count}</div>

              <button onClick={() => state.$.name.$.last.set("Koss")}>
                Trigger state update
              </button>

              <div data-testid="json">{JSON.stringify(meta)}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("json").textContent).toBe("{}");
      });
    });
  });

  describe("type", () => {
    describe("collection", () => {
      describe("#size", () => {
        describe(Array, () => {
          it("returns size", () => {
            const state = new State([1, 2, 3]);
            expect(state.size).toBe(3);
          });
        });

        describe(Object, () => {
          it("returns size", () => {
            const state = new State({ a: 1, b: 2, c: 3 });
            expect(state.size).toBe(3);
          });
        });
      });

      describe("#remove", () => {
        describe(Object, () => {
          it("removes a record state by key", () => {
            const state = new State<Record<string, number>>({
              one: 1,
              two: 2,
              three: 3,
            });
            state.remove("one");
            expect(state.value).toEqual({ two: 2, three: 3 });
          });

          it("returns the removed state", () => {
            const state = new State<Record<string, number>>({
              one: 1,
              two: 2,
              three: 3,
            });
            const oneState = state.$.one;
            const removedState = state.remove("one");
            expect(removedState).toBe(oneState);
            expect(removedState.value).toBe(undefined);
          });

          it("removes child", () => {
            const parent = new State<Record<string, number>>({
              one: 1,
              two: 2,
              three: 3,
            });
            const state = parent.at("one");
            state.self.remove();
            expect(parent.value).toEqual({ two: 2, three: 3 });
            expect(state.value).toBe(undefined);
          });

          it("removes a optional state by key", () => {
            const state = new State<{ one: 1; two: 2 | undefined; three?: 3 }>({
              one: 1,
              two: 2,
              three: 3,
            });
            state.remove("three");
            expect(state.value).toEqual({ one: 1, two: 2 });
          });

          it("doesn't throw on removing non-existing state", () => {
            const state = new State<Record<string, number>>({ one: 1 });
            expect(() => state.remove("two")).not.toThrow();
          });

          describe("changes", () => {
            describe("child", () => {
              it("triggers updates", async () => {
                const spy = vi.fn();
                const state = new State<Record<string, number>>({
                  one: 1,
                  two: 2,
                  three: 3,
                });
                state.watch(spy);
                state.remove("one");
                await postpone();
                const [[value, event]]: any = spy.mock.calls;
                expect(value).toEqual({ two: 2, three: 3 });
                expect(event.changes).toMatchChanges(
                  change.atom.shape | change.child.detach,
                );
              });
            });

            describe("subtree", () => {
              it("triggers updates", async () => {
                const spy = vi.fn();
                const state = new State<{ qwe: Record<string, number> }>({
                  qwe: {
                    one: 1,
                    two: 2,
                    three: 3,
                  },
                });
                state.watch(spy);
                state.$.qwe.remove("one");
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
          it("removes a state by index", () => {
            const state = new State([1, 2, 3]);
            state.remove(1);
            expect(state.value).toEqual([1, 3]);
          });

          it("returns the removed state", () => {
            const state = new State([1, 2, 3]);
            const oneState = state.at(1);
            const removedState = state.remove(1);
            expect(removedState).toBe(oneState);
            expect(removedState.value).toBe(undefined);
          });

          it("removes child", () => {
            const parent = new State([1, 2, 3]);
            const state = parent.at(1);
            state.self.remove();
            expect(parent.value).toEqual([1, 3]);
            expect(state.value).toBe(undefined);
          });

          it("doesn't throw on removing non-existing item", () => {
            const state = new State([1, 2, 3]);
            expect(() => state.remove(6)).not.toThrow();
          });

          it("updates the children indices", () => {
            const state = new State([1, 2, 3, 4]);
            state.remove(1);
            expect(state.at(0).key).toBe("0");
            expect(state.at(1).key).toBe("1");
            expect(state.at(2).key).toBe("2");
          });

          describe("changes", () => {
            describe("child", () => {
              it("triggers updates", async () => {
                const spy = vi.fn();
                const state = new State([1, 2, 3, 4]);
                state.watch(spy);
                state.remove(1);
                await postpone();
                const [[value, event]]: any = spy.mock.calls;
                expect(value).toEqual([1, 3, 4]);
                expect(event.changes).toMatchChanges(
                  change.atom.shape | change.child.detach,
                );
              });
            });

            describe("subtree", () => {
              it("triggers updates", async () => {
                const spy = vi.fn();
                const state = new State([[1, 2, 3, 4]]);
                state.watch(spy);
                state.at(0).self.try()?.remove(1);
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

      describe("#forEach", () => {
        describe(Array, () => {
          const state = new State([1, 2, 3]);
          const stateUnd = new State<number[] | undefined>(undefined);

          it("iterates items", () => {
            const mapped: [number, number][] = [];
            state.forEach((item, index) =>
              mapped.push([index, item.value * 2]),
            );
            expect(mapped).toEqual([
              [0, 2],
              [1, 4],
              [2, 6],
            ]);
          });

          it("accepts undefined state", () => {
            const spy = vi.fn();
            stateUnd.self.try()?.forEach(spy);
            expect(spy).not.toHaveBeenCalled();
          });
        });

        describe(Object, () => {
          const state = new State({ a: 1, b: 2, c: 3 });
          const stateUnd = new State<{ [k: string]: number } | undefined>(
            undefined,
          );

          it("iterates items and keys", () => {
            const mapped: [string, number][] = [];
            state.forEach((item, key) => mapped.push([key, item.value]));
            expect(mapped).toEqual([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);
          });

          it("accepts undefined state", () => {
            const spy = vi.fn();
            stateUnd.self.try()?.forEach(spy);
            expect(spy).not.toHaveBeenCalled();
          });
        });
      });

      describe("#map", () => {
        describe(Array, () => {
          const state = new State([1, 2, 3]);
          const stateUnd = new State<number[] | undefined>(undefined);

          it("maps items", () => {
            const mapped = state.map((item, index) => [index, item.value * 2]);
            expect(mapped).toEqual([
              [0, 2],
              [1, 4],
              [2, 6],
            ]);
          });

          it("accepts undefined state", () => {
            const spy = vi.fn();
            stateUnd.self.try()?.map(spy);
            expect(spy).not.toHaveBeenCalled();
          });
        });

        describe(Object, () => {
          const state = new State({ a: 1, b: 2, c: 3 });
          const stateUnd = new State<{ [k: string]: number } | undefined>(
            undefined,
          );

          it("maps items and keys", () => {
            const mapped = state.map((item, key) => [key, item.value]);
            expect(mapped).toEqual([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);
          });

          it("accepts undefined state", () => {
            const spy = vi.fn();
            stateUnd.self.try()?.map(spy);
            expect(spy).not.toHaveBeenCalled();
          });
        });
      });

      describe("#find", () => {
        describe(Array, () => {
          it("finds an item in the array", () => {
            const state = new State([1, 2, 3]);
            const item = state.find((item) => item.value === 2);
            expect(item?.value).toBe(2);
          });

          it("returns undefined if item not found", () => {
            const state = new State([1, 2, 3]);
            const item = state.find((item) => item.value === 4);
            expect(item).toBe(undefined);
          });

          it("passes index to the predicate", () => {
            const state = new State([1, 2, 3]);
            const item = state.find(
              (item, index) => item.value === 2 && index === 1,
            );
            expect(item?.value).toBe(2);
          });
        });

        describe(Object, () => {
          it("finds an item in the object", () => {
            const state = new State({ a: 1, b: 2, c: 3 });
            const item = state.find((item) => item.value === 2);
            expect(item?.value).toBe(2);
          });

          it("returns undefined if item not found", () => {
            const state = new State({ a: 1, b: 2, c: 3 });
            const item = state.find((item) => item.value === 4);
            expect(item).toBe(undefined);
          });

          it("passes key to the predicate", () => {
            const state = new State({ a: 1, b: 2, c: 3 });
            const item = state.find(
              (item, key) => item.value === 2 && key === "b",
            );
            expect(item?.value).toBe(2);
          });
        });
      });

      describe("#filter", () => {
        describe(Array, () => {
          it("filters items in the array", () => {
            const state = new State([1, 2, 3, 4]);
            const items = state.filter((item) => item.value % 2 === 0);
            expect(items.map((f) => f.value)).toEqual([2, 4]);
          });

          it("returns empty array if none match", () => {
            const state = new State([1, 3, 5]);
            const items = state.filter((item) => item.value === 2);
            expect(items).toEqual([]);
          });

          it("passes index to the predicate", () => {
            const state = new State([1, 2, 3]);
            const items = state.filter((item, index) => index === 1);
            expect(items.map((f) => f.value)).toEqual([2]);
          });
        });

        describe(Object, () => {
          it("filters items in the object", () => {
            const state = new State({ a: 1, b: 2, c: 3, d: 4 });
            const items = state.filter((item) => item.value % 2 === 0);
            expect(items.map((f) => f.value)).toEqual([2, 4]);
          });

          it("returns empty array if none match", () => {
            const state = new State({ a: 1, b: 3 });
            const items = state.filter((item) => item.value === 2);
            expect(items).toEqual([]);
          });

          it("passes key to the predicate", () => {
            const state = new State({ a: 1, b: 2, c: 3 });
            const items = state.filter((item, key) => key === "b");
            expect(items.map((f) => f.value)).toEqual([2]);
          });
        });
      });

      describe("array", () => {
        describe("#push", () => {
          it("pushes items to array states", () => {
            const state = new State([1, 2, 3]);
            state.push(4);
            expect(state.value).toEqual([1, 2, 3, 4]);
          });

          it("returns new state", () => {
            const state = new State([1, 2, 3]);
            const result = state.push(4);
            expect(result).toBeInstanceOf(State);
            expect(result.value).toEqual(4);
          });

          describe("changes", () => {
            describe("state", () => {
              it("triggers updates", async () => {
                const state = new State([1, 2, 3]);
                const spy = vi.fn();
                state.watch(spy);
                state.push(4);
                await postpone();
                const [[value, event]]: any = spy.mock.calls;
                expect(value).toEqual([1, 2, 3, 4]);
                expect(event.changes).toMatchChanges(
                  change.atom.shape | change.child.attach,
                );
              });
            });

            describe("child", () => {
              it("triggers updates", async () => {
                const state = new State([[1, 2, 3]]);
                const spy = vi.fn();
                state.watch(spy);
                state.at(0).self.try()?.push(4);
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
                const state = new State([[[1, 2, 3]]]);
                const spy = vi.fn();
                state.watch(spy);
                state.at(0).self.try()?.at(0).self.try()?.push(4);
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

        describe("#insert", () => {
          it("inserts an item at given index", () => {
            const state = new State([1, 2, 3]);
            state.insert(0, 4);
            expect(state.value).toEqual([4, 1, 2, 3]);
            state.insert(2, 5);
            expect(state.value).toEqual([4, 1, 5, 2, 3]);
          });

          it("returns new state", () => {
            const state = new State([1, 2, 3]);
            const newState = state.insert(0, 4);
            expect(newState).toBeInstanceOf(State);
            expect(newState.value).toEqual(4);
          });

          describe("changes", () => {
            describe("state", () => {
              it("triggers updates", async () => {
                const state = new State([1, 2, 3]);
                const spy = vi.fn();
                state.watch(spy);
                state.insert(0, 4);
                await postpone();
                const [[value, event]]: any = spy.mock.calls;
                expect(value).toEqual([4, 1, 2, 3]);
                expect(event.changes).toMatchChanges(
                  change.atom.shape | change.child.attach,
                );
              });
            });

            describe("child", () => {
              it("triggers updates", async () => {
                const state = new State([[1, 2, 3]]);
                const spy = vi.fn();
                state.watch(spy);
                state.at(0).self.try()?.insert(0, 4);
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
                const state = new State([[[1, 2, 3]]]);
                const spy = vi.fn();
                state.watch(spy);
                state.at(0).self.try()?.at(0).self.try()?.insert(0, 4);
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
      });

      describe("#useCollection", () => {
        beforeEach(cleanup);

        it("allows to bind object state changes to the component", async () => {
          function Component() {
            const count = useRenderCount();
            const state = State.use<UserName>({ first: "Alexander" }, []);
            const name = state.useCollection();

            return (
              <div>
                <div data-testid="render-bind">{count}</div>

                <button onClick={() => name.$.first.set("Alex")}>
                  Rename first
                </button>

                <button onClick={() => name.$.last.set("Koss")}>
                  Give last name
                </button>
              </div>
            );
          }

          render(<Component />);

          expect(screen.getByTestId("render-bind").textContent).toBe("1");

          await act(() => screen.getByText("Rename first").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("1");

          await act(() => screen.getByText("Give last name").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("2");
        });

        it("depends on the state id", async () => {
          function Component() {
            const count = useRenderCount();
            const state = State.use<UserName[]>(
              [{ first: "Alexander" }, { first: "Sasha" }],
              [],
            );
            const [index, setIndex] = useState(0);
            state.at(index).useCollection?.();

            return (
              <div>
                <div data-testid="render-bind">{count}</div>

                <button onClick={() => setIndex(1)}>Set index to 1</button>

                <button onClick={() => state.at(1).set({ first: "Alex" })}>
                  Rename item 1
                </button>

                <button
                  onClick={() =>
                    state.at(1).set({ first: "Alex", last: "Koss" })
                  }
                >
                  Give item 1 last name
                </button>
              </div>
            );
          }

          render(<Component />);

          expect(screen.getByTestId("render-bind").textContent).toBe("1");

          await act(() => screen.getByText("Set index to 1").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("2");

          await act(() => screen.getByText("Rename item 1").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("2");

          await act(() => screen.getByText("Give item 1 last name").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("3");
        });

        it("updates the watcher on state id change", async () => {
          function Component() {
            const count = useRenderCount();
            const state = State.use<UserName[]>(
              [{ first: "Alexander" }, { first: "Sasha" }],
              [],
            );
            const [index, setIndex] = useState(0);
            const _ = state.at(index).useCollection?.();

            return (
              <div>
                <div data-testid="render-bind">{count}</div>

                <button onClick={() => setIndex(1)}>Set index to 1</button>

                <button
                  onClick={() =>
                    state.at(0).set({ first: "Alexander", last: "Koss" })
                  }
                >
                  Give item 0 last name
                </button>
              </div>
            );
          }

          render(<Component />);

          expect(screen.getByTestId("render-bind").textContent).toBe("1");

          await act(() => screen.getByText("Set index to 1").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("2");

          await act(() => screen.getByText("Give item 0 last name").click());

          expect(screen.getByTestId("render-bind").textContent).toBe("2");
        });
      });
    });

    describe("#self", () => {
      describe(".try", () => {
        describe("primitive", () => {
          it("returns the state if it's defined", () => {
            const state = new State<string | number | undefined>(42);
            const tried = state.self.try();
            tried satisfies State<string | number> | undefined;
            expect(tried).toBe(state);
            expect(tried).toBeInstanceOf(State);
            expect(tried?.value).toBe(42);
          });

          it("returns undefined if state doesn't exist", () => {
            const state = new State<string | number | undefined>(
              detachedValue as any,
            );
            expect(state.self.try()).toBe(undefined);
          });

          it("returns undefined/null if state is undefined/null", () => {
            const undefinedState = new State<string | undefined>(undefined);
            expect(undefinedState.self.try()).toBe(undefined);
            const nullState = new State<string | null>(null);
            nullState.self.try() satisfies State<string> | null;
            expect(nullState.self.try()).toBe(null);
          });
        });

        describe("instance", () => {
          it("returns the state if it's defined", () => {
            const map = new Map();
            map.set("num", 42);
            const state = new State<
              Map<string, string> | Set<string> | undefined
            >(map);
            const tried = state.self.try();
            tried satisfies
              | State<Map<string, string> | Set<string>>
              | undefined;
            expect(tried).toBe(state);
            expect(tried).toBeInstanceOf(State);
            // @ts-expect-error: This is fine!
            expect(Object.fromEntries(tried?.value)).toEqual({ num: 42 });
          });

          it("returns undefined if state doesn't exist", () => {
            const state = new State<string | number | undefined>(
              detachedValue as any,
            );
            expect(state.self.try()).toBe(undefined);
          });

          it("returns undefined/null if state is undefined/null", () => {
            const undefinedState = new State<string | undefined>(undefined);
            expect(undefinedState.self.try()).toBe(undefined);
            const nullState = new State<string | null>(null);
            const tried = nullState.self.try();
            tried satisfies State<string> | null;
            expect(tried).toBe(null);
          });
        });
      });

      describe(".remove", () => {
        it("removes the state", () => {
          const state = new State<UserName>({ first: "Sasha", last: "Koss" });
          state.$.last.self.remove();
          expect(state.value).toEqual({ first: "Sasha" });
        });

        it("returns the removed state", () => {
          const state = new State<UserName>({ first: "Sasha", last: "Koss" });
          const lastState = state.$.last;
          const removedState = lastState.self.remove();
          expect(removedState).toBe(state.$.last);
          expect(removedState.value).toBe(undefined);
        });
      });
    });
  });

  describe("tree", () => {
    describe("#parent", () => {
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

    describe("#key", () => {
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

    describe("#root", () => {
      it("returns the root state", () => {
        const state = new State({ user: { name: ["Sasha"] } });
        expect(state.$.user.$.name.at(0).root).toBe(state);
        expect(state.root).toBe(state);
      });
    });

    describe("#path", () => {
      it("returns the path to the state", () => {
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

    describe("#name", () => {
      it("returns the state name", () => {
        const state = new State({ address: { name: { first: "Sasha" } } });
        expect(state.$.address.$.name.$.first.name).toEqual(
          "address.name.first",
        );
      });

      it("returns dot for root state", () => {
        const state = new State({ name: { first: "Sasha" } });
        expect(state.name).toEqual(".");
      });

      it("returns the source name for computed states", () => {
        const state = new State({ name: { first: "Sasha" } });
        const computed = state.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.name).toEqual("name.first");
      });
    });

    describe("#$/#at", () => {
      it("returns undefined for primitive", () => {
        const state = new State(42);
        expect(state.$).toBe(undefined);
      });

      it("returns undefined for instance", () => {
        const state = new State(new Map());
        expect(state.$).toBe(undefined);
      });

      describe("object", () => {
        it("allows to access states", () => {
          const state = new State({ num: 42 });
          const num = state.$.num;
          expect(num).toBeInstanceOf(State);
          expect(num.value).toBe(42);
        });

        it("allows to access record states", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          const numA = state.$["num"];
          expect(numA?.value).toBe(42);
          const numB = state.at("num");
          expect(numB.value).toBe(42);
        });

        it("preserves states", () => {
          const state = new State({ num: 42 });
          const numA = state.$.num;
          const numB = state.$.num;
          expect(numA).toBeInstanceOf(State);
          expect(numA).toBe(numB);
        });

        it("allows to access undefined states", () => {
          const state = new State<{ num?: number; str?: string }>({
            num: 42,
          });
          const str = state.$.str;
          expect(str).toBeInstanceOf(State);
          expect(str.value).toBe(undefined);
        });

        it("preserves undefined states", () => {
          const state = new State<{ num?: number; str?: string }>({
            num: 42,
          });
          const stateA = state.$.str;
          const stateB = state.$.str;
          expect(stateA).toBe(stateB);
        });
      });

      describe("array", () => {
        it("allows to access items", () => {
          const state = new State([1, 2, 3, 4]);
          const item = state.$[3];
          expect(item).toBeInstanceOf(State);
          expect(item?.value).toBe(4);
        });

        it("preserves items", () => {
          const state = new State([1, 2, 3, 4]);
          const itemA = state.$[3];
          const itemB = state.$[3];
          expect(itemA).toBeInstanceOf(State);
          expect(itemA).toBe(itemB);
        });

        it("allows to access undefined items", () => {
          const state = new State([1, 2, 3, 4]);
          const item = state.at(10);
          expect(item).toBeInstanceOf(State);
          expect(item.value).toBe(undefined);
        });

        it("preserves undefined items", () => {
          const state = new State([1, 2, 3, 4]);
          const itemA = state.at(10);
          const itemB = state.at(10);
          expect(itemA).toBe(itemB);
        });
      });
    });

    describe("#try", () => {
      describe("primitive", () => {
        it("is undefined", () => {
          const state = new State(42);
          expect(state.try).toBe(undefined);
        });
      });

      describe("object", () => {
        it("returns the state if it exists", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          const tried = state.try("num");
          tried satisfies State<number> | undefined;
          expect(tried).toBeInstanceOf(State);
          expect(tried?.value).toBe(42);
        });

        it("returns undefined if state doesn't exist", () => {
          const state = new State<Record<string, number>>({ num: 42 });
          expect(state.try("bum")).toBe(undefined);
        });

        it("returns undefined/null if state is undefined/null", () => {
          const state = new State<Record<string, number | undefined | null>>({
            num: 42,
            bum: undefined,
            hum: null,
          });
          const tried = state.try("bum");
          tried satisfies State<number> | undefined | null;
          expect(tried).toBe(undefined);
          expect(state.try("hum")).toBe(null);
        });
      });

      describe("array", () => {
        it("returns the item if it exists", () => {
          const state = new State<Array<number>>([1, 2, 3]);
          const tried = state.try(1);
          tried satisfies State<number> | undefined;
          expect(tried).toBeInstanceOf(State);
          expect(tried?.value).toBe(2);
        });

        it("returns undefined if item doesn't exist", () => {
          const state = new State<Array<number>>([1, 2, 3]);
          const tried = state.try(5);
          expect(tried).toBe(undefined);
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

    describe("#lookup", () => {
      describe("primitive", () => {
        it("returns itself for empty path", () => {
          const state = new State(42);
          const lookup = state.lookup([]);
          expect(lookup).toBe(state);
        });

        it("returns undefined for non-empty path", () => {
          const state = new State(42);
          const lookup = state.lookup(["length"]);
          expect(lookup).toBe(undefined);
        });
      });

      describe("object", () => {
        it("returns itself for empty path", () => {
          const state = new State({ num: 42 });
          const lookup = state.lookup([]);
          expect(lookup).toBe(state);
        });

        it("returns the state for valid path", () => {
          const state = new State({ num: 42 });
          const lookup = state.lookup(["num"]);
          expect(lookup).toBe(state.$.num);
        });

        it("returns undefined for invalid path", () => {
          const state = new State({ num: 42 });
          const lookup = state.lookup(["bum", "bum"]);
          expect(lookup).toBe(undefined);
        });

        it("correctly returns detached state", () => {
          const state = new State<{ num?: number }>({});
          const lookup = state.lookup(["num"]);
          expect(lookup).toBe(state.$.num);
        });
      });

      describe("array", () => {
        it("returns itself for empty path", () => {
          const state = new State([1, 2, 3]);
          const lookup = state.lookup([]);
          expect(lookup).toBe(state);
        });

        it("returns the item for valid path", () => {
          const state = new State([1, 2, 3]);
          const lookup = state.lookup([1]);
          expect(lookup).toBe(state.$[1]);
        });

        it("returns undefined for invalid path", () => {
          const state = new State([1, 2, 3]);
          const lookup = state.lookup([5, 2]);
          expect(lookup).toBe(undefined);
        });

        it("correctly returns detached state", () => {
          const state = new State<number[]>([]);
          const lookup = state.lookup([0]);
          expect(lookup).toBe(state.at(0));
        });
      });
    });
  });

  describe("ref", () => {
    describe("#optional", () => {
      it("returns optional state", () => {
        const state = new State<string | number | undefined>(undefined);
        const ref = state.optional();
        expect(ref.value).toBeUndefined();
      });

      describe("#at", () => {
        describe("primitive", () => {
          it("returns the undefined state as is if it's defined", () => {
            const state = new State<string | number | undefined>(undefined);
            const ref = state.optional();
            expect(ref.value).toBeUndefined();
          });
        });

        describe("object", () => {
          it("returns the undefined state as is if it's defined", () => {
            const state = new State<{ a: string } | undefined>(undefined);
            const ref = state.optional();
            expect(ref.value).toBeUndefined();
          });

          it("allows to access properties by key", () => {
            const state = new State<{ a?: string } | undefined>(undefined);
            const ref = state.optional().at("a");
            expect(ref.value).toBeUndefined();
          });

          it("allows accessing maybe undefined properties", () => {
            const state = new State<
              { a?: { b?: { c?: number | string } } } | undefined
            >(undefined);
            const ref = state.optional().at("a").at("b").at("c");
            expect(ref.value).toBeUndefined();
          });

          it("resolves proper state for deep nested properties", () => {
            const state = new State<
              { a?: { b?: { c?: number | string } } } | undefined
            >({ a: { b: { c: 123 } } });
            const ref = state.optional().at("a").at("b").at("c");
            expect(ref.value).toBe(123);
          });
        });

        describe("array", () => {
          it("returns the undefined state as is if it's defined", () => {
            const state = new State<string[] | undefined>(undefined);
            const ref = state.optional();
            expect(ref.value).toBeUndefined();
          });

          it("allows to access items by index", () => {
            const state = new State<string[] | undefined>(undefined);
            const ref = state.optional().at(0);
            expect(ref.value).toBeUndefined();
          });

          it("allows accessing maybe undefined items", () => {
            const state = new State<string[][][] | undefined>(undefined);
            const ref = state.optional().at(0).at(0).at(0);
            expect(ref.value).toBeUndefined();
          });

          it("resolves proper state for deep nested items", () => {
            const state = new State<string[][][] | undefined>([[["a"]]]);
            const ref = state.optional().at(0).at(0).at(0);
            expect(ref.value).toBe("a");
          });
        });

        describe("instance", () => {
          it("returns the undefined state as is if it's defined", () => {
            const state = new State<Set<string> | undefined>(undefined);
            const ref = state.optional();
            expect(ref.value).toBeUndefined();
          });

          it.todo("does not allow to access items by key", () => {
            const state = new State<Set<string> | undefined>(undefined);
            // TODO:
            // const ref = stateRef
            //   .maybe(new Set<string>())
            //   // @ts-expect-error: It should not be available
            //   .maybe("has", (val: string) => false);
            // ref satisfies never;
            // expect(ref instanceof MaybeStateRef).toBe(true);
            // expect(() => ref.at("a")).toThrowError(
            //   "Cannot access items of a Set by key"
            // );
          });
        });
      });
    });
  });

  describe("events", () => {
    describe("#events", () => {
      it("is a events tree instance", () => {
        const state = new State(42);
        expect(state.events).toBeInstanceOf(EventsTree);
      });

      it("points to the root parent events tree", () => {
        const state = new State({ a: { b: { c: 42 } } });
        expect(state.$.a.$.b.events).toBe(state.events);
        expect(state.$.a.$.b.$.c.events).toBe(state.events);
      });
    });

    describe("#trigger", () => {
      it("triggers the watchers", async () => {
        const state = new State(42);
        const spy = vi.fn();
        state.watch(spy);
        state.trigger(change.atom.value);
        await postpone();
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ changes: change.atom.value }),
        );
      });

      it("doesn't trigger parent states", () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.watch(spy);
        state.$.num.trigger(change.atom.value);
        expect(spy).not.toHaveBeenCalled();
      });

      it("allows to notify parent states", async () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.watch(spy);
        state.$.num.trigger(change.atom.value, true);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ num: 42 });
        expect(event.changes).toMatchChanges(change.child.value);
      });

      it("notifies parents about child blurring", async () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.watch(spy);
        state.$.num.trigger(change.atom.blur, true);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ num: 42 });
        expect(event.changes).toMatchChanges(change.child.blur);
      });

      it("notifies parents about nested child blurring", async () => {
        const state = new State({ user: { name: { first: "Sasha" } } });
        const spy = vi.fn();
        state.watch(spy);
        state.$.user.$.name.$.first.trigger(change.atom.blur, true);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ user: { name: { first: "Sasha" } } });
        expect(event.changes).toMatchChanges(change.subtree.blur);
      });

      it("batches the changes", async () => {
        const state = new State({ user: { name: { first: "Sasha" } } });
        const spy = vi.fn();
        state.watch(spy);
        state.$.user.$.name.$.first.trigger(change.atom.blur, true);
        state.$.user.$.name.$.first.trigger(change.atom.shape, true);
        await postpone();
        expect(spy).toHaveBeenCalledOnce();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ user: { name: { first: "Sasha" } } });
        expect(event.changes).toMatchChanges(
          change.subtree.blur | change.subtree.shape,
        );
      });

      describe.todo("child");

      describe.todo("subtree");
    });

    describe("#withhold", () => {
      it("allows to withhold the events until it's unleashed", async () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.watch(spy);
        // @ts-expect-error -- WIP
        state.withhold();
        state.$.num.trigger(change.atom.value, true);
        state.$.num.trigger(change.child.detach, true);
        state.$.num.trigger(change.child.attach, true);
        await postpone();
        expect(spy).not.toHaveBeenCalled();

        // @ts-expect-error -- WIP
        state.unleash();

        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ num: 42 });
        expect(event.changes).toMatchChanges(
          change.child.value | change.subtree.detach | change.subtree.attach,
        );
      });

      it("combines the changes into a single event", async () => {
        const state = new State(42);
        const spy = vi.fn();
        state.watch(spy);
        // @ts-expect-error -- WIP
        state.withhold();
        state.trigger(change.atom.value, true);
        state.trigger(change.child.detach, true);
        state.trigger(change.child.attach, true);

        await postpone();
        expect(spy).not.toHaveBeenCalled();

        // @ts-expect-error -- WIP
        state.unleash();

        await postpone();
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({
            changes:
              change.atom.value | change.child.detach | change.child.attach,
          }),
        );
      });

      it("neutralizes valid/invalid changes", async () => {
        const state = new State(42);
        const spy = vi.fn();
        state.watch(spy);
        // @ts-expect-error -- WIP
        state.withhold();
        state.trigger(change.atom.value, true);
        state.trigger(change.atom.invalid, true);
        state.trigger(change.atom.valid, true);

        await postpone();
        expect(spy).not.toHaveBeenCalled();

        // @ts-expect-error -- WIP
        state.unleash();

        await postpone();
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ changes: change.atom.value }),
        );
      });
    });

    describe("#watch", () => {
      describe("primitive", () => {
        it("allows to subscribe for state changes", async () => {
          const state = new State(42);

          const unsub = state.watch((value) => {
            expect(value).toBe(43);
            unsub();
            // Check if the callback is not called after unsub
            state.set(44);
            setTimeout(resolve);
          });

          state.set(43);

          function resolve() {
            // Test passes if we reach here without the callback being called again
          }
        });

        it("provides event object with change type as changes", async () => {
          const state = new State(42);

          const unsub = state.watch((value, event) => {
            expect(event.changes).toBe(change.atom.value);
            unsub();
          });

          state.set(43);
          await postpone();
        });

        describe.todo("changes");
      });

      describe("object", () => {
        it("listens to the state changes", async () => {
          const state = new State({ num: 42 });

          const unsub = state.watch((value, event) => {
            try {
              expect(event.changes).toMatchChanges(change.child.value);
              expect(value.num).toBe(43);
            } finally {
              unsub();
            }
          });

          state.$.num.set(43);
          await postpone();
        });

        it("listens to states create", async () => {
          const state = new State<{ num: number; str?: string }>({
            num: 42,
          });

          const unsub = state.watch((value, event) => {
            expect(event.changes).toBe(change.child.attach | change.atom.shape);
            expect(value.str).toBe("Hello!");
            unsub();
          });

          state.$.str.set("Hello!");
          await postpone();
        });

        it("listens to state object create", async () => {
          const state = new State<Record<number, { n: number }>>({
            1: { n: 1 },
            2: { n: 2 },
          });

          return new Promise<void>((resolve, reject) => {
            const unsub = state.watch((value, event) => {
              try {
                expect(event.changes).toMatchChanges(
                  change.child.attach | change.atom.shape,
                );
                expect(value[3]).toEqual({ n: 3 });
                unsub();
              } catch (error) {
                reject(error);
                return;
              }
              resolve();
            });

            state.at(3).set({ n: 3 });
          });
        });

        describe("changes", () => {
          describe.todo("state");

          describe.todo("child");

          describe.todo("subtree");
        });
      });

      describe("array", () => {
        it("listens to the item state changes", async () => {
          const state = new State([1, 2, 3]);

          const unsub = state.watch((value, event) => {
            try {
              expect(event.changes).toMatchChanges(change.child.value);
              expect(value[1]).toBe(43);
            } finally {
              unsub();
            }
          });

          state.at(1).set(43);
          await postpone();
        });

        it("listens to items create", async () => {
          const state = new State([1, 2, 3]);

          const unsub = state.watch((value, event) => {
            expect(event.changes).toBe(change.child.attach | change.atom.shape);
            expect(value[5]).toBe(43);
            unsub();
          });

          state.at(5).set(43);
          await postpone();
        });

        it("listens to items object create", async () => {
          const state = new State<Array<{ n: number }>>([{ n: 1 }, { n: 2 }]);

          return new Promise<void>((resolve, reject) => {
            const unsub = state.watch((value, event) => {
              try {
                expect(event.changes).toMatchChanges(
                  change.child.attach | change.atom.shape,
                );
                expect(value[2]).toEqual({ n: 3 });
                unsub();
              } catch (error) {
                reject(error);
                return;
              }
              resolve();
            });

            state.at(2).set({ n: 3 });
          });
        });

        describe("changes", () => {
          describe.todo("state");

          describe.todo("child");

          describe.todo("subtree");
        });
      });

      describe("instance", () => {
        it("allows to subscribe for state changes", async () => {
          const map = new Map();
          map.set("num", 42);
          const state = new State(map);

          const unsub = state.watch((value) => {
            expect(Object.fromEntries(value)).toEqual({ num: 43 });
            unsub();
            // Check if the callback is not called after unsub
            state.set(new Map());
          });

          const newMap = new Map();
          newMap.set("num", 43);
          state.set(newMap);
          await postpone();
        });

        it("provides event object with change type as changes", async () => {
          const state = new State(42);

          const unsub = state.watch((value, event) => {
            expect(event.changes).toBe(change.atom.value);
            unsub();
          });

          state.set(43);
          await postpone();
        });

        describe.todo("changes");
      });
    });

    describe("#unwatch", () => {
      it("unsubscribes all watchers", () => {
        const state = new State(42);
        const spy = vi.fn();
        state.watch(spy);
        // @ts-expect-error -- WIP
        state.unwatch();
        state.set(43);
        expect(spy).not.toHaveBeenCalled();
      });

      it("unsubscribes all children", () => {
        const state = new State({ num: 42 });
        const spy = vi.fn();
        state.$.num?.watch(spy);
        // @ts-expect-error -- WIP
        state.unwatch();
        state.$.num?.set(43);
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe("#useWatch", () => {
      beforeEach(cleanup);

      it("allows to watch for state using a function", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use({ name: { first: "Alexander" } }, []);
          const [name, setName] = useState(state.$.name.value);
          state.$.name.useWatch(setName, []);

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => state.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <div data-testid="name">{name.first}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("name").textContent).toBe("Alexander");
        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Rename").click());

        expect(screen.getByTestId("name").textContent).toBe("Sasha");
        expect(screen.getByTestId("render-watch").textContent).toBe("2");
      });

      it("depends on the state id", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const state = State.use(
            [{ name: "Alexander" }, { name: "Sasha" }],
            [],
          );
          const [index, setIndex] = useState(0);
          state.at(index).useWatch(spy, []);

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => state.at(1).set({ name: "Alex" })}>
                Rename item 1
              </button>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(spy).toHaveBeenCalledOnce();
        {
          const [[value, event]] = spy.mock.calls as any;
          expect(value).toEqual({ name: "Sasha" });
          expect(event.changes).toMatchChanges(change.atom.id);
        }

        await act(() => screen.getByText("Rename item 1").click());

        expect(spy).toHaveBeenCalledTimes(2);
        {
          const [, [value, event]] = spy.mock.calls as any;
          expect(value).toEqual({ name: "Alex" });
          expect(event.changes).toMatchChanges(change.child.value);
        }

        expect(screen.getByTestId("render-watch").textContent).toBe("2");
      });

      it("updates the watcher on state id change", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const state = State.use(
            [{ name: "Alexander" }, { name: "Sasha" }],
            [],
          );
          const [index, setIndex] = useState(0);
          state.at(index).useWatch(spy, []);

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => state.at(1).set({ name: "Alex" })}>
                Rename item 1
              </button>

              <button onClick={() => state.at(0).set({ name: "A." })}>
                Rename item 0
              </button>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("render-watch").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith(
          { name: "Sasha" },
          expect.objectContaining({
            changes: change.atom.id,
          }),
        );

        await act(() => screen.getByText("Rename item 0").click());

        expect(spy).toHaveBeenCalledOnce();

        expect(screen.getByTestId("render-watch").textContent).toBe("2");
      });
    });
  });

  describe("transform", () => {
    describe("#into", () => {
      it("allows to create a proxy state", () => {
        const state = new State({ message: "Hello, world!" });
        const proxy = state.$.message.into(toCodes).from(fromCodes);
        expect(proxy.value).toEqual([
          72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33,
        ]);
      });

      it("updates the state back from proxy", async () => {
        const state = new State({ message: "Hello, world!" });
        const proxy = state.$.message.into(toCodes).from(fromCodes);
        proxy.set([72, 105, 33]);
        await postpone();
        expect(state.value).toEqual({ message: "Hi!" });
      });

      it("passes the current value as 2nd argument", () => {
        const state = new State({ message: "Hello, world!" });
        const intoSpy = vi.fn().mockReturnValue("Hey!");
        const fromSpy = vi.fn().mockReturnValue("Yo!");
        const proxy = state.$.message.into(intoSpy).from(fromSpy);
        proxy.set("Hi!");
        // into
        expect(intoSpy).toHaveBeenCalledOnce();
        expect(intoSpy).toBeCalledWith("Hello, world!", undefined);
        // from
        expect(fromSpy).toHaveBeenCalledOnce();
        expect(fromSpy).toBeCalledWith("Hi!", "Hello, world!");
      });

      it("triggers state update", async () => {
        const state = new State({ message: "Hello, world!" });
        const proxy = state.$.message.into(toCodes).from(fromCodes);

        const unsub = state.$.message.watch((value) => {
          expect(value).toBe("Hi!");
          unsub();
        });

        proxy.set([72, 105, 33]);
        await postpone();
      });

      describe("value", () => {
        describe("#set", () => {
          it("allows chaining multiple computed states", async () => {
            const source = new State<{
              name?: { first?: string; last?: string };
            }>({});
            const name = source.$.name
              .into((name) => name || {})
              .from((name) => name);
            const first = name.$.first
              .into((first) => first || "")
              .from((first) => first);
            const last = name.$.last
              .into((last) => last || "")
              .from((last) => last);
            first.set("Sasha");
            await postpone();
            expect(first.value).toBe("Sasha");
            expect(name.value).toEqual({ first: "Sasha" });
            expect(source.value).toEqual({ name: { first: "Sasha" } });
            last.set("Koss");
            await postpone();
            expect(last.value).toBe("Koss");
            expect(name.value).toEqual({ first: "Sasha", last: "Koss" });
            expect(source.value).toEqual({
              name: { first: "Sasha", last: "Koss" },
            });
          });
        });
      });

      describe("events", () => {
        it("delegates events to the source state", async () => {
          const source = new State<string>("Hello, world!");
          const proxy = source.into(() => "Hi!").from((value) => value);
          const spy = vi.fn();
          source.watch(spy);
          proxy.trigger(change.atom.blur, true);
          await postpone();
          expect(spy).toHaveBeenCalledOnce();
          expect(spy).toReceiveChanges(change.atom.blur);
        });

        it("delegates events through a detached state", async () => {
          const source = new State<{
            name?: { first?: string; last?: string };
          }>({});
          const sourceSpy = vi.fn();
          source.watch(sourceSpy);
          const detachedSpy = vi.fn();
          source.$.name.watch(detachedSpy);
          const proxy = source.$.name
            .into((name) => [name?.first, name?.last].join(" "))
            .from(fromFullName);
          proxy.trigger(change.atom.blur, true);
          await postpone();
          expect(sourceSpy).toHaveBeenCalledOnce();
          expect(sourceSpy).toReceiveChanges(change.child.blur);
          expect(detachedSpy).toHaveBeenCalledOnce();
          expect(detachedSpy).toReceiveChanges(change.atom.blur);
        });

        it("delegates events through proxy chains", async () => {
          const source = new State<{
            name?: { first?: string; last?: string };
          }>({});
          const sourceSpy = vi.fn();
          source.watch(sourceSpy);
          const name = source.$.name
            .into((name) => name || {})
            .from((name) => name);
          const nameSpy = vi.fn();
          name.watch(nameSpy);
          const first = name.$.first
            .into((first) => first || "")
            .from((first) => first);
          first.trigger(change.atom.blur, true);
          await postpone();
          expect(sourceSpy).toHaveBeenCalledOnce();
          expect(sourceSpy).toReceiveChanges(change.subtree.blur);
          expect(nameSpy).toHaveBeenCalledOnce();
          expect(nameSpy).toReceiveChanges(change.child.blur);
        });
      });
    });

    describe("#useInto", () => {
      beforeEach(cleanup);

      it("allows to compute state", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use({ message: "Hello" }, []);
          const codes = state.$.message
            .useInto(toCodes, [])
            .from(fromCodes, []);

          return (
            <div>
              <div data-testid="render-compute">{count}</div>

              <StringComponent string={state.$.message} />

              <CodesComponent codes={codes} />

              <button onClick={() => codes.set([72, 105, 33])}>Say hi</button>

              <button onClick={() => state.$.message.set("Yo")}>Say yo</button>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("string").textContent).toBe("Hello");
        expect(screen.getByTestId("codes").textContent).toBe(
          "72 101 108 108 111",
        );

        await act(() => screen.getByText("Say hi").click());

        expect(screen.getByTestId("string").textContent).toBe("Hi!");
        expect(screen.getByTestId("codes").textContent).toBe("72 105 33");

        await act(() => screen.getByText("Say yo").click());

        expect(screen.getByTestId("string").textContent).toBe("Yo");
        expect(screen.getByTestId("codes").textContent).toBe("89 111");
        expect(screen.getByTestId("render-compute").textContent).toBe("1");
        expect(screen.getByTestId("render-string").textContent).toBe("3");
        expect(screen.getByTestId("render-codes").textContent).toBe("3");
      });

      it("depends on the state id", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<string[]>(["Hello", "Yo"], []);
          const [index, setIndex] = useState(0);
          const codes = state
            .at(index)
            .useInto(toCodes, [])
            .from(fromCodes, []);

          return (
            <div>
              <div data-testid="render-into">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <CodesComponent codes={codes} />
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("codes").textContent).toBe(
          "72 101 108 108 111",
        );
        expect(screen.getByTestId("render-into").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("codes").textContent).toBe("89 111");
        expect(screen.getByTestId("render-into").textContent).toBe("2");
      });

      it("passes the current value as 2nd argument", async () => {
        const intoSpy = vi.fn().mockReturnValue("Hey!");
        const fromSpy = vi.fn().mockReturnValue("Yo!");

        function Component() {
          const state = State.use({ message: "Hello, world!" }, []);
          const computed = state.$.message
            .useInto(intoSpy, [])
            .from(fromSpy, []);

          return (
            <div>
              <button onClick={() => computed.set("Hi!")}>Say hi</button>
            </div>
          );
        }

        render(<Component />);

        await act(() => screen.getByText("Say hi").click());

        await postpone();

        // into
        expect(intoSpy).toHaveBeenCalledOnce();
        expect(intoSpy).toBeCalledWith("Hello, world!", undefined);
        // from
        expect(fromSpy).toHaveBeenCalledOnce();
        expect(fromSpy).toBeCalledWith("Hi!", "Hello, world!");
      });

      it("updates the watcher on state id change", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<string[]>(["Hello", "Yo"], []);
          const [index, setIndex] = useState(0);
          const codes = state
            .at(index)
            .useInto(toCodes, [])
            .from(fromCodes, []);

          return (
            <div>
              <div data-testid="render-into">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => state.at(0).set("Duh")}>
                Rename item 1
              </button>

              <CodesComponent codes={codes} />
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("codes").textContent).toBe(
          "72 101 108 108 111",
        );
        expect(screen.getByTestId("render-into").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("codes").textContent).toBe("89 111");
        expect(screen.getByTestId("render-into").textContent).toBe("2");

        await act(() => screen.getByText("Rename item 1").click());

        expect(screen.getByTestId("codes").textContent).toBe("89 111");
        expect(screen.getByTestId("render-into").textContent).toBe("2");
      });
    });

    describe("#decompose", () => {
      it("allows to decompose the state type", () => {
        const state = new State<string | number | Record<string, number>>(
          "Hello, world!",
        );
        const decomposed = state.decompose();
        if (typeof decomposed.value === "string") {
          expect(decomposed.state.value).toBe("Hello, world!");
          return;
        }
        assert(false, "Should not reach here");
      });
    });

    describe("#useDecompose", () => {
      beforeEach(cleanup);

      it("decomposes and updates on state change", async () => {
        type Payload = { data: string } | { data: number };

        const state = new State<Payload>({ data: "hello" });
        const callback = vi.fn(
          (newValue, prevValue) =>
            typeof newValue.data !== typeof prevValue.data,
        );

        function Component() {
          const decomposed = state.useDecompose(callback, [state]);
          return <div data-testid="data">{String(decomposed.value.data)}</div>;
        }

        render(<Component />);
        expect(screen.getByTestId("data").textContent).toBe("hello");
        expect(callback).not.toHaveBeenCalled();

        await act(() => state.set({ data: 42 }));

        expect(screen.getByTestId("data").textContent).toBe("42");
        expect(callback).toHaveBeenCalledWith({ data: 42 }, { data: "hello" });
      });

      it("allows to decompose union state", async () => {
        function Component() {
          const count = useRenderCount();
          const address = State.use<Address>(
            { name: { first: "Alexander" } },
            [],
          );
          const name = address.$.name.useDecompose(
            (newName, prevName) => typeof newName !== typeof prevName,
            [],
          );

          return (
            <div>
              <div data-testid="render-decompose">{count}</div>

              {typeof name.value === "string" ? (
                <div>
                  <button
                    onClick={() =>
                      (name.state as State<string>).set("Alexander")
                    }
                  >
                    Rename
                  </button>

                  <StringComponent string={name.state as State<string>} />
                </div>
              ) : (
                <div>
                  <input
                    data-testid="input-name-first"
                    onChange={(e) => {
                      name.state.$?.first.set(e.currentTarget.value);
                    }}
                    value={name.state.$?.first.value || ""}
                  />

                  <button onClick={() => address.$.name.set("Alex")}>
                    Set string name
                  </button>

                  <UserNameComponent name={name.state as State<UserName>} />
                </div>
              )}
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("name-0").textContent).toBe("1Alexander");

        await act(() => {
          fireEvent.input(screen.getByTestId("input-name-first"), {
            target: { value: "Sasha" },
          });
        });

        expect(screen.getByTestId("name-0").textContent).toBe("2Sasha");
        expect(screen.getByTestId("render-decompose").textContent).toBe("1");

        await act(() => screen.getByText("Set string name").click());

        expect(screen.queryByTestId("name")).toBeNull();
        expect(screen.getByTestId("string").textContent).toBe("Alex");

        await act(() => screen.getByText("Rename").click());

        expect(screen.getByTestId("string").textContent).toBe("Alexander");
        expect(screen.getByTestId("render-decompose").textContent).toBe("2");
      });

      it("depends on the state id", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<Array<string | UserName>>(
            ["Alexander", { first: "Sasha", last: "Koss" }],
            [],
          );
          const [index, setIndex] = useState(0);
          const name = state
            .at(index)
            .useDecompose((a, b) => typeof a !== typeof b, []);
          const nameType = typeof name.value;

          return (
            <div>
              <div data-testid="render-decompose">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="decomposed">{nameType}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("decomposed").textContent).toBe("string");
        expect(screen.getByTestId("render-decompose").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("decomposed").textContent).toBe("object");
        expect(screen.getByTestId("render-decompose").textContent).toBe("2");
      });

      it("updates the watcher on state id change", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<Array<string | UserName>>(
            ["Alexander", { first: "Sasha", last: "Koss" }],
            [],
          );
          const [index, setIndex] = useState(0);
          const name = state
            .at(index)
            .useDecompose((a, b) => typeof a !== typeof b, []);
          const nameType = typeof name.value;

          return (
            <div>
              <div data-testid="render-decompose">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() =>
                  state.at(0).set({ first: "Alexander", last: "Koss" })
                }
              >
                Make item 1 object
              </button>

              <div data-testid="decomposed">{nameType}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("decomposed").textContent).toBe("string");
        expect(screen.getByTestId("render-decompose").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("decomposed").textContent).toBe("object");
        expect(screen.getByTestId("render-decompose").textContent).toBe("2");

        await act(() => screen.getByText("Make item 1 object").click());

        expect(screen.getByTestId("decomposed").textContent).toBe("object");
        expect(screen.getByTestId("render-decompose").textContent).toBe("2");
      });
    });

    describe("#discriminate", () => {
      it("allows to discriminate by state", () => {
        const state = new State<Cat | Dog>({ type: "cat", meow: true });
        const discriminated = state.discriminate("type");
        if (discriminated.discriminator === "cat") {
          expect(discriminated.state.value.meow).toBe(true);
          return;
        }
        assert(false, "Should not reach here");
      });

      it("handles undefineds", () => {
        const state = new State<Cat | Dog | undefined>(undefined);
        const discriminated = state.discriminate("type");
        if (!discriminated.discriminator) {
          expect(discriminated.state.value).toBe(undefined);
          return;
        }
        assert(false, "Should not reach here");
      });
    });

    describe("#useDiscriminate", () => {
      beforeEach(cleanup);

      it("discriminates and updates on state change", async () => {
        const state = new State<Cat | Dog>({ type: "cat", meow: true });

        function TestComponent() {
          const discriminated = state.useDiscriminate("type");
          return (
            <div data-testid="type">
              {discriminated.discriminator}:{" "}
              {discriminated.discriminator === "cat"
                ? String(discriminated.state.value.meow)
                : discriminated.discriminator === "dog"
                  ? String(discriminated.state.value.bark)
                  : ""}
            </div>
          );
        }

        render(<TestComponent />);
        expect(screen.getByTestId("type").textContent).toBe("cat: true");

        await act(() => state.set({ type: "dog", bark: false }));

        expect(screen.getByTestId("type").textContent).toBe("dog: false");
      });

      it("handles undefineds", async () => {
        const state = new State<Cat | Dog | undefined>(undefined);

        function TestComponent() {
          const discriminated = state.useDiscriminate("type");
          return (
            <div data-testid="type">
              {String(discriminated.discriminator)}:{" "}
              {String(discriminated.state.value?.type)}
            </div>
          );
        }

        render(<TestComponent />);
        expect(screen.getByTestId("type").textContent).toBe(
          "undefined: undefined",
        );

        await act(() => state.set({ type: "cat", meow: true }));

        expect(screen.getByTestId("type").textContent).toBe("cat: cat");
      });

      it("allows to discriminate union state", async () => {
        interface TestState {
          hello: Hello;
        }

        function Component() {
          const count = useRenderCount();
          const state = State.use<TestState>(
            {
              hello: { lang: "human", text: "Hello" },
            },
            [],
          );
          const hello = state.$.hello.useDiscriminate("lang");

          return (
            <div>
              <div data-testid="render-hello">{count}</div>

              {hello.discriminator === "human" ? (
                <div>
                  <button
                    onClick={() =>
                      hello.state.set({
                        lang: "human",
                        text: "Hola",
                      })
                    }
                  >
                    Say hola
                  </button>

                  <button
                    onClick={() =>
                      state.$.hello.set({
                        lang: "machine",
                        binary: 0b1101010,
                      })
                    }
                  >
                    Switch to binary
                  </button>

                  <StringComponent string={hello.state.$.text} />
                </div>
              ) : (
                hello.discriminator === "machine" && (
                  <div>
                    <button
                      onClick={() =>
                        state.$.hello.set({
                          lang: "machine",
                          binary: 0b1010101,
                        })
                      }
                    >
                      Say 1010101
                    </button>

                    <NumberComponent number={hello.state.$.binary} />
                  </div>
                )
              )}
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("string").textContent).toBe("Hello");

        await act(() => screen.getByText("Say hola").click());

        expect(screen.getByTestId("string").textContent).toBe("Hola");
        expect(screen.getByTestId("render-hello").textContent).toBe("1");

        await act(() => screen.getByText("Switch to binary").click());

        expect(screen.queryByTestId("string")).toBeNull();
        expect(screen.getByTestId("number").textContent).toBe("106");

        await act(() => screen.getByText("Say 1010101").click());

        expect(screen.getByTestId("number").textContent).toBe("85");
        expect(screen.getByTestId("render-hello").textContent).toBe("2");
      });

      it("depends on the state id", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<Hello[]>(
            [
              { lang: "human", text: "Hello" },
              { lang: "machine", binary: 0b1101010 },
            ],
            [],
          );
          const [index, setIndex] = useState(0);
          const hello = state.at(index).useDiscriminate("lang");

          return (
            <div>
              <div data-testid="render-discriminate">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="discriminate">{hello.discriminator}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("discriminate").textContent).toBe("human");
        expect(screen.getByTestId("render-discriminate").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("discriminate").textContent).toBe("machine");
        expect(screen.getByTestId("render-discriminate").textContent).toBe("2");
      });

      it("updates the watcher on state id change", async () => {
        function Component() {
          const count = useRenderCount();
          const state = State.use<Hello[]>(
            [
              { lang: "human", text: "Hello" },
              { lang: "machine", binary: 0b1101010 },
            ],
            [],
          );
          const [index, setIndex] = useState(0);
          const hello = state.at(index).useDiscriminate("lang");

          return (
            <div>
              <div data-testid="render-discriminate">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() => state.at(0).set({ lang: "dog", chicken: true })}
              >
                Make item 1 dog
              </button>

              <div data-testid="discriminate">{hello.discriminator}</div>
            </div>
          );
        }

        render(<Component />);

        expect(screen.getByTestId("discriminate").textContent).toBe("human");
        expect(screen.getByTestId("render-discriminate").textContent).toBe("1");

        await act(() => screen.getByText("Set index to 1").click());

        expect(screen.getByTestId("discriminate").textContent).toBe("machine");
        expect(screen.getByTestId("render-discriminate").textContent).toBe("2");

        await act(() => screen.getByText("Make item 1 dog").click());

        expect(screen.getByTestId("discriminate").textContent).toBe("machine");
        expect(screen.getByTestId("render-discriminate").textContent).toBe("2");
      });

      type Hello = HelloMachine | HelloHuman | HelloDog;

      interface HelloMachine {
        lang: "machine";
        binary: number;
      }

      interface HelloHuman {
        lang: "human";
        text: string;
      }

      interface HelloDog {
        lang: "dog";
        chicken: true;
      }
    });

    describe("#useDefined", () => {
      beforeEach(cleanup);

      it("returns defined state when value is string", async () => {
        function Component() {
          const renders = useRenderCount();

          const state = State.use<string | undefined>("hello", []);
          const definedState = state.useDefined("string");
          const definedValue = definedState.useValue();

          return (
            <div>
              <div data-testid="value">{definedValue}</div>
              <div data-testid="type">{typeof definedValue}</div>

              <button onClick={() => state.set("world")}>Change value</button>
              <button onClick={() => state.set(undefined)}>
                Set undefined
              </button>

              <div data-testid="renders">{renders}</div>
            </div>
          );
        }

        render(<Component />);
        expect(screen.getByTestId("value").textContent).toBe("hello");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("1");

        await actClick("Change value");
        expect(screen.getByTestId("value").textContent).toBe("world");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("2");

        await actClick("Set undefined");
        expect(screen.getByTestId("value").textContent).toBe("");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("3");
      });

      it("works with nullable string states", async () => {
        function Component() {
          const renders = useRenderCount();

          const state = State.use<string | null | undefined>("hello", []);
          const definedState = state.useDefined("string");
          const definedValue = definedState.useValue();

          return (
            <div>
              <div data-testid="value">{definedValue}</div>
              <div data-testid="type">{typeof definedValue}</div>

              <button onClick={() => state.set("world")}>Set world</button>
              <button onClick={() => state.set(null)}>Set null</button>

              <div data-testid="renders">{renders}</div>
            </div>
          );
        }

        render(<Component />);
        expect(screen.getByTestId("value").textContent).toBe("hello");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("1");

        await actClick("Set null");
        expect(screen.getByTestId("value").textContent).toBe("");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("2");

        await actClick("Set world");
        expect(screen.getByTestId("value").textContent).toBe("world");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("3");
      });

      it("restores undefined when changing back to empty string", async () => {
        function Component() {
          const renders = useRenderCount();

          const state = State.use<string | null | undefined>(undefined, []);
          const value = state.useValue();
          const definedState = state.useDefined("string");
          const definedValue = definedState.useValue();

          return (
            <div>
              <div data-testid="original">{String(value)}</div>
              <div data-testid="defined">{String(definedValue)}</div>

              <button onClick={() => definedState.set("world")}>
                Set world
              </button>
              <button onClick={() => definedState.set("")}>Set empty</button>

              <div data-testid="renders">{renders}</div>
            </div>
          );
        }

        render(<Component />);
        expect(screen.getByTestId("original").textContent).toBe("undefined");
        expect(screen.getByTestId("defined").textContent).toBe("");
        expect(screen.getByTestId("renders").textContent).toBe("1");

        await actClick("Set world");
        expect(screen.getByTestId("original").textContent).toBe("world");
        expect(screen.getByTestId("defined").textContent).toBe("world");
        expect(screen.getByTestId("renders").textContent).toBe("2");

        await actClick("Set empty");
        expect(screen.getByTestId("original").textContent).toBe("undefined");
        expect(screen.getByTestId("defined").textContent).toBe("");
        expect(screen.getByTestId("renders").textContent).toBe("3");
      });

      it("restores null when changing back to empty string", async () => {
        function Component() {
          const renders = useRenderCount();

          const state = State.use<string | null | undefined>(null, []);
          const value = state.useValue();
          const definedState = state.useDefined("string");
          const definedValue = definedState.useValue();

          return (
            <div>
              <div data-testid="original">{String(value)}</div>
              <div data-testid="defined">{String(definedValue)}</div>

              <button onClick={() => definedState.set("world")}>
                Set world
              </button>
              <button onClick={() => definedState.set("")}>Set empty</button>

              <div data-testid="renders">{renders}</div>
            </div>
          );
        }

        render(<Component />);
        expect(screen.getByTestId("original").textContent).toBe("null");
        expect(screen.getByTestId("defined").textContent).toBe("");
        expect(screen.getByTestId("renders").textContent).toBe("1");

        await actClick("Set world");
        expect(screen.getByTestId("original").textContent).toBe("world");
        expect(screen.getByTestId("defined").textContent).toBe("world");
        expect(screen.getByTestId("renders").textContent).toBe("2");

        await actClick("Set empty");
        expect(screen.getByTestId("original").textContent).toBe("null");
        expect(screen.getByTestId("defined").textContent).toBe("");
        expect(screen.getByTestId("renders").textContent).toBe("3");
      });

      it("restores empty string when changing back to empty string", async () => {
        function Component() {
          const renders = useRenderCount();

          const state = State.use<string | null | undefined>("", []);
          const value = state.useValue();
          const definedState = state.useDefined("string");
          const definedValue = definedState.useValue();

          return (
            <div>
              <div data-testid="original">{String(value)}</div>
              <div data-testid="defined">{String(definedValue)}</div>

              <button onClick={() => definedState.set("world")}>
                Set world
              </button>
              <button onClick={() => definedState.set("")}>Set empty</button>

              <div data-testid="renders">{renders}</div>
            </div>
          );
        }

        render(<Component />);
        expect(screen.getByTestId("original").textContent).toBe("");
        expect(screen.getByTestId("defined").textContent).toBe("");
        expect(screen.getByTestId("renders").textContent).toBe("1");

        await actClick("Set world");
        expect(screen.getByTestId("original").textContent).toBe("world");
        expect(screen.getByTestId("defined").textContent).toBe("world");
        expect(screen.getByTestId("renders").textContent).toBe("2");

        await actClick("Set empty");
        expect(screen.getByTestId("original").textContent).toBe("");
        expect(screen.getByTestId("defined").textContent).toBe("");
        expect(screen.getByTestId("renders").textContent).toBe("3");
      });

      it("updates when id changes", async () => {
        function Component() {
          const renders = useRenderCount();
          const [index, setIndex] = useState(0);

          const state = State.use(["hello", undefined], []);
          const definedState = state.at(index).useDefined("string");
          const definedValue = definedState.useValue();

          return (
            <div>
              <div data-testid="value">{definedValue}</div>
              <div data-testid="type">{typeof definedValue}</div>

              <button onClick={() => setIndex(1)}>Set index 1</button>

              <div data-testid="renders">{renders}</div>
            </div>
          );
        }

        render(<Component />);
        expect(screen.getByTestId("value").textContent).toBe("hello");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("1");

        await actClick("Set index 1");
        expect(screen.getByTestId("value").textContent).toBe("");
        expect(screen.getByTestId("type").textContent).toBe("string");
        expect(screen.getByTestId("renders").textContent).toBe("2");
      });
    });

    describe("#shared", () => {
      it("returns the same state", () => {
        const state = new State<string>("Hello!");
        const shared = state.shared<[string, string | undefined]>();
        expect(shared).toBe(state);
      });
    });
  });
});

//#region Helpers

//#region Unit

interface Name {
  first: string;
  last?: string | undefined;
}

interface Cat {
  type: "cat";
  meow: boolean;
}

interface Dog {
  type: "dog";
  bark: boolean;
}

function toFullName(name: Name) {
  return [name.first, name.last].filter((v) => !!v).join(" ");
}

function fromFullName(fullName: string) {
  const [first = "", last = ""] = fullName.split(" ");
  return { first, last };
}

function toCodes(message: string | undefined) {
  return Array.from(message || "").map((c) => c.charCodeAt(0));
}

function fromCodes(codes: number[]) {
  return codes.map((c) => String.fromCharCode(c)).join("");
}

//#endregion

//#region React

interface Address {
  name: UserName | string;
}

interface Profile {
  user: User;
  settings?: Settings;
}

interface Settings {
  theme?: "light" | "dark";
}

interface User {
  name: UserName;
  email?: string | undefined;
}

interface UserName {
  first: string;
  last?: string;
}

interface UserComponentProps {
  user: State<User>;
}

function UserComponent(props: UserComponentProps) {
  const count = useRenderCount();
  const user = props.user;
  // Makes the component re-render when the name shape changes
  const name = user.$.name.useCollection();

  return (
    <div>
      <div data-testid="render-user">{count}</div>

      <div data-testid="has-last">{user.$.name.value ? "true" : "false"}</div>

      <UserNameComponent name={name} />
    </div>
  );
}

interface UserNameComponentProps {
  name: State<UserName>;
  index?: number;
}

function UserNameComponent(props: UserNameComponentProps) {
  const count = useRenderCount();
  const { index = 0, name } = props;

  const { first, last } = name.useValue();

  return (
    <div data-testid={`name-${index}`}>
      <div data-testid={`render-name-${index}`}>{count}</div>

      <div data-testid={`name-first-${index}`}>{first}</div>
      <div data-testid={`name-last-${index}`}>{last}</div>

      <input
        data-testid={`name-first-${index}-input`}
        onChange={(e) => name.$.first.set(e.target.value)}
        value={name.$.first.value}
      />

      <input
        data-testid={`name-last-${index}-input`}
        onChange={(e) => name.$.last.set(e.target.value)}
        value={name.$.last.value || ""}
      />
    </div>
  );
}

interface UserNameFormComponentProps {
  onSubmit?: (name: UserName) => void;
}

function UserNameFormComponent(props: UserNameFormComponentProps) {
  const count = useRenderCount();
  const state = State.use<UserName>({ first: "", last: "" }, []);

  return (
    <div>
      <div data-testid="render-name-form">{count}</div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit?.(state.value);
        }}
      >
        <input
          data-testid="input-name-first"
          onChange={(e) => state.$.first.set(e.target.value)}
          value={state.$.first.value}
        />

        <input
          data-testid="input-name-last"
          onChange={(e) => state.$.last.set(e.target.value)}
          value={state.$.last.value || ""}
        />

        <button type="submit">Submit name</button>
      </form>
    </div>
  );
}

interface StringComponentProps {
  string: State<string>;
}

function StringComponent(props: StringComponentProps) {
  const count = useRenderCount();
  const string = props.string.useValue();
  return (
    <div>
      <div data-testid="render-string">{count}</div>
      <div data-testid="string">{string}</div>
    </div>
  );
}

interface NumberComponentProps {
  number: State<number>;
}

function NumberComponent(props: NumberComponentProps) {
  const count = useRenderCount();
  const number = props.number.useValue();
  return (
    <div>
      <div data-testid="render-number">{count}</div>
      <div data-testid="number">{number}</div>
    </div>
  );
}

interface CodesComponentProps {
  codes: State<number[]>;
}

function CodesComponent(props: CodesComponentProps) {
  const count = useRenderCount();
  const codes = props.codes.useValue();
  return (
    <div>
      <div data-testid="render-codes">{count}</div>
      <div data-testid="codes">{codes.join(" ")}</div>
    </div>
  );
}

//#endregion

//#endregion
