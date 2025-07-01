import { assert, describe, expect, it } from "vitest";
import { Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";
import { fieldDiscriminate } from "./index.ts";

describe(fieldDiscriminate, () => {
  interface Cat {
    type: "cat";
    meow: true;
  }

  interface Dog {
    type: "dog";
    bark: true;
  }

  describe(Field, () => {
    it("allows to discriminate by field", () => {
      const field = new Field<Cat | Dog>({ type: "cat", meow: true });
      const discriminated = fieldDiscriminate(field, "type");
      if (discriminated.discriminator === "cat") {
        expect(discriminated.field.get().meow).toBe(true);
        return;
      }
      assert(false, "Should not reach here");
    });

    it("handles undefineds", () => {
      const field = new Field<Cat | Dog | undefined>(undefined);
      const discriminated = fieldDiscriminate(field, "type");
      if (!discriminated.discriminator) {
        expect(discriminated.field.get()).toBe(undefined);
        return;
      }
      assert(false, "Should not reach here");
    });
  });

  describe(FieldRef, () => {
    it("allows to discriminate by field", () => {
      const field = new Field<Cat | Dog>({ type: "cat", meow: true });
      const ref = new FieldRef(field);
      const discriminated = fieldDiscriminate(ref, "type");
      if (discriminated.discriminator === "cat") {
        expect(discriminated.field).toBeInstanceOf(FieldRef);
        expect(discriminated.field.get().meow).toBe(true);
        return;
      }
      assert(false, "Should not reach here");
    });

    it("handles undefineds", () => {
      const field = new Field<Cat | Dog | undefined>(undefined);
      const ref = new FieldRef(field);
      const discriminated = fieldDiscriminate(ref, "type");
      if (!discriminated.discriminator) {
        expect(discriminated.field.get()).toBe(undefined);
        return;
      }
      assert(false, "Should not reach here");
    });
  });

  describe(MaybeFieldRef, () => {
    it("allows to discriminate by field", () => {
      const field = new Field<Cat | Dog>({ type: "cat", meow: true });
      const ref = new MaybeFieldRef({ type: "direct", field });
      const discriminated = fieldDiscriminate(ref, "type");
      if (discriminated.discriminator === "cat") {
        expect(discriminated.field).toBeInstanceOf(MaybeFieldRef);
        expect(discriminated.field.get().meow).toBe(true);
        return;
      }
      assert(false, "Should not reach here");
    });

    it("handles undefineds", () => {
      const field = new Field<Cat | Dog | undefined>(undefined);
      const ref = new MaybeFieldRef({ type: "direct", field });
      const discriminated = fieldDiscriminate(ref, "type");
      if (!discriminated.discriminator) {
        expect(discriminated.field.get()).toBe(undefined);
        return;
      }
      assert(false, "Should not reach here");
    });
  });
});
