import { describe, expect, it, vi } from "vitest";
import { change, ChangesEvent } from "./index.ts";

describe("ChangesEvent", () => {
  describe("batch", () => {
    it("batches events", () =>
      new Promise((resolve) => {
        const targetA = new EventTarget();
        const spyA = vi.fn();
        targetA.addEventListener("change", spyA);

        const targetB = new EventTarget();
        const spyB = vi.fn();
        targetB.addEventListener("change", spyB);

        ChangesEvent.batch(targetA, change.field.type);
        ChangesEvent.batch(targetA, change.field.valid);
        ChangesEvent.batch(targetA, change.field.commit);

        ChangesEvent.batch(targetB, change.field.key);
        ChangesEvent.batch(targetB, change.field.shape);

        expect(spyA).not.toHaveBeenCalled();
        expect(spyB).not.toHaveBeenCalled();

        setTimeout(() => {
          expect(spyA).toHaveBeenCalledTimes(1);
          const [[eventA]]: any = spyA.mock.calls;
          expect(eventA.changes).toMatchChanges(
            change.field.type | change.field.valid | change.field.commit
          );
          expect(spyB).toHaveBeenCalledTimes(1);
          const [[eventB]]: any = spyB.mock.calls;
          expect(eventB.changes).toMatchChanges(
            change.field.key | change.field.shape
          );
          resolve(void 0);
        });
      }));

    it("cancels out valid/invalid", () =>
      new Promise((resolve, reject) => {
        const targetA = new EventTarget();
        const spyA = vi.fn();
        targetA.addEventListener("change", spyA);

        const targetB = new EventTarget();
        const spyB = vi.fn();
        targetB.addEventListener("change", spyB);

        ChangesEvent.batch(targetA, change.field.valid);
        ChangesEvent.batch(targetA, change.field.invalid);
        ChangesEvent.batch(targetA, change.field.valid);
        ChangesEvent.batch(targetA, change.child.valid);
        ChangesEvent.batch(targetA, change.child.invalid);
        ChangesEvent.batch(targetA, change.subtree.valid);
        ChangesEvent.batch(targetA, change.subtree.invalid);

        ChangesEvent.batch(targetB, change.field.valid);
        ChangesEvent.batch(targetB, change.field.invalid);
        ChangesEvent.batch(targetB, change.child.valid);
        ChangesEvent.batch(targetB, change.child.invalid);
        ChangesEvent.batch(targetB, change.subtree.valid);
        ChangesEvent.batch(targetB, change.subtree.invalid);

        setTimeout(() => {
          try {
            expect(spyA).toHaveBeenCalledTimes(1);
            const [[eventA]]: any = spyA.mock.calls;
            expect(eventA.changes).toMatchChanges(
              change.field.valid |
                change.child.valid |
                change.child.invalid |
                change.subtree.valid |
                change.subtree.invalid
            );
            expect(spyB).toHaveBeenCalledTimes(1);
            const [[eventB]]: any = spyB.mock.calls;
            expect(eventB.changes).toMatchChanges(
              change.field.invalid |
                change.child.valid |
                change.child.invalid |
                change.subtree.valid |
                change.subtree.invalid
            );
            resolve(void 0);
          } catch (err) {
            reject(err);
          }
        });
      }));

    it("cancels out attach/detach", () =>
      new Promise((resolve, reject) => {
        const targetA = new EventTarget();
        const spyA = vi.fn();
        targetA.addEventListener("change", spyA);

        const targetB = new EventTarget();
        const spyB = vi.fn();
        targetB.addEventListener("change", spyB);

        ChangesEvent.batch(targetA, change.field.attach);
        ChangesEvent.batch(targetA, change.field.detach);
        ChangesEvent.batch(targetA, change.field.attach);
        ChangesEvent.batch(targetA, change.child.attach);
        ChangesEvent.batch(targetA, change.child.detach);
        ChangesEvent.batch(targetA, change.subtree.attach);
        ChangesEvent.batch(targetA, change.subtree.detach);

        ChangesEvent.batch(targetB, change.field.attach);
        ChangesEvent.batch(targetB, change.field.detach);
        ChangesEvent.batch(targetB, change.child.attach);
        ChangesEvent.batch(targetB, change.child.detach);
        ChangesEvent.batch(targetB, change.subtree.attach);
        ChangesEvent.batch(targetB, change.subtree.detach);

        setTimeout(() => {
          try {
            expect(spyA).toHaveBeenCalledTimes(1);
            const [[eventA]]: any = spyA.mock.calls;
            expect(eventA.changes).toMatchChanges(
              change.field.attach |
                change.child.attach |
                change.child.detach |
                change.subtree.attach |
                change.subtree.detach
            );
            expect(spyB).toHaveBeenCalledTimes(1);
            const [[eventB]]: any = spyB.mock.calls;
            expect(eventB.changes).toMatchChanges(
              change.field.detach |
                change.child.attach |
                change.child.detach |
                change.subtree.attach |
                change.subtree.detach
            );
            resolve(void 0);
          } catch (err) {
            reject(err);
          }
        });
      }));
  });

  describe("sync", () => {
    it("forces batched events to fire immediately", () => {
      const targetA = new EventTarget();
      const spyA = vi.fn();
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.sync(() => {
        ChangesEvent.batch(targetA, change.field.type);
        ChangesEvent.batch(targetA, change.field.valid);
        ChangesEvent.batch(targetA, change.field.commit);
      });

      ChangesEvent.batch(targetB, change.field.key);
      ChangesEvent.batch(targetB, change.field.shape);

      expect(spyA).toHaveBeenCalledTimes(3);
      expect(spyB).not.toHaveBeenCalled();
    });
  });

  describe("context", () => {
    it("allows to specify context for the events", () =>
      new Promise((resolve) => {
        const targetA = new EventTarget();
        const spyA = vi.fn();
        targetA.addEventListener("change", spyA);

        const targetB = new EventTarget();
        const spyB = vi.fn();
        targetB.addEventListener("change", spyB);

        ChangesEvent.context({ hello: "world" }, () => {
          ChangesEvent.batch(targetA, change.field.type);
          ChangesEvent.batch(targetA, change.field.valid);
        });

        ChangesEvent.batch(targetB, change.field.key);

        expect(spyA).not.toHaveBeenCalled();
        expect(spyB).not.toHaveBeenCalled();

        setTimeout(() => {
          const [[eventA]]: any = spyA.mock.calls;
          expect(eventA.context).toEqual({ hello: "world" });
          const [[eventB]]: any = spyB.mock.calls;
          expect(eventB.context).toEqual({});
          resolve(void 0);
        });
      }));

    it("batches contexts", () =>
      new Promise((resolve) => {
        const targetA = new EventTarget();
        const spyA = vi.fn();
        targetA.addEventListener("change", spyA);

        const targetB = new EventTarget();
        const spyB = vi.fn();
        targetB.addEventListener("change", spyB);

        ChangesEvent.context({ hello: "world" }, () => {
          ChangesEvent.batch(targetA, change.field.type);
          ChangesEvent.batch(targetA, change.field.valid);
        });

        ChangesEvent.context({ foo: "bar" }, () => {
          ChangesEvent.batch(targetA, change.field.key);
        });

        ChangesEvent.batch(targetB, change.field.key);

        expect(spyA).not.toHaveBeenCalled();
        expect(spyB).not.toHaveBeenCalled();

        setTimeout(() => {
          const [[eventA]]: any = spyA.mock.calls;
          expect(eventA.context).toEqual({ hello: "world", foo: "bar" });
          const [[eventB]]: any = spyB.mock.calls;
          expect(eventB.context).toEqual({});
          resolve(void 0);
        });
      }));

    it("nests contexts", () => () =>
      new Promise((resolve) => {
        const targetA = new EventTarget();
        const spyA = vi.fn();
        targetA.addEventListener("change", spyA);

        const targetB = new EventTarget();
        const spyB = vi.fn();
        targetB.addEventListener("change", spyB);

        ChangesEvent.context({ hello: "world" }, () => {
          ChangesEvent.context({ foo: "bar" }, () => {
            ChangesEvent.batch(targetA, change.field.type);
            ChangesEvent.batch(targetA, change.field.valid);
          });
        });

        ChangesEvent.batch(targetB, change.field.key);

        expect(spyA).not.toHaveBeenCalled();
        expect(spyB).not.toHaveBeenCalled();

        setTimeout(() => {
          const [[eventA]]: any = spyA.mock.calls;
          expect(eventA.context).toEqual({ hello: "world", foo: "bar" });
          const [[eventB]]: any = spyB.mock.calls;
          expect(eventB.context).toEqual({});
          resolve(void 0);
        });
      }));

    it("sends context with syncronous events", () => {
      const targetA = new EventTarget();
      const spyA = vi.fn();
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.sync(() => {
        ChangesEvent.context({ hello: "world" }, () => {
          ChangesEvent.batch(targetA, change.field.type);
        });
        ChangesEvent.context({ foo: "bar" }, () => {
          ChangesEvent.batch(targetA, change.field.valid);
        });
        ChangesEvent.batch(targetA, change.field.commit);
      });

      ChangesEvent.batch(targetB, change.field.key);
      ChangesEvent.batch(targetB, change.field.shape);

      expect(spyA).toHaveBeenCalledTimes(3);
      expect(spyA).toHaveBeenCalledWith(
        expect.objectContaining({ context: { hello: "world" } })
      );
      expect(spyA).toHaveBeenCalledWith(
        expect.objectContaining({ context: { foo: "bar" } })
      );
      expect(spyA).toHaveBeenCalledWith(
        expect.objectContaining({ context: {} })
      );
      expect(spyB).not.toHaveBeenCalled();
    });
  });
});
