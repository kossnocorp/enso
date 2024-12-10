import { describe, expect, it, vi } from "vitest";
import { Form } from "./index.tsx";
import { Field } from "../field/index.tsx";

describe("Form", () => {
  it("creates a form instance", () => {
    const form = new Form(42);
    expect(form.get()).toBe(42);
  });

  describe("attributes", () => {
    it("delegates id", () => {
      const spy = vi.spyOn(Field.prototype, "id", "get").mockReturnValue("42");
      const form = new Form(42);
      expect(form.id).toBe("42");
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("value", () => {
    it("delegates set", () => {
      const spy = vi.spyOn(Field.prototype, "set").mockReturnValue(8);
      const form = new Form(42);
      expect(form.set(24)).toBe(8);
      expect(spy).toHaveBeenCalledWith(24);
    });

    it("delegates initial", () => {
      const spy = vi
        .spyOn(Field.prototype, "initial", "get")
        .mockReturnValue(123);
      const form = new Form(42);
      expect(form.initial).toBe(123);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates dirty", () => {
      const spy = vi
        .spyOn(Field.prototype, "dirty", "get")
        .mockReturnValue(true);
      const form = new Form(42);
      expect(form.dirty).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates commit", () => {
      const spy = vi.spyOn(Field.prototype, "commit").mockReturnValue();
      const form = new Form(42);
      expect(form.commit()).toBe(undefined);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("tree", () => {
    it("delegates $", () => {
      const spy = vi
        .spyOn(Field.prototype, "$", "get")
        .mockReturnValue("Ok" as any);
      const form = new Form(42);
      expect(form.$).toBe("Ok");
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("watching", () => {
    it("delegates watch", () => {
      const unwatch = () => {};
      const spy = vi.spyOn(Field.prototype, "watch").mockReturnValue(unwatch);
      const form = new Form(42);
      const watchCb = () => {};
      expect(form.watch(watchCb)).toBe(unwatch);
      expect(spy).toHaveBeenCalledWith(watchCb);
    });
  });

  describe("mapping", () => {
    it("useCompute", () => {
      const compute = {};
      const spy = vi
        .spyOn(Field.prototype, "useCompute")
        .mockReturnValue(compute as any);
      const form = new Form(42);
      const computeCb = () => {};
      expect(form.useCompute(computeCb as any)).toBe(compute);
      expect(spy).toHaveBeenCalledWith(computeCb);
    });

    it("delegates decompose", () => {
      const decomposed = {};
      const spy = vi
        .spyOn(Field.prototype, "decompose")
        .mockReturnValue(decomposed as any);
      const form = new Form({ type: "hello", value: 42 });
      expect(form.decompose()).toBe(decomposed);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates useDecompose", () => {
      const decomposed = {};
      const spy = vi
        .spyOn(Field.prototype, "useDecompose")
        .mockReturnValue(decomposed as any);
      const form = new Form({ type: "hello", value: 42 });
      const decomposeCb = () => {};
      expect(form.useDecompose(decomposeCb as any)).toBe(decomposed);
      expect(spy).toHaveBeenCalledWith(decomposeCb);
    });

    it("delegates discriminate", () => {
      const discriminated = {};
      const spy = vi
        .spyOn(Field.prototype, "discriminate")
        .mockReturnValue(discriminated as any);
      const form = new Form({ type: "hello", value: 42 });
      expect(form.discriminate("type")).toBe(discriminated);
      expect(spy).toHaveBeenCalledWith("type");
    });

    it("delegates useDiscriminate", () => {
      const discriminated = {};
      const spy = vi
        .spyOn(Field.prototype, "discriminate")
        .mockReturnValue(discriminated as any);
      const form = new Form({ type: "hello", value: 42 });
      expect(form.discriminate("type")).toBe(discriminated);
      expect(spy).toHaveBeenCalledWith("type");
    });

    it("delegates into", () => {
      const into = {};
      const spy = vi
        .spyOn(Field.prototype, "into")
        .mockReturnValue(into as any);
      const form = new Form({ type: "hello", value: 42 });
      const intoCb = () => {};
      expect(form.into(intoCb)).toBe(into);
      expect(spy).toHaveBeenCalledWith(intoCb);
    });

    it("delegates useInto", () => {
      const into = {};
      const spy = vi
        .spyOn(Field.prototype, "useInto")
        .mockReturnValue(into as any);
      const form = new Form({ type: "hello", value: 42 });
      const intoCb = () => {};
      expect(form.useInto(intoCb)).toBe(into);
      expect(spy).toHaveBeenCalledWith(intoCb);
    });

    it("delegates narrow", () => {
      const narrow = {};
      const spy = vi
        .spyOn(Field.prototype, "narrow")
        .mockReturnValue(narrow as any);
      const form = new Form({ type: "hello", value: 42 });
      const narrowCb = () => {};
      expect(form.narrow(narrowCb as any)).toBe(narrow);
      expect(spy).toHaveBeenCalledWith(narrowCb);
    });

    it("delegates useNarrow", () => {
      const narrow = {};
      const spy = vi
        .spyOn(Field.prototype, "useNarrow")
        .mockReturnValue(narrow as any);
      const form = new Form({ type: "hello", value: 42 });
      const narrowCb = () => {};
      expect(form.useNarrow(narrowCb as any)).toBe(narrow);
      expect(spy).toHaveBeenCalledWith(narrowCb);
    });
  });

  describe("errors", () => {
    it("delegates invalids", () => {
      const invalids = [] as any;
      const spy = vi
        .spyOn(Field.prototype, "invalids", "get")
        .mockReturnValue(invalids);
      const form = new Form(42);
      expect(form.invalids).toBe(invalids);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates valid", () => {
      const spy = vi
        .spyOn(Field.prototype, "valid", "get")
        .mockReturnValue(false);
      const form = new Form(42);
      expect(form.valid).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });
});
