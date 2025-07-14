import React, { DependencyList } from "react";
import { Atom } from "../atom/index.js";
import type { EnsoUtils as Utils } from "../utils.ts";
import { FieldOld } from "./old.tsx";
import { Static } from "./util.ts";

const hintSymbol = Symbol();

export declare class Field<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
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
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
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
    // WIP:
    props: FieldOld.ComponentProps<
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
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
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
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > extends Hint,
      Atom.Invariant<"field" | "invariant", Value, Qualifier, Parent>,
      ImmutableBase<Value> {}

  export interface Common<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > extends Hint,
      Atom.Common<"field" | "common", Value, Qualifier, Parent>,
      ImmutableBase<Value> {}

  export namespace Common {
    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = never,
      Parent extends Atom.Parent.Constraint<Value> = never,
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
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > extends Hint,
      Atom.Immutable<"field" | "immutable", Value, Qualifier, Parent>,
      ImmutableBase<Value> {}

  export namespace Immutable {
    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = never,
      Parent extends Atom.Parent.Constraint<Value> = never,
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
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > = Atom.Decompose.Result<"field", Value, Qualifier, Parent>;

  export type Discriminated<
    Value,
    Discriminator extends Atom.Discriminate.Discriminator<Value>,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > = Atom.Discriminate.Result<
    "field" | "invariant",
    Value,
    Discriminator,
    Qualifier,
    Parent
  >;

  //#endregion Transform
}
