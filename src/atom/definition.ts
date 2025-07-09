import { DependencyList, useEffect } from "react";
import { ChangesEvent, FieldChange } from "../change/index.ts";
import { DetachedValue } from "../detached/index.ts";
import { Field } from "../field/definition.tsx";
import { State } from "../state/index.ts";
import { Enso } from "../types.ts";
import type { EnsoUtils as Utils } from "../utils.ts";
import { Static } from "../field/util.ts";

export declare class Atom<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  >
  implements
    Static<typeof Atom<Type, Value, Qualifier, Parent>, Atom.Static<any>>,
    Atom.Invariant<Type, Value, Qualifier, Parent>
{
  //#region Static

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): Atom.Envelop<any, Value>;

  //#endregion

  //#region Instance

  constructor(value: Value, parent?: Parent);

  deconstruct(): void;

  //#endregion

  //#region Qualifiers

  [AtomPrivate.rootQualifier]: Atom.QualifierProp<Qualifier, "root">;

  [AtomPrivate.detachableQualifier]: Atom.QualifierProp<
    Qualifier,
    "detachable"
  >;

  [AtomPrivate.triedQualifier]: Atom.QualifierProp<Qualifier, "tried">;

  [AtomPrivate.boundQualifier]: Atom.QualifierProp<Qualifier, "bound">;

  //#endregion

  //#region Attributes

  readonly id: string;

  //#endregion

  //#region Value

  get value(): Atom.ValueProp<Value>;

  useValue(): Atom.ValueProp<Value>;

  set: Atom.Set<Type, Value, Qualifier, Parent>;

  [AtomPrivate.invariantPhantom]: (
    value: Value,
  ) => Atom.Envelop<Type, Value, Qualifier, Parent>;

  get lastChanges(): FieldChange;

  //#endregion

  //#region Type

  get _(): Atom.Value.Variable<Type, Value>;

  //#endregion

  //#region Tree

  get root(): Atom.Root<Type>;

  get parent(): Parent;

  get key(): string;

  get $(): Atom.$Prop<Type, Value>;

  get path(): string[];

  get name(): string;

  //#endregion

  //#region Events

  watch(callback: Atom.WatchCallback<Value>, sync?: boolean): Atom.Unwatch;

  trigger(changes: FieldChange, notifyParents?: boolean): void;

  //#endregion
}

export namespace Atom {
  //#region Static

  export interface Static<Shell extends Atom.Shell> {
    use<Value>(
      initialValue: Value,
      deps: DependencyList,
    ): Atom.Envelop<Shell | "invariant", Value>;
  }

  export interface StaticSubclass<Type extends Atom.Type> {
    create<
      Value,
      Qualifier extends Atom.Qualifier = never,
      Parent extends Atom.Parent.Constraint<Type, Value> = undefined,
    >(
      value: Value,
      parent?: Parent,
    ): Envelop<Type, Value, Qualifier, Parent>;
  }

  //#endregion

  //#region Shell

  export type Shell = "state" | "field";

  export type Variant = "immutable" | "common" | "invariant";

  export type Type = Shell | Variant;

  export type Envelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > =
    ExtractShell<Type> extends "state"
      ? State.Envelop<"state" | ExtractVariant<Type>, Value, Qualifier, Parent>
      : ExtractShell<Type> extends "field"
        ? Field.Envelop<
            "field" | ExtractVariant<Type>,
            Value,
            Qualifier,
            Parent
          >
        : never;

  export type ExtractShell<Type extends Atom.Type> =
    Utils.IsNever<Exclude<Type, Variant>> extends true
      ? unknown
      : Type extends Shell
        ? Type
        : never;

  export type ExtractVariant<Type extends Atom.Type> =
    Utils.IsNever<Exclude<Type, Shell>> extends true
      ? "invariant"
      : Type extends Variant
        ? Type
        : never;

  //#endregion

  //#region Invariant

  export interface Invariant<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > extends Common<Type, Value, Qualifier, Parent> {
    //#region Value

    set: Set<Type, Value, Qualifier, Parent>;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.invariantPhantom]: (
      value: Value,
    ) => Atom.Envelop<Type, Value, Qualifier, Parent>;

    lastChanges: FieldChange;

    //#endregion

    //#region Events

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion
  }

  export namespace Invariant {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = never,
      Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
    > =
      ExtractShell<Type> extends "state"
        ? State.Invariant<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Invariant<Value, Qualifier, Parent>
          : never;
  }

  //#endregion

  //#region Common

  export interface Common<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > extends Immutable<Type, Value, Qualifier, Parent> {}

  export namespace Common {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = never,
      Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
    > =
      ExtractShell<Type> extends "state"
        ? State.Common<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Common<Value, Qualifier, Parent>
          : never;
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > extends Qualified<Qualifier> {
    //#region Instance

    deconstruct(): void;

    //#endregion

    readonly id: string;

    //#region Value

    value: ValueProp<Value>;

    useValue(): ValueProp<Value>;

    //#endregion

    //#region Type

    _: Value.Variable<Type, Value>;

    //#endregion

    //#region Tree

    root: Root<Type>;

    parent: Parent;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $Prop<Type, Value>;

    // try: {
    //   [Key in keyof Value]: TryKey<Type, Value, Key>;
    // };

    // at: <Key extends keyof Value>(key: Key) => AtKey<Type, Value, Key>;

    //#endregion

    //#region Type

    // narrow<NarrowedValue extends Value>(
    //   callback: NarrowCallback<Value, NarrowedValue>,
    // ): Envelop<Type, NarrowedValue> | undefined;

    //#endregion

    //#region Watch

    watch(callback: WatchCallback<Value>, sync?: boolean): Unwatch;

    //#endregion
  }

  export namespace Immutable {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = never,
      Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
    > =
      ExtractShell<Type> extends "state"
        ? State.Immutable<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Immutable<Value, Qualifier, Parent>
          : never;
  }

  //#endregion

  //#region Qualifier

  export type Qualifier = "root" | "detachable" | "tried" | "bound";

  export type QualifierProp<
    Qualifier extends Atom.Qualifier,
    TestQualifier extends Atom.Qualifier,
  > = TestQualifier extends Qualifier ? true : false;

  export interface Qualified<Qualifier extends Atom.Qualifier = never> {
    [AtomPrivate.rootQualifier]: Atom.QualifierProp<Qualifier, "root">;

    [AtomPrivate.detachableQualifier]: Atom.QualifierProp<
      Qualifier,
      "detachable"
    >;

    [AtomPrivate.triedQualifier]: Atom.QualifierProp<Qualifier, "tried">;

    [AtomPrivate.boundQualifier]: Atom.QualifierProp<Qualifier, "bound">;
  }

  //#endregion

  //#region Value

  export type ValueProp<Value> =
    // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
    // respectively, so we have to have special case for them to account for
    // invariance.
    Utils.IsNotTop<Value> extends true
      ? { [Key in keyof Value]: Value[Key] }
      : Utils.ResolveTop<Value>;

  export type Set<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > = "detachable" extends Qualifier
    ? SetDetachable<Type, Value, Qualifier, Parent>
    : SetCommon<Type, Value, Qualifier, Parent>;

  export interface SetCommon<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > {
    <NewValue extends Value>(
      value: NewValue,
    ): Envelop<Type, NewValue, Qualifier, Parent>;
  }

  export interface SetDetachable<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier | "detachable" = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > extends SetCommon<Type, Value, Qualifier, Parent> {
    (value: DetachedValue): Envelop<Type, DetachedValue, Qualifier, Parent>;
  }

  //#endregion

  //#region Tree

  export type Root<Type extends Atom.Type> = Envelop<
    Exclude<Type, Variant> | "immutable",
    unknown,
    "root"
  >;

  //#region Parent

  export type Parent<Type extends Atom.Type, Value, Key extends keyof Value> =
    | Parent.Direct<Type, Value, Key>
    | Parent.Source<Type, Value>;

  export namespace Parent {
    export type Envelop<Type extends Atom.Type, Value> = Atom.Envelop<
      Exclude<Type, Variant> | "immutable",
      Value
    >;

    export interface Direct<
      Type extends Atom.Type,
      Value,
      Key extends keyof Value,
    > {
      field: Envelop<Type, Value>;
      key: Key;
    }

    export interface Source<Type extends Atom.Type, Value> {
      source: Envelop<Type, Value>;
    }

    export type Constraint<Type extends Atom.Type, ChildValue> =
      | Parent.Type<Direct<Type, any, any> | Source<Type, any>, ChildValue>
      | unknown;

    export type Type<ParentProp, ChildValue> =
      ParentProp extends Source<any, infer Value>
        ? ChildValue extends Value[keyof Value]
          ? ParentProp
          : never
        : ParentProp extends Parent<any, infer Value, infer Key>
          ? ChildValue extends Value[Key]
            ? ParentProp
            : never
          : never;
  }

  //#endregion

  //#region $

  export type $Prop<Type extends Atom.Type, Value> =
    // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
    // respectively, so we have to have special case for them to account for
    // invariance.
    Utils.IsNotTop<Value> extends true
      ? {
          [Key in keyof Value]-?: Envelop<
            ChildType<Type>,
            ChildValue<Value, Key>,
            ChildQualifier<Value, Key>
          >;
        }
      : Utils.ResolveTop<Value>;

  export type ChildType<Type extends Atom.Type> =
    | Extract<Type, Shell>
    | (ExtractVariant<Type> extends infer Variant extends Atom.Variant
        ? Variant extends "common"
          ? "invariant"
          : Variant
        : never);

  export type ChildValue<Value, Key extends keyof Value> =
    | Value[Key]
    | (Utils.IsStaticKey<Value, Key> extends true ? never : undefined);

  export type ChildQualifier<Value, Key extends keyof Value> =
    Utils.IsStaticKey<Value, Key> extends true
      ? Utils.IsOptionalKey<Value, Key> extends true
        ? "detachable"
        : never
      : "detachable";

  //#endregion

  //#endregion

  //#region Events

  export type WatchCallback<Payload> = (
    payload: Payload,
    event: ChangesEvent,
  ) => void;

  export type Unwatch = () => void;

  //#endregion

  export type TryKey<
    Type extends Shell,
    Value,
    Key extends keyof Utils.NonNullish<Value>,
  > =
    | TryAtom<Type, Utils.NonNullish<Value>[Key]>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<Utils.NonNullish<Value>, Key> extends true
        ? never
        : undefined);

  export type TryAtom<Type extends Shell, Value> =
    // Add null to the union
    | (null extends Value ? null : never)
    // Add undefined to the union
    | (undefined extends Value ? undefined : never)
    // Resolve branded field without null or undefined
    | Enso.Tried<Envelop<Type, Utils.NonNullish<Value>>>;

  export type AtKey<S extends Shell, Payload, Key extends keyof Payload> =
    Utils.IsStaticKey<Payload, Key> extends true
      ? Utils.IsOptionalKey<Payload, Key> extends true
        ? Enso.Detachable<Envelop<S, Payload[Key]>>
        : Envelop<S, Payload[Key]>
      : Enso.Detachable<Envelop<S, Payload[Key] | undefined>>;

  export namespace Value {
    //#region Subtypes

    export type Variable<Type, Value> = Type extends "state"
      ? State.Value.Variable<Value>
      : Type extends "field"
        ? Field.Value.Variable<Value>
        : never;

    export interface Base<Type extends Atom.Shell, Value> {}

    export interface Primitive<Type extends Atom.Shell, Value>
      extends Base<Type, Value> {}

    export interface Collection<Type extends Atom.Shell, Value>
      extends Base<Type, Value> {}

    export interface Array<Type extends Atom.Shell, Value extends unknown[]>
      extends Collection<Type, Value> {
      each(
        field:
          | Atom.Envelop<Type, Value>
          | Utils.Nullish<Enso.Tried<Atom.Envelop<Type, Value>>>,
        callback: ArrayCallback<Type, Value>,
      ): void;

      find<Value extends unknown[]>(
        callback: ArrayCallback<Type, Value>,
      ): ArrayCallbackItem<Type, Value> | undefined;
    }

    export interface Tuple<Type extends Atom.Shell, Value>
      extends Collection<Type, Value> {}

    export interface Object<Type extends Atom.Shell, Value>
      extends Collection<Type, Value> {
      each<Value extends object>(
        field:
          | Atom.Envelop<Type, Value>
          | Utils.Nullish<Enso.Tried<Atom.Envelop<Type, Value>>>,
        callback: ObjectCallbackPair<Type, Value>,
      ): void;

      each<Value extends object>(
        field:
          | Atom.Envelop<Type, Value>
          | Utils.Nullish<Enso.Tried<Atom.Envelop<Type, Value>>>,
        callback: ObjectCallbackSingle<Type, Value>,
      ): void;

      filter<Value extends object>(
        predicate: ObjectCallbackPair<Type, Value, unknown>,
      ): ObjectCallbackResult<Type, Value>[];

      filter<Value extends object>(
        predicate: ObjectCallbackSingle<Type, Value, unknown>,
      ): ObjectCallbackResult<Type, Value>[];
    }

    // TODO: Find a way to make this work for known built-in types
    // export interface Opaque<Value> extends Primitive<Value> {}

    // TODO: Figure out if that would be useful
    // export interface Record<Value> extends Collection<Value> {}

    //#endregion

    //#region Array

    export type ArrayCallback<
      Type extends Atom.Shell,
      Value extends unknown[],
      Result = void,
    > = (item: ArrayCallbackItem<Type, Value>, index: number) => Result;

    export type ArrayCallbackItem<
      Type extends Atom.Shell,
      Value extends unknown[],
    > =
      Value extends Array<Type, infer ItemValue>
        ? Enso.Detachable<Atom.Envelop<Type, ItemValue>>
        : never;

    //#endregion

    //#region Object

    export type ObjectCallbackPair<
      Type extends Atom.Shell,
      Value extends object,
      Result = void,
    > = (
      // Exclude is needed to remove undefined that appears when there're optional
      // fields in the object.
      ...args: Exclude<
        {
          [Key in keyof Value]: [Atom.Envelop<Type, Value[Key]>, Key];
        }[keyof Value],
        undefined
      >
    ) => Result;

    export type ObjectCallbackSingle<
      Type extends Atom.Shell,
      Value extends object,
      Result = void,
    > = (
      // Exclude is needed to remove undefined that appears when there're optional
      // fields in the object.
      item: Exclude<
        { [Key in keyof Value]: Atom.Envelop<Type, Value[Key]> }[keyof Value],
        undefined
      >,
    ) => Result;

    export type ObjectCallbackResult<
      Type extends Atom.Shell,
      Value extends object,
    > =
      // Remove undefined that sneaks in
      Exclude<
        // Use mapped type to preserve Type | undefined for optional fields
        { [Key in keyof Value]: Atom.Envelop<Type, Value[Key]> }[keyof Value],
        undefined
      >;

    //#endregion
  }
}

namespace AtomPrivate {
  export declare const rootQualifier: unique symbol;
  export declare const detachableQualifier: unique symbol;
  export declare const triedQualifier: unique symbol;
  export declare const boundQualifier: unique symbol;
  export declare const invariantPhantom: unique symbol;
}
