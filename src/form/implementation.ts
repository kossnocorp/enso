import type { Form } from "./definition.ts";

export const formChange: Form.Change = {
  formSubmitting: BigInt(2 ** 48),
  formSubmitted: BigInt(2 ** 49),
  formValid: BigInt(2 ** 50),
  formInvalid: BigInt(2 ** 51),
};

export { FormImpl as Form };

export class FormImpl<Value> {}
