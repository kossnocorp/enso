import { AtomChange, change, coreChangesBits } from "./change/index.ts";

export function devLogChangeMaps() {
  ["atom" as const, "child" as const, "subtree" as const].forEach((type) => {
    console.log(`### ${type} ###`);
    Object.entries(change[type]).forEach(([key, value]) => {
      console.log(`${key.padStart(10, " ")}: ${devStringifyChanges(value)}`);
    });
  });
}

export function devStringifyChanges(changes: AtomChange): string {
  return `0b${changes.toString(2).padStart(Number(coreChangesBits), "0")}`;
}

export function devHumanizeChanges(
  changes: AtomChange,
  extraChange?: Record<string, bigint>,
): string {
  if (changes === 0n) return "none";
  const humanized: string[] = [];
  Object.entries(change).forEach(([category, map]) => {
    Object.entries(map).forEach(([key, value]) => {
      if (changes & value) {
        humanized.push(`change.${category}.${key}`);
      }
    });
  });
  if (extraChange) {
    Object.entries(extraChange).forEach(([key, value]) => {
      if (changes & value) {
        humanized.push(`extra.${key}`);
      }
    });
  }
  return humanized.join(" | ");
}
