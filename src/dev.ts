import { change, coreChangesBits, FieldChange } from "./change/index.ts";

export function devLogChangeMaps() {
  ["field" as const, "child" as const, "subtree" as const].forEach((type) => {
    console.log(`### ${type} ###`);
    Object.entries(change[type]).forEach(([key, value]) => {
      console.log(`${key.padStart(10, " ")}: ${devStringifyChanges(value)}`);
    });
  });
}

export function devStringifyChanges(changes: FieldChange): string {
  return `0b${changes.toString(2).padStart(Number(coreChangesBits), "0")}`;
}

export function devHumanizeChanges(changes: FieldChange): string {
  if (changes === 0n) return "none";
  const humanized: string[] = [];
  Object.entries(change).forEach(([category, map]) => {
    Object.entries(map).forEach(([key, value]) => {
      if ((changes & value) === value) {
        humanized.push(`change.${category}.${key}`);
      }
    });
  });
  return humanized.join(" | ");
}
