import { DependencyList } from "react";
import { ChangesEvent, FieldChange } from "../change/index.ts";
import { DetachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import type { Field } from "../field/definition.ts";
import type { State } from "../state/index.ts";
import type { Enso } from "../types.ts";
import type { EnsoUtils as Utils } from "../utils.ts";
import { E } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";

export declare class Atom<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    /*out*/ ValueDef extends Atom.Def.Constraint,
    out Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  >
  implements
    Utils.StaticImplements<
      typeof Atom<Kind, Variant, ValueDef, Qualifier, Parent>,
      Atom.Static
    >,
    Atom.Exact<Kind, Variant, ValueDef, Qualifier, Parent>
{
  //#region Static

  static safeNullish<Type>(value: Type | Utils.Nullish): Enso.SafeNullish<Type>;

  //#endregion

  //#region Instance

  constructor(
    value: ValueDef["read"],
    parent?: Atom.Parent.Ref<Kind, Qualifier, Parent>,
  );

  deconstruct(): void;

  //#endregion

  //#region Phantoms

  [AtomPrivate.immutablePhantom]: Atom.Immutable.Phantom<Kind, ValueDef>;

  readonly [AtomPrivate.variantPhantom]: Atom.Variant.Phantom<Variant>;

  [AtomPrivate.qualifierPhantom]: Atom.Qualifier.Phantom<Qualifier>;

  [AtomPrivate.valueExactPhantom]: Atom.ValueExactPhantom<ValueDef["read"]>;

  [AtomPrivate.parentPhantom]: Atom.Parent.Phantom<ValueDef, Parent>;

  //#endregion

  //#region Attributes

  readonly id: string;

  //#endregion

  //#region Value

  get value(): Atom.Value.Prop<ValueDef>;

  useValue: Atom.Value.Use.Prop<Kind, Variant, ValueDef, Qualifier>;

  compute<Result>(
    callback: Atom.Compute.Callback<ValueDef["read"], Result>,
  ): Result;

  readonly useCompute: Atom.Compute.Use.Prop<ValueDef, Qualifier>;

  set<NewValue extends ValueDef["write"]>(
    value: NewValue,
  ): Atom.Set.Result<Kind, Variant, ValueDef, NewValue, Qualifier, Parent>;

  pave<NewValue extends Utils.NonNullish<ValueDef["write"]>>(
    value: NewValue,
  ): Atom.Pave.Result<Kind, Variant, ValueDef, NewValue, Qualifier, Parent>;

  get lastChanges(): FieldChange;

  //#endregion

  //#region Meta

  useMeta: Atom.Meta.Use.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

  //#endregion

  //#region Type

  size: Atom.Size.Prop<ValueDef>;

  remove: Atom.Remove.Prop<Kind, Variant, ValueDef>;

  forEach: Atom.ForEachProp<Kind, Variant, ValueDef, Qualifier>;

  map: Atom.MapProp<Kind, Variant, ValueDef, Qualifier>;

  find: Atom.FindProp<Kind, Variant, ValueDef, Qualifier>;

  filter: Atom.FilterProp<Kind, Variant, ValueDef, Qualifier>;

  useCollection: Atom.Collection.Use.Prop<
    Kind,
    Variant,
    ValueDef,
    Qualifier,
    Parent
  >;

  insert: Atom.Insert.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

  push: Atom.Push.Prop<Kind, Variant, ValueDef, Qualifier>;

  //#endregion

  //#region Tree

  get root(): Atom.Root.Prop<Kind, Variant, Qualifier>;

  get parent(): Atom.Parent.Prop<Kind, ValueDef, Qualifier, Parent>;

  get key(): string;

  get $(): Atom.$.Prop<Kind, Variant, ValueDef["read"], Qualifier>;

  at: Atom.At.Prop<Kind, Variant, ValueDef["read"], Qualifier>;

  try: Atom.TryProp<Kind, Variant, ValueDef, Qualifier, Parent>;

  get path(): string[];

  get name(): string;

  readonly self: Atom.Self.Envelop<Kind, Variant, ValueDef, Qualifier, Parent>;

  lookup(
    path: Atom.Path,
  ): Atom.Lookup.Result<Kind, Variant, ValueDef, Qualifier, Parent>;

  //#endregion

  //#region Events

  events: Atom.Events.Prop<Kind, Variant, Qualifier>;

  watch(callback: Atom.Watch.Callback<ValueDef>): Atom.Unwatch;

  useWatch: Atom.Watch.Use.Prop<ValueDef, Qualifier>;

  trigger: Atom.Trigger.Prop<Qualifier>;

  //#endregion

  //#region Transform

  readonly decompose: Atom.Decompose.Prop<
    Kind,
    Variant,
    ValueDef,
    Qualifier,
    Parent
  >;

  readonly useDecompose: Atom.Decompose.Use.Prop<
    Kind,
    Variant,
    ValueDef,
    Qualifier,
    Parent
  >;

  readonly discriminate: Atom.Discriminate.Prop<
    Kind,
    Variant,
    ValueDef,
    Qualifier,
    Parent
  >;

  readonly useDiscriminate: Atom.Discriminate.Use.Prop<
    Kind,
    Variant,
    ValueDef,
    Qualifier,
    Parent
  >;

  into: Atom.Proxy.Into.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

  useInto: Atom.Proxy.Into.Use.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

  useDefined: Atom.Defined.Use.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

  shared: Atom.Shared.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

  optional: Atom.Optional.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

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
      ): Envelop<Kind, "exact", Atom.Def<Value>, Qualifier, Parent>;

      // TODO: Ideally it should go into Static and utilize create

      base<EnvelopType extends Atom.Envelop<Kind, any, any>>(
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
        atom: Atom.Envelop<Kind, Variant, ValueDef, Qualifier, Parent>,
        intoMapper: Atom.Proxy.Into.Mapper<ValueDef, ComputedValue>,
        fromMapper: Atom.Proxy.From.Mapper<
          ValueDef,
          ComputedValue,
          MappedValue
        >,
      ): Atom.Proxy.Envelop<
        Kind,
        Variant,
        ValueDef,
        ComputedValue,
        Qualifier,
        Parent
      >;

      use<Value>(
        initialValue: Value,
        deps: DependencyList,
      ): Atom.Envelop<Kind, "exact", Atom.Def<Value>>;

      useEnsure<
        EnvelopType extends Atom.Envelop<Kind, any, any> | Utils.Falsy,
        MappedType extends Envelop<Kind, any, any> | Utils.Falsy = undefined,
      >(
        atom: EnvelopType,
        map?: Ensure.Mapper<Kind, EnvelopType, MappedType>,
      ): Ensure.Result<Kind, EnvelopType, MappedType>;
    }

    export namespace Ensure {
      export interface Mapper<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any, any> | Utils.Falsy,
        MappedType extends Envelop<Kind, any, any> | Utils.Falsy,
      > extends Bare.Mapper<
          Envelop<
            Kind,
            Variant.Parse<EnvelopType>,
            AtomValueDef<Kind, EnvelopType>
          >,
          MappedType
        > {}

      export type Result<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any, any> | Utils.Falsy,
        MappedType extends Envelop<Kind, any, any> | Utils.Falsy,
      > = MappedType extends undefined
        ? ResultDirect<Kind, EnvelopType>
        : ResultMapped<Kind, EnvelopType, MappedType>;

      export type ResultDirect<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any, any> | Utils.Falsy,
      > = Utils.Expose<
        Envelop<
          Kind,
          Variant.Parse<EnvelopType>,
          Def.Union<
            AtomValueDef<Kind, EnvelopType>,
            Utils.Extends<EnvelopType, Utils.Falsy> extends true
              ? undefined
              : never
          >,
          AtomQualifier<Kind, EnvelopType>
        >
      >;

      export type ResultMapped<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any, any> | Utils.Falsy,
        MappedType extends Envelop<Kind, any, any> | Utils.Falsy,
      > = Utils.Expose<
        Envelop<
          Kind,
          Variant.Parse<MappedType>,
          Def.Union<
            AtomValueDef<Kind, MappedType>,
            Utils.Extends<EnvelopType, Utils.Falsy> extends true
              ? undefined
              : never
          >,
          AtomQualifier<Kind, MappedType>
        >
      >;

      export type AtomValueDef<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any, any> | Utils.Falsy,
      > =
        Utils.NonFalsy<EnvelopType> extends Envelop<Kind, any, infer ValueDef>
          ? ValueDef extends Atom.Def<infer ReadValue, infer WriteValue>
            ? [WriteValue, ReadValue] extends [ReadValue, WriteValue]
              ? ValueDef
              : Atom.Def<unknown>
            : never
          : never;

      export type AtomQualifier<
        Kind extends Atom.Flavor.Kind,
        EnvelopType extends Envelop<Kind, any, any> | Utils.Falsy,
      > =
        Utils.NonFalsy<EnvelopType> extends Envelop<
          Kind,
          any,
          any,
          infer Qualifier
        >
          ? Qualifier
          : never;

      export namespace Bare {
        export interface Mapper<AtomType, MappedType> {
          (atom: AtomType): MappedType;
        }
      }
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
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > = Kind extends "state"
    ? State.Envelop<Variant, ValueDef, Qualifier, Parent>
    : Kind extends "field"
      ? Field.Envelop<Variant, ValueDef, Qualifier, Parent>
      : never;

  //#endregion

  //#region Variant

  export namespace Variant {
    export type Phantom<Variant extends Atom.Flavor.Variant> =
      "exact" extends Variant
        ? {
            read: true;
            base: true;
            exact: true;
          }
        : "base" extends Variant
          ? {
              read: true;
              base: true;
            }
          : "optional" extends Variant
            ? {
                read: true;
                optional: true;
              }
            : "immutable" extends Variant
              ? {
                  read: true;
                }
              : {};

    export type Parse<Type> =
      Utils.NonFalsy<Type> extends {
        readonly [AtomPrivate.variantPhantom]: infer TypePhantom;
      }
        ? TypePhantom extends Phantom<"exact">
          ? "exact"
          : TypePhantom extends Phantom<"base">
            ? "base"
            : TypePhantom extends Phantom<"optional">
              ? "optional"
              : TypePhantom extends Phantom<"immutable">
                ? "immutable"
                : never
        : never;
  }

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

    export interface Constraint {
      root?: true;
      detachable?: true;
      tried?: true;
      bound?: true;
      ref?: true;
      source?: any;
    }

    export type Default = Constraint;

    export type Phantom<Qualifier extends Constraint> = Qualifier;

    export namespace Ref {
      export type DisableFor<
        Qualifier extends Atom.Qualifier.Constraint,
        Type,
      > =
        Utils.Extends<Qualifier, { ref: true }> extends true ? undefined : Type;

      export type Preserve<Qualifier extends Qualifier.Constraint> =
        Utils.Extends<Qualifier, { ref: true }> extends true
          ? { ref: true }
          : {};
    }

    export namespace External {
      export type Default = unknown;

      export type Constraint = Known | unknown;

      export type Known =
        | "root"
        | "detachable"
        | "tried"
        | "bound"
        | "ref"
        | Proxy.Qualifier<unknown>;

      export type Concat<Qualifier extends Constraint, ToAdd extends Known> =
        | Extract<Qualifier, Known>
        | ToAdd;
    }

    export type Internalize<Qualifier extends External.Constraint> =
      Utils.Transparent<
        Utils.IsUnknown<Qualifier> extends true
          ? {}
          : Internalize.Basic<Qualifier, "root"> &
              Internalize.Basic<Qualifier, "detachable"> &
              Internalize.Basic<Qualifier, "tried"> &
              Internalize.Basic<Qualifier, "bound"> &
              Internalize.Basic<Qualifier, "ref"> &
              Internalize.Proxy<Qualifier>
      >;

    export namespace Internalize {
      export type Basic<
        Qualifier extends External.Constraint,
        TestQualifier extends keyof any,
      > = TestQualifier extends Qualifier
        ? Utils.IsNever<TestQualifier> extends true
          ? {}
          : { [Key in TestQualifier]: true }
        : {};

      export type Proxy<Qualifier extends Atom.Qualifier.External.Constraint> =
        Extract<Qualifier, Proxy.Qualifier<any>> extends infer ProxyQualifier
          ? Utils.IsNever<ProxyQualifier> extends true
            ? {}
            : ProxyQualifier extends Proxy.Qualifier<infer SourceValue>
              ? { source: SourceValue }
              : {}
          : {};
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
      Kind,
      "immutable",
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
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    Value,
    Key extends keyof Value,
    Qualifier extends Qualifier.Constraint,
    Access extends Child.Access,
  > = Envelop<
    Kind,
    Child.Variant<Variant, Value>,
    Child.Value<Kind, Variant, Value, Key, Access>,
    Child.Qualifier<Value, Key, Qualifier>
  >;

  export namespace Child {
    export type Access = "indexed" | "iterated";

    export type Variant<Variant extends Atom.Flavor.Variant, Value> =
      Utils.IsAny<Value> extends true
        ? "exact"
        : Utils.IsReadonlyArray<Value> extends true
          ? Variant extends "immutable"
            ? "immutable"
            : "base"
          : Variant extends "base"
            ? "exact"
            : Variant;

    export type Value<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
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
          ? Utils.Extends<Variant, "optional"> extends true
            ? Utils.NonNullish<Value>
            : Value
          : never
      >
    >;

    export type Qualifier<
      ParentValue,
      ParentKey extends keyof Utils.NonNullish<ParentValue>,
      Qualifier extends Qualifier.Constraint,
    > = Qualifier.Ref.Preserve<Qualifier> &
      (Utils.IsAny<ParentValue> extends true
        ? { detachable: true }
        : Utils.IsStaticKey<ParentValue, ParentKey> extends true
          ? Utils.IsOptionalKey<ParentValue, ParentKey> extends true
            ? { detachable: true }
            : {}
          : Utils.IsReadonlyArray<ParentValue> extends true
            ? {}
            : ParentValue extends Utils.Tuple
              ? {}
              : { detachable: true });
  }

  //#endregion

  //#region Interface

  //#region Exact

  export interface Exact<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    /*out*/ ValueDef extends Atom.Def.Constraint,
    out Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > extends Immutable<Kind, Variant, ValueDef, Qualifier, Parent> {
    //#region Value

    set<NewValue extends ValueDef["write"]>(
      value: NewValue,
    ): Set.Result<Kind, Variant, ValueDef, NewValue, Qualifier, Parent>;

    pave<NewValue extends Utils.NonNullish<ValueDef["write"]>>(
      value: NewValue,
    ): Pave.Result<Kind, Variant, ValueDef, NewValue, Qualifier, Parent>;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.valueExactPhantom]: Atom.ValueExactPhantom<ValueDef["read"]>;

    lastChanges: FieldChange;

    //#endregion

    //#region Type

    remove: Remove.Prop<Kind, Variant, ValueDef>;

    insert: Insert.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    push: Push.Prop<Kind, Variant, ValueDef, Qualifier>;

    //#endregion
  }

  export namespace Exact {
    export type Envelop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = "state" extends Kind
      ? State.Exact<ValueDef, Qualifier, Parent>
      : "field" extends Kind
        ? Field.Exact<ValueDef, Qualifier, Parent>
        : never;

    export interface Self<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      /*out*/ ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > extends Immutable.Self<Kind, Variant, ValueDef, Qualifier, Parent> {
      remove: Atom.Self.Remove.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;
    }
  }

  //#endregion

  //#region Base

  export interface Base<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    /*out*/ ValueDef extends Atom.Def.Constraint,
    out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Immutable<Kind, Variant, ValueDef, Qualifier, Parent> {}

  export namespace Base {
    export type Envelop<
      Kind extends Atom.Flavor.Kind,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Utils.Expose<
      Kind extends "state"
        ? State.Base.Internal<ValueDef, Qualifier, Parent>
        : Kind extends "field"
          ? Field.Base.Internal<ValueDef, Qualifier, Parent>
          : never
    >;

    export type Result<
      Kind extends Atom.Flavor.Kind,
      EnvelopType extends Atom.Envelop<Kind, any, any, any, any>,
    > = Atom.Base.Envelop<
      Kind,
      Value.BaseDef<EnvelopType>,
      Qualifier.Shared<EnvelopType>,
      never
    >;

    export namespace Value {
      export type BaseDef<
        EnvelopType extends Atom.Envelop<any, any, any, any, any>,
      > = [EnvelopType] extends [Atom.Envelop<any, any, infer ValueDef>]
        ? Def<
            ValueDef extends Def<infer ReadValue, any> ? ReadValue : never,
            ValueDef extends Def<any, infer WriteValue> ? WriteValue : never
          >
        : never;
    }

    export namespace Qualifier {
      export type Shared<EnvelopType> = Utils.Union.Shared<Union<EnvelopType>>;

      export type Union<EnvelopType> =
        EnvelopType extends Atom.Envelop<any, any, any, infer Qualifier>
          ? Qualifier
          : never;

      export type IsShared<EnvelopType, QualifierUnion> =
        EnvelopType extends Atom.Envelop<
          any,
          any,
          any,
          infer EnvelopTypeQualifier
        >
          ? QualifierUnion extends EnvelopTypeQualifier
            ? true
            : false
          : false;
    }

    export interface Self<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Self<Kind, Variant, ValueDef, Qualifier, Parent> {}
  }

  //#endregion

  //#region Optional

  export interface Optional<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    /*out*/ ValueDef extends Atom.Def.Constraint,
    out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Immutable<Kind, Variant, ValueDef, Qualifier, Parent> {}

  export namespace Optional {
    export type Envelop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > = Utils.Expose<
      "state" extends Kind
        ? State.Optional.Internal<ValueDef, Qualifier, Parent>
        : "field" extends Kind
          ? Field.Optional.Internal<ValueDef, Qualifier, Parent>
          : never
    >;

    export interface Self<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Self<Kind, Variant, ValueDef, Qualifier, Parent> {}

    export type Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Fn<Kind, Variant, ValueDef, Qualifier, Parent>;

    export interface Fn<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      out Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      (): Atom.Envelop<
        Kind,
        "optional",
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
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    /*out*/ ValueDef extends Atom.Def.Constraint,
    out Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > {
    //#region Phantoms

    // NOTE: As immutable atoms never resolve exact children like base,
    // we must manually provide phantom type to ensure proper variance between
    // them.
    [AtomPrivate.immutablePhantom]: Immutable.Phantom<Kind, ValueDef>;

    readonly [AtomPrivate.variantPhantom]: Atom.Variant.Phantom<Variant>;

    [AtomPrivate.qualifierPhantom]: Atom.Qualifier.Phantom<Qualifier>;

    [AtomPrivate.parentPhantom]: Parent.Phantom<ValueDef, Parent>;

    //#endregion

    //#region Instance

    deconstruct(): void;

    //#endregion

    readonly id: string;

    //#region Value

    readonly value: Atom.Value.Prop<ValueDef>;

    readonly useValue: Atom.Value.Use.Prop<Kind, Variant, ValueDef, Qualifier>;

    compute<Result>(
      callback: Compute.Callback<ValueDef["read"], Result>,
    ): Result;

    readonly useCompute: Compute.Use.Prop<ValueDef, Qualifier>;

    //#endregion

    //#region Meta

    useMeta: Meta.Use.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    //#endregion

    //#region Tree

    root: Root.Prop<Kind, Variant, Qualifier>;

    parent: Parent.Prop<Kind, ValueDef, Qualifier, Parent>;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $.Prop<Kind, Variant, ValueDef["read"], Qualifier>;

    at: At.Prop<Kind, Variant, ValueDef["read"], Qualifier>;

    try: Atom.TryProp<Kind, Variant, ValueDef, Qualifier, Parent>;

    readonly self: Self.Envelop<Kind, Variant, ValueDef, Qualifier, Parent>;

    lookup(
      path: Atom.Path,
    ): Lookup.Result<Kind, Variant, ValueDef, Qualifier, Parent>;

    //#endregion

    //#region Type

    size: Size.Prop<ValueDef>;

    forEach: ForEachProp<Kind, Variant, ValueDef, Qualifier>;

    map: MapProp<Kind, Variant, ValueDef, Qualifier>;

    find: FindProp<Kind, Variant, ValueDef, Qualifier>;

    filter: FilterProp<Kind, Variant, ValueDef, Qualifier>;

    useCollection: Collection.Use.Prop<
      Kind,
      Variant,
      ValueDef,
      Qualifier,
      Parent
    >;

    //#endregion

    //#region Events

    events: Events.Prop<Kind, Variant, Qualifier>;

    watch(callback: Watch.Callback<ValueDef>): Unwatch;

    useWatch: Watch.Use.Prop<ValueDef, Qualifier>;

    trigger: Trigger.Prop<Qualifier>;

    //#endregion

    //#region Transform

    readonly decompose: Decompose.Prop<
      Kind,
      Variant,
      ValueDef,
      Qualifier,
      Parent
    >;

    readonly useDecompose: Decompose.Use.Prop<
      Kind,
      Variant,
      ValueDef,
      Qualifier,
      Parent
    >;

    readonly discriminate: Discriminate.Prop<
      Kind,
      Variant,
      ValueDef,
      Qualifier,
      Parent
    >;

    readonly useDiscriminate: Discriminate.Use.Prop<
      Kind,
      Variant,
      ValueDef,
      Qualifier,
      Parent
    >;

    // TODO: Find a way to simply move it to Exact, rather than using Exact.OnlyFor,
    // but it breaks many tysts.

    into: Proxy.Into.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    useInto: Proxy.Into.Use.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    useDefined: Defined.Use.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    shared: Shared.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    optional: Optional.Prop<Kind, Variant, ValueDef, Qualifier, Parent>;

    //#endregion
  }

  export namespace Immutable {
    export type Phantom<
      Kind extends Atom.Flavor.Kind,
      ValueDef extends Def.Constraint,
    > = $.Prop<Kind, "base", ValueDef["read"], never>;

    export interface Self<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      try(): Try<Kind, Variant, ValueDef, Qualifier, Parent>;
    }

    export type Try<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
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
              Kind,
              Variant,
              Atom.Def<Utils.NonNullish<Value>>,
              Qualifier & { tried: true },
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
      Kind extends Flavor.Kind,
      Variant extends Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Qualifier.Constraint = Qualifier.Default,
      Parent extends Parent.Constraint<ValueDef> = Parent.Default,
    > {
      <ValueTuple extends Value.Tuple>(): Result<
        Kind,
        Variant,
        ValueDef,
        ValueTuple,
        Qualifier,
        Parent
      >;
    }

    export type Result<
      Kind extends Flavor.Kind,
      Variant extends Flavor.Variant,
      ValueDef extends Def.Constraint,
      ValueTuple extends Value.Tuple,
      Qualifier extends Qualifier.Constraint,
      Parent extends Parent.Constraint<ValueDef>,
    > = Envelop<
      Kind,
      Variant,
      Result.Tuple<
        Kind,
        Variant,
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
        Kind extends Flavor.Kind,
        Variant extends Flavor.Variant,
        ValueDef extends Def.Constraint,
        ValueTuple extends Value.Tuple,
      > = "exact" extends Variant
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
    readonly read: ReadValue;
    readonly write: WriteValue;
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

  //#region Value

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

    export type FromEnvelop<EnvelopType extends Atom.Envelop<any, any, any>> =
      EnvelopType extends Atom.Envelop<any, any, infer Value> ? Value : never;

    export namespace Use {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
      > = Qualifier.Ref.DisableFor<Qualifier, Fn<Kind, Variant, ValueDef>>;

      export interface Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
      > {
        <Props extends Use.Props<Kind> | undefined = undefined>(
          props?: Props,
        ): Result<Kind, Variant, ValueDef, Props>;
      }

      export type Result<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Props extends Use.Props<Kind> | undefined,
      > =
        IncludeMeta<Kind, Variant, Props> extends true
          ? [
              Opaque<ValueDef["read"]>,
              Props extends { meta: true }
                ? Meta<Kind, Variant, undefined>
                : Meta<Kind, Variant, Props>,
            ]
          : Opaque<ValueDef["read"]>;

      export type Props<Kind extends Atom.Flavor.Kind> = "state" extends Kind
        ? State.Value.Use.Props
        : "field" extends Kind
          ? Field.Value.Use.Props
          : never;

      export type IncludeMeta<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Props extends Use.Props<Kind> | undefined,
      > = "state" extends Kind
        ? State.Value.Use.IncludeMeta<Props>
        : "field" extends Kind
          ? Field.Value.Use.IncludeMeta<Props>
          : never;
    }
  }

  export type ValueExactPhantom<Value> = (value: Value) => void;

  export type ValueExactPhantomArg<Value> =
    Utils.IsUnknown<Value> extends true ? any : Value;

  export type ValueExactPhantomResult<Value> =
    Utils.IsUnknown<Value> extends true ? Value : void;

  //#endregion

  export namespace Set {
    export type Result<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      SetValue extends ValueDef["write"],
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Envelop<
      Kind,
      Variant,
      Def<ValueDef["write"], SetValue>,
      Qualifier,
      Parent
    >;

    export type Def<Value, NewValue extends Value> = Atom.Def<
      Value extends Value ? (NewValue extends Value ? Value : never) : never,
      Value
    >;
  }

  export namespace Pave {
    export type Result<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      SetValue extends ValueDef["write"],
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Envelop<
      Kind,
      Variant,
      Def<ValueDef["write"], SetValue>,
      Qualifier,
      Parent
    >;

    export type Def<Value, NewValue extends Value> = Atom.Def<
      Value extends Value ? (NewValue extends Value ? Value : never) : never
    >;
  }

  //#endregion

  //#region Meta

  export type Meta<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    Props extends Meta.Props<Kind> | undefined,
  > = "state" extends Kind
    ? State.Meta<Props>
    : "field" extends Kind
      ? Field.Meta<Props>
      : never;

  export namespace Meta {
    export type Props<Flavor extends Atom.Flavor.Constraint> =
      "state" extends Flavor
        ? State.Meta.Props
        : "field" extends Flavor
          ? Field.Meta.Props
          : never;

    export namespace Use {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Kind, Variant, ValueDef, Qualifier, Parent>
      >;

      export interface Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        <Props extends Meta.Props<Kind> | undefined = undefined>(
          props?: Props,
        ): Meta<Kind, Variant, Props>;
      }
    }
  }

  //#region Type

  //#region Self

  export namespace Self {
    export type Envelop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Variant extends "exact"
      ? Exact.Self<Kind, Variant, ValueDef, Qualifier, Parent>
      : Variant extends "base"
        ? Base.Self<Kind, Variant, ValueDef, Qualifier, Parent>
        : Variant extends "optional"
          ? Optional.Self<Kind, Variant, ValueDef, Qualifier, Parent>
          : Variant extends "immutable"
            ? Immutable.Self<Kind, Variant, ValueDef, Qualifier, Parent>
            : never;

    export namespace Remove {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > =
        Utils.IsNever<Extract<Qualifier, { detachable: true }>> extends false
          ? Fn<Kind, Variant, ValueDef, Qualifier, Parent>
          : undefined;

      export interface Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > {
        (): Atom.Envelop<
          Kind,
          Variant,
          Atom.Def<DetachedValue>,
          Qualifier,
          Parent
        >;
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
    > = ValueDef["read"] extends infer Value
      ? Value extends unknown[] | readonly unknown[]
        ? Utils.IsReadonlyArray<Value> extends true
          ? undefined
          : Value extends Utils.Tuple
            ? undefined
            : Value extends unknown[]
              ? Fn.Array<Kind, Variant, Value>
              : never
        : Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : Fn.Object<Kind, Variant, Value>
          : undefined
      : never;

    export namespace Fn {
      export interface Array<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends unknown[],
      > {
        (
          item: number,
        ): Envelop<
          Kind,
          Variant,
          Atom.Def<DetachedValue | Value[number]>,
          { detachable: true }
        >;
      }

      export interface Object<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends object,
      > {
        <Key extends Enso.DetachableKeys<Value>>(
          key: Key,
        ): Envelop<
          Kind,
          Variant,
          Atom.Def<DetachedValue | Value[Key]>,
          { detachable: true }
        >;
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends Utils.Tuple,
      Qualifier extends Atom.Qualifier.Constraint,
      Result = void,
    > {
      (
        ...args: {
          [Key in Utils.IndexOfTuple<Value>]: [
            Child<Kind, Variant, Value, Key, Qualifier, "iterated">,
            Key,
          ];
        }[Utils.IndexOfTuple<Value>]
      ): Result;
    }

    export interface TupleHandlerSingle<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends Utils.Tuple,
      Result = void,
    > {
      (
        item: {
          [Key in keyof Value]: Envelop<Kind, Variant, Atom.Def<Value[Key]>>;
        }[Utils.IndexOfTuple<Value>],
        index?: Utils.IndexOfTuple<Value>,
      ): Result;
    }

    export type TupleItem<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends Utils.Tuple,
    > = {
      [Key in Utils.IndexOfTuple<Value>]: Envelop<
        Kind,
        Variant,
        Atom.Def<Value[Key]>
      >;
    }[Utils.IndexOfTuple<Value>];

    // Array

    export interface ArrayHandler<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends Utils.ArrayConstraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Result = void,
    > {
      (
        item: Child<Kind, Variant, Value, number, Qualifier, "iterated">,
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
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
              Child<Kind, Variant, Value, Key, Qualifier, "iterated">,
              Key,
            ];
          }[Utils.CovariantifyKeyof<Value>],
          undefined
        >
      ): Result;
    }

    export interface ObjectHandlerSingle<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
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
              Kind,
              Variant,
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends object,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Exclude<
      {
        [Key in keyof Value]: Child<
          Kind,
          Variant,
          Value,
          Key,
          Qualifier,
          "iterated"
        >;
      }[keyof Value],
      undefined
    >;

    //#endregion

    //#region Processor

    export type Mapper<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      ProcessorType extends Mapper.ResultType,
    > = ValueDef["read"] extends infer Value
      ? Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Mapper.Array<Kind, Variant, Value, Qualifier, ProcessorType>
          : never
        : Value extends Utils.Tuple
          ? Mapper.Tuple<Kind, Variant, Value, Qualifier, ProcessorType>
          : Value extends unknown[]
            ? Mapper.Array<Kind, Variant, Value, Qualifier, ProcessorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : Mapper.Object<Kind, Variant, Value, Qualifier, ProcessorType>
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
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends Utils.Tuple,
        Qualifier extends Atom.Qualifier.Constraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.TupleHandlerPair<
            Kind,
            Variant,
            Value,
            Qualifier,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.TupleHandlerSingle<
            Kind,
            Variant,
            Value,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Array

      export interface Array<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends Utils.ArrayConstraint,
        Qualifier extends Atom.Qualifier.Constraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ArrayHandler<
            Kind,
            Variant,
            Value,
            Qualifier,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;
      }

      // Object

      export interface Object<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends object,
        Qualifier extends Atom.Qualifier.Constraint,
        ProcessorType extends Mapper.ResultType,
      > {
        <Result>(
          callback: Collection.ObjectHandlerPair<
            Kind,
            Variant,
            Value,
            Qualifier,
            CallbackResult<ProcessorType, Result>
          >,
        ): Mapper.Result<ProcessorType, Result>;

        <Result>(
          callback: Collection.ObjectHandlerSingle<
            Kind,
            Variant,
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      SelectorType extends Selector.Type,
    > = ValueDef["read"] extends infer Value
      ? Utils.IsReadonlyArray<Value> extends true
        ? Value extends Utils.ReadonlyArrayConstraint
          ? Selector.Array<Kind, Variant, Value, Qualifier, SelectorType>
          : undefined
        : Value extends Utils.Tuple
          ? Selector.Tuple<Kind, Variant, Value, Qualifier, SelectorType>
          : Value extends unknown[]
            ? Selector.Array<Kind, Variant, Value, Qualifier, SelectorType>
            : Value extends object
              ? Value extends Utils.BrandedPrimitive
                ? undefined
                : Selector.Object<Kind, Variant, Value, Qualifier, SelectorType>
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
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends Utils.Tuple,
        Qualifier extends Atom.Qualifier.Constraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.TupleHandlerPair<
            Kind,
            Variant,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<SelectorType, Collection.TupleItem<Kind, Variant, Value>>;

        (
          callback: Collection.TupleHandlerSingle<
            Kind,
            Variant,
            Value,
            unknown
          >,
        ): Result<SelectorType, Collection.TupleItem<Kind, Variant, Value>>;
      }

      // Array

      export interface Array<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends Utils.ArrayConstraint,
        Qualifier extends Atom.Qualifier.Constraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ArrayHandler<
            Kind,
            Variant,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<
          SelectorType,
          Child<Kind, Variant, Value, number, Qualifier, "iterated">
        >;
      }

      // Object

      export interface Object<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        Value extends object,
        Qualifier extends Atom.Qualifier.Constraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ObjectHandlerPair<
            Kind,
            Variant,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<
          SelectorType,
          Collection.ObjectItem<Kind, Variant, Value, Qualifier>
        >;

        (
          callback: Collection.ObjectHandlerSingle<
            Kind,
            Variant,
            Value,
            Qualifier,
            unknown
          >,
        ): Result<
          SelectorType,
          Collection.ObjectItem<Kind, Variant, Value, Qualifier>
        >;
      }
    }

    //#endregion

    export namespace Use {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Kind, Variant, ValueDef, Qualifier, Parent>
      >;

      export type Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = ValueDef["read"] extends infer Value
        ? Value extends object
          ? Value extends Utils.BrandedPrimitive
            ? undefined
            : () => Envelop<
                Kind,
                Variant,
                Atom.Def<Value>,
                Qualifier & { bound: true },
                Parent
              >
          : undefined
        : never;
    }
  }

  export type ForEachProp<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Mapper<Kind, Variant, ValueDef, Qualifier, "each">;

  export type MapProp<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Mapper<Kind, Variant, ValueDef, Qualifier, "map">;

  export type FindProp<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Selector<Kind, Variant, ValueDef, Qualifier, "find">;

  export type FilterProp<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Collection.Selector<Kind, Variant, ValueDef, Qualifier, "filter">;

  export namespace Insert {
    export type Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = ValueDef["read"] extends infer Value
      ? Value extends Utils.StaticArray
        ? undefined
        : Value extends unknown[]
          ? Fn<Kind, Variant, Value, Qualifier>
          : undefined
      : never;

    export interface Fn<
      Kind extends Flavor.Kind,
      Variant extends Flavor.Variant,
      Value extends unknown[],
      Qualifier extends Qualifier.Constraint,
    > {
      (
        index: number,
        value: Value[number],
      ): Envelop<
        Kind,
        Child.Variant<Variant, Value>,
        Atom.Def<Value[number]>,
        Child.Qualifier<Value, number, Qualifier>
      >;
    }
  }

  export namespace Push {
    export type Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
    > = ValueDef["read"] extends infer Value
      ? Value extends Utils.Tuple
        ? undefined
        : Value extends unknown[]
          ? Fn<Kind, Variant, Value, Qualifier>
          : undefined
      : never;

    export interface Fn<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends unknown[],
      Qualifier extends Atom.Qualifier.Constraint,
    > {
      (
        value: Value[number],
      ): Envelop<
        Kind,
        Child.Variant<Variant, Value>,
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Qualifier extends Qualifier.Constraint,
    > = Envelop<
      Kind,
      "immutable",
      Atom.Def<unknown>,
      Qualifier.Ref.Preserve<Qualifier> & { root: true }
    >;
  }

  //#endregion

  //#region $

  export namespace $ {
    export type Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
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
                    Child<Kind, Variant, Value, Key, Qualifier, "indexed">
                  >;
                }
            : Utils.Extends<Variant, "optional"> extends true
              ? never
              : undefined;
  }

  //#endregion

  //#region At

  export namespace At {
    export type Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value,
      Qualifier extends Qualifier.Constraint,
    > =
      | (Utils.HasNonObject<Value> extends true ? undefined : never)
      | (Utils.OnlyObject<Value> extends infer Value
          ? Fn<
              Kind,
              Variant,
              Utils.NonNullish<Value>,
              keyof Utils.NonNullish<Value>,
              Qualifier
            >
          : never);

    // WIP: This approach works for generic values, but breaks for unions:

    // export type Prop<
    //   Kind extends Atom.Flavor.Kind,
    // Variant extends Atom.Flavor.Variant,
    //   Value,
    // > = Value extends Utils.NonObject
    //   ? undefined
    //   : Fn<Kind, Variant, Value, keyof Value>;

    export interface Fn<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value,
      Key extends keyof Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > {
      <ArgKey extends Key>(
        key: ArgKey | Enso.SafeNullish<ArgKey>,
      ): Child<Kind, Variant, Value, ArgKey, Qualifier>;
    }

    export type Child<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value,
      Key extends keyof Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Key extends Key
      ? Atom.Child<Kind, Variant, Value, Key, Qualifier, "indexed">
      : never;
  }

  //#endregion

  //#region Try

  export type TryProp<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > =
    // TODO: Add self try option after figuring types variance
    // TrySelfFn<Kind, Variant, ValueDef, Qualifier, Parent> &


      | Utils.OnlyObject<ValueDef["read"]>
      | Utils.OnlyAny<ValueDef["read"]> extends infer Value
      ? Utils.IsNever<Value> extends false
        ? keyof Value extends infer Key extends keyof Value
          ? <ArgKey extends Key>(
              key: ArgKey | Enso.SafeNullish<ArgKey>,
            ) =>
              | TryChild<Kind, Variant, Value, ArgKey, Qualifier>
              | (Utils.HasNonObject<ValueDef["read"]> extends true
                  ? undefined
                  : never)
          : never
        : never // {}
      : never;

  export type TryChild<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    Value,
    Key extends keyof Utils.NonNullish<Value>,
    Qualifier extends Atom.Qualifier.Constraint,
  > = Key extends Key
    ?
        | TryEnvelop<
            Kind,
            Variant,
            Utils.NonNullish<Value>[Key],
            Child.Qualifier<Value, Key, Qualifier>
          >
        // Add undefined if the key is not static (i.e. a record key).
        | (Utils.Or<
            Utils.IsStaticKey<Utils.NonNullish<Value>, Key>,
            Utils.IsAny<Value>
          > extends true
            ? never
            : undefined)
    : never;

  export type TryEnvelop<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    Value,
    Qualifier extends Atom.Qualifier.Constraint,
  > =
    // Add null to the union
    | (null extends Value ? null : never)
    // Add undefined to the union
    | (undefined extends Value ? undefined : never)
    // Resolve branded field without null or undefined
    | Atom.Envelop<
        Kind,
        Child.Variant<Variant, Value>,
        Atom.Def<Utils.NonNullish<Value>>,
        Qualifier & { tried: true }
      >;

  export interface TrySelfFn<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > {
    (): TrySelfResult<Kind, Variant, ValueDef, Qualifier, Parent>;
  }

  export type TrySelfResult<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > = ValueDef["read"] extends infer Value
    ? Utils.IsAny<Value> extends true
      ? any
      : // Add null to the union
        | (null extends Value ? null : never)
          // Add undefined to the union
          | (undefined extends Value ? undefined : never)
          // Resolve branded field without null or undefined
          | Atom.Envelop<
              Kind,
              Variant,
              Atom.Def<Utils.NonNullish<Value>>,
              Qualifier & { tried: true },
              Parent
            >
    : never;

  //#endregion

  //#region Lookup

  export namespace Lookup {
    export type Result<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Envelop<
      Kind,
      Lookup.Variant<Variant>,
      Def<unknown>,
      Lookup.Qualifier<Qualifier>,
      never
    >;

    export type Variant<Variant extends Atom.Flavor.Variant> =
      Utils.Extends<Variant, "exact"> extends true
        ? "exact"
        : Utils.Extends<Variant, "base"> extends true
          ? "exact"
          : Variant;

    export type Qualifier<Qualifier extends Atom.Qualifier.Constraint> =
      Qualifier.Ref.Preserve<Qualifier>;
  }

  //#endregion

  //#endregion

  //#region Events

  export type Unwatch = () => void;

  //#region Watch

  export namespace Watch {
    export type Callback<ValueDef extends Def.Constraint> = Bare.Callback<
      ValueDef["read"]
    >;

    export namespace Use {
      export type Prop<
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
      > = Qualifier.Ref.DisableFor<Qualifier, Fn<ValueDef>>;

      export interface Fn<ValueDef extends Def.Constraint> {
        (callback: Watch.Callback<ValueDef>, deps: DependencyList): Unwatch;
      }
    }

    export namespace Bare {
      export interface Callback<ValueType> {
        (value: ValueType, event: ChangesEvent): void;
      }
    }
  }

  //#endregion

  //#region Events

  export namespace Events {
    export type Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Qualifier.Ref.DisableFor<Qualifier, EventsTree<Kind>>;
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
    export interface Callback<Value, Result> {
      (value: Value): Result;
    }

    export namespace Use {
      export type Prop<
        ValueDef extends Def.Constraint,
        Qualifier extends Qualifier.Constraint,
      > = Qualifier.Ref.DisableFor<Qualifier, Fn<ValueDef>>;

      export interface Fn<ValueDef extends Def.Constraint> {
        <Result>(
          callback: Callback<ValueDef["read"], Result>,
          deps: DependencyList,
        ): Result;
      }
    }
  }

  //#endregion

  //#region Decompose

  export namespace Decompose {
    export interface Prop<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      (): Result<Kind, Variant, ValueDef, Qualifier, Parent>;
    }

    export type Result<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = ValueDef["read"] extends infer Value
      ?
          | (Value extends Value
              ? {
                  value: Value;
                  field: Envelop<
                    Kind,
                    Variant,
                    Atom.Def<Value>,
                    Qualifier,
                    Parent
                  >;
                }
              : never)
          // Add unknown option for the base and immutable variants
          | (Utils.Extends<Variant, "base"> extends true
              ? {
                  value: unknown;
                  field: Envelop<
                    Kind,
                    "base",
                    Atom.Def<unknown>,
                    Qualifier,
                    Parent
                  >;
                }
              : never)
      : never;

    export namespace Use {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Kind, Variant, ValueDef, Qualifier, Parent>
      >;

      export interface Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        (
          callback: Callback<ValueDef>,
          deps: DependencyList,
        ): Result<Kind, Variant, ValueDef, Qualifier, Parent>;
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Fn<Kind, Variant, ValueDef, Qualifier, Parent>;

    export interface Fn<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > {
      <Discriminator extends Discriminate.Discriminator<ValueDef>>(
        discriminator: Discriminator,
      ): Result<Kind, Variant, ValueDef, Discriminator, Qualifier, Parent>;
    }

    export type Discriminator<ValueDef extends Def.Constraint> =
      keyof Utils.NonUndefined<ValueDef["read"]>;

    export type Result<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Def.Constraint,
      Discriminator extends Discriminate.Discriminator<ValueDef>,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Inner<Kind, Variant, ValueDef, Discriminator, Qualifier, Parent>;

    export type Inner<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
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
                          Kind,
                          Variant,
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
                    field: Envelop<
                      Kind,
                      Variant,
                      Atom.Def<Value>,
                      Qualifier,
                      Parent
                    >;
                  }
              : never)
          // Add unknown option for the base and immutable variants
          | (Utils.Extends<Variant, "base"> extends true
              ? {
                  discriminator: unknown;
                  field: Envelop<
                    Kind,
                    "base",
                    Atom.Def<unknown>,
                    Qualifier,
                    Parent
                  >;
                }
              : never)
      : never;

    export namespace Use {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Kind, Variant, ValueDef, Qualifier, Parent>
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
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      ComputedValue,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<ValueDef>,
    > = Atom.Envelop<
      Kind,
      Variant,
      Atom.Def<ComputedValue>,
      Proxy.Qualifier<ValueDef>,
      Parent
    >;

    export namespace Into {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Into.Fn<Kind, Variant, ValueDef, Qualifier, Parent>;

      export interface Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        <ComputedValue>(
          intoMapper: Into.Mapper<ValueDef, ComputedValue>,
        ): Result<Kind, Variant, ValueDef, ComputedValue, Qualifier, Parent>;
      }

      export interface Mapper<ValueDef extends Def.Constraint, ComputedValue> {
        (value: ValueDef["read"]): ComputedValue;
      }

      export interface Result<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        ComputedValue,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > {
        from: From.Fn<
          Kind,
          Variant,
          ValueDef,
          ComputedValue,
          Qualifier,
          Parent
        >;
      }

      export namespace Use {
        export type Prop<
          Kind extends Atom.Flavor.Kind,
          Variant extends Atom.Flavor.Variant,
          ValueDef extends Atom.Def.Constraint,
          Qualifier extends Atom.Qualifier.Constraint,
          Parent extends Atom.Parent.Constraint<ValueDef>,
        > = Qualifier.Ref.DisableFor<
          Qualifier,
          Fn<Kind, Variant, ValueDef, Qualifier, Parent>
        >;
        // > = Exact.OnlyFor<
        //   Flavor,
        //   Qualifier.Ref.DisableFor<
        //     Qualifier,
        //     Fn<Kind, Variant, ValueDef, Qualifier, Parent>
        //   >
        // >;

        export interface Fn<
          Kind extends Atom.Flavor.Kind,
          Variant extends Atom.Flavor.Variant,
          ValueDef extends Atom.Def.Constraint,
          Qualifier extends Atom.Qualifier.Constraint,
          Parent extends Atom.Parent.Constraint<ValueDef>,
        > {
          <ComputedValue>(
            intoMapper: Proxy.Into.Mapper<ValueDef, ComputedValue>,
            deps: DependencyList,
          ): Result<Kind, Variant, ValueDef, ComputedValue, Qualifier, Parent>;
        }

        export interface Result<
          Kind extends Atom.Flavor.Kind,
          Variant extends Atom.Flavor.Variant,
          ValueDef extends Atom.Def.Constraint,
          ComputedValue,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
        > {
          from: Proxy.From.Use.Fn<
            Kind,
            Variant,
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
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        ComputedValue,
        Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
        Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
      > {
        <MappedValue extends ValueDef["read"]>(
          fromMapper: Mapper<ValueDef, ComputedValue, MappedValue>,
        ): Envelop<Kind, Variant, ValueDef, ComputedValue, Qualifier, Parent>;
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
          Kind extends Atom.Flavor.Kind,
          Variant extends Atom.Flavor.Variant,
          ValueDef extends Atom.Def.Constraint,
          ComputedValue,
          Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
          Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
        > {
          <MappedValue extends ValueDef["read"]>(
            fromMapper: Mapper<ValueDef, ComputedValue, MappedValue>,
            deps: DependencyList,
          ): Envelop<Kind, Variant, ValueDef, ComputedValue, Qualifier, Parent>;
        }
      }
    }
  }

  //#endregion

  //#region Defined

  export namespace Defined {
    export interface FnString<
      Kind extends Atom.Flavor.Kind,
      Variant extends Atom.Flavor.Variant,
      Value extends string | Utils.Nullish,
      Qualifier extends Atom.Qualifier.Constraint,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > {
      (
        to: "string",
      ): Envelop<Kind, Variant, Atom.Def<string>, Qualifier, Parent>;
    }

    export namespace Use {
      export type Prop<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = Qualifier.Ref.DisableFor<
        Qualifier,
        Fn<Kind, Variant, ValueDef, Qualifier, Parent>
      >;

      export type Fn<
        Kind extends Atom.Flavor.Kind,
        Variant extends Atom.Flavor.Variant,
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
        Parent extends Atom.Parent.Constraint<ValueDef>,
      > = ValueDef["read"] extends infer Value
        ? Utils.IsNever<Extract<Value, string>> extends false
          ? Value extends string | Utils.Nullish
            ? FnString<Kind, Variant, Value, Qualifier, Parent>
            : undefined
          : never
        : never;
    }
  }

  //#endregion

  //#endregion

  //#region Hooks

  export namespace Hooks {
    export type Result<
      Enable extends boolean | undefined,
      Type,
    > = Enable extends true | undefined ? Type : undefined;
  }

  //#endregion
}

namespace AtomPrivate {
  export declare const immutablePhantom: unique symbol;
  export declare const qualifierPhantom: unique symbol;
  export declare const variantPhantom: unique symbol;
  export declare const valueExactPhantom: unique symbol;
  export declare const parentPhantom: unique symbol;
}
