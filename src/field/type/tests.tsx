import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, assert, describe, expect, it } from "vitest";
import { FieldOld } from "../old.tsx";
import { MaybeFieldRefOld, FieldRefOld } from "../ref/definition.ts";
import { fieldDiscriminate, useFieldDiscriminate } from "./index.ts";

describe(fieldDiscriminate, () => {
  describe(FieldOld, () => {
    it("allows to discriminate by field", () => {
      const field = new FieldOld<Cat | Dog>({ type: "cat", meow: true });
      const discriminated = fieldDiscriminate(field, "type");
      if (discriminated.discriminator === "cat") {
        expect(discriminated.field.get().meow).toBe(true);
        return;
      }
      assert(false, "Should not reach here");
    });

    it("handles undefineds", () => {
      const field = new FieldOld<Cat | Dog | undefined>(undefined);
      const discriminated = fieldDiscriminate(field, "type");
      if (!discriminated.discriminator) {
        expect(discriminated.field.get()).toBe(undefined);
        return;
      }
      assert(false, "Should not reach here");
    });
  });

  describe(FieldRefOld, () => {
    it("allows to discriminate by field", () => {
      const field = new FieldOld<Cat | Dog>({ type: "cat", meow: true });
      const ref = new FieldRefOld(field);
      const discriminated = fieldDiscriminate(ref, "type");
      if (discriminated.discriminator === "cat") {
        expect(discriminated.field).toBeInstanceOf(FieldRefOld);
        expect(discriminated.field.get().meow).toBe(true);
        return;
      }
      assert(false, "Should not reach here");
    });

    it("handles undefineds", () => {
      const field = new FieldOld<Cat | Dog | undefined>(undefined);
      const ref = new FieldRefOld(field);
      const discriminated = fieldDiscriminate(ref, "type");
      if (!discriminated.discriminator) {
        expect(discriminated.field.get()).toBe(undefined);
        return;
      }
      assert(false, "Should not reach here");
    });
  });

  describe(MaybeFieldRefOld, () => {
    it("allows to discriminate by field", () => {
      const field = new FieldOld<Cat | Dog>({ type: "cat", meow: true });
      const ref = new MaybeFieldRefOld({ type: "direct", field });
      const discriminated = fieldDiscriminate(ref, "type");
      if (discriminated.discriminator === "cat") {
        expect(discriminated.field).toBeInstanceOf(MaybeFieldRefOld);
        expect(discriminated.field.get().meow).toBe(true);
        return;
      }
      assert(false, "Should not reach here");
    });

    it("handles undefineds", () => {
      const field = new FieldOld<Cat | Dog | undefined>(undefined);
      const ref = new MaybeFieldRefOld({ type: "direct", field });
      const discriminated = fieldDiscriminate(ref, "type");
      if (!discriminated.discriminator) {
        expect(discriminated.field.get()).toBe(undefined);
        return;
      }
      assert(false, "Should not reach here");
    });
  });
});

describe(useFieldDiscriminate, () => {
  afterEach(cleanup);

  it("discriminates and updates on field change", async () => {
    const field = new FieldOld<Cat | Dog>({ type: "cat", meow: true });

    function TestComponent() {
      const discriminated = useFieldDiscriminate(field, "type");
      return (
        <div data-testid="type">
          {discriminated.discriminator}:{" "}
          {discriminated.discriminator === "cat"
            ? String(discriminated.field.get().meow)
            : discriminated.discriminator === "dog"
              ? String(discriminated.field.get().bark)
              : ""}
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("type").textContent).toBe("cat: true");

    await act(() => field.set({ type: "dog", bark: false }));

    expect(screen.getByTestId("type").textContent).toBe("dog: false");
  });

  it("handles undefineds", async () => {
    const field = new FieldOld<Cat | Dog | undefined>(undefined);

    function TestComponent() {
      const discriminated = useFieldDiscriminate(field, "type");
      return (
        <div data-testid="type">
          {String(discriminated.discriminator)}:{" "}
          {String(discriminated.field.get()?.type)}
        </div>
      );
    }

    render(<TestComponent />);
    expect(screen.getByTestId("type").textContent).toBe("undefined: undefined");

    await act(() => field.set({ type: "cat", meow: true }));

    expect(screen.getByTestId("type").textContent).toBe("cat: cat");
  });
});

interface Cat {
  type: "cat";
  meow: boolean;
}

interface Dog {
  type: "dog";
  bark: boolean;
}
