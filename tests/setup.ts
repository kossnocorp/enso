import { expect, Mock } from "vitest";
import { devHumanizeChanges, devStringifyChanges } from "../src/dev.ts";
import { Field, FieldChange } from "../src/index.ts";

expect.extend({
  toMatchChanges(received: FieldChange, expected: FieldChange) {
    return {
      pass: received === expected,
      message: () => toMatchChangesMessage(received, expected),
    };
  },

  toReceiveChanges(received: any, expected: FieldChange) {
    let pass = false;
    const receivedChanges: FieldChange[] = [];
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

function toMatchChangesMessage(received: any, expected: FieldChange) {
  return `${expectedChangesMessage("the change to be", expected)}
...but got:
  ${receivedChangesMessage(received)}`;
}

function toReceiveChangesMessage(
  received: FieldChange[],
  expected: FieldChange,
) {
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

function expectedChangesMessage(expectation: string, expected: FieldChange) {
  return `Expected ${expectation}:
  0b${devStringifyChanges(expected)} (${devHumanizeChanges(expected)})`;
}

function receivedChangesMessage(received: FieldChange | undefined) {
  const receivedN = BigInt(received || 0);
  return received === undefined
    ? "undefined"
    : `0b${devStringifyChanges(receivedN)} (${devHumanizeChanges(receivedN)})`;
}
