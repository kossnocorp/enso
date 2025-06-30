import type { DependencyList } from "react";
import type { Field } from "../index.tsx";
import {
  type UseFieldHook,
  useFieldHook,
  useTypedCallback as useCallback,
} from "../hook/index.ts";
import { Enso } from "../../types.ts";

export function fieldDecompose<FieldType>(
  field: FieldType,
): FieldDecompose.Decomposed<FieldType> {
  return {
    value: (field as any).get(),
    field,
  } as any;
}

export namespace FieldDecompose {
  export type Decomposed<FieldType> =
    FieldType extends Field<infer Value>
      ? Value extends Value
        ? {
            value: Value;
            field: Enso.TransferBrands<Field<Value>, FieldType>;
          }
        : never
      : never;
}

export function useFieldDecompose<FieldType>(
  field: FieldType,
  callback: UseFieldDecompose.Callback<FieldType>,
  deps: DependencyList,
): FieldDecompose.Decomposed<FieldType> {
  const getValue = useCallback(() => fieldDecompose(field), [field]);

  const shouldRender = useCallback<
    UseFieldHook.ShouldRender<FieldDecompose.Decomposed<FieldType>>
  >(
    (prev, next) => !!prev && (callback as any)(next.value, prev.value),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
    deps,
  );

  return useFieldHook({
    field: field as any,
    getValue,
    shouldRender,
  }) as FieldDecompose.Decomposed<FieldType>;
}

export namespace UseFieldDecompose {
  export type Callback<FieldType> = (
    newValue: CallbackValue<FieldType>,
    prevValue: CallbackValue<FieldType>,
  ) => boolean;

  export type CallbackValue<FieldType> =
    FieldType extends Field<infer Value> ? Value : never;
}
