import React, { useEffect, useMemo } from "react";
import { State, stateChangeType } from "../state/index.tsx";
import { useRerender } from "../hooks/rerender.ts";

export { State as Field };

//#region Form

export class Form<Payload> extends State<Payload> {
  static override use<Payload>(value: Payload): Form<Payload> {
    const form = useMemo(() => new Form(value), []);
    const rerender = useRerender();

    useEffect(
      () =>
        form.watch((_, event) => {
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
    return form.use() as Form<Payload>;
  }

  constructor(initial: Payload) {
    super(initial);
  }

  control(callback: Form.SubmitCallback<Payload>): Form.Control {
    return {
      onSubmit: (event) => this.#submit(event, callback),
    };
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
    this.trigger(formChangeType.submitting, true);

    await callback(this.get());

    this.#submitting = false;
    this.trigger(formChangeType.submitted, true);
  }
}

export namespace Form {
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
