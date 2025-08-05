import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { nanoid } from "nanoid";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRenderCount } from "../../tests/utils.ts";
import { FieldImpl } from "../field/implementation.ts";
import { Field } from "../field/index.js";
import { Form } from "./index.js";

describe("Form", () => {
  it("creates a form instance", () => {
    const form = new Form(42);
    expect(form.value).toBe(42);
  });

  describe("attributes", () => {
    it("accepts id", () => {
      const id = nanoid();
      const form = new Form(42, { id });
      expect(form.id).toBe(id);
    });

    it("returns the internal field", () => {
      const form = new Form(42);
      const { field } = form;
      expect(field.value).toBe(42);
      expect(field).toBeInstanceOf(Field);
    });
  });

  describe("value", () => {
    it("delegates set", () => {
      const spy = vi.spyOn(FieldImpl.prototype, "set");
      const form = new Form(42);
      expect(form.set(24)).toBe(form.field);
      expect(spy).toHaveBeenCalledWith(24);
    });

    it("delegates initial", () => {
      const spy = vi
        .spyOn(FieldImpl.prototype, "initial", "get")
        .mockReturnValue(123);
      const form = new Form(42);
      expect(form.initial).toBe(123);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates dirty", () => {
      const spy = vi
        .spyOn(FieldImpl.prototype, "dirty", "get")
        .mockReturnValue(true);
      const form = new Form(42);
      expect(form.dirty).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates useDirty", () => {
      const spy = vi
        .spyOn(FieldImpl.prototype, "useDirty")
        .mockReturnValue(false);
      const form = new Form(42);
      expect(form.useDirty()).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates commit", () => {
      const spy = vi.spyOn(FieldImpl.prototype, "commit").mockReturnValue();
      const form = new Form(42);
      expect(form.commit()).toBe(undefined);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates reset", () => {
      const spy = vi.spyOn(FieldImpl.prototype, "reset").mockReturnValue();
      const form = new Form(42);
      expect(form.reset()).toBe(undefined);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("tree", () => {
    it("delegates $", () => {
      const spy = vi
        .spyOn(FieldImpl.prototype, "$", "get")
        .mockReturnValue("Ok" as any);
      const form = new Form(42);
      expect(form.$).toBe("Ok");
      expect(spy).toHaveBeenCalled();
    });

    it("delegates at", () => {
      const spy = vi
        .spyOn(FieldImpl.prototype, "at")
        .mockReturnValue("Ok" as any);
      const form = new Form<string[]>([]);
      expect(form.at(5)).toBe("Ok");
      expect(spy).toHaveBeenCalledWith(5);
    });
  });

  describe("watch", () => {
    it("delegates watch", () => {
      const unwatch = () => {};
      const spy = vi
        .spyOn(FieldImpl.prototype, "watch")
        .mockReturnValue(unwatch);
      const form = new Form(42);
      const watchCb = () => {};
      expect(form.watch(watchCb)).toBe(unwatch);
      expect(spy).toHaveBeenCalledWith(watchCb);
    });

    it("delegates useWatch", () => {
      const spy = vi.spyOn(FieldImpl.prototype, "useWatch").mockReturnValue();
      const form = new Form(42);
      const watchCb = () => {};
      expect(form.useWatch(watchCb, [])).toBe(undefined);
      expect(spy).toHaveBeenCalledWith(watchCb);
    });
  });

  describe("map", () => {
    it("delegates useCompute", () => {
      const compute = {};
      const spy = vi
        .spyOn(FieldImpl.prototype, "useCompute")
        .mockReturnValue(compute as any);
      const form = new Form(42);
      const computeCb = () => {};
      expect(form.useCompute(computeCb as any, [1, 2, 3])).toBe(compute);
      expect(spy).toHaveBeenCalledWith(computeCb, [1, 2, 3]);
    });

    it("delegates into", () => {
      const into = {};
      const spy = vi
        .spyOn(FieldImpl.prototype, "into")
        .mockReturnValue(into as any);
      const form = new Form({ type: "hello", value: 42 });
      const intoCb = () => {};
      expect(form.into(intoCb)).toBe(into);
      expect(spy).toHaveBeenCalledWith(intoCb);
    });

    it("delegates useInto", () => {
      const into = {};
      const spy = vi
        .spyOn(FieldImpl.prototype, "useInto")
        .mockReturnValue(into as any);
      const form = new Form({ type: "hello", value: 42 });
      const intoCb = (() => {}) as any;
      expect(form.useInto(intoCb, [1, 2, 3])).toBe(into);
      expect(spy).toHaveBeenCalledWith(intoCb, [1, 2, 3]);
    });
  });

  describe("errors", () => {
    it("delegates valid", () => {
      const spy = vi
        .spyOn(FieldImpl.prototype, "valid", "get")
        .mockReturnValue(false);
      const form = new Form(42);
      expect(form.valid).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    beforeEach(cleanup);

    it("delegates validate", async () => {
      const validateSpy = vi
        .spyOn(FieldImpl.prototype, "validate")
        .mockReturnValue(Promise.resolve(void 0));
      const validSpy = vi
        .spyOn(FieldImpl.prototype, "valid", "get")
        .mockReturnValue(false);
      const validateCb = () => {};
      const form = new Form(42, { validate: validateCb });
      expect(await form.validate()).toBe(false);
      expect(validateSpy).toHaveBeenCalledWith(validateCb);
      expect(validSpy).toHaveBeenCalled();
    });

    it("clears errors even if the validate function is not provided", async () => {
      const form = new Form(42);
      form.field.addError("Nope");
      expect(await form.validate()).toBe(true);
      expect(form.field.errors).toHaveLength(0);
    });

    it("validates form on submit", async () => {
      const spy = vi.fn();

      function Component() {
        const count = useRenderCount();
        const form = Form.use<Hello>({ hello: "world" }, [], {
          validate: validateHello,
        });

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

      render(<Component />);

      expect(screen.getByTestId("errors").textContent).toBe("");

      await act(async () =>
        fireEvent.input(screen.getByTestId("hello-input"), {
          target: { value: "" },
        }),
      );

      expect(screen.getByTestId("render-validate").textContent).toBe("1");

      await act(async () => screen.getByText("Submit").click());

      expect(spy).not.toBeCalled();

      expect(screen.getByTestId("errors").textContent).toBe(
        "Hello is required",
      );

      expect(screen.getByTestId("render-validate").textContent).toBe("2");

      await act(async () => screen.getByText("Set hello").click());

      expect(screen.getByTestId("render-validate").textContent).toBe("2");

      await act(async () => screen.getByText("Submit").click());

      expect(screen.getByTestId("errors").textContent).toBe("");

      expect(spy).toBeCalledWith(
        { hello: "Sasha" },
        expect.objectContaining({ target: expect.any(Object) }),
      );

      expect(screen.getByTestId("render-validate").textContent).toBe("3");
    });

    it("revalidates form on fields blur", async () => {
      const spy = vi.fn();

      function Component() {
        const count = useRenderCount();
        const form = Form.use({ hello: "world" }, [], {
          validate: validateHello,
        });

        return (
          <div>
            <div data-testid="render-validate">{count}</div>

            <Form.Component form={form} onSubmit={spy}>
              <Field.Component
                field={form.$.hello}
                errors
                render={(control, { errors }) => (
                  <div>
                    <input
                      {...control}
                      onChange={(e) => control.onChange(e.target.value)}
                      data-testid="hello-input"
                    />

                    <div data-testid="errors">{joinErrors(errors)}</div>
                  </div>
                )}
              />

              <button type="submit">Submit</button>
            </Form.Component>
          </div>
        );
      }

      render(<Component />);

      expect(screen.getByTestId("errors").textContent).toBe("");

      await act(async () =>
        fireEvent.change(screen.getByTestId("hello-input"), {
          target: { value: "" },
        }),
      );

      await act(async () =>
        fireEvent.blur(screen.getByTestId("hello-input"), {}),
      );

      await act(async () => screen.getByText("Submit").click());

      expect(spy).not.toBeCalled();

      expect(screen.getByTestId("errors").textContent).toBe(
        "Hello is required",
      );

      await act(async () =>
        fireEvent.change(screen.getByTestId("hello-input"), {
          target: { value: "Sasha" },
        }),
      );

      await act(async () =>
        fireEvent.blur(screen.getByTestId("hello-input"), {}),
      );

      expect(screen.getByTestId("errors").textContent).toBe("");
    });
  });

  describe("intertop", () => {
    describe("#control", () => {
      beforeEach(cleanup);

      it("allows to handle submit", async () => {
        const spy = vi.fn();
        let resolveSubmit: ((value: unknown) => void) | undefined;
        const submitPromise = new Promise((resolve) => {
          resolveSubmit = resolve;
        });

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);

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

        render(<Component />);

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        await act(async () => screen.getByText("Update field").click());

        expect(screen.getByTestId("render-submit").textContent).toBe("1");

        expect(spy).not.toBeCalled();

        await act(async () => screen.getByText("Submit").click());

        expect(spy).toBeCalledWith(
          { hello: "Sasha" },
          expect.objectContaining({ target: expect.any(Object) }),
        );

        expect(screen.getByTestId("submitting").textContent).toBe("true");

        expect(screen.getByTestId("render-submit").textContent).toBe("2");

        await act(async () => resolveSubmit?.(void 0));

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        expect(screen.getByTestId("render-submit").textContent).toBe("3");
      });

      it("commits form after submit", async () => {
        let resolveSubmit: ((value: unknown) => void) | undefined;
        const submitPromise = new Promise((resolve) => {
          resolveSubmit = resolve;
        });

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);
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

        render(<Component />);

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        expect(screen.getByTestId("dirty").textContent).toBe("false");

        expect(screen.getByTestId("render-submit").textContent).toBe("1");

        await act(async () => screen.getByText("Update field").click());

        expect(screen.getByTestId("render-submit").textContent).toBe("2");

        await act(async () => screen.getByText("Submit").click());

        expect(screen.getByTestId("dirty").textContent).toBe("true");

        expect(screen.getByTestId("submitting").textContent).toBe("true");

        expect(screen.getByTestId("render-submit").textContent).toBe("3");

        await act(async () => resolveSubmit?.(void 0));

        expect(screen.getByTestId("dirty").textContent).toBe("false");

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        expect(screen.getByTestId("render-submit").textContent).toBe("4");
      });

      it("it allows to cancel commit", async () => {
        let resolveSubmit: ((value: unknown) => void) | undefined;
        const submitPromise = new Promise((resolve) => {
          resolveSubmit = resolve;
        });

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);
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

        render(<Component />);

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        expect(screen.getByTestId("dirty").textContent).toBe("false");

        expect(screen.getByTestId("render-submit").textContent).toBe("1");

        await act(async () => screen.getByText("Update field").click());

        expect(screen.getByTestId("render-submit").textContent).toBe("2");

        await act(async () => screen.getByText("Submit").click());

        expect(screen.getByTestId("dirty").textContent).toBe("true");

        expect(screen.getByTestId("submitting").textContent).toBe("true");

        expect(screen.getByTestId("render-submit").textContent).toBe("3");

        await act(async () => resolveSubmit?.(false));

        expect(screen.getByTestId("dirty").textContent).toBe("true");

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        expect(screen.getByTestId("render-submit").textContent).toBe("4");
      });

      it("allows to specify that it is a server form", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);

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

        render(<Component />);

        await act(async () => screen.getByText("Submit").click());

        expect(spy).toBeCalledWith({ hello: "world" });
      });

      it("handles reset", async () => {
        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);
          const hello = form.$.hello.useValue();

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

        render(<Component />);

        expect(screen.getByTestId("hello").textContent).toBe("Hello, world!");

        await act(async () => screen.getByText("Update field").click());

        expect(screen.getByTestId("hello").textContent).toBe("Hello, Sasha!");

        expect(screen.getByTestId("render-reset").textContent).toBe("2");

        await act(async () => screen.getByText("Reset").click());

        expect(screen.getByTestId("hello").textContent).toBe("Hello, world!");

        expect(screen.getByTestId("render-reset").textContent).toBe("3");
      });

      it("allows to handle onReset", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);
          const hello = form.$.hello.useValue();

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

        render(<Component />);

        expect(screen.getByTestId("hello").textContent).toBe("Hello, world!");

        await act(async () => screen.getByText("Update field").click());

        expect(screen.getByTestId("hello").textContent).toBe("Hello, Sasha!");

        expect(screen.getByTestId("render-reset").textContent).toBe("2");

        expect(spy).not.toBeCalled();

        await act(async () => screen.getByText("Reset").click());

        expect(spy).toBeCalledWith(
          expect.objectContaining({ target: expect.any(Object) }),
        );

        expect(screen.getByTestId("render-reset").textContent).toBe("2");
      });
    });

    describe("#Component", () => {
      beforeEach(cleanup);

      it("allows to use Form component", async () => {
        const spy = vi.fn();
        let resolveSubmit: ((value: unknown) => void) | undefined;
        const submitPromise = new Promise((resolve) => {
          resolveSubmit = resolve;
        });

        function Component() {
          const count = useRenderCount();
          const form = Form.use({ hello: "world" }, []);

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

        render(<Component />);

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        await act(async () => {
          fireEvent.input(screen.getByTestId("hello-input"), {
            target: { value: "Sasha" },
          });
        });

        expect(screen.getByTestId("render-submit").textContent).toBe("1");

        expect(spy).not.toBeCalled();

        await act(async () => screen.getByText("Submit").click());

        expect(spy).toBeCalledWith({
          hello: "Sasha",
        });

        expect(screen.getByTestId("submitting").textContent).toBe("true");

        expect(screen.getByTestId("render-submit").textContent).toBe("2");

        await act(async () => resolveSubmit?.(void 0));

        expect(screen.getByTestId("submitting").textContent).toBe("false");

        expect(screen.getByTestId("render-submit").textContent).toBe("3");
      });

      it("assigns form id", async () => {
        let formId: string | undefined;

        function Component() {
          const form = Form.use({ hello: "world" }, []);
          formId = form.id;
          return (
            <Form.Component
              form={form}
              data-testid="form"
              onSubmit={() => {}}
            />
          );
        }

        render(<Component />);

        expect(formId).toBeTypeOf("string");

        expect(screen.getByTestId("form").id).toBe(formId);
      });
    });
  });
});

//#region Helpers

interface Hello {
  hello: string;
}

function validateHello(ref: Field.Ref<Hello>) {
  if (!ref.$.hello.value.trim()) ref.$.hello.addError("Hello is required");
}

function joinErrors(errors: Field.Error[] | undefined) {
  if (!errors) return "";
  return errors.map((error) => error.message).join(", ");
}

//#endregion
