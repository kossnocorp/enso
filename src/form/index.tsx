import React, { useEffect, useMemo } from "react";
import { State, stateChangeType } from "../state/index.tsx";
import { useRerender } from "../hooks/rerender.ts";
import { Field } from "./index.tsx";

export { State as Field };

//#region Form

export class Form<Payload> {
  static use<Payload>(value: Payload): Form<Payload> {
    const form = useMemo(() => new Form(value), []);
    const rerender = useRerender();

    useEffect(
      () =>
        form.#state.watch((_, event) => {
          // Only react to form-specific changes, as everything else is
          // handled by the state's use hook.
          if (
            event.detail &
            ~(formChangeType.submitting | formChangeType.submitted)
          )
            return;
          rerender();
        }),
      [form, rerender]
    );

    // [TODO] Rename use to useBind or something like that and get rid of
    // the object traversal.
    form.#state.use();

    return form;
  }

  #state: State<Payload>;

  constructor(initial: Payload) {
    this.#state = new State(initial);

    this.Control = this.Control.bind(this);
  }

  //#region Attributes

  get id() {
    return this.#state.id;
  }

  //#endregion

  //#region Value

  get() {
    return this.#state.get();
  }

  set(value: Payload) {
    return this.#state.set(value);
  }

  get initial() {
    return this.#state.initial;
  }

  get dirty() {
    return this.#state.dirty;
  }

  commit() {
    return this.#state.commit();
  }

  //#endregion

  //#region Watching

  watch(callback: State.WatchCallback<Payload>) {
    return this.#state.watch(callback);
  }

  //#endregion

  //#region Mapping

  useCompute<Computed>(
    callback: State.ComputeCallback<Payload, Computed>
  ): Computed {
    return this.#state.useCompute(callback);
  }

  decompose(): State.Decomposed<Payload> {
    return this.#state.decompose();
  }

  useDecompose(
    callback: State.DecomposeCallback<Payload>
  ): State.Decomposed<Payload> {
    return this.#state.useDecompose(callback);
  }

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): Field.Discriminated<Payload, Discriminator> {
    return this.#state.discriminate(discriminator);
  }

  useDiscriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ) {
    return this.#state.useDiscriminate(discriminator);
  }

  into<Computed>(
    intoCallback: State.IntoCallback<Payload, Computed>
  ): State.Into<Payload, Computed> {
    return this.#state.into(intoCallback);
  }

  useInto<Computed>(
    intoCallback: State.IntoCallback<Payload, Computed>
  ): State.Into<Payload, Computed> {
    return this.#state.useInto(intoCallback);
  }

  narrow<Narrowed extends Payload>(
    callback: State.NarrowCallback<Payload, Narrowed>
  ): State<Narrowed> | undefined {
    return this.#state.narrow(callback);
  }

  useNarrow<Narrowed extends Payload>(
    callback: State.NarrowCallback<Payload, Narrowed>
  ): State<Narrowed> | undefined {
    return this.#state.useNarrow(callback);
  }

  //#endregion

  //#region Errors

  get invalids() {
    return this.#state.invalids;
  }

  get valid() {
    return this.#state.valid;
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
    this.#state.trigger(formChangeType.submitting, true);

    await callback(this.#state.get());

    this.#submitting = false;
    this.#state.trigger(formChangeType.submitted, true);
  }

  get $() {
    return this.#state.$;
  }
}

export namespace Form {
  export interface ControlProps<Payload> {
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

export const formChangeType = {
  ...stateChangeType,
  submitting: 0b01000000000000, // 4096
  submitted: 0b10000000000000, // 8192
};

//#endregion
