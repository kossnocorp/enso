// @ts-nocheck

import { describe, expect, it, vi } from "vitest";
import { Field } from "../../index.js";
import { FieldRefGhost } from "./index.js";

describe.skip(FieldRefGhost, () => {
  describe("type", () => {
    describe("collection", () => {
      describe(FieldRefGhost.prototype.forEach, () => {
        describe(Array, () => {
          it("iterates items", () => {
            const field = new Field([1, 2, 3]);
            const ref = new FieldRefGhost({ type: "direct", field });
            const mapped: [number, number][] = [];
            ref.forEach((item, index) => {
              mapped.push([index, item.get() * 2]);
              expect(item).toBeInstanceOf(FieldRefGhost);
            });
            expect(mapped).toEqual([
              [0, 2],
              [1, 4],
              [2, 6],
            ]);
          });
        });

        describe(Object, () => {
          it("iterates items and keys", () => {
            const field = new Field({ a: 1, b: 2, c: 3 });
            const ref = new FieldRefGhost({ type: "direct", field });
            const mapped: [string, number][] = [];
            ref.forEach((item, key) => {
              mapped.push([key, item.get()]);
              expect(item).toBeInstanceOf(FieldRefGhost);
            });
            expect(mapped).toEqual([
              ["a", 1],
              ["b", 2],
              ["c", 3],
            ]);
          });
        });
      });
    });
  });
});
