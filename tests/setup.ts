import { expect } from "vitest";
import { devHumanizeChanges, devStringifyChanges } from "../src/dev.ts";

expect.extend({
  toMatchChanges(received, expected) {
    return {
      pass: received === expected,
      message: () => toMatchChangesMessage(received, expected),
    };
  },
});

function toMatchChangesMessage(received: any, expected: any) {
  const receivedN = BigInt(received || 0);
  expected = BigInt(expected);
  const receivedStr =
    received === undefined
      ? "undefined"
      : `0b${devStringifyChanges(receivedN)} (${devHumanizeChanges(receivedN)})`;
  return `Expected the change to be:
  0b${devStringifyChanges(expected)} (${devHumanizeChanges(expected)})
...but got:
  ${receivedStr}`;
}
