import React, { DependencyList, FocusEventHandler } from "react";
import { Atom } from "../atom/index.js";
import type { EnsoUtils as Utils } from "../utils.ts";
import { Static } from "./util.ts";

export * from "./ref/index.js";

const hintSymbol = Symbol();

export declare class Field<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >
  extends Atom<"field" | "invariant", Value, Qualifier, Parent>
  implements
    Static<
      typeof Field<Value, Qualifier, Parent>,
      Atom.StaticSubclass<"field">
    >,
    Field.Invariant<Value, Qualifier, Parent>,
    Field.ImmutableBase<Value>
{
  //#region Static

  static create<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >(
    value: Value,
    parent?: Atom.Parent.Def<"field", Parent>,
  ): Field<Value, Qualifier, Parent>;

  static common<Envelop extends Field.Common<any>>(
    atom: Envelop,
  ): Atom.Common.Join<"field", Envelop>;

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): Field.Invariant<Value>;

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
  ): React.ReactNode;

  //#endregion Static

  //#region Instance

  [hintSymbol]: true;

  //#endregion Instance
}

export namespace Field {
  export type Envelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = "immutable" extends Type
    ? Immutable<Value, Qualifier, Parent>
    : "common" extends Type
      ? Common<Value, Qualifier, Parent>
      : "invariant" extends Type
        ? Invariant<Value, Qualifier, Parent>
        : never;

  //#region Interface

  export interface Invariant<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Hint,
      Atom.Invariant<"field" | "invariant", Value, Qualifier, Parent>,
      ImmutableBase<Value> {}

  export interface Common<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Hint,
      Atom.Common<"field" | "common", Value, Qualifier, Parent>,
      ImmutableBase<Value> {}

  export namespace Common {
    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "common",
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
  > extends Hint,
      Atom.Immutable<"field" | "immutable", Value, Qualifier, Parent>,
      ImmutableBase<Value> {}

  export namespace Immutable {
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

  export interface ImmutableBase<Value> {}

  export interface Hint {
    [hintSymbol]: true;
  }

  //#endregion

  export type Parent<
    ParentValue,
    Key extends keyof ParentValue,
  > = Atom.Parent.Interface<ParentValue, Key>;

  //#region Value

  export namespace Value {
    export type Variable<Value> = Value extends Utils.Tuple
      ? Tuple<Value>
      : Value extends unknown[]
        ? Array<Value>
        : Value extends object
          ? Object<Value>
          : Primitive<Value>;

    export interface Primitive<Value>
      extends Atom.Value.Primitive<"field", Value> {}

    export interface Collection<Value>
      extends Atom.Value.Collection<"field", Value> {}

    export interface Array<Value extends unknown[]>
      extends Atom.Value.Array<"field", Value> {}

    export interface Tuple<Value extends Utils.Tuple>
      extends Atom.Value.Tuple<"field", Value> {}

    export interface Object<Value> extends Atom.Value.Object<"field", Value> {}
  }

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
    "field" | "invariant",
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

  //#endregion Input

  //#endregion Control
}
