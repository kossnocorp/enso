import type { Field } from "../field/index.tsx";

// [TODO] Add tests for field references

export class ValidationTree {
  #errors: Field.Error[] = [];
  #tree: ValidationTree.Node = ValidationTree.node();

  at(path: Field.Path): Field.Error[] {
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

  nested(path: Field.Path): ValidationTree.ErrorsList {
    let node = this.#tree;
    for (const key of path) {
      if (!node.children[key]) return [];
      node = node.children[key];
    }

    const errors: ValidationTree.ErrorsList = [];

    ValidationTree.traverse(node, (childPath, childNode) =>
      childNode.errors.entries().forEach(([index, fieldWrap]) => {
        if (!fieldWrap) return;
        errors.push([childPath, this.#errors[index]!, fieldWrap[0]]);
      }),
    );

    return errors;
  }

  static traverse(
    node: ValidationTree.Node,
    callback: (path: Field.Path, node: ValidationTree.Node) => void,
    path: Field.Path = [],
  ): void {
    callback(path, node);

    Object.entries(node.children).forEach(([key, child]) => {
      const childPath = Object.freeze(path.concat(key));
      ValidationTree.traverse(child, callback, childPath);
    });
  }

  add(
    path: Field.Path,
    error: Field.Error,
    field: Field<any> | null,
  ): ValidationTree.Index {
    const index = (this.#errors.push(error) - 1) as ValidationTree.Index;

    let node = this.#tree;

    for (const key of path) {
      node.errors.set(index, null);
      node = node.children[key] ??= ValidationTree.node();
    }

    node.errors.set(index, [field]);

    return index;
  }

  clear(path: Field.Path): void {
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

  export type ErrorsMap = Map<Index, [Field<any> | null] | null>;

  export type ErrorsList = Array<[Field.Path, Field.Error, Field<any> | null]>;
}
