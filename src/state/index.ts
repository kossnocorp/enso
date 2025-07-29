import { DependencyList } from "react";
import { Atom } from "../atom/definition.ts";
import type { EnsoUtils as Utils } from "../utils.ts";

const hintSymbol = Symbol();

export class State<
    Value,
    in out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >
  extends Atom<"state" | "exact", Atom.Def<Value>, Qualifier, Parent>
  implements
    Utils.StaticImplements<
      typeof State<Value, Qualifier, Parent>,
      Atom.Static.Subclass<"state">
    >,
    State.Exact<Value, Qualifier, Parent>
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
    parent?: Atom.Parent.Ref<"state", Qualifier, Parent>,
  ): State<Value, Qualifier, Parent> {
    return void 0 as any;
  }

  static base<Envelop extends State<any>>(
    atom: Envelop,
  ): Atom.Base.Result<"state", Envelop> {
    return void 0 as any;
  }

  static proxy<
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    ComputedValue,
    MappedValue,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  >(
    field: Atom.Envelop<"state" | Variant, ValueDef, Qualifier, Parent>,
    intoMapper: Atom.Proxy.Into.Mapper<ValueDef, ComputedValue>,
    fromMapper: Atom.Proxy.From.Mapper<ValueDef, ComputedValue, MappedValue>,
  ): Atom.Proxy.Envelop<
    "state" | "exact",
    ValueDef,
    ComputedValue,
    Qualifier,
    Parent
  > {
    return {} as any;
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
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > = "immutable" extends Flavor
    ? Immutable.Internal<ValueDef, Qualifier, Parent>
    : "optional" extends Flavor
      ? Optional.Internal<ValueDef, Qualifier, Parent>
      : "base" extends Flavor
        ? Base.Internal<ValueDef, Qualifier, Parent>
        : "exact" extends Flavor
          ? Exact.Internal<ValueDef, Qualifier, Parent>
          : never;

  // #region Exact

  export interface Exact<
    Value,
    in out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Exact.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Exact {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      in out Qualifier extends
        Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Hint,
        Atom.Exact<"state" | "exact", ValueDef, Qualifier, Parent> {}
  }

  //#endregion

  //#region Base

  export interface Base<
    /*out*/ Value,
    in out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Base.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Base {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Hint,
        Atom.Base<"state" | "base", ValueDef, Qualifier, Parent> {}
  }

  //#endregion

  //#region Optional

  export interface Optional<
    Value,
    in out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Optional.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Optional {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > extends Hint,
        Atom.Base<"state" | "optional", ValueDef, Qualifier, Parent> {}
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Value,
    in out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Immutable.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Immutable {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      in out Qualifier extends
        Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Hint,
        Atom.Immutable<"state" | "immutable", ValueDef, Qualifier, Parent> {}
  }

  //#endregion

  //#region Value

  export namespace Value {
    export namespace Use {
      export interface Props extends Meta.Props {
        meta?: boolean | undefined;
      }

      export type IncludeMeta<Props extends Use.Props | undefined> = false;
    }
  }

  //#endregion

  //#region Meta

  export interface Meta<Props extends Meta.Props | undefined> {}

  export namespace Meta {
    export interface Props {}
  }

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
