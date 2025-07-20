import React, { DependencyList, FocusEventHandler, ReactElement } from "react";
import { Atom } from "../atom/index.js";
import type { EnsoUtils as Utils } from "../utils.ts";
import { FieldRef } from "./definition.ts";

export * from "./ref/index.js";

const hintSymbol = Symbol();

export declare class Field<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >
  extends Atom<"field" | "exact", Value, Qualifier, Parent>
  implements
    Utils.StaticImplements<
      typeof Field<Value, Qualifier, Parent>,
      Atom.Static.Subclass<"field">
    >,
    Field.Exact<Value, Qualifier, Parent>
{
  //#region Static

  // Atom

  static create<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >(
    value: Value,
    parent?: Atom.Parent.Def<"field", Parent>,
  ): Atom.Envelop<"field" | "exact", Value, Qualifier, Parent>;

  static base<Envelop extends Field<any>>(
    field: Envelop,
  ): Atom.Base.Result<"field", Envelop>;

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): Field.Exact<Value>;

  static useEnsure<
    FieldType extends Field<any> | Utils.Nullish,
    MappedValue = undefined,
  >(
    field: FieldType,
    map?: Atom.Static.Ensure.Mapper<"field", FieldType, MappedValue>,
  ): Atom.Static.Ensure.Result<"field", FieldType, MappedValue>;

  // Field

  static Component<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorsEnable extends boolean = false,
    ValidEnable extends boolean = false,
  >(
    props: Field.Component.Props<
      Payload,
      MetaEnable,
      DirtyEnable,
      ErrorsEnable,
      ValidEnable
    >,
  ): ReactElement<HTMLElement>;

  //#endregion Static

  //#region Instance

  [hintSymbol]: true;

  //#endregion

  //#region Value

  get dirty(): boolean;

  useDirty(): boolean;

  commit(): void;

  reset(): void;

  //#endregion

  //#region Validation

  get errors(): Field.Error[];

  useErrors(): Field.Error[];

  get valid(): boolean;

  useValid(): boolean;

  //#endregion
}

export namespace Field {
  export type Envelop<
    Flavor extends Atom.Flavor,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = "immutable" extends Flavor
    ? Immutable<Value, Qualifier, Parent>
    : "base" extends Flavor
      ? Base<Value, Qualifier, Parent>
      : "exact" extends Flavor
        ? Exact<Value, Qualifier, Parent>
        : never;

  //#region Interface

  export interface Exact<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Exact.Interface<"exact", Value, Qualifier, Parent> {}

  export namespace Exact {
    export interface Interface<
      Variant extends Atom.Variant,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Atom.Exact<"field" | Variant, Value, Qualifier, Parent>,
        Immutable.Interface<Variant, Value, Qualifier, Parent> {}
  }

  export interface Base<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Base.Interface<"base", Value, Qualifier, Parent> {}

  export namespace Base {
    export interface Interface<
      Variant extends Atom.Variant,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Immutable.Interface<Variant, Value, Qualifier, Parent> {}

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "base",
      Value,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  export interface Immutable<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Immutable.Interface<"immutable", Value, Qualifier, Parent> {}

  export namespace Immutable {
    export interface Interface<
      Variant extends Atom.Variant,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Ish.Value,
        Ish.Validation,
        Atom.Immutable<"field" | Variant, Value, Qualifier, Parent> {
      [hintSymbol]: true;
    }

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "immutable",
      Value,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  export namespace Ish {
    export interface Value {
      dirty: boolean;

      useDirty(): boolean;

      commit(): void;

      reset(): void;
    }

    export interface Validation {
      errors: Field.Error[];

      useErrors(): Field.Error[];

      valid: boolean;

      useValid(): boolean;
    }
  }

  //#endregion

  //#region Tree

  export type Parent<
    ParentValue,
    Key extends keyof ParentValue,
  > = Atom.Parent.Interface<ParentValue, Key>;

  //#endregion

  //#region Events

  export type Unwatch = Atom.Unwatch;

  //#endregion

  //#region Transform

  export type Decomposed<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = Atom.Decompose.Result<"field", Value, Qualifier, Parent>;

  export type Discriminated<
    Value,
    Discriminator extends Atom.Discriminate.Discriminator<Value>,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = Atom.Discriminate.Result<
    "field" | "exact",
    Value,
    Discriminator,
    Qualifier,
    Parent
  >;

  export type Proxied<SourceValue = any> = Atom.Proxy.Qualifier<SourceValue>;

  //#endregion Transform

  //#region Meta

  export type Meta<Props extends Meta.Props | undefined> =
    Props extends Meta.Props
      ? {
          valid: Meta.Enable<Props["valid"], boolean>;
          errors: Meta.Enable<Props["errors"], Error[]>;
          dirty: Meta.Enable<Props["dirty"], boolean>;
        }
      : {
          valid: boolean;
          errors: Error[];
          dirty: boolean;
        };

  export namespace Meta {
    export interface Props {
      valid?: boolean | undefined;
      errors?: boolean | undefined;
      dirty?: boolean | undefined;
    }

    export type Enable<Enable, Payload> = Enable extends true
      ? Payload
      : Enable extends false
        ? undefined
        : Enable extends boolean
          ? Payload | undefined
          : Enable extends undefined
            ? undefined
            : never;
  }

  //#endregion Meta

  //#region Control

  //#region Component

  export namespace Component {
    export type Props<
      Payload,
      MetaEnable extends boolean | undefined = undefined,
      DirtyEnable extends boolean = false,
      ErrorsEnable extends boolean = false,
      ValidEnable extends boolean = false,
    > = {
      field: Field<Payload>;
      render: Render<
        Payload,
        MetaEnable extends true
          ? undefined
          : MetaEnable extends false
            ? {
                valid: false;
                errors: false;
                dirty: false;
              }
            : {
                valid: ValidEnable;
                errors: ErrorsEnable;
                dirty: DirtyEnable;
              }
      >;
      meta?: MetaEnable;
      dirty?: DirtyEnable;
      errors?: ErrorsEnable;
      valid?: ValidEnable;
    };

    export type Render<Payload, MetaProps extends Meta.Props | undefined> = (
      input: Input<Payload>,
      meta: Meta<MetaProps>,
    ) => React.ReactNode;
  }

  //#endregion Component

  //#region Input

  export type Input<Value> = {
    name: string;
    value: Value;
    onChange: Input.OnChange<Value>;
    onBlur: FocusEventHandler<Element>;
  };

  export namespace Input {
    export type OnChange<Value> = (value: Value) => void;
  }

  //#endregion

  //#endregion

  //#region Validation

  export interface Error {
    type?: string | undefined;
    message: string;
  }

  export type Validator<Value, Context = undefined> = undefined extends Context
    ? (payload: FieldRef<Value>) => Promise<void> | void
    : (payload: FieldRef<Value>, context: Context) => Promise<void> | void;

  //#endregion
}
