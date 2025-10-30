import { describe, expect, it, vi } from "vitest";
import { postpone } from "../../tests/utils.ts";
import {
  change,
  ChangesEvent,
  metaChanges,
  shiftChildChanges,
  structuralChanges,
} from "./index.ts";

describe("ChangesEvent", () => {
  describe("#batch", () => {
    it("batches events", async () => {
      const targetA = new EventTarget();
      const spyA = vi.fn();
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.batch(targetA, change.atom.type);
      ChangesEvent.batch(targetA, change.atom.valid);
      ChangesEvent.batch(targetA, change.atom.commit);

      ChangesEvent.batch(targetB, change.atom.key);
      ChangesEvent.batch(targetB, change.atom.shape);

      expect(spyA).not.toHaveBeenCalled();
      expect(spyB).not.toHaveBeenCalled();

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(1);
      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.changes).toMatchChanges(
        change.atom.type | change.atom.valid | change.atom.commit,
      );
      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.atom.key | change.atom.shape,
      );
    });

    it("cancels out valid/invalid", async () => {
      const targetA = new EventTarget();
      const spyA = vi.fn();
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.batch(targetA, change.atom.valid);
      ChangesEvent.batch(targetA, change.atom.invalid);
      ChangesEvent.batch(targetA, change.atom.valid);
      ChangesEvent.batch(targetA, change.child.valid);
      ChangesEvent.batch(targetA, change.child.invalid);
      ChangesEvent.batch(targetA, change.subtree.valid);
      ChangesEvent.batch(targetA, change.subtree.invalid);

      ChangesEvent.batch(targetB, change.atom.valid);
      ChangesEvent.batch(targetB, change.atom.invalid);
      ChangesEvent.batch(targetB, change.child.valid);
      ChangesEvent.batch(targetB, change.child.invalid);
      ChangesEvent.batch(targetB, change.subtree.valid);
      ChangesEvent.batch(targetB, change.subtree.invalid);

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(1);
      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.changes).toMatchChanges(
        change.atom.valid |
          change.child.valid |
          change.child.invalid |
          change.subtree.valid |
          change.subtree.invalid,
      );
      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.atom.invalid |
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

      ChangesEvent.batch(targetA, change.atom.attach);
      ChangesEvent.batch(targetA, change.atom.detach);
      ChangesEvent.batch(targetA, change.atom.attach);
      ChangesEvent.batch(targetA, change.child.attach);
      ChangesEvent.batch(targetA, change.child.detach);
      ChangesEvent.batch(targetA, change.subtree.attach);
      ChangesEvent.batch(targetA, change.subtree.detach);

      ChangesEvent.batch(targetB, change.atom.attach);
      ChangesEvent.batch(targetB, change.atom.detach);
      ChangesEvent.batch(targetB, change.child.attach);
      ChangesEvent.batch(targetB, change.child.detach);
      ChangesEvent.batch(targetB, change.subtree.attach);
      ChangesEvent.batch(targetB, change.subtree.detach);

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(1);
      const [[eventA]]: any = spyA.mock.calls;
      expect(eventA.changes).toMatchChanges(
        change.atom.attach |
          change.child.attach |
          change.child.detach |
          change.subtree.attach |
          change.subtree.detach,
      );
      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.atom.detach |
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
            ChangesEvent.batch(targetA, change.atom.valid);
            ChangesEvent.batch(targetA, change.atom.commit);
            break;
          }

          case 1: {
            ChangesEvent.batch(targetB, change.atom.key);
            ChangesEvent.batch(targetB, change.atom.shape);
            break;
          }
        }
        state++;
      });
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.batch(targetA, change.atom.type);

      expect(spyA).not.toHaveBeenCalled();
      expect(spyB).not.toHaveBeenCalled();

      await postpone();

      expect(spyA).toHaveBeenCalledTimes(2);
      const [[eventA1], [eventA2]]: any = spyA.mock.calls;
      expect(eventA1.changes).toMatchChanges(change.atom.type);
      expect(eventA2.changes).toMatchChanges(
        change.atom.valid | change.atom.commit,
      );

      expect(spyB).toHaveBeenCalledTimes(1);
      const [[eventB]]: any = spyB.mock.calls;
      expect(eventB.changes).toMatchChanges(
        change.atom.key | change.atom.shape,
      );
    });
  });

  describe("#context", () => {
    it("allows to specify context for the events", async () => {
      const targetA = new EventTarget();
      const spyA = vi.fn();
      targetA.addEventListener("change", spyA);

      const targetB = new EventTarget();
      const spyB = vi.fn();
      targetB.addEventListener("change", spyB);

      ChangesEvent.context({ hello: "world" }, () => {
        ChangesEvent.batch(targetA, change.atom.type);
        ChangesEvent.batch(targetA, change.atom.valid);
      });

      ChangesEvent.batch(targetB, change.atom.key);

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
        ChangesEvent.batch(targetA, change.atom.type);
        ChangesEvent.batch(targetA, change.atom.valid);
      });

      ChangesEvent.context({ foo: "bar" }, () => {
        ChangesEvent.batch(targetA, change.atom.key);
      });

      ChangesEvent.batch(targetB, change.atom.key);

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
          ChangesEvent.batch(targetA, change.atom.type);
          ChangesEvent.batch(targetA, change.atom.valid);
        });
      });

      ChangesEvent.batch(targetB, change.atom.key);

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

describe("shiftChildChanges", () => {
  it("shifts changes in the subtree direction", () => {
    const once = shiftChildChanges(
      change.atom.attach |
        change.atom.commit |
        change.child.value |
        change.child.errors |
        change.subtree.attach |
        change.subtree.valid,
    );
    const twice = shiftChildChanges(once);
    expect(once).toMatchChanges(
      change.child.attach |
        change.child.commit |
        change.subtree.value |
        change.subtree.attach |
        change.subtree.valid |
        change.subtree.errors,
    );
    expect(twice).toMatchChanges(
      change.subtree.value |
        change.subtree.attach |
        change.subtree.commit |
        change.subtree.valid |
        change.subtree.errors,
    );
  });
});

describe("structuralChanges", () => {
  it("isolates structural changes", () => {
    expect(
      structuralChanges(
        change.atom.attach |
          change.atom.commit |
          change.child.value |
          change.child.errors |
          change.subtree.attach |
          change.subtree.valid,
      ),
    ).toMatchChanges(
      change.atom.attach | change.child.value | change.subtree.attach,
    );
  });
});

describe("metaChanges", () => {
  it("isolates meta changes", () => {
    expect(
      metaChanges(
        change.atom.attach |
          change.atom.commit |
          change.child.value |
          change.child.errors |
          change.subtree.attach |
          change.subtree.valid,
      ),
    ).toMatchChanges(
      change.atom.commit | change.child.errors | change.subtree.valid,
    );
  });
});
