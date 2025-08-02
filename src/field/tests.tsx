import { act, cleanup, render, screen } from "@testing-library/react";
import React, { useRef, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postpone } from "../../tests/utils.ts";
import { change } from "../change/index.ts";
import { DetachedValue, detachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { Field } from "./index.js";
import { ComputedField, FieldOld } from "./old.tsx";

//#region Field

describe(Field, () => {
  describe("static", () => {
    describe(Field.use, () => {
      beforeEach(cleanup);

      it("creates Field instance", async () => {
        render(<Component />);
        expect(screen.getByTestId("instanceof").textContent).toBe("true");
        expect(screen.getByTestId("value").textContent).toBe("hello");

        await act(() => screen.getByText("Set hi").click());
        expect(screen.getByTestId("value").textContent).toBe("hi");
      });

      it("preserves instance of initial value change", async () => {
        render(<Component />);
        expect(screen.getByTestId("instanceof").textContent).toBe("true");

        await act(() => screen.getByText("Set hi").click());
      });

      function Component() {
        const [initialValue, setInitialValue] = useState("hello");
        const field = Field.use(initialValue, []);
        const initialRef = useRef(field);
        const value = field.useValue();

        return (
          <>
            <ul>
              <li data-testid="instanceof">{String(field instanceof Field)}</li>
              <li data-testid="value">{value}</li>
              <li data-testid="instance">
                {String(initialRef.current === field)}
              </li>
            </ul>

            <button
              onClick={() => {
                field.set("hi");
              }}
            >
              Set hi
            </button>

            <button onClick={() => field.set("hola")}>
              Update initial value
            </button>
          </>
        );
      }
    });
  });

  describe("instance", () => {
    describe("constructor", () => {
      it("creates a field instance", () => {
        const field = new Field(42);
        expect(field.value).toBe(42);
      });
    });
  });

  describe("attributes", () => {
    describe("id", () => {
      it("assigns a unique id to each field", () => {
        const field1 = new Field(42);
        const field2 = new Field(42);
        expect(field1.id).toBeTypeOf("string");
        expect(field1.id).not.toBe(field2.id);
      });

      it(" fields returns unique ids", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.id).not.toBe(field.$.name.$.first.id);
      });
    });
  });

  describe("value", () => {
    describe("set", () => {
      describe("primitive", () => {
        it("sets a new field", () => {
          const field = new Field(42);
          field.set(43);
          expect(field.value).toBe(43);
        });

        describe("changes", () => {
          it("assigns 0 if the field is not changed", () => {
            const field = new Field(42);
            expect(field.set(42).lastChanges).toMatchChanges(0n);
          });

          it("assigns type change when type changes", () => {
            const field = new Field<number | string>(42);
            expect(field.set("42").lastChanges).toMatchChanges(
              change.field.type,
            );
          });

          it("assigns value change when value changes", () => {
            const field = new Field(42);
            expect(field.set(43).lastChanges).toMatchChanges(
              change.field.value,
            );
          });

          it("assigns detach change when setting to detached value", () => {
            const field = new Field(42);
            // @ts-expect-error -- TODO: Types revamp
            expect(field.set(detachedValue).lastChanges).toMatchChanges(
              change.field.detach,
            );
          });

          it("assigns attach change when setting from detached value", () => {
            const field = new Field<number | DetachedValue>(detachedValue);
            expect(field.set(42).lastChanges).toMatchChanges(
              change.field.attach,
            );
          });

          it("assigns type change when setting undefined", () => {
            const field = new Field<number | undefined>(42);
            expect(field.set(undefined).lastChanges).toMatchChanges(
              change.field.type,
            );
          });
        });
      });

      describe("object", () => {
        it("sets object field", () => {
          const field = new Field<{ num?: number; str?: string }>({
            num: 42,
          });
          field.set({ num: 43 });
          expect(field.value).toEqual({ num: 43 });
          field.set({ num: 44, str: "hello" });
          expect(field.value).toEqual({ num: 44, str: "hello" });
          field.set({ str: "world" });
          expect(field.value).toEqual({ str: "world" });
          field.set({});
          expect(field.value).toEqual({});
        });

        it("does not trigger child fields updates when detached", async () => {
          const field = new Field<{ num?: number; str?: string }>({
            num: 42,
          });
          const spy = vi.fn();
          field.$.num?.watch(spy);
          field.set({ num: 43 });
          await postpone();
          expect(spy).toHaveBeenCalledOnce();
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: change.field.value }),
          );
          field.set({ str: "hello" });
          await postpone();
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves detached fields", async () => {
          const field = new Field<{ num?: number; str?: string }>({
            num: 42,
          });
          const spy = vi.fn();
          const numA = field.$.num;
          numA?.watch(spy);
          field.set({ num: 43 });

          await postpone();
          expect(spy).toHaveBeenCalledWith(
            43,
            expect.objectContaining({ changes: change.field.value }),
          );
          field.set({ str: "hello" });
          field.set({ num: 44, str: "hello" });
          const numB = field.$.num;
          expect(numA).toBeInstanceOf(Field);
          expect(numA).toBe(numB);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            44,
            expect.objectContaining({
              changes: change.field.type | change.field.attach,
            }),
          );
        });

        it("allows to re-attach child fields", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          const childField = field.at("num");
          childField.self.remove();
          childField.set(9);
          expect(field.value).toEqual({ num: 9 });
        });

        describe("changes", () => {
          describe("field", () => {
            it("assigns 0 if the field is not changed", () => {
              const field = new Field({ num: 42 });
              expect(field.set({ num: 42 }).lastChanges).toMatchChanges(0n);
            });

            it("assigns type change when type changes", () => {
              const field = new Field<object | number>({ num: 42 });
              expect(field.set(42).lastChanges).toMatchChanges(
                change.field.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const field = new Field<{ name?: object }>({});
              expect(
                field.$.name.set({ first: "Sasha" }).lastChanges,
              ).toMatchChanges(change.field.attach);
            });

            it("assigns detach change when detaching", () => {
              const field = new Field<{ name?: object }>({
                name: { first: "Sasha" },
              });
              expect(
                // @ts-expect-error -- TODO: Types revamp
                field.$.name.set(detachedValue).lastChanges,
              ).toMatchChanges(change.field.detach);
            });

            it("assigns type change when setting undefined", () => {
              const field = new Field<object | undefined>({ num: 42 });
              expect(field.set(undefined).lastChanges).toMatchChanges(
                change.field.type,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const field = new Field<object>({ num: 42 });
                expect(
                  field.set({ num: 42, str: "hello" }).lastChanges,
                ).toMatchChanges(change.field.shape | change.child.attach);
              });

              it("assigns change when child detaches", () => {
                const field = new Field<object>({ num: 42, str: "hello" });
                expect(field.set({ num: 42 }).lastChanges).toMatchChanges(
                  change.field.shape | change.child.detach,
                );
              });
            });
          });

          describe("child", () => {
            it("assigns type change when type changes", () => {
              const field = new Field<object>({ num: 42 });
              expect(field.set({ num: "42" }).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const field = new Field<object>({});
              expect(
                field.set({ name: { first: "Sasha" } }).lastChanges,
              ).toMatchChanges(change.field.shape | change.child.attach);
            });

            it("assigns detach change when detaching", () => {
              const field = new Field<object>({
                name: { first: "Sasha" },
              });
              expect(field.set({}).lastChanges).toMatchChanges(
                change.field.shape | change.child.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const field = new Field<object>({
                name: { first: "Sasha" },
              });
              expect(field.set({ name: undefined }).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns combined changes", () => {
              const field = new Field<object>({ num: 42, str: "hello" });
              expect(
                field.set({ num: 43, bool: true }).lastChanges,
              ).toMatchChanges(
                change.field.shape |
                  change.child.value |
                  change.child.attach |
                  change.child.detach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const field = new Field<object>({ obj: { num: 42 } });
                expect(
                  field.set({ obj: { num: 42, str: "hello" } }).lastChanges,
                ).toMatchChanges(change.child.shape | change.subtree.attach);
              });

              it("assigns change when child detaches", () => {
                const field = new Field<object>({
                  obj: { num: 42, str: "hello" },
                });
                expect(
                  field.set({ obj: { num: 42 } }).lastChanges,
                ).toMatchChanges(change.child.shape | change.subtree.detach);
              });
            });
          });

          describe("subtree", () => {
            it("assigns type change when type changes", () => {
              const field = new Field<{ obj: object }>({ obj: { num: 42 } });
              expect(
                field.set({ obj: { num: "42" } }).lastChanges,
              ).toMatchChanges(change.subtree.type);
            });

            it("assigns attach change when attaching", () => {
              const field = new Field<{ obj: object }>({ obj: {} });
              expect(
                field.set({ obj: { name: { first: "Sasha" } } }).lastChanges,
              ).toMatchChanges(change.child.shape | change.subtree.attach);
            });

            it("assigns detach change when detaching", () => {
              const field = new Field<{ obj: object }>({
                obj: { name: { first: "Sasha" } },
              });
              expect(field.set({ obj: {} }).lastChanges).toMatchChanges(
                change.child.shape | change.subtree.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const field = new Field<{ obj: object }>({
                obj: { name: { first: "Sasha" } },
              });
              expect(
                field.set({ obj: { name: undefined } }).lastChanges,
              ).toMatchChanges(change.subtree.type);
            });

            it("assigns combined changes", () => {
              const field = new Field<object>({
                obj: { num: 42, str: "hello" },
              });
              expect(
                field.set({ obj: { num: 43, bool: true } }).lastChanges,
              ).toMatchChanges(
                change.child.shape |
                  change.subtree.value |
                  change.subtree.attach |
                  change.subtree.detach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const field = new Field<object>({
                  obj: { obj: { num: 42 } },
                });
                expect(
                  field.set({ obj: { obj: { num: 42, str: "hello" } } })
                    .lastChanges,
                ).toMatchChanges(change.subtree.shape | change.subtree.attach);
              });

              it("assigns change when child detaches", () => {
                const field = new Field<object>({
                  obj: {
                    obj: { num: 42, str: "hello" },
                  },
                });
                expect(
                  field.set({ obj: { obj: { num: 42 } } }).lastChanges,
                ).toMatchChanges(change.subtree.shape | change.subtree.detach);
              });
            });
          });
        });
      });

      describe("array", () => {
        it("sets the array field", () => {
          const field = new Field<number[]>([1, 2, 3, 4, 5]);
          field.set([1, 2, 3]);
          expect(field.value).toEqual([1, 2, 3]);
          field.set([1, 2, 3, 4]);
          expect(field.value).toEqual([1, 2, 3, 4]);
          const arr = new Array(5);
          arr[3] = 5;
          field.set(arr);
          expect(field.value).toEqual(arr);
          field.set([]);
          expect(field.value).toEqual([]);
        });

        it("assigns 0 if the field has not changed", () => {
          const field = new Field([1, 2, 3]);
          field.set([1, 2, 3]);
          expect(field.lastChanges).toBe(0n);
        });

        it("assigns child change type if a child field has changed", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2, 1]).lastChanges).toMatchChanges(
            change.child.value,
          );
        });

        it("assigns added change type if a child has been added", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2, 3, 4]).lastChanges).toMatchChanges(
            change.field.shape | change.child.attach,
          );
        });

        it("assigns child removed change type if a child has been removed", () => {
          const field = new Field([1, 2, 3]);
          expect(field.set([1, 2]).lastChanges).toMatchChanges(
            change.field.shape | change.child.detach,
          );
        });

        it("assigns combined change type", () => {
          const field = new Field([1, 2]);
          const arr = [0, 2, 3];
          delete arr[1];
          field.set(arr);
          expect(field.lastChanges & change.field.shape).toBe(
            change.field.shape,
          );
          expect(field.lastChanges & change.child.attach).toBe(
            change.child.attach,
          );
          expect(field.lastChanges & change.child.detach).toBe(
            change.child.detach,
          );
        });

        it("does not trigger item updates when removing", async () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          field.$[2]?.watch(spy);
          field.set([1, 2, 33, 4]);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({
              changes: change.field.value,
            }),
          );
          field.set([1, 2]);

          await postpone();
          expect(spy).toHaveBeenCalledOnce();
        });

        it("preserves removed items", async () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = field.at(2);
          itemA.watch(spy);
          field.set([1, 2, 33, 4]);

          await postpone();
          field.set([1, 2]);
          field.set([1, 2, 333]);
          const itemB = field.at(2);
          expect(itemA).toBeInstanceOf(Field);
          expect(itemA).toBe(itemB);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ changes: change.field.value }),
          );

          expect(spy).toHaveBeenCalledWith(
            333,
            expect.objectContaining({
              changes: change.field.type | change.field.attach,
            }),
          );
        });

        it("indicates no type change on adding undefined", async () => {
          const field = new Field<Array<number | undefined>>([1, 2, 3, 4]);
          const spy = vi.fn();
          const itemA = field.at(2);
          itemA.watch(spy);
          field.set([1, 2, 33, 4]);
          await postpone();
          expect(spy).toHaveBeenCalledWith(
            33,
            expect.objectContaining({ changes: change.field.value }),
          );

          field.set([1, 2]);
          field.set([1, 2, undefined]);

          await postpone();
          expect(spy).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({
              // This test lacks StateChangeType.Type unlike the above,
              // indicating that the value is still undefined
              changes: change.field.attach,
            }),
          );
        });

        it("does not trigger update when setting undefined value to undefined value", () => {
          const field = new Field<number[]>([1, 2, 3, 4]);
          const child = field.at(5);
          // @ts-expect-error -- TODO: Types revamp
          child.set(detachedValue);
          expect(child.lastChanges).toBe(0n);
        });

        it("works when assigning undefined instead of an object item", () => {
          const field = new Field<Array<{ n: number }>>([
            { n: 1 },
            { n: 2 },
            { n: 3 },
          ]);
          expect(field.set([{ n: 1 }, { n: 2 }]).lastChanges).toMatchChanges(
            change.field.shape | change.child.detach,
          );
          expect(field.value).toEqual([{ n: 1 }, { n: 2 }]);
        });

        it("works when assigning object instead of an undefined item", () => {
          const field = new Field<Array<{ n: number }>>([{ n: 1 }, { n: 2 }]);
          const spy = vi.fn();
          const undefinedField = field.at(2);
          field.map(spy);
          expect(undefinedField.value).toBe(undefined);
          expect(
            field.set([{ n: 1 }, { n: 2 }, { n: 3 }]).lastChanges,
          ).toMatchChanges(change.field.shape | change.child.attach);
          expect(field.value).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
          field.map(spy);
          expect(spy).toBeCalled();
        });

        it("assigns created changes when adding a new field", () => {
          const field = new Field<number[]>([1, 2]);
          expect(field.at(2).set(3).lastChanges).toMatchChanges(
            change.field.attach,
          );
        });

        it("allows to re-attach item fields", () => {
          const field = new Field<number[]>([1, 2, 3]);
          const itemField = field.remove(1);
          itemField.set(9);
          expect(field.value).toEqual([1, 9, 3]);
        });

        it("shifts children when re-attaching item field", () => {
          const field = new Field<number[]>([1, 2, 3]);
          const itemField = field.remove(1);

          expect(field.value).toEqual([1, 3]);
          expect(field.at(0).key).toBe("0");
          expect(field.at(1).key).toBe("1");

          itemField.set(9);
          expect(field.value).toEqual([1, 9, 3]);
          expect(field.at(0).key).toBe("0");
          expect(field.at(1).key).toBe("1");
        });

        describe("changes", () => {
          describe("field", () => {
            it("assigns 0 if the field is not changed", () => {
              const field = new Field([1, 2, 3]);
              field.set([1, 2, 3]);
              expect(field.lastChanges).toMatchChanges(0n);
            });

            it("assigns type change when type changes", () => {
              const field = new Field<number[] | number>([1, 2, 3]);
              expect(field.set(123).lastChanges).toMatchChanges(
                change.field.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const field = new Field<number[]>([]);
              expect(field.at(0).set(1).lastChanges).toMatchChanges(
                change.field.attach,
              );
            });

            it("assigns detach change when detaching", () => {
              const field = new Field<number[]>([1, 2, 3]);
              // @ts-expect-error -- TODO: Types revamp
              expect(field.at(2).set(detachedValue).lastChanges).toMatchChanges(
                change.field.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const field = new Field<number[] | undefined>([1, 2, 3]);
              expect(field.set(undefined).lastChanges).toMatchChanges(
                change.field.type,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const field = new Field<number[]>([1, 2]);
                expect(field.set([1, 2, 3]).lastChanges).toMatchChanges(
                  change.field.shape | change.child.attach,
                );
              });

              it("assigns change when child detaches", () => {
                const field = new Field<number[]>([1, 2, 3]);
                expect(field.set([1, 2]).lastChanges).toMatchChanges(
                  change.field.shape | change.child.detach,
                );
              });
            });
          });

          describe("child", () => {
            it("assigns type change when type changes", () => {
              const field = new Field<any[]>([1, 2, 3]);
              expect(field.set([1, 2, "3"]).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const field = new Field<any[]>([1, 2]);
              expect(field.set([1, 2, 3]).lastChanges).toMatchChanges(
                change.field.shape | change.child.attach,
              );
            });

            it("assigns detach change when detaching", () => {
              const field = new Field<any[]>([1, 2, 3]);
              expect(field.set([1, 2]).lastChanges).toMatchChanges(
                change.field.shape | change.child.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const field = new Field<any[]>([1, 2, 3]);
              expect(field.set([1, 2, undefined]).lastChanges).toMatchChanges(
                change.child.type,
              );
            });

            it("assigns combined changes", () => {
              const field = new Field<any[]>([1, 2]);
              expect(field.set([1, "2", 3]).lastChanges).toMatchChanges(
                change.field.shape | change.child.type | change.child.attach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const field = new Field<any[][]>([[1, 2]]);
                expect(field.set([[1, 2, 3]]).lastChanges).toMatchChanges(
                  change.child.shape | change.subtree.attach,
                );
              });

              it("assigns change when child detaches", () => {
                const field = new Field<any[][]>([[1, 2, 3]]);
                expect(field.set([[1, 2]]).lastChanges).toMatchChanges(
                  change.child.shape | change.subtree.detach,
                );
              });
            });
          });

          describe("subtree", () => {
            it("assigns type change when type changes", () => {
              const field = new Field<any[][]>([[1, 2, 3]]);
              expect(field.set([[1, 2, "3"]]).lastChanges).toMatchChanges(
                change.subtree.type,
              );
            });

            it("assigns attach change when attaching", () => {
              const field = new Field<any[][]>([[1, 2]]);
              expect(field.set([[1, 2, 3]]).lastChanges).toMatchChanges(
                change.child.shape | change.subtree.attach,
              );
            });

            it("assigns detach change when detaching", () => {
              const field = new Field<any[][]>([[1, 2, 3]]);
              expect(field.set([[1, 2]]).lastChanges).toMatchChanges(
                change.child.shape | change.subtree.detach,
              );
            });

            it("assigns type change when setting undefined", () => {
              const field = new Field<any[][]>([[1, 2, 3]]);
              expect(field.set([[1, 2, undefined]]).lastChanges).toMatchChanges(
                change.subtree.type,
              );
            });

            it("assigns combined changes", () => {
              const field = new Field<any[][]>([[1, 2]]);
              expect(field.set([[1, "2", 3]]).lastChanges).toMatchChanges(
                change.child.shape |
                  change.subtree.type |
                  change.subtree.attach,
              );
            });

            describe("shape", () => {
              it("assigns change when child attaches", () => {
                const field = new Field<any[][]>([[[1, 2]]]);
                expect(field.set([[[1, 2, 3]]]).lastChanges).toMatchChanges(
                  change.subtree.shape | change.subtree.attach,
                );
              });

              it("assigns change when child detaches", () => {
                const field = new Field<any[][]>([[[1, 2, 3]]]);
                expect(field.set([[[1, 2]]]).lastChanges).toMatchChanges(
                  change.subtree.shape | change.subtree.detach,
                );
              });
            });
          });
        });
      });

      describe("instance", () => {
        it("sets instance field", () => {
          const map = new Map<string, number>();
          map.set("num", 42);
          const field = new Field(map);
          expect(Object.fromEntries(field.value)).toEqual({
            num: 42,
          });
          {
            const newMap = new Map<string, number>();
            newMap.set("num", 43);
            field.set(newMap);
            expect(Object.fromEntries(field.value)).toEqual({
              num: 43,
            });
          }
          {
            const newMap = new Map<string, number>();
            newMap.set("num", 44);
            newMap.set("qwe", 123);
            field.set(newMap);
            expect(Object.fromEntries(field.value)).toEqual({
              num: 44,
              qwe: 123,
            });
          }
          {
            const newMap = new Map<string, number>();
            field.set(newMap);
            expect(Object.fromEntries(field.value)).toEqual({});
          }
        });

        it("does not confuse null with instances", () => {
          const field = new Field(null);
          expect(field.value).toBe(null);
          field.set(null);
          expect(field.value).toBe(null);
        });

        describe("changes", () => {
          it("assigns 0 if the field is not changed", () => {
            const map = new Map();
            const field = new Field(map);
            field.set(map);
            expect(field.lastChanges).toMatchChanges(0n);
          });

          it("assigns type change when type changes", () => {
            const field = new Field<Map<string, string> | Set<string>>(
              new Map(),
            );
            expect(field.set(new Set<string>()).lastChanges).toMatchChanges(
              change.field.type,
            );
          });

          it("assigns value change when value changes", () => {
            const field = new Field(new Map());
            expect(field.set(new Map()).lastChanges).toMatchChanges(
              change.field.value,
            );
          });

          it("assigns detach change when setting to detached value", () => {
            const field = new Field<Map<any, any>, "detachable">(new Map());
            // @ts-expect-error -- TODO: Types revamp
            expect(field.set(detachedValue).lastChanges).toMatchChanges(
              change.field.detach,
            );
          });

          it("assigns attach change when setting from detached value", () => {
            const field = new Field<Map<string, string> | DetachedValue>(
              detachedValue,
            );
            expect(field.set(new Map()).lastChanges).toMatchChanges(
              change.field.attach,
            );
          });

          it("assigns type change when setting undefined", () => {
            const field = new Field<Map<string, string> | undefined>(new Map());
            expect(field.set(undefined).lastChanges).toMatchChanges(
              change.field.type,
            );
          });
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
          const field = new Field({
            name: { first: "Alexander", last: "" },
          });
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
          const field = new Field({
            name: { first: "Alexander", last: "" },
          });
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

      describe("instance", () => {
        it("returns true if the field has changed", () => {
          const field = new Field(new Map());
          expect(field.dirty).toBe(false);
          field.set(new Map());
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

      describe("proxy", () => {
        it("returns true if the source field has changed", async () => {
          const field = new Field<string | undefined>("Hello");
          const proxy = field.into(toString).from(fromString);
          expect(proxy.dirty).toBe(false);
          proxy.set("Hi");
          await postpone();
          expect(proxy.dirty).toBe(true);
        });

        it("returns false if the source field didn't change", () => {
          const field = new Field<string | undefined>(undefined);
          const proxy = field.into(toString).from(fromString);
          expect(proxy.dirty).toBe(false);
          proxy.set(" ");
          expect(proxy.dirty).toBe(false);
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
        expect(field.value).toEqual({
          name: { first: "Sasha" },
          codes: [1, 5, 3],
        });
        expect(field.dirty).toBe(false);
        expect(field.$.name.$.first.initial).toBe("Sasha");
        expect(field.$.name.$.first.dirty).toBe(false);
        expect(field.$.codes.at(1).initial).toBe(5);
        expect(field.$.codes.at(1).dirty).toBe(false);
      });

      describe("changes", () => {
        describe("field", () => {
          it("triggers commit change", async () => {
            const field = new Field("");
            field.set("spam@example.com");
            expect(field.dirty).toBe(true);

            const spy = vi.fn();
            const unsub = field.watch(spy);
            field.commit();

            await postpone();
            unsub();
            expect(field.dirty).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
            const [[_, event]]: any = spy.mock.calls;
            expect(event.changes).toMatchChanges(
              change.field.value | change.field.commit,
            );
          });

          it("does't trigger commit change if it wasn't dirty", async () => {
            const field = new Field("");
            field.set("");
            expect(field.dirty).toBe(false);

            const spy = vi.fn();
            const unsub = field.watch(spy);
            field.commit();

            await postpone();
            unsub();
            expect(field.dirty).toBe(false);
            expect(spy).not.toHaveBeenCalled();
          });
        });

        describe("child", () => {
          it("triggers commit change", async () => {
            const field = new Field({
              name: { first: "Alexander" },
              email: "",
            });
            field.$.email.set("spam@example.com");
            expect(field.dirty).toBe(true);

            const spy = vi.fn();
            const unsub = field.watch(spy);
            field.commit();

            await postpone();
            unsub();
            expect(field.dirty).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
            const [[_, event]]: any = spy.mock.calls;
            expect(event.changes).toMatchChanges(
              change.field.commit | change.child.value | change.child.commit,
            );
          });

          it("does't trigger commit change if it wasn't dirty", async () => {
            const field = new Field({
              name: { first: "Alexander" },
              email: "",
            });
            field.$.email.set("");
            expect(field.dirty).toBe(false);

            const spy = vi.fn();
            const unsub = field.watch(spy);
            field.commit();

            await postpone();
            unsub();
            expect(field.dirty).toBe(false);
            expect(spy).not.toHaveBeenCalled();
          });
        });

        describe("subtree", () => {
          it("triggers commit change", async () => {
            const field = new Field({
              user: {
                name: { first: "Alexander" },
                email: "",
              },
            });
            field.$.user.$.email.set("spam@example.com");
            expect(field.dirty).toBe(true);

            const spy = vi.fn();
            const unsub = field.watch(spy);
            field.commit();

            await postpone();
            unsub();
            expect(field.dirty).toBe(false);
            expect(spy).toHaveBeenCalledOnce();
            const [[_, event]]: any = spy.mock.calls;
            expect(event.changes).toMatchChanges(
              change.field.commit |
                change.child.commit |
                change.subtree.value |
                change.subtree.commit,
            );
          });

          it("does't trigger commit change if it wasn't dirty", async () => {
            const field = new Field({
              user: {
                name: { first: "Alexander" },
                email: "",
              },
            });
            field.$.user.$.email.set("");
            expect(field.dirty).toBe(false);

            const spy = vi.fn();
            const unsub = field.watch(spy);
            field.commit();

            await postpone();
            unsub();
            expect(field.dirty).toBe(false);
            expect(spy).not.toHaveBeenCalled();
          });
        });
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
        expect(field.value).toEqual({
          name: { first: "Alexander" },
          codes: [1, 2, 3],
        });
        expect(field.dirty).toBe(false);
        expect(field.$.name.$.first.dirty).toBe(false);
        expect(field.$.codes.at(1).dirty).toBe(false);
      });

      describe("changes", () => {
        describe.todo("field");

        describe.todo("child");

        describe.todo("subtree");
      });
    });

    describe("pave", () => {
      it("returns field set to the given value if it's null or undefined", () => {
        const field = new Field<string | undefined>(undefined);
        const pavedField = field.pave("Hello");
        expect(pavedField.value).toBe("Hello");
        expect(pavedField).toBe(field);
      });

      it("returns same field if it's already set", () => {
        const field = new Field<string | undefined>("Hi");
        const pavedField = field.pave("Hello");
        expect(pavedField.value).toBe("Hi");
      });

      it.skip("allows to pave through nested fields", () => {
        const field = new Field<
          { name?: { first?: string; last?: string } } | undefined
        >({});
        field.pave({}).$.name.pave({}).$.first.pave("Alexander");
        expect(field.value).toEqual({
          name: { first: "Alexander" },
        });
      });
    });
  });

  describe("type", () => {
    describe("collection", () => {
      describe("#remove", () => {
        describe(Array, () => {
          it("removes a field by index", () => {
            const field = new Field([1, 2, 3]);
            field.remove(1);
            expect(field.value).toEqual([1, 3]);
          });

          it("returns the removed field", () => {
            const field = new Field([1, 2, 3]);
            const oneField = field.at(1);
            const removedField = field.remove(1);
            expect(removedField).toBe(oneField);
            expect(removedField.value).toBe(undefined);
          });

          it("removes child", () => {
            const parent = new Field([1, 2, 3]);
            const field = parent.at(1);
            field.self.remove();
            expect(parent.value).toEqual([1, 3]);
            expect(field.value).toBe(undefined);
          });

          it("doesn't throw on removing non-existing item", () => {
            const field = new Field([1, 2, 3]);
            expect(() => field.remove(6)).not.toThrow();
          });

          it("updates the children indices", () => {
            const field = new Field([1, 2, 3, 4]);
            field.remove(1);
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
                field.remove(1);
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
                field.try(0)?.remove(1);
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

        describe(Object, () => {
          it("removes a record field by key", () => {
            const field = new Field<Record<string, number>>({
              one: 1,
              two: 2,
              three: 3,
            });
            field.remove("one");
            expect(field.value).toEqual({ two: 2, three: 3 });
          });

          it("returns the removed field", () => {
            const field = new Field<Record<string, number>>({
              one: 1,
              two: 2,
              three: 3,
            });
            const oneField = field.$.one;
            const removedField = field.remove("one");
            expect(removedField).toBe(oneField);
            expect(removedField.value).toBe(undefined);
          });

          it("removes child", () => {
            const parent = new Field<Record<string, number>>({
              one: 1,
              two: 2,
              three: 3,
            });
            const field = parent.at("one");
            field.self.remove();
            expect(parent.value).toEqual({ two: 2, three: 3 });
            expect(field.value).toBe(undefined);
          });

          it("removes a optional field by key", () => {
            const field = new Field<{
              one: 1;
              two: 2 | undefined;
              three?: 3;
            }>({
              one: 1,
              two: 2,
              three: 3,
            });
            field.remove("three");
            expect(field.value).toEqual({ one: 1, two: 2 });
          });

          it("doesn't throw on removing non-existing field", () => {
            const field = new Field<Record<string, number>>({ one: 1 });
            expect(() => field.remove("two")).not.toThrow();
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
                field.remove("one");
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
                field.$.qwe.remove("one");
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
      });

      describe("#forEach", () => {
        describe(Array, () => {
          it("iterates items", () => {
            const field = new Field([1, 2, 3]);
            const mapped: [number, number][] = [];
            field.forEach((item, index) =>
              mapped.push([index, item.value * 2]),
            );
            expect(mapped).toEqual([
              [0, 2],
              [1, 4],
              [2, 6],
            ]);
          });
        });

        describe(Object, () => {
          it("iterates items and keys", () => {
            const field = new Field({ a: 1, b: 2, c: 3 });
            const mapped: [string, number][] = [];
            field.forEach((item, key) => mapped.push([key, item.value]));
            expect(mapped).toEqual([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);
          });
        });
      });
    });
  });

  describe("tree", () => {
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

    describe("root", () => {
      it("returns the root field", () => {
        const field = new Field({ user: { name: ["Sasha"] } });
        expect(field.$.user.$.name.at(0).root).toBe(field);
        expect(field.root).toBe(field);
      });
    });

    describe("path", () => {
      it("returns the path to the field", () => {
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

    describe("name", () => {
      it("returns the field name", () => {
        const field = new Field({ address: { name: { first: "Sasha" } } });
        expect(field.$.address.$.name.$.first.name).toEqual(
          "address.name.first",
        );
      });

      it("returns dot for root field", () => {
        const field = new Field({ name: { first: "Sasha" } });
        expect(field.name).toEqual(".");
      });

      it("returns the source name for computed fields", () => {
        const field = new Field({ name: { first: "Sasha" } });
        const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
        expect(computed.name).toEqual("name.first");
      });
    });

    describe("$/at", () => {
      it("returns undefined for primitive", () => {
        const field = new Field(42);
        expect(field.$).toBe(undefined);
      });

      it("returns undefined for instance", () => {
        const field = new Field(new Map());
        expect(field.$).toBe(undefined);
      });

      describe("object", () => {
        it("allows to access fields", () => {
          const field = new Field({ num: 42 });
          const num = field.$.num;
          expect(num).toBeInstanceOf(Field);
          expect(num.value).toBe(42);
        });

        it("allows to access record fields", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          const numA = field.$["num"];
          expect(numA?.value).toBe(42);
          const numB = field.at("num");
          expect(numB.value).toBe(42);
        });

        it("preserves fields", () => {
          const field = new Field({ num: 42 });
          const numA = field.$.num;
          const numB = field.$.num;
          expect(numA).toBeInstanceOf(Field);
          expect(numA).toBe(numB);
        });

        it("allows to access undefined fields", () => {
          const field = new Field<{ num?: number; str?: string }>({
            num: 42,
          });
          const str = field.$.str;
          expect(str).toBeInstanceOf(Field);
          expect(str.value).toBe(undefined);
        });

        it("preserves undefined fields", () => {
          const field = new Field<{ num?: number; str?: string }>({
            num: 42,
          });
          const fieldA = field.$.str;
          const fieldB = field.$.str;
          expect(fieldA).toBe(fieldB);
        });
      });

      describe("array", () => {
        it("allows to access items", () => {
          const field = new Field([1, 2, 3, 4]);
          const item = field.$[3];
          expect(item).toBeInstanceOf(Field);
          expect(item?.value).toBe(4);
        });

        it("preserves items", () => {
          const field = new Field([1, 2, 3, 4]);
          const itemA = field.$[3];
          const itemB = field.$[3];
          expect(itemA).toBeInstanceOf(Field);
          expect(itemA).toBe(itemB);
        });

        it("allows to access undefined items", () => {
          const field = new Field([1, 2, 3, 4]);
          const item = field.at(10);
          expect(item).toBeInstanceOf(Field);
          expect(item.value).toBe(undefined);
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
          const tried = field.self.try();
          tried satisfies Field<string | number> | undefined;
          expect(tried).toBe(field);
          expect(tried).toBeInstanceOf(Field);
          expect(tried?.value).toBe(42);
        });

        it("returns undefined if field doesn't exist", () => {
          const field = new Field<string | number | undefined>(
            detachedValue as any,
          );
          expect(field.self.try()).toBe(undefined);
        });

        it("returns undefined/null if field is undefined/null", () => {
          const undefinedState = new Field<string | undefined>(undefined);
          expect(undefinedState.self.try()).toBe(undefined);
          const nullState = new Field<string | null>(null);
          nullState.self.try() satisfies Field<string> | null;
          expect(nullState.self.try()).toBe(null);
        });
      });

      describe("object", () => {
        it("returns the field if it exists", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          const tried = field.try("num");
          tried satisfies Field<number> | undefined;
          expect(tried).toBeInstanceOf(Field);
          expect(tried?.value).toBe(42);
        });

        it("returns undefined if field doesn't exist", () => {
          const field = new Field<Record<string, number>>({ num: 42 });
          expect(field.try("bum")).toBe(undefined);
        });

        it("returns undefined/null if field is undefined/null", () => {
          const field = new Field<Record<string, number | undefined | null>>({
            num: 42,
            bum: undefined,
            hum: null,
          });
          const tried = field.try("bum");
          tried satisfies Field<number> | undefined | null;
          expect(tried).toBe(undefined);
          expect(field.try("hum")).toBe(null);
        });
      });

      describe("array", () => {
        it("returns the item if it exists", () => {
          const field = new Field<Array<number>>([1, 2, 3]);
          const tried = field.try(1);
          tried satisfies Field<number> | undefined;
          expect(tried).toBeInstanceOf(Field);
          expect(tried?.value).toBe(2);
        });

        it("returns undefined if item doesn't exist", () => {
          const field = new Field<Array<number>>([1, 2, 3]);
          const tried = field.try(5);
          expect(tried).toBe(undefined);
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

      describe("instance", () => {
        it("returns the field if it's defined", () => {
          const map = new Map();
          map.set("num", 42);
          const field = new Field<
            Map<string, string> | Set<string> | undefined
          >(map);
          const tried = field.self.try();
          tried satisfies Field<Map<string, string> | Set<string>> | undefined;
          expect(tried).toBe(field);
          expect(tried).toBeInstanceOf(Field);
          // @ts-expect-error: This is fine!
          expect(Object.fromEntries(tried?.value)).toEqual({ num: 42 });
        });

        it("returns undefined if field doesn't exist", () => {
          const field = new Field<string | number | undefined>(
            detachedValue as any,
          );
          expect(field.self.try()).toBe(undefined);
        });

        it("returns undefined/null if field is undefined/null", () => {
          const undefinedState = new Field<string | undefined>(undefined);
          expect(undefinedState.self.try()).toBe(undefined);
          const nullState = new Field<string | null>(null);
          const tried = nullState.self.try();
          tried satisfies Field<string> | null;
          expect(tried).toBe(null);
        });
      });
    });

    describe(Field.prototype.lookup, () => {
      describe("primitive", () => {
        it("returns itself for empty path", () => {
          const field = new Field(42);
          const lookup = field.lookup([]);
          expect(lookup).toBe(field);
        });

        it("returns undefined for non-empty path", () => {
          const field = new Field(42);
          const lookup = field.lookup(["length"]);
          expect(lookup).toBe(undefined);
        });
      });

      describe("object", () => {
        it("returns itself for empty path", () => {
          const field = new Field({ num: 42 });
          const lookup = field.lookup([]);
          expect(lookup).toBe(field);
        });

        it("returns the field for valid path", () => {
          const field = new Field({ num: 42 });
          const lookup = field.lookup(["num"]);
          expect(lookup).toBe(field.$.num);
        });

        it("returns undefined for invalid path", () => {
          const field = new Field({ num: 42 });
          const lookup = field.lookup(["bum", "bum"]);
          expect(lookup).toBe(undefined);
        });

        it("correctly returns detached field", () => {
          const field = new Field<{ num?: number }>({});
          const lookup = field.lookup(["num"]);
          expect(lookup).toBe(field.$.num);
        });
      });

      describe("array", () => {
        it("returns itself for empty path", () => {
          const field = new Field([1, 2, 3]);
          const lookup = field.lookup([]);
          expect(lookup).toBe(field);
        });

        it("returns the item for valid path", () => {
          const field = new Field([1, 2, 3]);
          const lookup = field.lookup([1]);
          expect(lookup).toBe(field.$[1]);
        });

        it("returns undefined for invalid path", () => {
          const field = new Field([1, 2, 3]);
          const lookup = field.lookup([5, 2]);
          expect(lookup).toBe(undefined);
        });

        it("correctly returns detached field", () => {
          const field = new Field<number[]>([]);
          const lookup = field.lookup([0]);
          expect(lookup).toBe(field.at(0));
        });
      });
    });
  });

  describe("events", () => {
    describe("events", () => {
      it("is a events tree instance", () => {
        const field = new Field(42);
        expect(field.events).toBeInstanceOf(EventsTree);
      });

      it("points to the root parent events tree", () => {
        const field = new Field({ a: { b: { c: 42 } } });
        expect(field.$.a.$.b.events).toBe(field.events);
        expect(field.$.a.$.b.$.c.events).toBe(field.events);
      });
    });

    describe("trigger", () => {
      it("triggers the watchers", async () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        field.trigger(change.field.value);
        await postpone();
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ changes: change.field.value }),
        );
      });

      it("doesn't trigger parent fields", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.$.num.trigger(change.field.value);
        expect(spy).not.toHaveBeenCalled();
      });

      it("allows to notify parent fields", async () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.$.num.trigger(change.field.value, true);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ num: 42 });
        expect(event.changes).toMatchChanges(change.child.value);
      });

      it("notifies parents about child blurring", async () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        field.$.num.trigger(change.field.blur, true);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ num: 42 });
        expect(event.changes).toMatchChanges(change.child.blur);
      });

      it("notifies parents about nested child blurring", async () => {
        const field = new Field({ user: { name: { first: "Sasha" } } });
        const spy = vi.fn();
        field.watch(spy);
        field.$.user.$.name.$.first.trigger(change.field.blur, true);
        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ user: { name: { first: "Sasha" } } });
        expect(event.changes).toMatchChanges(change.subtree.blur);
      });

      it("batches the changes", async () => {
        const field = new Field({ user: { name: { first: "Sasha" } } });
        const spy = vi.fn();
        field.watch(spy);
        field.$.user.$.name.$.first.trigger(change.field.blur, true);
        field.$.user.$.name.$.first.trigger(change.field.shape, true);
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

    describe("withhold", () => {
      it("allows to withhold the events until it's unleashed", async () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.watch(spy);
        // @ts-expect-error -- WIP
        field.withhold();
        field.$.num.trigger(change.field.value, true);
        field.$.num.trigger(change.child.detach, true);
        field.$.num.trigger(change.child.attach, true);
        await postpone();
        expect(spy).not.toHaveBeenCalled();

        // @ts-expect-error -- WIP
        field.unleash();

        await postpone();
        const [[value, event]]: any = spy.mock.calls;
        expect(value).toEqual({ num: 42 });
        expect(event.changes).toMatchChanges(
          change.child.value | change.subtree.detach | change.subtree.attach,
        );
      });

      it("combines the changes into a single event", async () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        // @ts-expect-error -- WIP
        field.withhold();
        field.trigger(change.field.value, true);
        field.trigger(change.child.detach, true);
        field.trigger(change.child.attach, true);

        await postpone();
        expect(spy).not.toHaveBeenCalled();

        // @ts-expect-error -- WIP
        field.unleash();

        await postpone();
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({
            changes:
              change.field.value | change.child.detach | change.child.attach,
          }),
        );
      });

      it("neutralizes valid/invalid changes", async () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        // @ts-expect-error -- WIP
        field.withhold();
        field.trigger(change.field.value, true);
        field.trigger(change.field.invalid, true);
        field.trigger(change.field.valid, true);

        await postpone();
        expect(spy).not.toHaveBeenCalled();

        // @ts-expect-error -- WIP
        field.unleash();

        await postpone();
        expect(spy).toHaveBeenCalledWith(
          42,
          expect.objectContaining({ changes: change.field.value }),
        );
      });
    });
  });

  describe("watch", () => {
    describe("watch", () => {
      describe("primitive", () => {
        it("allows to subscribe for field changes", async () => {
          const field = new Field(42);

          const unsub = field.watch((value) => {
            expect(value).toBe(43);
            unsub();
            // Check if the callback is not called after unsub
            field.set(44);
            setTimeout(resolve);
          });

          field.set(43);

          function resolve() {
            // Test passes if we reach here without the callback being called again
          }
        });

        it("provides event object with change type as changes", async () => {
          const field = new Field(42);

          const unsub = field.watch((value, event) => {
            expect(event.changes).toBe(change.field.value);
            unsub();
          });

          field.set(43);
          await postpone();
        });

        describe.todo("changes");
      });

      describe("object", () => {
        it("listens to the field changes", async () => {
          const field = new Field({ num: 42 });

          const unsub = field.watch((value, event) => {
            try {
              expect(event.changes).toMatchChanges(change.child.value);
              expect(value.num).toBe(43);
            } finally {
              unsub();
            }
          });

          field.$.num.set(43);
          await postpone();
        });

        it("listens to fields create", async () => {
          const field = new Field<{ num: number; str?: string }>({
            num: 42,
          });

          const unsub = field.watch((value, event) => {
            expect(event.changes).toBe(
              change.child.attach | change.field.shape,
            );
            expect(value.str).toBe("Hello!");
            unsub();
          });

          field.$.str.set("Hello!");
          await postpone();
        });

        it.skip("listens to field object create", async () => {
          const field = new Field<Record<number, { n: number }>>({
            1: { n: 1 },
            2: { n: 2 },
          });

          return new Promise<void>((resolve, reject) => {
            const unsub = field.watch((value, event) => {
              try {
                expect(event.changes).toMatchChanges(
                  change.child.attach | change.field.shape,
                );
                expect(value[3]).toEqual({ n: 3 });
                unsub();
              } catch (error) {
                reject(error);
                return;
              }
              resolve();
            });

            field.at(3).set({ n: 3 });
          });
        });

        describe("changes", () => {
          describe.todo("field");

          describe.todo("child");

          describe.todo("subtree");
        });
      });

      describe("array", () => {
        it("listens to the item field changes", async () => {
          const field = new Field([1, 2, 3]);

          const unsub = field.watch((value, event) => {
            try {
              expect(event.changes).toMatchChanges(change.child.value);
              expect(value[1]).toBe(43);
            } finally {
              unsub();
            }
          });

          field.at(1).set(43);
          await postpone();
        });

        it("listens to items create", async () => {
          const field = new Field([1, 2, 3]);

          const unsub = field.watch((value, event) => {
            expect(event.changes).toBe(
              change.child.attach | change.field.shape,
            );
            expect(value[5]).toBe(43);
            unsub();
          });

          field.at(5).set(43);
          await postpone();
        });

        it.skip("listens to items object create", async () => {
          const field = new Field<Array<{ n: number }>>([{ n: 1 }, { n: 2 }]);

          return new Promise<void>((resolve, reject) => {
            const unsub = field.watch((value, event) => {
              try {
                expect(event.changes).toMatchChanges(
                  change.child.attach | change.field.shape,
                );
                expect(value[2]).toEqual({ n: 3 });
                unsub();
              } catch (error) {
                reject(error);
                return;
              }
              resolve();
            });

            field.at(2).set({ n: 3 });
          });
        });

        describe("changes", () => {
          describe.todo("field");

          describe.todo("child");

          describe.todo("subtree");
        });
      });

      describe("instance", () => {
        it("allows to subscribe for field changes", async () => {
          const map = new Map();
          map.set("num", 42);
          const field = new Field(map);

          const unsub = field.watch((value) => {
            expect(Object.fromEntries(value)).toEqual({ num: 43 });
            unsub();
            // Check if the callback is not called after unsub
            field.set(new Map());
          });

          const newMap = new Map();
          newMap.set("num", 43);
          field.set(newMap);
          await postpone();
        });

        it("provides event object with change type as changes", async () => {
          const field = new Field(42);

          const unsub = field.watch((value, event) => {
            expect(event.changes).toBe(change.field.value);
            unsub();
          });

          field.set(43);
          await postpone();
        });

        describe.todo("changes");
      });
    });

    describe("unwatch", () => {
      it("unsubscribes all watchers", () => {
        const field = new Field(42);
        const spy = vi.fn();
        field.watch(spy);
        // @ts-expect-error -- WIP
        field.unwatch();
        field.set(43);
        expect(spy).not.toHaveBeenCalled();
      });

      it("unsubscribes all children", () => {
        const field = new Field({ num: 42 });
        const spy = vi.fn();
        field.$.num?.watch(spy);
        // @ts-expect-error -- WIP
        field.unwatch();
        field.$.num?.set(43);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe.skip("map", () => {
    describe("narrow", () => {
      it("allows to narrow the field type", () => {
        const field = new Field<string | number>("Hello, world!");
        // @ts-expect-error -- WIP
        const narrowed = field.narrow(
          // @ts-expect-error -- WIP
          (value, ok) => typeof value === "string" && ok(value),
        );
        narrowed satisfies Field<string> | undefined;
        expect(narrowed?.value).toBe("Hello, world!");
      });
    });

    describe("widen", () => {
      it("allows to widen the field type", () => {
        const field = new Field<string>("Hello, world!");
        // @ts-expect-error -- WIP
        const widened = field.widen<undefined>();
        widened satisfies Field<string | undefined>;
      });
    });
  });

  describe("computed", () => {
    describe("into", () => {
      it("allows to create a computed field", () => {
        const field = new Field({ message: "Hello, world!" });
        const computed = field.$.message.into(toCodes).from(fromCodes);
        expect(computed.value).toEqual([
          72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33,
        ]);
      });

      it("updates the field back from computed", async () => {
        const field = new Field({ message: "Hello, world!" });
        const computed = field.$.message.into(toCodes).from(fromCodes);
        computed.set([72, 105, 33]);
        await postpone();
        expect(field.value).toEqual({ message: "Hi!" });
      });

      it("passes the current value as 2nd argument", () => {
        const field = new Field({ message: "Hello, world!" });
        const intoSpy = vi.fn().mockReturnValue("Hey!");
        const fromSpy = vi.fn().mockReturnValue("Yo!");
        const computed = field.$.message.into(intoSpy).from(fromSpy);
        computed.set("Hi!");
        // into
        expect(intoSpy).toHaveBeenCalledOnce();
        expect(intoSpy).toBeCalledWith("Hello, world!", undefined);
        // from
        expect(fromSpy).toHaveBeenCalledOnce();
        expect(fromSpy).toBeCalledWith("Hi!", "Hello, world!");
      });

      it("triggers field update", async () => {
        const field = new Field({ message: "Hello, world!" });
        const computed = field.$.message.into(toCodes).from(fromCodes);

        const unsub = field.$.message.watch((value) => {
          expect(value).toBe("Hi!");
          unsub();
        });

        computed.set([72, 105, 33]);
        await postpone();
      });
    });

    // describe("computedMap", () => {
    //   it("is a computed map instance", () => {
    //     const field = new Field(123);
    //     expect(field.computedMap).toBeInstanceOf(ComputedMap);
    //   });

    //   it("points to the root computed map", () => {
    //     const field = new Field({ a: { b: { c: 42 } } });
    //     expect(field.$.a.$.b.computedMap).toBe(field.computedMap);
    //     expect(field.$.a.$.b.$.c.computedMap).toBe(field.computedMap);
    //   });
    // });

    // describe("computedFields", () => {
    //   it("returns computed fields", () => {
    //     const field = new Field([1, 2, 3]);
    //     const intoSum = (arr: number[]) =>
    //       arr.reduce((acc, num) => acc + num, 0);
    //     const fromArr = () => [];
    //     const computed1 = field.into(intoSum).from(fromArr);
    //     const computed2 = field.into(intoSum).from(fromArr);
    //     const computed3 = field
    //       .at(0)
    //       .into((num) => (num || 0) * 2)
    //       .from(() => 0);
    //     expect(field.computedFields).toEqual([computed1, computed2]);
    //     expect(field.at(0).computedFields).toEqual([computed3]);
    //     expect(field.at(1).computedFields).toEqual([]);
    //   });
    // });
  });

  describe("input", () => {
    describe("input", () => {
      it("generates props for a field", () => {
        const field = new Field({ name: { first: "Alexander" } });
        const props = field.$.name.$.first.control();
        expect(props.name).toEqual("name.first");
        expect(props.ref).toBe(field.$.name.$.first.ref);
      });

      it("assigns . name for the root field", () => {
        const field = new Field({ name: { first: "Alexander" } });
        const props = field.control();
        expect(props.name).toEqual(".");
      });
    });
  });

  describe("errors", () => {
    describe("errors", () => {
      it("returns direct errors of the field", () => {
        const field = new Field(42);
        field.addError("Something went wrong");
        field.addError("Something went wrong again");
        expect(field.errors).toEqual([
          { message: "Something went wrong" },
          { message: "Something went wrong again" },
        ]);
      });

      it("excludes tree errors", () => {
        const field = new Field({ name: { first: "Sasha" } });
        field.$.name.addError("Something went wrong");
        field.$.name.$.first.addError("Something went wrong again");
        expect(field.errors).toEqual([]);
      });
    });

    describe(Field.prototype.addError, () => {
      it("adds error to field", () => {
        const field = new Field(42);
        field.addError({ type: "internal", message: "Something went wrong" });
        expect(field.errors).toEqual([
          { type: "internal", message: "Something went wrong" },
        ]);
      });

      it("convert string to error", () => {
        const field = new Field(42);
        field.addError("Something went wrong");
        expect(field.errors).toEqual([{ message: "Something went wrong" }]);
      });

      describe("changes", () => {
        describe("field", () => {
          it("triggers updates", async () => {
            const field = new Field(42);
            const spy = vi.fn();
            field.watch(spy);
            field.addError("Something went wrong");
            await postpone();
            expect(spy).toReceiveChanges(
              change.field.invalid | change.field.errors,
            );
          });

          it("does not trigger invalid changes if the field is already invalid", async () => {
            const field = new Field(42);
            field.addError("Something went wrong");
            await postpone();
            const spy = vi.fn();
            field.watch(spy);
            field.addError("Something went wrong again");
            await postpone();
            expect(spy).toReceiveChanges(change.field.errors);
          });
        });

        describe("child", () => {
          it("triggers updates", async () => {
            const field = new Field({ name: { first: "Sasha" } });
            const spy = vi.fn();
            field.$.name.watch(spy);
            field.$.name.$.first.addError("Something went wrong");
            await postpone();
            expect(spy).toReceiveChanges(
              change.child.invalid | change.child.errors,
            );
          });
        });

        describe("subtree", () => {
          it("triggers updates", async () => {
            const field = new Field({ name: { first: "Sasha" } });
            const spy = vi.fn();
            field.watch(spy);
            field.$.name.$.first.addError("Something went wrong");
            await postpone();
            expect(spy).toReceiveChanges(
              change.subtree.invalid | change.subtree.errors,
            );
          });
        });
      });

      describe("computed", () => {
        it("sets the error to the source field", () => {
          const field = new Field({ name: { first: "Sasha" } });
          const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
          computed.addError("Something went wrong");
          expect(field.$.name.$.first.errors).toEqual([
            { message: "Something went wrong" },
          ]);
        });
      });
    });

    describe(Field.prototype.clearErrors, () => {
      it("clears the errors", () => {
        const field = new Field(42);
        field.addError("Something went wrong");
        field.clearErrors();
        expect(field.errors).toHaveLength(0);
        expect(field.valid).toBe(true);
      });

      describe("changes", () => {
        describe("field", () => {
          it("triggers updates", async () => {
            const field = new Field(42);
            const spy = vi.fn();
            field.watch(spy);
            field.addError("Something went wrong");
            field.clearErrors();
            await postpone();
            expect(spy).toReceiveChanges(
              change.field.valid | change.field.errors,
            );
          });

          it("ignores updates if the field has no errors", async () => {
            const field = new Field(42);
            const spy = vi.fn();
            field.watch(spy);
            field.clearErrors();
            await postpone();
            expect(spy).toHaveBeenCalledTimes(0);
          });
        });

        describe("child", () => {
          it("triggers updates", async () => {
            const field = new Field({ name: { first: "Sasha" } });
            field.$.name.$.first.addError("Something went wrong");
            await postpone();
            const spy = vi.fn();
            field.$.name.watch(spy);
            field.$.name.$.first.clearErrors();
            await postpone();
            expect(spy).toReceiveChanges(
              change.child.valid | change.child.errors,
            );
          });
        });

        describe("subtree", () => {
          it("triggers updates", async () => {
            const field = new Field({ name: { first: "Sasha" } });
            field.$.name.$.first.addError("Something went wrong");
            await postpone();
            const spy = vi.fn();
            field.watch(spy);
            field.$.name.$.first.clearErrors();
            await postpone();
            expect(spy).toReceiveChanges(
              change.subtree.valid | change.subtree.errors,
            );
          });
        });
      });

      describe("computed", () => {
        it("clears errors of the source field", () => {
          const field = new Field({ name: { first: "Sasha" } });
          const computed = field.$.name.$.first.into(toCodes).from(fromCodes);
          computed.addError("Something went wrong");
          computed.clearErrors();
          expect(field.$.name.$.first.errors).toHaveLength(0);
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
        field.$.name.$.first.addError("First name is required");
        expect(field.valid).toBe(false);
        expect(field.$.name.valid).toBe(false);
        field.$.name.$.first.clearErrors();
        expect(field.valid).toBe(true);
        expect(field.$.name.valid).toBe(true);
      });

      it("is false if the source field is invalid", () => {
        const field = new Field({ name: { first: "", last: "" } });
        const computed = field.$.name.into(toFullName).from(fromFullName);
        expect(computed.valid).toBe(true);
        field.$.name.$.first.addError("First name is required");
        field.$.name.$.last.addError("Last name is required");
        expect(computed.valid).toBe(false);
      });
    });
  });

  describe("validation", () => {
    describe("#validate", () => {
      describe("primitive", () => {
        it("allows to validate the state", () => {
          const field = new Field(42);
          field.validate((ref) => {
            if (ref.value !== 43) {
              ref.addError("Invalid");
            }
          });
          expect(field.valid).toBe(false);
          expect(field.errors).toEqual([{ message: "Invalid" }]);
        });

        it("clears previous errors on validation", () => {
          function validateNum(ref: Field.Ref<number>) {
            if (ref.value !== 43) {
              ref.addError("Invalid");
            }
          }
          const field = new Field(42);
          field.validate(validateNum);
          field.set(43);
          field.validate(validateNum);
          expect(field.valid).toBe(true);
        });

        describe.todo("changes");
      });

      describe("object", () => {
        it("allows to validate the state", () => {
          const field = new Field<Name>({ first: "" });

          field.validate(validateName);

          expect(field.valid).toBe(false);
          expect(field.$.first.errors).toEqual([{ message: "Required" }]);
          expect(field.$.last.errors).toEqual([{ message: "Required" }]);
        });

        it("clears previous errors on validation", () => {
          const field = new Field<Name>({ first: "" });

          field.validate(validateName);

          expect(field.valid).toBe(false);
          expect(field.$.first.errors).toEqual([{ message: "Required" }]);
          expect(field.$.last.errors).toEqual([{ message: "Required" }]);

          field.set({ first: "Sasha", last: "Koss" });
          field.validate(validateName);

          expect(field.valid).toBe(true);
          expect(field.$.first.errors).toHaveLength(0);
          expect(field.$.last.errors).toHaveLength(0);
        });

        it("sends a single watch event on validation", async () => {
          const field = new Field<Name>({ first: "" });

          const fieldSpy = vi.fn();
          const nameSpy = vi.fn();
          field.watch(fieldSpy);
          field.$.first.watch(nameSpy);

          await field.validate(validateName);

          expect(fieldSpy).toHaveBeenCalledOnce();
          expect(fieldSpy).toReceiveChanges(
            change.child.invalid | change.child.errors,
          );

          expect(nameSpy).toHaveBeenCalledOnce();
          expect(nameSpy).toReceiveChanges(
            change.field.invalid | change.field.errors,
          );
        });

        it("allows to iterate the fields", () => {
          const field = new Field<{
            first: string;
            last?: string | undefined;
          }>({
            first: "",
            last: undefined,
          });
          field.validate((ref) => {
            ref.forEach((valueRef) => {
              if (!valueRef.value?.trim()) {
                valueRef.addError("Required");
              }
            });
          });
          expect(field.valid).toBe(false);
          expect(field.$.first.errors).toEqual([{ message: "Required" }]);
          expect(field.$.last.errors).toEqual([{ message: "Required" }]);
        });

        it("allows to validate records", () => {
          const field = new Field<Record<string, number>>({
            one: 1,
            two: 2,
          });
          field.validate((ref) => {
            ref.at("two").addError("Invalid");
          });
          expect(field.valid).toBe(false);
          expect(field.at("two").errors).toEqual([{ message: "Invalid" }]);
        });

        describe("changes", () => {
          describe.todo("field");

          describe.todo("child");

          describe.todo("subtree");
        });
      });

      describe.todo("array");

      describe("instance", () => {
        it("allows to validate the state", () => {
          const map = new Map();
          map.set("num", 42);
          const field = new Field(map);
          field.validate((ref) => {
            if (ref.value.get("num") !== 43) {
              ref.addError("Invalid");
            }
          });
          expect(field.valid).toBe(false);
          expect(field.errors).toEqual([{ message: "Invalid" }]);
        });

        it("clears previous errors on validation", () => {
          function validateMap(ref: Field.Ref<Map<string, number>>) {
            if (ref.value.get("num") !== 43) {
              ref.addError("Invalid");
            }
          }
          const map = new Map();
          map.set("num", 42);
          const field = new Field(map);
          field.validate(validateMap);

          map.set("num", 43);
          field.validate(validateMap);
          expect(field.valid).toBe(true);
        });

        describe.todo("changes");
      });
    });
  });
});

//#endregion

//#region ComputedField

describe.skip(ComputedField, () => {
  describe("value", () => {
    describe(ComputedField.prototype.set, () => {
      it("allows chaining multiple computed fields", async () => {
        const source = new FieldOld<{
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
        expect(first.get()).toBe("Sasha");
        expect(name.get()).toEqual({ first: "Sasha" });
        expect(source.get()).toEqual({ name: { first: "Sasha" } });
        last.set("Koss");
        await postpone();
        expect(last.get()).toBe("Koss");
        expect(name.get()).toEqual({ first: "Sasha", last: "Koss" });
        expect(source.get()).toEqual({
          name: { first: "Sasha", last: "Koss" },
        });
      });
    });
  });

  describe("events", () => {
    it("delegates events to the source field", async () => {
      const source = new FieldOld<string>("Hello, world!");
      const computed = new ComputedField<string, string>(
        source,
        () => "Hi!",
        (value) => value,
      );
      const spy = vi.fn();
      source.watch(spy);
      computed.trigger(change.field.blur, true);
      await postpone();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toReceiveChanges(change.field.blur);
    });

    it("delegates events through a detached field", async () => {
      const source = new FieldOld<{ name?: { first?: string; last?: string } }>(
        {},
      );
      const sourceSpy = vi.fn();
      source.watch(sourceSpy);
      const detachedSpy = vi.fn();
      source.$.name.watch(detachedSpy);
      const computed = source.$.name
        .into((name) => [name?.first, name?.last].join(" "))
        .from(fromFullName);
      computed.trigger(change.field.blur, true);
      await postpone();
      expect(sourceSpy).toHaveBeenCalledOnce();
      expect(sourceSpy).toReceiveChanges(change.child.blur);
      expect(detachedSpy).toHaveBeenCalledOnce();
      expect(detachedSpy).toReceiveChanges(change.field.blur);
    });

    it("delegates events through computed chains", async () => {
      const source = new FieldOld<{ name?: { first?: string; last?: string } }>(
        {},
      );
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
      first.trigger(change.field.blur, true);
      await postpone();
      expect(sourceSpy).toHaveBeenCalledOnce();
      expect(sourceSpy).toReceiveChanges(change.subtree.blur);
      expect(nameSpy).toHaveBeenCalledOnce();
      expect(nameSpy).toReceiveChanges(change.child.blur);
    });

    it("receives all validation events", async () => {
      const source = new FieldOld<string | undefined>(undefined);
      const computed = source.into((val) => val || "").from((str) => str);
      const spy = vi.fn();
      computed.watch(spy);
      computed.addError("Something went wrong");
      await postpone();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toReceiveChanges(change.field.errors | change.field.invalid);
      expect(computed.errors).toEqual([{ message: "Something went wrong" }]);
      expect(computed.valid).toBe(false);
      source.clearErrors();
      await postpone();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toReceiveChanges(change.field.valid | change.field.errors);
      expect(computed.errors).toHaveLength(0);
      expect(computed.valid).toBe(true);
    });

    it("receives validation events through computed chains", async () => {
      const source = new FieldOld<{ name?: { first?: string; last?: string } }>(
        {},
      );
      const sourceSpyInvalid = vi.fn();
      source.watch(sourceSpyInvalid);
      const name = source.$.name
        .into((name) => name || {})
        .from((name) => name);
      const nameSpyInvalid = vi.fn();
      name.watch(nameSpyInvalid);
      const first = name.$.first
        .into((first) => first || "")
        .from((first) => first);
      const firstSpyInvalid = vi.fn();
      first.watch(firstSpyInvalid);
      first.addError("Something went wrong");
      await postpone();
      expect(sourceSpyInvalid).toHaveBeenCalledOnce();
      expect(sourceSpyInvalid).toReceiveChanges(
        change.subtree.errors | change.subtree.invalid,
      );
      expect(nameSpyInvalid).toHaveBeenCalledOnce();
      expect(nameSpyInvalid).toHaveBeenCalledBefore(sourceSpyInvalid);
      expect(nameSpyInvalid).toReceiveChanges(
        change.child.errors | change.child.invalid,
      );
      expect(firstSpyInvalid).toHaveBeenCalledOnce();
      expect(firstSpyInvalid).toHaveBeenCalledBefore(nameSpyInvalid);
      expect(firstSpyInvalid).toReceiveChanges(
        change.field.errors | change.field.invalid,
      );
      expect(first.errors).toEqual([{ message: "Something went wrong" }]);
      expect(first.valid).toBe(false);
      const sourceSpyValid = vi.fn();
      source.watch(sourceSpyValid);
      const nameSpyValid = vi.fn();
      name.watch(nameSpyValid);
      const firstSpyValid = vi.fn();
      first.watch(firstSpyValid);
      source.clearErrors();
      await postpone();
      expect(sourceSpyValid).toHaveBeenCalledOnce();
      expect(sourceSpyValid).toReceiveChanges(
        change.subtree.valid | change.subtree.errors,
      );
      expect(nameSpyValid).toHaveBeenCalledOnce();
      expect(nameSpyValid).toHaveBeenCalledBefore(sourceSpyValid);
      expect(nameSpyValid).toReceiveChanges(
        change.child.valid | change.child.errors,
      );
      expect(firstSpyValid).toHaveBeenCalledOnce();
      expect(firstSpyValid).toHaveBeenCalledBefore(nameSpyValid);
      expect(firstSpyValid).toReceiveChanges(
        change.field.valid | change.field.errors,
      );
      expect(first.errors).toHaveLength(0);
      expect(first.valid).toBe(true);
    });

    it("receives validation events through maybe refs", async () => {
      const source = new FieldOld<{
        user?: { name?: { first?: string; last?: string } };
      }>({});
      const sourceSpyInvalid = vi.fn();
      source.watch(sourceSpyInvalid);
      const user = source.$.user
        .into((user) => user || {})
        .from((user) => user);
      const userSpyInvalid = vi.fn();
      user.watch(userSpyInvalid);
      const name = user.$.name.into((name) => name || {}).from((name) => name);
      const nameSpyInvalid = vi.fn();
      name.watch(nameSpyInvalid);
      const first = name.$.first
        .into((first) => first || "")
        .from((first) => first);
      source.validate((ref) => {
        ref
          .maybe()
          .at("user")
          .at("name")
          .at("first")
          .addError("Something went wrong");
      });
      const firstSpyInvalid = vi.fn();
      first.watch(firstSpyInvalid);
      await postpone();
      expect(sourceSpyInvalid).toHaveBeenCalledOnce();
      expect(sourceSpyInvalid).toReceiveChanges(
        change.subtree.errors | change.subtree.invalid,
      );
      expect(userSpyInvalid).toHaveBeenCalledOnce();
      expect(userSpyInvalid).toHaveBeenCalledBefore(sourceSpyInvalid);
      expect(userSpyInvalid).toReceiveChanges(
        change.subtree.invalid | change.subtree.errors,
      );
      expect(nameSpyInvalid).toHaveBeenCalledOnce();
      expect(nameSpyInvalid).toHaveBeenCalledBefore(userSpyInvalid);
      expect(nameSpyInvalid).toReceiveChanges(
        change.child.invalid | change.child.errors,
      );
      expect(firstSpyInvalid).toHaveBeenCalledOnce();
      expect(firstSpyInvalid).toHaveBeenCalledBefore(nameSpyInvalid);
      expect(firstSpyInvalid).toReceiveChanges(
        change.field.invalid | change.field.errors,
      );
      expect(first.errors).toEqual([{ message: "Something went wrong" }]);
      expect(first.valid).toBe(false);
      const sourceSpyValid = vi.fn();
      source.watch(sourceSpyValid);
      const userSpyValid = vi.fn();
      user.watch(userSpyValid);
      const nameSpyValid = vi.fn();
      name.watch(nameSpyValid);
      const firstSpyValid = vi.fn();
      first.watch(firstSpyValid);
      source.clearErrors();
      await postpone();
      expect(sourceSpyValid).toHaveBeenCalledOnce();
      expect(sourceSpyValid).toReceiveChanges(
        change.subtree.valid | change.subtree.errors,
      );
      expect(userSpyValid).toHaveBeenCalledOnce();
      expect(userSpyValid).toHaveBeenCalledBefore(sourceSpyValid);
      expect(userSpyValid).toReceiveChanges(
        change.subtree.valid | change.subtree.errors,
      );
      expect(nameSpyValid).toHaveBeenCalledOnce();
      expect(nameSpyValid).toHaveBeenCalledBefore(userSpyValid);
      expect(nameSpyValid).toReceiveChanges(
        change.child.valid | change.child.errors,
      );
      expect(firstSpyValid).toHaveBeenCalledOnce();
      expect(firstSpyValid).toHaveBeenCalledBefore(nameSpyValid);
      expect(firstSpyValid).toReceiveChanges(
        change.field.valid | change.field.errors,
      );
      expect(first.errors).toHaveLength(0);
      expect(first.valid).toBe(true);
    });

    it("receives add error events despited existing fields", async () => {
      // 1. When source is {}
      const source1 = new FieldOld<{
        name?: { first?: string; last?: string };
      }>({});
      const sourceSpy1 = vi.fn();
      source1.watch(sourceSpy1);
      const name1 = source1.$.name
        .into((name) => name || {})
        .from((name) => name);
      const nameSpy1 = vi.fn();
      name1.watch(nameSpy1);
      const first1 = name1.$.first
        .into((first) => first || "")
        .from((first) => first);
      source1.validate((ref) => {
        ref.maybe().at("name").at("first").addError("Something went wrong");
      });
      const firstSpy1 = vi.fn();
      first1.watch(firstSpy1);
      await postpone();
      expect(sourceSpy1).toHaveBeenCalledOnce();
      expect(sourceSpy1).toReceiveChanges(
        change.subtree.invalid | change.subtree.errors,
      );
      expect(nameSpy1).toHaveBeenCalledOnce();
      expect(nameSpy1).toHaveBeenCalledBefore(sourceSpy1);
      expect(nameSpy1).toReceiveChanges(
        change.child.invalid | change.child.errors,
      );
      expect(firstSpy1).toHaveBeenCalledOnce();
      expect(firstSpy1).toHaveBeenCalledBefore(nameSpy1);
      expect(firstSpy1).toReceiveChanges(
        change.field.invalid | change.field.errors,
      );
      expect(first1.errors).toEqual([{ message: "Something went wrong" }]);
      expect(first1.valid).toBe(false);
      // 2. When source is { name: {} }
      const source2 = new FieldOld<{
        name?: { first?: string; last?: string };
      }>({ name: {} });
      const sourceSpy2 = vi.fn();
      source2.watch(sourceSpy2);
      const name2 = source2.$.name
        .into((name) => name || {})
        .from((name) => name);
      const nameSpy2 = vi.fn();
      name2.watch(nameSpy2);
      const first2 = name2.$.first
        .into((first) => first || "")
        .from((first) => first);
      source2.validate((ref) => {
        ref.maybe().at("name").at("first").addError("Something went wrong");
      });
      const firstSpy2 = vi.fn();
      first2.watch(firstSpy2);
      await postpone();
      expect(sourceSpy2).toHaveBeenCalledOnce();
      expect(sourceSpy2).toReceiveChanges(
        change.subtree.invalid | change.subtree.errors,
      );
      expect(nameSpy2).toHaveBeenCalledOnce();
      expect(nameSpy2).toHaveBeenCalledBefore(sourceSpy2);
      expect(nameSpy2).toReceiveChanges(
        change.child.invalid | change.child.errors,
      );
      expect(firstSpy2).toHaveBeenCalledOnce();
      expect(firstSpy2).toHaveBeenCalledBefore(nameSpy2);
      expect(firstSpy2).toReceiveChanges(
        change.field.invalid | change.field.errors,
      );
      expect(first2.errors).toEqual([{ message: "Something went wrong" }]);
      expect(first2.valid).toBe(false);
    });

    it("receives clear error events despited existing fields", async () => {
      // 1. When source is {}
      const source1 = new FieldOld<{
        name?: { first?: string; last?: string };
      }>({});
      const name1 = source1.$.name
        .into((name) => name || {})
        .from((name) => name);
      const first1 = name1.$.first
        .into((first) => first || "")
        .from((first) => first);
      source1.validate((ref) => {
        ref.maybe().at("name").at("first").addError("Something went wrong");
      });
      await postpone();
      const sourceSpy1 = vi.fn();
      source1.watch(sourceSpy1);
      const nameSpy1 = vi.fn();
      name1.watch(nameSpy1);
      const firstSpy1 = vi.fn();
      first1.watch(firstSpy1);
      source1.clearErrors();
      await postpone();
      expect(sourceSpy1).toHaveBeenCalledOnce();
      expect(sourceSpy1).toReceiveChanges(
        change.subtree.valid | change.subtree.errors,
      );
      expect(nameSpy1).toHaveBeenCalledOnce();
      expect(nameSpy1).toHaveBeenCalledBefore(sourceSpy1);
      expect(nameSpy1).toReceiveChanges(
        change.child.valid | change.child.errors,
      );
      expect(firstSpy1).toHaveBeenCalledOnce();
      expect(firstSpy1).toHaveBeenCalledBefore(nameSpy1);
      expect(firstSpy1).toReceiveChanges(
        change.field.valid | change.field.errors,
      );
      expect(first1.errors).toEqual([]);
      expect(first1.valid).toBe(true);
      // 2. When source is { name: {}}
      const source2 = new FieldOld<{
        name?: { first?: string; last?: string };
      }>({ name: {} });
      const name2 = source2.$.name
        .into((name) => name || {})
        .from((name) => name);
      const first2 = name2.$.first
        .into((first) => first || "")
        .from((first) => first);
      source2.validate((ref) => {
        ref.maybe().at("name").at("first").addError("Something went wrong");
      });
      await postpone();
      const sourceSpy2 = vi.fn();
      source2.watch(sourceSpy2);
      const nameSpy2 = vi.fn();
      name2.watch(nameSpy2);
      const firstSpy2 = vi.fn();
      first2.watch(firstSpy2);
      source2.clearErrors();
      await postpone();
      expect(sourceSpy2).toHaveBeenCalledOnce();
      expect(sourceSpy2).toReceiveChanges(
        change.subtree.valid | change.subtree.errors,
      );
      expect(nameSpy2).toHaveBeenCalledOnce();
      expect(nameSpy2).toHaveBeenCalledBefore(sourceSpy2);
      expect(nameSpy2).toReceiveChanges(
        change.child.valid | change.child.errors,
      );
      expect(firstSpy2).toHaveBeenCalledOnce();
      expect(firstSpy2).toHaveBeenCalledBefore(nameSpy2);
      expect(firstSpy2).toReceiveChanges(
        change.field.valid | change.field.errors,
      );
      expect(first2.errors).toEqual([]);
      expect(first2.valid).toBe(true);
    });

    it("delivers valid events to parallel computed fields", async () => {
      // 1. When source is {}
      const source1 = new FieldOld<{
        name?: { first?: string; last?: string };
      }>({});
      const hasName1 = source1.$.name
        .into((name) => !!name)
        .from((hasName, prevValue) =>
          hasName ? prevValue || { first: "", last: "" } : undefined,
        );
      const hasNameSpyInvalid1 = vi.fn();
      hasName1.watch(hasNameSpyInvalid1);
      const name1 = source1.$.name
        .into((name) => name || {})
        .from((name) => name);
      const first1 = name1.$.first
        .into((first) => first || "")
        .from((first) => first);
      source1.validate((ref) => {
        ref.maybe().at("name").at("first").addError("Something went wrong");
      });
      await postpone();
      expect(hasNameSpyInvalid1).toHaveBeenCalledOnce();
      expect(hasNameSpyInvalid1).toReceiveChanges(
        change.child.invalid | change.child.errors,
      );
      expect(hasName1.errors).toEqual([]);
      expect(hasName1.valid).toBe(false);
      const hasNameSpyValid1 = vi.fn();
      hasName1.watch(hasNameSpyValid1);
      source1.clearErrors();
      await postpone();
      expect(hasNameSpyValid1).toHaveBeenCalledOnce();
      expect(hasNameSpyValid1).toReceiveChanges(
        change.child.valid | change.child.errors,
      );
      expect(first1.errors).toEqual([]);
      expect(first1.valid).toBe(true);
      // 2. When source is { name: {} }
      const source2 = new FieldOld<{
        name?: { first?: string; last?: string };
      }>({ name: {} });
      const hasName2 = source2.$.name
        .into((name) => !!name)
        .from((hasName, prevValue) =>
          hasName ? prevValue || { first: "", last: "" } : undefined,
        );
      const hasNameSpyInvalid2 = vi.fn();
      hasName2.watch(hasNameSpyInvalid2);
      const name2 = source2.$.name
        .into((name) => name || {})
        .from((name) => name);
      const first2 = name2.$.first
        .into((first) => first || "")
        .from((first) => first);
      source2.validate((ref) => {
        ref.maybe().at("name").at("first").addError("Something went wrong");
      });
      await postpone();
      expect(hasNameSpyInvalid2).toHaveBeenCalledOnce();
      expect(hasNameSpyInvalid2).toReceiveChanges(
        change.child.invalid | change.child.errors,
      );
      expect(hasName2.errors).toEqual([]);
      expect(hasName2.valid).toBe(false);
      const hasNameSpyValid2 = vi.fn();
      hasName2.watch(hasNameSpyValid2);
      source2.clearErrors();
      await postpone();
      expect(hasNameSpyValid2).toHaveBeenCalledOnce();
      expect(hasNameSpyValid2).toReceiveChanges(
        change.child.valid | change.child.errors,
      );
      expect(first2.errors).toEqual([]);
      expect(first2.valid).toBe(true);
    });

    it("listens to validation events through data updates", async () => {
      const source = new FieldOld<{
        user?: { name?: { first?: string | undefined; last?: string } };
      }>({});
      const sourceSpyInvalid = vi.fn();
      source.watch(sourceSpyInvalid);
      const user = source.$.user
        .into((user) => user || {})
        .from((user) => user);
      const userSpyInvalid = vi.fn();
      user.watch(userSpyInvalid);
      const name = user.$.name.into((name) => name || {}).from((name) => name);
      const nameSpyInvalid = vi.fn();
      name.watch(nameSpyInvalid);
      const first = name.$.first
        .into((first) => first || "")
        .from((first) => first);
      source.validate((ref) => {
        ref
          .maybe()
          .at("user")
          .at("name")
          .at("first")
          .addError("Something went wrong");
      });
      const firstSpyInvalid = vi.fn();
      first.watch(firstSpyInvalid);
      await postpone();
      expect(sourceSpyInvalid).toHaveBeenCalledOnce();
      expect(sourceSpyInvalid).toReceiveChanges(
        change.subtree.errors | change.subtree.invalid,
      );
      expect(userSpyInvalid).toHaveBeenCalledOnce();
      expect(userSpyInvalid).toHaveBeenCalledBefore(sourceSpyInvalid);
      expect(userSpyInvalid).toReceiveChanges(
        change.subtree.invalid | change.subtree.errors,
      );
      expect(nameSpyInvalid).toHaveBeenCalledOnce();
      expect(nameSpyInvalid).toHaveBeenCalledBefore(userSpyInvalid);
      expect(nameSpyInvalid).toReceiveChanges(
        change.child.invalid | change.child.errors,
      );
      expect(firstSpyInvalid).toHaveBeenCalledOnce();
      expect(firstSpyInvalid).toHaveBeenCalledBefore(nameSpyInvalid);
      expect(firstSpyInvalid).toReceiveChanges(
        change.field.invalid | change.field.errors,
      );
      expect(first.errors).toEqual([{ message: "Something went wrong" }]);
      expect(first.valid).toBe(false);
      const sourceSpyValid = vi.fn();
      source.watch(sourceSpyValid);
      const userSpyValid = vi.fn();
      user.watch(userSpyValid);
      const nameSpyValid = vi.fn();
      name.watch(nameSpyValid);
      const firstSpyValid = vi.fn();
      first.watch(firstSpyValid);
      source.set({ user: { name: { first: undefined } } });
      source.clearErrors();
      await postpone();
      expect(sourceSpyValid).toHaveBeenCalledOnce();
      expect(sourceSpyValid).toReceiveChanges(
        change.field.shape |
          change.child.attach |
          change.subtree.valid |
          change.subtree.errors,
      );
      expect(userSpyValid).toHaveBeenCalledOnce();
      expect(userSpyValid).toHaveBeenCalledBefore(sourceSpyValid);
      expect(userSpyValid).toReceiveChanges(
        change.field.shape |
          change.child.attach |
          change.subtree.valid |
          change.subtree.errors,
      );
      expect(nameSpyValid).toHaveBeenCalledOnce();
      expect(nameSpyValid).toHaveBeenCalledBefore(userSpyValid);
      expect(nameSpyValid).toReceiveChanges(
        change.field.shape |
          change.child.attach |
          change.child.valid |
          change.child.errors,
      );
      expect(firstSpyValid).toHaveBeenCalledOnce();
      // TODO:
      // expect(firstSpyValid).toHaveBeenCalledBefore(nameSpyValid);
      expect(firstSpyValid).toReceiveChanges(
        change.field.valid | change.field.errors,
      );
      expect(first.errors).toHaveLength(0);
      expect(first.valid).toBe(true);
    });
  });

  describe("validation", () => {
    it("points to the source field validation", () => {
      const source = new FieldOld<string>("Hello!");
      const computed = new ComputedField<string, string>(
        source,
        () => "Hi!",
        (value) => value,
      );
      expect(computed.validationTree).toBe(source.validationTree);
    });
  });
});

//#endregion

//#region Helpers

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

function validateRequired(
  ref: Field.Ref<string> | Field.Ref<string | undefined>,
) {
  if (!ref.value?.trim()) ref.addError("Required");
}

function validateName(ref: Field.Ref<Name>) {
  validateRequired(ref.$.first);
  validateRequired(ref.$.last);
}

//#endregion
