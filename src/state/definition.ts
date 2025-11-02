import { DependencyList } from "react";
import type { Atom } from "../atom/index.js";
import type { EnsoUtils as Utils } from "../utils.ts";

const hintSymbol = Symbol();

export declare class State<
    Value,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >
  extends Atom<
    "state",
    "exact",
    Atom.Def<Value>,
    Atom.Qualifier.Internalize<Qualifier>,
    Parent
  >
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
  ): Atom.Envelop<"state", "exact", Atom.Def<Value>, Qualifier, Parent>;

  static base<Envelop extends Atom.Envelop<"state", any, any>>(
    state: Envelop,
  ): Atom.Base.Result<"state", Envelop>;

  static proxy<
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    ComputedValue,
    MappedValue,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  >(
    state: State.Envelop<Variant, ValueDef, Qualifier, Parent>,
    intoMapper: Atom.Proxy.Into.Mapper<ValueDef, ComputedValue>,
    fromMapper: Atom.Proxy.From.Mapper<ValueDef, ComputedValue, MappedValue>,
  ): Atom.Proxy.Envelop<
    "state",
    Variant,
    ValueDef,
    ComputedValue,
    Qualifier,
    Parent
  >;

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): State.Exact<Value>;

  static useEnsure<
    StateType extends Atom.Envelop<"state", any, any> | Utils.Falsy,
    MappedType extends
      | Atom.Envelop<"state", any, any>
      | Utils.Falsy = undefined,
  >(
    state: StateType,
    map?: Atom.Static.Ensure.Mapper<"state", StateType, MappedType>,
  ): Atom.Static.Ensure.Result<"state", StateType, MappedType>;

  //#endregion

  //#region Instance

  [hintSymbol]: true;

  //#endregion
}

export namespace State {
  export type Envelop<
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > = "immutable" extends Variant
    ? Immutable.Internal<ValueDef, Qualifier, Parent>
    : "optional" extends Variant
      ? Optional.Internal<ValueDef, Qualifier, Parent>
      : "base" extends Variant
        ? Base.Internal<ValueDef, Qualifier, Parent>
        : "exact" extends Variant
          ? Exact.Internal<ValueDef, Qualifier, Parent>
          : never;

  export type Prop = "state";

  // #region Exact

  export interface Exact<
    Value,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Exact.Internal<
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    > {}

  export namespace Exact {
    export interface Internal<
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Atom.Exact<"state", "exact", ValueDef, Qualifier, Parent>,
        Immutable.Interface<"exact", ValueDef, Qualifier, Parent> {}

    export type Decomposed<
      Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Decompose.Result<
      "state",
      "exact",
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DecomposedVariant<
      Value,
      Variant extends Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Decomposed<Value, Qualifier, Parent> & { value: Variant };

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "state",
      "exact",
      Atom.Def<Value>,
      Discriminator,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DiscriminatedVariant<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Variant extends Discriminator extends keyof Value
        ? Value[Discriminator]
        : never,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Discriminated<Value, Discriminator, Qualifier, Parent> & {
      discriminator: Variant;
    };
  }

  //#endregion

  //#region Base

  export interface Base<
    Value,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Base.Internal<
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    > {}

  export namespace Base {
    export interface Internal<
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Base.Interface<"base", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<Variant, ValueDef, Qualifier, Parent> {}

    export type Decomposed<
      Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Decompose.Result<
      "state",
      "base",
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DecomposedVariant<
      Value,
      Variant extends Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Decomposed<Value, Qualifier, Parent> & { value: Variant };

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "state",
      "base",
      Atom.Def<Value>,
      Discriminator,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DiscriminatedVariant<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Variant extends Discriminator extends keyof Value
        ? Value[Discriminator]
        : never,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Discriminated<Value, Discriminator, Qualifier, Parent> & {
      discriminator: Variant;
    };
  }

  //#endregion

  //#region Optional

  export interface Optional<
    Value,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Optional.Internal<
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    > {}

  export namespace Optional {
    export interface Internal<
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Optional.Interface<"optional", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<Variant, ValueDef, Qualifier, Parent> {}

    export type Decomposed<
      Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Decompose.Result<
      "state",
      "optional",
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DecomposedVariant<
      Value,
      Variant extends Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Decomposed<Value, Qualifier, Parent> & { value: Variant };

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "state",
      "optional",
      Atom.Def<Value>,
      Discriminator,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DiscriminatedVariant<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Variant extends Discriminator extends keyof Value
        ? Value[Discriminator]
        : never,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Discriminated<Value, Discriminator, Qualifier, Parent> & {
      discriminator: Variant;
    };
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Value,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Immutable.Internal<
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    > {}

  export namespace Immutable {
    export interface Internal<
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<"immutable", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Atom.Immutable<"state", Variant, ValueDef, Qualifier, Parent> {
      [hintSymbol]: true;
    }

    export type Decomposed<
      Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Decompose.Result<
      "state",
      "immutable",
      Atom.Def<Value>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DecomposedVariant<
      Value,
      Variant extends Value,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Decomposed<Value, Qualifier, Parent> & { value: Variant };

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "state",
      "immutable",
      Atom.Def<Value>,
      Discriminator,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type DiscriminatedVariant<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Variant extends Discriminator extends keyof Value
        ? Value[Discriminator]
        : never,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Discriminated<Value, Discriminator, Qualifier, Parent> & {
      discriminator: Variant;
    };
  }

  //#endregion

  //#region Shared

  export type Shared<
    ValueTuple extends Atom.Shared.Value.Tuple,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
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
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = State.Exact.Internal<
      Atom.Shared.Def<ValueTuple>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type Base<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = State.Base.Internal<
      Atom.Shared.Def<ValueTuple>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;

    export type Immutable<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends
        Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = State.Immutable.Internal<
      Atom.Shared.Def<ValueTuple>,
      Atom.Qualifier.Internalize<Qualifier>,
      Parent
    >;
  }

  //#endregion

  //#region Value

  export type Def<ReadValue, WriteValue = ReadValue> = Atom.Def<
    ReadValue,
    WriteValue
  >;

  export namespace Value {
    export namespace Use {
      export interface Props extends Meta.Props {
        meta?: boolean | undefined;
      }

      export type IncludeMeta<Props extends Use.Props | undefined> =
        undefined extends Props
          ? false
          : Props extends Use.Props
            ? Props["meta"] extends true
              ? true
              : Props["meta"] extends false
                ? false
                : false
            : never;
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
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Atom.Decompose.Result<
    "state",
    "exact",
    Atom.Def<Value>,
    Atom.Qualifier.Internalize<Qualifier>,
    Parent
  >;

  export type DecomposedVariant<
    Value,
    Variant extends Value,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Decomposed<Value, Qualifier, Parent> & { value: Variant };

  export type Discriminated<
    Value,
    Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Atom.Discriminate.Result<
    "state",
    "exact",
    Atom.Def<Value>,
    Discriminator,
    Atom.Qualifier.Internalize<Qualifier>,
    Parent
  >;

  export type DiscriminatedVariant<
    Value,
    Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
    Variant extends Discriminator extends keyof Value
      ? Value[Discriminator]
      : never,
    Qualifier extends
      Atom.Qualifier.External.Constraint = Atom.Qualifier.External.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Discriminated<Value, Discriminator, Qualifier, Parent> & {
    discriminator: Variant;
  };

  export type Proxy<SourceValue = any> = Atom.Proxy.Qualifier<
    Atom.Def<SourceValue>
  >;

  //#endregion

  //#region Meta

  export interface Meta<Props extends Meta.Props | undefined> {}

  export namespace Meta {
    export interface Props {}
  }

  //#endregion
}
