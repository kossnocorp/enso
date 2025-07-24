// @ts-nocheck

import { Field } from "../definition.ts";
import { FieldRef } from "./definition.ts";

//#region Type

//#region Collection

const tuple = new Field<[string, boolean, symbol]>(["1", true, Symbol("3")]);
const tupleOrUnd = new Field<[string, boolean, symbol] | undefined>([
  "1",
  true,
  Symbol("3"),
]);
const tupleOrNum = new Field<[string, boolean, symbol] | number>([
  "1",
  true,
  Symbol("3"),
]);

const arr = new Field<Array<string | boolean>>([]);
const arrOrUnd = new Field<Array<string | boolean> | undefined>([]);
const arrOrNum = new Field<Array<string | boolean> | number>([]);
const arrOrNumOrUnd = new Field<Array<string | boolean> | number | undefined>(
  [],
);

const obj = new Field<Hello>({ hello: "hi", world: true });
const objPart = new Field<Ok>({ ok: true });
const objOrUnd = new Field<Ok | undefined>({ ok: true });

const rec = new Field<Record<string, string | boolean>>({});
const prim = new Field<string | boolean>("hello");

// FieldRef#forEach
{
  // Tuple
  {
    const ref = new FieldRef(tuple);
    ref.forEach((item, index) => {
      item satisfies FieldRef<string> | FieldRef<boolean> | FieldRef<symbol>;
      // @ts-expect-error
      item satisfies FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies 0 | 1 | 2;
      // @ts-expect-error
      index.any;

      if (index === 1) {
        item.value satisfies boolean;
        // @ts-expect-error
        item.value satisfies string;
      }
    });

    ref.forEach((item) => {
      item satisfies FieldRef<string> | FieldRef<boolean> | FieldRef<symbol>;
      // @ts-expect-error
      item satisfies FieldRef<number>;
      // @ts-expect-error
      item.any;
    });
    ref.forEach(() => {});
  }

  // Array
  {
    const ref = new FieldRef(arr);
    ref.forEach((item, index) => {
      item satisfies FieldRef<string | boolean>;
      // @ts-expect-error
      item satisfies FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    ref.forEach((item) => {
      item satisfies FieldRef<string | boolean>;
      // @ts-expect-error
      item satisfies FieldRef<number>;
      // @ts-expect-error
      item.any;
    });
    ref.forEach(() => {});
  }

  // Object
  {
    // Regular
    {
      const ref = new FieldRef(obj);
      ref.forEach((item, key) => {
        item satisfies FieldRef<string> | FieldRef<boolean>;
        // @ts-expect-error
        item satisfies FieldRef<number>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Hello;
        // @ts-expect-error
        key.any;

        if (key === "hello") {
          item.value satisfies string;
          // @ts-expect-error
          item.value satisfies number;
        } else {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string;
        }
      });
      ref.forEach((item) => {});
      ref.forEach(() => {});
    }

    // Optional
    {
      const ref = new FieldRef(objPart);
      ref.forEach((item, key) => {
        item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
        // @ts-expect-error
        item satisfies FieldRef<number>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Ok;
        // @ts-expect-error
        key.any;

        if (key === "ok") {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string | undefined;
        } else {
          item.value satisfies string | undefined;
          // @ts-expect-error
          item.value satisfies boolean;
        }
      });
      ref.forEach((item) => {
        item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
        // @ts-expect-error
        item satisfies FieldRef<number>;
        // @ts-expect-error
        item.any;
      });
      ref.forEach(() => {});
    }
  }
}

//#endregion

//#endregion

//#region Helpers

interface Hello {
  hello: string;
  world: boolean;
}

interface Ok {
  ok: boolean;
  message?: string;
}

//#endregion
