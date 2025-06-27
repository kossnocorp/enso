import { Field } from "./index.tsx";

// It compatible with `any` payload
{
  // TODO:
  // const _test1: Field<any> = new Field({ hello: "hi" });
  // const _test2: Field<Hello> = new Field<any>({ hello: "hi" });
}

//#region Tree

// `try`
{
  // Primitives

  const fieldOptionalStr = new Field<string | undefined>("hi");

  fieldOptionalStr.try() satisfies Field<string> | undefined;
  // @ts-expect-error
  fieldOptionalStr.try() satisfies Field<string>;
  // @ts-expect-error
  fieldOptionalStr.try() satisfies Field<number> | undefined;
  // @ts-expect-error
  fieldOptionalStr.try() satisfies Field<string | undefined> | undefined;

  const fieldNullableNum = new Field<number | null>(42);

  fieldNullableNum.try() satisfies Field<number> | null;
  // @ts-expect-error
  fieldNullableNum.try() satisfies Field<number>;
  // @ts-expect-error
  fieldNullableNum.try() satisfies Field<string> | null;
  // @ts-expect-error
  fieldNullableNum.try() satisfies Field<number | null> | null;

  // Object

  const fieldOptionalObj = new Field<Hello | undefined>({ hello: "hi" });

  fieldOptionalObj.try() satisfies Field<Hello> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try() satisfies Field<Hello>;
  // @ts-expect-error
  fieldOptionalObj.try() satisfies Field<number> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try() satisfies Field<Hello | undefined> | undefined;

  fieldOptionalObj.try("hello") satisfies Field<string> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try("hello") satisfies Field<number> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try("hello") satisfies Field<string | undefined> | undefined;

  const fieldObj = new Field<Hello & { who?: string }>({ hello: "hi" });

  fieldObj.try("hello") satisfies Field<string>;
  // @ts-expect-error
  fieldObj.try("hello") satisfies Field<number>;

  fieldObj.try("who") satisfies Field<string> | undefined;
  // @ts-expect-error
  fieldObj.try("who") satisfies Field<string>;
  // @ts-expect-error
  fieldObj.try("who") satisfies Field<number> | undefined;
  // @ts-expect-error
  fieldObj.try("who") satisfies Field<string | undefined> | undefined;

  // @ts-expect-error
  fieldObj.try("world");

  // Record

  const fieldRec = new Field<Record<string, string>>({
    hello: "hi",
  });

  fieldRec.try("hello") satisfies Field<string> | undefined;
  // @ts-expect-error
  fieldRec.try("hello") satisfies Field<string>;
  // @ts-expect-error
  fieldRec.try("hello") satisfies Field<number>;
  // @ts-expect-error
  fieldRec.try("hello") satisfies Field<string | undefined> | undefined;

  fieldRec.try("world") satisfies Field<string> | undefined;
  // @ts-expect-error
  fieldRec.try("world") satisfies Field<string>;
  // @ts-expect-error
  fieldRec.try("world") satisfies Field<number>;
  // @ts-expect-error
  fieldRec.try("world") satisfies Field<string | undefined> | undefined;
}

//#endregion

//#region Helpers

interface Hello {
  hello: string;
}

//#endregion
