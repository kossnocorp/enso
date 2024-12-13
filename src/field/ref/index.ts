import { EnsoUtils } from "../../utils.ts";
import { Field } from "../index.tsx";

const fieldRefsStore = new WeakMap<Field<any>, FieldRef<any>>();

export class FieldRef<Payload> {
  static get<Payload>(field: Field<Payload>) {
    // @ts-expect-error: [TODO]
    let ref = fieldRefsStore.get(field);
    if (!ref) {
      // @ts-expect-error: [TODO]
      ref = new FieldRef(field);
      // @ts-expect-error: [TODO]
      fieldRefsStore.set(field, ref);
    }
    return ref;
  }

  #field: Field<Payload>;

  constructor(external: Field<Payload>) {
    this.#field = external;
  }

  //#region Value

  get() {
    return this.#field.get();
  }

  //#endregion

  //#region Tree

  $ = new Proxy({} as FieldRef.$Object<Payload>, {
    get: (_, key: string) => this.at(key as keyof Payload),
  });

  at<Key extends keyof Payload>(key: Key): FieldRef.At<Payload, Key> {
    // @ts-expect-error: [TODO]
    return FieldRef.get(this.#field.at(key));
  }

  //#endregion

  //#region Mapping

  decompose(): FieldRef.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as FieldRef.Decomposed<Payload>;
  }

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): FieldRef.Discriminated<Payload, Discriminator> {
    // @ts-ignore: [TODO]
    return {
      // @ts-ignore: [TODO]
      discriminator: this.$[discriminator].get(),
      field: this,
    };
  }

  //#endregion

  //#region Errors

  setError(error: Field.Error | string): void {
    this.#field.setError(error);
  }

  //#endregion

  //#region Collections

  forEach<Key extends keyof Payload>(
    callback: FieldRef.ForEachCallback<Payload, Key>
  ) {
    // @ts-expect-error: [TODO]
    this.#field.forEach((field, key) => {
      // @ts-expect-error: [TODO]
      callback(FieldRef.get(field), key);
    });
  }

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
    EnsoUtils.IsStaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

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
    Discriminator extends keyof Exclude<Payload, undefined>,
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

  export type ForEachCallback<Payload, Key extends keyof Payload> = (
    field: FieldRef<Payload[Key]>,
    key: Key
  ) => void;

  //#endregion

  //#region Helpers

  export type Variable<Payload> =
    | FieldRef<Payload>
    | (Payload extends Payload ? FieldRef<Payload> : never);

  //#endregion
}
