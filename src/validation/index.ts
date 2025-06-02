import { Field } from "../field/index.tsx";

export class ValidationTree {
  #errors: Field.Error[] = [];
  #tree: ValidationTree.Node = ValidationTree.node();

  at(path: readonly string[]): Field.Error[] {
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

  nested(path: readonly string[]): Array<[readonly string[], Field.Error]> {
    let node = this.#tree;
    for (const key of path) {
      if (!node.children[key]) return [];
      node = node.children[key];
    }

    const errors: Array<[readonly string[], Field.Error]> = [];

    ValidationTree.traverse(node, (childPath, childNode) =>
      childNode.errors
        .entries()
        .filter(([, direct]) => direct)
        .map(([index]) => this.#errors[index]!)
        .forEach((error) => errors.push([childPath, error])),
    );

    return errors;
  }

  static traverse(
    node: ValidationTree.Node,
    callback: (path: readonly string[], node: ValidationTree.Node) => void,
    path: readonly string[] = [],
  ): void {
    callback(path, node);

    Object.entries(node.children).forEach(([key, child]) => {
      const childPath = Object.freeze(path.concat(key));
      ValidationTree.traverse(child, callback, childPath);
    });
  }

  add(path: readonly string[], error: Field.Error): ValidationTree.Index {
    const index = (this.#errors.push(error) - 1) as ValidationTree.Index;

    let node = this.#tree;

    for (const key of path) {
      node.errors.set(index, false);
      node = node.children[key] ??= ValidationTree.node();
    }

    node.errors.set(index, true);

    return index;
  }

  clear(path: string[]): void {
    let node = this.#tree;
    const pathErrors: Map<ValidationTree.Index, boolean>[] = [];
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
    errors: Map<Index, boolean>;
    children: Record<string, Node>;
  }
}
