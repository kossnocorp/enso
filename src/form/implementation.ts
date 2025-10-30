"use client";

import { nanoid } from "nanoid";
import React, { createElement, useEffect, useId } from "react";
import type { Atom } from "../atom/definition.ts";
import { change, maskedChanges } from "../change/index.ts";
import type { Field } from "../field/definition.ts";
import { FieldImpl } from "../field/implementation.ts";
import { useMemo } from "../hooks/index.ts";
import { useRerender } from "../hooks/rerender.ts";
import type { Form } from "./definition.ts";

export const formChange: Form.Change = {
  formSubmitting: BigInt(2 ** 48),
  formSubmitted: BigInt(2 ** 49),
  formValid: BigInt(2 ** 50),
  formInvalid: BigInt(2 ** 51),
};

export { FormImpl as Form };

export class FormImpl<Value> {
  static use<Value>(
    value: Value,
    deps: React.DependencyList,
    options?: Form.Options<Value>,
  ): FormImpl<Value> {
    const id = useId();
    const form = useMemo(
      () => new FormImpl(value, { ...options, id }),
      [id, ...deps],
    );
    useEffect(() => () => form.deconstruct(), [form]);
    const rerender = useRerender();

    useEffect(
      () =>
        form.#field.watch((_, event) => {
          // Only react to form-specific changes, as everything else is
          // handled by the field's useBind hook below.
          if (
            !maskedChanges(
              event.changes,
              formChange.formSubmitting |
                formChange.formSubmitted |
                formChange.formValid |
                formChange.formInvalid,
            )
          )
            return;

          rerender();
        }),
      [form, rerender],
    );

    form.#field.useCollection();

    return form;
  }

  static Component<Value, IsServer extends boolean | undefined = undefined>(
    props: Form.ComponentProps<Value, IsServer>,
  ): React.ReactElement<HTMLFormElement> {
    const { form, onSubmit, onReset, server, children, ...restProps } = props;
    // @ts-expect-error -- WIP
    return createElement(
      "form",
      {
        ...restProps,
        // @ts-ignore
        ...form.control({ onSubmit, onReset, server }),
        // @ts-expect-error -- WIP
        id: form.#id,
      },
      children,
    );
  }

  #id: string;
  #field: FieldImpl<Value>;

  //#region Instance

  constructor(initial: Value, options?: Form.Options<Value>) {
    this.#id = options?.id || nanoid();
    this.#field = new FieldImpl(initial);
    this.#validator = options?.validate;

    this.#field.watch((_, event) => {
      if (
        this.#valid ||
        !maskedChanges(
          event.changes,
          change.atom.blur | change.child.blur | change.subtree.blur,
        )
      )
        return;

      this.validate();
    });
  }

  // TODO: Tests
  deconstruct() {
    this.#field.deconstruct();
  }

  //#endregion

  //#region Attributes

  get id() {
    return this.#id;
  }

  get field() {
    return this.#field;
  }

  //#endregion

  //#region Value

  get value() {
    return this.#field.value;
  }

  set(value: Value) {
    return this.#field.set(value);
  }

  get initial() {
    return this.#field.initial;
  }

  get dirty() {
    return this.#field.dirty;
  }

  useDirty() {
    return this.#field.useDirty();
  }

  commit() {
    return this.#field.commit();
  }

  reset() {
    return this.#field.reset();
  }

  //#endregion

  //#region Tree

  get $() {
    return this.#field.$;
  }

  at<Key extends keyof Value>(key: Key): any {
    return this.#field.at(key);
  }

  //#endregion

  //#region Transform

  useCompute<Computed>(
    callback: Atom.Compute.Callback<Value, Computed>,
    deps: React.DependencyList,
  ): Computed {
    return this.#field.useCompute(callback, deps);
  }

  into(intoMapper: any): any {
    return this.#field.into(intoMapper);
  }

  useInto(intoMapper: any, deps: React.DependencyList): any {
    return this.#field.useInto(intoMapper, deps);
  }

  //#endregion

  //#region Events

  watch(callback: Atom.Watch.Bare.Callback<Value>) {
    return this.#field.watch(callback);
  }

  useWatch(callback: Atom.Watch.Bare.Callback<Value>) {
    return this.#field.useWatch(callback);
  }

  //#endregion

  //#region Validation

  /**
   * @private
   * The validation function provided to the form. It gets called when the form
   * is submitted. If the validation fails, the form does not submit.
   */
  #validator: Field.Validator<Value> | undefined;

  /**
   * @private
   * Form validation state. The false state indicates that the validate method
   * got called and it resulted in failing validation. It allows to know when to
   * revalidate the form on certain user interactions, such as input blur or
   * change.
   */
  #valid = true;

  get valid() {
    return this.#field.valid;
  }

  async validate() {
    // Even if the validate function is not provided, we still want to clear
    // the errors, so we call the validate method with an empty function.
    await this.#field.validate(this.#validator || (() => {}));

    // If we're currently submitting the form, we want to send the submitting
    // event to the field along with the submitting state.
    if (this.#submitting) this.#field.withhold();

    const valid = this.#field.valid;
    if (this.#valid !== valid) {
      this.#valid = valid;
      this.#field.trigger(
        valid ? formChange.formValid : formChange.formInvalid,
        false,
      );
    }

    return valid;
  }

  addError(error: Field.Error.Type) {
    this.#field.addError(error);
  }

  //#endregion

  //#region Interop

  control<IsServer extends boolean | undefined = undefined>(
    props?: Form.ControlProps<Value, IsServer> | undefined,
  ): Form.ControlRegistration {
    const { onSubmit, onReset, server } = props || {};
    return {
      // @ts-ignore: We're checking the server flag to determine if
      // the callback is a server-side one or not.
      onSubmit: (event) => this.#submit(event, onSubmit || (() => {}), server),
      onReset: (event) => (onReset ? onReset(event) : this.reset()),
    };
  }

  #submitting = false;

  get submitting() {
    return this.#submitting;
  }

  async #submit<IsServer extends boolean | undefined = undefined>(
    event: React.FormEvent<HTMLFormElement>,
    callback: Form.Control.OnSubmit<Value, IsServer>,
    server: IsServer,
  ) {
    event.preventDefault();
    event.stopPropagation();

    // We set it before the validation to make it withhold sending the changes
    this.#submitting = true;

    if (!(await this.validate())) {
      // We're skipping to send the submitting event to the field
      this.#submitting = false;
      this.#field.unleash();

      return;
    }

    this.#field.trigger(formChange.formSubmitting, true);
    // We unleash the field to send the changes that happened during and after
    // the validation process.
    this.#field.unleash();

    const values = this.#field.value;
    // React Server Actions can't accept Event so should not pass it.
    const result = await (server
      ? // @ts-ignore: We're checking the server flag to determine if
        // the callback is a server-side one or not.
        callback(values)
      : callback(values, event));

    // Commit unless the callback explicitly returned false
    if (result !== false) this.commit();

    this.#submitting = false;
    this.#field.trigger(formChange.formSubmitted, true);
  }

  //#endregion
}
