import { Field, FieldRef } from "../index.tsx";
import { MaybeFieldRef } from "../ref/index.ts";
import { fieldEach, fieldMap } from "./index.ts";

const fieldArray = new Field<Array<string | number>>(["Hello", "world", 123]);

const fieldObj = new Field<Hello>({ hello: "hi", world: 42 });

const fieldObjOptional = new Field<Ok>({ ok: true });

// `fieldEach`
{
  // Array
  {
    // Field

    const result = fieldEach(fieldArray, (item, index) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    result satisfies void;
    fieldEach(fieldArray, (item) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(fieldArray, () => {});

    // FieldRef

    const fieldRef = new FieldRef(fieldArray);
    fieldEach(fieldRef, (item, index) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    fieldEach(fieldRef, (item) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(fieldRef, () => {});

    // MaybeRef

    const maybeFieldRef = new MaybeFieldRef({
      type: "direct",
      field: fieldArray,
    });
    fieldEach(maybeFieldRef, (item, index) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    fieldEach(maybeFieldRef, (item) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(maybeFieldRef, () => {});
  }

  // Object
  {
    // Field

    // Regular
    const result = fieldEach(fieldObj, (item, key) => {
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
    fieldEach(fieldObj, (item) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(fieldObj, () => {});

    // Optional
    fieldEach(fieldObjOptional, (item, key) => {
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
    fieldEach(fieldObjOptional, (item) => {
      item satisfies Field<boolean> | Field<string | undefined>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(fieldObjOptional, () => {});

    // FieldRef

    const fieldRef = new FieldRef(fieldObj);
    // Regular
    fieldEach(fieldRef, (item, key) => {
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
    fieldEach(fieldRef, (item) => {});
    fieldEach(fieldRef, () => {});

    // Optional
    const fieldRefOptional = new FieldRef(fieldObjOptional);
    fieldEach(fieldRefOptional, (item, key) => {
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
    fieldEach(fieldRefOptional, (item) => {
      item satisfies FieldRef<boolean> | FieldRef<string | undefined>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(fieldRefOptional, () => {});

    // MaybeRef

    const maybeFieldRef = new MaybeFieldRef({
      type: "direct",
      field: fieldObj,
    });
    // Regular
    fieldEach(maybeFieldRef, (item, key) => {
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
    fieldEach(maybeFieldRef, (item) => {});
    fieldEach(maybeFieldRef, () => {});

    // Optional
    const maybeFieldRefOptional = new MaybeFieldRef({
      type: "direct",
      field: fieldObjOptional,
    });
    fieldEach(maybeFieldRefOptional, (item, key) => {
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
    fieldEach(maybeFieldRefOptional, (item) => {
      item satisfies MaybeFieldRef<boolean> | MaybeFieldRef<string | undefined>;
      // @ts-expect-error
      item.any;
    });
    fieldEach(maybeFieldRefOptional, () => {});
  }
}

// `fieldMap`
{
  // Array
  {
    // Field

    const result = fieldMap(fieldArray, (item, index) => {
      item satisfies Field<string> | Field<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    result satisfies number[];

    // FieldRef

    const fieldRef = new FieldRef(fieldArray);
    const refResult = fieldMap(fieldRef, (item, index) => {
      item satisfies FieldRef<string> | FieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    refResult satisfies number[];

    // MaybeFieldRef

    const maybeFieldRef = new MaybeFieldRef({
      type: "direct",
      field: fieldArray,
    });
    const maybeRefResult = fieldMap(maybeFieldRef, (item, index) => {
      item satisfies MaybeFieldRef<string> | MaybeFieldRef<number>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.get());
    });
    maybeRefResult satisfies number[];
  }

  // Object
  {
    // Field

    const result = fieldMap(fieldObj, (item, key) => {
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

    // FieldRef

    const fieldRef = new FieldRef(fieldObj);
    // Regular
    const refResult = fieldMap(fieldRef, (item, key) => {
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
    const fieldRefOptional = new FieldRef(fieldObjOptional);
    const refResultOptional = fieldMap(fieldRefOptional, (item, key) => {
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
    refResultOptional satisfies number[];

    // MaybeFieldRef

    const maybeFieldRef = new MaybeFieldRef({
      type: "direct",
      field: fieldObj,
    });
    // Regular
    const maybeRefResult = fieldMap(maybeFieldRef, (item, key) => {
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
    maybeRefResult satisfies number[];

    // Optional
    const maybeFieldRefOptional = new MaybeFieldRef({
      type: "direct",
      field: fieldObjOptional,
    });
    const maybeRefResultOptional = fieldMap(
      maybeFieldRefOptional,
      (item, key) => {
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
          return item.get() ? 1 : 0;
        } else {
          item.get() satisfies string | undefined;
          // @ts-expect-error
          item.get() satisfies boolean;
          return item.get()?.length ?? 0;
        }
      },
    );
    maybeRefResultOptional satisfies number[];
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
