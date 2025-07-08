import { FieldOld } from "./definition.tsx";

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

  const fieldOptionalStr = new FieldOld<string | undefined>("hi");

  fieldOptionalStr.try() satisfies FieldOld<string> | undefined;
  // @ts-expect-error
  fieldOptionalStr.try() satisfies FieldOld<string>;
  // @ts-expect-error
  fieldOptionalStr.try() satisfies FieldOld<number> | undefined;
  // @ts-expect-error
  fieldOptionalStr.try() satisfies FieldOld<string | undefined> | undefined;

  const fieldNullableNum = new FieldOld<number | null>(42);

  fieldNullableNum.try() satisfies FieldOld<number> | null;
  // @ts-expect-error
  fieldNullableNum.try() satisfies FieldOld<number>;
  // @ts-expect-error
  fieldNullableNum.try() satisfies FieldOld<string> | null;
  // @ts-expect-error
  fieldNullableNum.try() satisfies FieldOld<number | null> | null;

  // Object

  const fieldOptionalObj = new FieldOld<Hello | undefined>({ hello: "hi" });

  fieldOptionalObj.try() satisfies FieldOld<Hello> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try() satisfies FieldOld<Hello>;
  // @ts-expect-error
  fieldOptionalObj.try() satisfies FieldOld<number> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try() satisfies FieldOld<Hello | undefined> | undefined;

  fieldOptionalObj.try("hello") satisfies FieldOld<string> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try("hello") satisfies FieldOld<number> | undefined;
  // @ts-expect-error
  fieldOptionalObj.try("hello") satisfies
    | FieldOld<string | undefined>
    | undefined;

  const fieldObj = new FieldOld<Hello & { who?: string }>({ hello: "hi" });

  fieldObj.try("hello") satisfies FieldOld<string>;
  // @ts-expect-error
  fieldObj.try("hello") satisfies FieldOld<number>;

  fieldObj.try("who") satisfies FieldOld<string> | undefined;
  // @ts-expect-error
  fieldObj.try("who") satisfies FieldOld<string>;
  // @ts-expect-error
  fieldObj.try("who") satisfies FieldOld<number> | undefined;
  // @ts-expect-error
  fieldObj.try("who") satisfies FieldOld<string | undefined> | undefined;

  // @ts-expect-error
  fieldObj.try("world");

  // Record

  const fieldRec = new FieldOld<Record<string, string>>({
    hello: "hi",
  });

  fieldRec.try("hello") satisfies FieldOld<string> | undefined;
  // @ts-expect-error
  fieldRec.try("hello") satisfies FieldOld<string>;
  // @ts-expect-error
  fieldRec.try("hello") satisfies FieldOld<number>;
  // @ts-expect-error
  fieldRec.try("hello") satisfies FieldOld<string | undefined> | undefined;

  fieldRec.try("world") satisfies FieldOld<string> | undefined;
  // @ts-expect-error
  fieldRec.try("world") satisfies FieldOld<string>;
  // @ts-expect-error
  fieldRec.try("world") satisfies FieldOld<number>;
  // @ts-expect-error
  fieldRec.try("world") satisfies FieldOld<string | undefined> | undefined;
}

//#endregion

//#region Helpers

interface Hello {
  hello: string;
}

//#endregion
