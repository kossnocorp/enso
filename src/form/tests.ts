import { nanoid } from "nanoid";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../field/index.tsx";
import { Form } from "./index.tsx";

describe("Form", () => {
  it("creates a form instance", () => {
    const form = new Form(nanoid(), 42);
    expect(form.get()).toBe(42);
  });

  describe("attributes", () => {
    it("accepts id", () => {
      const id = nanoid();
      const form = new Form(id, 42);
      expect(form.id).toBe(id);
    });

    it("returns the internal field", () => {
      const form = new Form(nanoid(), 42);
      const { field } = form;
      expect(field.get()).toBe(42);
      expect(field).toBeInstanceOf(Field);
    });
  });

  describe("value", () => {
    it("delegates set", () => {
      const spy = vi.spyOn(Field.prototype, "set");
      const form = new Form(nanoid(), 42);
      expect(form.set(24)).toBe(form.field);
      expect(spy).toHaveBeenCalledWith(24);
    });

    it("delegates initial", () => {
      const spy = vi
        .spyOn(Field.prototype, "initial", "get")
        .mockReturnValue(123);
      const form = new Form(nanoid(), 42);
      expect(form.initial).toBe(123);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates dirty", () => {
      const spy = vi
        .spyOn(Field.prototype, "dirty", "get")
        .mockReturnValue(true);
      const form = new Form(nanoid(), 42);
      expect(form.dirty).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates useDirty", () => {
      const spy = vi.spyOn(Field.prototype, "useDirty").mockReturnValue(false);
      const form = new Form(nanoid(), 42);
      expect(form.useDirty()).toBe(false);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates commit", () => {
      const spy = vi.spyOn(Field.prototype, "commit").mockReturnValue();
      const form = new Form(nanoid(), 42);
      expect(form.commit()).toBe(undefined);
      expect(spy).toHaveBeenCalled();
    });

    it("delegates reset", () => {
      const spy = vi.spyOn(Field.prototype, "reset").mockReturnValue();
      const form = new Form(nanoid(), 42);
      expect(form.reset()).toBe(undefined);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("tree", () => {
    it("delegates $", () => {
      const spy = vi
        .spyOn(Field.prototype, "$", "get")
        .mockReturnValue("Ok" as any);
      const form = new Form(nanoid(), 42);
      expect(form.$).toBe("Ok");
      expect(spy).toHaveBeenCalled();
    });

    it("delegates at", () => {
      const spy = vi.spyOn(Field.prototype, "at").mockReturnValue("Ok" as any);
      const form = new Form<string[]>(nanoid(), []);
      expect(form.at(5)).toBe("Ok");
      expect(spy).toHaveBeenCalledWith(5);
    });
  });

  describe("watch", () => {
    it("delegates watch", () => {
      const unwatch = () => {};
      const spy = vi.spyOn(Field.prototype, "watch").mockReturnValue(unwatch);
      const form = new Form(nanoid(), 42);
      const watchCb = () => {};
      expect(form.watch(watchCb)).toBe(unwatch);
      expect(spy).toHaveBeenCalledWith(watchCb);
    });

    it("delegates useWatch", () => {
      const spy = vi.spyOn(Field.prototype, "useWatch").mockReturnValue();
      const form = new Form(nanoid(), 42);
      const watchCb = () => {};
      expect(form.useWatch(watchCb)).toBe(undefined);
      expect(spy).toHaveBeenCalledWith(watchCb);
    });
  });

  describe("map", () => {
    it("delegates useCompute", () => {
      const compute = {};
      const spy = vi
        .spyOn(Field.prototype, "useCompute")
        .mockReturnValue(compute as any);
      const form = new Form(nanoid(), 42);
      const computeCb = () => {};
      expect(form.useCompute(computeCb as any, [1, 2, 3])).toBe(compute);
      expect(spy).toHaveBeenCalledWith(computeCb, [1, 2, 3]);
    });

    it("delegates discriminate", () => {
      const discriminated = {};
      const spy = vi
        .spyOn(Field.prototype, "discriminate")
        .mockReturnValue(discriminated as any);
      const form = new Form(nanoid(), { type: "hello", value: 42 });
      expect(form.discriminate("type")).toBe(discriminated);
      expect(spy).toHaveBeenCalledWith("type");
    });

    it("delegates useDiscriminate", () => {
      const discriminated = {};
      const spy = vi
        .spyOn(Field.prototype, "discriminate")
        .mockReturnValue(discriminated as any);
      const form = new Form(nanoid(), { type: "hello", value: 42 });
      expect(form.discriminate("type")).toBe(discriminated);
      expect(spy).toHaveBeenCalledWith("type");
    });

    it("delegates into", () => {
      const into = {};
      const spy = vi
        .spyOn(Field.prototype, "into")
        .mockReturnValue(into as any);
      const form = new Form(nanoid(), { type: "hello", value: 42 });
      const intoCb = () => {};
      expect(form.into(intoCb)).toBe(into);
      expect(spy).toHaveBeenCalledWith(intoCb);
    });

    it("delegates useInto", () => {
      const into = {};
      const spy = vi
        .spyOn(Field.prototype, "useInto")
        .mockReturnValue(into as any);
      const form = new Form(nanoid(), { type: "hello", value: 42 });
      const intoCb = () => {};
      expect(form.useInto(intoCb, [1, 2, 3])).toBe(into);
      expect(spy).toHaveBeenCalledWith(intoCb, [1, 2, 3]);
    });

    it("delegates narrow", () => {
      const narrow = {};
      const spy = vi
        .spyOn(Field.prototype, "narrow")
        .mockReturnValue(narrow as any);
      const form = new Form(nanoid(), { type: "hello", value: 42 });
      const narrowCb = () => {};
      expect(form.narrow(narrowCb as any)).toBe(narrow);
      expect(spy).toHaveBeenCalledWith(narrowCb);
    });

    it("delegates useNarrow", () => {
      const narrow = {};
      const spy = vi
        .spyOn(Field.prototype, "useNarrow")
        .mockReturnValue(narrow as any);
      const form = new Form(nanoid(), { type: "hello", value: 42 });
      const narrowCb = () => {};
      expect(form.useNarrow(narrowCb as any, [1, 2, 3])).toBe(narrow);
      expect(spy).toHaveBeenCalledWith(narrowCb, [1, 2, 3]);
    });
  });

  describe("errors", () => {
    it("delegates valid", () => {
      const spy = vi
        .spyOn(Field.prototype, "valid", "get")
        .mockReturnValue(false);
      const form = new Form(nanoid(), 42);
      expect(form.valid).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("delegates validate", async () => {
      const validateSpy = vi
        .spyOn(Field.prototype, "validate")
        .mockReturnValue(Promise.resolve(void 0));
      const validSpy = vi
        .spyOn(Field.prototype, "valid", "get")
        .mockReturnValue(false);
      const validateCb = () => {};
      const form = new Form(nanoid(), 42, { validate: validateCb });
      expect(await form.validate()).toBe(false);
      expect(validateSpy).toHaveBeenCalledWith(validateCb);
      expect(validSpy).toHaveBeenCalled();
    });

    it("clears errors even if the validate function is not provided", async () => {
      const form = new Form(nanoid(), 42);
      form.field.addError("Nope");
      expect(await form.validate()).toBe(true);
      expect(form.field.errors).toHaveLength(0);
    });
  });
});
