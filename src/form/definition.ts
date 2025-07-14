import { DependencyList, FormEvent, ReactElement } from "react";
import type { Atom } from "../atom/definition.ts";
import { Field } from "../field/definition.ts";
import { FieldValidation } from "../field/validation/index.ts";

export declare class Form<Value> implements Form.Interface<Value> {
  //#region Static

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
    options?: Form.Options<Value>,
  ): Form<Value>;

  static Component<Payload, IsServer extends boolean | undefined = undefined>(
    props: Form.Component.Props<Payload, IsServer>,
  ): ReactElement<HTMLFormElement>;

  //#endregion Static

  //#region Instance

  constructor(id: string, initialValue: Value, options?: Form.Options<Value>);

  //#endregion Instance

  //#region Field

  get field(): Field<Value>;

  //#endregion
}

export namespace Form {
  export interface Interface<Value> {
    field: Field<Value>;
  }

  export interface Options<Value> {
    validate?: FieldValidation.Validator<Value, undefined>;
  }

  export namespace Component {
    export interface Props<Value, IsServer extends boolean | undefined>
      extends Control.Props<Value, IsServer>,
        Omit<
          React.FormHTMLAttributes<HTMLFormElement>,
          "onSubmit" | "onReset"
        > {
      form: Form<Value>;
      children?: React.ReactNode;
    }
  }

  export namespace Control {
    export interface Props<Value, IsServer extends boolean | undefined> {
      onSubmit?: OnSubmit<Value, IsServer> | undefined;
      onReset?: OnReset | undefined;
      server?: IsServer;
    }

    export type OnSubmit<
      Value,
      IsServer extends boolean | undefined,
    > = true extends IsServer
      ? (payload: Value) => unknown | Promise<unknown>
      : (
          payload: Value,
          event: FormEvent<HTMLFormElement>,
        ) => unknown | Promise<unknown>;

    export interface OnReset {
      (event: FormEvent<HTMLFormElement>): unknown | Promise<unknown>;
    }
  }
}
