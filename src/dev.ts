import { change } from "./change/index.ts";

export function debugChangeMaps() {
  ["field" as const, "child" as const, "subtree" as const].forEach((type) => {
    console.log(`### ${type} ###`);
    Object.entries(change[type]).forEach(([key, value]) => {
      console.log(
        `${key.padStart(10, " ")}: ${value.toString(2).padStart(48, "0")}`
      );
    });
  });
}
