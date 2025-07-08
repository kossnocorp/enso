import type { FieldOld } from "../field/definition.tsx";
import { Enso } from "../types.ts";

export class ValidationTree {
  #errors: FieldOld.Error[] = [];
  #tree: ValidationTree.Node = ValidationTree.node();

  at(path: Enso.Path): FieldOld.Error[] {
    let node = this.#tree;
    for (const key of path) {
      if (!node.children[key]) return [];
      node = node.children[key];
    }

    return Array.from(
      node.errors
        .entries()
        .filter(([_, direct]) => direct)
        .map(([index]) => this.#errors[index]!),
    );
  }

  nested(path: Enso.Path): ValidationTree.ErrorsList {
    let node = this.#tree;
    for (const key of path) {
      if (!node.children[key]) return [];
      node = node.children[key];
    }

    const errors: ValidationTree.ErrorsList = [];

    ValidationTree.traverse(node, (childPath, childNode) =>
      childNode.errors.entries().forEach(([index, direct]) => {
        if (!direct) return;
        errors.push([[...path, ...childPath], this.#errors[index]!]);
      }),
    );

    return errors;
  }

  static traverse(
    node: ValidationTree.Node,
    callback: (path: Enso.Path, node: ValidationTree.Node) => void,
    path: Enso.Path = [],
  ): void {
    callback(path, node);

    Object.entries(node.children).forEach(([key, child]) => {
      const childPath = Object.freeze(path.concat(key));
      ValidationTree.traverse(child, callback, childPath);
    });
  }

  add(path: Enso.Path, error: FieldOld.Error): ValidationTree.Index {
    const index = (this.#errors.push(error) - 1) as ValidationTree.Index;

    let node = this.#tree;

    for (const key of path) {
      node.errors.set(index, false);
      node = node.children[key] ??= ValidationTree.node();
    }

    node.errors.set(index, true);

    return index;
  }

  clear(path: Enso.Path): void {
    let node = this.#tree;
    const pathErrors: ValidationTree.ErrorsMap[] = [];
    for (const key of path) {
      pathErrors.push(node.errors);
      if (!node.children[key]) return;
      node = node.children[key];
    }

    const errorIndices = node.errors.keys();

    errorIndices.forEach((index) => {
      pathErrors.forEach((errors) => errors.delete(index));
      delete this.#errors[index];
    });

    node.errors.clear();
    node.children = {};
  }

  static node(): ValidationTree.Node {
    return { errors: new Map(), children: {} };
  }
}

export namespace ValidationTree {
  export type Index = number & { [indexBrand]: true };
  declare const indexBrand: unique symbol;

  export interface Node {
    errors: ErrorsMap;
    children: Record<string, Node>;
  }

  export type ErrorsMap = Map<Index, boolean>;

  export type ErrorsList = Array<[Enso.Path, FieldOld.Error]>;
}
