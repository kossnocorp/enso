// @ts-nocheck

import { describe, expect, it, vi } from "vitest";
import { change } from "../../change/index.ts";
import { Field } from "../index.js";
import { FieldOld } from "../definition.tsx";
import {
  FieldRef,
  FieldRefOld,
  MaybeFieldRef,
  MaybeFieldRefOld,
} from "./definition.ts";
import { postpone } from "../../../tests/utils.ts";

describe.skip(FieldRef, () => {
  describe("type", () => {
    describe("collection", () => {
      // WIP:
      describe("FieldRef.prototype.forEach", () => {
        describe(Array, () => {
          it("iterates items", () => {
            const field = new Field([1, 2, 3]);
            const ref = new FieldRef(field);
            const mapped: [number, number][] = [];
            ref.forEach((item, index) => {
              mapped.push([index, item.get() * 2]);
              expect(item).toBeInstanceOf(FieldRef);
            });
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
            const ref = new FieldRef(field);
            const mapped: [string, number][] = [];
            ref.forEach((item, key) => {
              mapped.push([key, item.get()]);
              expect(item).toBeInstanceOf(FieldRefOld);
            });
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
});

describe.skip(MaybeFieldRef, () => {
  describe("type", () => {
    describe("collection", () => {
      // WIP:
      describe("MaybeFieldRef.prototype.forEach", () => {
        describe(Array, () => {
          it("iterates items", () => {
            const field = new Field([1, 2, 3]);
            const ref = new MaybeFieldRef({ type: "direct", field });
            const mapped: [number, number][] = [];
            ref.forEach((item, index) => {
              mapped.push([index, item.get() * 2]);
              expect(item).toBeInstanceOf(MaybeFieldRef);
            });
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
            const ref = new MaybeFieldRef({ type: "direct", field });
            const mapped: [string, number][] = [];
            ref.forEach((item, key) => {
              mapped.push([key, item.get()]);
              expect(item).toBeInstanceOf(MaybeFieldRef);
            });
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
});

describe.skip(FieldRefOld, () => {
  describe("tree", () => {
    describe(FieldRefOld.prototype.maybe, () => {
      it("returns MaybeFieldRef instance", () => {
        const field = new FieldOld<string | number | undefined>(undefined);
        const fieldRef = new FieldRefOld(field);
        const maybeFieldRef = fieldRef.maybe();
        maybeFieldRef satisfies MaybeFieldRefOld<string | number | undefined>;
        // @ts-expect-error: It should not be any
        maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
        expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
        expect(maybeFieldRef.get()).toBeUndefined();
      });
    });
  });
});

describe.skip(MaybeFieldRefOld, () => {
  describe("tree", () => {
    describe(MaybeFieldRefOld.prototype.at, () => {
      describe("primitive", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new FieldOld<string | number | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRefOld<string | number | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });
      });

      describe("object", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new FieldOld<{ a: string } | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRefOld<{ a: string } | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows to access properties by key", () => {
          const field = new FieldOld<{ a?: string } | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe().at("a");
          maybeFieldRef satisfies MaybeFieldRefOld<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows accessing maybe undefined properties", () => {
          const field = new FieldOld<
            { a?: { b?: { c?: number | string } } } | undefined
          >(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe().at("a").at("b").at("c");
          maybeFieldRef satisfies MaybeFieldRefOld<number | string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("resolves proper field for deep nested properties", () => {
          const field = new FieldOld<
            { a?: { b?: { c?: number | string } } } | undefined
          >({ a: { b: { c: 123 } } });
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe().at("a").at("b").at("c");
          maybeFieldRef satisfies MaybeFieldRefOld<number | string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBe(123);
        });
      });

      describe("array", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new FieldOld<string[] | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRefOld<string[] | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows to access items by index", () => {
          const field = new FieldOld<string[] | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe().at(0);
          maybeFieldRef satisfies MaybeFieldRefOld<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows accessing maybe undefined items", () => {
          const field = new FieldOld<string[][][] | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe().at(0).at(0).at(0);
          maybeFieldRef satisfies MaybeFieldRefOld<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("resolves proper field for deep nested items", () => {
          const field = new FieldOld<string[][][] | undefined>([[["a"]]]);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe().at(0).at(0).at(0);
          maybeFieldRef satisfies MaybeFieldRefOld<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBe("a");
        });
      });

      describe("instance", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new FieldOld<Set<string> | undefined>(undefined);
          const fieldRef = new FieldRefOld(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRefOld<Set<string> | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRefOld<bigint>;
          expect(maybeFieldRef instanceof MaybeFieldRefOld).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it.todo("does not allow to access items by key", () => {
          const field = new FieldOld<Set<string> | undefined>(undefined);
          const _fieldRef = new FieldRefOld(field);
          // TODO:
          // const maybeFieldRef = fieldRef
          //   .maybe(new Set<string>())
          //   // @ts-expect-error: It should not be available
          //   .maybe("has", (val: string) => false);
          // maybeFieldRef satisfies never;
          // expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          // expect(() => maybeFieldRef.at("a")).toThrowError(
          //   "Cannot access items of a Set by key"
          // );
        });
      });
    });
  });

  describe(MaybeFieldRefOld.prototype.addError, () => {
    it("adds errors to present fields", () => {
      const field = new FieldOld<string | number | undefined>("hello");
      const fieldRef = new FieldRefOld(field);
      const maybeFieldRef = fieldRef.maybe();
      maybeFieldRef.addError("Something went wrong");
      expect(field.errors).toEqual([{ message: "Something went wrong" }]);
    });

    it("adds errors to undefined fields", () => {
      const field = new FieldOld<{ hello?: string }>({});
      const fieldRef = new FieldRefOld(field);
      const maybeFieldRef = fieldRef.maybe().at("hello");
      maybeFieldRef.addError("Something went wrong");
      expect(field.$.hello.errors).toEqual([
        { message: "Something went wrong" },
      ]);
    });

    it("adds errors to shadow fields", () => {
      const field = new FieldOld<{ hello?: { world?: string } }>({});
      const fieldRef = new FieldRefOld(field);
      const maybeFieldRef = fieldRef.maybe().at("hello").at("world");
      maybeFieldRef.addError("Something went wrong");
      expect(field.valid).toBe(false);
      const pavedField = field.$.hello.pave({}).$.world;
      expect(pavedField.errors).toEqual([{ message: "Something went wrong" }]);
    });

    it("allows to clear shadow fields errors", () => {
      const field = new FieldOld<{ hello?: { world?: string } }>({});
      const fieldRef = new FieldRefOld(field);
      const maybeFieldRef = fieldRef.maybe().at("hello").at("world");
      maybeFieldRef.addError("Something went wrong");
      expect(field.valid).toBe(false);
      const pavedField = field.$.hello.pave({}).$.world;
      expect(pavedField.errors).toEqual([{ message: "Something went wrong" }]);
      field.clearErrors();
      expect(pavedField.errors).toEqual([]);
    });

    describe("changes", () => {
      it("causes target field trigger", async () => {
        const field = new FieldOld<string | number | undefined>("hello");
        const fieldRef = new FieldRefOld(field);
        const maybeFieldRef = fieldRef.maybe();
        const spy = vi.fn();
        field.watch(spy);
        maybeFieldRef.addError("Something went wrong");
        await postpone();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toReceiveChanges(
          change.field.errors | change.field.invalid,
        );
      });

      it("trigger event on the closest target", async () => {
        const field = new FieldOld<{ name?: { first?: string } }>({});
        const fieldRef = new FieldRefOld(field);
        const maybeFieldRef = fieldRef.maybe().at("name").at("first");
        const spy = vi.fn();
        field.$.name.watch(spy);
        maybeFieldRef.addError("Something went wrong");
        await postpone();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toReceiveChanges(
          change.child.errors | change.child.invalid,
        );
      });
    });
  });
});
