import { act, screen } from "@testing-library/react";
import { useRef } from "react";

export function postpone() {
  return new Promise<void>((resolve) => setTimeout(resolve));
}

export function useRenderCount() {
  const counterRef = useRef(0);
  counterRef.current += 1;
  return counterRef.current;
}

export async function actClick(title: string) {
  return act(() => screen.getByText(title).click());
}
