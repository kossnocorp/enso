import { shiftChildChanges } from "../../change/index.ts";
import { EnsoUtils } from "../../utils.ts";
import { Field } from "../index.tsx";

/**
 * @internal
 * Map maintaining stable references to fields. It is prevent creating new
 * `FieldRef` instances for the same fields.
 */
// [TODO] Test if reducing number of allocations is actually worth the memory hit.
const fieldRefsStore = new WeakMap<Field<any>, FieldRef<any>>();

/**
 * Reference to a field that protects the field's value from being changed. It
 * allows to change the metadata of the field, such as validation errors, but
 * never the value.
 */
export class FieldRef<Payload> {
  static get<Payload>(field: Field<Payload>) {
    // @ts-ignore: [TODO]
    let ref = fieldRefsStore.get(field);
    if (!ref) {
      // @ts-ignore: [TODO]
      ref = new FieldRef(field);
      // @ts-ignore: [TODO]
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
    // @ts-ignore: [TODO]
    return FieldRef.get(this.#field.at(key));
  }

  maybe(): MaybeFieldRef<Payload> {
    return new MaybeFieldRef({ type: "direct", field: this.#field });
  }

  //#endregion

  //#region Mapping

  decompose(): FieldRef.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as FieldRef.Decomposed<Payload>;
  }

  discriminate<Discriminator extends keyof NonUndefined<Payload>>(
    discriminator: Discriminator,
  ): FieldRef.Discriminated<Payload, Discriminator> {
    // @ts-ignore: [TODO]
    return {
      // @ts-ignore: [TODO]
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

  //#region Collections

  forEach: FieldRef.ForEachFn<Payload> = ((callback: any) => {
    // @ts-ignore: [TODO]
    this.#field.forEach((field, key) => {
      callback(FieldRef.get(field), key);
    });
  }) as FieldRef.ForEachFn<Payload>;

  //#endregion
}

export namespace FieldRef {
  //#region Tree

  export type $Object<Payload> = {
    [Key in keyof Payload]-?: FieldRef<
      EnsoUtils.IsStaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type At<Payload, Key extends keyof Payload> = FieldRef<
    AtPayload<Payload, Key>
  >;

  export type AtPayload<Payload, Key extends keyof Payload> =
    EnsoUtils.IsStaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined;

  //#endregion

  //#region Mapping

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

  //#region Collections

  export type ForEachFn<Payload> =
    Payload extends Array<any>
      ? ArrayForEach<Payload>
      : Payload extends object
        ? ObjectForEach<Payload>
        : (cb: never) => never;

  export type ObjectForEach<Payload extends object> = (
    callback: <Key extends keyof Payload>(
      item: FieldRef<Payload[Key]>,
      key: Key,
    ) => void,
  ) => void;

  export type ArrayForEach<Payload extends Array<any>> = (
    callback: (item: FieldRef<Payload[number]>, index: number) => void,
  ) => void;

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | FieldRef<Payload>
    | (Payload extends Payload ? FieldRef<Payload> : never);

  //#endregion
}

/**
 * Class representing maybe fields references. Unlike `FieldRef` representing
 * correct state of existing field, maybe field may not exist (e.g. act as
 * `number` while the value is actually `undefined`), or may represent incorrect
 * state (e.g. parent is a actually a `number` but was accessed as an object in
 * `number | { a?: string }`).
 */
export class MaybeFieldRef<Payload> {
  #target: MaybeFieldRef.Target<Payload>;

  constructor(target: MaybeFieldRef.Target<Payload>) {
    this.#target = target;
  }

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

    // @ts-ignore: [TODO]
    return new MaybeFieldRef(target);
  }

  //#endregion

  //#region Mapping

  decompose(): MaybeFieldRef.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as MaybeFieldRef.Decomposed<Payload>;
  }

  discriminate<Discriminator extends keyof NonNullish<Payload>>(
    discriminator: Discriminator,
  ): MaybeFieldRef.Discriminated<Payload, Discriminator> {
    // @ts-ignore: [TODO]
    return {
      discriminator: this.at(discriminator).get(),
      field: this,
    };
  }

  //#endregion

  //#region Errors

  addError(error: Field.Error | string): void {
    if (this.#target.type === "direct") {
      this.#target.field.addError(error);
    } else {
      const path = [...this.#target.closest.path, ...this.#target.path];
      let changes = Field.errorChangesFor(this.#target.closest);

      // If there are computed fields at this path, we want to trigger changes
      // on them as well, so that they can react.
      const computed = this.#target.closest.computedMap.at(path);
      computed.forEach((field) => field.trigger(changes, true));

      // Shift the changes for each path segment, so that the changes levels are
      // accurately set for the closest field.
      for (const _ of path) {
        changes = shiftChildChanges(changes);
      }

      this.#target.closest.validationTree.add(
        path,
        Field.normalizeError(error),
        null,
      );

      // No need to trigger changes, as the closest field will still receive
      // them through the computed fields, however it should not change anything
      // if we do trigger them.
      if (!computed.length) this.#target.closest.trigger(changes, true);
    }
  }

  //#endregion

  //#region Collections

  forEach: MaybeFieldRef.ForEachFn<Payload> = ((callback: any) => {
    if (this.#target.type !== "direct") return;
    // @ts-ignore: [TODO]
    this.#target.field.forEach((field, key) => {
      callback(FieldRef.get(field), key);
    });
  }) as MaybeFieldRef.ForEachFn<Payload>;

  //#endregion
}

export namespace MaybeFieldRef {
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

  //#endregion

  //#region Mapping

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

  //#region Collections

  export type ForEachFn<Payload> =
    Payload extends Array<any>
      ? ArrayForEach<Payload>
      : Payload extends object
        ? ObjectForEach<Payload>
        : (cb: never) => never;

  export type ObjectForEach<Payload extends object> = (
    callback: <Key extends keyof Payload>(
      item: MaybeFieldRef<Payload[Key]>,
      key: Key,
    ) => void,
  ) => void;

  export type ArrayForEach<Payload extends Array<any>> = (
    callback: (item: MaybeFieldRef<Payload[number]>, index: number) => void,
  ) => void;

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | MaybeFieldRef<Payload>
    | (Payload extends Payload ? MaybeFieldRef<Payload> : never);

  // //#endregion
}
