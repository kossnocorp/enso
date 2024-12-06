import { useEffect, useMemo, useRef } from "react";
import { useRerender } from "../hooks/rerender.ts";

export function intoMixin(Self) {
  return function into(intoCallback) {
    const computed = new Self(intoCallback(this.get()));
    // [TODO] This creates a leak, so rather than holding on to the computed
    // state, store it as a weak ref and unsubscribe when it's no longer needed.
    this.watch((payload) => computed.set(intoCallback(payload)));

    return {
      from: (fromCallback) => {
        computed.watch((payload) => this.set(fromCallback(payload)));
        return computed;
      },
    };
  };
}

export function useIntoMixin(Self) {
  return function useInto(intoCallback) {
    const computed = useMemo(() => new Self(intoCallback(this.get())), []);

    useEffect(() => {
      // It's ok to trigger set here because the setting the same value won't
      // trigger any events, however for the better performance, it is better
      // if the into and from callbacks are memoized.
      computed.set(intoCallback(this.get()));
      return this.watch((payload) => computed.set(intoCallback(payload)));
    }, [intoCallback]);

    return useMemo(
      () => ({
        from: (fromCallback) => {
          useEffect(
            () => computed.watch((payload) => this.set(fromCallback(payload))),
            [computed, fromCallback]
          );
          return computed;
        },
      }),
      [computed]
    );
  };
}
