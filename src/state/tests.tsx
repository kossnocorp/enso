import React, { useRef } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import "@vitest/browser/matchers.d.ts";
import { State } from "./index.ts";
import { userEvent } from "@vitest/browser/context";

describe("state", () => {
  it("allows to control object state", async () => {
    interface ComponentProps {
      profile: Profile;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const profile = State.use<Profile>(props.profile);

      return (
        <div>
          <div data-testid="render-profile">{count}</div>
          <button onClick={() => profile.$.user.$.name.$.last.set("Koss")}>
            Rename last
          </button>
          <UserComponent user={profile.$.user} />
        </div>
      );
    }

    const screen = render(
      <Component profile={{ user: { name: { first: "Alexander" } } }} />
    );

    await screen.getByText("Rename first").click();
    await screen.getByText("Rename last").click();

    await expect
      .element(screen.getByTestId("name-first"))
      .toHaveTextContent("Sasha");
    await expect
      .element(screen.getByTestId("name-last"))
      .toHaveTextContent("Koss");

    await expect
      .element(screen.getByTestId("render-profile"))
      .toHaveTextContent("1");
    await expect
      .element(screen.getByTestId("render-user"))
      .toHaveTextContent("2");
    await expect
      .element(screen.getByTestId("render-name"))
      .toHaveTextContent("3");
  });

  it("allows to control array state", async () => {
    interface ComponentProps {
      names: UserName[];
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const state = State.use({ names: props.names });
      const names = state.$.names.use();

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

          <UserNameFormComponent onAdd={(name) => names.push(name)} />
        </div>
      );
    }

    const screen = render(<Component names={[{ first: "Alexander" }]} />);

    await userEvent.fill(screen.getByTestId("input-name-first"), "Sasha");
    await userEvent.fill(screen.getByTestId("input-name-last"), "Koss");
    await screen.getByText("Add name").click();

    await expect
      .element(screen.getByTestId("name-1"))
      .toHaveTextContent("1SashaKossRemove");

    await screen.getByTestId("remove-1").click();

    await expect.element(screen.getByTestId("name-1")).not.toBeInTheDocument();

    await expect
      .element(screen.getByTestId("render-names"))
      .toHaveTextContent("3");
  });

  it("allows to decompose union state", async () => {
    interface ComponentProps {
      address: Address;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const address = State.use<Address>(props.address);
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
                onClick={() => (name.state as State<string>).set("Alexander")}
              >
                Rename
              </button>
              <StringComponent string={name.state as State<string>} />
            </div>
          ) : (
            <div>
              <button
                onClick={() =>
                  (name.state as State<UserName>).$.first.set("Sasha")
                }
              >
                Rename first
              </button>

              <button onClick={() => address.$.name.set("Alex")}>
                Set string name
              </button>

              <UserNameComponent name={name.state as State<UserName>} />
            </div>
          )}
        </div>
      );
    }

    const screen = render(
      <Component address={{ name: { first: "Alexander" } }} />
    );

    await expect
      .element(screen.getByTestId("name"))
      .toHaveTextContent("1Alexander");

    await screen.getByText("Rename first").click();

    await expect
      .element(screen.getByTestId("name"))
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

  it("allows to narrow union state", async () => {
    interface ComponentProps {
      address: Address;
    }

    function Component(props: ComponentProps) {
      const count = useRenderCount();
      const address = State.use<Address>(props.address);
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
      .element(screen.getByTestId("name"))
      .toHaveTextContent("1Alexander");

    await screen.getByText("Rename first").click();

    await expect
      .element(screen.getByTestId("name"))
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

  it("allows to discriminate union state", async () => {
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
      const state = State.use<TestState>(props);
      const hello = state.$.hello.useDiscriminate("lang");

      return (
        <div>
          <div data-testid="render-hello">{count}</div>

          {hello.discriminator === "human" ? (
            <div>
              <button
                onClick={() =>
                  hello.state.set({
                    lang: "human",
                    text: "Hola",
                  })
                }
              >
                Say hola
              </button>

              <button
                onClick={() =>
                  state.$.hello.set({
                    lang: "machine",
                    binary: 0b1101010,
                  })
                }
              >
                Switch to binary
              </button>

              <StringComponent string={hello.state.$.text} />
            </div>
          ) : (
            <div>
              <button
                onClick={() =>
                  state.$.hello.set({
                    lang: "machine",
                    binary: 0b1010101,
                  })
                }
              >
                Say 1010101
              </button>

              <NumberComponent number={hello.state.$.binary} />
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

  it("allows to compute state", async () => {
    function Component() {
      const count = useRenderCount();
      const state = State.use({ message: "Hello" });
      const codes = state.$.message.useInto(toCodes).from(fromCodes);

      return (
        <div>
          <div data-testid="render-compute">{count}</div>

          <StringComponent string={state.$.message} />

          <CodesComponent codes={codes} />

          <button onClick={() => codes.set([72, 105, 33])}>Say hi</button>

          <button onClick={() => state.$.message.set("Yo")}>Say yo</button>
        </div>
      );
    }

    interface CodesComponentProps {
      codes: State<number[]>;
    }

    function CodesComponent(props: CodesComponentProps) {
      const count = useRenderCount();
      const codes = props.codes.useWatch();
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
  user: State<User>;
}

function UserComponent(props: UserComponentProps) {
  const count = useRenderCount();
  const user = props.user;
  // Makes the component re-render when the name shape changes
  const name = user.$.name.use();
  return (
    <div>
      <div data-testid="render-user">{count}</div>
      <button onClick={() => user.$.name.$.first.set("Sasha")}>
        Rename first
      </button>
      <div data-testid="has-last">{user.$.name.get() ? "true" : "false"}</div>
      <UserNameComponent name={name} />
    </div>
  );
}

interface UserNameComponentProps {
  name: State<UserName>;
}

function UserNameComponent(props: UserNameComponentProps) {
  const count = useRenderCount();
  const { first, last } = props.name.useWatch();
  return (
    <div data-testid="name">
      <div data-testid="render-name">{count}</div>
      <div data-testid="name-first">{first}</div>
      <div data-testid="name-last">{last}</div>
    </div>
  );
}

interface UserNameFormComponentProps {
  onAdd: (name: UserName) => void;
}

function UserNameFormComponent(props: UserNameFormComponentProps) {
  const count = useRenderCount();
  const form = State.use<UserName>({ first: "", last: "" });

  return (
    <div>
      <div data-testid="render-name-form">{count}</div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          props.onAdd(form.get());
        }}
      >
        <input
          type="text"
          name="first"
          data-testid="input-name-first"
          required
          onChange={(event) => form.$.first.set(event.target.value)}
        />

        <input
          type="text"
          name="last"
          data-testid="input-name-last"
          onChange={(event) => form.$.last.set(event.target.value)}
        />

        <button type="submit">Add name</button>
      </form>
    </div>
  );
}

interface StringComponentProps {
  string: State<string>;
}

function StringComponent(props: StringComponentProps) {
  const count = useRenderCount();
  const string = props.string.useWatch();
  return (
    <div>
      <div data-testid="render-string">{count}</div>
      <div data-testid="string">{string}</div>
    </div>
  );
}

interface NumberComponentProps {
  number: State<number>;
}

function NumberComponent(props: NumberComponentProps) {
  const count = useRenderCount();
  const number = props.number.useWatch();
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
