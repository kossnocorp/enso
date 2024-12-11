import React, { useEffect, useMemo } from "react";
import { Field, fieldChange } from "../field/index.tsx";
import { useRerender } from "../hooks/rerender.ts";

//#region Form

export class Form<Payload> {
  static use<Payload>(value: Payload): Form<Payload> {
    const form = useMemo(() => new Form(value), []);
    const rerender = useRerender();

    useEffect(
      () =>
        form.#field.watch((_, event) => {
          // Only react to form-specific changes, as everything else is
          // handled by the field's use hook.
          if (event.changes & ~(formChange.submitting | formChange.submitted))
            return;
          rerender();
        }),
      [form, rerender]
    );

    // [TODO] Rename use to useBind or something like that and get rid of
    // the object traversal.
    form.#field.useBind();

    return form;
  }

  #field: Field<Payload>;

  constructor(initial: Payload) {
    this.#field = new Field(initial);

    this.Control = this.Control.bind(this);
  }

  //#region Attributes

  get id() {
    return this.#field.id;
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

    this.#submitting = true;
    this.#field.trigger(formChange.submitting, true);

    await callback(this.#field.get());

    this.#submitting = false;
    this.#field.trigger(formChange.submitted, true);
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
  submitting: 0b01000000000000, // 4096
  submitted: 0b10000000000000, // 8192
};

//#endregion
