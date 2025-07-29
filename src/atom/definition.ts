import { DependencyList } from "react";
import { ChangesEvent, FieldChange } from "../change/index.ts";
import { DetachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import type { Field } from "../field/definition.ts";
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
    parent?: Atom.Parent.Ref<
      Exclude<Flavor, Atom.Flavor.Variant>,
      Qualifier,
      Parent
    >,
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

  useValue: Atom.Value.Use.Prop<ValueDef, Qualifier>;

  compute: Atom.Compute.Prop<ValueDef>;

  useCompute: Atom.Compute.Use.Prop<ValueDef, Qualifier>;

  set: Atom.Set.Prop<Flavor, ValueDef, Qualifier, Parent>;

  pave: Atom.Pave.Prop<Flavor, ValueDef, Qualifier, Parent>;

  get lastChanges(): FieldChange;

  //#endregion

  //#region Type

  size: Atom.Size.Prop<ValueDef>;

  remove: Atom.Remove.Prop<Flavor, ValueDef>;

  forEach: Atom.ForEachProp<Flavor, ValueDef, Qualifier>;

  map: Atom.MapProp<Flavor, ValueDef, Qualifier>;

  find: Atom.FindProp<Flavor, ValueDef, Qualifier>;

  filter: Atom.FilterProp<Flavor, ValueDef, Qualifier>;

  useCollection: Atom.Collection.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

  insert: Atom.Insert.Prop<Flavor, ValueDef, Qualifier, Parent>;

  push: Atom.Push.Prop<Flavor, ValueDef, Qualifier>;

  //#endregion

  //#region Tree

  get root(): Atom.Root.Prop<Flavor, Qualifier>;

  get parent(): Atom.Parent.Prop<
    Exclude<Flavor, Atom.Flavor.Variant>,
    ValueDef,
    Qualifier,
    Parent
  >;

  get key(): string;

  get $(): Atom.$.Prop<Flavor, ValueDef["read"], Qualifier>;

  at: Atom.At.Prop<Flavor, ValueDef["read"], Qualifier>;

  try: Atom.Try.Prop<Flavor, ValueDef["read"], Qualifier>;

  get path(): string[];

  get name(): string;

  self: Atom.Self.Envelop<Flavor, ValueDef, Qualifier, Parent>;

  //#endregion

  //#region Events

  events: Atom.Events.Prop<Flavor, Qualifier>;

  watch(callback: Atom.Watch.Callback<ValueDef>): Atom.Unwatch;

  useWatch: Atom.Watch.Use.Prop<ValueDef, Qualifier>;

  trigger: Atom.Trigger.Prop<Qualifier>;

  //#endregion

  //#region Transform

  decompose: Atom.Decompose.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useDecompose: Atom.Decompose.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

  discriminate: Atom.Discriminate.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useDiscriminate: Atom.Discriminate.Use.Prop<
    Flavor,
    ValueDef,
    Qualifier,
    Parent
  >;

  into: Atom.Proxy.Into.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useInto: Atom.Proxy.Into.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

  useDefined: Atom.Defined.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

  shared: Atom.Shared.Prop<Flavor, ValueDef, Qualifier, Parent>;

  optional: Atom.Optional.Prop<Flavor, ValueDef, Qualifier, Parent>;

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
        Parent extends Atom.Parent.Constraint<
          Atom.Def<Value>
        > = Atom.Parent.Default,
      >(
        value: Value,
        parent?: Parent.Ref<Kind, Qualifier, Parent>,
      ): Envelop<Kind | "exact", Atom.Def<Value>, Qualifier, Parent>;

      // TODO: Ideally it should go into Static and utilize create

      base<EnvelopType extends Atom.Envelop<Kind, any>>(
        atom: EnvelopType,
      ): Atom.Base.Result<Kind, EnvelopType>;

      proxy<
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        ComputedValue,
        MappedValue,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      >(
        atom: Atom.Envelop<Kind | Variant, ValueDef, Qualifier, Parent>,
        intoMapper: Atom.Proxy.Into.Mapper<ValueDef, ComputedValue>,
        fromMapper: Atom.Proxy.From.Mapper<
          ValueDef,
          ComputedValue,
          MappedValue
        >,
      ): Atom.Proxy.Envelop<
        Kind | "exact",
        ValueDef,
        ComputedValue,
        Qualifier,
        Parent
      >;

      use<Value>(
        initialValue: Value,
        deps: DependencyList,
      ): Atom.Envelop<Kind | "exact", Atom.Def<Value>>;

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
          atom: Envelop<Kind, AtomValueDef<Kind, EnvelopType>>,
        ): Envelop<Kind, Atom.Def<MappedValue>>;
      }

      export type Result<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
        MappedValue,
      > = (MappedValue extends undefined
        ? ResultDirect<Kind, EnvelopType>
        : ResultMapped<Kind, EnvelopType, MappedValue>) & {};

      export type ResultDirect<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
      > = Utils.Expose<
        Envelop<
          Kind,
          Def.Union<
            AtomValueDef<Kind, EnvelopType>,
            EnvelopType extends Utils.Nullish ? undefined : never
          >
        >
      >;

      export type ResultMapped<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
        MappedValue,
      > = Utils.Expose<
        Envelop<
          Kind,
          Atom.Def<
            | (EnvelopType extends Utils.Nullish ? undefined : never)
            | MappedValue
          >
        >
      >;

      export type AtomValueDef<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any> | Utils.Nullish,
      > =
        EnvelopType extends Envelop<Kind, infer ValueDef>
          ? ValueDef extends Atom.Def<infer ReadValue, infer WriteValue>
            ? [WriteValue, ReadValue] extends [ReadValue, WriteValue]
              ? ValueDef
              : Atom.Def<unknown>
            : never
          : never;
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

    export type Variant = "immutable" | "optional" | "base" | "exact";

    export type Extends<
      Flavor extends Constraint,
      FlavorToCheck extends Constraint,
    > = FlavorToCheck extends Flavor ? true : false;
  }

  // WIP: Try to get rid of it. The purpose is to have symmetry with Ref but it
  // might be simple Extract, however I can't check until I stabilize tysts.

  export type Envelop<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > =
    ExtractKind<Flavor> extends "state"
      ? State.Envelop<
          "state" | ExtractVariant<Flavor>,
          ValueDef,
          Qualifier,
          Parent
        >
      : ExtractKind<Flavor> extends "field"
        ? Field.Envelop<
            "field" | ExtractVariant<Flavor>,
            ValueDef,
            Qualifier,
            Parent
          >
        : never;

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
      | "ref"
      | Proxy.Qualifier<unknown>;

    export type Default = never;

    export type Extends<
      Qualifier extends Constraint,
      QualifierToCheck extends Constraint,
    > = true extends (
      Utils.IsNever<Qualifier> extends true
        ? never
        : Qualifier extends QualifierToCheck
          ? true
          : never
    )
      ? true
      : false;

    export type Map<Qualifier extends Atom.Qualifier.Constraint> =
      Utils.NeverDefault<
        MapChunkBasic<Qualifier, "root"> &
          MapChunkBasic<Qualifier, "detachable"> &
          MapChunkBasic<Qualifier, "tried"> &
          MapChunkBasic<Qualifier, "bound"> &
          MapChunkBasic<Qualifier, "ref"> &
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

    export namespace Ref {
      export type DisableFor<
        Qualifier extends Atom.Qualifier.Constraint,
        Type,
      > = "ref" extends Qualifier ? undefined : Type;

      export type Preserve<Qualifier extends Qualifier.Constraint> =
        "ref" extends Qualifier ? "ref" : never;
    }
  }

  //#endregion

  //#region Parent

  export namespace Parent {
    export type Constraint<ValueDef extends Def.Constraint> = Type<
      ValueDef["read"],
      Interface<any, any>
    >;

    export type Type<Value, ParentInterface> =
      ParentInterface extends Interface<infer ParentValue, infer Key>
        ? Value extends ParentValue[Key]
          ? ParentInterface
          : never
        : never;

    export type Default = never;

    export type Phantom<
      ValueDef extends Def.Constraint,
      Parent extends Constraint<ValueDef>,
    > = Utils.IsNever<Parent> extends true ? unknown : { parent: Parent };

    export type Envelop<
      Kind extends Atom.Flavor.Kind,
      Value,
      Qualifier extends Qualifier.Constraint,
    > = Atom.Envelop<
      Kind | "immutable",
      Atom.Def<Utils.IsNever<Value> extends true ? any : Value>,
      Qualifier.Ref.Preserve<Qualifier>
    >;

    export type Prop<
      Kind extends Atom.Flavor.Kind,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Ref<
      Kind,
      Qualifier,
      Utils.IsNever<Parent> extends true ? Interface<any, any> : Parent
    >;

    export type Ref<
      Kind extends Atom.Flavor.Kind,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<any>,
    > =
      Parent extends Interface<infer Value, infer Key>
        ?
            | Parent.Direct<Kind, Value, Key, Qualifier>
            | Parent.Source<Kind, Value, Qualifier>
        : never;

    export interface Direct<
      Kind extends Atom.Flavor.Kind,
      Value,
      Key extends keyof Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > extends Bare.Direct<Envelop<Kind, Value, Qualifier>, Key> {}

    export interface Interface<ParentValue, Key extends keyof ParentValue> {
      value: ParentValue;
      key: Key;
    }

    export interface Source<
      Kind extends Atom.Flavor.Kind,
      Value,
      Qualifier extends Qualifier.Constraint,
    > extends Bare.Source<Envelop<Kind, Value, Qualifier>> {}

    export namespace Bare {
      export type Ref<AtomType, Key> = Direct<AtomType, Key> | Source<AtomType>;

      export interface Direct<AtomType, Key> {
        field: AtomType;
        key: Key;
      }

      export interface Source<AtomType> {
        source: AtomType;
      }
    }
  }

  //#endregion

  //#region Child

  export type Child<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Key extends keyof Value,
    Qualifier extends Qualifier.Constraint,
    Access extends Child.Access,
  > = Envelop<
    Child.Type<Flavor, Value>,
    Child.Value<Flavor, Value, Key, Access>,
    Child.Qualifier<Value, Key, Qualifier>
  >;

  export namespace Child {
    export type Access = "indexed" | "iterated";

    export type Type<Flavor extends Atom.Flavor.Constraint, Value> =
      | Extract<Flavor, Atom.Flavor.Kind>
      | (ExtractVariant<Flavor> extends infer Variant extends
          Atom.Flavor.Variant
          ? Utils.IsReadonlyArray<Value> extends true
            ? Variant extends "immutable"
              ? "immutable"
              : "base"
            : Variant extends "base"
              ? "exact"
              : Variant
          : never);

    export type Value<
      Flavor extends Atom.Flavor.Constraint,
      ParentValue,
      ParentKey extends keyof ParentValue,
      Access extends Child.Access,
    > = Utils.Expose<
      Atom.Def<

          | ParentValue[ParentKey]
          | (Access extends "indexed"
              ? Utils.IsStaticKey<ParentValue, ParentKey> extends true
                ? never
                : undefined
              : never) extends infer Value
          ? "optional" extends Flavor
            ? Utils.NonNullish<Value>
            : Value
          : never
      >
    >;

    export type Qualifier<
      ParentValue,
      ParentKey extends keyof Utils.NonNullish<ParentValue>,
      Qualifier extends Qualifier.Constraint,
    > =
      | Qualifier.Ref.Preserve<Qualifier>
      | (Utils.IsAny<ParentValue> extends true
          ? "detachable"
          : Utils.IsStaticKey<ParentValue, ParentKey> extends true
            ? Utils.IsOptionalKey<ParentValue, ParentKey> extends true
              ? "detachable"
              : never
            : Utils.IsReadonlyArray<ParentValue> extends true
              ? never
              : ParentValue extends Utils.Tuple
                ? never
                : "detachable");
  }

  //#endregion

  //#region Interface

  //#region Exact

  export interface Exact<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > extends Immutable<Flavor, ValueDef, Qualifier, Parent> {
    //#region Value

    set: Set.Prop<Flavor, ValueDef, Qualifier, Parent>;

    pave: Pave.Prop<Flavor, ValueDef, Qualifier, Parent>;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.valuePhantom]: Atom.Value.Phantom<ValueDef>;

    lastChanges: FieldChange;

    //#endregion

    //#region Type

    remove: Remove.Prop<Flavor, ValueDef>;

    insert: Insert.Prop<Flavor, ValueDef, Qualifier, Parent>;

    push: Push.Prop<Flavor, ValueDef, Qualifier>;

    //#endregion
  }

  export namespace Exact {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > =
      ExtractKind<Flavor> extends "state"
        ? State.Exact<ValueDef, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Exact<ValueDef, Qualifier, Parent>
          : never;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > extends Immutable.Self<Flavor, ValueDef, Qualifier, Parent> {
      remove: Atom.Self.Remove.Prop<Flavor, ValueDef, Qualifier, Parent>;
    }

    export type OnlyFor<Flavor extends Atom.Flavor.Constraint, Type> =
      Flavor.Extends<Flavor, "exact"> extends true ? Type : undefined;
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
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Utils.Expose<
      ExtractKind<Flavor> extends "state"
        ? State.Base.Internal<ValueDef, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Base.Internal<ValueDef, Qualifier, Parent>
          : never
    >;

    export type Result<
      Kind extends Atom.Flavor.Kind,
      EnvelopType extends Atom.Envelop<Kind, any>,
    > = Atom.Base.Envelop<
      Kind,
      Value.BaseDef<EnvelopType>,
      Qualifier.Shared<EnvelopType>,
      never
    >;

    export namespace Value {
      export type BaseDef<EnvelopType extends Atom.Envelop<any, any>> =
        EnvelopType extends Atom.Envelop<any, infer ValueDef>
          ? ValueDef
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

  //#region Optional

  export interface Optional<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Immutable<Flavor, ValueDef, Qualifier, Parent> {}

  export namespace Optional {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > = Utils.Expose<
      ExtractKind<Flavor> extends "state"
        ? State.Optional.Internal<ValueDef, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Optional.Internal<ValueDef, Qualifier, Parent>
          : never
    >;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Self<Flavor, ValueDef, Qualifier, Parent> {}

    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Fn<Flavor, ValueDef, Qualifier, Parent>;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      (): Atom.Envelop<
        Exclude<Flavor, Flavor.Variant> | "optional",
        Optional.Def<ValueDef>,
        Qualifier,
        Parent
      >;
    }

    export type Def<ValueDef extends Atom.Def.Constraint> =
      ValueDef extends Atom.Def<infer ReadValue, infer WriteValue>
        ? Atom.Def<Utils.NonNullish<ReadValue>, Utils.NonNullish<WriteValue>>
        : never;
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
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

    useValue: Atom.Value.Use.Prop<ValueDef, Qualifier>;

    compute: Compute.Prop<ValueDef>;

    useCompute: Compute.Use.Prop<ValueDef, Qualifier>;

    //#endregion

    //#region Tree

    root: Root.Prop<Flavor, Qualifier>;

    parent: Parent.Prop<
      Exclude<Flavor, Atom.Flavor.Variant>,
      ValueDef,
      Qualifier,
      Parent
    >;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $.Prop<Flavor, ValueDef["read"], Qualifier>;

    at: At.Prop<Flavor, ValueDef["read"], Qualifier>;

    try: Atom.Try.Prop<Flavor, ValueDef["read"], Qualifier>;

    self: Self.Envelop<Flavor, ValueDef, Qualifier, Parent>;

    //#endregion

    //#region Type

    size: Size.Prop<ValueDef>;

    forEach: ForEachProp<Flavor, ValueDef, Qualifier>;

    map: MapProp<Flavor, ValueDef, Qualifier>;

    find: FindProp<Flavor, ValueDef, Qualifier>;

    filter: FilterProp<Flavor, ValueDef, Qualifier>;

    useCollection: Collection.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    //#endregion

    //#region Events

    events: Events.Prop<Flavor, Qualifier>;

    watch(callback: Watch.Callback<ValueDef>): Unwatch;

    useWatch: Watch.Use.Prop<ValueDef, Qualifier>;

    trigger: Trigger.Prop<Qualifier>;

    //#endregion

    //#region Transform

    decompose: Decompose.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useDecompose: Decompose.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    discriminate: Discriminate.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useDiscriminate: Discriminate.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    // TODO: Find a way to simply move it to Exact, rather than using Exact.OnlyFor,
    // but it breaks many tysts.

    into: Proxy.Into.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useInto: Proxy.Into.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    useDefined: Defined.Use.Prop<Flavor, ValueDef, Qualifier, Parent>;

    shared: Shared.Prop<Flavor, ValueDef, Qualifier, Parent>;

    optional: Optional.Prop<Flavor, ValueDef, Qualifier, Parent>;

    //#endregion
  }

  export namespace Immutable {
    export type Phantom<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
    > = $.Prop<Extract<Flavor, Flavor.Kind> | "base", ValueDef["read"], never>;

    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > =
      ExtractKind<Flavor> extends "state"
        ? State.Immutable<ValueDef, Qualifier, Parent>
        : ExtractKind<Flavor> extends "field"
          ? Field.Immutable<ValueDef, Qualifier, Parent>
          : never;

    export interface Self<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      try(): Try<Flavor, ValueDef, Qualifier, Parent>;
    }

    export type Try<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = ValueDef["read"] extends infer Value
      ? // Add null to the union
        | (null extends Value ? null : never)
          // Add undefined to the union
          | (undefined extends Value ? undefined : never)
          // Resolve branded field without null or undefined
          | Atom.Envelop<
              Flavor,
              Atom.Def<Utils.NonNullish<Value>>,
              "tried" | Qualifier,
              Parent
            >
      : never;
  }

  //#endregion

  //#endregion

  //#region Shared

  export namespace Shared {
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
      Qualifier extends Qualifier.Constraint,
      Parent extends Parent.Constraint<ValueDef>,
    > = Envelop<
      Flavor,
      Result.Tuple<
        Flavor,
        ValueDef,
        ValueTuple
      > extends infer ResultTuple extends Value.Tuple
        ? Utils.IsNever<ResultTuple> extends true
          ? Atom.Def<unknown>
          : Shared.Def<ResultTuple>
        : never,
      Qualifier,
      Parent
    >;

    export type Def<ValueTuple extends Value.Tuple> = Atom.Def<
      Shared.Value.Union<ValueTuple>,
      Shared.Value.Intersection<ValueTuple>
    >;

    export namespace Result {
      export type Tuple<
        Flavor extends Flavor.Constraint,
        ValueDef extends Def.Constraint,
        ValueTuple extends Value.Tuple,
      > = "exact" extends Flavor
        ? Exact<ValueDef["read"], ValueTuple>
        : Base<ValueDef["read"], ValueTuple>;

      export type Exact<Value, ValueTuple extends Value.Tuple> =
        Sharable<ValueTuple> extends true
          ? Extends<Value, ValueTuple> extends true
            ? {
                [Key in keyof ValueTuple]: ExcludeSubclasses<
                  Value,
                  ValueTuple[Key]
                >;
              }
            : never
          : never;

      export type ExcludeSubclasses<Value, ValueItem> =
        ValueItem extends ValueItem
          ? Value extends ValueItem
            ? Value
            : ValueItem
          : never;

      export type Base<Value, ValueTuple extends Value.Tuple> =
        Sharable<ValueTuple> extends true
          ? Extends<Value, ValueTuple> extends true
            ? ValueTuple
            : never
          : never;

      export type Sharable<ValueTuple extends Value.Tuple> = true extends (
        Utils.IndexOfTuple<ValueTuple> extends infer Index1 extends
          keyof ValueTuple
          ? Index1 extends Index1
            ? (
                Utils.IndexOfTuple<ValueTuple> extends infer Index2 extends
                  keyof ValueTuple
                  ? Index2 extends Index2
                    ? ValueTuple[Index1] extends ValueTuple[Index2]
                      ? true
                      : false
                    : never
                  : never
              ) extends true
              ? true
              : never
            : never
          : never
      )
        ? true
        : false;

      export type Extends<
        Value,
        ValueTuple extends Value.Tuple,
      > = true extends (
        Utils.IndexOfTuple<ValueTuple> extends infer Index extends
          keyof ValueTuple
          ? Index extends Index
            ? EachExtends<Value, ValueTuple[Index]> extends true
              ? true
              : never
            : never
          : never
      )
        ? true
        : false;

      export type EachExtends<Value, TupleValue> =
        | (Value extends Value
            ? true extends (
                TupleValue extends TupleValue
                  ? Value extends TupleValue
                    ? true
                    : never
                  : never
              )
              ? true
              : false
            : never)
        | (TupleValue extends TupleValue
            ? true extends (
                Value extends Value
                  ? Value extends TupleValue
                    ? true
                    : never
                  : never
              )
              ? true
              : false
            : never) extends true
        ? true
        : false;
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

    export type Union<ValueDef, AddWriteValue, AddReadValue = AddWriteValue> =
      ValueDef extends Def<infer ReadValue, infer WriteValue>
        ? Def<ReadValue | AddReadValue, WriteValue | AddWriteValue>
        : never;
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

    export interface Phantom<ValueDef extends Def.Constraint> {
      (value: ValueDef["read"]): void;
    }

    export type FromEnvelop<EnvelopType extends Atom.Envelop<any, any>> =
      EnvelopType extends Atom.Envelop<any, infer Value> ? Value : never;

    export namespace Use {
      export type Prop<
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
      > = Qualifier.Ref.DisableFor<Qualifier, Fn<ValueDef>>;

      export interface Fn<ValueDef extends Def.Constraint> {
        (): Result<ValueDef>;
      }

      export type Result<ValueDef extends Def.Constraint> = Opaque<
        ValueDef["read"]
      >;
    }
  }

  export namespace Set {
    export interface Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      <SetValue extends ValueDef["write"]>(
        value: SetValue,
      ): Envelop<
        Flavor,
        Set.Def<ValueDef["write"], SetValue>,
        Qualifier,
        Parent
      >;
    }

    export type Def<Value, SetValue extends Value> = Atom.Def<
      Value extends Value ? (SetValue extends Value ? Value : never) : never,
      Value
    >;
  }

  export namespace Pave {
    export interface Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      <PavedValue extends Utils.NonNullish<ValueDef["write"]>>(
        value: PavedValue,
      ): Envelop<
        Flavor,
        Set.Def<ValueDef["write"], PavedValue>,
        Qualifier,
        Parent
      >;
    }
  }

  //#endregion

  //#region Type

  //#region Self

  export namespace Self {
    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = "exact" extends Flavor
      ? Exact.Self<Flavor, ValueDef, Qualifier, Parent>
      : "base" extends Flavor
        ? Base.Self<Flavor, ValueDef, Qualifier, Parent>
        : "optional" extends Flavor
          ? Optional.Self<Flavor, ValueDef, Qualifier, Parent>
          : "immutable" extends Flavor
            ? Immutable.Self<Flavor, ValueDef, Qualifier, Parent>
            : never;

    export namespace Remove {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > =
        Utils.IsNever<Extract<Qualifier, "detachable">> extends false
          ? Fn<Flavor, ValueDef, Qualifier, Parent>
          : undefined;

      export interface Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > {
        (): Atom.Envelop<Flavor, Atom.Def<DetachedValue>, Qualifier, Parent>;
      }
    }
  }

  //#endregion

  export namespace Size {
    export type Prop<ValueDef extends Def.Constraint> =
      ValueDef["read"] extends infer Value
        ? Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : number
          : undefined
        : never;
  }

  //#region Remove

  export namespace Remove {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
    > = ValueDef["read"] extends infer Value
      ? Value extends unknown[] | readonly unknown[]
        ? Utils.IsReadonlyArray<Value> extends true
          ? undefined
          : Value extends Utils.Tuple
            ? undefined
            : Value extends unknown[]
              ? Fn.Array<Flavor, Value>
              : never
        : Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : Fn.Object<Flavor, Value>
          : undefined
      : never;

    export namespace Fn {
      export interface Array<
        Flavor extends Atom.Flavor.Constraint,
        Value extends unknown[],
      > {
        (
          item: number,
        ): Envelop<
          Flavor,
          Atom.Def<DetachedValue | Value[number]>,
          "detachable"
        >;
      }

      export interface Object<
        Flavor extends Atom.Flavor.Constraint,
        Value extends object,
      > {
        <Key extends Enso.DetachableKeys<Value>>(
          key: Key,
        ): Envelop<Flavor, Atom.Def<DetachedValue | Value[Key]>, "detachable">;
      }
    }
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
      Qualifier extends Atom.Qualifier.Constraint,
      Result = void,
    > {
      (
        ...args: {
          [Key in Utils.IndexOfTuple<Value>]: [
            Child<Flavor, Value, Key, Qualifier, "iterated">,
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
          [Key in keyof Value]: Envelop<Flavor, Atom.Def<Value[Key]>>;
        }[Utils.IndexOfTuple<Value>],
        index?: Utils.IndexOfTuple<Value>,
      ): Result;
    }

    export type TupleItem<
      Flavor extends Atom.Flavor.Constraint,
      Value extends Utils.Tuple,
    > = {
      [Key in Utils.IndexOfTuple<Value>]: Envelop<Flavor, Atom.Def<Value[Key]>>;
    }[Utils.IndexOfTuple<Value>];

    // Array

    export interface ArrayHandler<
      Flavor extends Atom.Flavor.Constraint,
      Value extends Utils.ArrayConstraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Result = void,
    > {
      (
        item: Child<Flavor, Value, number, Qualifier, "iterated">,
        index: number,
      ): Result;
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
      Qualifier extends Atom.Qualifier.Constraint,
      Result = void,
    > {
      (
        // Exclude is needed to remove undefined that appears when there're
        // optional fields in the object.
        ...args: Exclude<
          {
            [Key in Utils.CovariantifyKeyof<Value>]: [
              Child<Flavor, Value, Key, Qualifier, "iterated">,
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
      Qualifier extends Atom.Qualifier.Constraint,
      Result = void,
    > {
      (
        // Exclude is needed to remove undefined that appears when there're
        // optional fields in the object.
        item: Exclude<
          {
            [Key in keyof Value]: Child<
              Flavor,
              Value,
              Key,
              Qualifier,
              "iterated"
            >;
          }[keyof Value],
          undefined
        >,
      ): Result;
    }

    export type ObjectItem<
      Flavor extends Atom.Flavor.Constraint,
      Value extends object,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Exclude<
      {
        [Key in keyof Value]: Child<Flavor, Value, Key, Qualifier, "iterated">;
      }[keyof Value],
      undefined
    >;

    //#endregion

    //#region Processor

    export type Mapper<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      ProcessorType extends Mapper.ResultType,
    > = ValueDef["read"] extends infer Value
      ? Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Mapper.Array<Flavor, Value, Qualifier, ProcessorType>
          : never
        : Value extends Utils.Tuple
          ? Mapper.Tuple<Flavor, Value, Qualifier, ProcessorType>
          : Value extends unknown[]
            ? Mapper.Array<Flavor, Value, Qualifier, ProcessorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : Mapper.Object<Flavor, Value, Qualifier, ProcessorType>
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
        Qualifier extends Atom.Qualifier.Constraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.TupleHandlerPair<
            Flavor,
            Value,
            Qualifier,
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
        Qualifier extends Atom.Qualifier.Constraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ArrayHandler<
            Flavor,
            Value,
            Qualifier,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Object

      export interface Object<
        Flavor extends Atom.Flavor.Constraint,
        Value extends object,
        Qualifier extends Atom.Qualifier.Constraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ObjectHandlerPair<
            Flavor,
            Value,
            Qualifier,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.ObjectHandlerSingle<
            Flavor,
            Value,
            Qualifier,
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
      Qualifier extends Atom.Qualifier.Constraint,
      SelectorType extends Selector.Type,
    > = ValueDef["read"] extends infer Value
      ? Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Selector.Array<Flavor, Value, Qualifier, SelectorType>
          : undefined
        : Value extends Utils.Tuple
          ? Selector.Tuple<Flavor, Value, Qualifier, SelectorType>
          : Value extends unknown[]
            ? Selector.Array<Flavor, Value, Qualifier, SelectorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : Selector.Object<Flavor, Value, Qualifier, SelectorType>
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
        Qualifier extends Atom.Qualifier.Constraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.TupleHandlerPair<
            Flavor,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<SelectorType, Collection.TupleItem<Flavor, Value>>;

        (
          callback: Collection.TupleHandlerSingle<Flavor, Value, unknown>,
        ): Result<SelectorType, Collection.TupleItem<Flavor, Value>>;
      }

      // Array

      export interface Array<
        Flavor extends Atom.Flavor.Constraint,
        Value extends Utils.ArrayConstraint,
        Qualifier extends Atom.Qualifier.Constraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ArrayHandler<Flavor, Value, Qualifier, unknown>,
        ): Result<
          SelectorType,
          Child<Flavor, Value, number, Qualifier, "iterated">
        >;
      }

      // Object

      export interface Object<
        Flavor extends Atom.Flavor.Constraint,
        Value extends object,
        Qualifier extends Atom.Qualifier.Constraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ObjectHandlerPair<
            Flavor,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<
          SelectorType,
          Collection.ObjectItem<Flavor, Value, Qualifier>
        >;

        (
          callback: Collection.ObjectHandlerSingle<
            Flavor,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<
          SelectorType,
          Collection.ObjectItem<Flavor, Value, Qualifier>
        >;
      }
    }

    //#endregion

    export namespace Use {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Flavor, ValueDef, Qualifier, Parent>
      >;

      export type Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = ValueDef["read"] extends infer Value
        ? Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : () => Envelop<
                Flavor,
                Atom.Def<Value>,
                Qualifier | "bound",
                Parent
              >
          : undefined
        : never;
    }
  }

  export type ForEachProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Mapper<Flavor, ValueDef, Qualifier, "each">;

  export type MapProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Mapper<Flavor, ValueDef, Qualifier, "map">;

  export type FindProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Selector<Flavor, ValueDef, Qualifier, "find">;

  export type FilterProp<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Selector<Flavor, ValueDef, Qualifier, "filter">;

  export namespace Insert {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = ValueDef["read"] extends infer Value
      ? Value extends Utils.StaticArray
        ? undefined
        : Value extends unknown[]
          ? Fn<Flavor, Value, Qualifier>
          : undefined
      : never;

    export interface Fn<
      Flavor extends Flavor.Constraint,
      Value extends unknown[],
      Qualifier extends Qualifier.Constraint,
    > {
      (
        index: number,
        value: Value[number],
      ): Envelop<
        Child.Type<Flavor, Value>,
        Atom.Def<Value[number]>,
        Child.Qualifier<Value, number, Qualifier>
      >;
    }
  }

  export namespace Push {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
    > = ValueDef["read"] extends infer Value
      ? Value extends Utils.Tuple
        ? undefined
        : Value extends unknown[]
          ? Fn<Flavor, Value, Qualifier>
          : undefined
      : never;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier.Constraint,
    > {
      (
        value: Value[number],
      ): Envelop<
        Child.Type<Flavor, Value>,
        Atom.Def<Value[number]>,
        Child.Qualifier<Value, number, Qualifier>
      >;
    }
  }

  //#endregion

  //#endregion

  //#region Tree

  //#region Root

  export namespace Root {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Qualifier extends Qualifier.Constraint,
    > = Envelop<
      Exclude<Flavor, Flavor.Variant> | "immutable",
      Atom.Def<unknown>,
      "root" | Qualifier.Ref.Preserve<Qualifier>
    >;
  }

  //#endregion

  //#region $

  export namespace $ {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Qualifier.Constraint,
    > =
      // Mapped unknown and any are resolved to `{}` and `Record<string, any>`
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
                  [Key in keyof Value]-?: Utils.Expose<
                    Child<Flavor, Value, Key, Qualifier, "indexed">
                  >;
                }
            : undefined;
  }

  //#endregion

  //#region At

  export namespace At {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Qualifier.Constraint,
    > =
      | (Utils.HasNonObject<Value> extends true ? undefined : never)
      | (Utils.OnlyObject<Value> extends infer Value
          ? Fn<
              Flavor,
              Utils.NonNullish<Value>,
              keyof Utils.NonNullish<Value>,
              Qualifier
            >
          : never);

    // WIP: This approach works for generic values, but breaks for unions:

    // export type Prop<
    //   Flavor extends Atom.Flavor.Constraint,
    //   Value,
    // > = Value extends Utils.NonObject
    //   ? undefined
    //   : Fn<Flavor, Value, keyof Value>;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Key extends keyof Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > {
      <ArgKey extends Key>(
        key: ArgKey | Enso.SafeNullish<ArgKey>,
      ): Child<Flavor, Value, ArgKey, Qualifier>;
    }

    export type Child<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Key extends keyof Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Key extends Key
      ? Atom.Child<Flavor, Value, Key, Qualifier, "indexed">
      : never;
  }

  //#endregion

  //#region Try

  export namespace Try {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Qualifier extends Qualifier.Constraint,
    > =
      | (Utils.HasNonObject<Value> extends true ? undefined : never)
      | (Utils.OnlyObject<Value> | Utils.OnlyAny<Value> extends infer Value
          ? Utils.IsNever<Value> extends false
            ? keyof Value extends infer Key extends keyof Value
              ? <ArgKey extends Key>(
                  key: ArgKey | Enso.SafeNullish<ArgKey>,
                ) => Child<Flavor, Value, ArgKey, Qualifier>
              : never
            : never
          : never);

    export type Child<
      Flavor extends Atom.Flavor.Constraint,
      Value,
      Key extends keyof Utils.NonNullish<Value>,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Key extends Key
      ?
          | Envelop<
              Flavor,
              Utils.NonNullish<Value>[Key],
              Child.Qualifier<Value, Key, Qualifier>
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
          Atom.Def<Utils.NonNullish<Value>>,
          Qualifier | "tried"
        >;
  }

  //#endregion

  //#endregion

  //#region Events

  export type Unwatch = () => void;

  //#region Watch

  export namespace Watch {
    export interface Callback<ValueDef extends Def.Constraint> {
      (value: ValueDef["read"], event: ChangesEvent): void;
    }

    export namespace Use {
      export type Prop<
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
      > = Qualifier.Ref.DisableFor<Qualifier, Fn<ValueDef>>;

      export interface Fn<ValueDef extends Def.Constraint> {
        (callback: Watch.Callback<ValueDef>, deps: DependencyList): Unwatch;
      }
    }
  }

  //#endregion

  //#region Events

  export namespace Events {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Qualifier.Ref.DisableFor<
      Qualifier,
      EventsTree<Extract<Flavor, Atom.Flavor.Kind>>
    >;
  }

  //#endregion

  //#region Trigger

  export namespace Trigger {
    export type Prop<Qualifier extends Atom.Qualifier.Constraint> =
      Qualifier.Ref.DisableFor<Qualifier, Fn>;

    export interface Fn {
      (changes: FieldChange, notifyParents?: boolean): void;
    }
  }

  //#endregion

  //#endregion

  //#region Transform

  //#region Compute

  export namespace Compute {
    export interface Prop<ValueDef extends Def.Constraint> {
      <Result>(callback: Callback<ValueDef, Result>): Result;
    }

    export interface Callback<ValueDef extends Def.Constraint, Result> {
      (value: ValueDef["read"]): Result;
    }

    export namespace Use {
      export type Prop<
        ValueDef extends Def.Constraint,
        Qualifier extends Qualifier.Constraint,
      > = Qualifier.Ref.DisableFor<Qualifier, Fn<ValueDef>>;

      export interface Fn<ValueDef extends Def.Constraint> {
        <Result>(
          callback: Callback<ValueDef, Result>,
          deps: DependencyList,
        ): Result;
      }
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
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > = ValueDef["read"] extends infer Value
      ?
          | (Value extends Value
              ? {
                  value: Value;
                  field: Envelop<Flavor, Atom.Def<Value>, Qualifier, Parent>;
                }
              : never)
          // Add unknown option for the base and immutable variants
          | (Flavor extends
              | (infer Kind extends Atom.Flavor.Kind)
              | infer Variant
              ? Variant extends "base"
                ? {
                    value: unknown;
                    field: Envelop<
                      Kind | Variant,
                      Atom.Def<unknown>,
                      Qualifier,
                      Parent
                    >;
                  }
                : never
              : never)
      : never;

    export namespace Use {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Flavor, ValueDef, Qualifier, Parent>
      >;

      export interface Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        (
          callback: Callback<ValueDef>,
          deps: DependencyList,
        ): Result<Flavor, ValueDef, Qualifier, Parent>;
      }

      export type Callback<ValueDef extends Def.Constraint> = (
        newValue: ValueDef["read"],
        prevValue: ValueDef["read"],
      ) => boolean;
    }
  }

  //#endregion

  //#region Discriminate

  export namespace Discriminate {
    export type Prop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Fn<Flavor, ValueDef, Qualifier, Parent>;

    export interface Fn<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      <Discriminator extends Discriminate.Discriminator<ValueDef>>(
        discriminator: Discriminator,
      ): Result<Flavor, ValueDef, Discriminator, Qualifier, Parent>;
    }

    export type Discriminator<ValueDef extends Def.Constraint> =
      keyof Utils.NonUndefined<ValueDef["read"]>;

    export type Result<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Discriminator extends Discriminate.Discriminator<ValueDef>,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Inner<Flavor, ValueDef, Discriminator, Qualifier, Parent>;

    export type Inner<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Def.Constraint,
      Discriminator extends Discriminate.Discriminator<ValueDef>,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = ValueDef["read"] extends infer Value
      ?
          | (Value extends Value
              ? Discriminator extends keyof Value
                ? Value[Discriminator] extends infer DiscriminatorValue
                  ? DiscriminatorValue extends Value[Discriminator]
                    ? {
                        discriminator: DiscriminatorValue;
                        field: Envelop<
                          Flavor,
                          Atom.Def<Value>,
                          Qualifier,
                          Parent
                        >;
                      }
                    : never
                  : never
                : // Add the payload type without the discriminator (i.e. undefined)
                  {
                    discriminator: undefined;
                    field: Envelop<Flavor, Atom.Def<Value>, Qualifier, Parent>;
                  }
              : never)
          // Add unknown option for the base and immutable variants
          | (Flavor extends
              | (infer Kind extends Atom.Flavor.Kind)
              | infer Variant
              ? Variant extends "base"
                ? {
                    discriminator: unknown;
                    field: Envelop<
                      Kind | Variant,
                      Atom.Def<unknown>,
                      Qualifier,
                      Parent
                    >;
                  }
                : never
              : never)
      : never;

    export namespace Use {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Flavor, ValueDef, Qualifier, Parent>
      >;
    }
  }

  //#endregion

  //#region Proxy

  export namespace Proxy {
    export interface Qualifier<ValueDef> {
      source: ValueDef;
    }

    export type Envelop<
      Flavor extends Atom.Flavor.Constraint,
      ValueDef extends Atom.Def.Constraint,
      ComputedValue,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Atom.Envelop<
      Flavor,
      Atom.Def<ComputedValue>,
      Proxy.Qualifier<ValueDef>,
      Parent
    >;

    export namespace Into {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Into.Fn<Flavor, ValueDef, Qualifier, Parent>;

      export interface Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        <ComputedValue>(
          intoMapper: Into.Mapper<ValueDef, ComputedValue>,
        ): Result<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<ValueDef extends Def.Constraint, ComputedValue> {
        (value: ValueDef["read"]): ComputedValue;
      }

      export interface Result<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        ComputedValue,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        from: From.Fn<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
      }

      export namespace Use {
        export type Prop<
          Flavor extends Atom.Flavor.Constraint,
          ValueDef extends Atom.Def.Constraint,
          Qualifier extends Atom.Qualifier.Constraint,
          Parent extends Atom.Parent.Constraint<ValueDef>,
        > = Qualifier.Ref.DisableFor<
          Qualifier,
          Fn<Flavor, ValueDef, Qualifier, Parent>
        >;
        // > = Exact.OnlyFor<
        //   Flavor,
        //   Qualifier.Ref.DisableFor<
        //     Qualifier,
        //     Fn<Flavor, ValueDef, Qualifier, Parent>
        //   >
        // >;

        export interface Fn<
          Flavor extends Atom.Flavor.Constraint,
          ValueDef extends Atom.Def.Constraint,
          Qualifier extends Atom.Qualifier.Constraint,
          Parent extends Atom.Parent.Constraint<ValueDef>,
        > {
          <ComputedValue>(
            intoMapper: Proxy.Into.Mapper<ValueDef, ComputedValue>,
            deps: DependencyList,
          ): Result<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
        }

        export interface Result<
          Flavor extends Atom.Flavor.Constraint,
          ValueDef extends Atom.Def.Constraint,
          ComputedValue,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
        > {
          from: Proxy.From.Use.Fn<
            Flavor,
            ValueDef,
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
        ValueDef extends Atom.Def.Constraint,
        ComputedValue,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > {
        <MappedValue extends ValueDef["read"]>(
          fromMapper: Mapper<ValueDef, ComputedValue, MappedValue>,
        ): Envelop<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<
        ValueDef extends Def.Constraint,
        ComputedValue,
        MappedValue,
      > {
        (computedValue: ComputedValue, value: ValueDef["read"]): MappedValue;
      }

      export namespace Use {
        export interface Fn<
          Flavor extends Atom.Flavor.Constraint,
          ValueDef extends Atom.Def.Constraint,
          ComputedValue,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
        > {
          <MappedValue extends ValueDef["read"]>(
            fromMapper: Mapper<ValueDef, ComputedValue, MappedValue>,
            deps: DependencyList,
          ): Envelop<Flavor, ValueDef, ComputedValue, Qualifier, Parent>;
        }
      }
    }
  }

  //#endregion

  //#region Defined

  export namespace Defined {
    export interface FnString<
      Flavor extends Atom.Flavor.Constraint,
      Value extends string | Utils.Nullish,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > {
      (to: "string"): Envelop<Flavor, Atom.Def<string>, Qualifier, Parent>;
    }

    export namespace Use {
      export type Prop<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Flavor, ValueDef, Qualifier, Parent>
      >;

      export type Fn<
        Flavor extends Atom.Flavor.Constraint,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = ValueDef["read"] extends infer Value
        ? Utils.IsNever<Extract<Value, string>> extends false
          ? Value extends string | Utils.Nullish
            ? FnString<Flavor, Value, Qualifier, Parent>
            : undefined
          : never
        : never;
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
