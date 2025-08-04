import { DependencyList, FormEvent, ReactElement } from "react";
import type { Atom } from "../atom/definition.ts";
import { Field } from "../field/definition.ts";

export declare const formChange: Form.Change;

const hintSymbol = Symbol();

export declare class Form<Value> implements Form.Interface<Value> {
  //#region Static

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
    options?: Form.Options<Value>,
  ): Form<Value>;

  static Component<Payload, IsServer extends boolean | undefined = undefined>(
    props: Form.ComponentProps<Payload, IsServer>,
  ): ReactElement<HTMLFormElement>;

  //#endregion

  //#region Instance

  [hintSymbol]: true;

  constructor(initialValue: Value, options?: Form.Options<Value>);

  //#endregion

  //#region Attributes

  get id(): string;

  get field(): Field<Value>;

  //#endregion

  //#region Value

  get value(): Atom.Value.Prop<Atom.Def<Value>>;

  useValue: Atom.Value.Use.Prop<
    "field",
    "exact",
    Atom.Def<Value>,
    Atom.Qualifier.Default
  >;

  set(value: Value): void;

  get dirty(): boolean;

  useDirty: Field.Dirty.Use.Prop<Atom.Qualifier.Default>;

  commit(): void;

  reset(): void;

  get initial(): Atom.Value.Prop<Atom.Def<Value>>;

  //#endregion

  //#region Tree

  get $(): Atom.$.Prop<"field", "exact", Value, Atom.Qualifier.Default>;

  at: Atom.At.Prop<"field", "exact", Value, Atom.Qualifier.Default>;

  try: Atom.TryProp<
    "field",
    "exact",
    Atom.Def<Value>,
    Atom.Qualifier.Default,
    Atom.Parent.Default
  >;

  //#endregion

  //#region Events

  watch(callback: Atom.Watch.Callback<Atom.Def<Value>>): Atom.Unwatch;

  useWatch(
    callback: Atom.Watch.Callback<Atom.Def<Value>>,
    deps: DependencyList,
  ): Atom.Unwatch;

  //#endregion

  //#region Status

  get submitting(): boolean;

  useSubmitting(): boolean;

  //#endregion

  //#region Validation

  get errors(): Field.Error[];

  useErrors: Field.Errors.Use.Prop<Atom.Qualifier.Default>;

  get valid(): boolean;

  useValid: Field.Valid.Use.Prop<Atom.Qualifier.Default>;

  validate(validator: Field.Validator<Value>): Promise<void>;

  addError: Field.AddError.Prop;

  clearErrors(): void;

  //#endregion

  //#region Form

  control<IsServer extends boolean | undefined = undefined>(
    props?: Form.ControlProps<Value, IsServer> | undefined,
  ): Form.ControlRegistration;

  //#endregion
}

export namespace Form {
  export interface Interface<Value>
    extends Field.Ish.Value.Read<Atom.Def<Value>, Atom.Qualifier.Default>,
      Field.Ish.Value.Write<Atom.Qualifier.Default>,
      Field.Ish.Validation<Atom.Def<Value>, Atom.Qualifier.Default> {
    //#region Instance

    [hintSymbol]: true;

    //#endregion

    //#region Attributes

    id: string;

    field: Field<Value>;

    //#endregion

    //#region Value

    value: Atom.Value.Prop<Atom.Def<Value>>;

    useValue: Atom.Value.Use.Prop<
      "field",
      "exact",
      Atom.Def<Value>,
      Atom.Qualifier.Default
    >;

    set(value: Value): void;

    //#endregion

    //#region Tree

    get $(): Atom.$.Prop<"field", "exact", Value, Atom.Qualifier.Default>;

    at: Atom.At.Prop<"field", "exact", Value, Atom.Qualifier.Default>;

    try: Atom.TryProp<
      "field",
      "exact",
      Atom.Def<Value>,
      Atom.Qualifier.Default,
      Atom.Parent.Default
    >;

    //#endregion

    //#region Events

    watch(callback: Atom.Watch.Callback<Atom.Def<Value>>): Atom.Unwatch;

    useWatch(
      callback: Atom.Watch.Callback<Atom.Def<Value>>,
      deps: DependencyList,
    ): Atom.Unwatch;

    //#endregion
  }

  //#region Events

  export interface Change {
    formSubmitting: bigint;
    formSubmitted: bigint;
    formValid: bigint;
    formInvalid: bigint;
  }

  //#endregion

  //#region Form

  export interface Options<Value> {
    id?: string;
    validate?: Field.Validator<Value>;
  }

  export interface ComponentProps<Value, IsServer extends boolean | undefined>
    extends ControlProps<Value, IsServer>,
      Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onReset"> {
    form: Form<Value>;
    children?: React.ReactNode;
  }

  export interface ControlProps<Value, IsServer extends boolean | undefined> {
    onSubmit?: Control.OnSubmit<Value, IsServer> | undefined;
    onReset?: Control.OnReset | undefined;
    server?: IsServer;
  }

  export interface ControlRegistration {
    onSubmit(event: React.FormEvent<HTMLFormElement>): void;
    onReset(event: React.FormEvent<HTMLFormElement>): void;
  }

  export namespace Control {
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

  //#endregion
}
