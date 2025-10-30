import { expect } from "vitest";
import { devHumanizeChanges, devStringifyChanges } from "../src/dev.ts";
import { AtomChange } from "../src/index.ts";

expect.extend({
  toMatchChanges(received: unknown, expected: AtomChange) {
    if (typeof received !== "bigint") {
      return {
        pass: false,
        message: () =>
          `Expected a bigint, but received ${typeof received} instead.`,
      };
    }
    return {
      pass: received === expected,
      message: () => toMatchChangesMessage(received, expected),
    };
  },

  toReceiveChanges(received: any, expected: AtomChange) {
    let pass = false;
    const receivedChanges: AtomChange[] = [];
    for (const [_, event] of received.mock.calls) {
      if (event.changes !== expected) {
        receivedChanges.push(event.changes);
        continue;
      }
      pass = true;
      break;
    }
    return {
      pass,
      message: () => toReceiveChangesMessage(receivedChanges, expected),
    };
  },
});

function toMatchChangesMessage(received: any, expected: AtomChange) {
  return `${expectedChangesMessage("the change to be", expected)}
...but got:
  ${receivedChangesMessage(received)}`;
}

function toReceiveChangesMessage(received: AtomChange[], expected: AtomChange) {
  const receivedStr = received
    .map(
      (change, index) =>
        `  Call #${index + 1}:
  ${receivedChangesMessage(change)}`,
    )
    .join("\n");

  return `${expectedChangesMessage("to receive changes", expected)}
...but received:
${receivedStr || "  no changes received"}`;
}

function expectedChangesMessage(expectation: string, expected: AtomChange) {
  return `Expected ${expectation}:
  0b${devStringifyChanges(expected)} (${devHumanizeChanges(expected)})`;
}

function receivedChangesMessage(received: AtomChange | undefined) {
  const receivedN = BigInt(received || 0);
  return received === undefined
    ? "undefined"
    : `0b${devStringifyChanges(receivedN)} (${devHumanizeChanges(receivedN)})`;
}
