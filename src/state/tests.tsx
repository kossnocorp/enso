import React from "react";
import { render } from "vitest-browser-react";
import { expect, test } from "vitest";
// [TODO] Figure out a way to get rid of it:
// https://github.com/vitest-dev/vitest/issues/6965
import "@vitest/browser/matchers.d.ts";

test("counter button increments the count", async () => {
  const screen = render(<Component count={1} />);

  await screen.getByRole("button", { name: "Increment" }).click();

  await expect.element(screen.getByText("Count is 2")).toBeVisible();
});

function Component({ count }: { count: number }) {
  const [state, setState] = React.useState(count);

  return (
    <div>
      <button onClick={() => setState(state + 1)}>Increment</button>
      <p>Count is {state}</p>
    </div>
  );
}
