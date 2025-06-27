import { Field } from "../index.tsx";
import type { StaticImplements } from "../util.ts";

// NOTE: Following interfaces roughly define shape of classes that expose
// collection and array methods. While it provides enough type-safety for
// collection functions like `fieldPush`, it does not give 100% guarantee that
// class implementation is correct, as TypeScript lacks high-level generics,
// so the exact internal return and argument types are loose.

export interface AsCollectionRead {
  asCollection<Value>(field: unknown): AsCollection.AsReadResult<Value>;

  asArray<Value>(field: unknown): AsCollection.AsReadArrayResult<Value>;

  fromField<Value>(field: Field<Value>): unknown;
}

export interface AsCollection {
  asCollection<Value>(field: unknown): AsCollection.Result<Value>;

  asArray<Value>(field: unknown): AsCollection.AsArrayResult<Value>;

  fromField<Value>(field: Field<Value>): unknown;
}

export namespace AsCollection {
  export type Result<Value> =
    | InternalArray<Value>
    | InternalObject<Value>
    | undefined;

  export type AsReadResult<Value> =
    | InternalReadArray<Value>
    | InternalReadObject<Value>
    | undefined;

  export type AsArrayResult<Value> = InternalArray<Value> | undefined;

  export type AsReadArrayResult<Value> = InternalReadArray<Value> | undefined;

  export interface InternalReadCollection<Value> {
    // DO:
    // each(callback: InternalCollectionCallback<Value>): void;
  }

  export interface InternalReadArray<Value>
    extends InternalReadCollection<Value> {}

  export interface InternalArray<Value> extends InternalReadArray<Value> {
    push<Item extends Value>(field: Field<Value>, item: Item): number;
  }

  export interface InternalReadObject<Value>
    extends InternalReadCollection<Value> {}

  export interface InternalObject<Value> extends InternalReadObject<Value> {}

  export type InternalCollectionCallback<Value, Result = void> = <
    Key extends keyof Value,
  >(
    item: Field<Value[Key]>,
    key: Key,
  ) => Result;
}

export const fieldEach = ((field: any, callback: () => void) =>
  field.constructor.each(field, callback)) as FieldEach;

export interface FieldEach {}

export const fieldMap = ((field: any, callback: () => void) =>
  field.constructor.map(field, callback)) as FieldMap;

export interface FieldMap {}

export const fieldPush = <Fieldish, Value>(
  field: StaticImplements<AsCollection>,
  item: any,
) => field.constructor.asArray(field)?.push(field, item);
