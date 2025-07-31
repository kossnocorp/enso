import { useEffect, useRef } from "react";
import {
  type TypedHook,
  useTypedCallback,
  useTypedMemo,
} from "../../hooks/index.ts";
import { useRerender } from "../../hooks/rerender.ts";
import type { Atom } from "../index.js";

export function useAtomHook<
  Kind extends Atom.Flavor.Kind,
  Variant extends Atom.Flavor.Variant,
  Value,
  Result = Value,
>(props: UseAtomHook.Props<Kind, Variant, Value, Result>): Result | undefined {
  const enable = props.enable ?? true;
  const {
    atom,
    getValue,
    shouldRender = defaultShouldRender as TypedHook.Memoized<
      UseAtomHook.ShouldRender<Value>
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
  }>({ id: atom.id, value: initial, enable });

  // When the field changes, we update the value
  useEffect(() => {
    if (valueRef.current.id === atom.id && valueRef.current.enable === enable)
      return;

    valueRef.current = {
      id: atom.id,
      value: enable ? getValue() : undefined,
      enable,
    };
    // We don't need to rerender as the value will resolve to initial and we
    // don't want to trigger another render.
  }, [atom, enable, getValue]);

  const rerender = useRerender();

  const onUpdate = useTypedCallback(() => {
    const prevValue = valueRef.current.value;

    const nextValue = getValue();
    valueRef.current = { id: atom.id, value: nextValue, enable };

    if (shouldRender(prevValue, nextValue)) rerender();
  }, [atom, enable, getValue, valueRef, rerender, shouldRender]);

  useEffect(() => {
    if (enable === false) return;

    return watch?.({ valueRef, rerender }) || atom.watch(onUpdate);
  }, [atom, enable, valueRef, watch, rerender, onUpdate]);

  // Handle dependencies. When they change, we trigger update.
  const depsInitialized = useRef(false);
  useEffect(() => {
    if (enable === false) return;

    // Prevent unnecessary update on first render
    if (depsInitialized.current) onUpdate();
    else depsInitialized.current = true;
  }, [atom, enable, rerender, depsInitialized, onUpdate]);

  // If the ref value id doesn't match the current id, use initial value.
  // Otherwise, use the value from the ref.
  const value =
    valueRef.current.id === atom.id && valueRef.current.enable === enable
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

export namespace UseAtomHook {
  export interface Props<
    Kind extends Atom.Flavor.Kind,
    Variant extends Atom.Flavor.Variant,
    Value,
    Result = Value,
  > {
    enable?: boolean | undefined;
    atom: Atom.Envelop<Kind, Variant, Atom.Def<Value>>;
    getValue: TypedHook.Memoized<() => Value>;
    shouldRender?: TypedHook.Memoized<ShouldRender<Value>>;
    watch?: TypedHook.Memoized<Watch<Value>>;
    toResult?: TypedHook.Memoized<ToResult<Value, Result>>;
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

  export type Watch<Value> = (props: WatchProps<Value>) => Atom.Unwatch;

  export type ToResult<Value, Result> = (
    value: Value | undefined,
  ) => Result | undefined;
}
