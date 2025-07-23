import { DependencyList, FormEvent, ReactElement } from "react";
import type { Atom } from "../atom/definition.ts";
import { Field } from "../field/definition.ts";

const hintSymbol = Symbol();

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

  [hintSymbol]: true;

  constructor(initialValue: Value, options?: Form.Options<Value>);

  //#endregion Instance

  //#region Attributes

  get id(): string;

  get field(): Field<Value>;

  //#endregion

  //#region Value

  get value(): Atom.Value.Prop<Atom.Def<Value>>;

  useValue(): Atom.Value.Opaque<Value>;

  set(value: Value): void;

  get dirty(): boolean;

  useDirty(): boolean;

  commit(): void;

  reset(): void;

  //#endregion

  //#region Tree

  get $(): Atom.$.Prop<"field", Value>;

  at: Atom.At.Prop<"field", Value>;

  try: Atom.Try.Prop<"field", Value>;

  //#endregion

  //#region Status

  get submitting(): boolean;

  useSubmitting(): boolean;

  //#endregion

  //#region Validation

  get errors(): Field.Error[];

  useErrors(): Field.Error[];

  get valid(): boolean;

  useValid(): boolean;

  //#endregion

  //#region Events

  watch(callback: Atom.Watch.Callback<Atom.Def<Value>>): Atom.Unwatch;

  useWatch(
    callback: Atom.Watch.Callback<Atom.Def<Value>>,
    deps: DependencyList,
  ): Atom.Unwatch;

  //#endregion
}

export namespace Form {
  export interface Interface<Value>
    extends Field.Ish.Value,
      Field.Ish.Validation {
    //#region Instance

    [hintSymbol]: true;

    //#endregion

    //#region Attributes

    id: string;

    field: Field<Value>;

    //#endregion

    //#region Value

    value: Atom.Value.Prop<Atom.Def<Value>>;

    useValue(): Atom.Value.Opaque<Value>;

    set(value: Value): void;

    //#endregion

    //#region Tree

    get $(): Atom.$.Prop<"field", Value>;

    at: Atom.At.Prop<"field", Value>;

    try: Atom.Try.Prop<"field", Value>;

    //#endregion

    //#region Events

    watch(callback: Atom.Watch.Callback<Atom.Def<Value>>): Atom.Unwatch;

    useWatch(
      callback: Atom.Watch.Callback<Atom.Def<Value>>,
      deps: DependencyList,
    ): Atom.Unwatch;

    //#endregion
  }

  export interface Options<Value> {
    id?: string;
    validate?: Field.Validator<Value, undefined>;
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
