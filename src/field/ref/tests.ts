import { describe, expect, it } from "vitest";
import { FieldRef, MaybeFieldRef } from "./index.ts";
import { Field } from "../index.tsx";

describe(FieldRef, () => {
  describe("tree", () => {
    describe(FieldRef.prototype.maybe, () => {
      it("returns MaybeFieldRef instance", () => {
        const field = new Field<string | number | undefined>(undefined);
        const fieldRef = new FieldRef(field);
        const maybeFieldRef = fieldRef.maybe();
        maybeFieldRef satisfies MaybeFieldRef<string | number | undefined>;
        // @ts-expect-error: It should not be any
        maybeFieldRef satisfies MaybeFieldRef<BigInt>;
        expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
        expect(maybeFieldRef.get()).toBeUndefined();
      });
    });
  });
});

describe(MaybeFieldRef, () => {
  describe("tree", () => {
    describe(MaybeFieldRef.prototype.at, () => {
      describe("primitive", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new Field<string | number | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRef<string | number | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });
      });

      describe("object", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new Field<{ a: string } | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRef<{ a: string } | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows to access properties by key", () => {
          const field = new Field<{ a?: string } | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe().at("a");
          maybeFieldRef satisfies MaybeFieldRef<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows accessing maybe undefined properties", () => {
          const field = new Field<
            { a?: { b?: { c?: number | string } } } | undefined
          >(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe().at("a").at("b").at("c");
          maybeFieldRef satisfies MaybeFieldRef<number | string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("resolves proper field for deep nested properties", () => {
          const field = new Field<
            { a?: { b?: { c?: number | string } } } | undefined
          >({ a: { b: { c: 123 } } });
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe().at("a").at("b").at("c");
          maybeFieldRef satisfies MaybeFieldRef<number | string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBe(123);
        });
      });

      describe("array", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new Field<string[] | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRef<string[] | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows to access items by index", () => {
          const field = new Field<string[] | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe().at(0);
          maybeFieldRef satisfies MaybeFieldRef<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("allows accessing maybe undefined items", () => {
          const field = new Field<string[][][] | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe().at(0).at(0).at(0);
          maybeFieldRef satisfies MaybeFieldRef<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it("resolves proper field for deep nested items", () => {
          const field = new Field<string[][][] | undefined>([[["a"]]]);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe().at(0).at(0).at(0);
          maybeFieldRef satisfies MaybeFieldRef<string | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBe("a");
        });
      });

      describe("instance", () => {
        it("returns the undefined field as is if it's defined", () => {
          const field = new Field<Set<string> | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          const maybeFieldRef = fieldRef.maybe();
          maybeFieldRef satisfies MaybeFieldRef<Set<string> | undefined>;
          // @ts-expect-error: It should not be any
          maybeFieldRef satisfies MaybeFieldRef<BigInt>;
          expect(maybeFieldRef instanceof MaybeFieldRef).toBe(true);
          expect(maybeFieldRef.get()).toBeUndefined();
        });

        it.todo("does not allow to access items by key", () => {
          const field = new Field<Set<string> | undefined>(undefined);
          const fieldRef = new FieldRef(field);
          // [TODO]
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

  describe(MaybeFieldRef.prototype.addError, () => {
    it("adds errors to present fields", () => {
      const field = new Field<string | number | undefined>("hello");
      const fieldRef = new FieldRef(field);
      const maybeFieldRef = fieldRef.maybe();
      maybeFieldRef.addError("Something went wrong");
      expect(field.errors).toEqual([{ message: "Something went wrong" }]);
    });

    it("adds errors to undefined fields", () => {
      const field = new Field<{ hello?: string }>({});
      const fieldRef = new FieldRef(field);
      const maybeFieldRef = fieldRef.maybe().at("hello");
      maybeFieldRef.addError("Something went wrong");
      expect(field.$.hello.errors).toEqual([
        { message: "Something went wrong" },
      ]);
    });

    it("adds errors to shadow fields", () => {
      const field = new Field<{ hello?: { world?: string } }>({});
      const fieldRef = new FieldRef(field);
      const maybeFieldRef = fieldRef.maybe().at("hello").at("world");
      maybeFieldRef.addError("Something went wrong");
      expect(field.valid).toBe(false);
      const pavedField = field.$.hello.pave({}).$.world;
      expect(pavedField.errors).toEqual([{ message: "Something went wrong" }]);
    });

    it("allows to clear shadow fields errors", () => {
      const field = new Field<{ hello?: { world?: string } }>({});
      const fieldRef = new FieldRef(field);
      const maybeFieldRef = fieldRef.maybe().at("hello").at("world");
      maybeFieldRef.addError("Something went wrong");
      expect(field.valid).toBe(false);
      const pavedField = field.$.hello.pave({}).$.world;
      expect(pavedField.errors).toEqual([{ message: "Something went wrong" }]);
      field.clearErrors();
      expect(pavedField.errors).toEqual([]);
    });
  });
});
