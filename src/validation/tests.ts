import { describe, expect, it } from "vitest";
import { ValidationTree } from "./index.ts";

describe("ValidationTree", () => {
  describe("#at", () => {
    it("returns empty array for non-existent path", () => {
      const tree = new ValidationTree();
      expect(tree.at(["non", "existent"])).toEqual([]);
    });

    it("returns direct errors for the given path", () => {
      const tree = new ValidationTree();
      const error1 = { message: "Error 1" };
      const error2 = { message: "Error 2" };
      const error3 = { message: "Error 3" };
      tree.add(["a", "b"], error1);
      tree.add(["a", "b", "c"], error2);
      tree.add(["a", "b", "c"], error3);
      expect(tree.at(["a", "b"])).toEqual([error1]);
      expect(tree.at(["a", "b", "c"])).toEqual([error2, error3]);
    });
  });

  describe("#nested", () => {
    it("returns empty array for non-existent path", () => {
      const tree = new ValidationTree();
      expect(tree.nested(["non", "existent"])).toEqual([]);
    });

    it("returns all errors with paths at prefix path", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b", "c"], { message: "a" });
      tree.add(["a", "b", "d"], { message: "b" });
      tree.add(["a", "e"], { message: "c" });
      expect(tree.nested(["a"])).toEqual([
        [["a", "b", "c"], { message: "a" }],
        [["a", "b", "d"], { message: "b" }],
        [["a", "e"], { message: "c" }],
      ]);
      expect(tree.nested(["a", "b"])).toEqual([
        [["a", "b", "c"], { message: "a" }],
        [["a", "b", "d"], { message: "b" }],
      ]);
      expect(tree.nested(["a", "e"])).toEqual([[["a", "e"], { message: "c" }]]);
    });

    it("returns all errors for empty path", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b", "c"], { message: "a" });
      tree.add(["a", "b", "d"], { message: "b" });
      tree.add(["a", "e"], { message: "c" });
      expect(tree.nested([])).toEqual([
        [["a", "b", "c"], { message: "a" }],
        [["a", "b", "d"], { message: "b" }],
        [["a", "e"], { message: "c" }],
      ]);
    });
  });

  describe("#add", () => {
    it("inserts error at given path", () => {
      const tree = new ValidationTree();
      const error = { message: "Error message" };
      tree.add(["a", "b", "c"], error);
      expect(tree.at(["a", "b", "c"])[0]).toBe(error);
    });

    it("inserts error along the path", () => {
      const tree = new ValidationTree();
      const error = { message: "Error message" };
      tree.add(["a", "b", "c"], error);
      expect(tree.nested(["a"])[0]![1]).toBe(error);
      expect(tree.nested(["a", "b"])[0]![1]).toBe(error);
      expect(tree.nested(["a", "b", "c"])[0]![1]).toBe(error);
    });

    it("returns unique index", () => {
      const tree = new ValidationTree();
      expect(tree.add(["a", "b"], { message: "Error 1" })).toBe(0);
      expect(tree.add(["a", "b", "c"], { message: "Error 2" })).toBe(1);
      expect(tree.add(["a", "b"], { message: "Error 3" })).toBe(2);
    });
  });

  describe("#clear", () => {
    it("clears errors at the given path", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b", "c"], { message: "Error 1" });
      tree.add(["a", "b", "d"], { message: "Error 2" });
      tree.add(["e"], { message: "Error 3" });
      tree.clear(["a", "b"]);
      expect(tree.nested([])).toEqual([[["e"], { message: "Error 3" }]]);
    });

    it("allows to clear all errors", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b", "c"], { message: "Error 1" });
      tree.add(["a", "b", "d"], { message: "Error 2" });
      tree.add(["e"], { message: "Error 3" });
      tree.clear([]);
      expect(tree.nested([])).toHaveLength(0);
    });
  });
});
