import { userEvent } from "@vitest/browser/context";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import "../../tests/browser.d.ts";
import { change } from "../change/index.ts";
import { Field } from "./index.tsx";

describe("Field", () => {
  it("allows to control object field", async () => {
    interface ComponentProps {
      profile: Profile;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const profile = Field.use<Profile>(props.profile);

      return (
        <div>
          <div data-testid="render-profile">{count}</div>

          <UserComponent user={profile.$.user} />
        </div>
      );
    }

    const screen = render(
      <Component profile={{ user: { name: { first: "Alexander" } } }} />,
    );

    await userEvent.fill(screen.getByTestId("name-first-0-input"), "Sasha");

    await expect
      .element(screen.getByTestId("name-first-0"))
      .toHaveTextContent("Sasha");
    await expect
      .element(screen.getByTestId("name-last-0"))
      .toHaveTextContent("");

    await expect
      .element(screen.getByTestId("render-profile"))
      .toHaveTextContent("1");
    await expect
      .element(screen.getByTestId("render-user"))
      .toHaveTextContent("1");
    await expect
      .element(screen.getByTestId("render-name-0"))
      .toHaveTextContent("2");

    await userEvent.fill(screen.getByTestId("name-last-0-input"), "Koss");

    await expect
      .element(screen.getByTestId("name-first-0"))
      .toHaveTextContent("Sasha");
    await expect
      .element(screen.getByTestId("name-last-0"))
      .toHaveTextContent("Koss");

    await expect
      .element(screen.getByTestId("render-profile"))
      .toHaveTextContent("1");
    await expect
      .element(screen.getByTestId("render-user"))
      .toHaveTextContent("2");
    await expect
      .element(screen.getByTestId("render-name-0"))
      .toHaveTextContent("3");
  });

  it("allows to control array field", async () => {
    interface ComponentProps {
      names: UserName[];
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const field = Field.use({ names: props.names });
      const names = field.$.names.useBind();

      return (
        <div>
          <div data-testid="render-names">{count}</div>

          {names.map((name, index) => (
            <div data-testid={`name-${index}`} key={name.id}>
              <UserNameComponent name={name} />
              <button
                onClick={() => name.remove()}
                data-testid={`remove-${index}`}
              >
                Remove
              </button>
            </div>
          ))}

          <UserNameFormComponent onSubmit={(name) => names.push(name)} />
        </div>
      );
    }

    const screen = render(<Component names={[{ first: "Alexander" }]} />);

    await userEvent.fill(screen.getByTestId("input-name-first"), "Sasha");
    await userEvent.fill(screen.getByTestId("input-name-last"), "Koss");
    await screen.getByText("Submit name").click();

    await expect
      .element(screen.getByTestId("name-1"))
      .toHaveTextContent("1SashaKossRemove");

    await screen.getByTestId("remove-1").click();

    await expect.element(screen.getByTestId("name-1")).not.toBeInTheDocument();

    await expect
      .element(screen.getByTestId("render-names"))
      .toHaveTextContent("3");
  });

  describe("subscriptions", () => {
    describe("useGet", () => {
      it("allows to watch for field", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander" } });
          const name = field.$.name.useGet();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <button onClick={() => field.$.name.addError("Nope")}>
                Add error
              </button>

              <div data-testid="name">{name.first}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Add error").click();

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("rename").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");
      });

      it("allows to listen to value with meta information", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander", last: "" } });
          const [value, { dirty, errors, valid }] = field.useGet({
            meta: true,
          });

          return (
            <div>
              <div data-testid="render-meta">{count}</div>

              <button
                onClick={() =>
                  field.$.name.$.first.addError(`Nope ${Math.random()}`)
                }
              >
                Set first name error
              </button>

              <button
                onClick={() =>
                  field.$.name.$.last.addError(`Nah ${Math.random()}`)
                }
              >
                Set last name error
              </button>

              <button onClick={() => field.addError("Nope")}>
                Set field error
              </button>

              <button
                onClick={() => {
                  field.$.name.$.first.clearErrors();
                  field.$.name.$.last.clearErrors();
                }}
              >
                Clear errors
              </button>

              <button
                onClick={() =>
                  field.$.name.set({ first: "Sasha", last: "Koss" })
                }
              >
                Rename
              </button>

              <div data-testid="full-name">
                {value.name.first} {value.name.last}
              </div>

              <div data-testid="dirty">{String(dirty)}</div>
              <div data-testid="errors">{joinErrors(errors)}</div>
              <div data-testid="valid">{String(valid)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("full-name"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await screen.getByText("Set first name error").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await screen.getByText("Set last name error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("2");

        await screen.getByText("Set first name error").click();
        await screen.getByText("Set last name error").click();

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("2");

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect.element(screen.getByTestId("render-meta"));

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("full-name"))
          .toHaveTextContent("Sasha Koss");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("3");

        await screen.getByText("Clear errors").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("4");

        await screen.getByText("Set field error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("5");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const item = field.at(index).useGet();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="name">{item?.name}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const item = field.at(index).useGet();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(0).set({ name: "Alex" })}>
                Rename 0 to Alex
              </button>

              <button onClick={() => field.at(1).set({ name: "Sashka" })}>
                Rename 1 to Sashka
              </button>

              <div data-testid="name">{item?.name}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");

        await screen.getByText("Rename 0 to Alex").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");

        await screen.getByText("Rename 1 to Sashka").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sashka");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("3");
      });

      it("doesn't rerender when setting the same primitive", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: "Sasha" });
          const user = field.useGet();

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => field.$.name.set("Sasha")}>
                Assign same name
              </button>

              <div data-testid="name">{user?.name}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Assign same name").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");
      });
    });

    describe("useWatch", () => {
      it("allows to watch for field using a function", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander" } });
          const [name, setName] = useState(field.$.name.get());
          field.$.name.useWatch(setName);

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <button onClick={() => field.$.name.addError("Nope")}>
                Add error
              </button>

              <div data-testid="name">{name.first}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Add error").click();

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");

        await screen.getByText("rename").click();

        await expect
          .element(screen.getByTestId("name"))
          .toHaveTextContent("Sasha");

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("3");
      });

      it("depends on the field id", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          field.at(index).useWatch(spy);

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).set({ name: "Alex" })}>
                Rename item 1
              </button>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        expect(spy).toHaveBeenCalledOnce();
        {
          const [[value, event]] = spy.mock.calls;
          expect(value).toEqual({ name: "Sasha" });
          expect(event.changes).toMatchChanges(change.field.id);
        }

        await screen.getByText("Rename item 1").click();

        expect(spy).toHaveBeenCalledTimes(2);
        {
          const [, [value, event]] = spy.mock.calls;
          expect(value).toEqual({ name: "Alex" });
          expect(event.changes).toMatchChanges(change.child.value);
        }

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        const spy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          field.at(index).useWatch(spy);

          return (
            <div>
              <div data-testid="render-watch">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).set({ name: "Alex" })}>
                Rename item 1
              </button>

              <button onClick={() => field.at(0).set({ name: "A." })}>
                Rename item 0
              </button>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith(
          { name: "Sasha" },
          expect.objectContaining({
            changes: change.field.id,
          }),
        );

        await screen.getByText("Rename item 0").click();

        expect(spy).toHaveBeenCalledOnce();

        await expect
          .element(screen.getByTestId("render-watch"))
          .toHaveTextContent("2");
      });
    });

    describe("useBind", () => {
      it("allows to bind object field changes to the component", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<UserName>({ first: "Alexander" });
          const name = field.useBind();

          return (
            <div>
              <div data-testid="render-bind">{count}</div>

              <button onClick={() => name.$.first.set("Alex")}>
                Rename first
              </button>

              <button onClick={() => name.$.last.set("Koss")}>
                Give last name
              </button>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("1");

        await screen.getByText("Rename first").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("1");

        await screen.getByText("Give last name").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("2");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<UserName[]>([
            { first: "Alexander" },
            { first: "Sasha" },
          ]);
          const [index, setIndex] = useState(0);
          const _ = field.at(index).useBind();

          return (
            <div>
              <div data-testid="render-bind">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).set({ first: "Alex" })}>
                Rename item 1
              </button>

              <button
                onClick={() => field.at(1).set({ first: "Alex", last: "Koss" })}
              >
                Give item 1 last name
              </button>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("2");

        await screen.getByText("Rename item 1").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("2");

        await screen.getByText("Give item 1 last name").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("3");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<UserName[]>([
            { first: "Alexander" },
            { first: "Sasha" },
          ]);
          const [index, setIndex] = useState(0);
          const _ = field.at(index).useBind();

          return (
            <div>
              <div data-testid="render-bind">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() =>
                  field.at(0).set({ first: "Alexander", last: "Koss" })
                }
              >
                Give item 0 last name
              </button>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("2");

        await screen.getByText("Give item 0 last name").click();

        await expect
          .element(screen.getByTestId("render-bind"))
          .toHaveTextContent("2");
      });
    });
  });

  describe("meta", () => {
    describe("useDirty", () => {
      it("allows to listen to field dirty", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander" } });
          const dirty = field.useDirty();

          return (
            <div>
              <div data-testid="render-dirty">{count}</div>

              <input
                data-testid="name-first-input"
                {...field.$.name.$.first.control()}
              />

              <div data-testid="dirty">{String(dirty)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Sa");
        await userEvent.fill(screen.getByTestId("name-first-input"), "Sasha");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");

        await userEvent.fill(
          screen.getByTestId("name-first-input"),
          "Alexander",
        );

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("3");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const dirty = field.at(index).useDirty();

          return (
            <div>
              <div data-testid="render-dirty">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).set({ name: "Alex" })}>
                Rename item 1
              </button>

              <div data-testid="dirty">{String(dirty)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("1");

        await screen.getByText("Rename item 1").click();

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const dirty = field.at(index).useDirty();

          return (
            <div>
              <div data-testid="render-dirty">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(0).set({ name: "Alex" })}>
                Rename item 0
              </button>

              <div data-testid="dirty">{String(dirty)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");

        await screen.getByText("Rename item 0").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");
      });

      it("allows to enable/disable the dirty listener", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const [enabled, setEnabled] = useState(false);
          const dirty = field.at(index).useDirty(enabled);

          return (
            <div>
              <div data-testid="render-dirty">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).set({ name: "Alex" })}>
                Rename item 1
              </button>

              <button onClick={() => setEnabled(true)}>Enable dirty</button>

              <div data-testid="dirty">{String(dirty)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("undefined");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("undefined");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");

        await screen.getByText("Rename item 1").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("undefined");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");

        await screen.getByText("Enable dirty").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("3");
      });

      it("updates on reset", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander" } });
          const dirty = field.useDirty();

          return (
            <div>
              <div data-testid="render-dirty">{count}</div>

              <input
                data-testid="name-first-input"
                {...field.$.name.$.first.control()}
              />

              <button onClick={() => field.reset()}>Reset</button>

              <div data-testid="dirty">{String(dirty)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Sa");
        await userEvent.fill(screen.getByTestId("name-first-input"), "Sasha");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");

        await screen.getByText("Reset").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("3");
      });

      it("updates on commit", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander" } });
          const dirty = field.useDirty();

          return (
            <div>
              <div data-testid="render-dirty">{count}</div>

              <input
                data-testid="name-first-input"
                {...field.$.name.$.first.control()}
              />

              <button onClick={() => field.commit()}>Commit</button>

              <div data-testid="dirty">{String(dirty)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Sa");
        await userEvent.fill(screen.getByTestId("name-first-input"), "Sasha");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("2");

        await screen.getByText("Commit").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-dirty"))
          .toHaveTextContent("3");
      });
    });

    describe("useError", () => {
      it("allows to listen to field error", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander", last: "" } });
          const errors = field.$.name.useErrors();

          return (
            <div>
              <div data-testid="render-error">{count}</div>

              <button onClick={() => field.$.name.addError("Nope 1")}>
                Set error 1
              </button>

              <button onClick={() => field.$.name.addError("Nope 2")}>
                Set error 2
              </button>

              <button onClick={() => field.$.name.$.first.addError("Nah")}>
                Set first name error
              </button>

              <button
                onClick={() => {
                  field.$.name.clearErrors();
                }}
              >
                Clear error
              </button>

              <button onClick={() => field.$.name.$.last.set("Koss")}>
                Trigger field update
              </button>

              <div data-testid="errors">{joinErrors(errors)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("1");

        await screen.getByText("Set error 1").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope 1");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("2");

        await screen.getByText("Set error 1").click();

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("3");

        await screen.getByText("Set error 2").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope 2");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("4");

        await screen.getByText("Trigger field update").click();

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("4");

        await screen.getByText("Set first name error").click();

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("4");

        await screen.getByText("Clear error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("5");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const errors = field.at(index).useErrors();

          return (
            <div>
              <div data-testid="render-error">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).addError("Nope")}>
                Set item 1 error
              </button>

              <div data-testid="errors">{joinErrors(errors)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("1");

        await screen.getByText("Set item 1 error").click();

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const errors = field.at(index).useErrors();

          return (
            <div>
              <div data-testid="render-error">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(0).addError("Nope")}>
                Set item 0 error
              </button>

              <div data-testid="errors">{joinErrors(errors)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("2");

        await screen.getByText("Set item 0 error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("2");
      });

      it("allows to enable/disable the error listener", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const [enabled, setEnabled] = useState(false);
          const errors = field.at(index).useErrors(enabled);

          return (
            <div>
              <div data-testid="render-error">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).addError("Nope")}>
                Set item 1 error
              </button>

              <button onClick={() => setEnabled(true)}>Enable error</button>

              <div data-testid="errors">{joinErrors(errors)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("2");

        await screen.getByText("Set item 1 error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("2");

        await screen.getByText("Enable error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope");

        await expect
          .element(screen.getByTestId("render-error"))
          .toHaveTextContent("3");
      });
    });

    describe("useValid", () => {
      it("allows to listen to field valid", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander" } });
          const valid = field.useValid();

          return (
            <div>
              <div data-testid="render-valid">{count}</div>

              <button
                onClick={() =>
                  field.$.name.$.first.addError(`Nope ${Math.random()}`)
                }
              >
                Set error
              </button>

              <button onClick={() => field.$.name.$.first.clearErrors()}>
                Clear error
              </button>

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Trigger field update
              </button>

              <div data-testid="valid">{String(valid)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");

        await screen.getByText("Set error").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");

        await screen.getByText("Set error").click();
        await screen.getByText("Set error").click();

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");

        await screen.getByText("Trigger field update").click();

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");

        await screen.getByText("Set error").click();
        await screen.getByText("Clear error").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("3");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const valid = field.at(index).useValid();

          return (
            <div>
              <div data-testid="render-valid">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).addError("Nope")}>
                Set item 1 error
              </button>

              <div data-testid="valid">{String(valid)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("1");

        await screen.getByText("Set item 1 error").click();

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const valid = field.at(index).useValid();

          return (
            <div>
              <div data-testid="render-valid">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(0).addError("Nope")}>
                Set item 0 error
              </button>

              <div data-testid="valid">{String(valid)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");

        await screen.getByText("Set item 0 error").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");
      });

      it("allows to enable/disable the valid listener", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use([{ name: "Alexander" }, { name: "Sasha" }]);
          const [index, setIndex] = useState(0);
          const [enabled, setEnabled] = useState(false);
          const valid = field.at(index).useValid(enabled);

          return (
            <div>
              <div data-testid="render-valid">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(1).addError("Nope")}>
                Set item 1 error
              </button>

              <button onClick={() => setEnabled(true)}>Enable valid</button>

              <div data-testid="valid">{String(valid)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("undefined");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("undefined");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");

        await screen.getByText("Set item 1 error").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("undefined");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("2");

        await screen.getByText("Enable valid").click();

        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-valid"))
          .toHaveTextContent("3");
      });
    });

    describe("useMeta", () => {
      it("allows to listen to meta information", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ name: { first: "Alexander", last: "" } });
          const { dirty, errors: errors, valid } = field.useMeta();

          return (
            <div>
              <div data-testid="render-meta">{count}</div>

              <button
                onClick={() =>
                  field.$.name.$.first.addError(`Nope ${Math.random()}`)
                }
              >
                Set first name error
              </button>

              <button
                onClick={() =>
                  field.$.name.$.last.addError(`Nah ${Math.random()}`)
                }
              >
                Set last name error
              </button>

              <button onClick={() => field.addError("Nope")}>
                Set field error
              </button>

              <button
                onClick={() => {
                  field.$.name.$.first.clearErrors();
                  field.$.name.$.last.clearErrors();
                }}
              >
                Clear errors
              </button>

              <button onClick={() => field.$.name.$.last.set("Koss")}>
                Trigger field update
              </button>

              <div data-testid="dirty">{String(dirty)}</div>
              <div data-testid="errors">{joinErrors(errors)}</div>
              <div data-testid="valid">{String(valid)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await screen.getByText("Set first name error").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await screen.getByText("Set last name error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("2");

        await screen.getByText("Set first name error").click();
        await screen.getByText("Set last name error").click();

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("2");

        await expect.element(screen.getByTestId("render-meta"));

        await screen.getByText("Trigger field update").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("3");

        await screen.getByText("Clear errors").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("4");

        await screen.getByText("Set field error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("5");
      });
    });
  });

  describe("mapping", () => {
    describe("useCompute", () => {
      it("allows to compute value", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<User>({ name: { first: "Alexander" } });
          const hasLastName = field.$.name.useCompute((name) => !!name.last);

          return (
            <div>
              <div data-testid="render-compute">{count}</div>

              <button
                onClick={() =>
                  field.$.name.$.first.set(`Sasha ${Math.random()}`)
                }
              >
                Rename first
              </button>

              <button onClick={() => field.$.name.addError("Nope")}>
                Add error
              </button>

              <button onClick={() => field.$.name.$.last.set("Koss")}>
                Set last name
              </button>

              <button onClick={() => field.$.name.$.last.set(undefined)}>
                Clear last name
              </button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("1");

        await screen.getByText("Add error").click();
        await screen.getByText("Rename first").click();
        await screen.getByText("Add error").click();
        await screen.getByText("Rename first").click();

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("1");

        await screen.getByText("Set last name").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("2");

        await screen.getByText("Add error").click();
        await screen.getByText("Rename first").click();
        await screen.getByText("Add error").click();
        await screen.getByText("Rename first").click();

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("2");

        await screen.getByText("Clear last name").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("3");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<UserName[]>([
            { first: "Alexander" },
            { first: "Sasha", last: "Koss" },
          ]);
          const [index, setIndex] = useState(0);
          const hasLastName = field
            .at(index)
            .useCompute((name) => !!name?.last);

          return (
            <div>
              <div data-testid="render-computed">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-computed"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-computed"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<UserName[]>([
            { first: "Alexander" },
            { first: "Sasha", last: "Koss" },
          ]);
          const [index, setIndex] = useState(0);
          const hasLastName = field
            .at(index)
            .useCompute((name) => !!name?.last);

          return (
            <div>
              <div data-testid="render-computed">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() =>
                  field.at(0).set({ first: "Alexander", last: "Koss" })
                }
              >
                Give item 0 last name
              </button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-computed"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-computed"))
          .toHaveTextContent("2");

        await screen.getByText("Give item 0 last name").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("true");
      });

      it("doesn't rerender when setting the same primitive", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<UserName>({ first: "Alexander" });
          const hasLastName = field.useCompute((name) => !!name?.last);

          return (
            <div>
              <div data-testid="render-computed">{count}</div>

              <button onClick={() => field.set({ first: "Alex" })}>
                Rename item 0
              </button>

              <div data-testid="computed">{String(hasLastName)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-computed"))
          .toHaveTextContent("1");

        await screen.getByText("Rename item 0").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-computed"))
          .toHaveTextContent("1");
      });

      it("allows to specify dependencies", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use("Alexander");
          const [lastName, setLastName] = useState("Koss");
          const fullName = field.useCompute(
            (name) => `${name} ${lastName}`,
            [lastName],
          );

          return (
            <div>
              <div data-testid="render-compute">{count}</div>

              <button onClick={() => field.set("Sasha")}>Rename first</button>

              <button onClick={() => setLastName("K.")}>Rename last</button>

              <div data-testid="computed">{fullName}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("Alexander Koss");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("1");

        await screen.getByText("Rename last").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("Alexander K.");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("3");

        await screen.getByText("Rename first").click();

        await expect
          .element(screen.getByTestId("computed"))
          .toHaveTextContent("Sasha K.");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("4");
      });
    });

    describe("useDecompose", () => {
      it("allows to decompose union field", async () => {
        function Component() {
          const count = useRenderCount();
          const address = Field.use<Address>({ name: { first: "Alexander" } });
          const name = address.$.name.useDecompose(
            (newName, prevName) => typeof newName !== typeof prevName,
          );

          return (
            <div>
              <div data-testid="render-decompose">{count}</div>

              {typeof name.value === "string" ? (
                <div>
                  <button
                    onClick={() =>
                      (name.field as Field<string>).set("Alexander")
                    }
                  >
                    Rename
                  </button>

                  <StringComponent string={name.field as Field<string>} />
                </div>
              ) : (
                <div>
                  <input
                    data-testid="input-name-first"
                    {...(name.field as Field<UserName>).$.first.control()}
                  />

                  <button onClick={() => address.$.name.set("Alex")}>
                    Set string name
                  </button>

                  <UserNameComponent name={name.field as Field<UserName>} />
                </div>
              )}
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name-0"))
          .toHaveTextContent("1Alexander");

        await userEvent.fill(screen.getByTestId("input-name-first"), "Sasha");

        await expect
          .element(screen.getByTestId("name-0"))
          .toHaveTextContent("2Sasha");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("1");

        await screen.getByText("Set string name").click();

        await expect
          .element(screen.getByTestId("name"))
          .not.toBeInTheDocument();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Alex");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("2");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<Array<string | UserName>>([
            "Alexander",
            { first: "Sasha", last: "Koss" },
          ]);
          const [index, setIndex] = useState(0);
          const name = field
            .at(index)
            .useDecompose((a, b) => typeof a !== typeof b);
          const nameType = typeof name.value;

          return (
            <div>
              <div data-testid="render-decompose">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="decomposed">{nameType}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("decomposed"))
          .toHaveTextContent("string");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("decomposed"))
          .toHaveTextContent("object");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<Array<string | UserName>>([
            "Alexander",
            { first: "Sasha", last: "Koss" },
          ]);
          const [index, setIndex] = useState(0);
          const name = field
            .at(index)
            .useDecompose((a, b) => typeof a !== typeof b);
          const nameType = typeof name.value;

          return (
            <div>
              <div data-testid="render-decompose">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() =>
                  field.at(0).set({ first: "Alexander", last: "Koss" })
                }
              >
                Make item 1 object
              </button>

              <div data-testid="decomposed">{nameType}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("decomposed"))
          .toHaveTextContent("string");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("decomposed"))
          .toHaveTextContent("object");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("2");

        await screen.getByText("Make item 1 object").click();

        await expect
          .element(screen.getByTestId("decomposed"))
          .toHaveTextContent("object");

        await expect
          .element(screen.getByTestId("render-decompose"))
          .toHaveTextContent("2");
      });
    });

    describe("useNarrow", () => {
      it("allows to narrow union field", async () => {
        function Component() {
          const count = useRenderCount();
          const address = Field.use<Address>({ name: { first: "Alexander" } });
          const nameStr = address.$.name.useNarrow(
            (name, ok) => typeof name === "string" && ok(name),
          );
          const nameObj = address.$.name.useNarrow(
            (name, ok) => typeof name !== "string" && ok(name),
          );

          return (
            <div>
              <div data-testid="render-narrow">{count}</div>

              {nameStr && (
                <div>
                  <button onClick={() => nameStr.set("Alexander")}>
                    Rename
                  </button>
                  <StringComponent string={nameStr} />
                </div>
              )}

              {nameObj && (
                <div>
                  <button onClick={() => nameObj.$.first.set("Sasha")}>
                    Rename first
                  </button>

                  <button onClick={() => address.$.name.set("Alex")}>
                    Set string name
                  </button>

                  <UserNameComponent name={nameObj} />
                </div>
              )}
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name-0"))
          .toHaveTextContent("1Alexander");

        await screen.getByText("Rename first").click();

        await expect
          .element(screen.getByTestId("name-0"))
          .toHaveTextContent("2Sasha");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("1");

        await screen.getByText("Set string name").click();

        await expect
          .element(screen.getByTestId("name-0"))
          .not.toBeInTheDocument();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Alex");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("2");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<Array<string | UserName>>([
            "Alexander",
            { first: "Sasha", last: "Koss" },
          ]);
          const [index, setIndex] = useState(0);
          const nameObj = field
            .at(index)
            .useNarrow((name, ok) => typeof name === "object" && ok(name));

          return (
            <div>
              <div data-testid="render-narrow">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="narrow">{String(!!nameObj)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("narrow"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("narrow"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<Array<string | UserName>>([
            "Alexander",
            { first: "Sasha", last: "Koss" },
          ]);
          const [index, setIndex] = useState(0);
          const nameObj = field
            .at(index)
            .useNarrow((name, ok) => typeof name === "object" && ok(name));

          return (
            <div>
              <div data-testid="render-narrow">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() =>
                  field.at(0).set({ first: "Alexander", last: "Koss" })
                }
              >
                Make item 1 object
              </button>

              <div data-testid="narrow">{String(!!nameObj)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("narrow"))
          .toHaveTextContent("false");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("narrow"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("2");

        await screen.getByText("Make item 1 object").click();

        await expect
          .element(screen.getByTestId("narrow"))
          .toHaveTextContent("true");

        await expect
          .element(screen.getByTestId("render-narrow"))
          .toHaveTextContent("2");
      });
    });

    describe("useDiscriminate", () => {
      it("allows to discriminate union field", async () => {
        interface TestState {
          hello: Hello;
        }

        function Component() {
          const count = useRenderCount();
          const field = Field.use<TestState>({
            hello: { lang: "human", text: "Hello" },
          });
          const hello = field.$.hello.useDiscriminate("lang");

          return (
            <div>
              <div data-testid="render-hello">{count}</div>

              {hello.discriminator === "human" ? (
                <div>
                  <button
                    onClick={() =>
                      hello.field.set({
                        lang: "human",
                        text: "Hola",
                      })
                    }
                  >
                    Say hola
                  </button>

                  <button
                    onClick={() =>
                      field.$.hello.set({
                        lang: "machine",
                        binary: 0b1101010,
                      })
                    }
                  >
                    Switch to binary
                  </button>

                  <StringComponent string={hello.field.$.text} />
                </div>
              ) : (
                hello.discriminator === "machine" && (
                  <div>
                    <button
                      onClick={() =>
                        field.$.hello.set({
                          lang: "machine",
                          binary: 0b1010101,
                        })
                      }
                    >
                      Say 1010101
                    </button>

                    <NumberComponent number={hello.field.$.binary} />
                  </div>
                )
              )}
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Hello");

        await screen.getByText("Say hola").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Hola");

        await expect
          .element(screen.getByTestId("render-hello"))
          .toHaveTextContent("1");

        await screen.getByText("Switch to binary").click();

        await expect
          .element(screen.getByTestId("string"))
          .not.toBeInTheDocument();

        await expect
          .element(screen.getByTestId("number"))
          .toHaveTextContent("106");

        await screen.getByText("Say 1010101").click();

        await expect
          .element(screen.getByTestId("number"))
          .toHaveTextContent("85");

        await expect
          .element(screen.getByTestId("render-hello"))
          .toHaveTextContent("2");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<Hello[]>([
            { lang: "human", text: "Hello" },
            { lang: "machine", binary: 0b1101010 },
          ]);
          const [index, setIndex] = useState(0);
          const hello = field.at(index).useDiscriminate("lang");

          return (
            <div>
              <div data-testid="render-discriminate">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <div data-testid="discriminate">{hello.discriminator}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("discriminate"))
          .toHaveTextContent("human");

        await expect
          .element(screen.getByTestId("render-discriminate"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("discriminate"))
          .toHaveTextContent("machine");

        await expect
          .element(screen.getByTestId("render-discriminate"))
          .toHaveTextContent("2");
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<Hello[]>([
            { lang: "human", text: "Hello" },
            { lang: "machine", binary: 0b1101010 },
          ]);
          const [index, setIndex] = useState(0);
          const hello = field.at(index).useDiscriminate("lang");

          return (
            <div>
              <div data-testid="render-discriminate">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button
                onClick={() => field.at(0).set({ lang: "dog", chicken: true })}
              >
                Make item 1 dog
              </button>

              <div data-testid="discriminate">{hello.discriminator}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("discriminate"))
          .toHaveTextContent("human");

        await expect
          .element(screen.getByTestId("render-discriminate"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("discriminate"))
          .toHaveTextContent("machine");

        await expect
          .element(screen.getByTestId("render-discriminate"))
          .toHaveTextContent("2");

        await screen.getByText("Make item 1 dog").click();

        await expect
          .element(screen.getByTestId("discriminate"))
          .toHaveTextContent("machine");

        await expect
          .element(screen.getByTestId("render-discriminate"))
          .toHaveTextContent("2");
      });

      type Hello = HelloMachine | HelloHuman | HelloDog;

      interface HelloMachine {
        lang: "machine";
        binary: number;
      }

      interface HelloHuman {
        lang: "human";
        text: string;
      }

      interface HelloDog {
        lang: "dog";
        chicken: true;
      }
    });

    describe("useInto", () => {
      it("allows to compute field", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use({ message: "Hello" });
          const codes = field.$.message.useInto(toCodes).from(fromCodes);

          return (
            <div>
              <div data-testid="render-compute">{count}</div>

              <StringComponent string={field.$.message} />

              <CodesComponent codes={codes} />

              <button onClick={() => codes.set([72, 105, 33])}>Say hi</button>

              <button onClick={() => field.$.message.set("Yo")}>Say yo</button>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Hello");

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("72 101 108 108 111");

        await screen.getByText("Say hi").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Hi");

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("72 105 33");

        await screen.getByText("Say yo").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Yo");

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("89 111");

        await expect
          .element(screen.getByTestId("render-compute"))
          .toHaveTextContent("1");

        await expect
          .element(screen.getByTestId("render-string"))
          .toHaveTextContent("3");

        await expect
          .element(screen.getByTestId("render-codes"))
          .toHaveTextContent("3");
      });

      it("depends on the field id", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<string[]>(["Hello", "Yo"]);
          const [index, setIndex] = useState(0);
          const codes = field.at(index).useInto(toCodes).from(fromCodes);

          return (
            <div>
              <div data-testid="render-into">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <CodesComponent codes={codes} />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("72 101 108 108 111");

        await expect
          .element(screen.getByTestId("render-into"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("89 111");

        await expect
          .element(screen.getByTestId("render-into"))
          .toHaveTextContent("2");
      });

      it("passes the current value as 2nd argument", async () => {
        const intoSpy = vi.fn().mockReturnValue("Hey!");
        const fromSpy = vi.fn().mockReturnValue("Yo!");

        function Component() {
          const field = Field.use({ message: "Hello, world!" });
          const computed = field.$.message.useInto(intoSpy).from(fromSpy);

          return (
            <div>
              <button onClick={() => computed.set("Hi!")}>Say hi</button>
            </div>
          );
        }

        const screen = render(<Component />);

        await screen.getByText("Say hi").click();

        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              // into
              expect(intoSpy).toHaveBeenCalledOnce();
              expect(intoSpy).toBeCalledWith("Hello, world!", undefined);
              // from
              expect(fromSpy).toHaveBeenCalledOnce();
              expect(fromSpy).toBeCalledWith("Hi!", "Hello, world!");
              resolve(void 0);
            } catch (err) {
              reject(err);
            }
          });
        });
      });

      it("updates the watcher on field id change", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<string[]>(["Hello", "Yo"]);
          const [index, setIndex] = useState(0);
          const codes = field.at(index).useInto(toCodes).from(fromCodes);

          return (
            <div>
              <div data-testid="render-into">{count}</div>

              <button onClick={() => setIndex(1)}>Set index to 1</button>

              <button onClick={() => field.at(0).set("Duh")}>
                Rename item 1
              </button>

              <CodesComponent codes={codes} />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("72 101 108 108 111");

        await expect
          .element(screen.getByTestId("render-into"))
          .toHaveTextContent("1");

        await screen.getByText("Set index to 1").click();

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("89 111");

        await expect
          .element(screen.getByTestId("render-into"))
          .toHaveTextContent("2");

        await screen.getByText("Rename item 1").click();

        await expect
          .element(screen.getByTestId("codes"))
          .toHaveTextContent("89 111");

        await expect
          .element(screen.getByTestId("render-into"))
          .toHaveTextContent("2");
      });
    });

    describe("useEnsure", () => {
      it("allows to ensure presence of a field", async () => {
        function Component() {
          const count = useRenderCount();
          const [field, setField] = useState<Field<string> | undefined>();
          const actualField = Field.use("Hello!");
          const ensuredField = Field.useEnsure(field);
          const dummyField = useMemo(() => ensuredField, []);
          const fieldValue = ensuredField.useGet();
          const dummyValue = dummyField.useGet();

          return (
            <div>
              <div data-testid="render-ensure">{count}</div>

              <button onClick={() => setField(actualField)}>Set actual</button>

              <button onClick={() => dummyField.set("Hi!")}>
                Update dummy
              </button>

              <div data-testid="ensured-value">{String(fieldValue)}</div>
              <div data-testid="dummy-value">{String(dummyValue)}</div>

              <div data-testid="actual-id">{actualField.id}</div>
              <div data-testid="ensured-id">{ensuredField.id}</div>
              <div data-testid="dummy-id">{dummyField.id}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("ensured-value"))
          .toHaveTextContent("undefined");
        await expect
          .element(screen.getByTestId("dummy-value"))
          .toHaveTextContent("undefined");

        const actualId1 = screen.getByTestId("actual-id").element().textContent;
        const ensuredId1 = screen
          .getByTestId("ensured-id")
          .element().textContent;
        const dummyId1 = screen.getByTestId("dummy-id").element().textContent;

        expect(ensuredId1).toBe(dummyId1);
        expect(actualId1).not.toBe(ensuredId1);

        await expect
          .element(screen.getByTestId("render-ensure"))
          .toHaveTextContent("1");

        await screen.getByText("Set actual").click();

        await expect
          .element(screen.getByTestId("ensured-value"))
          .toHaveTextContent("Hello!");
        await expect
          .element(screen.getByTestId("dummy-value"))
          .toHaveTextContent("undefined");

        const actualId2 = screen.getByTestId("actual-id").element().textContent;
        const ensuredId2 = screen
          .getByTestId("ensured-id")
          .element().textContent;
        const dummyId2 = screen.getByTestId("dummy-id").element().textContent;

        expect(ensuredId2).toBe(actualId2);
        expect(actualId2).not.toBe(dummyId2);
        expect(dummyId2).toBe(dummyId1);

        await expect
          .element(screen.getByTestId("render-ensure"))
          .toHaveTextContent("2");

        await screen.getByText("Update dummy").click();

        await expect
          .element(screen.getByTestId("ensured-value"))
          .toHaveTextContent("Hello!");
        await expect
          .element(screen.getByTestId("dummy-value"))
          .toHaveTextContent("undefined");

        const dummyId3 = screen.getByTestId("dummy-id").element().textContent;

        expect(dummyId3).toBe(dummyId2);

        await expect
          .element(screen.getByTestId("render-ensure"))
          .toHaveTextContent("2");
      });

      it("allows to pass falsy values", async () => {
        function Component() {
          const field = Field.useEnsure(false);
          const value = field.useGet();

          return (
            <div>
              <div data-testid="value">{String(value)}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("value"))
          .toHaveTextContent("undefined");
      });

      it("allows to map nested field", async () => {
        function Component() {
          const count = useRenderCount();
          const [field, setField] = useState<
            Field<{ hello: string }> | undefined
          >();
          const actualField = Field.use({ hello: "Hello!" });
          const ensuredField = Field.useEnsure(field, (f) => f.$.hello);
          const dummyField = useMemo(() => ensuredField, []);
          const fieldValue = ensuredField.useGet();
          const dummyValue = dummyField.useGet();

          return (
            <div>
              <div data-testid="render-ensure">{count}</div>

              <button onClick={() => setField(actualField)}>Set actual</button>

              <button onClick={() => dummyField.set("Hi!")}>
                Update dummy
              </button>

              <div data-testid="ensured-value">{String(fieldValue)}</div>
              <div data-testid="dummy-value">{String(dummyValue)}</div>

              <div data-testid="actual-id">{actualField.$.hello.id}</div>
              <div data-testid="ensured-id">{ensuredField.id}</div>
              <div data-testid="dummy-id">{dummyField.id}</div>
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("ensured-value"))
          .toHaveTextContent("undefined");
        await expect
          .element(screen.getByTestId("dummy-value"))
          .toHaveTextContent("undefined");

        const actualId1 = screen.getByTestId("actual-id").element().textContent;
        const ensuredId1 = screen
          .getByTestId("ensured-id")
          .element().textContent;
        const dummyId1 = screen.getByTestId("dummy-id").element().textContent;

        expect(ensuredId1).toBe(dummyId1);
        expect(actualId1).not.toBe(ensuredId1);

        await expect
          .element(screen.getByTestId("render-ensure"))
          .toHaveTextContent("1");

        await screen.getByText("Set actual").click();

        await expect
          .element(screen.getByTestId("ensured-value"))
          .toHaveTextContent("Hello!");
        await expect
          .element(screen.getByTestId("dummy-value"))
          .toHaveTextContent("undefined");

        const actualId2 = screen.getByTestId("actual-id").element().textContent;
        const ensuredId2 = screen
          .getByTestId("ensured-id")
          .element().textContent;
        const dummyId2 = screen.getByTestId("dummy-id").element().textContent;

        expect(ensuredId2).toBe(actualId2);
        expect(actualId2).not.toBe(dummyId2);
        expect(dummyId2).toBe(dummyId1);

        await expect
          .element(screen.getByTestId("render-ensure"))
          .toHaveTextContent("2");

        await screen.getByText("Update dummy").click();

        await expect
          .element(screen.getByTestId("ensured-value"))
          .toHaveTextContent("Hello!");
        await expect
          .element(screen.getByTestId("dummy-value"))
          .toHaveTextContent("undefined");

        const dummyId3 = screen.getByTestId("dummy-id").element().textContent;

        expect(dummyId3).toBe(dummyId2);

        await expect
          .element(screen.getByTestId("render-ensure"))
          .toHaveTextContent("2");
      });
    });
  });

  describe("input", () => {
    describe("input", () => {
      it("syncronizes input with the state", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<User>({ name: { first: "Alexander" } });

          return (
            <div>
              <div data-testid="render-input">{count}</div>

              <input
                data-testid="name-first-input"
                {...field.$.name.$.first.control()}
              />

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <UserNameComponent name={field.$.name} />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alexander");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alexander");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Alex");

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alex");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alex");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Sasha");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Sasha");

        await expect
          .element(screen.getByTestId("render-input"))
          .toHaveTextContent("1");
      });

      it("syncronizes textarea with the state", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<User>({ name: { first: "Alexander" } });

          return (
            <div>
              <div data-testid="render-input">{count}</div>

              <textarea
                data-testid="name-first-input"
                {...field.$.name.$.first.control()}
              />

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <UserNameComponent name={field.$.name} />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alexander");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alexander");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Alex");

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alex");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alex");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Sasha");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Sasha");

        await expect
          .element(screen.getByTestId("render-input"))
          .toHaveTextContent("1");
      });

      it("allows to pass ref and onBlur props", async () => {
        const refSpy = vi.fn();
        const onBlurSpy = vi.fn();

        function Component() {
          const count = useRenderCount();
          const field = Field.use<User>({ name: { first: "Alexander" } });

          return (
            <div>
              <div data-testid="render-input">{count}</div>

              <input
                data-testid="name-first-input"
                {...field.$.name.$.first.control({
                  ref: refSpy,
                  onBlur: onBlurSpy,
                })}
              />

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <UserNameComponent name={field.$.name} />
            </div>
          );
        }

        const screen = render(<Component />);

        expect(refSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "name.first",
          }),
        );

        expect(onBlurSpy).not.toHaveBeenCalled();

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alexander");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alexander");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Alex");

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alex");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alex");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Sasha");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Sasha");

        await expect
          .element(screen.getByTestId("render-input"))
          .toHaveTextContent("1");

        expect(onBlurSpy).toBeCalledWith(
          expect.objectContaining({ type: "blur" }),
        );
      });
    });

    describe("Component", () => {
      it("allows to control input element", async () => {
        function Component() {
          const count = useRenderCount();
          const field = Field.use<User>({ name: { first: "Alexander" } });

          return (
            <div>
              <div data-testid="render-input">{count}</div>

              <Field.Component
                field={field.$.name.$.first}
                render={(control) => (
                  <input
                    data-testid="name-first-input"
                    {...control}
                    onChange={(event) => control.onChange(event.target.value)}
                  />
                )}
              />

              <button onClick={() => field.$.name.$.first.set("Sasha")}>
                Rename
              </button>

              <UserNameComponent name={field.$.name} />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alexander");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alexander");

        await userEvent.fill(screen.getByTestId("name-first-input"), "Alex");

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Alex");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Alex");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("name-first-0"))
          .toHaveTextContent("Sasha");
        await expect
          .element(screen.getByTestId("name-first-input"))
          .toHaveValue("Sasha");

        await expect
          .element(screen.getByTestId("render-input"))
          .toHaveTextContent("1");
      });

      it("allows to subscribe to meta information", async () => {
        function Component() {
          const outsideCount = useRenderCount();
          const field = Field.use({ name: { first: "Alexander", last: "" } });

          return (
            <div>
              <div data-testid="render-meta-outside">{outsideCount}</div>

              <Field.Component
                field={field}
                meta
                render={({ value }, { valid, errors, dirty }) => {
                  const count = useRenderCount();
                  return (
                    <>
                      <div data-testid="render-meta">{count}</div>

                      <button
                        onClick={() =>
                          field.$.name.$.first.addError(`Nope ${Math.random()}`)
                        }
                      >
                        Set first name error
                      </button>

                      <button
                        onClick={() =>
                          field.$.name.$.last.addError(`Nah ${Math.random()}`)
                        }
                      >
                        Set last name error
                      </button>

                      <button onClick={() => field.addError("Nope")}>
                        Set field error
                      </button>

                      <button
                        onClick={() => {
                          field.$.name.$.first.clearErrors();
                          field.$.name.$.last.clearErrors();
                        }}
                      >
                        Clear errors
                      </button>

                      <button
                        onClick={() =>
                          field.$.name.set({ first: "Sasha", last: "Koss" })
                        }
                      >
                        Rename
                      </button>

                      <div data-testid="full-name">
                        {value.name.first} {value.name.last}
                      </div>

                      <div data-testid="dirty">{String(dirty)}</div>
                      <div data-testid="errors">{joinErrors(errors)}</div>
                      <div data-testid="valid">{String(valid)}</div>
                    </>
                  );
                }}
              />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("full-name"))
          .toHaveTextContent("Alexander");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await screen.getByText("Set first name error").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await screen.getByText("Set last name error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("2");

        await screen.getByText("Set first name error").click();
        await screen.getByText("Set last name error").click();

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("2");

        await expect.element(screen.getByTestId("render-meta"));

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("full-name"))
          .toHaveTextContent("Sasha Koss");

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("false");
        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("3");

        await screen.getByText("Clear errors").click();

        await expect
          .element(screen.getByTestId("dirty"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("valid"))
          .toHaveTextContent("true");
        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("4");

        await screen.getByText("Set field error").click();

        await expect
          .element(screen.getByTestId("errors"))
          .toHaveTextContent("Nope");

        await expect
          .element(screen.getByTestId("render-meta"))
          .toHaveTextContent("5");

        await expect
          .element(screen.getByTestId("render-meta-outside"))
          .toHaveTextContent("1");
      });

      it("doesn't cause re-mounts on field change", async () => {
        const mountSpy = vi.fn();
        interface InputProps {
          name: string;
          value: string;
          onChange: (value: string) => void;
          onBlur: React.FocusEventHandler<Element>;
          "data-testid"?: string;
        }

        function Input(props: InputProps) {
          useEffect(mountSpy, []);
          return (
            <input
              {...props}
              onChange={(event) => props.onChange(event.target.value)}
            />
          );
        }

        function Component() {
          const count = useRenderCount();
          const namesField = Field.use<string[]>(["Alexander", "Sasha"]);
          const [index, setIndex] = useState(0);
          const decomposedField = namesField.at(index).decompose();
          if (!decomposedField.value) return null;
          const { field } = decomposedField;

          return (
            <div>
              <div data-testid="render-input">{count}</div>

              <Field.Component
                field={field}
                render={(control) => (
                  <Input {...control} data-testid="name-input" />
                )}
              />

              <button onClick={() => field.set("Alex")}>Rename</button>

              <button onClick={() => setIndex(1)}>Switch</button>

              <StringComponent string={field} />
            </div>
          );
        }

        const screen = render(<Component />);

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Alexander");
        await expect
          .element(screen.getByTestId("name-input"))
          .toHaveValue("Alexander");

        await userEvent.fill(screen.getByTestId("name-input"), "A.");

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("A.");
        await expect
          .element(screen.getByTestId("name-input"))
          .toHaveValue("A.");

        await screen.getByText("Rename").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Alex");
        await expect
          .element(screen.getByTestId("name-input"))
          .toHaveValue("Alex");

        await expect
          .element(screen.getByTestId("render-input"))
          .toHaveTextContent("1");

        expect(mountSpy).toHaveBeenCalledOnce();

        await screen.getByText("Switch").click();

        await expect
          .element(screen.getByTestId("string"))
          .toHaveTextContent("Sasha");
        await expect
          .element(screen.getByTestId("name-input"))
          .toHaveValue("Sasha");

        expect(mountSpy).toHaveBeenCalledOnce();
      });
    });
  });
});

interface Address {
  name: UserName | string;
}

interface Profile {
  user: User;
  settings?: Settings;
}

interface Settings {
  theme?: "light" | "dark";
}

interface User {
  name: UserName;
}

interface UserName {
  first: string;
  last?: string;
}

interface UserComponentProps {
  user: Field<User>;
}

function UserComponent(props: UserComponentProps) {
  const count = useRenderCount();
  const user = props.user;
  // Makes the component re-render when the name shape changes
  const name = user.$.name.useBind();

  return (
    <div>
      <div data-testid="render-user">{count}</div>

      <div data-testid="has-last">{user.$.name.get() ? "true" : "false"}</div>

      <UserNameComponent name={name} />
    </div>
  );
}

interface UserNameComponentProps {
  name: Field<UserName>;
  index?: number;
}

function UserNameComponent(props: UserNameComponentProps) {
  const count = useRenderCount();
  const { index = 0, name } = props;

  const { first, last } = name.useGet();

  return (
    <div data-testid={`name-${index}`}>
      <div data-testid={`render-name-${index}`}>{count}</div>

      <div data-testid={`name-first-${index}`}>{first}</div>
      <div data-testid={`name-last-${index}`}>{last}</div>

      <Field.Component
        field={name.$.first}
        render={(control) => (
          <input
            data-testid={`name-first-${index}-input`}
            {...control}
            onChange={(event) => control.onChange(event.target.value)}
          />
        )}
      />

      <Field.Component
        field={name.$.last}
        render={(control) => (
          <input
            data-testid={`name-last-${index}-input`}
            {...control}
            value={control.value || ""}
            onChange={(event) => control.onChange(event.target.value)}
          />
        )}
      />
    </div>
  );
}

interface UserNameFormComponentProps {
  onSubmit?: (name: UserName) => void;
}

function UserNameFormComponent(props: UserNameFormComponentProps) {
  const count = useRenderCount();
  const field = Field.use<UserName>({ first: "", last: "" });

  return (
    <div>
      <div data-testid="render-name-form">{count}</div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onSubmit?.(field.get());
        }}
      >
        <Field.Component
          field={field.$.first}
          render={(control) => (
            <input
              data-testid="input-name-first"
              {...control}
              onChange={(event) => control.onChange(event.target.value)}
            />
          )}
        />

        <Field.Component
          field={field.$.last}
          render={(control) => (
            <input
              data-testid="input-name-last"
              {...control}
              onChange={(event) => control.onChange(event.target.value)}
            />
          )}
        />

        <button type="submit">Submit name</button>
      </form>
    </div>
  );
}

interface StringComponentProps {
  string: Field<string>;
}

function StringComponent(props: StringComponentProps) {
  const count = useRenderCount();
  const string = props.string.useGet();
  return (
    <div>
      <div data-testid="render-string">{count}</div>
      <div data-testid="string">{string}</div>
    </div>
  );
}

interface NumberComponentProps {
  number: Field<number>;
}

function NumberComponent(props: NumberComponentProps) {
  const count = useRenderCount();
  const number = props.number.useGet();
  return (
    <div>
      <div data-testid="render-number">{count}</div>
      <div data-testid="number">{number}</div>
    </div>
  );
}

interface CodesComponentProps {
  codes: Field<number[]>;
}

function CodesComponent(props: CodesComponentProps) {
  const count = useRenderCount();
  const codes = props.codes.useGet();
  return (
    <div>
      <div data-testid="render-codes">{count}</div>
      <div data-testid="codes">{codes.join(" ")}</div>
    </div>
  );
}

function toCodes(message: string | undefined) {
  return Array.from(message || "").map((c) => c.charCodeAt(0));
}

function fromCodes(codes: number[]) {
  return codes.map((c) => String.fromCharCode(c)).join("");
}

function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}

function joinErrors(errors: Field.Error[] | undefined) {
  if (!errors) return "";
  return errors.map((error) => error.message).join(", ");
}
