import type { DependencyList } from "react";
import { Enso } from "../../types.ts";
import { type UseFieldHook, useAtomHook } from "../../atom/hooks/index.ts";
import type { FieldOld } from "../definition.tsx";
import { EnsoUtils as Utils } from "../../utils.ts";
import { StaticImplements } from "../util.ts";
import { AsState } from "../../state/index.ts";
import { useCallback } from "../../hooks/index.ts";

// export interface As

export const fieldDecompose = ((
  field: Utils.Nullish<StaticImplements<AsState.Read>>,
) => ({
  value: field?.constructor.asState(field).get(),
  field,
})) as unknown as FieldDecompose;

export interface FieldDecompose {}

export const useFieldDecompose = ((
  field: Utils.Nullish<StaticImplements<AsState.Read>>,
  callback: any,
  deps: DependencyList,
) => {
  const getValue = useCallback(() => fieldDecompose(field), [field]);

  const shouldRender = useCallback(
    (prev: any, next: any) => !!prev && callback(next.value, prev.value),
    deps,
  );

  return useAtomHook({
    atom: field as any,
    getValue,
    shouldRender,
  });
}) as unknown as UseFieldDecompose;

export interface UseFieldDecompose {}
