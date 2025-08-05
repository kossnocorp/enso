import { describe, expect, it, vi } from "vitest";
import { postpone } from "../../tests/utils.ts";
import { change } from "../change/index.ts";
import { Field } from "../field/index.js";
import { EventsTree } from "./index.ts";

describe("EventsTree", () => {
  describe("#at", () => {
    it("returns empty array for non-existent path", () => {
      const tree = new EventsTree<"field">();
      expect(tree.at(["non", "existent"])).toEqual([]);
    });

    it("returns fields for the given path", () => {
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      const field3 = new Field(3);
      tree.add(["a", "b"], field1);
      tree.add(["a", "b", "c"], field2);
      tree.add(["a", "b", "c"], field3);
      expect(tree.at(["a", "b"])).toEqual([field1]);
      expect(tree.at(["a", "b", "c"])).toEqual([field2, field3]);
    });
  });

  describe("#traverse", () => {
    it("traverses the tree in backward order", () => {
      let count = 0;
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      const field3 = new Field(3);
      tree.add(["a"], field1 as any as Field<any>);
      tree.add(["a", "b"], field2 as any as Field<any>);
      tree.add(["a", "b", "c"], field3 as any as Field<any>);
      tree.traverse(["a", "b", "c", "d"], (path, node) => {
        switch (count) {
          case 0:
            expect(path).toEqual(["a", "b", "c", "d"]);
            expect(node).toEqual([]);
            break;
          case 1:
            expect(path).toEqual(["a", "b", "c"]);
            expect(node).toEqual([field3]);
            break;
          case 2:
            expect(path).toEqual(["a", "b"]);
            expect(node).toEqual([field2]);
            break;
          case 3:
            expect(path).toEqual(["a"]);
            expect(node).toEqual([field1]);
            break;
          case 4:
            expect(path).toEqual([]);
            expect(node).toEqual([]);
            break;
        }
        count++;
      });
      expect(count).toBe(5);
    });

    it("does not trip on empty keys", () => {
      let count = 0;
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      const field3 = new Field(3);
      tree.add([], field1 as any as Field<any>);
      tree.add(["a"], field2 as any as Field<any>);
      tree.add(["a", ""], field3 as any as Field<any>);
      tree.traverse(["a", "", "c"], (path, node) => {
        switch (count) {
          case 0:
            expect(path).toEqual(["a", "", "c"]);
            expect(node).toEqual([]);
            break;
          case 1:
            expect(path).toEqual(["a", ""]);
            expect(node).toEqual([field3]);
            break;
          case 2:
            expect(path).toEqual(["a"]);
            expect(node).toEqual([field2]);
            break;
          case 3:
            expect(path).toEqual([]);
            expect(node).toEqual([field1]);
            break;
            break;
        }
        count++;
      });
      expect(count).toBe(4);
    });
  });

  describe("#add", () => {
    it("inserts error at given path", () => {
      const tree = new EventsTree<"field">();
      const field = new Field(123);
      tree.add(["a", "b", "c"], field);
      expect(tree.at(["a", "b", "c"])[0]).toBe(field);
    });
  });

  describe("#delete", () => {
    it("returns false for non-existent path", () => {
      const tree = new EventsTree<"field">();
      const field = new Field(1);
      expect(tree.delete(["non", "existent"], field)).toBe(false);
    });

    it("returns false for existing path but non-existent field", () => {
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      tree.add(["a", "b"], field1 as any as Field<any>);
      expect(tree.delete(["a", "b"], field2 as any as Field<any>)).toBe(false);
    });

    it("deletes field from the given path and returns true", () => {
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      tree.add(["a", "b"], field1 as any as Field<any>);
      tree.add(["a", "b"], field2 as any as Field<any>);

      expect(tree.at(["a", "b"]).length).toBe(2);
      expect(tree.delete(["a", "b"], field1 as any as Field<any>)).toBe(true);
      expect(tree.at(["a", "b"]).length).toBe(1);
      expect(tree.at(["a", "b"])[0]).toBe(field2);
    });
  });

  describe("#move", () => {
    it("returns false for non-existent path", () => {
      const tree = new EventsTree<"field">();
      const field = new Field(1);
      expect(tree.move(["non", "existent"], ["new", "path"], field)).toBe(
        false,
      );
    });

    it("returns false for existing path but non-existent field", () => {
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      tree.add(["a", "b"], field1);
      expect(tree.move(["a", "b"], ["new", "path"], field2)).toBe(false);
    });

    it("moves field from one path to another and returns true", () => {
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      tree.add(["a", "b"], field1 as any as Field<any>);
      tree.add(["a", "b"], field2 as any as Field<any>);

      expect(tree.at(["a", "b"]).length).toBe(2);
      expect(
        tree.move(["a", "b"], ["new", "path"], field1 as any as Field<any>),
      ).toBe(true);
      expect(tree.at(["a", "b"]).length).toBe(1);
      expect(tree.at(["new", "path"])[0]).toBe(field1);
    });
  });

  describe("#trigger", () => {
    it("triggers an event on the field", async () => {
      const tree = new EventsTree<"field">();
      const field = new Field("Hello, world!");
      const spy = vi.fn();
      field.watch(spy);
      tree.add(["a", "b"], field);
      tree.trigger(["a"], change.field.valid);
      tree.trigger(["a", "c"], change.field.shape);
      tree.trigger(["a", "b"], change.field.value);
      tree.trigger(["a", "b"], change.field.blur);
      await postpone();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toReceiveChanges(change.field.blur | change.field.value);
    });

    it("bubbles events up the tree", async () => {
      const tree = new EventsTree<"field">();
      const field1 = new Field(1);
      const field2 = new Field(2);
      const field3 = new Field(3);
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      const spy3 = vi.fn();
      field1.watch(spy1);
      field2.watch(spy2);
      field3.watch(spy3);
      tree.add([], field1);
      tree.add(["a"], field2);
      tree.add(["a", "b"], field3);
      tree.trigger([], change.field.commit);
      tree.trigger(["a"], change.field.valid);
      tree.trigger(["a", "b"], change.field.value);
      await postpone();
      expect(spy1).toHaveBeenCalledOnce();
      expect(spy1).toReceiveChanges(
        change.field.commit | change.child.valid | change.subtree.value,
      );
      expect(spy2).toHaveBeenCalledOnce();
      expect(spy2).toReceiveChanges(change.field.valid | change.child.value);
      expect(spy3).toHaveBeenCalledOnce();
      expect(spy3).toReceiveChanges(change.field.value);
    });

    describe(Field, () => {
      it("supports object field paths", async () => {
        const field = new Field({ stuff: { a: 1, b: 2 } });
        const rootSpy = vi.fn();
        field.watch(rootSpy);
        const stuffSpy = vi.fn();
        field.$.stuff.watch(stuffSpy);
        const valueASpy = vi.fn();
        field.$.stuff.$.a.watch(valueASpy);
        const valueBSpy = vi.fn();
        field.$.stuff.$.b.watch(valueBSpy);
        field.events.trigger(field.$.stuff.$.a.path, change.field.valid);
        await postpone();
        expect(rootSpy).toHaveBeenCalledOnce();
        expect(rootSpy).toReceiveChanges(change.subtree.valid);
        expect(stuffSpy).toHaveBeenCalledOnce();
        expect(stuffSpy).toHaveBeenCalledBefore(rootSpy);
        expect(stuffSpy).toReceiveChanges(change.child.valid);
        expect(valueASpy).toHaveBeenCalledOnce();
        expect(valueASpy).toHaveBeenCalledBefore(stuffSpy);
        expect(valueASpy).toReceiveChanges(change.field.valid);
        expect(valueBSpy).not.toHaveBeenCalled();
      });

      it.skip("supports array field paths", async () => {
        const field = new Field({ items: [1, 2] });
        const rootSpy = vi.fn();
        field.watch(rootSpy);
        const itemsSpy = vi.fn();
        field.$.items.watch(itemsSpy);
        const value1Spy = vi.fn();
        field.$.items.at(0).watch(value1Spy);
        const value2Spy = vi.fn();
        field.$.items.at(1).watch(value2Spy);
        field.events.trigger(field.$.items.at(0).path, change.field.valid);
        await postpone();
        expect(rootSpy).toHaveBeenCalledOnce();
        expect(rootSpy).toReceiveChanges(change.subtree.valid);
        expect(itemsSpy).toHaveBeenCalledOnce();
        expect(itemsSpy).toHaveBeenCalledBefore(rootSpy);
        expect(itemsSpy).toReceiveChanges(change.child.valid);
        expect(value1Spy).toHaveBeenCalledOnce();
        expect(value1Spy).toHaveBeenCalledBefore(itemsSpy);
        expect(value1Spy).toReceiveChanges(change.field.valid);
        expect(value2Spy).not.toHaveBeenCalled();
      });
    });
  });
});
