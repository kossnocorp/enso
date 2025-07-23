import React, { DependencyList, FocusEventHandler, ReactElement } from "react";
import { Atom } from "../atom/index.js";
import type { EnsoUtils as Utils } from "../utils.ts";
import { FieldRef } from "./definition.ts";

export * from "./ref/index.js";

const hintSymbol = Symbol();

export declare class Field<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >
  extends Atom<"field" | "exact", Atom.Def<Value>, Qualifier, Parent>
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
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >(
    value: Value,
    parent?: Atom.Parent.Ref<"field", Parent>,
  ): Atom.Envelop<"field" | "exact", Atom.Def<Value>, Qualifier, Parent>;

  static base<Envelop extends Field<any>>(
    field: Envelop,
  ): Atom.Base.Result<"field", Envelop>;

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): Field.Exact<Value>;

  static useEnsure<
    FieldType extends Atom.Envelop<"field", any> | Utils.Nullish,
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
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > = "immutable" extends Flavor
    ? Immutable.Internal<ValueDef, Qualifier, Parent>
    : "base" extends Flavor
      ? Base.Internal<ValueDef, Qualifier, Parent>
      : "exact" extends Flavor
        ? Exact.Internal<ValueDef, Qualifier, Parent>
        : never;

  //#region Interface

  //#region Exact

  export interface Exact<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Exact.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Exact {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Atom.Exact<"field" | "exact", ValueDef, Qualifier, Parent>,
        Immutable.Interface<"exact", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > extends Atom.Exact<"field" | Variant, Atom.Def<Value>, Qualifier, Parent>,
        Immutable.Interface<Variant, Atom.Def<Value>, Qualifier, Parent> {}
  }

  //#endregion

  //#region Base

  export interface Base<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Base.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Base {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Base.Interface<"base", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<Variant, ValueDef, Qualifier, Parent> {}

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "base",
      Atom.Def<Value>,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Immutable.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Immutable {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<"immutable", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Ish.Value,
        Ish.Validation,
        Atom.Immutable<"field" | Variant, ValueDef, Qualifier, Parent> {
      [hintSymbol]: true;
    }

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "immutable",
      Atom.Def<Value>,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  //#endregion Immutable

  //#region Shared

  export type Shared<
    ValueTuple extends Atom.Shared.Value.Tuple,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Shared.Def<ValueTuple>
    > = Atom.Parent.Default,
  > = Shared.Exact<ValueTuple, Qualifier, Parent>;

  export namespace Shared {
    export type Def<ValueTuple extends Atom.Shared.Value.Tuple> =
      Atom.Shared.Def<ValueTuple>;

    export type Proxy<ValueTuple extends Atom.Shared.Value.Tuple> =
      Atom.Proxy.Qualifier<Atom.Shared.Def<ValueTuple>>;

    export type Exact<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = Field.Exact.Internal<Atom.Shared.Def<ValueTuple>, Qualifier, Parent>;

    export type Base<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = Field.Base.Internal<Atom.Shared.Def<ValueTuple>, Qualifier, Parent>;

    export type Immutable<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = Field.Immutable.Internal<
      Atom.Shared.Def<ValueTuple>,
      Qualifier,
      Parent
    >;
  }

  //#endregion
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
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Atom.Decompose.Result<"field", Atom.Def<Value>, Qualifier, Parent>;

  export type Discriminated<
    Value,
    Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Atom.Discriminate.Result<
    "field" | "exact",
    Atom.Def<Value>,
    Discriminator,
    Qualifier,
    Parent
  >;

  export type Proxy<SourceValue = any> = Atom.Proxy.Qualifier<
    Atom.Def<SourceValue>
  >;

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
