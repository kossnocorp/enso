import { atomChange, changesBits } from "../src/index.ts";

// Test the changes bits overflow.
const bits = BigInt(Object.keys(atomChange).length);
if (bits > changesBits)
  throw new Error(
    `Field changes bits overflow. Maximum changes bits is ${changesBits} but got ${bits}.`,
  );
