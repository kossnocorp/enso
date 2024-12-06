import { useEffect, useMemo, useRef } from "react";
import { useRerender } from "../hooks/rerender.ts";

export function discriminateMixin(stateField) {
  return function discriminate(discriminator) {
    return {
      discriminator: this.$[discriminator]?.get(),
      [stateField]: this,
    };
  };
}

export function useDiscriminateMixin() {
  return function useDiscriminate(discriminator) {
    const rerender = useRerender();
    const initial = useMemo(() => this.discriminate(discriminator), []);
    const ref = useRef(initial);
    useEffect(
      () =>
        this.watch(() => {
          const discriminated = this.discriminate(discriminator);
          if (discriminated.discriminator !== ref.current.discriminator)
            rerender();
          ref.current = discriminated;
        }),
      []
    );
    return ref.current;
  };
}
