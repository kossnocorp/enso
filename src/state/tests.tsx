import React, { useRef } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import "@vitest/browser/matchers.d.ts";
import { State } from "./index.ts";
import { userEvent } from "@vitest/browser/context";

describe("state", () => {
  describe("browser", () => {
    it("allows to control object state", async () => {
      const screen = render(
        <ProfileComponent
          profile={{ user: { name: { first: "Alexander" } } }}
        />
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
      const screen = render(
        <UserNamesComponent names={[{ first: "Alexander" }]} />
      );

      await userEvent.fill(screen.getByTestId("input-name-first"), "Sasha");
      await userEvent.fill(screen.getByTestId("input-name-last"), "Koss");
      await screen.getByText("Add name").click();

      await expect
        .element(screen.getByTestId("name-1"))
        .toHaveTextContent("1SashaKossRemove");

      await screen.getByTestId("remove-1").click();

      await expect
        .element(screen.getByTestId("name-1"))
        .not.toBeInTheDocument();

      await expect
        .element(screen.getByTestId("render-names"))
        .toHaveTextContent("3");
    });

    it("allows to decompose union state", async () => {
      const screen = render(
        <AddressComponent address={{ name: { first: "Alexander" } }} />
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

interface ProfileComponentProps {
  profile: Profile;
}

function ProfileComponent(props: ProfileComponentProps) {
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

interface UserNamesComponentProps {
  names: UserName[];
}

function UserNamesComponent(props: UserNamesComponentProps) {
  const count = useRenderCount();
  const state = State.use({ names: props.names });
  const names = state.$.names.use();

  return (
    <div>
      <div data-testid="render-names">{count}</div>

      {names.map((name, index) => (
        <div data-testid={`name-${index}`} key={name.id}>
          <UserNameComponent name={name} />
          <button onClick={() => name.remove()} data-testid={`remove-${index}`}>
            Remove
          </button>
        </div>
      ))}

      <UserNameFormComponent onAdd={(name) => names.push(name)} />
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

interface AddressComponentProps {
  address: Address;
}

function AddressComponent(props: AddressComponentProps) {
  const count = useRenderCount();
  const address = State.use<Address>(props.address);
  const name = address.$.name.useDecompose(
    (newName, prevName) => typeof newName !== typeof prevName
  );

  return (
    <div>
      <div data-testid="render-address">{count}</div>

      {typeof name.value === "string" ? (
        <div>
          <button onClick={() => name.state.set("Alexander")}>Rename</button>
          <StringComponent string={name.state} />
        </div>
      ) : (
        <div>
          <button onClick={() => name.state.$.first.set("Sasha")}>
            Rename first
          </button>

          <button onClick={() => address.$.name.set("Alex")}>
            Set string name
          </button>

          <UserNameComponent name={name.state} />
        </div>
      )}
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

function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}
