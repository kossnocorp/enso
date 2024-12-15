import React, { useRef, useState } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it, vi } from "vitest";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import "@vitest/browser/matchers.d.ts";
import { Field, fieldChange } from "./index.tsx";
import { userEvent } from "@vitest/browser/context";

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
      <Component profile={{ user: { name: { first: "Alexander" } } }} />
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
      .toHaveTextContent("4");
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
                onClick={() => name.detach()}
                data-testid={`detach-${index}`}
              >
                Detach
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
      .toHaveTextContent("1SashaKossDetach");

    await screen.getByTestId("detach-1").click();

    await expect.element(screen.getByTestId("name-1")).not.toBeInTheDocument();

    await expect
      .element(screen.getByTestId("render-names"))
      .toHaveTextContent("3");
  });

  it("updates the input field", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use<User>({ name: { first: "Alexander" } });

      return (
        <div>
          <div data-testid="render-input">{count}</div>

          <input
            data-testid="name-first-input"
            {...field.$.name.$.first.input()}
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

  it("updates the controlled input field", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use<User>({ name: { first: "Alexander" } });

      return (
        <div>
          <div data-testid="render-input">{count}</div>

          <field.$.name.$.first.Control
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

  it("allows to subscribe to meta information when controlling input", async () => {
    function Component() {
      const outsideCount = useRenderCount();
      const field = Field.use({ name: { first: "Alexander", last: "" } });

      return (
        <div>
          <div data-testid="render-meta-outside">{outsideCount}</div>

          <field.Control
            meta
            render={({ value }, { invalids, valid, error, dirty }) => {
              const count = useRenderCount();
              return (
                <>
                  <div data-testid="render-meta">{count}</div>

                  <button
                    onClick={() =>
                      field.$.name.$.first.setError(`Nope ${Math.random()}`)
                    }
                  >
                    Set first name error
                  </button>

                  <button
                    onClick={() =>
                      field.$.name.$.last.setError(`Nah ${Math.random()}`)
                    }
                  >
                    Set last name error
                  </button>

                  <button
                    onClick={() =>
                      field.$.name.$.last.setError(
                        field.$.name.$.last.error?.message
                      )
                    }
                  >
                    Set same last name error
                  </button>

                  <button onClick={() => field.setError("Nope")}>
                    Set field error
                  </button>

                  <button
                    onClick={() => {
                      field.$.name.$.first.setError();
                      field.$.name.$.last.setError();
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
                  <div data-testid="error">{error?.message}</div>
                  <div data-testid="valid">{String(valid)}</div>
                  <div data-testid="errors">{invalids.size}</div>
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
    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await screen.getByText("Set first name error").click();

    await expect
      .element(screen.getByTestId("dirty"))
      .toHaveTextContent("false");
    await expect
      .element(screen.getByTestId("valid"))
      .toHaveTextContent("false");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await screen.getByText("Set last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("3");

    await screen.getByText("Set first name error").click();
    await screen.getByText("Set last name error").click();

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("5");

    await screen.getByText("Set same last name error").click();
    await screen.getByText("Set same last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("5");

    await expect.element(screen.getByTestId("render-meta"));

    await screen.getByText("Rename").click();

    await expect
      .element(screen.getByTestId("full-name"))
      .toHaveTextContent("Sasha Koss");

    await expect.element(screen.getByTestId("dirty")).toHaveTextContent("true");
    await expect
      .element(screen.getByTestId("valid"))
      .toHaveTextContent("false");
    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("6");

    await screen.getByText("Clear errors").click();

    await expect.element(screen.getByTestId("dirty")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("7");

    await screen.getByText("Set field error").click();

    await expect.element(screen.getByTestId("error")).toHaveTextContent("Nope");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("8");

    await expect
      .element(screen.getByTestId("render-meta-outside"))
      .toHaveTextContent("1");
  });

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

            <button onClick={() => field.$.name.setError("Nope")}>
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

            <button onClick={() => field.$.name.setError("Nope")}>
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
      expect(spy).toHaveBeenCalledWith(
        { name: "Sasha" },
        expect.objectContaining({
          changes: fieldChange.swapped,
        })
      );

      await screen.getByText("Rename item 1").click();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(
        { name: "Alex" },
        expect.objectContaining({
          changes: fieldChange.child,
        })
      );

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
          changes: fieldChange.swapped,
        })
      );

      await screen.getByText("Rename item 0").click();

      expect(spy).toHaveBeenCalledOnce();

      await expect
        .element(screen.getByTestId("render-watch"))
        .toHaveTextContent("2");
    });
  });

  describe("useDirty", () => {
    it("allows to listen to dirty field", async () => {
      function Component() {
        const count = useRenderCount();
        const field = Field.use({ name: { first: "Alexander" } });
        const dirty = field.useDirty();

        return (
          <div>
            <div data-testid="render-dirty">{count}</div>

            <input
              data-testid="name-first-input"
              {...field.$.name.$.first.input()}
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

      await userEvent.fill(screen.getByTestId("name-first-input"), "Alexander");

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

    it("allows to enable the dirty field", async () => {
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
  });

  it("allows to listen to error field", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use({ name: { first: "Alexander", last: "" } });
      const error = field.$.name.useError();

      return (
        <div>
          <div data-testid="render-error">{count}</div>

          <button onClick={() => field.$.name.setError("Nope 1")}>
            Set error 1
          </button>

          <button onClick={() => field.$.name.setError("Nope 2")}>
            Set error 2
          </button>

          <button onClick={() => field.$.name.$.first.setError("Nah")}>
            Set first name error
          </button>

          <button
            onClick={() => {
              field.$.name.setError();
            }}
          >
            Clear error
          </button>

          <button onClick={() => field.$.name.$.last.set("Koss")}>
            Trigger field update
          </button>

          <div data-testid="error">{error?.message}</div>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect.element(screen.getByTestId("error")).toHaveTextContent("");

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("1");

    await screen.getByText("Set error 1").click();

    await expect
      .element(screen.getByTestId("error"))
      .toHaveTextContent("Nope 1");

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("2");

    await screen.getByText("Set error 1").click();

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("2");

    await screen.getByText("Set error 2").click();

    await expect
      .element(screen.getByTestId("error"))
      .toHaveTextContent("Nope 2");

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("3");

    await screen.getByText("Trigger field update").click();

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("3");

    await screen.getByText("Set first name error").click();

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("3");

    await screen.getByText("Clear error").click();

    await expect.element(screen.getByTestId("error")).toHaveTextContent("");

    await expect
      .element(screen.getByTestId("render-error"))
      .toHaveTextContent("4");
  });

  it("allows to listen to valid field", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use({ name: { first: "Alexander" } });
      const valid = field.useValid();

      return (
        <div>
          <div data-testid="render-valid">{count}</div>

          <button
            onClick={() =>
              field.$.name.$.first.setError(`Nope ${Math.random()}`)
            }
          >
            Set error
          </button>

          <button onClick={() => field.$.name.$.first.setError()}>
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

    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");

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

    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");

    await expect
      .element(screen.getByTestId("render-valid"))
      .toHaveTextContent("3");
  });

  it("allows to listen to errors field", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use({ name: { first: "Alexander", last: "" } });
      const errors = field.useInvalids();

      return (
        <div>
          <div data-testid="render-errors">{count}</div>

          <button
            onClick={() =>
              field.$.name.$.first.setError(`Nope ${Math.random()}`)
            }
          >
            Set first name error
          </button>

          <button
            onClick={() => field.$.name.$.last.setError(`Nah ${Math.random()}`)}
          >
            Set last name error
          </button>

          <button
            onClick={() =>
              field.$.name.$.last.setError(field.$.name.$.last.error?.message)
            }
          >
            Set same last name error
          </button>

          <button
            onClick={() => {
              field.$.name.$.first.setError();
              field.$.name.$.last.setError();
            }}
          >
            Clear errors
          </button>

          <button onClick={() => field.$.name.$.last.set("Koss")}>
            Trigger field update
          </button>

          <div data-testid="errors">{errors.size}</div>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await screen.getByText("Set first name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await screen.getByText("Set last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-errors"))
      .toHaveTextContent("3");

    await screen.getByText("Set first name error").click();
    await screen.getByText("Set last name error").click();

    await expect
      .element(screen.getByTestId("render-errors"))
      .toHaveTextContent("5");

    await screen.getByText("Set same last name error").click();
    await screen.getByText("Set same last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-errors"))
      .toHaveTextContent("5");

    await screen.getByText("Trigger field update").click();

    await expect
      .element(screen.getByTestId("render-errors"))
      .toHaveTextContent("5");

    await screen.getByText("Clear errors").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await expect
      .element(screen.getByTestId("render-errors"))
      .toHaveTextContent("6");
  });

  it("allows to listen to meta information", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use({ name: { first: "Alexander", last: "" } });
      const { dirty, error, valid, invalids: errors } = field.useMeta();

      return (
        <div>
          <div data-testid="render-meta">{count}</div>

          <button
            onClick={() =>
              field.$.name.$.first.setError(`Nope ${Math.random()}`)
            }
          >
            Set first name error
          </button>

          <button
            onClick={() => field.$.name.$.last.setError(`Nah ${Math.random()}`)}
          >
            Set last name error
          </button>

          <button
            onClick={() =>
              field.$.name.$.last.setError(field.$.name.$.last.error?.message)
            }
          >
            Set same last name error
          </button>

          <button onClick={() => field.setError("Nope")}>
            Set field error
          </button>

          <button
            onClick={() => {
              field.$.name.$.first.setError();
              field.$.name.$.last.setError();
            }}
          >
            Clear errors
          </button>

          <button onClick={() => field.$.name.$.last.set("Koss")}>
            Trigger field update
          </button>

          <div data-testid="dirty">{String(dirty)}</div>
          <div data-testid="error">{error?.message}</div>
          <div data-testid="valid">{String(valid)}</div>
          <div data-testid="errors">{errors.size}</div>
        </div>
      );
    }

    const screen = render(<Component />);

    await expect
      .element(screen.getByTestId("dirty"))
      .toHaveTextContent("false");
    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await screen.getByText("Set first name error").click();

    await expect
      .element(screen.getByTestId("dirty"))
      .toHaveTextContent("false");
    await expect
      .element(screen.getByTestId("valid"))
      .toHaveTextContent("false");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await screen.getByText("Set last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("3");

    await screen.getByText("Set first name error").click();
    await screen.getByText("Set last name error").click();

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("5");

    await screen.getByText("Set same last name error").click();
    await screen.getByText("Set same last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("5");

    await expect.element(screen.getByTestId("render-meta"));

    await screen.getByText("Trigger field update").click();

    await expect.element(screen.getByTestId("dirty")).toHaveTextContent("true");
    await expect
      .element(screen.getByTestId("valid"))
      .toHaveTextContent("false");
    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("6");

    await screen.getByText("Clear errors").click();

    await expect.element(screen.getByTestId("dirty")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("7");

    await screen.getByText("Set field error").click();

    await expect.element(screen.getByTestId("error")).toHaveTextContent("Nope");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("8");
  });

  it("allows to listen to value with meta information", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use({ name: { first: "Alexander", last: "" } });
      const [value, { dirty, error, valid, invalids }] = field.useGet({
        meta: true,
      });

      return (
        <div>
          <div data-testid="render-meta">{count}</div>

          <button
            onClick={() =>
              field.$.name.$.first.setError(`Nope ${Math.random()}`)
            }
          >
            Set first name error
          </button>

          <button
            onClick={() => field.$.name.$.last.setError(`Nah ${Math.random()}`)}
          >
            Set last name error
          </button>

          <button
            onClick={() =>
              field.$.name.$.last.setError(field.$.name.$.last.error?.message)
            }
          >
            Set same last name error
          </button>

          <button onClick={() => field.setError("Nope")}>
            Set field error
          </button>

          <button
            onClick={() => {
              field.$.name.$.first.setError();
              field.$.name.$.last.setError();
            }}
          >
            Clear errors
          </button>

          <button
            onClick={() => field.$.name.set({ first: "Sasha", last: "Koss" })}
          >
            Rename
          </button>

          <div data-testid="full-name">
            {value.name.first} {value.name.last}
          </div>

          <div data-testid="dirty">{String(dirty)}</div>
          <div data-testid="error">{error?.message}</div>
          <div data-testid="valid">{String(valid)}</div>
          <div data-testid="errors">{invalids.size}</div>
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
    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await screen.getByText("Set first name error").click();

    await expect
      .element(screen.getByTestId("dirty"))
      .toHaveTextContent("false");
    await expect
      .element(screen.getByTestId("valid"))
      .toHaveTextContent("false");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await screen.getByText("Set last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("3");

    await screen.getByText("Set first name error").click();
    await screen.getByText("Set last name error").click();

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("5");

    await screen.getByText("Set same last name error").click();
    await screen.getByText("Set same last name error").click();

    await expect.element(screen.getByTestId("errors")).toHaveTextContent("2");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("5");

    await expect.element(screen.getByTestId("render-meta"));

    await screen.getByText("Rename").click();

    await expect
      .element(screen.getByTestId("full-name"))
      .toHaveTextContent("Sasha Koss");

    await expect.element(screen.getByTestId("dirty")).toHaveTextContent("true");
    await expect
      .element(screen.getByTestId("valid"))
      .toHaveTextContent("false");
    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("6");

    await screen.getByText("Clear errors").click();

    await expect.element(screen.getByTestId("dirty")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("valid")).toHaveTextContent("true");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("0");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("7");

    await screen.getByText("Set field error").click();

    await expect.element(screen.getByTestId("error")).toHaveTextContent("Nope");
    await expect.element(screen.getByTestId("errors")).toHaveTextContent("1");

    await expect
      .element(screen.getByTestId("render-meta"))
      .toHaveTextContent("8");
  });

  it("allows to compute value", async () => {
    function Component() {
      const count = useRenderCount();
      const field = Field.use<User>({ name: { first: "Alexander" } });
      const hasLastName = field.$.name.useCompute((name) => !!name.last);

      return (
        <div>
          <div data-testid="render-compute">{count}</div>

          <button
            onClick={() => field.$.name.$.first.set(`Sasha ${Math.random()}`)}
          >
            Rename first
          </button>

          <button onClick={() => field.$.name.setError("Nope")}>
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

  it("allows to decompose union field", async () => {
    interface ComponentProps {
      address: Address;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const address = Field.use<Address>(props.address);
      const name = address.$.name.useDecompose(
        (newName, prevName) => typeof newName !== typeof prevName
      );

      // [TODO] Figure out if that's a bug or intended behavior and adjust the API
      // accordingly: https://github.com/microsoft/TypeScript/issues/60685
      return (
        <div>
          <div data-testid="render-address">{count}</div>

          {typeof name.value === "string" ? (
            <div>
              <button
                onClick={() => (name.field as Field<string>).set("Alexander")}
              >
                Rename
              </button>

              <StringComponent string={name.field as Field<string>} />
            </div>
          ) : (
            <div>
              <input
                data-testid="input-name-first"
                {...(name.field as Field<UserName>).$.first.input()}
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

    const screen = render(
      <Component address={{ name: { first: "Alexander" } }} />
    );

    await expect
      .element(screen.getByTestId("name-0"))
      .toHaveTextContent("1Alexander");

    await userEvent.fill(screen.getByTestId("input-name-first"), "Sasha");

    await expect
      .element(screen.getByTestId("name-0"))
      .toHaveTextContent("2Sasha");

    await expect
      .element(screen.getByTestId("render-address"))
      .toHaveTextContent("1");

    await screen.getByText("Set string name").click();

    await expect.element(screen.getByTestId("name")).not.toBeInTheDocument();

    await expect
      .element(screen.getByTestId("string"))
      .toHaveTextContent("Alex");

    await screen.getByText("Rename").click();

    await expect
      .element(screen.getByTestId("string"))
      .toHaveTextContent("Alexander");

    await expect
      .element(screen.getByTestId("render-address"))
      .toHaveTextContent("2");
  });

  it("allows to narrow union field", async () => {
    interface ComponentProps {
      address: Address;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const address = Field.use<Address>(props.address);
      const nameStr = address.$.name.useNarrow(
        (name, ok) => typeof name === "string" && ok(name)
      );
      const nameObj = address.$.name.useNarrow(
        (name, ok) => typeof name !== "string" && ok(name)
      );

      return (
        <div>
          <div data-testid="render-address">{count}</div>

          {nameStr && (
            <div>
              <button onClick={() => nameStr.set("Alexander")}>Rename</button>
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

    const screen = render(
      <Component address={{ name: { first: "Alexander" } }} />
    );

    await expect
      .element(screen.getByTestId("name-0"))
      .toHaveTextContent("1Alexander");

    await screen.getByText("Rename first").click();

    await expect
      .element(screen.getByTestId("name-0"))
      .toHaveTextContent("2Sasha");

    await expect
      .element(screen.getByTestId("render-address"))
      .toHaveTextContent("1");

    await screen.getByText("Set string name").click();

    await expect.element(screen.getByTestId("name-0")).not.toBeInTheDocument();

    await expect
      .element(screen.getByTestId("string"))
      .toHaveTextContent("Alex");

    await screen.getByText("Rename").click();

    await expect
      .element(screen.getByTestId("string"))
      .toHaveTextContent("Alexander");

    await expect
      .element(screen.getByTestId("render-address"))
      .toHaveTextContent("2");
  });

  it("allows to discriminate union field", async () => {
    type Hello = HelloMachine | HelloHuman;

    interface HelloMachine {
      lang: "machine";
      binary: number;
    }

    interface HelloHuman {
      lang: "human";
      text: string;
    }

    interface TestState {
      hello: Hello;
    }

    interface ComponentProps {
      hello: Hello;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const field = Field.use<TestState>(props);
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
          )}
        </div>
      );
    }

    const screen = render(
      <Component hello={{ lang: "human", text: "Hello" }} />
    );

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

    await expect.element(screen.getByTestId("string")).not.toBeInTheDocument();

    await expect.element(screen.getByTestId("number")).toHaveTextContent("106");

    await screen.getByText("Say 1010101").click();

    await expect.element(screen.getByTestId("number")).toHaveTextContent("85");

    await expect
      .element(screen.getByTestId("render-hello"))
      .toHaveTextContent("2");
  });

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

    function toCodes(message: string) {
      return Array.from(message).map((c) => c.charCodeAt(0));
    }

    function fromCodes(codes: number[]) {
      return codes.map((c) => String.fromCharCode(c)).join("");
    }

    const screen = render(<Component />);

    await expect
      .element(screen.getByTestId("string"))
      .toHaveTextContent("Hello");

    await expect
      .element(screen.getByTestId("codes"))
      .toHaveTextContent("72 101 108 108 111");

    await screen.getByText("Say hi").click();

    await expect.element(screen.getByTestId("string")).toHaveTextContent("Hi");

    await expect
      .element(screen.getByTestId("codes"))
      .toHaveTextContent("72 105 33");

    await screen.getByText("Say yo").click();

    await expect.element(screen.getByTestId("string")).toHaveTextContent("Yo");

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

      <name.$.first.Control
        render={(control) => (
          <input
            data-testid={`name-first-${index}-input`}
            {...control}
            onChange={(event) => control.onChange(event.target.value)}
          />
        )}
      />

      <name.$.last.Control
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
        <field.$.first.Control
          render={(control) => (
            <input
              data-testid="input-name-first"
              {...control}
              onChange={(event) => control.onChange(event.target.value)}
            />
          )}
        />

        <field.$.last.Control
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

function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}
