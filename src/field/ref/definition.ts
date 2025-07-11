import { Atom } from "../../atom/index.js";
import { AtomRef } from "../../atom/ref/index.js";
import { AsState } from "../../state/index.ts";
import { Enso } from "../../types.ts";
import { EnsoUtils as Utils } from "../../utils.ts";
import { AsCollection, AsCollectionRead } from "../collection/index.ts";
import { FieldOld } from "../definition.tsx";
import { staticImplements } from "../util.ts";
import type { FieldRefGhost } from "./ghost/definition.ts";

const refHintSymbol = Symbol();

export declare class FieldRef<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  >
  extends AtomRef<"field" | "ref", Value, Qualifier, ParentValue>
  implements FieldRef.Interface<Value, Qualifier, ParentValue>
{
  //#region Instance

  [refHintSymbol]: true;

  constructor(atom: Atom.Envelop<"field", Value, Qualifier, ParentValue>);

  //#endregion Instance
}

export namespace FieldRef {
  //#region Shell

  export type Envelop<
    Type extends AtomRef.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  > = Type extends "ref"
    ? FieldRef<Utils.NonNullish<Value>, Qualifier, ParentValue>
    : Type extends "ref-ghost"
      ? FieldRefGhost<Utils.NonNullish<Value>, Qualifier, ParentValue>
      : never;

  //#endregion Shell

  //#region Interface

  export interface Interface<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"field", Value> = unknown,
  > extends Hint,
      AtomRef.Interface<"field" | "ref", Value, Qualifier, Parent> {}

  export interface Hint {
    [refHintSymbol]: true;
  }

  //#endregion Interface
}

/**
 * @internal
 * Map maintaining stable references to fields. It is prevent creating new
 * `FieldRef` instances for the same fields.
 */
// TODO: Test if reducing number of allocations is actually worth the memory hit.
const fieldRefsStore = new WeakMap<FieldOld<any>, FieldRefOld<any>>();

const refHintSymbolOld = Symbol();

/**
 * Reference to a field that protects the field's value from being changed. It
 * allows to change the metadata of the field, such as validation errors, but
 * never the value.
 */
@staticImplements<AsCollectionRead>()
// TODO: Try making this work or remove:
// Static<typeof FieldRef<unknown>, AsCollectionRead>,
export class FieldRefOld<Payload> implements FieldRefOld.Hint {
  static get<Payload>(field: FieldOld<Payload>): FieldRefOld<Payload> {
    // @ts-ignore: TODO:
    let ref: any = fieldRefsStore.get(field);
    if (!ref) {
      // @ts-ignore: TODO:
      ref = new FieldRefOld(field);
      // @ts-ignore: TODO:
      fieldRefsStore.set(field, ref);
    }
    return ref;
  }

  [refHintSymbolOld] = true as const;

  #field: FieldOld<Payload>;

  static every<FieldType extends FieldOld.Hint>(
    field: FieldType,
  ): Enso.TransferBrands<
    FieldRefOld<FieldOld.EveryValueUnion<FieldType>>,
    FieldType
  > {
    return new FieldRefOld(field as any) as any;
  }

  constructor(external: FieldOld<Payload>) {
    this.#field = external;
  }

  //#region Value

  get(): Payload {
    return this.#field.get();
  }

  //#endregion

  //#region Tree

  $ = new Proxy({} as FieldRefOld.$Object<Payload>, {
    get: (_, key: string) => this.at(key as keyof Payload),
  });

  at<Key extends keyof Payload>(key: Key): FieldRefOld.At<Payload, Key> {
    // @ts-ignore: TODO:
    return FieldRefOld.get(this.#field.at(key));
  }

  try(): Enso.TryUnion<FieldRefOld.InterfaceDef<Payload>>;

  try<Key extends keyof Utils.NonNullish<Payload>>(
    key: Key,
  ): FieldRefOld.TryKey<FieldOld.InterfaceDef<Payload>, Key>;

  try(...[key]: any[]): any {
    const field = this.#field.try(key);
    return field && FieldRefOld.get(field);
  }

  maybe(): MaybeFieldRefOld<Payload> {
    return new MaybeFieldRefOld({ type: "direct", field: this.#field });
  }

  //#endregion

  //#region Map

  decompose(): FieldRefOld.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as FieldRefOld.Decomposed<Payload>;
  }

  discriminate<Discriminator extends keyof Utils.NonUndefined<Payload>>(
    discriminator: Discriminator,
  ): FieldRefOld.Discriminated<Payload, Discriminator> {
    // @ts-ignore: TODO:
    return {
      // @ts-ignore: TODO:
      discriminator: this.$[discriminator]?.get(),
      field: this,
    };
  }

  //#endregion

  //#region Errors

  addError(error: FieldOld.Error | string): void {
    this.#field.addError(error);
  }

  //#endregion

  //#region Collection

  static asCollection<Value>(
    field: FieldRefOld<Value>,
  ): AsCollection.Result<Value> {
    return FieldOld.asCollection(field.#field);
  }

  static asArray<Value>(
    field: FieldRefOld<Value>,
  ): AsCollection.AsArrayResult<Value> {
    return FieldOld.asArray(field.#field);
  }

  static asObject<Value>(
    field: FieldRefOld<Value>,
  ): AsCollection.AsObjectResult<Value> {
    return FieldOld.asObject(field.#field);
  }

  static asChild<Value>(
    field: FieldRefOld<Value>,
  ): AsCollection.AsChildResult<Value> {
    return FieldOld.asChild(field.#field);
  }

  static asState<Value>(
    field: FieldRefOld<Value>,
  ): AsState.ReadWriteResult<Value> | undefined {
    return FieldOld.asState(field.#field);
  }

  static fromField<Value>(
    field: FieldOld<Value> | undefined,
  ): FieldRefOld<Value> | undefined {
    return field && FieldRefOld.get(field);
  }

  //#endregion
}

export namespace FieldRefOld {
  //#region Interfaces

  export interface Hint {
    [refHintSymbolOld]: true;
  }

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: FieldRefOld<unknown>;
    NonNullish: FieldRefOld<Utils.NonNullish<Payload>>;
    Bound: unknown;
  };

  //#endregion

  //#region Properties

  export type Detachable<Value> = Enso.Detachable<FieldRefOld<Value>>;

  export type Tried<Value> = Enso.Tried<FieldRefOld<Value>>;

  export type Bound<Value> = Enso.Bound<FieldRefOld<Value>>;

  export type Branded<Value, Flags extends Enso.Flags> = Enso.Branded<
    FieldRefOld<Value>,
    Flags
  >;

  //#endregion

  //#region Tree

  export type $Object<Payload> = {
    [Key in keyof Payload]-?: FieldRefOld<
      Utils.IsStaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type At<Payload, Key extends keyof Payload> = FieldRefOld<
    AtPayload<Payload, Key>
  >;

  export type AtPayload<Payload, Key extends keyof Payload> =
    Utils.IsStaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined;

  export type TryKey<
    Def extends Enso.InterfaceDef,
    Key extends keyof Utils.NonNullish<Def["Payload"]>,
  > =
    | Enso.TryUnion<InterfaceDef<Utils.NonNullish<Def["Payload"]>[Key]>>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<Utils.NonNullish<Def["Payload"]>, Key> extends true
        ? never
        : undefined);

  //#endregion

  //#region Type

  export type Every<Value> =
    // Handle boolean separately, so it doesn't produce FieldRef<true> | FieldRef<false>
    | (boolean extends Value ? FieldRefOld<boolean> : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? FieldRefOld<Value>
          : never
        : never);

  export type EveryValueUnion<FieldType> =
    FieldType extends FieldRefOld<infer Value> ? Value : never;

  export type DiscriminateResult<
    FieldType,
    Discriminator extends keyof Utils.NonUndefined<EveryValueUnion<FieldType>>,
  > = DiscriminatedInner<EveryValueUnion<FieldType>, FieldType, Discriminator>;

  export type Discriminated<
    Value,
    Discriminator extends keyof Utils.NonUndefined<Value>,
    Flags extends Enso.Flags | undefined = undefined,
  > = DiscriminatedInner<Value, Value, Discriminator, Flags>;

  export type DiscriminatedInner<
    Payload,
    BrandsSource,
    Discriminator extends keyof Utils.NonUndefined<Payload>,
    Flags extends Enso.Flags | undefined = undefined,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: Enso.Branded<
                Enso.TransferBrands<FieldRefOld<Payload>, BrandsSource>,
                Flags
              >;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: Enso.Branded<
            Enso.TransferBrands<FieldRefOld<Payload>, BrandsSource>,
            Flags
          >;
        }
    : never;

  export type DiscriminatorFor<FieldType> = keyof Utils.NonUndefined<
    EveryValueUnion<FieldType>
  >;

  //#endregion

  //#region Transform

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: FieldRefOld<Payload>;
      }
    : never;

  //#endregion

  //#region Collection

  // Tuple

  // NOTE: We have to have two separate overloads for tuples
  // `CollectionCallbackTuplePair` and `CollectionCallbackTupleSingle` as with
  // the current approach binding the key and value in the arguments on the type
  // level, TypeScript fails to find the correct overload for when the callback
  // accepts a single argument (i.e. just the item field).

  export type CollectionCallbackTuplePair<
    Value extends Utils.Tuple,
    Result = void,
  > = (
    ...args: {
      [Key in Utils.IndexOfTuple<Value>]: [FieldRefOld<Value[Key]>, Key];
    }[Utils.IndexOfTuple<Value>]
  ) => Result;

  export type CollectionCallbackTupleSingle<
    Value extends Utils.Tuple,
    Result = void,
  > = (item: Every<Value[Utils.IndexOfTuple<Value>]>) => Result;

  // Array

  export type CollectionCallbackArray<
    Value extends Array<unknown>,
    Result = void,
  > = (item: CollectionCallbackArrayItem<Value>, index: number) => Result;

  export type CollectionCallbackArrayItem<Value extends Array<unknown>> =
    Value extends Array<infer Item> ? Detachable<Item> : never;

  // Object

  // NOTE: We have to have two separate overloads for objects
  // `CollectionCallbackObjectPair` and `CollectionCallbackObjectSingle` as with
  // the current approach binding the key and value in the arguments on the type
  // level, TypeScript fails to find the correct overload for when the callback
  // accepts a single argument (i.e. just the item field).

  export type CollectionCallbackObjectPair<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    ...args: Exclude<
      { [Key in keyof Value]: [FieldRefOld<Value[Key]>, Key] }[keyof Value],
      undefined
    >
  ) => Result;

  export type CollectionCallbackObjectSingle<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    item: Exclude<
      { [Key in keyof Value]: FieldRefOld<Value[Key]> }[keyof Value],
      undefined
    >,
  ) => Result;

  //

  export type ItemResultTuple<Value extends Utils.Tuple> = Every<
    Value[Utils.IndexOfTuple<Value>]
  >;

  export type ItemResultArray<Value extends unknown[]> = Detachable<
    Value[number]
  >;

  export type ItemResultObject<Value extends object> =
    // Remove undefined that sneaks in
    Exclude<
      // Use mapped type to preserve Type | undefined for optional fields
      { [Key in keyof Value]: FieldRefOld<Value[Key]> }[keyof Value],
      undefined
    >;

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | FieldRefOld<Payload>
    | (Payload extends Payload ? FieldRefOld<Payload> : never);

  //#endregion
}

//#region FieldRef Declarations

declare module "../collection/index.ts" {
  // `fieldEach`

  interface FieldEach {
    // Tuple

    <Value extends Utils.Tuple>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackTuplePair<Value>,
    ): void;

    <Value extends Utils.Tuple>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackTupleSingle<Value>,
    ): void;

    // Array

    <Value extends unknown[]>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackArray<Value>,
    ): void;

    // Object

    <Value extends object>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `fieldMap`

  interface FieldMap {
    // Tuple

    <Value extends Utils.Tuple, Result>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackTuplePair<Value, Result>,
    ): Result[];

    <Value extends Utils.Tuple, Result>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackTupleSingle<Value, Result>,
    ): Result[];

    // Array

    <Value extends unknown[], Result>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackArray<Value, Result>,
    ): Result[];

    // Object

    <Value extends object, Result>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }

  // `fieldSize`

  interface FieldSize {
    // Tuple/Array

    <Value extends Array<unknown>>(field: FieldRefOld<Value>): Value["length"];

    // Object

    <Value extends object>(field: FieldRefOld<Value>): number;
  }

  // `fieldFind`

  interface FieldFind {
    // Tuple

    <Value extends Utils.Tuple>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackTuplePair<Value, unknown>,
    ): FieldRefOld.ItemResultTuple<Value> | undefined;

    <Value extends Utils.Tuple>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackTupleSingle<Value, unknown>,
    ): FieldRefOld.ItemResultTuple<Value> | undefined;

    // Array

    <Value extends unknown[]>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackArray<Value, unknown>,
    ): FieldRefOld.ItemResultArray<Value> | undefined;

    // Object

    <Value extends object>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackObjectPair<Value, unknown>,
    ): FieldRefOld.ItemResultObject<Value> | undefined;

    <Value extends object>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackObjectSingle<Value, unknown>,
    ): FieldRefOld.ItemResultObject<Value> | undefined;
  }

  // `fieldFilter`

  interface FieldFilter {
    // Tuple

    <Value extends Utils.Tuple>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackTuplePair<Value, unknown>,
    ): FieldRefOld.ItemResultTuple<Value>[];

    <Value extends Utils.Tuple>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackTupleSingle<Value, unknown>,
    ): FieldRefOld.ItemResultTuple<Value>[];

    // Array

    <Value extends unknown[]>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      callback: FieldRefOld.CollectionCallbackArray<Value, unknown>,
    ): FieldRefOld.ItemResultArray<Value>[];

    // Object

    <Value extends object>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackObjectPair<Value, unknown>,
    ): FieldRefOld.ItemResultObject<Value>[];

    <Value extends object>(
      field: FieldRefOld<Value> | Utils.Nullish<Enso.Tried<FieldRefOld<Value>>>,
      predicate: FieldRefOld.CollectionCallbackObjectSingle<Value, unknown>,
    ): FieldRefOld.ItemResultObject<Value>[];
  }
}

declare module "../type/index.ts" {
  // `fieldDiscriminate`

  interface FieldDiscriminate {
    <
      FieldType extends FieldRefOld.Hint,
      Discriminator extends Utils.NonUndefined<
        FieldRefOld.DiscriminatorFor<FieldType>
      >,
    >(
      field: FieldType,
      discriminator: Discriminator,
    ): FieldRefOld.DiscriminateResult<FieldType, Discriminator>;
  }
}

//#endregion

const maybeRefHintSymbolOld = Symbol();

/**
 * Class representing maybe fields references. Unlike `FieldRef` representing
 * correct state of existing field, maybe field may not exist (e.g. act as
 * `number` while the value is actually `undefined`), or may represent incorrect
 * state (e.g. parent is a actually a `number` but was accessed as an object in
 * `number | { a?: string }`).
 */
@staticImplements<AsCollectionRead>()
// TODO: Try making this work or remove:
// Static<typeof MaybeFieldRef<unknown>, AsCollectionRead>,
export class MaybeFieldRefOld<Payload> implements MaybeFieldRefOld.Hint {
  #target: MaybeFieldRefOld.Target<Payload>;

  [maybeRefHintSymbolOld] = true as const;

  static every<FieldType extends FieldOld.Hint>(
    field: FieldType,
  ): Enso.TransferBrands<
    MaybeFieldRefOld<FieldOld.EveryValueUnion<FieldType>>,
    FieldType
  > {
    return new MaybeFieldRefOld({ type: "direct", field: field as any }) as any;
  }

  constructor(target: MaybeFieldRefOld.Target<Payload>) {
    this.#target = target;
  }

  //#region Maybe

  #targetPath(): Enso.Path {
    return this.#target.type === "direct"
      ? this.#target.field.path
      : [...this.#target.closest.path, ...this.#target.path];
  }

  #targetRoot(): FieldOld<any> {
    return this.#target.type === "direct"
      ? (this.#target.field.root as any)
      : (this.#target.closest.root as any);
  }

  //#endregion

  //#region Value

  get(): Payload {
    if (this.#target.type !== "direct") return undefined as Payload;
    return this.#target.field.get();
  }

  //#endregion

  //#region Tree

  at<Key extends keyof Utils.NonNullish<Payload>>(
    key: Key,
  ): MaybeFieldRefOld.At<Payload, Key> {
    // maybe<Key extends keyof Utils.NonNullish<Payload>>(
    //   key: Key,
    // ): MaybeFieldRef.Result<Payload, Key> {
    let target: MaybeFieldRefOld.Target<unknown>;
    if (this.#target.type === "direct") {
      const field = this.#target.field.at(key as any);
      target = field
        ? ({
            type: "direct",
            field,
          } as any)
        : { type: "shadow", closest: this.#target.field, path: [key] };
    } else {
      target = {
        type: "shadow",
        closest: this.#target.closest,
        path: [...this.#target.path, String(key)],
      };
    }

    // @ts-ignore: TODO:
    return new MaybeFieldRefOld(target);
  }

  try(): Enso.TryUnion<MaybeFieldRefOld.InterfaceDef<Payload>>;

  try<Key extends keyof Utils.NonNullish<Payload>>(
    key: Key,
  ): FieldOld.TryKey<MaybeFieldRefOld.InterfaceDef<Payload>, Key>;

  try(...[key]: any[]): any {
    // If it is a shadow field, there can't be anything to try.
    if (this.#target.type !== "direct") return;
    const field = this.#target.field.try(key);
    return field && FieldRefOld.get(field);
  }

  //#endregion

  //#region Map

  decompose(): MaybeFieldRefOld.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as MaybeFieldRefOld.Decomposed<Payload>;
  }

  //#endregion

  //#region Errors

  addError(error: FieldOld.Error | string): void {
    const path = this.#targetPath();
    const root = this.#targetRoot();

    // If there are any nested errors at this path, field is not valid.
    const wasValid = !root.validationTree.nested(path).length;
    const changes = FieldOld.errorChangesFor(wasValid);

    root.validationTree.add(path, FieldOld.normalizeError(error));
    root.eventsTree.trigger(path, changes);
  }

  //#endregion

  //#region Collection

  static asCollection<Value>(
    field: MaybeFieldRefOld<Value>,
  ): AsCollection.Result<Value> {
    // If it is a shadow field, there can't be anything to iterate.
    if (field.#target.type !== "direct") return;
    return FieldOld.asCollection(field.#target.field);
  }

  static asArray<Value>(
    field: MaybeFieldRefOld<Value>,
  ): AsCollection.AsArrayResult<Value> {
    // If it is a shadow field, there can't be anything to iterate.
    if (field.#target.type !== "direct") return;
    return FieldOld.asArray(field.#target.field);
  }

  static asObject<Value>(
    field: MaybeFieldRefOld<Value>,
  ): AsCollection.AsObjectResult<Value> {
    // If it is a shadow field, there can't be anything to access.
    if (field.#target.type !== "direct") return;
    return FieldOld.asObject(field.#target.field);
  }

  static asChild<Value>(
    field: MaybeFieldRefOld<Value>,
  ): AsCollection.AsChildResult<Value> {
    // If it is a shadow field, there can't be anything to access.
    if (field.#target.type !== "direct") return;
    return FieldOld.asChild(field.#target.field);
  }

  static asState<Value>(
    field: MaybeFieldRefOld<Value>,
  ): AsState.ReadWriteResult<Value> | undefined {
    // If it is a shadow field, there can't be anything to access.
    if (field.#target.type !== "direct") return;
    return FieldOld.asState(field.#target.field);
  }

  static fromField<Value>(
    field: FieldOld<Value> | undefined,
  ): MaybeFieldRefOld<Value> | undefined {
    return (
      field &&
      new MaybeFieldRefOld({
        type: "direct",
        field,
      })
    );
  }

  //#endregion
}

export namespace MaybeFieldRefOld {
  //#region Interfaces

  export interface Hint {
    [maybeRefHintSymbolOld]: true;
  }

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: MaybeFieldRefOld<unknown>;
    NonNullish: MaybeFieldRefOld<Utils.NonNullish<Payload>>;
    Bound: unknown;
  };

  //#endregion

  //#region Properties

  export type Detachable<Value> = Enso.Detachable<MaybeFieldRefOld<Value>>;

  export type Tried<Value> = Enso.Tried<MaybeFieldRefOld<Value>>;

  export type Bound<Value> = Enso.Bound<MaybeFieldRefOld<Value>>;

  export type Branded<Value, Flags extends Enso.Flags> = Enso.Branded<
    MaybeFieldRefOld<Value>,
    Flags
  >;

  //#endregion

  //#region Target

  /**
   * Reference target
   */
  export type Target<Payload> = TargetDirect<Payload> | TargetShadow;

  export interface TargetDirect<Payload> {
    type: "direct";
    field: FieldOld<Payload>;
  }

  export interface TargetShadow {
    type: "shadow";
    closest: FieldOld<unknown>;
    /** Path relative to the closest field. */
    path: readonly string[];
  }

  //#endregion

  //#region Tree

  /**
   * Resolves proper type of the maybe field for the given key.
   */
  export type At<
    Payload,
    Key extends keyof Utils.NonNullish<Payload>,
  > = MaybeFieldRefOld<
    | Utils.NonNullish<Payload>[Key]
    // If payload is Utils.Nullish, we need to add undefined to the type, so that
    // `a.b` in `{ a?: { b: string } }` is not just `string`.
    | (Payload extends undefined ? undefined : never)
  >;

  export type TryKey<
    Def extends Enso.InterfaceDef,
    Key extends keyof Utils.NonNullish<Def["Payload"]>,
  > =
    | Enso.TryUnion<InterfaceDef<Utils.NonNullish<Def["Payload"]>[Key]>>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<Utils.NonNullish<Def["Payload"]>, Key> extends true
        ? never
        : undefined);

  //#endregion

  //#region Type

  export type Every<Value> =
    // Handle boolean separately, so it doesn't produce FieldRef<true> | FieldRef<false>
    | (boolean extends Value ? MaybeFieldRefOld<boolean> : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? MaybeFieldRefOld<Value>
          : never
        : never);

  export type EveryValueUnion<FieldType> =
    FieldType extends MaybeFieldRefOld<infer Value> ? Value : never;

  //#endregion

  //#region Map

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: MaybeFieldRefOld<Payload>;
      }
    : never;

  export type DiscriminateResult<
    FieldType,
    Discriminator extends keyof Utils.NonUndefined<EveryValueUnion<FieldType>>,
  > = DiscriminatedInner<EveryValueUnion<FieldType>, FieldType, Discriminator>;

  export type Discriminated<
    Value,
    Discriminator extends keyof Utils.NonUndefined<Value>,
    Flags extends Enso.Flags | undefined = undefined,
  > = DiscriminatedInner<Value, Value, Discriminator, Flags>;

  export type DiscriminatedInner<
    Payload,
    BrandsSource,
    Discriminator extends keyof Utils.NonUndefined<Payload>,
    Flags extends Enso.Flags | undefined = undefined,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: Enso.Branded<
                Enso.TransferBrands<MaybeFieldRefOld<Payload>, BrandsSource>,
                Flags
              >;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: Enso.Branded<
            Enso.TransferBrands<MaybeFieldRefOld<Payload>, BrandsSource>,
            Flags
          >;
        }
    : never;

  export type DiscriminatorFor<FieldType> = keyof Utils.NonUndefined<
    EveryValueUnion<FieldType>
  >;

  //#endregion

  //#region Collection

  // Tuple

  // NOTE: We have to have two separate overloads for tuples
  // `CollectionCallbackTuplePair` and `CollectionCallbackTupleSingle` as with
  // the current approach binding the key and value in the arguments on the type
  // level, TypeScript fails to find the correct overload for when the callback
  // accepts a single argument (i.e. just the item field).

  export type CollectionCallbackTuplePair<
    Value extends Utils.Tuple,
    Result = void,
  > = (
    ...args: {
      [Key in Utils.IndexOfTuple<Value>]: [MaybeFieldRefOld<Value[Key]>, Key];
    }[Utils.IndexOfTuple<Value>]
  ) => Result;

  export type CollectionCallbackTupleSingle<
    Value extends Utils.Tuple,
    Result = void,
  > = (item: Every<Value[Utils.IndexOfTuple<Value>]>) => Result;

  // Array

  export type CollectionCallbackArray<
    Value extends Array<unknown>,
    Result = void,
  > = (item: CollectionCallbackArrayItem<Value>, index: number) => Result;

  export type CollectionCallbackArrayItem<Value extends Array<unknown>> =
    Value extends Array<infer ItemValue> ? Detachable<ItemValue> : never;

  // Object

  // NOTE: We have to have two separate overloads for objects
  // `CollectionCallbackObjectPair` and `CollectionCallbackObjectSingle` as with
  // the current approach binding the key and value in the arguments on the type
  // level, TypeScript fails to find the correct overload for when the callback
  // accepts a single argument (i.e. just the item field).

  export type CollectionCallbackObjectPair<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    ...args: Exclude<
      {
        [Key in keyof Value]: [MaybeFieldRefOld<Value[Key]>, Key];
      }[keyof Value],
      undefined
    >
  ) => Result;

  export type CollectionCallbackObjectSingle<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    item: Exclude<
      { [Key in keyof Value]: MaybeFieldRefOld<Value[Key]> }[keyof Value],
      undefined
    >,
  ) => Result;

  //

  export type ItemResultTuple<Value extends Utils.Tuple> = Every<
    Value[Utils.IndexOfTuple<Value>]
  >;

  export type ItemResultArray<Value extends unknown[]> = Detachable<
    Value[number]
  >;

  export type ItemResultObject<Value extends object> =
    // Remove undefined that sneaks in
    Exclude<
      // Use mapped type to preserve Type | undefined for optional fields
      { [Key in keyof Value]: MaybeFieldRefOld<Value[Key]> }[keyof Value],
      undefined
    >;

  //#region Helpers

  export type Variable<Payload> =
    | MaybeFieldRefOld<Payload>
    | (Payload extends Payload ? MaybeFieldRefOld<Payload> : never);

  // //#endregion
}

//#region MaybeFieldRef Declarations

declare module "../collection/index.ts" {
  // `fieldEach`

  interface FieldEach {
    // Tuple

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackTuplePair<Value>,
    ): void;

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackTupleSingle<Value>,
    ): void;

    // Array

    <Value extends Array<unknown>>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackArray<Value>,
    ): void;

    // Object

    <Value extends object>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `fieldMap`

  interface FieldMap {
    // Tuple

    <Value extends Utils.Tuple, Result>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackTuplePair<Value, Result>,
    ): Result[];

    <Value extends Utils.Tuple, Result>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackTupleSingle<Value, Result>,
    ): Result[];

    // Array

    <Value extends Array<unknown>, Result>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackArray<Value, Result>,
    ): Result[];

    // Object

    <Value extends object, Result>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }

  // `fieldSize`

  interface FieldSize {
    // Tuple/Array

    <Value extends unknown[]>(field: MaybeFieldRefOld<Value>): Value["length"];

    // Object

    <Value extends object>(field: MaybeFieldRefOld<Value>): number;
  }

  // `fieldFind`

  interface FieldFind {
    // Tuple

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackTuplePair<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultTuple<Value> | undefined;

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackTupleSingle<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultTuple<Value> | undefined;

    // Array

    <Value extends unknown[]>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackArray<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultArray<Value> | undefined;

    // Object

    <Value extends object>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackObjectPair<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultObject<Value> | undefined;

    <Value extends object>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackObjectSingle<
        Value,
        unknown
      >,
    ): MaybeFieldRefOld.ItemResultObject<Value> | undefined;
  }

  // `fieldFilter`

  interface FieldFilter {
    // Tuple

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackTuplePair<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultTuple<Value>[];

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackTupleSingle<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultTuple<Value>[];

    // Array

    <Value extends unknown[]>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      callback: MaybeFieldRefOld.CollectionCallbackArray<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultArray<Value>[];

    // Object

    <Value extends object>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackObjectPair<Value, unknown>,
    ): MaybeFieldRefOld.ItemResultObject<Value>[];

    <Value extends object>(
      field:
        | MaybeFieldRefOld<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRefOld<Value>>>,
      predicate: MaybeFieldRefOld.CollectionCallbackObjectSingle<
        Value,
        unknown
      >,
    ): MaybeFieldRefOld.ItemResultObject<Value>[];
  }
}

declare module "../type/index.ts" {
  // `fieldDiscriminate`

  interface FieldDiscriminate {
    <
      FieldType extends MaybeFieldRefOld.Hint,
      Discriminator extends Utils.NonUndefined<
        MaybeFieldRefOld.DiscriminatorFor<FieldType>
      >,
    >(
      field: FieldType,
      discriminator: Discriminator,
    ): MaybeFieldRefOld.DiscriminateResult<FieldType, Discriminator>;
  }
}

//#endregion
