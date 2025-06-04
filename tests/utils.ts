export function postpone() {
  return new Promise<void>((resolve) => setTimeout(resolve));
}
