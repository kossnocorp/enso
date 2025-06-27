import { describe, expect, it } from "vitest";
import { fieldEach, fieldMap } from "./index.ts";
import { Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";

describe(fieldEach, () => {
  describe("array fields", () => {
    const field = new Field([1, 2, 3]);

    it("iterates items", () => {
      const mapped: [number, number][] = [];
      fieldEach(field, (item, index) => mapped.push([index, item.get() * 2]));
      expect(mapped).toEqual([
        [0, 2],
        [1, 4],
        [2, 6],
      ]);
    });

    it("iterates FieldRef", () => {
      const ref = new FieldRef(field);
      const mapped: [number, number][] = [];
      fieldEach(ref, (item, index) => mapped.push([index, item.get() * 2]));
      expect(mapped).toEqual([
        [0, 2],
        [1, 4],
        [2, 6],
      ]);
    });

    it("iterates MaybeFieldRef", () => {
      const ref = new MaybeFieldRef({ type: "direct", field });
      const mapped: [number, number][] = [];
      fieldEach(ref, (item, index) => mapped.push([index, item.get() * 2]));
      expect(mapped).toEqual([
        [0, 2],
        [1, 4],
        [2, 6],
      ]);
    });
  });

  describe("object fields", () => {
    const field = new Field({ a: 1, b: 2, c: 3 });

    it("iterates items and keys", () => {
      const mapped: [string, number][] = [];
      fieldEach(field, (item, key) => mapped.push([key, item.get()]));
      expect(mapped).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });

    it("iterates FieldRef", () => {
      const ref = new FieldRef(field);
      const mapped: [string, number][] = [];
      fieldEach(ref, (item, key) => mapped.push([key, item.get()]));
      expect(mapped).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });

    it("iterates MaybeFieldRef", () => {
      const ref = new MaybeFieldRef({ type: "direct", field });
      const mapped: [string, number][] = [];
      fieldEach(ref, (item, key) => mapped.push([key, item.get()]));
      expect(mapped).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });
  });
});

describe(fieldMap, () => {
  describe("array fields", () => {
    const field = new Field([1, 2, 3]);

    it("maps items", () => {
      const mapped = fieldMap(field, (item, index) => [index, item.get() * 2]);
      expect(mapped).toEqual([
        [0, 2],
        [1, 4],
        [2, 6],
      ]);
    });

    it("maps FieldRef", () => {
      const ref = new FieldRef(field);
      const mapped = fieldMap(ref, (item, index) => [index, item.get() * 2]);
      expect(mapped).toEqual([
        [0, 2],
        [1, 4],
        [2, 6],
      ]);
    });

    it("maps MaybeFieldRef", () => {
      const ref = new MaybeFieldRef({ type: "direct", field });
      const mapped = fieldMap(ref, (item, index) => [index, item.get() * 2]);
      expect(mapped).toEqual([
        [0, 2],
        [1, 4],
        [2, 6],
      ]);
    });
  });

  describe("object fields", () => {
    const field = new Field({ a: 1, b: 2, c: 3 });

    it("maps items and keys", () => {
      const mapped = fieldMap(field, (item, key) => [key, item.get()]);
      expect(mapped).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });

    it("maps FieldRef", () => {
      const ref = new FieldRef(field);
      const mapped = fieldMap(ref, (item, key) => [key, item.get()]);
      expect(mapped).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });

    it("maps MaybeFieldRef", () => {
      const ref = new MaybeFieldRef({ type: "direct", field });
      const mapped = fieldMap(ref, (item, key) => [key, item.get()]);
      expect(mapped).toEqual([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
    });
  });
});
