import { act, cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, assert, describe, expect, it, vi } from "vitest";
import { Field } from "../index.tsx";
import { fieldDecompose, useFieldDecompose } from "./index.ts";

describe(fieldDecompose, () => {
  it("allows to decompose the field type", () => {
    const field = new Field<string | number | Record<string, number>>(
      "Hello, world!",
    );
    const decomposed = fieldDecompose(field);
    if (typeof decomposed.value === "string") {
      expect(decomposed.field.get()).toBe("Hello, world!");
      return;
    }
    assert(false, "Should not reach here");
  });
});

describe(useFieldDecompose, () => {
  afterEach(cleanup);

  it("decomposes and updates on field change", async () => {
    type Payload = { data: string } | { data: number };

    const field = new Field<Payload>({ data: "hello" });
    const callback = vi.fn(
      (newValue, prevValue) => typeof newValue.data !== typeof prevValue.data,
    );

    function TestComponent() {
      const decomposed = useFieldDecompose(field, callback, [field]);
      return <div data-testid="data">{String(decomposed.value.data)}</div>;
    }

    render(<TestComponent />);
    expect(screen.getByTestId("data").textContent).toBe("hello");
    expect(callback).not.toHaveBeenCalled();

    await act(() => field.set({ data: 42 }));

    expect(screen.getByTestId("data").textContent).toBe("42");
    expect(callback).toHaveBeenCalledWith({ data: 42 }, { data: "hello" });
  });
});
