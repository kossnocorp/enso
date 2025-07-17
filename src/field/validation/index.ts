import { ValidationTree } from "../../validation/index.ts";
import type { Field } from "../definition.ts";
import type { FieldRef } from "../ref/definition.ts";

//#region validateField

export function validateField<Value, Context>(
  field: Field<Value>,
  validator: Field.Validator<Value, Context>,
): Promise<void>;

export function validateField<Value>(
  field: Field<Value>,
  validator: Field.Validator<Value, undefined>,
): Promise<void>;

export async function validateField<Value, Context = undefined>(
  field: Field<Value>,
  validator: Field.Validator<Value, Context>,
  context?: Context,
): Promise<void> {}

//#endregion validateField

//#region fieldValidationTree

const validationTrees = new WeakMap<
  Field.Immutable<unknown, "root">,
  ValidationTree
>();

export function fieldValidationTree(field: Field<unknown>): ValidationTree {
  const root = field.root;
  let tree = validationTrees.get(root);
  if (!tree) {
    tree = new ValidationTree();
    validationTrees.set(root, tree);
  }
  return tree;
}

//#endregion fieldValidationTree
