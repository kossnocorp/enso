import React, { useRef } from "react";
import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import "@vitest/browser/matchers.d.ts";
import { State } from "./index.ts";

describe("state", () => {
  describe("browser", () => {
    it("allows to watch updates in isolation", async () => {
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
  });
});

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
  const user = props.user.use();
  return (
    <div>
      <div data-testid="render-user">{count}</div>
      <button onClick={() => user.$.name.$.first.set("Sasha")}>
        Rename first
      </button>
      <div data-testid="has-last">{user.$.name.get() ? "true" : "false"}</div>
      <UserNameComponent name={user.$.name} />
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
    <div>
      <div data-testid="render-name">{count}</div>
      <div data-testid="name-first">{first}</div>
      <div data-testid="name-last">{last}</div>
    </div>
  );
}

function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}
