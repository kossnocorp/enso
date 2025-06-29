import { Field } from "../index.tsx";
import type { StaticImplements } from "../util.ts";

// NOTE: Following interfaces roughly define shape of classes that expose
// collection and array methods. While it provides enough type-safety for
// collection functions like `fieldPush`, it does not give 100% guarantee that
// class implementation is correct, as TypeScript lacks high-level generics,
// so the exact internal return and argument types are loose.

export interface AsCollectionRead {
  asCollection<Value>(
    field: unknown,
  ): AsCollection.AsReadCollectionResult<Value>;

  asArray<Value>(field: unknown): AsCollection.AsReadArrayResult<Value>;

  asChild<Value>(field: unknown): AsCollection.AsReadAnyResult<Value>;

  fromField<Value>(field: Field<Value>): unknown;
}

export interface AsCollection {
  asCollection<Value>(field: unknown): AsCollection.Result<Value>;

  asArray<Value>(field: unknown): AsCollection.AsArrayResult<Value>;

  asChild<Value>(field: unknown): AsCollection.AsChildResult<Value>;

  fromField<Value>(field: Field<Value>): unknown;
}

export namespace AsCollection {
  export type Result<Value> =
    | InternalArray<Value>
    | InternalObject<Value>
    | undefined;

  export type AsReadCollectionResult<Value> =
    | InternalReadArray<Value>
    | InternalReadObject<Value>
    | undefined;

  export type AsArrayResult<Value> = InternalArray<Value> | undefined;

  export type AsReadArrayResult<Value> = InternalReadArray<Value> | undefined;

  export type AsChildResult<Value> = InternalAny<Value> | undefined;

  export type AsReadAnyResult<Value> = InternalReadAny<Value> | undefined;

  export interface InternalReadCollection<Value> {
    each(callback: InternalCollectionCallback<Value>): void;

    map<Result>(callback: InternalCollectionCallback<Value, Result>): Result[];

    size(): number;

    find(
      predicate: (item: Field<Value[keyof Value]>, key: keyof Value) => boolean,
    ): Field<Value[keyof Value]> | undefined;

    filter(
      predicate: (item: Field<Value[keyof Value]>, key: keyof Value) => boolean,
    ): Field<Value[keyof Value]>[];
  }

  export interface InternalCollection<Value>
    extends InternalReadCollection<Value> {
    remove(key: any): any;
  }

  export interface InternalReadArray<Value>
    extends InternalReadCollection<Value> {}

  export interface InternalArray<Value>
    extends InternalCollection<Value>,
      InternalReadArray<Value> {
    push(item: any): any;

    insert(index: number, item: any): any;
  }

  export interface InternalReadObject<Value>
    extends InternalReadCollection<Value> {}

  export interface InternalObject<Value>
    extends InternalCollection<Value>,
      InternalReadObject<Value> {}

  export interface InternalReadAny<Value> {}

  export interface InternalAny<Value> extends InternalReadAny<Value> {
    remove(): any;
  }

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

export const fieldSize = ((
  field: Nullish<StaticImplements<AsCollectionRead>>,
) => field?.constructor.asCollection(field)?.size()) as unknown as FieldSize;

export interface FieldSize {}

export const fieldFind = ((
  field: Nullish<StaticImplements<AsCollectionRead>>,
  predicate: any,
) =>
  field?.constructor
    .asCollection(field)
    ?.find(predicate)) as unknown as FieldFind;

export interface FieldFind {}

export const fieldPush = ((
  field: Nullish<StaticImplements<AsCollection>>,
  item: any,
) => field?.constructor.asArray(field)?.push(item)) as unknown as FieldPush;

export interface FieldPush {}

export const fieldInsert = ((
  field: Nullish<StaticImplements<AsCollection>>,
  index: number,
  item: any,
) =>
  field?.constructor
    .asArray(field)
    ?.insert(index, item)) as unknown as FieldInsert;

export interface FieldInsert {}

export const fieldRemove = ((
  field: Nullish<StaticImplements<AsCollection>>,
  key?: any,
) =>
  key === undefined
    ? field?.constructor.asChild(field)?.remove()
    : field?.constructor
        .asCollection(field)
        ?.remove(key)) as unknown as FieldRemove;

export interface FieldRemove {}
