import React, { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import { userEvent } from "@vitest/browser/context";
import "@vitest/browser/matchers.d.ts";
import { Field } from "../field/index.tsx";
import { FieldRef } from "../field/ref/index.ts";
import { Form } from "./index.tsx";

describe("Form", () => {
  describe("control", () => {
    describe("control", () => {
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
                {...form.control({
                  onSubmit: (values, event) => {
                    spy(values, event);
                    return submitPromise;
                  },
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

        expect(spy).toBeCalledWith(
          { hello: "Sasha" },
          expect.objectContaining({ target: expect.any(Object) }),
        );

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

      it("commits form after submit", async () => {
        let resolveSubmit: ((value: unknown) => void) | undefined;
        const submitPromise = new Promise((resolve) => {
          resolveSubmit = resolve;
        });

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" });
          const dirty = form.useDirty();

          return (
            <div>
              <div data-testid="render-submit">{count}</div>

              <button onClick={() => form.$.hello.set("Sasha")}>
                Update field
              </button>

              <form
                {...form.control({
                  onSubmit: () => submitPromise,
                })}
              >
                <div data-testid="submitting">{String(form.submitting)}</div>

                <div data-testid="dirty">{String(dirty)}</div>

                <button type="submit">Submit</button>
              </form>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("submitting"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("1");

        await screen.getByText("Update field").click();

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("2");

        await screen.getByText("Submit").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("submitting"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("3");

        resolveSubmit?.(void 0);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("submitting"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("4");
      });

      it("it allows to cancel commit", async () => {
        let resolveSubmit: ((value: unknown) => void) | undefined;
        const submitPromise = new Promise((resolve) => {
          resolveSubmit = resolve;
        });

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" });
          const dirty = form.useDirty();

          return (
            <div>
              <div data-testid="render-submit">{count}</div>

              <button onClick={() => form.$.hello.set("Sasha")}>
                Update field
              </button>

              <form
                {...form.control({
                  onSubmit: () => submitPromise,
                })}
              >
                <div data-testid="submitting">{String(form.submitting)}</div>

                <div data-testid="dirty">{String(dirty)}</div>

                <button type="submit">Submit</button>
              </form>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("submitting"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("1");

        await screen.getByText("Update field").click();

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("2");

        await screen.getByText("Submit").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("submitting"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("3");

        resolveSubmit?.(false);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("submitting"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-submit"))
          .toHaveTextContent("4");
      });

      it("allows to specify that it is a server form", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" });

          return (
            <div>
              <div data-testid="render-submit">{count}</div>

              <form
                {...form.control({
                  onSubmit: spy,
                  server: true,
                })}
              >
                <button type="submit">Submit</button>
              </form>
            </div>
          );
        }

        const screen = render(<Component />);

        await screen.getByText("Submit").click();

        expect(spy).toBeCalledWith({ hello: "world" });
      });

      it("handles reset", async () => {
        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" });
          const hello = form.$.hello.useGet();

          return (
            <div>
              <div data-testid="render-reset">{count}</div>

              <div data-testid="hello">Hello, {hello}!</div>

              <button onClick={() => form.$.hello.set("Sasha")}>
                Update field
              </button>

              <form {...form.control()}>
                <button type="reset">Reset</button>
              </form>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("hello"))
          .toHaveTextContent("Hello, world!");

        await screen.getByText("Update field").click();

        await expect
          .element(screen.getByTestId("hello"))
          .toHaveTextContent("Hello, Sasha!");

        await expect
          .element(screen.getByTestId("render-reset"))
          .toHaveTextContent("2");

        await screen.getByText("Reset").click();

        await expect
          .element(screen.getByTestId("hello"))
          .toHaveTextContent("Hello, world!");

        await expect
          .element(screen.getByTestId("render-reset"))
          .toHaveTextContent("3");
      });

      it("allows to handle onReset", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" });
          const hello = form.$.hello.useGet();

          return (
            <div>
              <div data-testid="render-reset">{count}</div>

              <div data-testid="hello">Hello, {hello}!</div>

              <button onClick={() => form.$.hello.set("Sasha")}>
                Update field
              </button>

              <form {...form.control({ onReset: spy })}>
                <button type="reset">Reset</button>
              </form>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("hello"))
          .toHaveTextContent("Hello, world!");

        await screen.getByText("Update field").click();

        await expect
          .element(screen.getByTestId("hello"))
          .toHaveTextContent("Hello, Sasha!");

        await expect
          .element(screen.getByTestId("render-reset"))
          .toHaveTextContent("2");

        expect(spy).not.toBeCalled();

        await screen.getByText("Reset").click();

        expect(spy).toBeCalledWith(
          expect.objectContaining({ target: expect.any(Object) }),
        );

        await expect
          .element(screen.getByTestId("render-reset"))
          .toHaveTextContent("2");
      });
    });

    describe("Control", () => {
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

              <Form.Component
                form={form}
                onSubmit={(values) => {
                  spy(values);
                  return submitPromise;
                }}
              >
                <div data-testid="submitting">{String(form.submitting)}</div>

                <input {...form.$.hello.control()} data-testid="hello-input" />

                <button type="submit">Submit</button>
              </Form.Component>
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
          return (
            <Form.Component
              form={form}
              data-testid="form"
              onSubmit={() => {}}
            />
          );
        }

        const screen = render(<Component />);

        expect(formId).toBeTypeOf("string");

        await expect
          .element(screen.getByTestId("form"))
          .toHaveAttribute("id", formId);
      });
    });
  });

  describe("validation", () => {
    it("validates form on submit", async () => {
      const spy = vi.fn();

      function Component() {
        const count = useRenderCount();
        const form = Form.use({ hello: "world" }, { validate: validateHello });

        return (
          <div>
            <div data-testid="render-validate">{count}</div>

            <button onClick={() => form.$.hello.set("Sasha")}>Set hello</button>

            <Form.Component form={form} onSubmit={spy}>
              <Field.Component
                field={form.$.hello}
                errors
                render={(control, { errors }) => {
                  return (
                    <div>
                      <input
                        {...control}
                        onChange={(e) => {
                          control.onChange(e.target.value);
                        }}
                        data-testid="hello-input"
                      />

                      <div data-testid="errors">{joinErrors(errors)}</div>
                    </div>
                  );
                }}
              />

              <button type="submit">Submit</button>
            </Form.Component>
          </div>
        );
      }

      const screen = render(<Component />);

      await expect.element(screen.getByTestId("errors")).toBeEmptyDOMElement();

      await userEvent.fill(screen.getByTestId("hello-input"), "");

      await expect
        .element(screen.getByTestId("render-validate"))
        .toHaveTextContent("1");

      await screen.getByText("Submit").click();

      expect(spy).not.toBeCalled();

      await expect
        .element(screen.getByTestId("errors"))
        .toHaveTextContent("Hello is required");

      await expect
        .element(screen.getByTestId("render-validate"))
        .toHaveTextContent("2");

      await screen.getByText("Set hello").click();

      await expect
        .element(screen.getByTestId("render-validate"))
        .toHaveTextContent("2");

      await screen.getByText("Submit").click();

      await expect.element(screen.getByTestId("errors")).toBeEmptyDOMElement();

      expect(spy).toBeCalledWith(
        { hello: "Sasha" },
        expect.objectContaining({ target: expect.any(Object) }),
      );

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

            <Form.Component form={form} onSubmit={spy}>
              <Field.Component
                field={form.$.hello}
                errors
                render={(control, { errors }) => {
                  return (
                    <div>
                      <input
                        {...control}
                        onChange={(e) => control.onChange(e.target.value)}
                        data-testid="hello-input"
                      />

                      <div data-testid="errors">{joinErrors(errors)}</div>
                    </div>
                  );
                }}
              />

              <button type="submit">Submit</button>
            </Form.Component>
          </div>
        );
      }

      const screen = render(<Component />);

      await expect.element(screen.getByTestId("errors")).toBeEmptyDOMElement();

      await userEvent.fill(screen.getByTestId("hello-input"), "");
      (screen.getByTestId("hello-input").element() as HTMLInputElement).blur();

      await screen.getByText("Submit").click();

      expect(spy).not.toBeCalled();

      await expect
        .element(screen.getByTestId("errors"))
        .toHaveTextContent("Hello is required");

      await userEvent.fill(screen.getByTestId("hello-input"), "Sasha");
      (screen.getByTestId("hello-input").element() as HTMLInputElement).blur();

      await expect.element(screen.getByTestId("errors")).toBeEmptyDOMElement();
    });
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
  if (!ref.$.hello.get().trim()) ref.$.hello.addError("Hello is required");
}

function joinErrors(errors: Field.Error[] | undefined) {
  if (!errors) return "";
  return errors.map((error) => error.message).join(", ");
}

function postpone() {
  return new Promise<void>((resolve) => setTimeout(resolve));
}
