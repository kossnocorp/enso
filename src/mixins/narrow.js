import { useState, useMemo, useRef, useEffect } from "react";

export function narrowMixin() {
  return function narrow(callback) {
    let matching = false;
    const payload = this.get();
    callback(payload, (narrowed) => {
      if (payload === narrowed) matching = true;
      return {};
    });
    if (matching) return this;
  };
}

export function useNarrowMixin() {
  return function useNarrow(callback) {
    const [_, rerender] = useState(0);
    const initial = useMemo(() => !!this.narrow(callback), []);
    const ref = useRef(initial);
    useEffect(
      () =>
        this.watch(() => {
          const narrowed = !!this.narrow(callback);
          if (narrowed === ref.current) return;
          ref.current = narrowed;
          rerender(Date.now());
        }),
      []
    );
    return ref.current ? this : undefined;
  };
}
