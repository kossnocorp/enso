import { DependencyList } from "react";
import { ChangesEvent, FieldChange } from "../change/index.ts";
import { DetachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { Field } from "../field/definition.ts";
import { Static } from "../field/util.ts";
import { State } from "../state/index.ts";
import { Enso } from "../types.ts";
import type { EnsoUtils as Utils } from "../utils.ts";

export declare class Atom<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier,
    Parent extends Atom.Parent.Constraint<Value>,
  >
  implements
    Static<typeof Atom<Type, Value, Qualifier, Parent>, Atom.Static>,
    Atom.Exact<Type, Value, Qualifier, Parent>
{
  //#region Static

  static safeNullish<Type>(value: Type | Utils.Nullish): Enso.SafeNullish<Type>;

  //#endregion

  //#region Instance

  constructor(
    value: Value,
    parent?: Atom.Parent.Def<Exclude<Type, Atom.Variant>, Parent>,
  );

  deconstruct(): void;

  //#endregion

  //#region Phantoms

  [AtomPrivate.immutableExactPhantom]: Atom.Immutable.Phantom<Type, Value>;

  [AtomPrivate.qualifiersPhantom](): Atom.Qualifier.Map<Qualifier>;

  [AtomPrivate.valueExactPhantom]: Atom.Value.Phantom<Value>;

  [AtomPrivate.parentExactPhantom]: Atom.Parent.Phantom<Value, Parent>;

  //#endregion

  //#region Attributes

  readonly id: string;

  //#endregion

  //#region Value

  get value(): Atom.Value.Prop<Value>;

  useValue(): Atom.Value<Value>;

  compute: Atom.Compute.Prop<Value>;

  useCompute: Atom.Compute.UseProp<Value>;

  set<NewValue extends Value>(
    value: NewValue,
  ): Atom.Envelop<Type, NewValue, Qualifier, Parent>;

  pave<PavedValue extends Utils.NonNullish<Value>>(
    value: PavedValue,
  ): Atom.Envelop<Type, Atom.Pave.Value<Value, PavedValue>, Qualifier, Parent>;

  get lastChanges(): FieldChange;

  //#endregion

  //#region Type

  size: Atom.SizeProp<Value>;

  remove: Atom.RemoveProp<Type, Value>;

  forEach: Atom.ForEachProp<Type, Value>;

  map: Atom.MapProp<Type, Value>;

  find: Atom.FindProp<Type, Value>;

  filter: Atom.FilterProp<Type, Value>;

  useCollection: Atom.UseCollectionProp<Type, Value, Qualifier, Parent>;

  insert: Atom.Insert.Prop<Type, Value, Qualifier, Parent>;

  push: Atom.Push.Prop<Type, Value, Qualifier, Parent>;

  //#endregion

  //#region Tree

  get root(): Atom.Root<Type>;

  get parent(): Atom.Parent.Prop<Exclude<Type, Atom.Variant>, Value, Parent>;

  get key(): string;

  get $(): Atom.$.Prop<Type, Value>;

  at: Atom.At.Prop<Type, Value>;

  try: Atom.Try.Prop<Type, Value>;

  get path(): string[];

  get name(): string;

  self: Utils.CovariantifyProperty<
    Atom.Exact.Self<Type, Value, Qualifier, Parent>
  >;

  //#endregion

  //#region Events

  eventsTree: EventsTree<Extract<Type, Atom.Shell>>;

  watch(callback: Atom.Watch.Callback<Value>): Atom.Unwatch;

  useWatch(
    callback: Atom.Watch.Callback<Value>,
    deps: DependencyList,
  ): Atom.Unwatch;

  trigger(changes: FieldChange, notifyParents?: boolean): void;

  //#endregion

  //#region Transform

  decompose: Atom.Decompose.Prop<Type, Value, Qualifier, Parent>;

  useDecompose: Atom.Decompose.Use.Prop<Type, Value, Qualifier, Parent>;

  discriminate: Atom.Discriminate.Prop<Type, Value, Qualifier, Parent>;

  useDiscriminate: Atom.Discriminate.Prop<Type, Value, Qualifier, Parent>;

  into: Atom.Proxy.Into.Prop<Type, Value, Qualifier, Parent>;

  useInto: Atom.Proxy.Into.Use.Prop<Type, Value, Qualifier, Parent>;

  useDefined: Atom.Defined.Prop<Type, Value, Qualifier, Parent>;

  //#endregion
}

export namespace Atom {
  //#region Basics

  export type Path = readonly (keyof any)[];

  //#endregion

  //#region Static

  export interface Static {
    safeNullish<Type>(value: Type | Utils.Nullish): Enso.SafeNullish<Type>;
  }

  export namespace Static {
    export interface Subclass<Shell extends Atom.Shell> {
      create<
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      >(
        value: Value,
        parent?: Parent.Def<Shell, Parent>,
      ): Envelop<Shell | "exact", Value, Qualifier, Parent>;

      // TODO: Ideally it should go into Static and utilize create

      base<EnvelopType extends Atom.Envelop<Shell, any>>(
        atom: EnvelopType,
      ): Atom.Base.Result<Shell, EnvelopType>;

      use<Value>(
        initialValue: Value,
        deps: DependencyList,
      ): Atom.Envelop<Shell | "exact", Value>;

      useEnsure<
        EnvelopType extends Atom.Envelop<Shell, any> | Utils.Nullish,
        MappedValue = undefined,
      >(
        atom: EnvelopType,
        map?: Ensure.Mapper<Shell, EnvelopType, MappedValue>,
      ): Ensure.Result<Shell, EnvelopType, MappedValue>;
    }

    export namespace Ensure {
      export interface Mapper<
        Shell extends Atom.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
        MappedValue,
      > {
        (
          atom: Envelop<Shell, AtomValue<Shell, EnvelopType>>,
        ): Envelop<Shell, MappedValue>;
      }

      export type AtomValue<
        Shell extends Atom.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
      > = EnvelopType extends Envelop<Shell, infer Value> ? Value : never;

      export type Result<
        Shell extends Atom.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
        MappedValue,
      > = MappedValue extends undefined
        ? ResultDirect<Shell, EnvelopType>
        : ResultMapped<Shell, EnvelopType, MappedValue>;

      export type ResultDirect<
        Shell extends Atom.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
      > = Field<
        | (EnvelopType extends Utils.Nullish ? undefined : never)
        | AtomValue<Shell, EnvelopType>
      >;

      export type ResultMapped<
        Shell extends Atom.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
        MappedValue,
      > = Envelop<
        Shell,
        (EnvelopType extends Utils.Nullish ? undefined : never) | MappedValue
      >;
    }
  }

  //#endregion

  //#region Flavor

  // WIP: Try to find a better name for this type, so region can be more precise.
  export type Type = Shell | Variant;

  export type Shell = "state" | "field";

  // WIP: Try to get rid of it. The purpose is to have symmetry with Ref but it
  // might be simple Extract, however I can't check until I stabilize tysts.

  export type NonShell = Exclude<Type, Shell>;

  export type NonVariant = Exclude<Type, Variant>;

  export type Envelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
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

  export type Every<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > =
    // Handle boolean separately, so it doesn't produce `Atom<..., true> | Atom<..., false>`
    | (boolean extends Value ? Envelop<Type, Value, Qualifier, Parent> : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? Envelop<Type, Value, Qualifier, Parent>
          : never
        : never);

  export type ExtractShell<Type extends Atom.Type> =
    Utils.IsNever<Exclude<Type, Variant>> extends true
      ? unknown
      : Type extends Shell
        ? Type
        : never;

  export type ExtractVariant<Type extends Atom.Type> =
    Utils.IsNever<Exclude<Type, NonVariant>> extends true
      ? "exact"
      : Type extends Variant
        ? Type
        : never;

  export type SelfEnvelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = "exact" extends Type
    ? Exact.Self<Type, Value, Qualifier, Parent>
    : "base" extends Type
      ? Base.Self<Type, Value, Qualifier, Parent>
      : Immutable.Self<Type, Value, Qualifier, Parent>;

  //#endregion

  //#region Variant

  export type Variant = "immutable" | "base" | "shared" | "exact";

  export namespace Variant {
    export type Qualifier<Variant extends Atom.Variant> = Variant;
  }

  //#endregion

  //#region Qualifier

  export type Qualifier =
    | "root"
    | "detachable"
    | "tried"
    | "bound"
    | Proxy.Qualifier<unknown>
    | Variant.Qualifier<any>;

  export namespace Qualifier {
    export type Default = never;

    export type Map<Qualifier extends Atom.Qualifier> = Utils.NeverDefault<
      MapChunkBasic<Qualifier, "root"> &
        MapChunkBasic<Qualifier, "detachable"> &
        MapChunkBasic<Qualifier, "tried"> &
        MapChunkBasic<Qualifier, "bound"> &
        MapChunkProxy<Qualifier>,
      {}
    >;

    export type MapChunkBasic<
      // WIP: Try to make it reusable this inside Ref
      Qualifier extends Atom.Qualifier,
      TestQualifier extends keyof any,
    > = TestQualifier extends Qualifier ? { [Key in TestQualifier]: true } : {};

    export type MapChunkProxy<Qualifier extends Atom.Qualifier> =
      Qualifier extends Proxy.Qualifier<infer SourceValue>
        ? { proxy: SourceValue }
        : {};
  }

  //#endregion

  //#region Parent

  export namespace Parent {
    export type Default = never;

    export type Phantom<ChildValue, Parent extends Constraint<ChildValue>> =
      Utils.IsNever<Parent> extends true ? unknown : { parent: Parent };

    export type Envelop<Shell extends Atom.Shell, ParentValue> = Atom.Envelop<
      Shell | "immutable",
      Utils.IsNever<ParentValue> extends true ? any : ParentValue
    >;

    export type Prop<
      Shell extends Atom.Shell,
      ChildValue,
      Parent extends Atom.Parent.Constraint<ChildValue>,
    > = Def<
      Shell,
      Utils.IsNever<Parent> extends true ? Interface<any, any> : Parent
    >;

    export type Def<
      Shell extends Atom.Shell,
      Parent extends Atom.Parent.Constraint<any>,
    > =
      Parent extends Interface<infer ParentValue, infer Key>
        ?
            | Parent.Direct<Shell, ParentValue, Key>
            | Parent.Source<Shell, ParentValue>
        : never;

    export interface Direct<
      Shell extends Atom.Shell,
      ParentValue,
      Key extends keyof ParentValue,
    > {
      field: Envelop<Shell, ParentValue>;
      key: Key;
    }

    export interface Interface<ParentValue, Key extends keyof ParentValue> {
      value: ParentValue;
      key: Key;
    }

    export interface Source<Shell extends Atom.Shell, ParentValue> {
      source: Envelop<Shell, ParentValue>;
    }

    export type Constraint<ChildValue> = Type<Interface<any, any>, ChildValue>;

    export type Type<ParentInterface, ChildValue> =
      ParentInterface extends Interface<infer ParentValue, infer Key>
        ? ChildValue extends ParentValue[Key]
          ? ParentInterface
          : never
        : never;
  }

  //#endregion

  //#region Child

  export type Child<
    Type extends Atom.Type,
    ParentValue,
    Key extends keyof ParentValue,
    Access extends Child.Access,
  > = Envelop<
    Child.Type<Type, ParentValue>,
    Child.Value<ParentValue, Key, Access>,
    Child.Qualifier<ParentValue, Key>
  >;

  export namespace Child {
    export type Every<
      Type extends Atom.Type,
      ParentValue,
      Key extends keyof ParentValue,
      Access extends Child.Access,
    > = Key extends Key
      ? Atom.Every<
          Child.Type<Type, ParentValue>,
          Child.Value<ParentValue, Key, Access>,
          Child.Qualifier<ParentValue, Key>
        >
      : never;

    export type Access = "indexed" | "iterated";

    export type Type<Type extends Atom.Type, ParentValue> =
      | Extract<Type, Shell>
      | (ExtractVariant<Type> extends infer Variant extends Atom.Variant
          ? Utils.IsReadonlyArray<ParentValue> extends true
            ? Variant extends "immutable"
              ? "immutable"
              : "base"
            : Variant extends "base"
              ? "exact"
              : Variant
          : never);

    export type Value<
      ParentValue,
      ParentKey extends keyof ParentValue,
      Access extends Child.Access,
    > =
      | ParentValue[ParentKey]
      | (Access extends "indexed"
          ? Utils.IsStaticKey<ParentValue, ParentKey> extends true
            ? never
            : undefined
          : never);

    export type Qualifier<
      ParentValue,
      ParentKey extends keyof Utils.NonNullish<ParentValue>,
    > =
      Utils.IsStaticKey<ParentValue, ParentKey> extends true
        ? Utils.IsOptionalKey<ParentValue, ParentKey> extends true
          ? "detachable"
          : never
        : Utils.IsReadonlyArray<ParentValue> extends true
          ? never
          : ParentValue extends Utils.Tuple
            ? never
            : "detachable";
  }

  //#endregion

  //#region Interface

  //#region Exact

  export interface Exact<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Immutable<Type, Value, Qualifier, Parent> {
    //#region Value

    set<NewValue extends Value>(
      value: NewValue,
    ): Envelop<Type, NewValue, Qualifier, Parent>;

    pave<PavedValue extends Utils.NonNullish<Value>>(
      value: PavedValue,
    ): Envelop<Type, Pave.Value<Value, PavedValue>, Qualifier, Parent>;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.valueExactPhantom]: Atom.Value.Phantom<Value>;

    lastChanges: FieldChange;

    //#endregion

    //#region Type

    remove: RemoveProp<Type, Value>;

    insert: Insert.Prop<Type, Value, Qualifier, Parent>;

    push: Push.Prop<Type, Value, Qualifier, Parent>;

    //#endregion

    //#region Events

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion
  }

  export namespace Exact {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Type> extends "state"
        ? State.Exact<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Exact<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Immutable.Self<Type, Value, Qualifier> {
      remove: Atom.Self.RemoveProp<Type, Value, Qualifier, Parent>;
    }
  }

  //#endregion

  //#region Base

  export interface Base<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Immutable<Type, Value, Qualifier, Parent> {}

  export namespace Base {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Type> extends "state"
        ? State.Base<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Base<Value, Qualifier, Parent>
          : never;

    export type Result<
      Shell extends Atom.Shell,
      EnvelopType extends Atom.Envelop<Shell, any>,
    > = Atom.Base.Envelop<
      Shell,
      Value.Base<EnvelopType>,
      Qualifier.Shared<EnvelopType>
    >;

    export namespace Value {
      export type Base<EnvelopType extends Atom.Envelop<any, any>> =
        EnvelopType extends Atom.Envelop<any, infer Value> ? Value : never;

      export type Shared<
        EnvelopType extends Atom.Envelop<any, any>,
        Value = Atom.Value.FromEnvelop<EnvelopType>,
      > = Value extends Value
        ? IsShared<EnvelopType, Value> extends true
          ? Value
          : never
        : never;

      export type IsShared<EnvelopType, Value> =
        EnvelopType extends Atom.Envelop<any, infer EnvelopTypeValue>
          ? Value extends EnvelopTypeValue
            ? true
            : false
          : false;
    }

    export namespace Qualifier {
      export type Shared<
        EnvelopType,
        Qualifier = Union<EnvelopType>,
      > = Qualifier extends Qualifier
        ? IsShared<EnvelopType, Qualifier> extends true
          ? Qualifier
          : never
        : never;

      export type Union<EnvelopType> =
        EnvelopType extends Atom.Envelop<any, any, infer Qualifier>
          ? Qualifier
          : never;

      export type IsShared<EnvelopType, QualifierUnion> =
        EnvelopType extends Atom.Envelop<any, any, infer EnvelopTypeQualifier>
          ? QualifierUnion extends EnvelopTypeQualifier
            ? true
            : false
          : false;
    }

    export interface Self<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Immutable.Self<Type, Value, Qualifier, Parent> {}
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > {
    //#region Phantoms

    // NOTE: As immutable atoms never resolve exact children like base,
    // we must manually provide phantom type to ensure proper variance between
    // them.
    [AtomPrivate.immutableExactPhantom]: Immutable.Phantom<Type, Value>;

    [AtomPrivate.qualifiersPhantom](): Atom.Qualifier.Map<Qualifier>;

    [AtomPrivate.parentExactPhantom]: Parent.Phantom<Value, Parent>;

    //#endregion

    //#region Instance

    deconstruct(): void;

    //#endregion

    readonly id: string;

    //#region Value

    value: Atom.Value.Prop<Value>;

    useValue(): Atom.Value<Value>;

    compute: Compute.Prop<Value>;

    useCompute: Compute.UseProp<Value>;

    //#endregion

    //#region Tree

    root: Root<Type>;

    parent: Parent.Prop<Exclude<Type, Atom.Variant>, Value, Parent>;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $.Prop<Type, Value>;

    at: At.Prop<Type, Value>;

    try: Atom.Try.Prop<Type, Value>;

    self: Utils.CovariantifyProperty<SelfEnvelop<Type, Value, Qualifier>>;

    //#endregion

    //#region Type

    size: SizeProp<Value>;

    forEach: ForEachProp<Type, Value>;

    map: MapProp<Type, Value>;

    find: FindProp<Type, Value>;

    filter: FilterProp<Type, Value>;

    useCollection: UseCollectionProp<Type, Value, Qualifier, Parent>;

    //#endregion

    //#region Events

    eventsTree: EventsTree<Extract<Type, Atom.Shell>>;

    watch(callback: Watch.Callback<Value>): Unwatch;

    useWatch(callback: Watch.Callback<Value>, deps: DependencyList): Unwatch;

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion

    //#region Transform

    decompose: Decompose.Prop<Type, Value, Qualifier, Parent>;

    useDecompose: Decompose.Use.Prop<Type, Value, Qualifier, Parent>;

    discriminate: Discriminate.Prop<Type, Value, Qualifier, Parent>;

    useDiscriminate: Discriminate.Prop<Type, Value, Qualifier, Parent>;

    into: Proxy.Into.Prop<Type, Value, Qualifier, Parent>;

    useInto: Proxy.Into.Use.Prop<Type, Value, Qualifier, Parent>;

    useDefined: Defined.Prop<Type, Value, Qualifier, Parent>;

    //#endregion
  }

  export namespace Immutable {
    export type Phantom<Type extends Atom.Type, Value> = $.Prop<
      Extract<Type, Shell> | "base",
      Value
    >;

    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Type> extends "state"
        ? State.Immutable<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Immutable<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      try(): Remove<Type, Value, Qualifier>;
    }

    export type Remove<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier,
    > =
      // Add null to the union
      | (null extends Value ? null : never)
      // Add undefined to the union
      | (undefined extends Value ? undefined : never)
      // Resolve branded field without null or undefined
      | Atom.Envelop<Type, Utils.NonNullish<Value>, "tried" | Qualifier>;
  }

  //#endregion

  //#endregion

  //#region Value

  export type Value<Value> =
    // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
    // respectively, so we have to have special case for them to account for
    // invariance.
    Utils.IsNotTop<Value> extends true
      ? // Preserve brand if it exists
        Value extends string & (infer Brand extends Utils.AnyBrand)
        ? string & Brand
        : Value extends number & (infer Brand extends Utils.AnyBrand)
          ? number & Brand
          : Value extends boolean & (infer Brand extends Utils.AnyBrand)
            ? boolean & Brand
            : Value extends symbol & (infer Brand extends Utils.AnyBrand)
              ? symbol & Brand
              : // Otherwise map the value to its own type
                { [Key in keyof Value]: Value[Key] }
      : Utils.IsUnknown<Value> extends true
        ? never
        : Utils.IsAny<Value> extends true
          ? any
          : Value;

  export namespace Value {
    export type Prop<Value> = Atom.Value<Value>;

    export interface Phantom<Value> {
      (value: Value): void;
    }

    export type FromEnvelop<EnvelopType extends Atom.Envelop<any, any>> =
      EnvelopType extends Atom.Envelop<any, infer Value> ? Value : never;
  }

  export namespace Pave {
    export type Value<
      Value,
      PavedValue extends Utils.NonNullish<Value>,
    > = Value extends Value
      ? PavedValue extends Value
        ? Value
        : never
      : never;
  }

  //#endregion

  //#region Type

  //#region Self

  export namespace Self {
    export type RemoveProp<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Qualifier extends "detachable"
      ? RemoveFn<Type, Value, Qualifier, Parent>
      : never;

    export interface RemoveFn<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (): Envelop<Type, DetachedValue, Qualifier, Parent>;
    }
  }

  //#endregion

  export type SizeProp<Value> = Value extends object
    ? Value extends Utils.BrandedPrimitive
      ? never
      : number
    : never;

  //#region Remove

  export type RemoveProp<Type extends Atom.Type, Value> =
    Utils.IsReadonlyArray<Value> extends true
      ? never
      : Value extends Utils.Tuple
        ? never
        : Value extends unknown[]
          ? RemoveArray<Type, Value>
          : Value extends object
            ? Value extends Utils.BrandedPrimitive
              ? never
              : RemoveObject<Type, Value>
            : never;

  export interface RemoveArray<
    Type extends Atom.Type,
    Value extends unknown[],
  > {
    (item: number): Envelop<Type, DetachedValue | Value[number], "detachable">;
  }

  export interface RemoveObject<Type extends Atom.Type, Value extends object> {
    <Key extends Enso.DetachableKeys<Value>>(
      key: Key,
    ): Envelop<Type, DetachedValue | Value[Key], "detachable">;
  }

  //#endregion

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
      Type extends Atom.Type,
      Value extends Utils.Tuple,
      Result = void,
    > {
      (
        ...args: {
          [Key in Utils.IndexOfTuple<Value>]: [
            Child<Type, Value, Key, "iterated">,
            Key,
          ];
        }[Utils.IndexOfTuple<Value>]
      ): Result;
    }

    export interface TupleHandlerSingle<
      Type extends Atom.Type,
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

    export type TupleItem<Type extends Atom.Type, Value extends Utils.Tuple> = {
      [Key in Utils.IndexOfTuple<Value>]: Envelop<Type, Value[Key]>;
    }[Utils.IndexOfTuple<Value>];

    // Array

    export interface ArrayHandler<
      Type extends Atom.Type,
      Value extends Utils.ArrayConstraint,
      Result = void,
    > {
      (item: Child<Type, Value, number, "iterated">, index: number): Result;
    }

    // Object

    // NOTE: We have to have two separate overloads for objects `ObjectPair`
    // and `ObjectSingle` as with the current approach binding the key and
    // value in the arguments on the type level, TypeScript fails to find
    // the correct overload for when the callback accepts a single argument
    // (i.e. just the item field).

    export interface ObjectHandlerPair<
      Type extends Atom.Type,
      Value extends object,
      Result = void,
    > {
      (
        // Exclude is needed to remove undefined that appears when there're
        // optional fields in the object.
        ...args: Exclude<
          {
            [Key in Utils.CovariantifyKeyof<Value>]: [
              Child<Type, Value, Key, "iterated">,
              Key,
            ];
          }[Utils.CovariantifyKeyof<Value>],
          undefined
        >
      ): Result;
    }

    export interface ObjectHandlerSingle<
      Type extends Atom.Type,
      Value extends object,
      Result = void,
    > {
      (
        // Exclude is needed to remove undefined that appears when there're
        // optional fields in the object.
        item: Exclude<
          {
            [Key in keyof Value]: Child<Type, Value, Key, "iterated">;
          }[keyof Value],
          undefined
        >,
      ): Result;
    }

    export type ObjectItem<
      Type extends Atom.Type,
      Value extends object,
    > = Exclude<
      {
        [Key in keyof Value]: Child<Type, Value, Key, "iterated">;
      }[keyof Value],
      undefined
    >;

    //#endregion

    //#region Processor

    export type Mapper<
      Type extends Atom.Type,
      Value,
      ProcessorType extends Mapper.ResultType,
    > =
      Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Mapper.Array<Type, Value, ProcessorType>
          : never
        : Value extends Utils.Tuple
          ? Mapper.Tuple<Type, Value, ProcessorType>
          : Value extends unknown[]
            ? Mapper.Array<Type, Value, ProcessorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? never
                : Mapper.Object<Type, Value, ProcessorType>
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
        Type extends Atom.Type,
        Value extends Utils.Tuple,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.TupleHandlerPair<
            Type,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.TupleHandlerSingle<
            Type,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Array

      export interface Array<
        Type extends Atom.Type,
        Value extends Utils.ArrayConstraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ArrayHandler<
            Type,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Object

      export interface Object<
        Type extends Atom.Type,
        Value extends object,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ObjectHandlerPair<
            Type,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.ObjectHandlerSingle<
            Type,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }
    }

    //#endregion

    //#region Selector

    export type Selector<
      Type extends Atom.Type,
      Value,
      SelectorType extends Selector.Type,
    > =
      Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Selector.Array<Type, Value, SelectorType>
          : never
        : Value extends Utils.Tuple
          ? Selector.Tuple<Type, Value, SelectorType>
          : Value extends unknown[]
            ? Selector.Array<Type, Value, SelectorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? never
                : Selector.Object<Type, Value, SelectorType>
              : never;

    export namespace Selector {
      export type Type = "find" | "filter";

      export type Result<
        SelectorType extends Selector.Type,
        Result,
      > = SelectorType extends "find" ? Result | undefined : Result[];

      // Tuple

      export interface Tuple<
        Type extends Atom.Type,
        Value extends Utils.Tuple,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.TupleHandlerPair<Type, Value, unknown>,
        ): Result<SelectorType, Collection.TupleItem<Type, Value>>;

        (
          callback: Collection.TupleHandlerSingle<Type, Value, unknown>,
        ): Result<SelectorType, Collection.TupleItem<Type, Value>>;
      }

      // Array

      export interface Array<
        Type extends Atom.Type,
        Value extends Utils.ArrayConstraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ArrayHandler<Type, Value, unknown>,
        ): Result<SelectorType, Child<Type, Value, number, "iterated">>;
      }

      // Object

      export interface Object<
        Type extends Atom.Type,
        Value extends object,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ObjectHandlerPair<Type, Value, unknown>,
        ): Result<SelectorType, Collection.ObjectItem<Type, Value>>;

        (
          callback: Collection.ObjectHandlerSingle<Type, Value, unknown>,
        ): Result<SelectorType, Collection.ObjectItem<Type, Value>>;
      }
    }

    //#endregion
  }

  export type ForEachProp<Type extends Atom.Type, Value> = Collection.Mapper<
    Type,
    Value,
    "each"
  >;

  export type MapProp<Type extends Atom.Type, Value> = Collection.Mapper<
    Type,
    Value,
    "map"
  >;

  export type FindProp<Type extends Atom.Type, Value> = Collection.Selector<
    Type,
    Value,
    "find"
  >;

  export type FilterProp<Type extends Atom.Type, Value> = Collection.Selector<
    Type,
    Value,
    "filter"
  >;

  export type UseCollectionProp<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = Value extends object
    ? Value extends Utils.BrandedPrimitive
      ? never
      : () => Envelop<Type, Value, Qualifier | "bound", Parent>
    : never;

  export namespace Insert {
    export type Prop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Value extends Utils.StaticArray
      ? never
      : Value extends unknown[]
        ? Fn<Type, Value, Qualifier, Parent>
        : never;

    export interface Fn<
      Type extends Atom.Type,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (
        index: number,
        value: Value[number],
      ): Envelop<
        Child.Type<Type, Value>,
        Value[number],
        Child.Qualifier<Value, number>
      >;
    }
  }

  export namespace Push {
    export type Prop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Value extends Utils.Tuple
      ? never
      : Value extends unknown[]
        ? Fn<Type, Value, Qualifier, Parent>
        : never;

    export interface Fn<
      Type extends Atom.Type,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (
        value: Value[number],
      ): Envelop<
        Child.Type<Type, Value>,
        Value[number],
        Child.Qualifier<Value, number>
      >;
    }
  }

  //#endregion

  //#endregion

  //#region Tree

  export type Root<Type extends Atom.Type> = Envelop<
    Exclude<Type, Variant> | "immutable",
    unknown,
    "root"
  >;

  //#region $

  export namespace $ {
    export type Prop<Type extends Atom.Type, Value> =
      // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
      // respectively, so we have to have special case for them to account for
      // invariance.
      Utils.IsNotTop<Value> extends true
        ? Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? never
            : { [Key in keyof Value]-?: Child<Type, Value, Key, "indexed"> }
          : never
        : Utils.ResolveTop<Value>;
  }

  //#endregion

  //#region At

  export namespace At {
    export type Prop<
      Type extends Atom.Type,
      Value,
    > = keyof Value extends infer Key extends keyof Value
      ? Fn<Type, Value, Key>
      : never;

    export interface Fn<
      Type extends Atom.Type,
      Value,
      Key extends keyof Value,
    > {
      <ArgKey extends Key>(
        key: ArgKey | Enso.SafeNullish<ArgKey>,
      ): Child<Type, Value, ArgKey>;
    }

    export type Child<
      Type extends Atom.Type,
      Value,
      Key extends keyof Value,
    > = Key extends Key ? Atom.Child<Type, Value, Key, "indexed"> : never;
  }

  //#endregion

  //#region Try

  export namespace Try {
    export type Prop<
      Type extends Atom.Type,
      Value,
    > = keyof Value extends infer Key extends keyof Value
      ? <ArgKey extends Key>(
          key: ArgKey | Enso.SafeNullish<ArgKey>,
        ) => Child<Type, Value, ArgKey>
      : never;

    export type Child<
      Type extends Atom.Type,
      Value,
      Key extends keyof Utils.NonNullish<Value>,
    > = Key extends Key
      ?
          | Envelop<
              Type,
              Utils.NonNullish<Value>[Key],
              Child.Qualifier<Value, Key>
            >
          // Add undefined if the key is not static (i.e. a record key).
          | (Utils.IsStaticKey<Utils.NonNullish<Value>, Key> extends true
              ? never
              : undefined)
      : never;

    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier,
    > =
      // Add null to the union
      | (null extends Value ? null : never)
      // Add undefined to the union
      | (undefined extends Value ? undefined : never)
      // Resolve branded field without null or undefined
      | Atom.Envelop<
          Child.Type<Type, Value>,
          Utils.NonNullish<Value>,
          Qualifier | "tried"
        >;
  }

  //#endregion

  //#endregion

  //#region Events

  export namespace Watch {
    export interface Callback<Value> {
      (value: Value, event: ChangesEvent): void;
    }
  }

  export type Unwatch = () => void;

  //#endregion

  //#region Transform

  //#region Compute

  export namespace Compute {
    export interface Prop<Value> {
      <Result>(callback: Callback<Value, Result>): Result;
    }

    export interface Callback<Value, Result> {
      (value: Value): Result;
    }

    export interface UseProp<Value> {
      <Result>(callback: Callback<Value, Result>, deps: DependencyList): Result;
    }
  }

  //#endregion

  //#region Decompose

  export namespace Decompose {
    export interface Prop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (): Result<Type, Value, Qualifier, Parent>;
    }

    export type Result<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      | (Value extends Value
          ? {
              value: Value;
              field: Envelop<Type, Value, Qualifier, Parent>;
            }
          : never)
      // Add unknown option for the base and immutable variants
      | (Type extends (infer Shell extends Atom.Shell) | infer Variant
          ? Variant extends "base" | "immutable"
            ? {
                value: unknown;
                field: Envelop<Shell | Variant, unknown, Qualifier, Parent>;
              }
            : never
          : never);

    export namespace Use {
      export interface Prop<
        Type extends Atom.Type,
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        (
          callback: Callback<Value>,
          deps: DependencyList,
        ): Result<Type, Value, Qualifier, Parent>;
      }

      export type Callback<Value> = (
        newValue: Value,
        prevValue: Value,
      ) => boolean;
    }
  }

  //#endregion

  //#region Discriminate

  export namespace Discriminate {
    export interface Prop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      <Discriminator extends Discriminate.Discriminator<Value>>(
        discriminator: Discriminator,
      ): Result<Type, Value, Discriminator, Qualifier, Parent>;
    }

    export type Discriminator<Payload> = keyof Utils.NonUndefined<Payload>;

    export type Result<
      Type extends Atom.Type,
      Value,
      Discriminator extends Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Inner<Type, Value, Discriminator, Qualifier, Parent>;

    export type Inner<
      Type extends Atom.Type,
      Value,
      Discriminator extends Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      | (Value extends Value
          ? Discriminator extends keyof Value
            ? Value[Discriminator] extends infer DiscriminatorValue
              ? DiscriminatorValue extends Value[Discriminator]
                ? {
                    discriminator: DiscriminatorValue;
                    field: Envelop<Type, Value, Qualifier, Parent>;
                  }
                : never
              : never
            : // Add the payload type without the discriminator (i.e. undefined)
              {
                discriminator: undefined;
                field: Envelop<Type, Value, Qualifier, Parent>;
              }
          : never)
      // Add unknown option for the base and immutable variants
      | (Type extends (infer Shell extends Atom.Shell) | infer Variant
          ? Variant extends "base" | "immutable"
            ? {
                discriminator: unknown;
                field: Envelop<Shell | Variant, unknown, Qualifier, Parent>;
              }
            : never
          : never);
  }

  //#endregion

  //#region Proxy

  export namespace Proxy {
    export interface Qualifier<SourceValue> {
      source: SourceValue;
    }

    export type Envelop<
      Type extends Atom.Type,
      Value,
      ComputedValue,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Envelop<Type, ComputedValue, Proxy.Qualifier<Value>, Parent>;

    export namespace Into {
      export type Prop<
        Type extends Atom.Type,
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > = Into.Fn<Type, Value, Qualifier, Parent>;

      export interface Fn<
        Type extends Atom.Type,
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        <ComputedValue>(
          intoMapper: Into.Mapper<Value, ComputedValue>,
        ): Result<Type, Value, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<Value, ComputedValue> {
        (value: Value): ComputedValue;
      }

      export interface Result<
        Type extends Atom.Type,
        Value,
        ComputedValue,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        from: From.Fn<Type, Value, ComputedValue, Qualifier, Parent>;
      }

      export namespace Use {
        export type Prop<
          Type extends Atom.Type,
          Value,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > = Fn<Type, Value, Qualifier, Parent>;

        export interface Fn<
          Type extends Atom.Type,
          Value,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          <ComputedValue>(
            intoMapper: Proxy.Into.Mapper<Value, ComputedValue>,
            deps: DependencyList,
          ): Result<Type, Value, ComputedValue, Qualifier, Parent>;
        }

        export interface Result<
          Type extends Atom.Type,
          Value,
          ComputedValue,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          from: Proxy.From.Use.Fn<
            Type,
            Value,
            ComputedValue,
            Qualifier,
            Parent
          >;
        }
      }
    }

    export namespace From {
      export interface Fn<
        Type extends Atom.Type,
        Value,
        ComputedValue,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        <MappedValue extends Value>(
          fromMapper: Mapper<Value, ComputedValue, MappedValue>,
        ): Envelop<Type, Value, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<Value, ComputedValue, MappedValue> {
        (computedValue: ComputedValue, value: Value): MappedValue;
      }

      export namespace Use {
        export interface Fn<
          Type extends Atom.Type,
          Value,
          ComputedValue,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          <MappedValue extends Value>(
            fromMapper: Mapper<Value, ComputedValue, MappedValue>,
            deps: DependencyList,
          ): Envelop<Type, Value, ComputedValue, Qualifier, Parent>;
        }
      }
    }
  }

  //#endregion

  //#region Defined

  export namespace Defined {
    export type Prop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      Exclude<Value, string | Utils.Nullish> extends never
        ? Value extends string | Utils.Nullish
          ? FnString<Type, Value, Qualifier, Parent>
          : never
        : never;

    export interface FnString<
      Type extends Atom.Type,
      Value extends string | Utils.Nullish,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (to: "string"): Envelop<Type, string, Qualifier, Parent>;
    }
  }

  //#endregion

  //#endregion
}

namespace AtomPrivate {
  export declare const immutableExactPhantom: unique symbol;
  export declare const qualifiersPhantom: unique symbol;
  export declare const valueExactPhantom: unique symbol;
  export declare const parentExactPhantom: unique symbol;
}
