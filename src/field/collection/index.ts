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
    each(callback: InternalCollectionCallback<Value>): void;

    map<Result>(callback: InternalCollectionCallback<Value, Result>): Result[];
  }

  export interface InternalReadArray<Value>
    extends InternalReadCollection<Value> {}

  export interface InternalArray<Value> extends InternalReadArray<Value> {
    push(item: any): number;
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

export const fieldEach = ((
  field: Nullish<StaticImplements<AsCollectionRead>>,
  callback: () => void,
) =>
  field?.constructor
    .asCollection(field)
    ?.each(callback)) as unknown as FieldEach;

export interface FieldEach {}

export const fieldMap = ((
  field: Nullish<StaticImplements<AsCollectionRead>>,
  callback: () => void,
) =>
  field?.constructor.asCollection(field)?.map(callback)) as unknown as FieldMap;

export interface FieldMap {}

export const fieldPush = ((
  field: Nullish<StaticImplements<AsCollection>>,
  item: any,
) => field?.constructor.asArray(field)?.push(item)) as unknown as FieldPush;

export interface FieldPush {}
