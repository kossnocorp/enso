import { AsState } from "../../state/index.ts";
import { Enso } from "../../types.ts";
import { EnsoUtils as Utils } from "../../utils.ts";
import { AsCollection, AsCollectionRead } from "../collection/index.ts";
import { Field } from "../index.tsx";
import { staticImplements } from "../util.ts";

/**
 * @internal
 * Map maintaining stable references to fields. It is prevent creating new
 * `FieldRef` instances for the same fields.
 */
// TODO: Test if reducing number of allocations is actually worth the memory hit.
const fieldRefsStore = new WeakMap<Field<any>, FieldRef<any>>();

const refHintSymbol = Symbol();

/**
 * Reference to a field that protects the field's value from being changed. It
 * allows to change the metadata of the field, such as validation errors, but
 * never the value.
 */
@staticImplements<AsCollectionRead>()
// TODO: Try making this work or remove:
// Static<typeof FieldRef<unknown>, AsCollectionRead>,
export class FieldRef<Payload> implements FieldRef.Hint {
  static get<Payload>(field: Field<Payload>): FieldRef<Payload> {
    // @ts-ignore: TODO:
    let ref: any = fieldRefsStore.get(field);
    if (!ref) {
      // @ts-ignore: TODO:
      ref = new FieldRef(field);
      // @ts-ignore: TODO:
      fieldRefsStore.set(field, ref);
    }
    return ref;
  }

  [refHintSymbol] = true as const;

  #field: Field<Payload>;

  static every<FieldType extends Field.Hint>(
    field: FieldType,
  ): Enso.TransferBrands<
    FieldRef<Field.EveryValueUnion<FieldType>>,
    FieldType
  > {
    return new FieldRef(field as any) as any;
  }

  constructor(external: Field<Payload>) {
    this.#field = external;
  }

  //#region Value

  get(): Payload {
    return this.#field.get();
  }

  //#endregion

  //#region Tree

  $ = new Proxy({} as FieldRef.$Object<Payload>, {
    get: (_, key: string) => this.at(key as keyof Payload),
  });

  at<Key extends keyof Payload>(key: Key): FieldRef.At<Payload, Key> {
    // @ts-ignore: TODO:
    return FieldRef.get(this.#field.at(key));
  }

  try(): Enso.TryUnion<FieldRef.InterfaceDef<Payload>>;

  try<Key extends keyof Utils.NonNullish<Payload>>(
    key: Key,
  ): FieldRef.TryKey<Field.InterfaceDef<Payload>, Key>;

  try(...[key]: any[]): any {
    const field = this.#field.try(key);
    return field && FieldRef.get(field);
  }

  maybe(): MaybeFieldRef<Payload> {
    return new MaybeFieldRef({ type: "direct", field: this.#field });
  }

  //#endregion

  //#region Map

  decompose(): FieldRef.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as FieldRef.Decomposed<Payload>;
  }

  discriminate<Discriminator extends keyof Utils.NonUndefined<Payload>>(
    discriminator: Discriminator,
  ): FieldRef.Discriminated<Payload, Discriminator> {
    // @ts-ignore: TODO:
    return {
      // @ts-ignore: TODO:
      discriminator: this.$[discriminator]?.get(),
      field: this,
    };
  }

  //#endregion

  //#region Errors

  addError(error: Field.Error | string): void {
    this.#field.addError(error);
  }

  //#endregion

  //#region Collection

  static asCollection<Value>(
    field: FieldRef<Value>,
  ): AsCollection.Result<Value> {
    return Field.asCollection(field.#field);
  }

  static asArray<Value>(
    field: FieldRef<Value>,
  ): AsCollection.AsArrayResult<Value> {
    return Field.asArray(field.#field);
  }

  static asObject<Value>(
    field: FieldRef<Value>,
  ): AsCollection.AsObjectResult<Value> {
    return Field.asObject(field.#field);
  }

  static asChild<Value>(
    field: FieldRef<Value>,
  ): AsCollection.AsChildResult<Value> {
    return Field.asChild(field.#field);
  }

  static asState<Value>(
    field: FieldRef<Value>,
  ): AsState.ReadWriteResult<Value> | undefined {
    return Field.asState(field.#field);
  }

  static fromField<Value>(
    field: Field<Value> | undefined,
  ): FieldRef<Value> | undefined {
    return field && FieldRef.get(field);
  }

  //#endregion
}

export namespace FieldRef {
  //#region Interfaces

  export interface Hint {
    [refHintSymbol]: true;
  }

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: FieldRef<unknown>;
    NonNullish: FieldRef<Utils.NonNullish<Payload>>;
    Bound: unknown;
  };

  //#endregion

  //#region Properties

  export type Detachable<Value> = Enso.Detachable<FieldRef<Value>>;

  export type Tried<Value> = Enso.Tried<FieldRef<Value>>;

  export type Bound<Value> = Enso.Bound<FieldRef<Value>>;

  export type Branded<Value, Flags extends Enso.Flags> = Enso.Branded<
    FieldRef<Value>,
    Flags
  >;

  //#endregion

  //#region Tree

  export type $Object<Payload> = {
    [Key in keyof Payload]-?: FieldRef<
      Utils.IsStaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type At<Payload, Key extends keyof Payload> = FieldRef<
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
    | (boolean extends Value ? FieldRef<boolean> : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? FieldRef<Value>
          : never
        : never);

  export type EveryValueUnion<FieldType> =
    FieldType extends FieldRef<infer Value> ? Value : never;

  export type DiscriminateResult<
    FieldType,
    Discriminator extends keyof Utils.NonUndefined<EveryValueUnion<FieldType>>,
  > = DiscriminatedInner<EveryValueUnion<FieldType>, FieldType, Discriminator>;

  export type Discriminated<
    Value,
    Discriminator extends keyof Utils.NonUndefined<Value>,
  > = DiscriminatedInner<Value, Value, Discriminator>;

  export type DiscriminatedInner<
    Payload,
    BrandsSource,
    Discriminator extends keyof Utils.NonUndefined<Payload>,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: Enso.TransferBrands<FieldRef<Payload>, BrandsSource>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: Enso.TransferBrands<FieldRef<Payload>, BrandsSource>;
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
        field: FieldRef<Payload>;
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
      [Key in Utils.IndexOfTuple<Value>]: [FieldRef<Value[Key]>, Key];
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
      { [Key in keyof Value]: [FieldRef<Value[Key]>, Key] }[keyof Value],
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
      { [Key in keyof Value]: FieldRef<Value[Key]> }[keyof Value],
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
      { [Key in keyof Value]: FieldRef<Value[Key]> }[keyof Value],
      undefined
    >;

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | FieldRef<Payload>
    | (Payload extends Payload ? FieldRef<Payload> : never);

  //#endregion
}

//#region FieldRef Declarations

declare module "../collection/index.ts" {
  // `fieldEach`

  interface FieldEach {
    // Tuple

    <Value extends Utils.Tuple>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackTuplePair<Value>,
    ): void;

    <Value extends Utils.Tuple>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackTupleSingle<Value>,
    ): void;

    // Array

    <Value extends unknown[]>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackArray<Value>,
    ): void;

    // Object

    <Value extends object>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `fieldMap`

  interface FieldMap {
    // Tuple

    <Value extends Utils.Tuple, Result>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackTuplePair<Value, Result>,
    ): Result[];

    <Value extends Utils.Tuple, Result>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackTupleSingle<Value, Result>,
    ): Result[];

    // Array

    <Value extends unknown[], Result>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackArray<Value, Result>,
    ): Result[];

    // Object

    <Value extends object, Result>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }

  // `fieldSize`

  interface FieldSize {
    // Tuple/Array

    <Value extends Array<unknown>>(field: FieldRef<Value>): Value["length"];

    // Object

    <Value extends object>(field: FieldRef<Value>): number;
  }

  // `fieldFind`

  interface FieldFind {
    // Tuple

    <Value extends Utils.Tuple>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackTuplePair<Value, unknown>,
    ): FieldRef.ItemResultTuple<Value> | undefined;

    <Value extends Utils.Tuple>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackTupleSingle<Value, unknown>,
    ): FieldRef.ItemResultTuple<Value> | undefined;

    // Array

    <Value extends unknown[]>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackArray<Value, unknown>,
    ): FieldRef.ItemResultArray<Value> | undefined;

    // Object

    <Value extends object>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackObjectPair<Value, unknown>,
    ): FieldRef.ItemResultObject<Value> | undefined;

    <Value extends object>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackObjectSingle<Value, unknown>,
    ): FieldRef.ItemResultObject<Value> | undefined;
  }

  // `fieldFilter`

  interface FieldFilter {
    // Tuple

    <Value extends Utils.Tuple>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackTuplePair<Value, unknown>,
    ): FieldRef.ItemResultTuple<Value>[];

    <Value extends Utils.Tuple>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackTupleSingle<Value, unknown>,
    ): FieldRef.ItemResultTuple<Value>[];

    // Array

    <Value extends unknown[]>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackArray<Value, unknown>,
    ): FieldRef.ItemResultArray<Value>[];

    // Object

    <Value extends object>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackObjectPair<Value, unknown>,
    ): FieldRef.ItemResultObject<Value>[];

    <Value extends object>(
      field: FieldRef<Value> | Utils.Nullish<Enso.Tried<FieldRef<Value>>>,
      predicate: FieldRef.CollectionCallbackObjectSingle<Value, unknown>,
    ): FieldRef.ItemResultObject<Value>[];
  }
}

declare module "../type/index.ts" {
  // `fieldDiscriminate`

  interface FieldDiscriminate {
    <
      FieldType extends FieldRef.Hint,
      Discriminator extends Utils.NonUndefined<
        FieldRef.DiscriminatorFor<FieldType>
      >,
    >(
      field: FieldType,
      discriminator: Discriminator,
    ): FieldRef.DiscriminateResult<FieldType, Discriminator>;
  }
}

//#endregion

const maybeRefHintSymbol = Symbol();

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
export class MaybeFieldRef<Payload> implements MaybeFieldRef.Hint {
  #target: MaybeFieldRef.Target<Payload>;

  [maybeRefHintSymbol] = true as const;

  static every<FieldType extends Field.Hint>(
    field: FieldType,
  ): Enso.TransferBrands<
    MaybeFieldRef<Field.EveryValueUnion<FieldType>>,
    FieldType
  > {
    return new MaybeFieldRef({ type: "direct", field: field as any }) as any;
  }

  constructor(target: MaybeFieldRef.Target<Payload>) {
    this.#target = target;
  }

  //#region Maybe

  #targetPath(): Enso.Path {
    return this.#target.type === "direct"
      ? this.#target.field.path
      : [...this.#target.closest.path, ...this.#target.path];
  }

  #targetRoot(): Field<any> {
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
  ): MaybeFieldRef.At<Payload, Key> {
    // maybe<Key extends keyof Utils.NonNullish<Payload>>(
    //   key: Key,
    // ): MaybeFieldRef.Result<Payload, Key> {
    let target: MaybeFieldRef.Target<unknown>;
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
    return new MaybeFieldRef(target);
  }

  try(): Enso.TryUnion<MaybeFieldRef.InterfaceDef<Payload>>;

  try<Key extends keyof Utils.NonNullish<Payload>>(
    key: Key,
  ): Field.TryKey<MaybeFieldRef.InterfaceDef<Payload>, Key>;

  try(...[key]: any[]): any {
    // If it is a shadow field, there can't be anything to try.
    if (this.#target.type !== "direct") return;
    const field = this.#target.field.try(key);
    return field && FieldRef.get(field);
  }

  //#endregion

  //#region Map

  decompose(): MaybeFieldRef.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as MaybeFieldRef.Decomposed<Payload>;
  }

  //#endregion

  //#region Errors

  addError(error: Field.Error | string): void {
    const path = this.#targetPath();
    const root = this.#targetRoot();

    // If there are any nested errors at this path, field is not valid.
    const wasValid = !root.validationTree.nested(path).length;
    const changes = Field.errorChangesFor(wasValid);

    root.validationTree.add(path, Field.normalizeError(error));
    root.eventsTree.trigger(path, changes);
  }

  //#endregion

  //#region Collection

  static asCollection<Value>(
    field: MaybeFieldRef<Value>,
  ): AsCollection.Result<Value> {
    // If it is a shadow field, there can't be anything to iterate.
    if (field.#target.type !== "direct") return;
    return Field.asCollection(field.#target.field);
  }

  static asArray<Value>(
    field: MaybeFieldRef<Value>,
  ): AsCollection.AsArrayResult<Value> {
    // If it is a shadow field, there can't be anything to iterate.
    if (field.#target.type !== "direct") return;
    return Field.asArray(field.#target.field);
  }

  static asObject<Value>(
    field: MaybeFieldRef<Value>,
  ): AsCollection.AsObjectResult<Value> {
    // If it is a shadow field, there can't be anything to access.
    if (field.#target.type !== "direct") return;
    return Field.asObject(field.#target.field);
  }

  static asChild<Value>(
    field: MaybeFieldRef<Value>,
  ): AsCollection.AsChildResult<Value> {
    // If it is a shadow field, there can't be anything to access.
    if (field.#target.type !== "direct") return;
    return Field.asChild(field.#target.field);
  }

  static asState<Value>(
    field: MaybeFieldRef<Value>,
  ): AsState.ReadWriteResult<Value> | undefined {
    // If it is a shadow field, there can't be anything to access.
    if (field.#target.type !== "direct") return;
    return Field.asState(field.#target.field);
  }

  static fromField<Value>(
    field: Field<Value> | undefined,
  ): MaybeFieldRef<Value> | undefined {
    return (
      field &&
      new MaybeFieldRef({
        type: "direct",
        field,
      })
    );
  }

  //#endregion
}

export namespace MaybeFieldRef {
  //#region Interfaces

  export interface Hint {
    [maybeRefHintSymbol]: true;
  }

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: MaybeFieldRef<unknown>;
    NonNullish: MaybeFieldRef<Utils.NonNullish<Payload>>;
    Bound: unknown;
  };

  //#endregion

  //#region Properties

  export type Detachable<Value> = Enso.Detachable<MaybeFieldRef<Value>>;

  export type Tried<Value> = Enso.Tried<MaybeFieldRef<Value>>;

  export type Bound<Value> = Enso.Bound<MaybeFieldRef<Value>>;

  export type Branded<Value, Flags extends Enso.Flags> = Enso.Branded<
    MaybeFieldRef<Value>,
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
    field: Field<Payload>;
  }

  export interface TargetShadow {
    type: "shadow";
    closest: Field<unknown>;
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
  > = MaybeFieldRef<
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
    | (boolean extends Value ? MaybeFieldRef<boolean> : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? MaybeFieldRef<Value>
          : never
        : never);

  export type EveryValueUnion<FieldType> =
    FieldType extends MaybeFieldRef<infer Value> ? Value : never;

  //#endregion

  //#region Map

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: MaybeFieldRef<Payload>;
      }
    : never;

  export type DiscriminateResult<
    FieldType,
    Discriminator extends keyof Utils.NonUndefined<EveryValueUnion<FieldType>>,
  > = DiscriminatedInner<EveryValueUnion<FieldType>, FieldType, Discriminator>;

  export type Discriminated<
    Value,
    Discriminator extends keyof Utils.NonUndefined<Value>,
  > = DiscriminatedInner<Value, Value, Discriminator>;

  export type DiscriminatedInner<
    Payload,
    BrandsSource,
    Discriminator extends keyof Utils.NonUndefined<Payload>,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: Enso.TransferBrands<MaybeFieldRef<Payload>, BrandsSource>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: Enso.TransferBrands<MaybeFieldRef<Payload>, BrandsSource>;
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
      [Key in Utils.IndexOfTuple<Value>]: [MaybeFieldRef<Value[Key]>, Key];
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
      { [Key in keyof Value]: [MaybeFieldRef<Value[Key]>, Key] }[keyof Value],
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
      { [Key in keyof Value]: MaybeFieldRef<Value[Key]> }[keyof Value],
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
      { [Key in keyof Value]: MaybeFieldRef<Value[Key]> }[keyof Value],
      undefined
    >;

  //#region Helpers

  export type Variable<Payload> =
    | MaybeFieldRef<Payload>
    | (Payload extends Payload ? MaybeFieldRef<Payload> : never);

  // //#endregion
}

//#region MaybeFieldRef Declarations

declare module "../collection/index.ts" {
  // `fieldEach`

  interface FieldEach {
    // Tuple

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackTuplePair<Value>,
    ): void;

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackTupleSingle<Value>,
    ): void;

    // Array

    <Value extends Array<unknown>>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackArray<Value>,
    ): void;

    // Object

    <Value extends object>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `fieldMap`

  interface FieldMap {
    // Tuple

    <Value extends Utils.Tuple, Result>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackTuplePair<Value, Result>,
    ): Result[];

    <Value extends Utils.Tuple, Result>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackTupleSingle<Value, Result>,
    ): Result[];

    // Array

    <Value extends Array<unknown>, Result>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackArray<Value, Result>,
    ): Result[];

    // Object

    <Value extends object, Result>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }

  // `fieldSize`

  interface FieldSize {
    // Tuple/Array

    <Value extends unknown[]>(field: MaybeFieldRef<Value>): Value["length"];

    // Object

    <Value extends object>(field: MaybeFieldRef<Value>): number;
  }

  // `fieldFind`

  interface FieldFind {
    // Tuple

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackTuplePair<Value, unknown>,
    ): MaybeFieldRef.ItemResultTuple<Value> | undefined;

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackTupleSingle<Value, unknown>,
    ): MaybeFieldRef.ItemResultTuple<Value> | undefined;

    // Array

    <Value extends unknown[]>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackArray<Value, unknown>,
    ): MaybeFieldRef.ItemResultArray<Value> | undefined;

    // Object

    <Value extends object>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackObjectPair<Value, unknown>,
    ): MaybeFieldRef.ItemResultObject<Value> | undefined;

    <Value extends object>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackObjectSingle<Value, unknown>,
    ): MaybeFieldRef.ItemResultObject<Value> | undefined;
  }

  // `fieldFilter`

  interface FieldFilter {
    // Tuple

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackTuplePair<Value, unknown>,
    ): MaybeFieldRef.ItemResultTuple<Value>[];

    <Value extends Utils.Tuple>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackTupleSingle<Value, unknown>,
    ): MaybeFieldRef.ItemResultTuple<Value>[];

    // Array

    <Value extends unknown[]>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackArray<Value, unknown>,
    ): MaybeFieldRef.ItemResultArray<Value>[];

    // Object

    <Value extends object>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackObjectPair<Value, unknown>,
    ): MaybeFieldRef.ItemResultObject<Value>[];

    <Value extends object>(
      field:
        | MaybeFieldRef<Value>
        | Utils.Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      predicate: MaybeFieldRef.CollectionCallbackObjectSingle<Value, unknown>,
    ): MaybeFieldRef.ItemResultObject<Value>[];
  }
}

declare module "../type/index.ts" {
  // `fieldDiscriminate`

  interface FieldDiscriminate {
    <
      FieldType extends MaybeFieldRef.Hint,
      Discriminator extends Utils.NonUndefined<
        MaybeFieldRef.DiscriminatorFor<FieldType>
      >,
    >(
      field: FieldType,
      discriminator: Discriminator,
    ): MaybeFieldRef.DiscriminateResult<FieldType, Discriminator>;
  }
}

//#endregion
