import { Field } from "../field/index.js";
import { Form } from "./index.js";

//#region Attributes

//#region Form#id
{
  const form = new Form("id", "hello");

  form.id satisfies string;
  // @ts-expect-error
  form.id.any;
}
//#endregion

//#region Form#field
{
  const form = new Form("id", "hello");

  form.field satisfies Field<string>;
  // @ts-expect-error
  form.field.any;
}
//#endregion

//#endregion

//#region Value

//#region Form#value
{
  const form = new Form("id", "hello");

  form.value satisfies typeof form.field.value;
  // @ts-expect-error
  form.value.any;
}
//#endregion

//#region Form#useValue
{
  const form = new Form("id", "hello");

  const result = form.useValue();
  result satisfies typeof form.field.value;
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Form.set
{
  const form = new Form("id", {} as { a: 1; b?: 2 });

  form.set satisfies typeof form.field.set;
  // @ts-expect-error
  form.set.any;
}
//#endregion

//#region Form#dirty
{
  const form = new Form("id", "hello");

  form.dirty satisfies boolean;
  // @ts-expect-error
  form.dirty.any;
}
//#endregion

//#region Form#useDirty
{
  const form = new Form("id", "hello");

  const result = form.useDirty();
  result satisfies boolean;
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Form#commit
{
  const form = new Form("id", "hello");

  const result = form.commit();
  result satisfies void;
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Form#reset
{
  const form = new Form("id", "hello");

  const result = form.reset();
  result satisfies void;
  // @ts-expect-error
  result.any;
}
//#endregion

//#endregion

//#region Tree

//#region Form.$
{
  const form = new Form("id", "hello");

  form.$ satisfies typeof form.field.value;
  // @ts-expect-error
  form.$.any;
}
//#endregion

//#region Form.at
{
  const form = new Form("id", {} as { a: 1; b?: 2 });

  form.at satisfies typeof form.field.at;
  // @ts-expect-error
  form.at.any;
}
//#endregion

//#region Form.try
{
  const form = new Form("id", {} as { a: 1; b?: 2 });

  form.try satisfies typeof form.field.try;
  // @ts-expect-error
  form.try.any;
}
//#endregion

//#endregion

//#region Events

//#region Form.watch
{
  const form = new Form("id", "hello");

  form.watch satisfies typeof form.field.watch;
  // @ts-expect-error
  form.watch.any;
}
//#endregion

//#region Form.useWatch
{
  const form = new Form("id", "hello");

  form.useWatch satisfies typeof form.field.useWatch;
  // @ts-expect-error
  form.useWatch.any;
}
//#endregion

//#endregion

//#region Status

//#region Form#submitting
{
  const form = new Form("id", "hello");

  form.submitting satisfies boolean;
  // @ts-expect-error
  form.submitting.any;
}
//#endregion

//#region Form#useSubmitting
{
  const form = new Form("id", "hello");

  const result = form.useSubmitting();
  result satisfies boolean;
  // @ts-expect-error
  result.any;
}
//#endregion

//#endregion

//#region Validation

//#region Form#errors
{
  const form = new Form("id", "hello");

  form.errors satisfies Field.Error[];
  // @ts-expect-error
  form.errors.any;
}
//#endregion

//#region Form#useErrors
{
  const form = new Form("id", "hello");

  const result = form.useErrors();
  result satisfies Field.Error[];
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Form#valid
{
  const form = new Form("id", "hello");

  form.valid satisfies boolean;
  // @ts-expect-error
  form.valid.any;
}
//#endregion

//#region Form#useValid
{
  const form = new Form("id", "hello");

  const result = form.useValid();
  result satisfies boolean;
  // @ts-expect-error
  result.any;
}
//#endregion

//#endregion
