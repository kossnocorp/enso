import { EnsoUtils as Utils } from "../../utils.ts";
import type { Atom } from "../index.js";
import type { FieldRef } from "../../field/ref/definition.ts";

export declare class AtomRef<
  Type extends AtomRef.Type,
  Value,
  Qualifier extends AtomRef.Qualifier = never,
  ParentValue = unknown,
> implements AtomRef.Interface<Type, Value, Qualifier, ParentValue>
{
  //#region Value

  value: Atom.ValueProp<Value>;

  //#endregion Value

  //#region Type

  forEach: AtomRef.ForEachProp<Type, Value>;

  //#endregion Type
}

export namespace AtomRef {
  //#region Shell

  // WIP: Try to find a better name for this type, so region can be more precise.
  export type Type = Atom.Type | Shell | Variant;

  export type Shell = "ref" | "ref-ghost";

  export type Variant = never;

  // WIP: Try to get rid of it. The purpose is to have symmetry with Atom but it
  // might be simple Extract, however I can't check until I stabilize tysts.

  export type NonShell = Exclude<Type, Atom.Type | Shell>;

  export type NonVariant = Exclude<Type, Atom.Type | Variant>;

  export type Envelop<
    Type extends AtomRef.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  > =
    Extract<Type, Atom.Shell> extends "field"
      ? FieldRef.Envelop<Type, Value, Qualifier, ParentValue>
      : ExtractShell<Type>;

  export type Every<
    Type extends AtomRef.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  > =
    // Handle boolean separately, so it doesn't produce `Ref<..., true> | Ref<..., false>`
    | (boolean extends Value
        ? Envelop<Type, Value, Qualifier, ParentValue>
        : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? Envelop<Type, Value, Qualifier, ParentValue>
          : never
        : never);

  export type ExtractShell<Type extends AtomRef.Type> =
    Utils.IsNever<Exclude<Type, NonShell>> extends true
      ? unknown
      : Type extends Shell
        ? Type
        : never;

  export type ExtractVariant<_Type extends AtomRef.Type> = never;

  //#endregion Shell

  //#region Qualifier

  export type Qualifier = never;

  export namespace Qualifier {}

  //#endregion

  //#region Child

  export type Child<
    Shell extends AtomRef.Type,
    ParentValue,
    Key extends keyof ParentValue,
  > = Envelop<
    Child.Type<Shell>,
    Child.Value<ParentValue, Key>,
    Child.Qualifier<ParentValue, Key>
  >;

  export namespace Child {
    export type Every<
      Shell extends AtomRef.Type,
      ParentValue,
      Key extends keyof ParentValue,
    > = AtomRef.Every<
      Shell,
      Child.Value<ParentValue, Key>,
      Child.Qualifier<ParentValue, Key>
    >;

    export type Type<Type extends AtomRef.Type> = Type;

    export type Value<Value, Key extends keyof Value> =
      | Value[Key]
      | (Utils.IsStaticKey<Value, Key> extends true ? never : undefined);

    export type Qualifier<
      ParentValue,
      _ParentKey extends keyof Utils.NonNullish<ParentValue>,
    > = never;
  }

  //#endregion Child

  //#region Interface

  export interface Interface<
    Type extends AtomRef.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  > {
    //#region Value

    value: Atom.ValueProp<Value>;

    //#endregion Value

    //#region Type

    forEach: AtomRef.ForEachProp<Type, Value>;

    //#endregion Type
  }

  //#endregion Interface

  //#region Type

  //#region Collection

  export namespace Collection {
    //#region Collection.Callback

    export namespace Callback {
      // Tuple

      // NOTE: We have to have two separate overloads for objects `TuplePair`
      // and `TupleSingle` as with the current approach binding the key and
      // value in the arguments on the type level, TypeScript fails to find
      // the correct overload for when the callback accepts a single argument
      // (i.e. just the item field).

      export interface TuplePair<
        Type extends AtomRef.Type,
        Value extends Utils.Tuple,
        Result = void,
      > {
        (
          ...args: {
            [Key in Utils.IndexOfTuple<Value>]: [
              Envelop<Child.Type<Type>, Value[Key]>,
              Key,
            ];
          }[Utils.IndexOfTuple<Value>]
        ): Result;
      }

      export interface TupleSingle<
        Type extends AtomRef.Type,
        Value extends Utils.Tuple,
        Result = void,
      > {
        (
          item: {
            [Key in keyof Value]: Envelop<Type, Value[Key]>;
          }[Utils.IndexOfTuple<Value>],
          index?: Utils.IndexOfTuple<Value>,
        ): Result;
      }

      export type TupleSingleItem<
        Type extends AtomRef.Type,
        Value extends Utils.Tuple,
      > = {
        [Key in Utils.IndexOfTuple<Value>]: Envelop<Type, Value[Key]>;
      }[Utils.IndexOfTuple<Value>];

      // Array

      export interface Array<
        Type extends AtomRef.Type,
        Value extends unknown[],
        Result = void,
      > {
        (item: ArrayItem<Type, Value>, index: number): Result;
      }

      export type ArrayItem<
        Type extends AtomRef.Type,
        Value extends unknown[],
      > = Envelop<
        Child.Type<Type>,
        Value[number],
        Child.Qualifier<Value, number>
      >;

      // Object

      // NOTE: We have to have two separate overloads for objects `ObjectPair`
      // and `ObjectSingle` as with the current approach binding the key and
      // value in the arguments on the type level, TypeScript fails to find
      // the correct overload for when the callback accepts a single argument
      // (i.e. just the item field).

      export interface ObjectPair<
        Type extends AtomRef.Type,
        Value extends object,
        Result = void,
      > {
        (
          // Exclude is needed to remove undefined that appears when there're
          // optional fields in the object.
          ...args: Exclude<
            {
              [Key in Utils.CovariantifyKeyof<Value>]: [
                Child<Type, Value, Key>,
                Key,
              ];
            }[Utils.CovariantifyKeyof<Value>],
            undefined
          >
        ): Result;
      }

      export interface ObjectSingle<
        Type extends AtomRef.Type,
        Value extends object,
        Result = void,
      > {
        (
          // Exclude is needed to remove undefined that appears when there're
          // optional fields in the object.
          item: Exclude<
            { [Key in keyof Value]: Child<Type, Value, Key> }[keyof Value],
            undefined
          >,
        ): Result;
      }
    }

    //#endregion Collection.Callback
  }

  //#region ForEach

  export type ForEachProp<
    Type extends AtomRef.Type,
    Value,
  > = Value extends Utils.Tuple
    ? ForEachTuple<Type, Value>
    : Value extends unknown[]
      ? ForEachArray<Type, Value>
      : Value extends object
        ? ForEachObject<Type, Value>
        : never;

  export interface ForEachTuple<
    Type extends AtomRef.Type,
    Value extends Utils.Tuple,
  > {
    (callback: Collection.Callback.TuplePair<Type, Value>): void;

    (callback: Collection.Callback.TupleSingle<Type, Value>): void;
  }

  export interface ForEachArray<
    Type extends AtomRef.Type,
    Value extends unknown[],
    Result = void,
  > {
    (callback: Collection.Callback.Array<Type, Value, Result>): void;
  }

  export interface ForEachObject<
    Type extends AtomRef.Type,
    Value extends object,
  > {
    (callback: Collection.Callback.ObjectPair<Type, Value>): void;

    (callback: Collection.Callback.ObjectSingle<Type, Value>): void;
  }

  //#endregion ForEach

  //#endregion Collection

  //#endregion Type
}
