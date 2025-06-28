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

/**
 * Reference to a field that protects the field's value from being changed. It
 * allows to change the metadata of the field, such as validation errors, but
 * never the value.
 */
@staticImplements<AsCollectionRead>()
// TODO: Try making this work or remove:
// Static<typeof FieldRef<unknown>, AsCollectionRead>,
export class FieldRef<Payload> {
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

  #field: Field<Payload>;

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

  try<Key extends keyof NonNullish<Payload>>(
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

  discriminate<Discriminator extends keyof NonUndefined<Payload>>(
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

  static fromField<Value>(field: Field<Value>): FieldRef<Value> {
    return FieldRef.get(field);
  }

  //#endregion
}

export namespace FieldRef {
  //#region Interfaces

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: FieldRef<unknown>;
    NonNullish: FieldRef<NonNullish<Payload>>;
    Bound: unknown;
  };

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
    Key extends keyof NonNullish<Def["Payload"]>,
  > =
    | Enso.TryUnion<InterfaceDef<NonNullish<Def["Payload"]>[Key]>>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<NonNullish<Def["Payload"]>, Key> extends true
        ? never
        : undefined);

  //#endregion

  //#region Map

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: FieldRef<Payload>;
      }
    : never;

  export type Discriminated<
    Payload,
    Discriminator extends keyof NonUndefined<Payload>,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: FieldRef<Payload>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: FieldRef<Payload>;
        }
    : never;

  //#endregion

  //#region Collection

  export type CollectionCallbackArray<
    Value extends Array<unknown>,
    Result = void,
  > = (item: CollectionCallbackArrayItem<Value>, index: number) => Result;

  export type CollectionCallbackArrayItem<Value extends Array<unknown>> =
    Value extends Array<infer Item>
      ? Item extends Item
        ? FieldRef<Item>
        : never
      : never;

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

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | FieldRef<Payload>
    | (Payload extends Payload ? FieldRef<Payload> : never);

  //#endregion
}

//#region FieldRef Declarations

declare module "../collection/index.ts" {
  // `each`

  interface FieldEach {
    <Value extends Array<unknown>>(
      field: FieldRef<Value> | Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackArray<Value>,
    ): void;

    <Value extends object>(
      field: FieldRef<Value> | Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field: FieldRef<Value> | Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `map`

  interface FieldMap {
    <Value extends Array<unknown>, Result>(
      field: FieldRef<Value> | Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackArray<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: FieldRef<Value> | Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: FieldRef<Value> | Nullish<Enso.Tried<FieldRef<Value>>>,
      callback: FieldRef.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }
}

//#endregion

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
export class MaybeFieldRef<Payload> {
  #target: MaybeFieldRef.Target<Payload>;

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

  at<Key extends keyof NonNullish<Payload>>(
    key: Key,
  ): MaybeFieldRef.At<Payload, Key> {
    // maybe<Key extends keyof NonNullish<Payload>>(
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

  try<Key extends keyof NonNullish<Payload>>(
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

  discriminate<Discriminator extends keyof NonNullish<Payload>>(
    discriminator: Discriminator,
  ): MaybeFieldRef.Discriminated<Payload, Discriminator> {
    // @ts-ignore: TODO:
    return {
      discriminator: this.at(discriminator).get(),
      field: this,
    };
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

  static fromField<Value>(field: Field<Value>): MaybeFieldRef<Value> {
    return new MaybeFieldRef({
      type: "direct",
      field,
    });
  }

  //#endregion
}

export namespace MaybeFieldRef {
  //#region Interfaces

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: MaybeFieldRef<unknown>;
    NonNullish: MaybeFieldRef<NonNullish<Payload>>;
    Bound: unknown;
  };

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
    Key extends keyof NonNullish<Payload>,
  > = MaybeFieldRef<
    | NonNullish<Payload>[Key]
    // If payload is nullish, we need to add undefined to the type, so that
    // `a.b` in `{ a?: { b: string } }` is not just `string`.
    | (Payload extends undefined ? undefined : never)
  >;

  export type TryKey<
    Def extends Enso.InterfaceDef,
    Key extends keyof NonNullish<Def["Payload"]>,
  > =
    | Enso.TryUnion<InterfaceDef<NonNullish<Def["Payload"]>[Key]>>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<NonNullish<Def["Payload"]>, Key> extends true
        ? never
        : undefined);

  //#endregion

  //#region Map

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: MaybeFieldRef<Payload>;
      }
    : never;

  export type Discriminated<
    Payload,
    Discriminator extends keyof NonNullish<Payload>,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: MaybeFieldRef<Payload>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: MaybeFieldRef<Payload>;
        }
    : never;

  //#endregion

  //#region Collection

  export type CollectionCallbackArray<
    Value extends Array<unknown>,
    Result = void,
  > = (item: CollectionCallbackArrayItem<Value>, index: number) => Result;

  export type CollectionCallbackArrayItem<Value extends Array<unknown>> =
    Value extends Array<infer Item>
      ? Item extends Item
        ? MaybeFieldRef<Item>
        : never
      : never;

  export type CollectionCallbackObjectPair<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    ...args: Exclude<
      {
        [Key in keyof Value]: [MaybeFieldRef<Value[Key]>, Key];
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
      { [Key in keyof Value]: MaybeFieldRef<Value[Key]> }[keyof Value],
      undefined
    >,
  ) => Result;

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | MaybeFieldRef<Payload>
    | (Payload extends Payload ? MaybeFieldRef<Payload> : never);

  // //#endregion
}

//#region MaybeFieldRef Declarations

declare module "../collection/index.ts" {
  // `each`

  interface FieldEach {
    <Value extends Array<unknown>>(
      field: MaybeFieldRef<Value> | Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackArray<Value>,
    ): void;

    <Value extends object>(
      field: MaybeFieldRef<Value> | Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field: MaybeFieldRef<Value> | Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `map`

  interface FieldMap {
    <Value extends Array<unknown>, Result>(
      field: MaybeFieldRef<Value> | Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackArray<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: MaybeFieldRef<Value> | Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: MaybeFieldRef<Value> | Nullish<Enso.Tried<MaybeFieldRef<Value>>>,
      callback: MaybeFieldRef.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }
}

//#endregion
