import React, { useRef } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import "@vitest/browser/matchers.d.ts";
import { Form } from "./index.tsx";
import { userEvent } from "@vitest/browser/context";

describe("Form", () => {
  it("allows to handle submit", async () => {
    const spy = vi.fn();
    let resolveSubmit: ((value: unknown) => void) | undefined;
    const submitPromise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });

    function Component() {
      const count = useRenderCount();
      const form = Form.use({ hello: "world" });

      return (
        <div>
          <div data-testid="render-submit">{count}</div>

          <button onClick={() => form.$.hello.set("Sasha")}>
            Update state
          </button>

          <form
            {...form.control((values) => {
              spy(values);
              return submitPromise;
            })}
          >
            <div data-testid="submitting">{String(form.submitting)}</div>

            <button type="submit">Submit</button>
          </form>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect
      .element(screen.getByTestId("submitting"))
      .toHaveTextContent("false");

    await screen.getByText("Update state").click();

    await expect
      .element(screen.getByTestId("render-submit"))
      .toHaveTextContent("1");

    expect(spy).not.toBeCalled();

    await screen.getByText("Submit").click();

    expect(spy).toBeCalledWith({
      hello: "Sasha",
    });

    await expect
      .element(screen.getByTestId("submitting"))
      .toHaveTextContent("true");

    await expect
      .element(screen.getByTestId("render-submit"))
      .toHaveTextContent("2");

    resolveSubmit?.(void 0);

    await expect
      .element(screen.getByTestId("submitting"))
      .toHaveTextContent("false");

    await expect
      .element(screen.getByTestId("render-submit"))
      .toHaveTextContent("3");
  });

  it("allows to use Form component", async () => {
    const spy = vi.fn();
    let resolveSubmit: ((value: unknown) => void) | undefined;
    const submitPromise = new Promise((resolve) => {
      resolveSubmit = resolve;
    });

    function Component() {
      const count = useRenderCount();
      const form = Form.use({ hello: "world" });

      return (
        <div>
          <div data-testid="render-submit">{count}</div>

          <button onClick={() => form.$.hello.set("Sasha")}>
            Update state
          </button>

          <form.Control
            onSubmit={(values) => {
              spy(values);
              return submitPromise;
            }}
          >
            <div data-testid="submitting">{String(form.submitting)}</div>

            <input {...form.$.hello.input()} data-testid="hello-input" />

            <button type="submit">Submit</button>
          </form.Control>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect
      .element(screen.getByTestId("submitting"))
      .toHaveTextContent("false");

    await userEvent.fill(screen.getByTestId("hello-input"), "Sasha");

    await expect
      .element(screen.getByTestId("render-submit"))
      .toHaveTextContent("1");

    expect(spy).not.toBeCalled();

    await screen.getByText("Submit").click();

    expect(spy).toBeCalledWith({
      hello: "Sasha",
    });

    await expect
      .element(screen.getByTestId("submitting"))
      .toHaveTextContent("true");

    await expect
      .element(screen.getByTestId("render-submit"))
      .toHaveTextContent("2");

    resolveSubmit?.(void 0);

    await expect
      .element(screen.getByTestId("submitting"))
      .toHaveTextContent("false");

    await expect
      .element(screen.getByTestId("render-submit"))
      .toHaveTextContent("3");
  });
});

function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}
