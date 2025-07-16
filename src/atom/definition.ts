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
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
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

  //#endregion Static

  //#region Instance

  constructor(value: Value, parent?: Atom.Parent.Def<Type, Parent>);

  deconstruct(): void;

  //#endregion Instance

  //#region Phantoms

  [AtomPrivate.immutableInvariantPhantom]: Atom.Immutable.Phantom<Type, Value>;

  [AtomPrivate.qualifiersPhantom](): Atom.Qualifier.Map<Qualifier>;

  [AtomPrivate.valueInvariantPhantom]: Atom.Value.Phantom<
    Type,
    Value,
    Qualifier,
    Parent
  >;

  [AtomPrivate.parentInvariantPhantom]: Atom.Parent.Phantom<Value, Parent>;

  //#endregion

  //#region Attributes

  readonly id: string;

  //#endregion Attributes

  //#region Value

  get value(): Atom.Value.Prop<Value>;

  useValue(): Atom.Value<Value>;

  compute: Atom.Compute.Prop<Value>;

  useCompute: Atom.Compute.UseProp<Value>;

  set: Atom.Set.Prop<Type, Value, Qualifier, Parent>;

  get lastChanges(): FieldChange;

  //#endregion Value

  //#region Type

  get _(): Atom.Value.Envelop<Type, Value>;

  size: Atom.SizeProp<Value>;

  remove: Atom.RemoveProp<Type, Value>;

  forEach: Atom.ForEachProp<Type, Value>;

  map: Atom.MapProp<Type, Value>;

  find: Atom.FindProp<Type, Value>;

  filter: Atom.FilterProp<Type, Value>;

  useCollection: Atom.UseCollectionProp<Type, Value, Qualifier, Parent>;

  insert: Atom.Insert.Prop<Type, Value, Qualifier, Parent>;

  push: Atom.Push.Prop<Type, Value, Qualifier, Parent>;

  //#endregion Type

  //#region Tree

  get root(): Atom.Root<Type>;

  get parent(): Atom.Parent.Prop<Type, Value, Parent>;

  get key(): string;

  get $(): Atom.$Prop<Type, Value>;

  at: Atom.AtProp<Type, Value>;

  try: Atom.TryProp<Type, Value>;

  get path(): string[];

  get name(): string;

  self: Utils.CovariantifyProperty<
    Atom.Invariant.Self<Type, Value, Qualifier, Parent>
  >;

  //#endregion Tree

  //#region Events

  eventsTree: EventsTree<Extract<Type, Atom.Shell>>;

  watch(callback: Atom.Watch.Callback<Value>): Atom.Unwatch;

  useWatch(
    callback: Atom.Watch.Callback<Value>,
    deps: DependencyList,
  ): Atom.Unwatch;

  trigger(changes: FieldChange, notifyParents?: boolean): void;

  //#endregion Events

  //#region Transform

  decompose: Atom.Decompose.Prop<Type, Value, Qualifier, Parent>;

  useDecompose: Atom.Decompose.Use.Prop<Type, Value, Qualifier, Parent>;

  discriminate: Atom.Discriminate.Prop<Type, Value, Qualifier, Parent>;

  useDiscriminate: Atom.Discriminate.Prop<Type, Value, Qualifier, Parent>;

  into: Atom.Proxy.Into.Prop<Type, Value, Qualifier, Parent>;

  useInto: Atom.Proxy.Into.Use.Prop<Type, Value, Qualifier, Parent>;

  useDefined: Atom.Defined.Prop<Type, Value, Qualifier, Parent>;

  //#endregion Transform
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
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    >(
      value: Value,
      parent?: Parent.Def<Type, Parent>,
    ): Envelop<Type, Value, Qualifier, Parent>;

    common<Envelop extends Atom.Common.Envelop<Type, unknown>>(
      atom: Envelop,
    ): Atom.Common.Join<Type, Envelop>;
  }

  //#endregion

  //#region Shell

  // WIP: Try to find a better name for this type, so region can be more precise.
  export type Type = Shell | Variant;

  export type Shell = "state" | "field";

  export type Variant = "immutable" | "common" | "invariant";

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
      ? "invariant"
      : Type extends Variant
        ? Type
        : never;

  export type SelfEnvelop<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > = "invariant" extends Type
    ? Invariant.Self<Type, Value, Qualifier, Parent>
    : "common" extends Type
      ? Common.Self<Type, Value, Qualifier, Parent>
      : Immutable.Self<Type, Value, Qualifier, Parent>;

  //#endregion Shell

  //#region Qualifier

  export type Qualifier =
    | "root"
    | "detachable"
    | "tried"
    | "bound"
    | Proxy.Qualifier<unknown>;

  export namespace Qualifier {
    export type Default = never;

    export type Map<Qualifier extends Atom.Qualifier = never> =
      Utils.NeverDefault<
        MapChunk<Qualifier, "root"> &
          MapChunk<Qualifier, "detachable"> &
          MapChunk<Qualifier, "tried"> &
          MapChunk<Qualifier, "bound"> &
          (Qualifier extends Proxy.Qualifier<infer SourceValue>
            ? { proxy: SourceValue }
            : {}),
        {}
      >;

    export type MapChunk<
      // WIP: Try to make it reusable this inside Ref
      Qualifier extends Atom.Qualifier,
      TestQualifier extends keyof any,
    > = TestQualifier extends Qualifier
      ? {
          [Key in TestQualifier]: true;
        }
      : {};
  }

  //#endregion Qualifier

  //#region Parent

  export namespace Parent {
    export type Default = never;

    export type Phantom<ChildValue, Parent extends Constraint<ChildValue>> =
      Utils.IsNever<Parent> extends true ? unknown : { parent: Parent };

    export type Envelop<Type extends Atom.Type, ParentValue> = Atom.Envelop<
      Exclude<Type, Variant> | "immutable",
      Utils.IsNever<ParentValue> extends true ? any : ParentValue
    >;

    export type Prop<
      Type extends Atom.Type,
      ChildValue,
      Parent extends Atom.Parent.Constraint<ChildValue>,
    > = Def<
      Type,
      Utils.IsNever<Parent> extends true ? Interface<any, any> : Parent
    >;

    export type Def<
      Type extends Atom.Type,
      Parent extends Atom.Parent.Constraint<any>,
    > =
      Parent extends Interface<infer ParentValue, infer Key>
        ?
            | Parent.Direct<Type, ParentValue, Key>
            | Parent.Source<Type, ParentValue>
        : never;

    export interface Direct<
      Type extends Atom.Type,
      ParentValue,
      Key extends keyof ParentValue,
    > {
      field: Envelop<Type, ParentValue>;
      key: Key;
    }

    export interface Interface<ParentValue, Key extends keyof ParentValue> {
      value: ParentValue;
      key: Key;
    }

    export interface Source<Type extends Atom.Type, ParentValue> {
      source: Envelop<Type, ParentValue>;
    }

    export type Constraint<ChildValue> = Type<Interface<any, any>, ChildValue>;

    export type Type<ParentInterface, ChildValue> =
      ParentInterface extends Interface<infer ParentValue, infer Key>
        ? ChildValue extends ParentValue[Key]
          ? ParentInterface
          : never
        : never;
  }

  //#endregion Parent

  //#region Child

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

  export type ChildQualifier<Value, Key extends keyof Utils.NonNullish<Value>> =
    Utils.IsStaticKey<Value, Key> extends true
      ? Utils.IsOptionalKey<Value, Key> extends true
        ? "detachable"
        : never
      : "detachable";

  export type Child<
    Type extends Atom.Type,
    ParentValue,
    Key extends keyof ParentValue,
  > = Envelop<
    Child.Type<Type>,
    Child.Value<ParentValue, Key>,
    Child.Qualifier<ParentValue, Key>
  >;

  export namespace Child {
    export type Every<
      Type extends Atom.Type,
      ParentValue,
      Key extends keyof ParentValue,
    > = Key extends Key
      ? Atom.Every<
          Child.Type<Type>,
          Child.Value<ParentValue, Key>,
          Child.Qualifier<ParentValue, Key>
        >
      : never;

    export type Type<Type extends Atom.Type> =
      | Extract<Type, Shell>
      | (ExtractVariant<Type> extends infer Variant extends Atom.Variant
          ? Variant extends "common"
            ? "invariant"
            : Variant
          : never);

    export type Value<ParentValue, ParentKey extends keyof ParentValue> =
      | ParentValue[ParentKey]
      | (Utils.IsStaticKey<ParentValue, ParentKey> extends true
          ? never
          : undefined);

    export type Qualifier<
      ParentValue,
      ParentKey extends keyof Utils.NonNullish<ParentValue>,
    > =
      Utils.IsStaticKey<ParentValue, ParentKey> extends true
        ? Utils.IsOptionalKey<ParentValue, ParentKey> extends true
          ? "detachable"
          : never
        : "detachable";
  }

  //#endregion Child

  //#region Interface

  //#region Invariant

  export interface Invariant<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Common<Type, Value, Qualifier, Parent> {
    //#region Value

    set: Set.Prop<Type, Value, Qualifier, Parent>;

    // NOTE: The purpose of this is to cause invariance and break compatibility
    // with subtypes.
    [AtomPrivate.valueInvariantPhantom]: Atom.Value.Phantom<
      Type,
      Value,
      Qualifier,
      Parent
    >;

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

  export namespace Invariant {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Type> extends "state"
        ? State.Invariant<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Invariant<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Common.Self<Type, Value, Qualifier> {
      remove: Atom.Self.RemoveProp<Type, Value, Qualifier, Parent>;
    }
  }

  //#endregion Invariant

  //#region Common

  export interface Common<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends Immutable<Type, Value, Qualifier, Parent> {}

  export namespace Common {
    export type Envelop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > =
      ExtractShell<Type> extends "state"
        ? State.Common<Value, Qualifier, Parent>
        : ExtractShell<Type> extends "field"
          ? Field.Common<Value, Qualifier, Parent>
          : never;

    export interface Self<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Immutable.Self<Type, Value, Qualifier, Parent> {}

    export type Join<
      Type extends Atom.Type,
      Envelop extends Atom.Common.Envelop<Type, any>,
    > = Atom.Common.Envelop<
      Type,
      Common.Value<Envelop>,
      Common.Qualifier<Envelop>
    >;

    export type Value<Envelop extends Atom.Envelop<any, any>> =
      Envelop extends Atom.Envelop<any, infer Value> ? Value : never;

    export type Qualifier<Envelop extends Atom.Envelop<any, any>> =
      Qualifier.Common<Envelop>;

    export namespace Qualifier {
      export type Common<
        Envelop,
        Qualifier = All<Envelop>,
      > = Qualifier extends string
        ? IsCommon<Qualifier, Envelop> extends true
          ? Qualifier
          : never
        : never;

      export type All<Envelop> =
        Envelop extends Atom.Envelop<any, any, infer Qualifier>
          ? Qualifier
          : never;

      export type IsCommon<Qualifier, Envelop> =
        Envelop extends Atom.Envelop<any, any, infer EnvelopQualifier>
          ? Qualifier extends EnvelopQualifier
            ? true
            : false
          : false;
    }
  }

  //#endregion Common

  //#region Immutable

  export interface Immutable<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > {
    //#region Phantoms

    // NOTE: As immutable atoms never resolve invariant children like common,
    // we must manually provide phantom type to ensure proper variance between
    // them.
    [AtomPrivate.immutableInvariantPhantom]: Immutable.Phantom<Type, Value>;

    [AtomPrivate.qualifiersPhantom](): Atom.Qualifier.Map<Qualifier>;

    [AtomPrivate.parentInvariantPhantom]: Parent.Phantom<Value, Parent>;

    //#endregion Phantoms

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

    //#region Type

    _: Value.Envelop<Type, Value>;

    //#endregion

    //#region Tree

    root: Root<Type>;

    parent: Parent.Prop<Type, Value, Parent>;

    readonly key: string;

    readonly path: string[];

    readonly name: string;

    $: $Prop<Type, Value>;

    at: AtProp<Type, Value>;

    try: Atom.TryProp<Type, Value>;

    self: Utils.CovariantifyProperty<SelfEnvelop<Type, Value, Qualifier>>;

    //#endregion

    //#region Type

    size: SizeProp<Value>;

    forEach: ForEachProp<Type, Value>;

    map: MapProp<Type, Value>;

    find: FindProp<Type, Value>;

    filter: FilterProp<Type, Value>;

    useCollection: UseCollectionProp<Type, Value, Qualifier, Parent>;

    //#endregion Type

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

    //#endregion Transform
  }

  export namespace Immutable {
    export type Phantom<Type extends Atom.Type, Value> = $Prop<
      Extract<Type, Shell> | "common",
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

  //#endregion Immutable

  //#endregion Interface

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
  }

  export namespace Set {
    export type Prop<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = "detachable" extends Qualifier
      ? Detachable<Type, Value, Qualifier, Parent>
      : Common<Type, Value, Qualifier, Parent>;

    export interface Common<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      <NewValue extends Value>(
        value: NewValue,
      ): Envelop<Type, NewValue, Qualifier, Parent>;
    }

    export interface Detachable<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier | "detachable" = never,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > extends Common<Type, Value, Qualifier, Parent> {
      (value: DetachedValue): Envelop<Type, DetachedValue, Qualifier, Parent>;
    }
  }

  export namespace Value {
    export interface Phantom<
      Type extends Atom.Type,
      Value,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > {
      (value: Value): Atom.Envelop<Type, Value, Qualifier, Parent>;
    }

    //#region WIP

    //#region Subtypes

    export type Envelop<Type, Value> = Type extends "state"
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
      forEach(callback: ArrayCallback<Type, Value>): void;

      find<Value extends unknown[]>(
        callback: ArrayCallback<Type, Value>,
      ): ArrayCallbackItem<Type, Value> | undefined;
    }

    export interface Tuple<Type extends Atom.Shell, Value extends Utils.Tuple>
      extends Collection<Type, Value> {}

    export interface Object<Type extends Atom.Shell, Value>
      extends Collection<Type, Value> {}

    //#endregion

    export type TupleCallbackPair<
      Shell extends Atom.Shell,
      Value extends Utils.Tuple,
      Result = void,
    > = (
      ...args: {
        [Key in Utils.IndexOfTuple<Value>]: [Child<Shell, Value, Key>, Key];
      }[Utils.IndexOfTuple<Value>]
    ) => Result;

    export type TupleCallbackSingle<
      Shell extends Atom.Shell,
      Value extends Utils.Tuple,
      Result = void,
    > = (item: TupleCallbackSingleItem<Shell, Value>) => Result;

    export type TupleCallbackSingleItem<
      Type extends Atom.Shell,
      Value extends Utils.Tuple,
    > =
      Utils.IndexOfTuple<Value> extends infer Key
        ? Key extends Key
          ? any
          : never
        : never;

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
        ? Atom.Envelop<Type, ItemValue, "detachable">
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

    //#endregion WIP
  }

  //#endregion Value

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

  //#endregion Remove

  //#region Collection

  export namespace Collection {
    //#region Handler

    // Readonly array

    export interface ReadonlyArrayHandler<
      Type extends Atom.Type,
      Value extends Utils.ReadonlyArrayConstraint,
      Result = void,
    > {
      (item: ReadonlyArrayItem<Type, Value>, index: number): Result;
    }

    export type ReadonlyArrayItem<
      Type extends Atom.Type,
      Value extends Utils.ReadonlyArrayConstraint,
    > = Envelop<ReadonlyArrayItemType<Type>, Value[number]>;

    export type ReadonlyArrayItemType<Type extends Atom.Type> =
      | Extract<Type, Shell>
      | (ExtractVariant<Type> extends infer Variant extends Atom.Variant
          ? Variant extends "immutable"
            ? "immutable"
            : "common"
          : never);

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
            Envelop<Child.Type<Type>, Value[Key]>,
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
      Value extends unknown[],
      Result = void,
    > {
      (item: ArrayItem<Type, Value>, index: number): Result;
    }

    export type ArrayItem<
      Type extends Atom.Type,
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
              Child<Type, Value, Key>,
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
          { [Key in keyof Value]: Child<Type, Value, Key> }[keyof Value],
          undefined
        >,
      ): Result;
    }

    export type ObjectItem<
      Type extends Atom.Type,
      Value extends object,
    > = Exclude<
      { [Key in keyof Value]: Child<Type, Value, Key> }[keyof Value],
      undefined
    >;

    //#endregion Handler

    //#region Processor

    export type Mapper<
      Type extends Atom.Type,
      Value,
      ProcessorType extends Mapper.ResultType,
    > = Value extends Utils.Tuple
      ? Mapper.Tuple<Type, Value, ProcessorType>
      : Value extends unknown[]
        ? Mapper.Array<Type, Value, ProcessorType>
        : Value extends object
          ? Mapper.Object<Type, Value, ProcessorType>
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

      export interface Array<
        Type extends Atom.Type,
        Value extends unknown[],
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
          ? Selector.ReadonlyArray<Type, Value, SelectorType>
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

      // Readonly Array

      export interface ReadonlyArray<
        Type extends Atom.Type,
        Value extends Utils.ReadonlyArrayConstraint,
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ReadonlyArrayHandler<Type, Value, unknown>,
        ): Result<SelectorType, Collection.ReadonlyArrayItem<Type, Value>>;
      }

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
        Value extends unknown[],
        SelectorType extends Selector.Type,
      > {
        (
          callback: Collection.ArrayHandler<Type, Value, unknown>,
        ): Result<SelectorType, Collection.ArrayItem<Type, Value>>;
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

    //#endregion Selector
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
        index: number,
        value: Value[number],
      ): Envelop<
        Child.Type<Type>,
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
        Child.Type<Type>,
        Value[number],
        Child.Qualifier<Value, number>
      >;
    }
  }

  //#endregion

  //#endregion Type

  //#region Tree

  export type Root<Type extends Atom.Type> = Envelop<
    Exclude<Type, Variant> | "immutable",
    unknown,
    "root"
  >;

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

  //#endregion

  //#region At

  export type AtProp<
    Type extends Atom.Type,
    Value,
  > = keyof Value extends infer Key extends keyof Value
    ? At<Type, Value, Key>
    : never;

  export interface At<Type extends Atom.Type, Value, Key extends keyof Value> {
    <ArgKey extends Key>(
      key: ArgKey,
    ): Envelop<
      ChildType<Type>,
      ChildValue<Value, ArgKey>,
      ChildQualifier<Value, ArgKey>
    >;
  }

  //#endregion

  //#region Try

  export type TryProp<
    Type extends Atom.Type,
    Value,
  > = keyof Value extends infer Key extends keyof Value
    ? <ArgKey extends Key>(key: ArgKey) => TryKey<Type, Value, ArgKey>
    : never;

  export type TryKey<
    Type extends Atom.Type,
    Value,
    Key extends keyof Utils.NonNullish<Value>,
  > =
    | TryAtom<Type, Utils.NonNullish<Value>[Key], ChildQualifier<Value, Key>>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<Utils.NonNullish<Value>, Key> extends true
        ? never
        : undefined);

  export type TryAtom<
    Type extends Atom.Type,
    Value,
    ChildQualifier extends Atom.Qualifier,
  > =
    // Add null to the union
    | (null extends Value ? null : never)
    // Add undefined to the union
    | (undefined extends Value ? undefined : never)
    // Resolve branded field without null or undefined
    | Envelop<
        ChildType<Type>,
        Utils.NonNullish<Value>,
        ChildQualifier | "tried"
      >;

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

  //#endregion Compute

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
          ? // WIP: Why can't I use `Item` here?
            {
              value: Value;
              field: Envelop<Type, Value, Qualifier, Parent>;
            }
          : never)
      // Add unknown option for the common and immutable variants
      | (Type extends (infer Shell extends Atom.Shell) | infer Variant
          ? Variant extends "common" | "immutable"
            ? Item<Shell | Variant, unknown, Qualifier, Parent>
            : never
          : never);

    export interface Item<
      Type extends Atom.Type,
      ItemValue,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ItemValue> = Atom.Parent.Default,
    > {
      value: ItemValue;
      field: Envelop<Type, ItemValue, Qualifier, Parent>;
    }

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
      // Add unknown option for the common and immutable variants
      | (Type extends (infer Shell extends Atom.Shell) | infer Variant
          ? Variant extends "common" | "immutable"
            ? {
                discriminator: unknown;
                field: Envelop<Shell | Variant, unknown, Qualifier, Parent>;
              }
            : never
          : never);
  }

  //#endregion Discriminate

  //#region Proxy

  export namespace Proxy {
    export interface Qualifier<SourceValue> {
      source: SourceValue;
      // source(value: SourceValue): void;
      // source(): SourceValue;
    }

    export type Envelop<
      Type extends Atom.Type,
      Value,
      ComputedValue,
      Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
    > = Atom.Envelop<
      Type,
      ComputedValue,
      Qualifier | Proxy.Qualifier<Value>,
      Parent
    >;

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

  //#endregion Proxy

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

  //#endregion Transform
}

namespace AtomPrivate {
  export declare const immutableInvariantPhantom: unique symbol;
  export declare const qualifiersPhantom: unique symbol;
  export declare const valueInvariantPhantom: unique symbol;
  export declare const parentInvariantPhantom: unique symbol;
}
