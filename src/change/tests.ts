import { describe, expect, it, vi } from "vitest";
import {
  change,
  ChangesEvent,
  metaChanges,
  structuralChanges,
} from "./index.ts";
import { postpone } from "../../tests/utils.ts";

describe(ChangesEvent, () => {
  describe(ChangesEvent.batch, () => {
    it("batches events", async () => {
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

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(1);
      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.changes).toMatchChanges(
        change.field.type | change.field.valid | change.field.commit,
      );
      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.field.key | change.field.shape,
      );
    });

    it("cancels out valid/invalid", async () => {
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

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(1);
      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.changes).toMatchChanges(
        change.field.valid |
          change.child.valid |
          change.child.invalid |
          change.subtree.valid |
          change.subtree.invalid,
      );
      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.field.invalid |
          change.child.valid |
          change.child.invalid |
          change.subtree.valid |
          change.subtree.invalid,
      );
    });

    it("cancels out attach/detach", async () => {
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

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(1);
      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.changes).toMatchChanges(
        change.field.attach |
          change.child.attach |
          change.child.detach |
          change.subtree.attach |
          change.subtree.detach,
      );
      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.field.detach |
          change.child.attach |
          change.child.detach |
          change.subtree.attach |
          change.subtree.detach,
      );
    });

    it("preserves events batched during callbacks", async () => {
      let state = 0;
      const targetA = new EventTarget();
      const spyA = vi.fn(() => {
        switch (state) {
          case 0: {
            ChangesEvent.batch(targetA, change.field.valid);
            ChangesEvent.batch(targetA, change.field.commit);
            break;
          }

          case 1: {
            ChangesEvent.batch(targetB, change.field.key);
            ChangesEvent.batch(targetB, change.field.shape);
            break;
          }
        }
        state++;
      });
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.batch(targetA, change.field.type);

      expect(spyA).not.toHaveBeenCalled();
      expect(spyB).not.toHaveBeenCalled();

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(2);
      const [[eventA1], [eventA2]]: any = spyA.mock.calls;
      expect(eventA1.changes).toMatchChanges(change.field.type);
      expect(eventA2.changes).toMatchChanges(
        change.field.valid | change.field.commit,
      );

      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.field.key | change.field.shape,
      );
    });
  });

  describe(ChangesEvent.context, () => {
    it("allows to specify context for the events", async () => {
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

      await postpone();

      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.context).toEqual({ hello: "world" });
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.context).toEqual({});
    });

    it("batches contexts", async () => {
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

      await postpone();

      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.context).toEqual({ hello: "world", foo: "bar" });
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.context).toEqual({});
    });

    it("nests contexts", async () => {
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

      await postpone();

      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.context).toEqual({ hello: "world", foo: "bar" });
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.context).toEqual({});
    });
  });
});

describe(structuralChanges, () => {
  it("isolates structural changes", () => {
    expect(
      structuralChanges(
        change.field.attach |
          change.field.commit |
          change.child.value |
          change.child.errors |
          change.subtree.attach |
          change.subtree.valid,
      ),
    ).toMatchChanges(
      change.field.attach | change.child.value | change.subtree.attach,
    );
  });
});

describe(metaChanges, () => {
  it("isolates meta changes", () => {
    expect(
      metaChanges(
        change.field.attach |
          change.field.commit |
          change.child.value |
          change.child.errors |
          change.subtree.attach |
          change.subtree.valid,
      ),
    ).toMatchChanges(
      change.field.commit | change.child.errors | change.subtree.valid,
    );
  });
});
