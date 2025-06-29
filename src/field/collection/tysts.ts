import { Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";
import { fieldEach, fieldInsert, fieldMap, fieldPush } from "./index.ts";

const arr = new Field<Array<string | number>>([]);
const arrOrUnd = new Field<Array<string | number> | undefined>([]);
const arrOrNum = new Field<Array<string | number> | number>([]);
const arrOrNumOrUnd = new Field<Array<string | number> | number | undefined>(
  [],
);

const obj = new Field<Hello>({ hello: "hi", world: 42 });
const objOpt = new Field<Ok>({ ok: true });
const objOrUnd = new Field<Ok | undefined>({ ok: true });
const objOrNum = new Field<Ok | number>({ ok: true });
const objOrNumOrUnd = new Field<Ok | number | undefined>({ ok: true });

// `fieldEach`
{
  // Array
  {
    // Field

    // Regular
    const result = fieldEach(arr, (item, index) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    result satisfies void;
    fieldEach(arr, (item) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(arr, () => {});

    // Undefined
    fieldEach(arrOrUnd.try(), (item, index) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    // @ts-expect-error
    fieldEach(arrOrUnd, () => {});

    // FieldRef

    // Regular
    const ref = new FieldRef(arr);
    fieldEach(ref, (item, index) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    fieldEach(ref, (item) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(ref, () => {});

    // Undefined
    const refUnd = new FieldRef(arrOrUnd);
    fieldEach(refUnd.try(), (item, index) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    // @ts-expect-error
    fieldEach(refUnd, () => {});

    // MaybeRef

    // Regular
    const maybe = new MaybeFieldRef({
      type: "direct",
      field: arr,
    });
    fieldEach(maybe, (item, index) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    fieldEach(maybe, (item) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(maybe, () => {});

    // Undefined
    const maybeUnd = new MaybeFieldRef({
      type: "direct",
      field: arrOrUnd,
    });
    fieldEach(maybeUnd.try(), (item, index) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    // @ts-expect-error
    fieldEach(new MaybeFieldRef({ type: "direct", field: arrOrUnd }), () => {});
  }

  // Object
  {
    // Field

    // Regular
    const result = fieldEach(obj, (item, key) => {
      item satisfies Field<string> | Field<number>;
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
        item.get() satisfies number;
        // @ts-expect-error
        item.get() satisfies string;
      }
    });
    result satisfies void;
    fieldEach(obj, (item) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(obj, () => {});

    // Optional
    fieldEach(objOpt, (item, key) => {
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
    fieldEach(objOpt, (item) => {
      item satisfies Field<boolean> | Field<string | undefined>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(objOpt, () => {});

    // Undefined
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

    // FieldRef

    // Regular
    const ref = new FieldRef(obj);
    fieldEach(ref, (item, key) => {
      item satisfies FieldRef<string> | FieldRef<number>;
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
        item.get() satisfies number;
        // @ts-expect-error
        item.get() satisfies string;
      }
    });
    fieldEach(ref, (item) => {});
    fieldEach(ref, () => {});

    // Optional
    const refOpt = new FieldRef(objOpt);
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

    // Undefined
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

    // MaybeRef

    // Regular
    const maybe = new MaybeFieldRef({
      type: "direct",
      field: obj,
    });
    fieldEach(maybe, (item, key) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
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
        item.get() satisfies number;
        // @ts-expect-error
        item.get() satisfies string;
      }
    });
    fieldEach(maybe, (item) => {});
    fieldEach(maybe, () => {});

    // Optional
    const maybeOpt = new MaybeFieldRef({
      type: "direct",
      field: objOpt,
    });
    fieldEach(maybeOpt, (item, key) => {
      item satisfies MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>;
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
      item satisfies MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(maybeOpt, () => {});

    // Undefined
    const maybeUnd = new MaybeFieldRef({
      type: "direct",
      field: objOrUnd,
    });
    fieldEach(maybeUnd.try(), (item, key) => {
      item satisfies MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>;
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

// `fieldMap`
{
  // Array
  {
    // Field

    // Regular
    const result = fieldMap(arr, (item, index) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    result satisfies number[];

    // Undefined
    fieldMap(arrOrUnd.try(), (item, index) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    // @ts-expect-error
    fieldMap(arrOrUnd, () => {});

    // FieldRef

    // Regular
    const ref = new FieldRef(arr);
    const refResult = fieldMap(ref, (item, index) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    refResult satisfies number[];

    // Undefined
    const refUnd = new FieldRef(arrOrUnd);
    fieldMap(refUnd.try(), (item, index) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    // @ts-expect-error
    fieldMap(refUnd, () => {});

    // MaybeFieldRef

    // Regular
    const maybe = new MaybeFieldRef({
      type: "direct",
      field: arr,
    });
    const maybeResult = fieldMap(maybe, (item, index) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    maybeResult satisfies number[];

    // Undefined
    const maybeUnd = new MaybeFieldRef({
      type: "direct",
      field: arrOrUnd,
    });
    fieldMap(maybeUnd.try(), (item, index) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    // @ts-expect-error
    fieldMap(new MaybeFieldRef({ type: "direct", field: arrOrUnd }), () => {});
  }

  // Object
  {
    // Field

    // Regular
    const result = fieldMap(obj, (item, key) => {
      item satisfies Field<string> | Field<number>;
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
        item.get() satisfies number;
        // @ts-expect-error
        item.get() satisfies string;
        return item.get();
      }
    });
    result satisfies number[];

    // Optional
    const resultOpt = fieldMap(objOpt, (item, key) => {
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
        return item.get() ? 1 : 0;
      } else {
        item.get() satisfies string | undefined;
        // @ts-expect-error
        item.get() satisfies boolean;
        return item.get()?.length ?? 0;
      }
    });
    resultOpt satisfies number[];

    // Undefined
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
        return item.get() ? 1 : 0;
      } else {
        item.get() satisfies string | undefined;
        // @ts-expect-error
        item.get() satisfies boolean;
        return item.get()?.length ?? 0;
      }
    });
    // @ts-expect-error
    fieldMap(objOrUnd, () => {});

    // FieldRef

    // Regular
    const ref = new FieldRef(obj);
    const refResult = fieldMap(ref, (item, key) => {
      item satisfies FieldRef<string> | FieldRef<number>;
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
        item.get() satisfies number;
        // @ts-expect-error
        item.get() satisfies string;
        return item.get();
      }
    });
    refResult satisfies number[];

    // Optional
    const refOpt = new FieldRef(objOpt);
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
        return item.get() ? 1 : 0;
      } else {
        item.get() satisfies string | undefined;
        // @ts-expect-error
        item.get() satisfies boolean;
        return item.get()?.length ?? 0;
      }
    });
    refOptResult satisfies number[];

    // Undefined
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
        return item.get() ? 1 : 0;
      } else {
        item.get() satisfies string | undefined;
        // @ts-expect-error
        item.get() satisfies boolean;
        return item.get()?.length ?? 0;
      }
    });
    // @ts-expect-error
    fieldMap(refUnd, () => {});

    // MaybeFieldRef

    // Regular
    const maybe = new MaybeFieldRef({
      type: "direct",
      field: obj,
    });
    const maybeResult = fieldMap(maybe, (item, key) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
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
        item.get() satisfies number;
        // @ts-expect-error
        item.get() satisfies string;
        return item.get();
      }
    });
    maybeResult satisfies number[];

    // Optional
    const maybeOpt = new MaybeFieldRef({
      type: "direct",
      field: objOpt,
    });
    const maybeOptResult = fieldMap(maybeOpt, (item, key) => {
      item satisfies MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>;
      // @ts-expect-error
      item.any;

      key satisfies keyof Ok;
      // @ts-expect-error
      key.any;

      if (key === "ok") {
        item.get() satisfies boolean;
        // @ts-expect-error
        item.get() satisfies string | undefined;
        return item.get() ? 1 : 0;
      } else {
        item.get() satisfies string | undefined;
        // @ts-expect-error
        item.get() satisfies boolean;
        return item.get()?.length ?? 0;
      }
    });
    maybeOptResult satisfies number[];

    // Undefined
    const maybeUnd = new MaybeFieldRef({
      type: "direct",
      field: objOrUnd,
    });
    fieldMap(maybeUnd.try(), (item, key) => {
      item satisfies MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>;
      // @ts-expect-error
      item.any;

      key satisfies keyof Ok;
      // @ts-expect-error
      key.any;

      if (key === "ok") {
        item.get() satisfies boolean;
        // @ts-expect-error
        item.get() satisfies string | undefined;
        return item.get() ? 1 : 0;
      } else {
        item.get() satisfies string | undefined;
        // @ts-expect-error
        item.get() satisfies boolean;
        return item.get()?.length ?? 0;
      }
    });
    // @ts-expect-error
    fieldMap(maybeUnd, () => {});
  }
}

// `push`
{
  // Regular
  {
    const result = fieldPush(arr, "new item");
    result satisfies Field<string>;
    // @ts-expect-error
    result.any;

    fieldPush(arr, 456);
    // @ts-expect-error
    fieldPush(arr, false);

    // @ts-expect-error
    fieldPush(arrOrNum, 456);
  }

  // Undefined
  {
    const result = fieldPush(arrOrUnd.try(), "new item");
    result satisfies Field<string>;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    fieldPush(arrOrNum.try(), 456);
    // @ts-expect-error
    fieldPush(arrOrNumOrUnd.try(), 456);
    // @ts-expect-error
    fieldPush(arrOrUnd.try(), false);
  }
}

// `insert`
{
  // Regular
  {
    const result = fieldInsert(arr, 0, "new item");
    result satisfies Field<string>;
    // @ts-expect-error
    result.any;

    fieldInsert(arr, 1, 456);
    // @ts-expect-error
    fieldInsert(arr, 2, false);

    // @ts-expect-error
    fieldInsert(arrOrNum, 0, 456);
  }

  // Undefined
  {
    const result = fieldInsert(arrOrUnd.try(), 0, "new item");
    result satisfies Field<string>;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    fieldInsert(arrOrNum.try(), 0, 456);
    // @ts-expect-error
    fieldInsert(arrOrNumOrUnd.try(), 0, 456);
    // @ts-expect-error
    fieldInsert(arrOrUnd.try(), 0, false);
  }
}

//#region Helpers

interface Hello {
  hello: string;
  world: number;
}

interface Ok {
  ok: boolean;
  message?: string;
}

//#endregion
