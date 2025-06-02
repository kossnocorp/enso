import { describe, expect, it } from "vitest";
import { ValidationTree } from "./index.ts";

describe(ValidationTree, () => {
  describe(ValidationTree.prototype.at, () => {
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
      tree.set(["a", "b", "c"], error2);
      tree.add(["a", "b", "c"], error3);
      expect(tree.at(["a", "b"])).toEqual([error1]);
      expect(tree.at(["a", "b", "c"])).toEqual([error2, error3]);
    });
  });

  describe(ValidationTree.prototype.nested, () => {
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
        [["b", "c"], { message: "a" }],
        [["b", "d"], { message: "b" }],
        [["e"], { message: "c" }],
      ]);
      expect(tree.nested(["a", "b"])).toEqual([
        [["c"], { message: "a" }],
        [["d"], { message: "b" }],
      ]);
      expect(tree.nested(["a", "e"])).toEqual([[[], { message: "c" }]]);
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

    it("reuses references for the same path", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b"], { message: "a" });
      tree.add(["a", "b"], { message: "b" });
      const errors = tree.nested([]);
      expect(errors).toHaveLength(2);
      expect(errors[0]![0]).toEqual(["a", "b"]);
      expect(errors[0]![0]).toBe(errors[1]![0]);
    });
  });

  describe(ValidationTree.prototype.add, () => {
    it("inserts error at given path", () => {
      const tree = new ValidationTree();
      const error = { message: "Error message" };
      tree.add(["a", "b", "c"], error);
      expect(tree.nested(["a", "b", "c"])[0]![1]).toBe(error);
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

  describe(ValidationTree.prototype.set, () => {
    it("sets error at given path", () => {
      const tree = new ValidationTree();
      const error = { message: "Error message" };
      tree.set(["a", "b", "c"], error);
      expect(tree.nested(["a", "b", "c"])[0]![1]).toBe(error);
    });

    it("overwrites existing errors at path", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b", "c"], { message: "Old error" });
      const newError = { message: "New error" };
      tree.set(["a", "b", "c"], newError);
      const errors = tree.nested(["a", "b", "c"]);
      expect(errors[0]![1]).toBe(newError);
      expect(errors).toHaveLength(1);
    });

    it("overwrites existing errors along the path", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b", "c"], { message: "Old error" });
      const newError = { message: "New error" };
      tree.set(["a", "b", "c"], newError);
      expect(tree.nested(["a"])).toEqual([
        [["b", "c"], { message: "New error" }],
      ]);
      expect(tree.nested(["a", "b"])).toEqual([
        [["c"], { message: "New error" }],
      ]);
    });
  });

  describe(ValidationTree.prototype.clear, () => {
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

  describe(ValidationTree.prototype.reset, () => {
    it("resets the tree", () => {
      const tree = new ValidationTree();
      tree.add(["a", "b"], { message: "Error" });
      expect(tree.nested(["a", "b"])).toHaveLength(1);
      tree.reset();
      expect(tree.nested(["a", "b"])).toHaveLength(0);
    });

    it("preserves the index after reset", () => {
      const tree = new ValidationTree();
      let index = tree.add(["a", "b"], { message: "Error" });
      expect(index).toBe(0);
      tree.reset();
      index = tree.add(["a", "b"], { message: "Error" });
      expect(index).toBe(1);
    });
  });
});
