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
    Value,
    Qualifier extends Atom.Qualifier,
    Parent extends Atom.Parent.Constraint<Value>,
  >
  implements
    Utils.StaticImplements<
      typeof Atom<Flavor, Value, Qualifier, Parent>,
      Atom.Static
    >,
    Atom.Exact<Flavor, Value, Qualifier, Parent>
{
  //#region Static

  static safeNullish<Type>(value: Type | Utils.Nullish): Enso.SafeNullish<Type>;

  //#endregion

  //#region Instance

  constructor(
    value: Value,
    parent?: Atom.Parent.Def<Exclude<Flavor, Atom.Flavor.Variant>, Parent>,
  );

  deconstruct(): void;

  //#endregion

  //#region Phantoms

  [AtomPrivate.immutableExactPhantom]: Atom.Immutable.Phantom<Flavor, Value>;

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
  ): Atom.Envelop<Flavor, NewValue, Qualifier, Parent>;

  pave<PavedValue extends Utils.NonNullish<Value>>(
    value: PavedValue,
  ): Atom.Envelop<
    Flavor,
    Atom.Pave.Value<Value, PavedValue>,
    Qualifier,
    Parent
  >;

  get lastChanges(): FieldChange;

  //#endregion

  //#region Type

  size: Atom.SizeProp<Value>;

  remove: Atom.RemoveProp<Flavor, Value>;

  forEach: Atom.ForEachProp<Flavor, Value>;

  map: Atom.MapProp<Flavor, Value>;

  find: Atom.FindProp<Flavor, Value>;

  filter: Atom.FilterProp<Flavor, Value>;

  useCollection: Atom.UseCollectionProp<Flavor, Value, Qualifier, Parent>;

  insert: Atom.Insert.Prop<Flavor, Value, Qualifier, Parent>;

  push: Atom.Push.Prop<Flavor, Value, Qualifier, Parent>;

  //#endregion

  //#region Tree

  get root(): Atom.Root<Flavor>;

  get parent(): Atom.Parent.Prop<
    Exclude<Flavor, Atom.Flavor.Variant>,
    Value,
    Parent
  >;

  get key(): string;

  get $(): Atom.$.Prop<Flavor, Value>;

  at: Atom.At.Prop<Flavor, Value>;

  try: Atom.Try.Prop<Flavor, Value>;

  get path(): string[];

  get name(): string;

  self: Utils.CovariantifyProperty<
    Atom.Exact.Self<Flavor, Value, Qualifier, Parent>
  >;

  //#endregion

  //#region Events

  eventsTree: EventsTree<Extract<Flavor, Atom.Flavor.Shell>>;

  watch(callback: Atom.Watch.Callback<Value>): Atom.Unwatch;

  useWatch(
    callback: Atom.Watch.Callback<Value>,
    deps: DependencyList,
  ): Atom.Unwatch;

  trigger(changes: FieldChange, notifyParents?: boolean): void;

  //#endregion

  //#region Transform

  decompose: Atom.Decompose.Prop<Flavor, Value, Qualifier, Parent>;

  useDecompose: Atom.Decompose.Use.Prop<Flavor, Value, Qualifier, Parent>;

  discriminate: Atom.Discriminate.Prop<Flavor, Value, Qualifier, Parent>;

  useDiscriminate: Atom.Discriminate.Prop<Flavor, Value, Qualifier, Parent>;

  into: Atom.Proxy.Into.Prop<Flavor, Value, Qualifier, Parent>;

  useInto: Atom.Proxy.Into.Use.Prop<Flavor, Value, Qualifier, Parent>;

  useDefined: Atom.Defined.Prop<Flavor, Value, Qualifier, Parent>;

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
    export interface Subclass<Shell extends Atom.Flavor.Shell> {
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
        Shell extends Atom.Flavor.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
        MappedValue,
      > {
        (
          atom: Envelop<Shell, AtomValue<Shell, EnvelopType>>,
        ): Envelop<Shell, MappedValue>;
      }

      export type AtomValue<
        Shell extends Atom.Flavor.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
      > = EnvelopType extends Envelop<Shell, infer Value> ? Value : never;

      export type Result<
        Shell extends Atom.Flavor.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
        MappedValue,
      > = MappedValue extends undefined
        ? ResultDirect<Shell, EnvelopType>
        : ResultMapped<Shell, EnvelopType, MappedValue>;

      export type ResultDirect<
        Shell extends Atom.Flavor.Shell,
        EnvelopType extends Envelop<Shell, any> | Utils.Nullish,
      > = Field<
        | (EnvelopType extends Utils.Nullish ? undefined : never)
        | AtomValue<Shell, EnvelopType>
      >;

      export type ResultMapped<
        Shell extends Atom.Flavor.Shell,
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

  export namespace Flavor {
    // NOTE: We wrap those into a namespace, as Flavor, Shell and Variant are
    // used as generic param names, so to avoid a situation when we forget to
    // define a flavor param and use it the constraint instead, e.g.:
    //
    //   type Generic<Value> = Shell extends "field" ? Field<Value> : never
    //
    // If Shell was defined at Atom.Shell, it would produce incorrect type,
    // where we meant to have `type Generic<Shell, Value> = ...`.

    export type Constraint = Shell | Variant;

    export type Shell = "state" | "field";

    export type Variant = "immutable" | "base" | "exact";
  }

  // WIP: Try to get rid of it. The purpose is to have symmetry with Ref but it
  // might be simple Extract, however I can't check until I stabilize tysts.

  export type Envelop<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > =
    ExtractShell<Flavor> extends "state"
      ? State.Envelop<
          "state" | ExtractVariant<Flavor>,
          Value,
          Qualifier,
          Parent
        >
      : ExtractShell<Flavor> extends "field"
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
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
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

  export type ExtractShell<Flavor extends Atom.Flavor.Constraint> =
    Utils.IsNever<Exclude<Flavor, Atom.Flavor.Variant>> extends true
      ? unknown
      : Flavor extends Atom.Flavor.Shell
        ? Flavor
        : never;

  export type ExtractVariant<Flavor extends Atom.Flavor.Constraint> =
    Utils.IsNever<Exclude<Flavor, Atom.Flavor.Shell>> extends true
      ? "exact"
      : Flavor extends Atom.Flavor.Variant
        ? Flavor
        : never;

  export type SelfEnvelop<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = "exact" extends Flavor
    ? Exact.Self<Flavor, Value, Qualifier, Parent>
    : "base" extends Flavor
      ? Base.Self<Flavor, Value, Qualifier, Parent>
      : Immutable.Self<Flavor, Value, Qualifier, Parent>;

  //#endregion

  //#region Variant

  export namespace Variant {
    export type Qualifier<Variant extends Atom.Flavor.Variant> = Variant;
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

    export type Envelop<
      Shell extends Atom.Flavor.Shell,
      ParentValue,
    > = Atom.Envelop<
      Shell | "immutable",
      Utils.IsNever<ParentValue> extends true ? any : ParentValue
    >;

    export type Prop<
      Shell extends Atom.Flavor.Shell,
      ChildValue,
      Parent extends Atom.Parent.Constraint<ChildValue>,
    > = Def<
      Shell,
      Utils.IsNever<Parent> extends true ? Interface<any, any> : Parent
    >;

    export type Def<
      Shell extends Atom.Flavor.Shell,
      Parent extends Atom.Parent.Constraint<any>,
    > =
      Parent extends Interface<infer ParentValue, infer Key>
        ?
            | Parent.Direct<Shell, ParentValue, Key>
            | Parent.Source<Shell, ParentValue>
        : never;

    export interface Direct<
      Shell extends Atom.Flavor.Shell,
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

    export interface Source<Shell extends Atom.Flavor.Shell, ParentValue> {
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
      | Extract<Flavor, Atom.Flavor.Shell>
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
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Immutable<Flavor, Value, Qualifier, Parent> {
    //#region Value

    set<NewValue extends Value>(
      value: NewValue,
    ): Envelop<Flavor, NewValue, Qualifier, Parent>;

    pave<PavedValue extends Utils.NonNullish<Value>>(
      value: PavedValue,
    ): Envelop<Flavor, Pave.Value<Value, PavedValue>, Qualifier, Parent>;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.valueExactPhantom]: Atom.Value.Phantom<Value>;

    lastChanges: FieldChange;

    //#endregion

    //#region Type

    remove: RemoveProp<Flavor, Value>;

    insert: Insert.Prop<Flavor, Value, Qualifier, Parent>;

    push: Push.Prop<Flavor, Value, Qualifier, Parent>;

    //#endregion

    //#region Events

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion
  }

  export namespace Exact {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Flavor> extends "state"
        ? State.Exact<Value, Qualifier, Parent>
        : ExtractShell<Flavor> extends "field"
          ? Field.Exact<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Immutable.Self<Flavor, Value, Qualifier> {
      remove: Atom.Self.RemoveProp<Flavor, Value, Qualifier, Parent>;
    }
  }

  //#endregion

  //#region Base

  export interface Base<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Immutable<Flavor, Value, Qualifier, Parent> {}

  export namespace Base {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Flavor> extends "state"
        ? State.Base<Value, Qualifier, Parent>
        : ExtractShell<Flavor> extends "field"
          ? Field.Base<Value, Qualifier, Parent>
          : never;

    export type Result<
      Shell extends Atom.Flavor.Shell,
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
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Immutable.Self<Flavor, Value, Qualifier, Parent> {}
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > {
    //#region Phantoms

    // NOTE: As immutable atoms never resolve exact children like base,
    // we must manually provide phantom type to ensure proper variance between
    // them.
    [AtomPrivate.immutableExactPhantom]: Immutable.Phantom<Flavor, Value>;

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

    root: Root<Flavor>;

    parent: Parent.Prop<Exclude<Flavor, Atom.Flavor.Variant>, Value, Parent>;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $.Prop<Flavor, Value>;

    at: At.Prop<Flavor, Value>;

    try: Atom.Try.Prop<Flavor, Value>;

    self: Utils.CovariantifyProperty<SelfEnvelop<Flavor, Value, Qualifier>>;

    //#endregion

    //#region Type

    size: SizeProp<Value>;

    forEach: ForEachProp<Flavor, Value>;

    map: MapProp<Flavor, Value>;

    find: FindProp<Flavor, Value>;

    filter: FilterProp<Flavor, Value>;

    useCollection: UseCollectionProp<Flavor, Value, Qualifier, Parent>;

    //#endregion

    //#region Events

    eventsTree: EventsTree<Extract<Flavor, Atom.Flavor.Shell>>;

    watch(callback: Watch.Callback<Value>): Unwatch;

    useWatch(callback: Watch.Callback<Value>, deps: DependencyList): Unwatch;

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    //#endregion

    //#region Transform

    decompose: Decompose.Prop<Flavor, Value, Qualifier, Parent>;

    useDecompose: Decompose.Use.Prop<Flavor, Value, Qualifier, Parent>;

    discriminate: Discriminate.Prop<Flavor, Value, Qualifier, Parent>;

    useDiscriminate: Discriminate.Prop<Flavor, Value, Qualifier, Parent>;

    into: Proxy.Into.Prop<Flavor, Value, Qualifier, Parent>;

    useInto: Proxy.Into.Use.Prop<Flavor, Value, Qualifier, Parent>;

    useDefined: Defined.Prop<Flavor, Value, Qualifier, Parent>;

    //#endregion
  }

  export namespace Immutable {
    export type Phantom<Flavor extends Atom.Flavor.Constraint, Value> = $.Prop<
      Extract<Flavor, Flavor.Shell> | "base",
      Value
    >;

    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Flavor> extends "state"
        ? State.Immutable<Value, Qualifier, Parent>
        : ExtractShell<Flavor> extends "field"
          ? Field.Immutable<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      try(): Remove<Flavor, Value, Qualifier>;
    }

    export type Remove<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier,
    > =
      // Add null to the union
      | (null extends Value ? null : never)
      // Add undefined to the union
      | (undefined extends Value ? undefined : never)
      // Resolve branded field without null or undefined
      | Atom.Envelop<Flavor, Utils.NonNullish<Value>, "tried" | Qualifier>;
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
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Qualifier extends "detachable"
      ? RemoveFn<Flavor, Value, Qualifier, Parent>
      : never;

    export interface RemoveFn<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (): Envelop<Flavor, DetachedValue, Qualifier, Parent>;
    }
  }

  //#endregion

  export type SizeProp<Value> = Value extends object
    ? Value extends Utils.BrandedPrimitive
      ? never
      : number
    : never;

  //#region Remove

  export type RemoveProp<Flavor extends Atom.Flavor.Constraint, Value> =
    Utils.IsReadonlyArray<Value> extends true
      ? never
      : Value extends Utils.Tuple
        ? never
        : Value extends unknown[]
          ? RemoveArray<Flavor, Value>
          : Value extends object
            ? Value extends Utils.BrandedPrimitive
              ? never
              : RemoveObject<Flavor, Value>
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
      Value,
      ProcessorType extends Mapper.ResultType,
    > =
      Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Mapper.Array<Flavor, Value, ProcessorType>
          : never
        : Value extends Utils.Tuple
          ? Mapper.Tuple<Flavor, Value, ProcessorType>
          : Value extends unknown[]
            ? Mapper.Array<Flavor, Value, ProcessorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? never
                : Mapper.Object<Flavor, Value, ProcessorType>
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
      Value,
      SelectorType extends Selector.Type,
    > =
      Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Selector.Array<Flavor, Value, SelectorType>
          : never
        : Value extends Utils.Tuple
          ? Selector.Tuple<Flavor, Value, SelectorType>
          : Value extends unknown[]
            ? Selector.Array<Flavor, Value, SelectorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? never
                : Selector.Object<Flavor, Value, SelectorType>
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
    Value,
  > = Collection.Mapper<Flavor, Value, "each">;

  export type MapProp<
    Flavor extends Atom.Flavor.Constraint,
    Value,
  > = Collection.Mapper<Flavor, Value, "map">;

  export type FindProp<
    Flavor extends Atom.Flavor.Constraint,
    Value,
  > = Collection.Selector<Flavor, Value, "find">;

  export type FilterProp<
    Flavor extends Atom.Flavor.Constraint,
    Value,
  > = Collection.Selector<Flavor, Value, "filter">;

  export type UseCollectionProp<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = Value extends object
    ? Value extends Utils.BrandedPrimitive
      ? never
      : () => Envelop<Flavor, Value, Qualifier | "bound", Parent>
    : never;

  export namespace Insert {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Value extends Utils.StaticArray
      ? never
      : Value extends unknown[]
        ? Fn<Flavor, Value, Qualifier, Parent>
        : never;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
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
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Value extends Utils.Tuple
      ? never
      : Value extends unknown[]
        ? Fn<Flavor, Value, Qualifier, Parent>
        : never;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
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
    export type Prop<Flavor extends Atom.Flavor.Constraint, Value> =
      // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
      // respectively, so we have to have special case for them to account for
      // invariance.
      Utils.IsNotTop<Value> extends true
        ? Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? never
            : { [Key in keyof Value]-?: Child<Flavor, Value, Key, "indexed"> }
          : never
        : Utils.ResolveTop<Value>;
  }

  //#endregion

  //#region At

  export namespace At {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
    > = keyof Value extends infer Key extends keyof Value
      ? Fn<Flavor, Value, Key>
      : never;

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
      Value,
    > = keyof Value extends infer Key extends keyof Value
      ? <ArgKey extends Key>(
          key: ArgKey | Enso.SafeNullish<ArgKey>,
        ) => Child<Flavor, Value, ArgKey>
      : never;

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
      Qualifier extends Atom.Qualifier,
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
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (): Result<Flavor, Value, Qualifier, Parent>;
    }

    export type Result<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      | (Value extends Value
          ? {
              value: Value;
              field: Envelop<Flavor, Value, Qualifier, Parent>;
            }
          : never)
      // Add unknown option for the base and immutable variants
      | (Flavor extends (infer Shell extends Atom.Flavor.Shell) | infer Variant
          ? Variant extends "base" | "immutable"
            ? {
                value: unknown;
                field: Envelop<Shell | Variant, unknown, Qualifier, Parent>;
              }
            : never
          : never);

    export namespace Use {
      export interface Prop<
        Flavor extends Atom.Flavor.Constraint,
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        (
          callback: Callback<Value>,
          deps: DependencyList,
        ): Result<Flavor, Value, Qualifier, Parent>;
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
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      <Discriminator extends Discriminate.Discriminator<Value>>(
        discriminator: Discriminator,
      ): Result<Flavor, Value, Discriminator, Qualifier, Parent>;
    }

    export type Discriminator<Payload> = keyof Utils.NonUndefined<Payload>;

    export type Result<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Discriminator extends Discriminate.Discriminator<Value>,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Inner<Flavor, Value, Discriminator, Qualifier, Parent>;

    export type Inner<
      Flavor extends Atom.Flavor.Constraint,
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
      | (Flavor extends (infer Shell extends Atom.Flavor.Shell) | infer Variant
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
      Flavor extends Atom.Flavor.Constraint,
      Value,
      ComputedValue,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Envelop<Flavor, ComputedValue, Proxy.Qualifier<Value>, Parent>;

    export namespace Into {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > = Into.Fn<Flavor, Value, Qualifier, Parent>;

      export interface Fn<
        Flavor extends Atom.Flavor.Constraint,
        Value,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        <ComputedValue>(
          intoMapper: Into.Mapper<Value, ComputedValue>,
        ): Result<Flavor, Value, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<Value, ComputedValue> {
        (value: Value): ComputedValue;
      }

      export interface Result<
        Flavor extends Atom.Flavor.Constraint,
        Value,
        ComputedValue,
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        from: From.Fn<Flavor, Value, ComputedValue, Qualifier, Parent>;
      }

      export namespace Use {
        export type Prop<
          Flavor extends Atom.Flavor.Constraint,
          Value,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > = Fn<Flavor, Value, Qualifier, Parent>;

        export interface Fn<
          Flavor extends Atom.Flavor.Constraint,
          Value,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          <ComputedValue>(
            intoMapper: Proxy.Into.Mapper<Value, ComputedValue>,
            deps: DependencyList,
          ): Result<Flavor, Value, ComputedValue, Qualifier, Parent>;
        }

        export interface Result<
          Flavor extends Atom.Flavor.Constraint,
          Value,
          ComputedValue,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
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
        Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
      > {
        <MappedValue extends Value>(
          fromMapper: Mapper<Value, ComputedValue, MappedValue>,
        ): Envelop<Flavor, Value, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<Value, ComputedValue, MappedValue> {
        (computedValue: ComputedValue, value: Value): MappedValue;
      }

      export namespace Use {
        export interface Fn<
          Flavor extends Atom.Flavor.Constraint,
          Value,
          ComputedValue,
          Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
        > {
          <MappedValue extends Value>(
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
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      Exclude<Value, string | Utils.Nullish> extends never
        ? Value extends string | Utils.Nullish
          ? FnString<Flavor, Value, Qualifier, Parent>
          : never
        : never;

    export interface FnString<
      Flavor extends Atom.Flavor.Constraint,
      Value extends string | Utils.Nullish,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (to: "string"): Envelop<Flavor, string, Qualifier, Parent>;
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
