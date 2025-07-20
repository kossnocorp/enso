import { DependencyList } from "react";
import { Atom } from "../atom/index.ts";
import type { EnsoUtils as Utils } from "../utils.ts";
import { Static } from "../field/util.ts";

const hintSymbol = Symbol();

export class State<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >
  extends Atom<"state" | "exact", Value, Qualifier, Parent>
  implements
    Static<
      typeof State<Value, Qualifier, Parent>,
      Atom.Static.Subclass<"state">
    >,
    State.Exact<Value, Qualifier, Parent>
{
  //#region Static

  // Atom

  static create<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >(
    value: Value,
    parent?: Atom.Parent.Def<"state", Parent>,
  ): State<Value, Qualifier, Parent> {
    return void 0 as any;
  }

  static base<Envelop extends State<any>>(
    atom: Envelop,
  ): Atom.Base.Result<"state", Envelop> {
    return void 0 as any;
  }

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): State.Exact<Value> {
    return void 0 as any;
  }

  static useEnsure<
    StateType extends State<any> | Utils.Nullish,
    MappedValue = undefined,
  >(
    field: StateType,
    map?: Atom.Static.Ensure.Mapper<"state", StateType, MappedValue>,
  ): Atom.Static.Ensure.Result<"state", StateType, MappedValue> {
    return void 0 as any;
  }

  //#endregion

  [hintSymbol]: true = true;
}

export namespace State {
  export type Envelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = "immutable" extends Type
    ? Immutable<Value, Qualifier, Parent>
    : "base" extends Type
      ? Base<Value, Qualifier, Parent>
      : "exact" extends Type
        ? Exact<Value, Qualifier, Parent>
        : never;

  export interface Exact<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Hint,
      Atom.Exact<"state" | "exact", Value, Qualifier, Parent> {}

  export interface Base<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Hint,
      Atom.Base<"state" | "base", Value, Qualifier, Parent> {}

  export interface Immutable<
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Hint,
      Atom.Immutable<"state" | "immutable", Value, Qualifier, Parent> {}

  export interface Hint {
    [hintSymbol]: true;
  }

  export type Parent<Value, Key extends keyof Value> = Atom.Parent.Interface<
    Value,
    Key
  >;
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
