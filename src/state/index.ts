import { DependencyList } from "react";
import { Atom } from "../atom/index.ts";
import type { EnsoUtils as Utils } from "../utils.ts";
import { Static } from "../field/util.ts";

const hintSymbol = Symbol();

export class State<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"state", Value> = unknown,
  >
  extends Atom<"state", Value, Qualifier, Parent>
  implements
    Static<
      typeof State<Value, Qualifier, Parent>,
      Atom.StaticSubclass<"state">
    >,
    State.Invariant<Value, Qualifier, Parent>
{
  //#region Static

  static create<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"state", Value> = undefined,
  >(value: Value, parent?: Parent): State<Value, Qualifier, Parent> {
    return void 0 as any;
  }

  static common<Envelop extends State.Common<any>>(
    atom: Envelop,
  ): Atom.Common.Join<"state", Envelop> {
    return void 0 as any;
  }

  static override use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): State.Invariant<Value> {
    return void 0 as any;
  }

  //#endregion

  [hintSymbol]: true = true;
}

// ^^^^^^^^^^^^^^^^^^^ PROCESSED ^^^^^^^^^^^^^^^^^^^

// vvvvvvvvvvvvvvvvvvv  PENDING  vvvvvvvvvvvvvvvvvvv

export namespace State {
  export type Envelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > = "immutable" extends Type
    ? Immutable<Value, Qualifier, Parent>
    : "common" extends Type
      ? Common<Value, Qualifier, Parent>
      : "invariant" extends Type
        ? Invariant<Value, Qualifier, Parent>
        : never;

  export interface Invariant<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"state", Value> = unknown,
  > extends Hint,
      Atom.Invariant<"state" | "invariant", Value, Qualifier, Parent> {}

  export interface Common<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"state", Value> = unknown,
  > extends Hint,
      Atom.Common<"state" | "common", Value, Qualifier, Parent> {}

  export interface Immutable<
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"state", Value> = unknown,
  > extends Hint,
      Atom.Immutable<"state" | "immutable", Value, Qualifier, Parent> {}

  export interface Hint {
    [hintSymbol]: true;
  }

  export type Parent<Value, Key extends keyof Value> = Atom.Parent<
    "state",
    Value,
    Key
  >;

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
      extends Atom.Value.Primitive<"state", Value> {}

    export interface Collection<Value>
      extends Atom.Value.Collection<"state", Value> {}

    export interface Array<Value extends unknown[]>
      extends Atom.Value.Array<"state", Value> {}

    export interface Tuple<Value extends Utils.Tuple>
      extends Atom.Value.Tuple<"state", Value> {}

    export interface Object<Value> extends Atom.Value.Object<"state", Value> {}
  }

  //#endregion
}

export namespace AsState {
  export interface Read {
    asState<Value>(state: unknown): ReadResult<Value>;

    fromField<Value>(state: State<Value> | undefined): unknown;
  }

  export type ReadResult<Value> = InternalStateRead<Value>;

  export interface ReadWrite {
    asState<Value>(state: unknown): ReadWriteResult<Value>;

    fromField<Value>(state: State<Value>): unknown;
  }

  export type ReadWriteResult<Value> =
    | InternalStateReadWrite<Value>
    | undefined;

  export interface InternalStateRead<Value> {
    get(): Value;
  }

  export interface InternalStateReadWrite<Value>
    extends InternalStateRead<Value> {}
}
