import React, { useEffect, useMemo } from "react";
import { Field, fieldChange } from "../field/index.tsx";
import { useRerender } from "../hooks/rerender.ts";

//#region Form

export class Form<Payload> {
  static use<Payload>(
    value: Payload,
    options?: Form.Options<Payload>
  ): Form<Payload> {
    const form = useMemo(() => new Form(value, options), []);
    const rerender = useRerender();

    useEffect(
      () =>
        form.#field.watch((_, event) => {
          // Only react to form-specific changes, as everything else is
          // handled by the field's useBind hook below.
          if (
            event.changes &
            ~(
              formChange.formSubmitting |
              formChange.formSubmitted |
              formChange.formValid |
              formChange.formInvalid
            )
          )
            return;

          rerender();
        }),
      [form, rerender]
    );

    form.#field.useBind();

    return form;
  }

  #field: Field<Payload>;

  constructor(initial: Payload, options?: Form.Options<Payload>) {
    this.#field = new Field(initial);
    this.#validate = options?.validate;

    this.Control = this.Control.bind(this);

    this.#field.watch((_, event) => {
      if (
        this.#valid ||
        (!(event.changes & fieldChange.blurred) &&
          !(event.changes & fieldChange.childBlurred))
      )
        return;

      this.validate();
    });
  }

  //#region Attributes

  get id() {
    return this.#field.id;
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

  //#endregion

  //#region Watching

  watch(callback: Field.WatchCallback<Payload>) {
    return this.#field.watch(callback);
  }

  useWatch(callback: Field.WatchCallback<Payload>) {
    return this.#field.useWatch(callback);
  }

  //#endregion

  //#region Mapping

  useCompute<Computed>(
    callback: Field.ComputeCallback<Payload, Computed>
  ): Computed {
    return this.#field.useCompute(callback);
  }

  decompose(): Field.Decomposed<Payload> {
    return this.#field.decompose();
  }

  useDecompose(
    callback: Field.DecomposeCallback<Payload>
  ): Field.Decomposed<Payload> {
    return this.#field.useDecompose(callback);
  }

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): Field.Discriminated<Payload, Discriminator> {
    return this.#field.discriminate(discriminator);
  }

  useDiscriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ) {
    return this.#field.useDiscriminate(discriminator);
  }

  into<Computed>(
    intoCallback: Field.IntoCallback<Payload, Computed>
  ): Field.Into<Payload, Computed> {
    return this.#field.into(intoCallback);
  }

  useInto<Computed>(
    intoCallback: Field.IntoCallback<Payload, Computed>
  ): Field.Into<Payload, Computed> {
    return this.#field.useInto(intoCallback);
  }

  narrow<Narrowed extends Payload>(
    callback: Field.NarrowCallback<Payload, Narrowed>
  ): Field<Narrowed> | undefined {
    return this.#field.narrow(callback);
  }

  useNarrow<Narrowed extends Payload>(
    callback: Field.NarrowCallback<Payload, Narrowed>
  ): Field<Narrowed> | undefined {
    return this.#field.useNarrow(callback);
  }

  //#endregion

  //#region Errors

  get invalids() {
    return this.#field.invalids;
  }

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
  #validate: Field.Validator<Payload, undefined> | undefined;

  /**
   * @private
   * Form validation state. The false state indicates that the validate method
   * got called and it resulted in failing validation. It allows to know when to
   * revalidate the form on certain user interactions, such as input blur or
   * change.
   */
  #valid = true;

  async validate() {
    // Even if the validate function is not provided, we still want to expunge
    // the errors, so we call the validate method with an empty function.
    await this.#field.validate(this.#validate || (() => {}));

    // If we're currently submitting the form, we want to send the submitting
    // event to the field along with the submitting state.
    if (this.#submitting) this.#field.withhold();

    const valid = this.#field.valid;
    if (this.#valid !== valid) {
      this.#valid = valid;
      this.#field.trigger(
        valid ? formChange.formValid : formChange.formInvalid,
        false
      );
    }

    return valid;
  }

  //#endregion

  control(callback: Form.SubmitCallback<Payload>): Form.Control {
    return {
      onSubmit: (event) => this.#submit(event, callback),
    };
  }

  Control(
    props: Form.ControlProps<Payload>
  ): React.ReactElement<HTMLFormElement> {
    return (
      <form {...this.control(props.onSubmit || (() => {}))}>
        {props.children}
      </form>
    );
  }

  #submitting = false;

  get submitting() {
    return this.#submitting;
  }

  async #submit(
    event: React.FormEvent<HTMLFormElement>,
    callback: Form.SubmitCallback<Payload>
  ) {
    event.preventDefault();
    event.stopPropagation();

    // We set it before the validation to make it withold sending the changes
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

    await callback(this.#field.get());

    this.#submitting = false;
    this.#field.trigger(formChange.formSubmitted, true);
  }

  get $() {
    return this.#field.$;
  }

  at<Key extends keyof Payload>(
    key: Payload extends object ? Key : never
  ): Payload extends object ? Field.At<Payload, Key> : void {
    return this.#field.at(key);
  }
}

export namespace Form {
  export interface Options<Payload> {
    validate?: Field.Validator<Payload, undefined>;
  }

  export interface ControlProps<Payload>
    extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
    onSubmit?: SubmitCallback<Payload>;
    children?: React.ReactNode;
  }

  export type ControlCallback = (
    submit: (event: React.FormEvent<HTMLFormElement>) => void
  ) => any;

  export interface Control {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  }

  export type SubmitCallback<Payload> = (
    payload: Payload
  ) => unknown | Promise<unknown>;
}

//#endregion

//# FormChange

export const formChange = {
  ...fieldChange,
  formSubmitting: 2 ** 13,
  formSubmitted: 2 ** 14,
  formValid: 2 ** 15,
  formInvalid: 2 ** 16,
};

//#endregion
