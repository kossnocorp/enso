import { EnsoUtils as Utils } from "../../utils.ts";
import type { Atom } from "../index.js";
import type { FieldRef } from "../../field/ref/definition.ts";

export declare class AtomRef<
  Flavor extends AtomRef.Flavor.Constraint,
  ValueDef extends Atom.Def.Constraint,
  Qualifier extends AtomRef.Qualifier = never,
  Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
> implements AtomRef.Interface<Flavor, ValueDef, Qualifier, Parent>
{
  //#region Value

  value: Atom.Value.Prop<ValueDef>;

  //#endregion Value

  //#region Type

  forEach: AtomRef.ForEachProp<Flavor, ValueDef>;

  //#endregion Type
}

export namespace AtomRef {
  //#region Flavor

  export namespace Flavor {
    // WIP: Try to find a better name for this type, so region can be more precise.
    export type Constraint = Atom.Flavor.Kind | Kind | Variant;

    export type Kind = "ref" | "ref-ghost";

    export type Variant = never;
  }

  // WIP: Try to get rid of it. The purpose is to have symmetry with Atom but it
  // might be simple Extract, however I can't check until I stabilize tysts.

  // export type NonKind = Exclude<Flavor, Atom.Flavor.Constraint | Kind>;

  // export type NonVariant = Exclude<Flavor, Atom.Flavor.Constraint | Variant>;

  export type Envelop<
    Type extends AtomRef.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > =
    Extract<Type, Atom.Flavor.Kind> extends "field"
      ? FieldRef.Envelop<Type, ValueDef, Qualifier, Parent>
      : never;

  export type ExtractKind<Kind extends AtomRef.Flavor.Constraint> =
    Utils.IsNever<Extract<Kind, Flavor.Kind>> extends true
      ? unknown
      : Kind extends Flavor.Kind
        ? Kind
        : never;

  export type ExtractVariant<_Type extends AtomRef.Flavor.Constraint> = never;

  //#endregion

  //#region Qualifier

  export type Qualifier = never;

  export namespace Qualifier {}

  //#endregion

  //#region Child

  export type Child<
    Kind extends AtomRef.Flavor.Constraint,
    ParentValue,
    Key extends keyof ParentValue,
    Access extends Atom.Child.Access,
  > = Envelop<
    Child.Type<Kind>,
    Child.Value<ParentValue, Key, Access>,
    Child.Qualifier<ParentValue, Key>
  >;

  export namespace Child {
    export type Type<Flavor extends AtomRef.Flavor.Constraint> = Extract<
      Flavor,
      AtomRef.Flavor.Kind
    >;

    export type Value<
      ParentValue,
      ParentKey extends keyof ParentValue,
      Access extends Atom.Child.Access,
    > = Utils.Expose<
      Atom.Def<
        | ParentValue[ParentKey]
        | (Access extends "indexed"
            ? Utils.IsStaticKey<ParentValue, ParentKey> extends true
              ? never
              : undefined
            : never)
      >
    >;

    export type Qualifier<
      ParentValue,
      ParentKey extends keyof Utils.NonNullish<ParentValue>,
    > = never;
  }

  //#endregion

  //#region Interface

  export interface Interface<
    Flavor extends AtomRef.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > {
    //#region Value

    value: Atom.Value.Prop<ValueDef>;

    //#endregion Value

    //#region Type

    forEach: AtomRef.ForEachProp<Flavor, ValueDef>;

    //#endregion Type
  }

  //#endregion Interface

  //#region Type

  //#region Collection

  export namespace Collection {
    //#region Handler

    // Tuple

    // NOTE: We have to have two separate overloads for objects `TuplePair`
    // and `TupleSingle` as with the current approach binding the key and
    // value in the arguments on the type level, TypeScript fails to find
    // the correct overload for when the callback accepts a single argument
    // (i.e. just the item field).

    export interface TupleHandlerPair<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends Utils.Tuple,
      Result = void,
    > {
      (
        ...args: {
          [Key in Utils.IndexOfTuple<Value>]: [
            Child<Flavor, Value, Key, "iterated">,
            Key,
          ];
        }[Utils.IndexOfTuple<Value>]
      ): Result;
    }

    export interface TupleHandlerSingle<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends Utils.Tuple,
      Result = void,
    > {
      (
        item: {
          [Key in keyof Value]: Envelop<Flavor, Atom.Def<Value[Key]>>;
        }[Utils.IndexOfTuple<Value>],
        index?: Utils.IndexOfTuple<Value>,
      ): Result;
    }

    export type TupleItem<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends Utils.Tuple,
    > = {
      [Key in Utils.IndexOfTuple<Value>]: Envelop<Flavor, Atom.Def<Value[Key]>>;
    }[Utils.IndexOfTuple<Value>];

    // Array

    export interface ArrayHandler<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends Utils.ArrayConstraint,
      Result = void,
    > {
      (item: Child<Flavor, Value, number, "iterated">, index: number): Result;
    }

    // Object

    // NOTE: We have to have two separate overloads for objects `ObjectPair`
    // and `ObjectSingle` as with the current approach binding the key and
    // value in the arguments on the type level, TypeScript fails to find
    // the correct overload for when the callback accepts a single argument
    // (i.e. just the item field).

    export interface ObjectHandlerPair<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends object,
      Result = void,
    > {
      (
        // Exclude is needed to remove undefined that appears when there're
        // optional fields in the object.
        ...args: Exclude<
          {
            [Key in Utils.CovariantifyKeyof<Value>]: [
              Child<Flavor, Value, Key, "iterated">,
              Key,
            ];
          }[Utils.CovariantifyKeyof<Value>],
          undefined
        >
      ): Result;
    }

    export interface ObjectHandlerSingle<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends object,
      Result = void,
    > {
      (
        // Exclude is needed to remove undefined that appears when there're
        // optional fields in the object.
        item: Exclude<
          {
            [Key in keyof Value]: Child<Flavor, Value, Key, "iterated">;
          }[keyof Value],
          undefined
        >,
      ): Result;
    }

    export type ObjectItem<
      Flavor extends AtomRef.Flavor.Constraint,
      Value extends object,
    > = Exclude<
      {
        [Key in keyof Value]: Child<Flavor, Value, Key, "iterated">;
      }[keyof Value],
      undefined
    >;

    //#endregion

    //#region Processor

    export type Mapper<
      Flavor extends AtomRef.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      ProcessorType extends Mapper.ResultType,
    > = ValueDef["read"] extends infer Value
      ? Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Mapper.Array<Flavor, Value, ProcessorType>
          : never
        : Value extends Utils.Tuple
          ? Mapper.Tuple<Flavor, Value, ProcessorType>
          : Value extends unknown[]
            ? Mapper.Array<Flavor, Value, ProcessorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : Mapper.Object<Flavor, Value, ProcessorType>
              : undefined
      : never;

    export namespace Mapper {
      export type ResultType = "each" | "map";

      export type CallbackResult<
        ProcessorType extends Mapper.ResultType,
        Result,
      > = ProcessorType extends "each" ? unknown : Result;

      export type Result<
        ProcessorType extends Mapper.ResultType,
        Result,
      > = ProcessorType extends "each" ? void : Result[];

      // Tuple

      export interface Tuple<
        Flavor extends AtomRef.Flavor.Constraint,
        Value extends Utils.Tuple,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.TupleHandlerPair<
            Flavor,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.TupleHandlerSingle<
            Flavor,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Array

      export interface Array<
        Flavor extends AtomRef.Flavor.Constraint,
        Value extends Utils.ArrayConstraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ArrayHandler<
            Flavor,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Object

      export interface Object<
        Flavor extends AtomRef.Flavor.Constraint,
        Value extends object,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ObjectHandlerPair<
            Flavor,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.ObjectHandlerSingle<
            Flavor,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }
    }

    //#endregion

    //#region Selector

    export type Selector<
      Flavor extends AtomRef.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      SelectorType extends Selector.Type,
    > = ValueDef["read"] extends infer Value
      ? Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Selector.Array<Flavor, Value, SelectorType>
          : undefined
        : Value extends Utils.Tuple
          ? Selector.Tuple<Flavor, Value, SelectorType>
          : Value extends unknown[]
            ? Selector.Array<Flavor, Value, SelectorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : Selector.Object<Flavor, Value, SelectorType>
              : undefined
      : never;

    export namespace Selector {
      export type Type = "find" | "filter";

      export type Result<
        SelectorType extends Selector.Type,
        Result,
      > = SelectorType extends "find" ? Result | undefined : Result[];

      // Tuple

      export interface Tuple<
        Flavor extends AtomRef.Flavor.Constraint,
        Value extends Utils.Tuple,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.TupleHandlerPair<Flavor, Value, unknown>,
        ): Result<SelectorType, Collection.TupleItem<Flavor, Value>>;

        (
          callback: Collection.TupleHandlerSingle<Flavor, Value, unknown>,
        ): Result<SelectorType, Collection.TupleItem<Flavor, Value>>;
      }

      // Array

      export interface Array<
        Flavor extends AtomRef.Flavor.Constraint,
        Value extends Utils.ArrayConstraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ArrayHandler<Flavor, Value, unknown>,
        ): Result<SelectorType, Child<Flavor, Value, number, "iterated">>;
      }

      // Object

      export interface Object<
        Flavor extends AtomRef.Flavor.Constraint,
        Value extends object,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ObjectHandlerPair<Flavor, Value, unknown>,
        ): Result<SelectorType, Collection.ObjectItem<Flavor, Value>>;

        (
          callback: Collection.ObjectHandlerSingle<Flavor, Value, unknown>,
        ): Result<SelectorType, Collection.ObjectItem<Flavor, Value>>;
      }
    }

    //#endregion
  }

  export type ForEachProp<
    Flavor extends AtomRef.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
  > = Collection.Mapper<Flavor, ValueDef, "each">;

  // export type MapProp<
  //   Flavor extends Atom.Flavor.Constraint,
  //   ValueDef extends Def.Constraint,
  // > = Collection.Mapper<Flavor, ValueDef, "map">;

  // export type FindProp<
  //   Flavor extends Atom.Flavor.Constraint,
  //   ValueDef extends Def.Constraint,
  // > = Collection.Selector<Flavor, ValueDef, "find">;

  // export type FilterProp<
  //   Flavor extends Atom.Flavor.Constraint,
  //   ValueDef extends Def.Constraint,
  // > = Collection.Selector<Flavor, ValueDef, "filter">;

  //#endregion

  //#endregion Type
}
