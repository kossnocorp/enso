import { EnsoUtils } from "../../utils.ts";
import { Field } from "../index.tsx";

const fieldRefsStore = new WeakMap<Field<any>, FieldRef<any>>();

export class FieldRef<Payload> {
  static get<Payload>(field: Field<Payload>) {
    let ref = fieldRefsStore.get(field);
    if (!ref) {
      ref = new FieldRef(field);
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
    return FieldRef.get(this.#field.at(key));
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
    this.#field.forEach((field, key) => {
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
