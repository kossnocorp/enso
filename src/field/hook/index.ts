import {
  DependencyList,
  useCallback as reactUseCallback,
  useMemo as reactUseMemo,
  useEffect,
  useRef,
} from "react";
import { useRerender } from "../../hooks/rerender.ts";
import { Enso } from "../../types.ts";
import { Field } from "../index.tsx";

export function useFieldHook<Payload, Value, Result = Value>(
  props: UseFieldHook.Props<Payload, Value, Result>,
): Result | undefined {
  const enable = props.enable ?? true;
  const {
    field,
    getValue,
    shouldRender = defaultShouldRender as FieldHook.Memoized<
      UseFieldHook.ShouldRender<Value>
    >,
    watch,
    toResult,
  } = props;

  const initial: Value = useTypedMemo(
    () => (enable ? getValue() : undefined),
    [enable, getValue],
  );
  const valueRef = useRef<{
    id: string;
    value: Value | undefined;
    enable: boolean;
  }>({ id: field.id, value: initial, enable });

  // When the field changes, we update the value
  useEffect(() => {
    if (valueRef.current.id === field.id && valueRef.current.enable === enable)
      return;

    valueRef.current = {
      id: field.id,
      value: enable ? getValue() : undefined,
      enable,
    };
    // We don't need to rerender as the value will resolve to initial and we
    // don't want to trigger another render.
  }, [field, enable, getValue]);

  const rerender = useRerender();

  const onUpdate = useTypedCallback(() => {
    const prevValue = valueRef.current.value;

    const nextValue = getValue();
    valueRef.current = { id: field.id, value: nextValue, enable };

    if (shouldRender(prevValue, nextValue)) rerender();
  }, [field, enable, getValue, valueRef, rerender, shouldRender]);

  useEffect(() => {
    if (enable === false) return;

    return watch?.({ valueRef, rerender }) || field.watch(onUpdate);
  }, [field, enable, valueRef, watch, rerender, onUpdate]);

  // Handle dependencies. When they change, we trigger update.
  const depsInitialized = useRef(false);
  useEffect(() => {
    if (enable === false) return;

    // Prevent unnecessary update on first render
    if (depsInitialized.current) onUpdate();
    else depsInitialized.current = true;
  }, [field, enable, rerender, depsInitialized, onUpdate]);

  // If the ref value id doesn't match the current id, use initial value.
  // Otherwise, use the value from the ref.
  const value =
    valueRef.current.id === field.id && valueRef.current.enable === enable
      ? valueRef.current.value
      : initial;

  const result = enable ? value : undefined;
  return toResult ? toResult(result) : (result as Result);
}

function defaultShouldRender<Value>(
  prev: Value | undefined,
  next: Value,
): boolean {
  return prev !== next;
}

export namespace UseFieldHook {
  export interface Props<Payload, Value, Result = Value> {
    enable?: boolean | undefined;
    field: Field<Payload>;
    getValue: FieldHook.Memoized<() => Value>;
    shouldRender?: FieldHook.Memoized<ShouldRender<Value>>;
    watch?: FieldHook.Memoized<Watch<Value>>;
    toResult?: FieldHook.Memoized<ToResult<Value, Result>>;
  }

  export interface Ref<Value> {
    id: string;
    value: Value | undefined;
    enable: boolean;
  }

  export type ShouldRender<Value> = (
    prevValue: Value | undefined,
    nextValue: Value,
  ) => boolean;

  export interface WatchProps<Value> {
    valueRef: React.MutableRefObject<Ref<Value>>;
    rerender: () => void;
  }

  export type Watch<Value> = (props: WatchProps<Value>) => Enso.Unwatch;

  export type ToResult<Value, Result> = (
    value: Value | undefined,
  ) => Result | undefined;
}

export function useTypedMemo<Type>(
  factory: () => Type,
  deps: DependencyList,
): FieldHook.Memoized<Type> {
  return reactUseMemo(factory, deps) as FieldHook.Memoized<Type>;
}

export function useTypedCallback<Type extends Function>(
  callback: Type,
  deps: DependencyList,
): FieldHook.Memoized<Type> {
  return reactUseCallback(callback, deps) as FieldHook.Memoized<Type>;
}

export namespace FieldHook {
  export type Memoized<Type> = Type & { [memoBrand]: true };

  declare const memoBrand: unique symbol;

  export type MemoizedHook<Type, Arg = Type> = (
    arg: Arg,
    deps: DependencyList,
  ) => Memoized<Type>;

  export interface FieldInterface<Payload> {
    id: string;
    watch(callback: Enso.WatchCallback<Payload>, sync?: boolean): Enso.Unwatch;
  }
}
