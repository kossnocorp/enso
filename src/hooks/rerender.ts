import { useMemo, useState } from "react";

export function useRerender() {
  const [, setRerender] = useState(0);
  const rerender = useMemo(
    () => () => setRerender((prev) => prev + 1),
    [setRerender],
  );
  return rerender;
}
