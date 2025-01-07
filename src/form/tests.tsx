import React, { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import { userEvent } from "@vitest/browser/context";
import "@vitest/browser/matchers.d.ts";
import { FieldRef } from "../field/ref/index.ts";
import { Form } from "./index.tsx";

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
            Update field
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

    await screen.getByText("Update field").click();

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
            Update field
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

  it("assigns form id", async () => {
    let formId: string | undefined;

    function Component() {
      const form = Form.use({ hello: "world" });
      formId = form.id;
      return <form.Control data-testid="form" onSubmit={() => {}} />;
    }

    const screen = render(<Component />);

    expect(formId).toBeTypeOf("string");

    await expect
      .element(screen.getByTestId("form"))
      .toHaveAttribute("id", formId);
  });

  it("validates form on submit", async () => {
    const spy = vi.fn();

    function Component() {
      const count = useRenderCount();
      const form = Form.use({ hello: "world" }, { validate: validateHello });

      return (
        <div>
          <div data-testid="render-validate">{count}</div>

          <button onClick={() => form.$.hello.set("Sasha")}>Set hello</button>

          <form.Control onSubmit={spy}>
            <form.$.hello.Control
              error
              render={(control, { error }) => {
                return (
                  <div>
                    <input
                      {...control}
                      onChange={(e) => {
                        control.onChange(e.target.value);
                      }}
                      data-testid="hello-input"
                    />

                    {error && <div data-testid="error">{error.message}</div>}
                  </div>
                );
              }}
            />

            <button type="submit">Submit</button>
          </form.Control>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect.element(screen.getByTestId("error")).not.toBeInTheDocument();

    await userEvent.fill(screen.getByTestId("hello-input"), "");

    await expect
      .element(screen.getByTestId("render-validate"))
      .toHaveTextContent("1");

    await screen.getByText("Submit").click();

    expect(spy).not.toBeCalled();

    await expect
      .element(screen.getByTestId("error"))
      .toHaveTextContent("Hello is required");

    await expect
      .element(screen.getByTestId("render-validate"))
      .toHaveTextContent("2");

    await screen.getByText("Set hello").click();

    await expect
      .element(screen.getByTestId("render-validate"))
      .toHaveTextContent("2");

    await screen.getByText("Submit").click();

    await expect.element(screen.getByTestId("error")).not.toBeInTheDocument();

    expect(spy).toBeCalledWith({ hello: "Sasha" });

    await expect
      .element(screen.getByTestId("render-validate"))
      .toHaveTextContent("4");
  });

  it("revalidates form on fields blur", async () => {
    const spy = vi.fn();

    function Component() {
      const count = useRenderCount();
      const form = Form.use({ hello: "world" }, { validate: validateHello });

      return (
        <div>
          <div data-testid="render-validate">{count}</div>

          <form.Control onSubmit={spy}>
            <form.$.hello.Control
              error
              render={(control, { error }) => {
                return (
                  <div>
                    <input
                      {...control}
                      onChange={(e) => {
                        control.onChange(e.target.value);
                      }}
                      data-testid="hello-input"
                    />

                    {error && <div data-testid="error">{error.message}</div>}
                  </div>
                );
              }}
            />

            <button type="submit">Submit</button>
          </form.Control>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect.element(screen.getByTestId("error")).not.toBeInTheDocument();

    await userEvent.fill(screen.getByTestId("hello-input"), "");
    (screen.getByTestId("hello-input").element() as HTMLInputElement).blur();

    await screen.getByText("Submit").click();

    expect(spy).not.toBeCalled();

    await expect
      .element(screen.getByTestId("error"))
      .toHaveTextContent("Hello is required");

    await userEvent.fill(screen.getByTestId("hello-input"), "Sasha");
    (screen.getByTestId("hello-input").element() as HTMLInputElement).blur();

    await expect.element(screen.getByTestId("error")).not.toBeInTheDocument();
  });
});

function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}

interface Hello {
  hello: string;
}

function validateHello(ref: FieldRef<Hello>) {
  if (!ref.$.hello.get().trim()) ref.$.hello.setError("Hello is required");
}
