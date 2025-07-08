import {
  DependencyList,
  useCallback as reactUseCallback,
  useMemo as reactUseMemo,
  useEffect,
  useRef,
} from "react";

export function useTypedMemo<Type>(
  factory: () => Type,
  deps: DependencyList,
): TypedHook.Memoized<Type> {
  return reactUseMemo(factory, deps) as TypedHook.Memoized<Type>;
}

export { useTypedMemo as useMemo };

export function useTypedCallback<Type extends Function>(
  callback: Type,
  deps: DependencyList,
): TypedHook.Memoized<Type> {
  return reactUseCallback(callback, deps) as TypedHook.Memoized<Type>;
}

export { useTypedCallback as useCallback };

export namespace TypedHook {
  export type Memoized<Type> = Type & { [memoBrand]: true };

  declare const memoBrand: unique symbol;

  // export type MemoizedHook<Type, Arg = Type> = (
  //   arg: Arg,
  //   deps: DependencyList,
  // ) => Memoized<Type>;
}
