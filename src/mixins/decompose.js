import { useEffect, useMemo, useRef } from "react";
import { useRerender } from "../hooks/rerender.ts";

export function decomposeMixin(stateField) {
  return function decompose() {
    return {
      value: this.get(),
      [stateField]: this,
    };
  };
}

export function useDecomposeMixin() {
  return function useDecompose(callback) {
    const rerender = useRerender();
    const initial = useMemo(() => this.decompose(), []);
    const ref = useRef(initial);
    const prevRef = useRef(ref.current.value);
    useEffect(
      () =>
        this.watch((next) => {
          ref.current = this.decompose();
          if (callback(next, prevRef.current)) rerender();
          prevRef.current = next;
        }),
      []
    );
    return ref.current;
  };
}
