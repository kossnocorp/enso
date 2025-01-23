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
  received = BigInt(received);
  expected = BigInt(expected);
  return `Expected the change to be:
  0b${devStringifyChanges(expected)} (${devHumanizeChanges(expected)})
...but got:
  0b${devStringifyChanges(received)} (${devHumanizeChanges(received)})`;
}
