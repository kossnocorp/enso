import type { DependencyList } from "react";
import { useAtomHook } from "../../atom/hooks/index.ts";
import { useCallback } from "../../hooks/index.ts";
import { AsState } from "../../state/index.ts";
import { EnsoUtils as Utils } from "../../utils.ts";
import { StaticImplementsOld } from "../old.tsx";

export const fieldDecompose = ((
  field: Utils.Nullish<StaticImplementsOld<AsState.Read>>,
) => ({
  value: field?.constructor.asState(field).get(),
  field,
})) as unknown as FieldDecompose;

export interface FieldDecompose {}

export const useFieldDecompose = ((
  field: Utils.Nullish<StaticImplementsOld<AsState.Read>>,
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
