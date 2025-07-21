import { DependencyList } from "react";
import { ChangesEvent, FieldChange } from "../change/index.ts";
import { DetachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { Field } from "../field/definition.ts";
import type { State } from "../state/index.ts";
import type { Enso } from "../types.ts";
import type { EnsoUtils as Utils } from "../utils.ts";

export declare class Atom<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  >
  implements
    Utils.StaticImplements<
      typeof Atom<Flavor, ValueDef, Qualifier, Parent>,
      Atom.Static
    >,
    Atom.Exact<Flavor, ValueDef, Qualifier, Parent>
{
  //#region Static

  static safeNullish<Type>(value: Type | Utils.Nullish): Enso.SafeNullish<Type>;

  //#endregion

  //#region Instance

  constructor(
    value: ValueDef["read"],
    parent?: Atom.Parent.Ref<Exclude<Flavor, Atom.Flavor.Variant>, Parent>,
  );

  deconstruct(): void;

  //#endregion

  //#region Phantoms

  [AtomPrivate.immutablePhantom]: Atom.Immutable.Phantom<Flavor, ValueDef>;

  [AtomPrivate.qualifierPhantom](): Atom.Qualifier.Map<Qualifier>;

  [AtomPrivate.valuePhantom]: Atom.Value.Phantom<ValueDef>;

  [AtomPrivate.parentPhantom]: Atom.Parent.Phantom<ValueDef, Parent>;

  //#endregion

  //#region Attributes

  readonly id: string;

  //#endregion

  //#region Value

  get value(): Atom.Value.Prop<ValueDef>;

  useValue(): Atom.Value.Use.Result<ValueDef>;

  compute: Atom.Compute.Prop<ValueDef>;

  useCompute: Atom.Compute.UseProp<ValueDef>;

  set<NewValue extends Atom.Value.Write<ValueDef>>(
    value: NewValue,
  ): Atom.Envelop<
    Flavor,
    Atom.Set.Value<Atom.Value.Write<ValueDef>, NewValue>,
    Qualifier,
    Parent
  >;

  pave<PavedValue extends Utils.NonNullish<Atom.Value.Write<ValueDef>>>(
    value: PavedValue,
  ): Atom.Envelop<
    Flavor,
    Atom.Pave.Value<Atom.Value.Write<ValueDef>, PavedValue>,
    Qualifier,
    Parent
  >;

  get lastChanges(): FieldChange;

  //#endregion

  //#region Type

  size: Atom.Size.Prop<ValueDef>;

  remove: Atom.RemoveProp<Flavor, ValueDef>;

  forEach: Atom.ForEachProp<Flavor, ValueDef>;

  map: Atom.MapProp<Flavor, ValueDef>;

  find: Atom.FindProp<Flavor, ValueDef>;

  filter: Atom.FilterProp<Flavor, ValueDef>;

  useCollection: Atom.UseCollectionProp<Flavor, ValueDef, Qualifier, Parent>;

  insert: Atom.Insert.Prop<Flavor, ValueDef, Qualifier, Parent>;

  push: Atom.Push.Prop<Flavor, ValueDef, Qualifier, Parent>;

  //#endregion

  //#region Tree

  get root(): Atom.Root<Flavor>;

  get parent(): Atom.Parent.Prop<
    Exclude<Flavor, Atom.Flavor.Variant>,
    ValueDef,
    Parent
  >;

  get key(): string;

  get $(): Atom.$.Prop<Flavor, ValueDef>;

  at: Atom.At.Prop<Flavor, ValueDef>;

  try: Atom.Try.Prop<Flavor, ValueDef>;

  get path(): string[];

  get name(): string;

  self: Atom.Self.Envelop<Flavor, ValueDef, Qualifier, Parent>;

  //#endregion

  //#region Events

  eventsTree: EventsTree<Extract<Flavor, Atom.Flavor.Kind>>;

  watch(callback: Atom.Watch.Callback<ValueDef>): Atom.Unwatch;

  useWatch(
    callback: Atom.Watch.Callback<ValueDef>,
    deps: DependencyList,
  ): Atom.Unwatch;

  trigger(changes: FieldChange, notifyParents?: boolean): void;

  //#endregion

  //#region Transform

  decompose: Atom.Decompose.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useDecompose: Atom.Decompose.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

  discriminate: Atom.Discriminate.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useDiscriminate: Atom.Discriminate.Prop<Flavor, ValueDef, Qualifier, Parent>;

  into: Atom.Proxy.Into.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useInto: Atom.Proxy.Into.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useDefined: Atom.Defined.Prop<Flavor, ValueDef, Qualifier, Parent>;

  shared: Atom.Shared.Prop<Flavor, ValueDef, Qualifier, Parent>;

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
    export interface Subclass<Kind extends Atom.Flavor.Kind> {
      create<
        Value,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      >(
        value: Value,
        parent?: Parent.Ref<Kind, Parent>,
      ): Envelop<Kind | "exact", Value, Qualifier, Parent>;

      // TODO: Ideally it should go into Static and utilize create

      base<EnvelopType extends Atom.Envelop<Kind, any>>(
        atom: EnvelopType,
      ): Atom.Base.Result<Kind, EnvelopType>;

      use<Value>(
        initialValue: Value,
        deps: DependencyList,
      ): Atom.Envelop<Kind | "exact", Value>;

      useEnsure<
        EnvelopType extends Atom.Envelop<Kind, any> | Utils.Nullish,
        MappedValue = undefined,
      >(
        atom: EnvelopType,
        map?: Ensure.Mapper<Kind, EnvelopType, MappedValue>,
      ): Ensure.Result<Kind, EnvelopType, MappedValue>;
    }

    export namespace Ensure {
      export interface Mapper<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
        MappedValue,
      > {
        (
          atom: Envelop<Kind, AtomValue<Kind, EnvelopType>>,
        ): Envelop<Kind, MappedValue>;
      }

      export type AtomValue<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
      > =
        EnvelopType extends Envelop<Kind, infer Value>
          ? Value extends Shared.Value<any>
            ? unknown
            : Value
          : never;

      export type Result<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
        MappedValue,
      > = MappedValue extends undefined
        ? ResultDirect<Kind, EnvelopType>
        : ResultMapped<Kind, EnvelopType, MappedValue>;

      export type ResultDirect<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
      > = Field<
        | (EnvelopType extends Utils.Nullish ? undefined : never)
        | AtomValue<Kind, EnvelopType>
      >;

      export type ResultMapped<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
        MappedValue,
      > = Envelop<
        Kind,
        (EnvelopType extends Utils.Nullish ? undefined : never) | MappedValue
      >;
    }
  }

  //#endregion

  //#region Flavor

  export namespace Flavor {
    // NOTE: We wrap those into a namespace, as Flavor, Kind and Variant are
    // used as generic param names, so to avoid a situation when we forget to
    // define a flavor param and use it the constraint instead, e.g.:
    //
    //   type Generic<Value> = Kind extends "field" ? Field<Value> : never
    //
    // If Kind was defined at Atom.Kind, it would produce incorrect type,
    // where we meant to have `type Generic<Kind, Value> = ...`.

    export type Constraint = Kind | Variant;

    export type Kind = "state" | "field";

    export type Variant = "immutable" | "base" | "exact";
  }

  // WIP: Try to get rid of it. The purpose is to have symmetry with Ref but it
  // might be simple Extract, however I can't check until I stabilize tysts.

  export type Envelop<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > =
    ExtractKind<Flavor> extends "state"
      ? State.Envelop<
          "state" | ExtractVariant<Flavor>,
          Value,
          Qualifier,
          Parent
        >
      : ExtractKind<Flavor> extends "field"
        ? Field.Envelop<
            "field" | ExtractVariant<Flavor>,
            Value,
            Qualifier,
            Parent
          >
        : never;

  export type Every<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > =
    // Handle boolean separately, so it doesn't produce `Atom<..., true> | Atom<..., false>`
    | (boolean extends Value
        ? Envelop<Flavor, Value, Qualifier, Parent>
        : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? Envelop<Flavor, Value, Qualifier, Parent>
          : never
        : never);

  export type ExtractKind<Flavor extends Atom.Flavor.Constraint> =
    Utils.IsNever<Exclude<Flavor, Atom.Flavor.Variant>> extends true
      ? unknown
      : Flavor extends Atom.Flavor.Kind
        ? Flavor
        : never;

  export type ExtractVariant<Flavor extends Atom.Flavor.Constraint> =
    Utils.IsNever<Exclude<Flavor, Atom.Flavor.Kind>> extends true
      ? "exact"
      : Flavor extends Atom.Flavor.Variant
        ? Flavor
        : never;

  //#endregion

  //#region Variant

  export namespace Variant {}

  //#endregion

  //#region Qualifier

  export namespace Qualifier {
    // NOTE: We wrap Constraint into a namespace rather than define
    // Atom.Qualifier, as Qualifier is used as generic param name, so to avoid
    // a situation when we forget to define the qualifier param and use it
    // the constraint instead, e.g.:
    //
    //   type Generic<Value> = Qualifier extends "detachable" ? Remove<Value> : never
    //
    // If Qualifier was defined at Atom.Qualifier, it would produce incorrect
    // type, where we meant to have `type Generic<Value, Qualifier> = ...`.

    export type Constraint =
      | "root"
      | "detachable"
      | "tried"
      | "bound"
      | Proxy.Qualifier<unknown>;

    export type Default = never;

    export type Map<Qualifier extends Atom.Qualifier.Constraint> =
      Utils.NeverDefault<
        MapChunkBasic<Qualifier, "root"> &
          MapChunkBasic<Qualifier, "detachable"> &
          MapChunkBasic<Qualifier, "tried"> &
          MapChunkBasic<Qualifier, "bound"> &
          MapChunkProxy<Qualifier>,
        {}
      >;

    export type MapChunkBasic<
      // WIP: Try to make it reusable this inside Ref
      Qualifier extends Atom.Qualifier.Constraint,
      TestQualifier extends keyof any,
    > = TestQualifier extends Qualifier ? { [Key in TestQualifier]: true } : {};

    export type MapChunkProxy<Qualifier extends Atom.Qualifier.Constraint> =
      Qualifier extends Proxy.Qualifier<infer SourceValue>
        ? { proxy: SourceValue }
        : {};
  }

  //#endregion

  //#region Parent

  export namespace Parent {
    export type Default = never;

    export type Phantom<
      ValueDef extends Def.Constraint,
      Parent extends Constraint<ValueDef>,
    > = Utils.IsNever<Parent> extends true ? unknown : { parent: Parent };

    export type Envelop<
      Kind extends Atom.Flavor.Kind,
      ParentValue,
    > = Atom.Envelop<
      Kind | "immutable",
      Utils.IsNever<ParentValue> extends true ? any : ParentValue
    >;

    export type Prop<
      Kind extends Atom.Flavor.Kind,
      ValueDef extends Atom.Def.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Ref<
      Kind,
      Utils.IsNever<Parent> extends true ? Interface<any, any> : Parent
    >;

    export type Ref<
      Kind extends Atom.Flavor.Kind,
      Parent extends Atom.Parent.Constraint<any>,
    > =
      Parent extends Interface<infer ParentValue, infer Key>
        ?
            | Parent.Direct<Kind, ParentValue, Key>
            | Parent.Source<Kind, ParentValue>
        : never;

    export interface Direct<
      Kind extends Atom.Flavor.Kind,
      ParentValue,
      Key extends keyof ParentValue,
    > {
      field: Envelop<Kind, ParentValue>;
      key: Key;
    }

    export interface Interface<ParentValue, Key extends keyof ParentValue> {
      value: ParentValue;
      key: Key;
    }

    export interface Source<Kind extends Atom.Flavor.Kind, ParentValue> {
      source: Envelop<Kind, ParentValue>;
    }

    export type Constraint<Value> = Type<
      Value.Read<Value>,
      Interface<any, any>
    >;

    export type Type<Value, ParentInterface> =
      ParentInterface extends Interface<infer ParentValue, infer Key>
        ? Value extends ParentValue[Key]
          ? ParentInterface
          : never
        : never;
  }

  //#endregion

  //#region Child

  export type Child<
    Flavor extends Atom.Flavor.Constraint,
    ParentValue,
    Key extends keyof ParentValue,
    Access extends Child.Access,
  > = Envelop<
    Child.Type<Flavor, ParentValue>,
    Child.Value<ParentValue, Key, Access>,
    Child.Qualifier<ParentValue, Key>
  >;

  export namespace Child {
    export type Every<
      Flavor extends Atom.Flavor.Constraint,
      ParentValue,
      Key extends keyof ParentValue,
      Access extends Child.Access,
    > = Key extends Key
      ? Atom.Every<
          Child.Type<Flavor, ParentValue>,
          Child.Value<ParentValue, Key, Access>,
          Child.Qualifier<ParentValue, Key>
        >
      : never;

    export type Access = "indexed" | "iterated";

    export type Type<Flavor extends Atom.Flavor.Constraint, ParentValue> =
      | Extract<Flavor, Atom.Flavor.Kind>
      | (ExtractVariant<Flavor> extends infer Variant extends
          Atom.Flavor.Variant
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
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Immutable<Flavor, ValueDef, Qualifier, Parent> {
    //#region Value

    set<NewValue extends Value.Write<ValueDef>>(
      value: NewValue,
    ): Envelop<
      Flavor,
      Atom.Set.Value<Value.Write<ValueDef>, NewValue>,
      Qualifier,
      Parent
    >;

    pave<PavedValue extends Utils.NonNullish<Atom.Value.Write<ValueDef>>>(
      value: PavedValue,
    ): Envelop<
      Flavor,
      Pave.Value<Atom.Value.Write<ValueDef>, PavedValue>,
      Qualifier,
      Parent
    >;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.valuePhantom]: Atom.Value.Phantom<ValueDef>;

    lastChanges: FieldChange;

    //#endregion

    //#region Type

    remove: RemoveProp<Flavor, ValueDef>;

    insert: Insert.Prop<Flavor, ValueDef, Qualifier, Parent>;

    push: Push.Prop<Flavor, ValueDef, Qualifier, Parent>;

    //#endregion

    //#region Events

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion
  }

  export namespace Exact {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractKind<Flavor> extends "state"
        ? State.Exact<Value, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Exact<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Self<Flavor, ValueDef, Qualifier, Parent> {
      remove: Atom.Self.Remove.Prop<Flavor, ValueDef, Qualifier, Parent>;
    }
  }

  //#endregion

  //#region Base

  export interface Base<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Immutable<Flavor, ValueDef, Qualifier, Parent> {}

  export namespace Base {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractKind<Flavor> extends "state"
        ? State.Base<Value, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Base<Value, Qualifier, Parent>
          : never;

    export type Result<
      Kind extends Atom.Flavor.Kind,
      EnvelopType extends Atom.Envelop<Kind, any>,
    > = Atom.Base.Envelop<
      Kind,
      Value.Base<EnvelopType>,
      Qualifier.Shared<EnvelopType>
    >;

    export namespace Value {
      export type Base<EnvelopType extends Atom.Envelop<any, any>> =
        EnvelopType extends Atom.Envelop<any, infer Value>
          ? Value extends Shared.Value<any>
            ? unknown
            : Value
          : never;

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
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Self<Flavor, ValueDef, Qualifier, Parent> {}
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > {
    //#region Phantoms

    // NOTE: As immutable atoms never resolve exact children like base,
    // we must manually provide phantom type to ensure proper variance between
    // them.
    [AtomPrivate.immutablePhantom]: Immutable.Phantom<Flavor, ValueDef>;

    [AtomPrivate.qualifierPhantom](): Atom.Qualifier.Map<Qualifier>;

    [AtomPrivate.parentPhantom]: Parent.Phantom<ValueDef, Parent>;

    //#endregion

    //#region Instance

    deconstruct(): void;

    //#endregion

    readonly id: string;

    //#region Value

    value: Atom.Value.Prop<ValueDef>;

    useValue(): Atom.Value.Use.Result<ValueDef>;

    compute: Compute.Prop<ValueDef>;

    useCompute: Compute.UseProp<ValueDef>;

    //#endregion

    //#region Tree

    root: Root<Flavor>;

    parent: Parent.Prop<Exclude<Flavor, Atom.Flavor.Variant>, ValueDef, Parent>;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $.Prop<Flavor, ValueDef>;

    at: At.Prop<Flavor, ValueDef>;

    try: Atom.Try.Prop<Flavor, ValueDef>;

    self: Self.Envelop<Flavor, ValueDef, Qualifier>;

    //#endregion

    //#region Type

    size: Size.Prop<ValueDef>;

    forEach: ForEachProp<Flavor, ValueDef>;

    map: MapProp<Flavor, ValueDef>;

    find: FindProp<Flavor, ValueDef>;

    filter: FilterProp<Flavor, ValueDef>;

    useCollection: UseCollectionProp<Flavor, ValueDef, Qualifier, Parent>;

    //#endregion

    //#region Events

    eventsTree: EventsTree<Extract<Flavor, Atom.Flavor.Kind>>;

    watch(callback: Watch.Callback<ValueDef>): Unwatch;

    useWatch(callback: Watch.Callback<ValueDef>, deps: DependencyList): Unwatch;

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion

    //#region Transform

    decompose: Decompose.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useDecompose: Decompose.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    discriminate: Discriminate.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useDiscriminate: Discriminate.Prop<Flavor, ValueDef, Qualifier, Parent>;

    into: Proxy.Into.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useInto: Proxy.Into.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useDefined: Defined.Prop<Flavor, ValueDef, Qualifier, Parent>;

    shared: Shared.Prop<Flavor, ValueDef, Qualifier, Parent>;

    //#endregion
  }

  export namespace Immutable {
    export type Phantom<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
    > = $.Prop<Extract<Flavor, Flavor.Kind> | "base", ValueDef>;

    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractKind<Flavor> extends "state"
        ? State.Immutable<Value, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Immutable<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > {
      try(): Try<Flavor, ValueDef, Qualifier>;
    }

    export type Try<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
    > =
      Value.Read<ValueDef> extends infer Value
        ? // Add null to the union
          | (null extends Value ? null : never)
            // Add undefined to the union
            | (undefined extends Value ? undefined : never)
            // Resolve branded field without null or undefined
            | Atom.Envelop<Flavor, Utils.NonNullish<Value>, "tried" | Qualifier>
        : never;
  }

  //#endregion

  //#endregion

  //#region Shared

  export namespace Shared {
    export type Value<ValueTuple extends Value.Tuple> = {
      value: ValueTuple;
      [sharedValuePhantom]: true;
    };

    declare const sharedValuePhantom: unique symbol;

    export namespace Value {
      export type Tuple =
        | [unknown, unknown, unknown, unknown, unknown]
        | [unknown, unknown, unknown, unknown]
        | [unknown, unknown, unknown]
        | [unknown, unknown];

      export type Union<ValueTuple> = ValueTuple extends Utils.Tuple
        ? Utils.IndexOfTuple<ValueTuple> extends infer Index extends
            keyof ValueTuple
          ? ValueTuple[Index]
          : never
        : never;

      export type Intersection<ValueTuple> =
        Union<ValueTuple> extends infer Value
          ? ValueTuple extends Utils.Tuple
            ? Utils.IndexOfTuple<ValueTuple> extends infer Index extends
                keyof ValueTuple
              ? Value extends Value
                ? (
                    Index extends Index
                      ? Value extends ValueTuple[Index]
                        ? true
                        : false
                      : never
                  ) extends true
                  ? Value
                  : never
                : never
              : never
            : never
          : never;
    }

    export interface Prop<
      Flavor extends Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Qualifier.Constraint = Qualifier.Default,
      Parent extends Parent.Constraint<ValueDef> = Parent.Default,
    > {
      <ValueTuple extends Value.Tuple>(): Result<
        Flavor,
        ValueDef,
        ValueTuple,
        Qualifier,
        Parent
      >;
    }

    export type Result<
      Flavor extends Flavor.Constraint,
      ValueDef extends Def.Constraint,
      ValueTuple extends Value.Tuple,
      Qualifier extends Qualifier.Constraint = Qualifier.Default,
      Parent extends Parent.Constraint<ValueDef> = Parent.Default,
    > = Envelop<
      Flavor,
      Result.Tuple<
        Flavor,
        ValueDef,
        ValueTuple
      > extends infer ResultTuple extends Value.Tuple
        ? Utils.IsNever<ResultTuple> extends true
          ? unknown
          : Shared.Value<ResultTuple>
        : never,
      Qualifier,
      Parent
    >;

    export namespace Result {
      export type Tuple<
        Flavor extends Flavor.Constraint,
        ValueDef extends Def.Constraint,
        ValueTuple extends Value.Tuple,
      > = "exact" extends Flavor
        ? Exact<ValueDef["read"], ValueTuple>
        : Base<ValueDef["read"], ValueTuple>;

      export type Exact<
        Value,
        ValueTuple extends Value.Tuple,
      > = ValueTuple extends [
        infer Value1,
        infer Value2,
        infer Value3,
        infer Value4,
        infer Value5,
      ]
        ? Result.Exact5<Value, Value1, Value2, Value3, Value4, Value5>
        : ValueTuple extends [
              infer Value1,
              infer Value2,
              infer Value3,
              infer Value4,
            ]
          ? Result.Exact4<Value, Value1, Value2, Value3, Value4>
          : ValueTuple extends [infer Value1, infer Value2, infer Value3]
            ? Result.Exact3<Value, Value1, Value2, Value3>
            : ValueTuple extends [infer Value1, infer Value2]
              ? Result.Exact2<Value, Value1, Value2>
              : never;

      export type ExcludeSubclasses<Value, ValueItem> =
        ValueItem extends ValueItem
          ? Value extends ValueItem
            ? Value
            : ValueItem
          : never;

      interface Entity {
        name: string;
        flag?: boolean;
      }

      interface Account extends Entity {
        paid: boolean;
      }

      type Test1 = Exact2<
        Account,
        Account | Entity | boolean,
        Account | Entity
      >;

      export type Exact2<Value, Value1, Value2> = [Value] extends [Value1]
        ? [Value] extends [Value2]
          ? [ExcludeSubclasses<Value, Value1>, ExcludeSubclasses<Value, Value2>]
          : never
        : never;

      export type Exact3<Value, Value1, Value2, Value3> = [Value] extends [
        Value1,
      ]
        ? [Value] extends [Value2]
          ? [Value] extends [Value3]
            ? [
                ExcludeSubclasses<Value, Value1>,
                ExcludeSubclasses<Value, Value2>,
                ExcludeSubclasses<Value, Value3>,
              ]
            : never
          : never
        : never;

      export type Exact4<Value, Value1, Value2, Value3, Value4> = [
        Value,
      ] extends [Value1]
        ? [Value] extends [Value2]
          ? [Value] extends [Value3]
            ? [Value] extends [Value4]
              ? [
                  ExcludeSubclasses<Value, Value1>,
                  ExcludeSubclasses<Value, Value2>,
                  ExcludeSubclasses<Value, Value3>,
                  ExcludeSubclasses<Value, Value4>,
                ]
              : never
            : never
          : never
        : never;

      export type Exact5<Value, Value1, Value2, Value3, Value4, Value5> = [
        Value,
      ] extends [Value1]
        ? [Value] extends [Value2]
          ? [Value] extends [Value3]
            ? [Value] extends [Value4]
              ? [Value] extends [Value5]
                ? [
                    ExcludeSubclasses<Value, Value1>,
                    ExcludeSubclasses<Value, Value2>,
                    ExcludeSubclasses<Value, Value3>,
                    ExcludeSubclasses<Value, Value4>,
                    ExcludeSubclasses<Value, Value5>,
                  ]
                : never
              : never
            : never
          : never
        : never;

      export type Base<
        Value,
        ValueTuple extends Value.Tuple,
      > = ValueTuple extends [
        infer Value1,
        infer Value2,
        infer Value3,
        infer Value4,
        infer Value5,
      ]
        ? Result.Base5<Value, Value1, Value2, Value3, Value4, Value5>
        : ValueTuple extends [
              infer Value1,
              infer Value2,
              infer Value3,
              infer Value4,
            ]
          ? Result.Base4<Value, Value1, Value2, Value3, Value4>
          : ValueTuple extends [infer Value1, infer Value2, infer Value3]
            ? Result.Base3<Value, Value1, Value2, Value3>
            : ValueTuple extends [infer Value1, infer Value2]
              ? Result.Base2<Value, Value1, Value2>
              : never;

      export type Base2<Value, Value1, Value2> = [Value] extends [Value1]
        ? [Value] extends [Value2]
          ? [Value1, Value2]
          : never
        : never;

      export type Base3<Value, Value1, Value2, Value3> = [Value] extends [
        Value1,
      ]
        ? [Value] extends [Value2]
          ? [Value] extends [Value3]
            ? [Value1, Value2, Value3]
            : never
          : never
        : never;

      export type Base4<Value, Value1, Value2, Value3, Value4> = [
        Value,
      ] extends [Value1]
        ? [Value] extends [Value2]
          ? [Value] extends [Value3]
            ? [Value] extends [Value4]
              ? [Value1, Value2, Value3, Value4]
              : never
            : never
          : never
        : never;

      export type Base5<Value, Value1, Value2, Value3, Value4, Value5> = [
        Value,
      ] extends [Value1]
        ? [Value] extends [Value2]
          ? [Value] extends [Value3]
            ? [Value] extends [Value4]
              ? [Value] extends [Value5]
                ? [Value1, Value2, Value3, Value4, Value5]
                : never
              : never
            : never
          : never
        : never;
    }
  }

  //#endregion

  //#region Value

  export interface Def<ReadValue, WriteValue = ReadValue> {
    read: ReadValue;
    write: WriteValue;
    [defBrand]: true;
  }

  declare const defBrand: unique symbol;

  export namespace Def {
    export type Constraint = Atom.Def<any>;
  }

  export namespace Value {
    export type Prop<ValueDef extends Def.Constraint> = Opaque<
      ValueDef["read"]
    >;

    export type Opaque<Value> =
      // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
      // respectively, so we have to have special case for them to account for
      // invariance.
      Utils.IsNotTop<Value> extends true
        ? Value extends Shared.Value<infer ValueTuple>
          ? Shared.Value.Union<ValueTuple>
          : // Preserve brand if it exists
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

    export type Read<Value> =
      Value extends Def<infer Value>
        ? Value extends Shared.Value<infer ValueTuple>
          ? Shared.Value.Union<ValueTuple>
          : Value
        : Value extends Shared.Value<infer ValueTuple>
          ? Shared.Value.Union<ValueTuple>
          : Value;

    export type Write<Value> =
      // WIP:
      // Value extends Def<any, infer Value>
      Value extends Def<infer Value>
        ? Value extends Shared.Value<infer ValueTuple>
          ? Shared.Value.Intersection<ValueTuple>
          : Value
        : Value extends Shared.Value<infer ValueTuple>
          ? Shared.Value.Intersection<ValueTuple>
          : Value;

    export interface Phantom<ValueDef extends Def.Constraint> {
      (value: Value.Read<ValueDef>): void;
    }

    export type FromEnvelop<EnvelopType extends Atom.Envelop<any, any>> =
      EnvelopType extends Atom.Envelop<any, infer Value> ? Value : never;

    export namespace Use {
      export type Result<ValueDef extends Def.Constraint> = Opaque<
        ValueDef["read"]
      >;
    }
  }

  export namespace Set {
    export type Value<Value, NewValue extends Value> = Value extends Value
      ? NewValue extends Value
        ? Value
        : never
      : never;
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
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > =
      ExtractVariant<Flavor> extends infer Variant extends Atom.Flavor.Variant
        ? Variant extends "exact"
          ? Exact.Self<Flavor, ValueDef, Qualifier, Parent>
          : Variant extends "base"
            ? Base.Self<Flavor, ValueDef, Qualifier, Parent>
            : Immutable.Self<Flavor, ValueDef, Qualifier, Parent>
        : never;

    export namespace Remove {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > =
        // NOTE: {} is required to break signatures compatibility of value unions
        // such as `string[] | undefined` when used for type functions. If
        // the function were to resolve to `never`, it would act as it was just
        // `string[]`, which is incorrect.
        Utils.IsNever<Qualifier> extends true
          ? {}
          : Qualifier extends "detachable"
            ? Fn<Flavor, ValueDef, Qualifier, Parent>
            : {};

      export interface Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > {
        (): Atom.Envelop<Flavor, DetachedValue, Qualifier, Parent>;
      }
    }
  }

  //#endregion

  export namespace Size {
    export type Prop<ValueDef extends Def.Constraint> =
      Value.Read<ValueDef> extends infer Value
        ? Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : number
          : undefined
        : never;
  }

  //#region Remove

  export type RemoveProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
  > =
    Value.Read<ValueDef> extends infer Value
      ? Value extends unknown[] | readonly unknown[]
        ? Utils.IsReadonlyArray<Value> extends true
          ? undefined
          : Value extends Utils.Tuple
            ? undefined
            : Value extends unknown[]
              ? RemoveArray<Flavor, Value>
              : never
        : Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : RemoveObject<Flavor, Value>
          : undefined
      : never;

  export interface RemoveArray<
    Flavor extends Atom.Flavor.Constraint,
    Value extends unknown[],
  > {
    (
      item: number,
    ): Envelop<Flavor, DetachedValue | Value[number], "detachable">;
  }

  export interface RemoveObject<
    Flavor extends Atom.Flavor.Constraint,
    Value extends object,
  > {
    <Key extends Enso.DetachableKeys<Value>>(
      key: Key,
    ): Envelop<Flavor, DetachedValue | Value[Key], "detachable">;
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
      Flavor extends Atom.Flavor.Constraint,
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
      Flavor extends Atom.Flavor.Constraint,
      Value extends Utils.Tuple,
      Result = void,
    > {
      (
        item: {
          [Key in keyof Value]: Envelop<Flavor, Value[Key]>;
        }[Utils.IndexOfTuple<Value>],
        index?: Utils.IndexOfTuple<Value>,
      ): Result;
    }

    export type TupleItem<
      Flavor extends Atom.Flavor.Constraint,
      Value extends Utils.Tuple,
    > = {
      [Key in Utils.IndexOfTuple<Value>]: Envelop<Flavor, Value[Key]>;
    }[Utils.IndexOfTuple<Value>];

    // Array

    export interface ArrayHandler<
      Flavor extends Atom.Flavor.Constraint,
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
      Flavor extends Atom.Flavor.Constraint,
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
      Flavor extends Atom.Flavor.Constraint,
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
      Flavor extends Atom.Flavor.Constraint,
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
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      ProcessorType extends Mapper.ResultType,
    > =
      Value.Read<ValueDef> extends infer Value
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
        Flavor extends Atom.Flavor.Constraint,
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
        Flavor extends Atom.Flavor.Constraint,
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
        Flavor extends Atom.Flavor.Constraint,
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
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      SelectorType extends Selector.Type,
    > =
      Value.Read<ValueDef> extends infer Value
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
        Flavor extends Atom.Flavor.Constraint,
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
        Flavor extends Atom.Flavor.Constraint,
        Value extends Utils.ArrayConstraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ArrayHandler<Flavor, Value, unknown>,
        ): Result<SelectorType, Child<Flavor, Value, number, "iterated">>;
      }

      // Object

      export interface Object<
        Flavor extends Atom.Flavor.Constraint,
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
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
  > = Collection.Mapper<Flavor, ValueDef, "each">;

  export type MapProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
  > = Collection.Mapper<Flavor, ValueDef, "map">;

  export type FindProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
  > = Collection.Selector<Flavor, ValueDef, "find">;

  export type FilterProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
  > = Collection.Selector<Flavor, ValueDef, "filter">;

  export type UseCollectionProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > =
    Value.Read<ValueDef> extends infer Value
      ? Value extends object
        ? Value extends Utils.BrandedPrimitive
          ? undefined
          : () => Envelop<Flavor, Value, Qualifier | "bound", Parent>
        : undefined
      : never;

  export namespace Insert {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > =
      Value.Read<ValueDef> extends infer Value
        ? Value extends Utils.StaticArray
          ? undefined
          : Value extends unknown[]
            ? Fn<Flavor, Value, Qualifier, Parent>
            : undefined
        : never;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (
        index: number,
        value: Value[number],
      ): Envelop<
        Child.Type<Flavor, Value>,
        Value[number],
        Child.Qualifier<Value, number>
      >;
    }
  }

  export namespace Push {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > =
      Value.Read<ValueDef> extends infer Value
        ? Value extends Utils.Tuple
          ? undefined
          : Value extends unknown[]
            ? Fn<Flavor, Value, Qualifier, Parent>
            : undefined
        : never;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (
        value: Value[number],
      ): Envelop<
        Child.Type<Flavor, Value>,
        Value[number],
        Child.Qualifier<Value, number>
      >;
    }
  }

  //#endregion

  //#endregion

  //#region Tree

  export type Root<Flavor extends Atom.Flavor.Constraint> = Envelop<
    Exclude<Flavor, Flavor.Variant> | "immutable",
    unknown,
    "root"
  >;

  //#region $

  export namespace $ {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
    > =
      Value.Read<ValueDef> extends infer Value
        ? // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
          // respectively, so we have to have special case for them to account for
          // invariance.
          Utils.IsAny<Value> extends true
          ? any
          : Utils.IsUnknown<Value> extends true
            ? never
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : {
                    [Key in keyof Value]-?: Child<
                      Flavor,
                      Value,
                      Key,
                      "indexed"
                    >;
                  }
              : undefined
        : never;
  }

  //#endregion

  //#region At

  export namespace At {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
    > =
      | (Utils.HasNonObject<Value.Read<ValueDef>> extends true
          ? undefined
          : never)
      | (Utils.OnlyObject<Value.Read<ValueDef>> extends infer Value
          ? Fn<Flavor, Utils.NonNullish<Value>, keyof Utils.NonNullish<Value>>
          : never);

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Key extends keyof Value,
    > {
      <ArgKey extends Key>(
        key: ArgKey | Enso.SafeNullish<ArgKey>,
      ): Child<Flavor, Value, ArgKey>;
    }

    export type Child<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Key extends keyof Value,
    > = Key extends Key ? Atom.Child<Flavor, Value, Key, "indexed"> : never;
  }

  //#endregion

  //#region Try

  export namespace Try {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
    > =
      | (Utils.HasNonObject<Value.Read<ValueDef>> extends true
          ? undefined
          : never)
      | (Utils.OnlyObject<Value.Read<ValueDef>> extends infer Value
          ? keyof Value extends infer Key extends keyof Value
            ? <ArgKey extends Key>(
                key: ArgKey | Enso.SafeNullish<ArgKey>,
              ) => Child<Flavor, Value, ArgKey>
            : never
          : never);

    export type Child<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Key extends keyof Utils.NonNullish<Value>,
    > = Key extends Key
      ?
          | Envelop<
              Flavor,
              Utils.NonNullish<Value>[Key],
              Child.Qualifier<Value, Key>
            >
          // Add undefined if the key is not static (i.e. a record key).
          | (Utils.IsStaticKey<Utils.NonNullish<Value>, Key> extends true
              ? never
              : undefined)
      : never;

    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > =
      // Add null to the union
      | (null extends Value ? null : never)
      // Add undefined to the union
      | (undefined extends Value ? undefined : never)
      // Resolve branded field without null or undefined
      | Atom.Envelop<
          Child.Type<Flavor, Value>,
          Utils.NonNullish<Value>,
          Qualifier | "tried"
        >;
  }

  //#endregion

  //#endregion

  //#region Events

  export namespace Watch {
    export interface Callback<ValueDef extends Def.Constraint> {
      (value: Value.Read<ValueDef>, event: ChangesEvent): void;
    }
  }

  export type Unwatch = () => void;

  //#endregion

  //#region Transform

  //#region Compute

  export namespace Compute {
    export interface Prop<ValueDef extends Def.Constraint> {
      <Result>(callback: Callback<ValueDef, Result>): Result;
    }

    export interface Callback<ValueDef extends Def.Constraint, Result> {
      (value: Value.Read<ValueDef>): Result;
    }

    export interface UseProp<ValueDef extends Def.Constraint> {
      <Result>(
        callback: Callback<ValueDef, Result>,
        deps: DependencyList,
      ): Result;
    }
  }

  //#endregion

  //#region Decompose

  export namespace Decompose {
    export interface Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > {
      (): Result<Flavor, ValueDef, Qualifier, Parent>;
    }

    export type Result<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      Value.Read<Value> extends infer Value
        ?
            | (Value extends Value
                ? {
                    value: Value;
                    field: Envelop<Flavor, Value, Qualifier, Parent>;
                  }
                : never)
            // Add unknown option for the base and immutable variants
            | (Flavor extends
                | (infer Kind extends Atom.Flavor.Kind)
                | infer Variant
                ? Variant extends "base" | "immutable"
                  ? {
                      value: unknown;
                      field: Envelop<
                        Kind | Variant,
                        unknown,
                        Qualifier,
                        Parent
                      >;
                    }
                  : never
                : never)
        : never;

    export namespace Use {
      export interface Prop<
        Flavor extends Atom.Flavor.Constraint,
        Value,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        (
          callback: Callback<Value>,
          deps: DependencyList,
        ): Result<Flavor, Value, Qualifier, Parent>;
      }

      export type Callback<Value> = (
        newValue: Value.Read<Value>,
        prevValue: Value.Read<Value>,
      ) => boolean;
    }
  }

  //#endregion

  //#region Discriminate

  export namespace Discriminate {
    export interface Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > {
      <Discriminator extends Discriminate.Discriminator<ValueDef>>(
        discriminator: Discriminator,
      ): Result<Flavor, ValueDef, Discriminator, Qualifier, Parent>;
    }

    export type Discriminator<ValueDef extends Def.Constraint> =
      keyof Utils.NonUndefined<Value.Read<ValueDef>>;

    export type Result<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Discriminator extends Discriminate.Discriminator<ValueDef>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > = Inner<Flavor, ValueDef, Discriminator, Qualifier, Parent>;

    export type Inner<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Discriminator extends Discriminate.Discriminator<ValueDef>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > =
      Value.Read<ValueDef> extends infer Value
        ?
            | (Value extends Value
                ? Discriminator extends keyof Value
                  ? Value[Discriminator] extends infer DiscriminatorValue
                    ? DiscriminatorValue extends Value[Discriminator]
                      ? {
                          discriminator: DiscriminatorValue;
                          field: Envelop<Flavor, Value, Qualifier, Parent>;
                        }
                      : never
                    : never
                  : // Add the payload type without the discriminator (i.e. undefined)
                    {
                      discriminator: undefined;
                      field: Envelop<Flavor, Value, Qualifier, Parent>;
                    }
                : never)
            // Add unknown option for the base and immutable variants
            | (Flavor extends
                | (infer Kind extends Atom.Flavor.Kind)
                | infer Variant
                ? Variant extends "base" | "immutable"
                  ? {
                      discriminator: unknown;
                      field: Envelop<
                        Kind | Variant,
                        unknown,
                        Qualifier,
                        Parent
                      >;
                    }
                  : never
                : never)
        : never;
  }

  //#endregion

  //#region Proxy

  export namespace Proxy {
    export interface Qualifier<ValueDef> {
      source: ValueDef;
    }

    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      ComputedValue,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Envelop<Flavor, ComputedValue, Proxy.Qualifier<Value>, Parent>;

    export namespace Into {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > = Into.Fn<Flavor, ValueDef, Qualifier, Parent>;

      export interface Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > {
        <ComputedValue>(
          intoMapper: Into.Mapper<ValueDef, ComputedValue>,
        ): Result<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<ValueDef extends Def.Constraint, ComputedValue> {
        (value: Value.Read<ValueDef>): ComputedValue;
      }

      export interface Result<
        Flavor extends Atom.Flavor.Constraint,
        Value,
        ComputedValue,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        from: From.Fn<Flavor, Value, ComputedValue, Qualifier, Parent>;
      }

      export namespace Use {
        export type Prop<
          Flavor extends Atom.Flavor.Constraint,
          ValueDef extends Atom.Def.Constraint,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
        > = Fn<Flavor, ValueDef, Qualifier, Parent>;

        export interface Fn<
          Flavor extends Atom.Flavor.Constraint,
          ValueDef extends Atom.Def.Constraint,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
        > {
          <ComputedValue>(
            intoMapper: Proxy.Into.Mapper<ValueDef, ComputedValue>,
            deps: DependencyList,
          ): Result<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
        }

        export interface Result<
          Flavor extends Atom.Flavor.Constraint,
          Value,
          ComputedValue,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          from: Proxy.From.Use.Fn<
            Flavor,
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
        Flavor extends Atom.Flavor.Constraint,
        Value,
        ComputedValue,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        <MappedValue extends Value.Read<Value>>(
          fromMapper: Mapper<Value, ComputedValue, MappedValue>,
        ): Envelop<Flavor, Value, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<Value, ComputedValue, MappedValue> {
        (computedValue: ComputedValue, value: Value.Read<Value>): MappedValue;
      }

      export namespace Use {
        export interface Fn<
          Flavor extends Atom.Flavor.Constraint,
          Value,
          ComputedValue,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          <MappedValue extends Value.Read<Value>>(
            fromMapper: Mapper<Value, ComputedValue, MappedValue>,
            deps: DependencyList,
          ): Envelop<Flavor, Value, ComputedValue, Qualifier, Parent>;
        }
      }
    }
  }

  //#endregion

  //#region Defined

  export namespace Defined {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > =
      Value.Read<ValueDef> extends infer Value
        ? Utils.IsNever<Extract<Value, string>> extends false
          ? Value extends string | Utils.Nullish
            ? FnString<Flavor, Value, Qualifier, Parent>
            : undefined
          : never
        : never;

    export interface FnString<
      Flavor extends Atom.Flavor.Constraint,
      Value extends string | Utils.Nullish,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (to: "string"): Envelop<Flavor, string, Qualifier, Parent>;
    }
  }

  //#endregion

  //#endregion
}

namespace AtomPrivate {
  export declare const immutablePhantom: unique symbol;
  export declare const qualifierPhantom: unique symbol;
  export declare const valuePhantom: unique symbol;
  export declare const parentPhantom: unique symbol;
}
