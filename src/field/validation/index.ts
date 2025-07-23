import { ValidationTree } from "../../validation/index.ts";
import type { Field } from "../definition.ts";

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
