"use client";

import { nanoid } from "nanoid";
import React, { DependencyList, useEffect, useId, useMemo } from "react";
import { change, maskedChanges } from "../change/index.ts";
import { FieldOld } from "../field/old.tsx";
import { useRerender } from "../hooks/rerender.ts";
import { Enso } from "../types.ts";

//#region Form

// TODO: Implement for common interfaces?
export class FormOld<Payload> implements Enso.InterfaceSystem {
  static use<Payload>(
    value: Payload,
    options?: FormOld.Options<Payload>,
  ): FormOld<Payload> {
    const id = useId();
    const form = useMemo(() => new FormOld(value, { ...options, id }), [id]);
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

    form.#field.useBind();

    return form;
  }

  static Component<Payload, IsServer extends boolean | undefined = undefined>(
    props: FormOld.ComponentProps<Payload, IsServer>,
  ): React.ReactElement<HTMLFormElement> {
    const { form, onSubmit, onReset, server, children, ...restProps } = props;
    return (
      <form
        {...restProps}
        // @ts-ignore
        {...form.control({ onSubmit, onReset, server })}
        id={form.#id}
      >
        {children}
      </form>
    );
  }

  #id: string;
  #field: FieldOld<Payload>;

  constructor(initial: Payload, options?: FormOld.Options<Payload>) {
    this.#id = options?.id || nanoid();
    this.#field = new FieldOld(initial);
    this.#validator = options?.validate;

    this.#field.watch((_, event) => {
      if (
        this.#valid ||
        !maskedChanges(
          event.changes,
          change.field.blur | change.child.blur | change.subtree.blur,
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

  //#region Attributes

  get id() {
    return this.#id;
  }

  get field() {
    return this.#field;
  }

  //#endregion

  //#region Value

  get() {
    return this.#field.get();
  }

  set(value: Payload) {
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

  //#region Watch

  watch(callback: Enso.WatchCallback<Payload>) {
    return this.#field.watch(callback);
  }

  useWatch(callback: Enso.WatchCallback<Payload>) {
    return this.#field.useWatch(callback);
  }

  //#endregion

  //#region Map

  useCompute<Computed>(
    callback: Enso.ComputeCallback<Payload, Computed>,
    deps: DependencyList,
  ): Computed {
    return this.#field.useCompute(callback, deps);
  }

  into<Computed>(
    intoCallback: FieldOld.IntoCallback<Payload, Computed>,
  ): FieldOld.IntoObj<Payload, Computed> {
    return this.#field.into(intoCallback);
  }

  useInto<Computed>(
    intoCallback: FieldOld.IntoCallback<Payload, Computed>,
    deps: DependencyList,
  ): FieldOld.IntoHook<Payload, Computed> {
    return this.#field.useInto(intoCallback, deps);
  }

  narrow<Narrowed extends Payload>(
    callback: FieldOld.NarrowCallback<Payload, Narrowed>,
  ): FieldOld<Narrowed> | undefined {
    return this.#field.narrow(callback);
  }

  useNarrow<Narrowed extends Payload>(
    callback: FieldOld.NarrowCallback<Payload, Narrowed>,
    deps: DependencyList,
  ): FieldOld<Narrowed> | undefined {
    return this.#field.useNarrow(callback, deps);
  }

  //#endregion

  //#region Errors

  get valid() {
    return this.#field.valid;
  }

  //#endregion

  //#region Validation

  /**
   * @private
   * The validation function provided to the form. It gets called when the form
   * is submitted. If the validation fails, the form does not submit.
   */
  #validator: FieldOld.Validator<Payload, undefined> | undefined;

  /**
   * @private
   * Form validation state. The false state indicates that the validate method
   * got called and it resulted in failing validation. It allows to know when to
   * revalidate the form on certain user interactions, such as input blur or
   * change.
   */
  #valid = true;

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

  //#endregion

  control<IsServer extends boolean | undefined = undefined>(
    props?: FormOld.ControlProps<Payload, IsServer> | undefined,
  ): FormOld.Control {
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
    callback: FormOld.ControlOnSubmit<Payload, IsServer>,
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

    const values = this.#field.get();
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

  get $() {
    return this.#field.$;
  }

  at<Key extends keyof Payload>(
    key: Payload extends object ? Key : never,
  ): Payload extends object ? FieldOld.At<Payload, Key> : void {
    // @ts-ignore
    return this.#field.at(key);
  }
}

export namespace FormOld {
  export interface Options<Payload> {
    id?: string;
    validate?: FieldOld.Validator<Payload, undefined>;
  }

  export interface ControlProps<Payload, IsServer extends boolean | undefined> {
    onSubmit?: ControlOnSubmit<Payload, IsServer> | undefined;
    onReset?: ControlOnReset | undefined;
    server?: IsServer;
  }

  export type ControlOnSubmit<
    Payload,
    IsServer extends boolean | undefined,
  > = true extends IsServer
    ? (payload: Payload) => unknown | Promise<unknown>
    : (
        payload: Payload,
        event: React.FormEvent<HTMLFormElement>,
      ) => unknown | Promise<unknown>;

  export type ControlOnReset = (
    event: React.FormEvent<HTMLFormElement>,
  ) => unknown | Promise<unknown>;

  export interface ComponentProps<Payload, IsServer extends boolean | undefined>
    extends ControlProps<Payload, IsServer>,
      Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onReset"> {
    form: FormOld<Payload>;
    children?: React.ReactNode;
  }

  export type ControlCallback = (
    submit: (event: React.FormEvent<HTMLFormElement>) => void,
  ) => any;

  export interface Control {
    onSubmit(event: React.FormEvent<HTMLFormElement>): void;
    onReset(event: React.FormEvent<HTMLFormElement>): void;
  }
}

//#endregion

//# FormChange

export const formChange = {
  formSubmitting: BigInt(2 ** 48),
  formSubmitted: BigInt(2 ** 49),
  formValid: BigInt(2 ** 50),
  formInvalid: BigInt(2 ** 51),
};

//#endregion
