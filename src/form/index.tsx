import React, { type FormEvent } from "react";
import { useRerender } from "../hooks/rerender.ts";
import {
  type DecomposeMixin,
  decomposeMixin,
  useDecomposeMixin,
} from "../mixins/decompose.js";
import {
  type DiscriminateMixin,
  discriminateMixin,
  useDiscriminateMixin,
} from "../mixins/discriminate.js";
import { intoMixin, type IntoMixin, useIntoMixin } from "../mixins/into.js";
import {
  type NarrowMixin,
  narrowMixin,
  useNarrowMixin,
} from "../mixins/narrow.js";
import {
  InternalPrimitiveState,
  State,
  StateChange,
  statePrivate,
  StateChangeFlow,
  undefinedValue,
} from "../state/index.ts";
import { type EnsoUtils } from "../utils.ts";
import { Field } from "../field/index.tsx";

//#region Form

export class Form<
  Payload extends object & { length?: never }
> extends Field<Payload> {
  // #id: string;
  // #payload: Payload;
  // #dirty: boolean = false;
  // #errors: FieldError[] = [];
  // #target = new EventTarget();

  constructor(initial: Form.InitialPayload<Payload>) {
    super(initial());

    // this.#id = nanoid();

    // this.#useWatchEffect.bind(this);
    // this.#useWatchState.bind(this);
  }

  handleSubmit(callback: Form.HandleSubmitCallback<Payload>) {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // [TODO] Resolve the form

      // await callback(this.#payload);
    };
  }

  commit(): void {}

  // get at(): LegacyField.At<Payload> {
  //   return {};
  // }

  // get $(): Form.$<Payload> {
  //   return {};
  // }

  // get dirty() {
  //   return this.#dirty;
  // }

  get submitting() {
    return false;
  }
}

export namespace Form {
  export interface UseProps<Payload extends object & { length?: never }> {
    initial: InitialPayload<Payload>;
    resolve?: Resolve<Payload>;
  }

  export type InitialPayload<Payload> = () => Payload;

  export type Resolve<Payload extends object & { length?: never }> = (
    form: Form<Payload>
  ) => void;

  export type HandleSubmitCallback<Payload> = (
    payload: Payload
  ) => unknown | Promise<unknown>;

  export type $<Payload> = Payload extends Record<string, any>
    ? {
        [Key in keyof Payload]-?: Field<Payload[Key]>;
      }
    : never;
}

//#endregion
