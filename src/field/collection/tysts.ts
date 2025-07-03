import { Enso } from "../../types.ts";
import { DetachedValue, Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";
import {
  fieldEach,
  fieldFilter,
  fieldFind,
  fieldInsert,
  fieldMap,
  fieldPush,
  fieldRemove,
  fieldSize,
} from "./index.ts";

const arr = new Field<Array<string | boolean>>([]);
const arrOrUnd = new Field<Array<string | boolean> | undefined>([]);
const arrOrNum = new Field<Array<string | boolean> | number>([]);
const arrOrNumOrUnd = new Field<Array<string | boolean> | number | undefined>(
  [],
);

const obj = new Field<Hello>({ hello: "hi", world: true });
const objPart = new Field<Ok>({ ok: true });
const objOrUnd = new Field<Ok | undefined>({ ok: true });

const tuple = new Field<[string, boolean, symbol]>(["1", true, Symbol("3")]);
const tupleOrUnd = new Field<[string, boolean, symbol] | undefined>([
  "1",
  true,
  Symbol("3"),
]);

const rec = new Field<Record<string, string | boolean>>({});
const prim = new Field<string | boolean>("hello");

//#region fieldEach
{
  // Array
  {
    // Field
    {
      // Regular
      {
        const result = fieldEach(arr, (item, index) => {
          item satisfies Field.Detachable<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });
        result satisfies void;
        fieldEach(arr, (item) => {
          item satisfies Field.Detachable<string | boolean>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(arr, () => {});
      }

      // Undefined
      {
        fieldEach(arrOrUnd.try(), (item, index) => {
          item satisfies Field.Detachable<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });
        fieldEach(arrOrUnd.try(), (item) => {});
        // @ts-expect-error
        fieldEach(arrOrUnd, () => {});
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(arr);
        fieldEach(ref, (item, index) => {
          item satisfies FieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });
        fieldEach(ref, (item) => {
          item satisfies FieldRef<string | boolean>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(ref, () => {});
      }

      // Undefined
      {
        const refUnd = new FieldRef(arrOrUnd);
        fieldEach(refUnd.try(), (item, index) => {
          item satisfies FieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });
        // @ts-expect-error
        fieldEach(refUnd, () => {});
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({
          type: "direct",
          field: arr,
        });
        fieldEach(maybe, (item, index) => {
          item satisfies MaybeFieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });
        fieldEach(maybe, (item) => {
          item satisfies MaybeFieldRef<string | boolean>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(maybe, () => {});
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({
          type: "direct",
          field: arrOrUnd,
        });
        fieldEach(maybeUnd.try(), (item, index) => {
          item satisfies MaybeFieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });
        fieldEach(
          // @ts-expect-error
          new MaybeFieldRef({ type: "direct", field: arrOrUnd }),
          () => {},
        );
      }
    }
  }

  // Object
  {
    // Field
    {
      // Regular
      {
        const result = fieldEach(obj, (item, key) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
          }
        });
        result satisfies void;

        fieldEach(obj, (item) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(obj, () => {});
      }

      // Optional
      {
        fieldEach(objPart, (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        fieldEach(objPart, (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(objPart, () => {});
      }

      // Undefined
      {
        fieldEach(objOrUnd.try(), (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        // @ts-expect-error
        fieldEach(objOrUnd, () => {});
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(obj);
        fieldEach(ref, (item, key) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
          }
        });
        fieldEach(ref, (item) => {});
        fieldEach(ref, () => {});
      }

      // Optional
      {
        const refOpt = new FieldRef(objPart);
        fieldEach(refOpt, (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        fieldEach(refOpt, (item) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(refOpt, () => {});
      }

      // Undefined
      {
        const refUnd = new FieldRef(objOrUnd);
        fieldEach(refUnd.try(), (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        // @ts-expect-error
        fieldEach(refUnd, () => {});
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({
          type: "direct",
          field: obj,
        });
        fieldEach(maybe, (item, key) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
          }
        });
        fieldEach(maybe, (item) => {});
        fieldEach(maybe, () => {});
      }

      // Optional
      {
        const maybeOpt = new MaybeFieldRef({
          type: "direct",
          field: objPart,
        });
        fieldEach(maybeOpt, (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        fieldEach(maybeOpt, (item) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(maybeOpt, () => {});
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({
          type: "direct",
          field: objOrUnd,
        });
        fieldEach(maybeUnd.try(), (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        // @ts-expect-error
        fieldEach(maybeUnd, () => {});
      }
    }
  }

  // Tuple
  {
    // Field
    {
      // Regular
      {
        const result = fieldEach(tuple, (item, index) => {
          item satisfies Field<string> | Field<boolean> | Field<symbol>;
          // @ts-expect-error
          item.any;

          index satisfies 0 | 1 | 2;
          // @ts-expect-error
          index.any;

          if (index === 1) {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
          }
        });
        result satisfies void;

        fieldEach(tuple, (item) => {
          item satisfies Field<string> | Field<boolean> | Field<symbol>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(arr, () => {});
      }

      // Undefined
      {
        fieldEach(tupleOrUnd.try(), (item, index) => {
          item satisfies Field<string> | Field<boolean> | Field<symbol>;
          // @ts-expect-error
          item.any;

          index satisfies 0 | 1 | 2;
          // @ts-expect-error
          index.any;
        });
        fieldEach(tupleOrUnd.try(), (item) => {});
        // @ts-expect-error
        fieldEach(tupleOrUnd, () => {});
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(tuple);
        fieldEach(ref, (item, index) => {
          item satisfies
            | FieldRef<string>
            | FieldRef<boolean>
            | FieldRef<symbol>;
          // @ts-expect-error
          item.any;

          index satisfies 0 | 1 | 2;
          // @ts-expect-error
          index.any;

          if (index === 1) {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
          }
        });

        fieldEach(ref, (item) => {
          item satisfies
            | FieldRef<string>
            | FieldRef<boolean>
            | FieldRef<symbol>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(ref, () => {});
      }

      // Undefined
      {
        const refUnd = new FieldRef(tupleOrUnd);
        fieldEach(refUnd.try(), (item, index) => {
          item satisfies
            | FieldRef<string>
            | FieldRef<boolean>
            | FieldRef<symbol>;
          // @ts-expect-error
          item.any;

          index satisfies 0 | 1 | 2;
          // @ts-expect-error
          index.any;
        });

        // @ts-expect-error
        fieldEach(refUnd, () => {});
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({
          type: "direct",
          field: tuple,
        });
        fieldEach(maybe, (item, index) => {
          item satisfies
            | MaybeFieldRef<string>
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<symbol>;
          // @ts-expect-error
          item.any;

          index satisfies 0 | 1 | 2;
          // @ts-expect-error
          index.any;

          if (index === 1) {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
          }
        });

        fieldEach(maybe, (item) => {
          item satisfies
            | MaybeFieldRef<string>
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<symbol>;
          // @ts-expect-error
          item.any;
        });
        fieldEach(maybe, () => {});
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({
          type: "direct",
          field: tupleOrUnd,
        });
        fieldEach(maybeUnd.try(), (item, index) => {
          item satisfies
            | MaybeFieldRef<string>
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<symbol>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;
        });

        fieldEach(
          // @ts-expect-error
          new MaybeFieldRef({ type: "direct", field: maybeUnd }),
          () => {},
        );
      }
    }
  }
}
//#endregion

//#region fieldMap
{
  // Array
  {
    // Field
    {
      // Regular
      {
        const result = fieldMap(arr, (item, index) => {
          item satisfies Field.Detachable<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;

          return Number(item.get());
        });
        result satisfies number[];
      }

      // Undefined
      {
        fieldMap(arrOrUnd.try(), (item, index) => {
          item satisfies Field.Detachable<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;

          return Number(item.get());
        });
        // @ts-expect-error
        fieldMap(arrOrUnd, () => {});
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(arr);
        const refResult = fieldMap(ref, (item, index) => {
          item satisfies FieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;

          return Number(item.get());
        });
        refResult satisfies number[];
      }

      // Undefined
      {
        const refUnd = new FieldRef(arrOrUnd);
        fieldMap(refUnd.try(), (item, index) => {
          item satisfies FieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;

          return Number(item.get());
        });
        // @ts-expect-error
        fieldMap(refUnd, () => {});
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({
          type: "direct",
          field: arr,
        });
        const maybeResult = fieldMap(maybe, (item, index) => {
          item satisfies MaybeFieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;

          return Number(item.get());
        });
        maybeResult satisfies number[];
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({
          type: "direct",
          field: arrOrUnd,
        });
        fieldMap(maybeUnd.try(), (item, index) => {
          item satisfies MaybeFieldRef<string | boolean>;
          // @ts-expect-error
          item.any;

          index satisfies number;
          // @ts-expect-error
          index.any;

          return Number(item.get());
        });
        fieldMap(
          // @ts-expect-error
          new MaybeFieldRef({ type: "direct", field: arrOrUnd }),
          () => {},
        );
      }
    }
  }

  // Object
  {
    // Field
    {
      // Regular
      {
        const result = fieldMap(obj, (item, key) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true ? 1 : 0;
          }
        });
        result satisfies number[];
        fieldMap(obj, (item) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;
          return 0;
        });
        fieldMap(obj, () => 0);
      }

      // Optional
      {
        const resultOpt = fieldMap(objPart, (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get() === true ? 1 : 0;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return item.get()?.length ?? 0;
          }
        });
        resultOpt satisfies number[];
        fieldMap(objPart, (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
          return 0;
        });
        fieldMap(objPart, () => 0);
      }

      // Undefined
      {
        fieldMap(objOrUnd.try(), (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get() === true ? 1 : 0;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return item.get()?.length ?? 0;
          }
        });
        fieldMap(objOrUnd.try(), (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
          return 0;
        });
        fieldMap(objOrUnd.try(), () => 0);
        // @ts-expect-error
        fieldMap(objOrUnd, () => {});
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(obj);
        const refResult = fieldMap(ref, (item, key) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true ? 1 : 0;
          }
        });
        refResult satisfies number[];
      }

      // Optional
      {
        const refOpt = new FieldRef(objPart);
        const refOptResult = fieldMap(refOpt, (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get() === true ? 1 : 0;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return item.get()?.length ?? 0;
          }
        });
        refOptResult satisfies number[];
      }

      // Undefined
      {
        const refUnd = new FieldRef(objOrUnd);
        fieldMap(refUnd.try(), (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        // @ts-expect-error
        fieldMap(refUnd, () => {});
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({
          type: "direct",
          field: obj,
        });
        const maybeResult = fieldMap(maybe, (item, key) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true ? 1 : 0;
          }
        });
        maybeResult satisfies number[];
      }

      // Optional
      {
        const maybeOpt = new MaybeFieldRef({
          type: "direct",
          field: objPart,
        });
        const maybeOptResult = fieldMap(maybeOpt, (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get() === true ? 1 : 0;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return item.get()?.length ?? 0;
          }
        });
        maybeOptResult satisfies number[];
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({
          type: "direct",
          field: objOrUnd,
        });
        fieldMap(maybeUnd.try(), (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
          }
        });
        // @ts-expect-error
        fieldMap(maybeUnd, () => {});
      }
    }
  }
}
//#endregion

//#region fieldSize
{
  // Array
  {
    // Field
    {
      const size = fieldSize(arr);
      size satisfies number;
      // @ts-expect-error
      size.any;

      // @ts-expect-error
      fieldSize(arrOrUnd.try());
      // @ts-expect-error
      fieldSize(arrOrNum);
    }

    // FieldRef
    {
      const ref = new FieldRef(arr);
      const size = fieldSize(ref);
      size satisfies number;
      // @ts-expect-error
      size.any;

      // @ts-expect-error
      fieldSize(new FieldRef(arrOrUnd.try()));
      // @ts-expect-error
      fieldSize(new FieldRef(arrOrNum));
    }

    // MaybeFieldRef
    {
      const maybe = new MaybeFieldRef({
        type: "direct",
        field: arr,
      });
      const size = fieldSize(maybe);
      size satisfies number;
      // @ts-expect-error
      size.any;

      // @ts-expect-error
      fieldSize(new MaybeFieldRef({ type: "direct", field: arrOrUnd.try() }));
      // @ts-expect-error
      fieldSize(new MaybeFieldRef({ type: "direct", field: arrOrNum }));
    }
  }

  // Object
  {
    // Field
    {
      const size = fieldSize(obj);
      size satisfies number;
      // @ts-expect-error
      size.any;

      // @ts-expect-error
      fieldSize(objOrUnd.try());
      // @ts-expect-error
      fieldSize(objOrUnd);
    }

    // FieldRef
    {
      const ref = new FieldRef(obj);
      const size = fieldSize(ref);
      size satisfies number;
      // @ts-expect-error
      size.any;

      // @ts-expect-error
      fieldSize(new FieldRef(objOrUnd.try()));
      // @ts-expect-error
      fieldSize(new FieldRef(objOrUnd));
    }

    // MaybeFieldRef
    {
      const maybe = new MaybeFieldRef({
        type: "direct",
        field: obj,
      });
      const size = fieldSize(maybe);
      size satisfies number;
      // @ts-expect-error
      size.any;

      // @ts-expect-error
      fieldSize(new MaybeFieldRef({ type: "direct", field: objOrUnd.try() }));
      // @ts-expect-error
      fieldSize(new MaybeFieldRef({ type: "direct", field: objOrUnd }));
    }
  }
}
//#endregion

//#region fieldFind
{
  // Array
  {
    // Field
    {
      // Regular
      {
        const result = fieldFind(arr, (item, index) => {
          item satisfies Field.Detachable<string> | Field.Detachable<boolean>;
          index satisfies number;
          return item.get() === "hello";
        });

        result satisfies
          | Field.Detachable<string>
          | Field.Detachable<boolean>
          | undefined;
        // @ts-expect-error
        result satisfies Field.Detachable<string> | Field.Detachable<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(arr, (item) => {
          item satisfies Field<string> | Field<boolean>;
          return true;
        });
        fieldFind(arr, () => true);

        fieldFind(arr, (_item) => 0);
        fieldFind(arr, (_item) => "");
        fieldFind(arr, (_item) => null);
        // @ts-expect-error
        fieldFind(arr, (item) => item.toExponential());
      }

      // Undefined
      {
        const result = fieldFind(arrOrUnd.try(), (item, index) => {
          item satisfies Field.Detachable<string> | Field.Detachable<boolean>;
          index satisfies number;
          return item.get() === "hello";
        });

        result satisfies
          | Field.Detachable<string>
          | Field.Detachable<boolean>
          | undefined;
        // @ts-expect-error
        result satisfies Field.Detachable<string> | Field.Detachable<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(arrOrUnd.try(), (item) => item);
        fieldFind(arrOrUnd.try(), () => true);

        // @ts-expect-error
        fieldFind(arrOrUnd, (item) => item);
        // @ts-expect-error
        fieldFind(arrOrUnd, () => true);

        fieldFind(arrOrUnd.try(), (_item) => 0);
        fieldFind(arrOrUnd.try(), (_item) => "");
        fieldFind(arrOrUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFind(arrOrUnd.try(), (item) => item.toExponential());
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(arr);
        const result = fieldFind(ref, (item, index) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          index satisfies number;
          return item.get() === "hello";
        });

        result satisfies FieldRef<string> | FieldRef<boolean> | undefined;
        // @ts-expect-error
        result satisfies FieldRef<string> | Field<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(ref, (item) => item);
        fieldFind(ref, () => true);

        fieldFind(ref, (_item) => 0);
        fieldFind(ref, (_item) => "");
        fieldFind(ref, (_item) => null);
        // @ts-expect-error
        fieldFind(ref.try(), (item) => item.toExponential());
      }

      // Undefined
      {
        const refUnd = new FieldRef(arrOrUnd);
        const result = fieldFind(refUnd.try(), (item, index) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          index satisfies number;
          return item.get() === "hello";
        });

        result satisfies FieldRef<string> | FieldRef<boolean> | undefined;
        // @ts-expect-error
        result satisfies FieldRef<string> | Field<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(refUnd.try(), (item) => item);
        fieldFind(refUnd.try(), () => true);

        // @ts-expect-error
        fieldFind(refUnd, (item) => item);
        // @ts-expect-error
        fieldFind(refUnd, () => true);

        fieldFind(refUnd.try(), (_item) => 0);
        fieldFind(refUnd.try(), (_item) => "");
        fieldFind(refUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFind(refUnd.try(), (item) => item.toExponential());
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({ type: "direct", field: arr });
        const result = fieldFind(maybe, (item, index) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          index satisfies number;
          return item.get() === "hello";
        });

        result satisfies
          | MaybeFieldRef<string>
          | MaybeFieldRef<boolean>
          | undefined;
        // @ts-expect-error
        result satisfies MaybeFieldRef<string> | Field<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(maybe, (item) => item);
        fieldFind(maybe, () => true);

        fieldFind(maybe, (_item) => 0);
        fieldFind(maybe, (_item) => "");
        fieldFind(maybe, (_item) => null);
        // @ts-expect-error
        fieldFind(maybe, (item) => item.toExponential());
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({ type: "direct", field: arrOrUnd });
        const result = fieldFind(maybeUnd.try(), (item, index) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          index satisfies number;
          return item.get() === "hello";
        });

        result satisfies
          | MaybeFieldRef<string>
          | MaybeFieldRef<boolean>
          | undefined;
        // @ts-expect-error
        result satisfies MaybeFieldRef<string> | Field<boolean>;
        // @ts-expect-error
        resultOpt satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(maybeUnd.try(), (item) => item);
        fieldFind(maybeUnd.try(), () => true);

        // @ts-expect-error
        fieldFind(maybeUnd, (item) => item);
        // @ts-expect-error
        fieldFind(maybeUnd, () => true);

        fieldFind(maybeUnd.try(), (_item) => 0);
        fieldFind(maybeUnd.try(), (_item) => "");
        fieldFind(maybeUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFind(maybeUnd.try(), (item) => item.toExponential());
      }
    }
  }

  // Object
  {
    // Field
    {
      // Regular
      {
        const result = fieldFind(obj, (item, key) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length > 0;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true ? 1 : 0;
          }
        });

        result satisfies Field<string> | Field<boolean> | undefined;
        // @ts-expect-error
        result satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        resultOpt satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(obj, (item) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;
          return true;
        });
        fieldFind(obj, () => true);

        fieldFind(obj, (item) => item);
        fieldFind(obj, (_item) => 0);
        fieldFind(obj, (_item) => "");
        fieldFind(obj, (_item) => null);
        // @ts-expect-error
        fieldFind(obj, (item) => item.toExponential());
      }

      // Optional
      {
        const resultOpt = fieldFind(objPart, (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });
        resultOpt satisfies
          | Field<string | undefined>
          | Field<boolean>
          | undefined;
        // @ts-expect-error
        resultOpt satisfies Field<string | undefined> | Field<boolean>;
        // @ts-expect-error
        resultOpt satisfies undefined;
        // @ts-expect-error
        resultOpt.any;

        fieldFind(objPart, (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
          return true;
        });
        fieldFind(objPart, () => true);
      }

      // Undefined
      {
        const result = fieldFind(objOrUnd.try(), (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies Field<boolean> | Field<string | undefined> | undefined;
        // @ts-expect-error
        result satisfies Field<boolean> | Field<string | undefined>;
        // @ts-expect-error
        resultOpt satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(objOrUnd.try(), (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
          return true;
        });
        fieldFind(objOrUnd.try(), () => true);
        fieldFind(objOrUnd.try(), (_item) => 0);
        fieldFind(objOrUnd.try(), (_item) => "");
        fieldFind(objOrUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFind(objOrUnd.try(), (item) => item.toExponential());
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(obj);
        const result = fieldFind(ref, (item, key) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          key satisfies keyof Hello;
          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length > 0;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true;
          }
        });

        result satisfies FieldRef<string> | FieldRef<boolean> | undefined;
        // @ts-expect-error
        result satisfies FieldRef<string> | FieldRef<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(ref, (item) => item);
        fieldFind(ref, (_item) => 0);
        fieldFind(ref, (_item) => "");
        fieldFind(ref, (_item) => null);
        // @ts-expect-error
        fieldFind(ref, (item) => item.toExponential());
      }

      // Optional
      {
        const refOpt = new FieldRef(objPart);
        const result = fieldFind(refOpt, (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies
          | FieldRef<boolean>
          | FieldRef<string | undefined>
          | undefined;
        // @ts-expect-error
        result satisfies FieldRef<boolean> | FieldRef<string | undefined>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(refOpt, (item) => item);
        fieldFind(refOpt, (_item) => 0);
        fieldFind(refOpt, (_item) => "");
        fieldFind(refOpt, (_item) => null);
        // @ts-expect-error
        fieldFind(refOpt, (item) => item.get().toExponential());
      }

      // Undefined
      {
        const refUnd = new FieldRef(objOrUnd);
        const result = fieldFind(refUnd.try(), (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies
          | FieldRef<boolean>
          | FieldRef<string | undefined>
          | undefined;
        // @ts-expect-error
        result satisfies FieldRef<boolean> | FieldRef<string | undefined>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(refUnd.try(), (item) => item);
        fieldFind(refUnd.try(), (_item) => 0);
        fieldFind(refUnd.try(), (_item) => "");
        fieldFind(refUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFind(refUnd.try(), (item) => item.toExponential());
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({ type: "direct", field: obj });
        const result = fieldFind(maybe, (item, key) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          key satisfies keyof Hello;
          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length > 0;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true;
          }
        });

        result satisfies
          | MaybeFieldRef<string>
          | MaybeFieldRef<boolean>
          | undefined;
        // @ts-expect-error
        result satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(maybe, (item) => item);
        fieldFind(maybe, (_item) => 0);
        fieldFind(maybe, (_item) => "");
        fieldFind(maybe, (_item) => null);
        // @ts-expect-error
        fieldFind(maybe, (item) => item.toExponential());
      }

      // Optional
      {
        const maybeOpt = new MaybeFieldRef({ type: "direct", field: objPart });
        const result = fieldFind(maybeOpt, (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies
          | MaybeFieldRef<boolean>
          | MaybeFieldRef<string | undefined>
          | undefined;
        // @ts-expect-error
        result satisfies
          | MaybeFieldRef<boolean>
          | MaybeFieldRef<string | undefined>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(maybeOpt, (item) => item);
        fieldFind(maybeOpt, (_item) => 0);
        fieldFind(maybeOpt, (_item) => "");
        fieldFind(maybeOpt, (_item) => null);
        // @ts-expect-error
        fieldFind(maybeOpt, (item) => item.toExponential());
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({ type: "direct", field: objOrUnd });
        const result = fieldFind(maybeUnd.try(), (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies
          | MaybeFieldRef<boolean>
          | MaybeFieldRef<string | undefined>
          | undefined;
        // @ts-expect-error
        result satisfies
          | MaybeFieldRef<boolean>
          | MaybeFieldRef<string | undefined>;
        // @ts-expect-error
        result satisfies undefined;
        // @ts-expect-error
        result.any;

        fieldFind(maybeUnd.try(), (item) => item);
        fieldFind(maybeUnd.try(), (_item) => 0);
        fieldFind(maybeUnd.try(), (_item) => "");
        fieldFind(maybeUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFind(maybeUnd.try(), (item) => item.toExponential());
      }
    }
  }
}
//#endregion

//#region fieldFilter
{
  // Array
  {
    // Field
    {
      // Regular
      {
        const result = fieldFilter(arr, (item, index) => {
          item satisfies Field.Detachable<string> | Field.Detachable<boolean>;
          index satisfies number;
          return true;
        });

        result satisfies Array<
          Field.Detachable<string> | Field.Detachable<boolean>
        >;
        // @ts-expect-error
        result.any;

        fieldFilter(arr, (item) => {
          item satisfies Field.Detachable<string> | Field.Detachable<boolean>;
          return true;
        });
        fieldFilter(arr, () => true);

        fieldFilter(arr, (_item) => 0);
        fieldFilter(arr, (_item) => "");
        fieldFilter(arr, (_item) => null);
        // @ts-expect-error
        fieldFilter(arr, (item) => item.toExponential());
      }

      // Undefined
      {
        const result = fieldFilter(arrOrUnd.try(), (item, index) => {
          item satisfies Field.Detachable<string> | Field.Detachable<boolean>;
          index satisfies number;
          return true;
        });

        result satisfies Array<
          Field.Detachable<string> | Field.Detachable<boolean>
        >;
        // @ts-expect-error
        result.any;

        fieldFilter(arrOrUnd.try(), (item) => item);
        fieldFilter(arrOrUnd.try(), () => true);

        // @ts-expect-error
        fieldFilter(arrOrUnd, (item) => item);
        // @ts-expect-error
        fieldFilter(arrOrUnd, () => true);

        fieldFilter(arrOrUnd.try(), (_item) => 0);
        fieldFilter(arrOrUnd.try(), (_item) => "");
        fieldFilter(arrOrUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFilter(arrOrUnd.try(), (item) => item.toExponential());
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(arr);
        const result = fieldFilter(ref, (item, index) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          index satisfies number;
          return true;
        });

        result satisfies Array<FieldRef<string> | FieldRef<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(ref, (item) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          return true;
        });
        fieldFilter(ref, () => true);

        fieldFilter(ref, (_item) => 0);
        fieldFilter(ref, (_item) => "");
        fieldFilter(ref, (_item) => null);
        // @ts-expect-error
        fieldFilter(ref, (item) => item.toExponential());
      }

      // Undefined
      {
        const refUnd = new FieldRef(arrOrUnd);
        const result = fieldFilter(refUnd.try(), (item, index) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          index satisfies number;
          return true;
        });

        result satisfies Array<FieldRef<string> | FieldRef<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(refUnd.try(), (item) => item);
        fieldFilter(refUnd.try(), () => true);

        // @ts-expect-error
        fieldFilter(refUnd, (item) => item);
        // @ts-expect-error
        fieldFilter(refUnd, () => true);

        fieldFilter(refUnd.try(), (_item) => 0);
        fieldFilter(refUnd.try(), (_item) => "");
        fieldFilter(refUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFilter(refUnd.try(), (item) => item.toExponential());
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({ type: "direct", field: arr });
        const result = fieldFilter(maybe, (item, index) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          index satisfies number;
          return true;
        });

        result satisfies Array<MaybeFieldRef<string> | MaybeFieldRef<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(maybe, (item) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          return true;
        });
        fieldFilter(maybe, () => true);

        fieldFilter(maybe, (_item) => 0);
        fieldFilter(maybe, (_item) => "");
        fieldFilter(maybe, (_item) => null);
        // @ts-expect-error
        fieldFilter(maybe, (item) => item.toExponential());
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({ type: "direct", field: arrOrUnd });
        const result = fieldFilter(maybeUnd.try(), (item, index) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          index satisfies number;
          return true;
        });

        result satisfies Array<MaybeFieldRef<string> | MaybeFieldRef<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(maybeUnd.try(), (item) => item);
        fieldFilter(maybeUnd.try(), () => true);

        // @ts-expect-error
        fieldFilter(maybeUnd, (item) => item);
        // @ts-expect-error
        fieldFilter(maybeUnd, () => true);

        fieldFilter(maybeUnd.try(), (_item) => 0);
        fieldFilter(maybeUnd.try(), (_item) => "");
        fieldFilter(maybeUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFilter(maybeUnd.try(), (item) => item.toExponential());
      }
    }
  }

  // Object
  {
    // Field
    {
      // Regular
      {
        const result = fieldFilter(obj, (item, key) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Hello;
          // @ts-expect-error
          key.any;

          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length > 0;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true ? 1 : 0;
          }
        });

        result satisfies Array<Field<string> | Field<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(obj, (item) => {
          item satisfies Field<string> | Field<boolean>;
          // @ts-expect-error
          item.any;
          return true;
        });
        fieldFilter(obj, () => true);

        fieldFilter(obj, (_item) => 0);
        fieldFilter(obj, (_item) => "");
        fieldFilter(obj, (_item) => null);
        // @ts-expect-error
        fieldFilter(obj, (item) => item.toExponential());
      }

      // Optional
      {
        const resultOpt = fieldFilter(objPart, (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        resultOpt satisfies Array<Field<boolean> | Field<string | undefined>>;
        // @ts-expect-error
        resultOpt.any;

        fieldFilter(objPart, (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
          return true;
        });
        fieldFilter(objPart, () => true);
      }

      // Undefined
      {
        const result = fieldFilter(objOrUnd.try(), (item, key) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;

          key satisfies keyof Ok;
          // @ts-expect-error
          key.any;

          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies Array<Field<boolean> | Field<string | undefined>>;
        // @ts-expect-error
        result.any;

        fieldFilter(objOrUnd.try(), (item) => {
          item satisfies Field<boolean> | Field<string | undefined>;
          // @ts-expect-error
          item.any;
          return true;
        });
        fieldFilter(objOrUnd.try(), () => true);

        fieldFilter(objOrUnd.try(), (_item) => 0);
        fieldFilter(objOrUnd.try(), (_item) => "");
        fieldFilter(objOrUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFilter(objOrUnd.try(), (item) => item.toExponential());
        // @ts-expect-error
        fieldFilter(objOrUnd, () => true);
      }
    }

    // FieldRef
    {
      // Regular
      {
        const ref = new FieldRef(obj);
        const result = fieldFilter(ref, (item, key) => {
          item satisfies FieldRef<string> | FieldRef<boolean>;
          key satisfies keyof Hello;
          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length > 0;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true;
          }
        });

        result satisfies Array<FieldRef<string> | FieldRef<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(ref, (item) => item);
        fieldFilter(ref, (_item) => 0);
        fieldFilter(ref, (_item) => "");
        fieldFilter(ref, (_item) => null);
        // @ts-expect-error
        fieldFilter(ref, (item) => item.toExponential());
      }

      // Optional
      {
        const refOpt = new FieldRef(objPart);
        const result = fieldFilter(refOpt, (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies Array<
          FieldRef<boolean> | FieldRef<string | undefined>
        >;
        // @ts-expect-error
        result.any;

        fieldFilter(refOpt, (item) => item);
        fieldFilter(refOpt, (_item) => 0);
        fieldFilter(refOpt, (_item) => "");
        fieldFilter(refOpt, (_item) => null);
        // @ts-expect-error
        fieldFilter(refOpt, (item) => item.get().toExponential());
      }

      // Undefined
      {
        const refUnd = new FieldRef(objOrUnd);
        const result = fieldFilter(refUnd.try(), (item, key) => {
          item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies Array<
          FieldRef<boolean> | FieldRef<string | undefined>
        >;
        // @ts-expect-error
        result.any;

        fieldFilter(refUnd.try(), (item) => item);
        fieldFilter(refUnd.try(), (_item) => 0);
        fieldFilter(refUnd.try(), (_item) => "");
        fieldFilter(refUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFilter(refUnd.try(), (item) => item.toExponential());
        // @ts-expect-error
        fieldFilter(refUnd, () => true);
      }
    }

    // MaybeFieldRef
    {
      // Regular
      {
        const maybe = new MaybeFieldRef({ type: "direct", field: obj });
        const result = fieldFilter(maybe, (item, key) => {
          item satisfies MaybeFieldRef<string> | MaybeFieldRef<boolean>;
          key satisfies keyof Hello;
          if (key === "hello") {
            item.get() satisfies string;
            // @ts-expect-error
            item.get() satisfies number;
            return item.get().length > 0;
          } else {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string;
            return item.get() === true;
          }
        });

        result satisfies Array<MaybeFieldRef<string> | MaybeFieldRef<boolean>>;
        // @ts-expect-error
        result.any;

        fieldFilter(maybe, (item) => item);
        fieldFilter(maybe, (_item) => 0);
        fieldFilter(maybe, (_item) => "");
        fieldFilter(maybe, (_item) => null);
        // @ts-expect-error
        fieldFilter(maybe, (item) => item.toExponential());
      }

      // Optional
      {
        const maybeOpt = new MaybeFieldRef({ type: "direct", field: objPart });
        const result = fieldFilter(maybeOpt, (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies Array<
          MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>
        >;
        // @ts-expect-error
        result.any;

        fieldFilter(maybeOpt, (item) => item);
        fieldFilter(maybeOpt, (_item) => 0);
        fieldFilter(maybeOpt, (_item) => "");
        fieldFilter(maybeOpt, (_item) => null);
        // @ts-expect-error
        fieldFilter(maybeOpt, (item) => item.toExponential());
      }

      // Undefined
      {
        const maybeUnd = new MaybeFieldRef({ type: "direct", field: objOrUnd });
        const result = fieldFilter(maybeUnd.try(), (item, key) => {
          item satisfies
            | MaybeFieldRef<boolean>
            | MaybeFieldRef<string | undefined>;
          key satisfies keyof Ok;
          if (key === "ok") {
            item.get() satisfies boolean;
            // @ts-expect-error
            item.get() satisfies string | undefined;
            return item.get();
          } else {
            item.get() satisfies string | undefined;
            // @ts-expect-error
            item.get() satisfies boolean;
            return !!item.get();
          }
        });

        result satisfies Array<
          MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>
        >;
        // @ts-expect-error
        result.any;

        fieldFilter(maybeUnd.try(), (item) => item);
        fieldFilter(maybeUnd.try(), (_item) => 0);
        fieldFilter(maybeUnd.try(), (_item) => "");
        fieldFilter(maybeUnd.try(), (_item) => null);
        // @ts-expect-error
        fieldFilter(maybeUnd.try(), (item) => item.toExponential());
        // @ts-expect-error
        fieldFilter(maybeUnd, () => true);
      }
    }
  }
}
//#endregion

//#region fieldPush
{
  // Regular
  {
    const result = fieldPush(arr, "new item");
    result satisfies Field.Detachable<string>;
    // @ts-expect-error
    result.any;

    fieldPush(arr, true);
    // @ts-expect-error
    fieldPush(arr, 123);

    // @ts-expect-error
    fieldPush(arrOrNum, true);
  }

  // Undefined
  {
    const result = fieldPush(arrOrUnd.try(), "new item");
    result satisfies Field.Detachable<string>;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    fieldPush(arrOrNum.try(), true);
    // @ts-expect-error
    fieldPush(arrOrNumOrUnd.try(), true);
    // @ts-expect-error
    fieldPush(arrOrUnd.try(), 123);
  }
}
//#endregion

//#region fieldInsert
{
  // Regular
  {
    const result = fieldInsert(arr, 0, "new item");
    result satisfies Field.Detachable<string>;
    // @ts-expect-error
    result.any;

    fieldInsert(arr, 1, true);
    // @ts-expect-error
    fieldInsert(arr, 2, 123);

    // @ts-expect-error
    fieldInsert(arrOrNum, 0, true);
  }

  // Undefined
  {
    const result = fieldInsert(arrOrUnd.try(), 0, "new item");
    result satisfies Field.Detachable<string>;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    fieldInsert(arrOrNum.try(), 0, true);
    // @ts-expect-error
    fieldInsert(arrOrNumOrUnd.try(), 0, true);
    // @ts-expect-error
    fieldInsert(arrOrUnd.try(), 0, 123);
  }
}
//#endregion

//#region fieldRemove
{
  // Object
  {
    // Field
    {
      const removed = fieldRemove(objPart, "message");
      removed satisfies Field.Detachable<DetachedValue>;

      // @ts-expect-error
      fieldRemove(objPart, "ok");
      // @ts-expect-error
      fieldRemove(objPart, "nope");
      // @ts-expect-error
      fieldRemove(objPart, 0);
      // @ts-expect-error
      fieldRemove(objPart, false);
    }

    // Undefined
    {
      const objUnd = new Field<Record<string, number> | undefined>({ a: 1 });
      fieldRemove(objUnd.try(), "a");
      // @ts-expect-error
      fieldRemove(objUnd, "a");
    }
  }

  // Array
  {
    // Field
    {
      const arrField = new Field<number[]>([1, 2, 3]);
      fieldRemove(arrField, 1);
      // @ts-expect-error
      fieldRemove(arrField, "a");
      // @ts-expect-error
      fieldRemove(arrField, false);
    }

    // Undefined
    {
      const arrUnd = new Field<number[] | undefined>([1, 2, 3]);
      fieldRemove(arrUnd.try(), 1);
      // @ts-expect-error
      fieldRemove(arrUnd, 1);
    }
  }

  // Self
  {
    // Object

    const removed = fieldRemove(objPart.$.message);
    removed satisfies Field<DetachedValue>;

    // @ts-expect-error
    fieldRemove(objPart.$.ok);

    // Record

    fieldRemove(rec.at("hello"));
    fieldRemove(rec.at("world"));
    // @ts-expect-error
    fieldRemove(rec.$.hello);
    // @ts-expect-error
    fieldRemove(rec, number);

    // Primitive
    fieldRemove(prim as unknown as Enso.Detachable<Field<string>>);
    // @ts-expect-error
    fieldRemove(prim);
  }
}
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
