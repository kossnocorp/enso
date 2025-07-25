import { FieldChange, shiftChildChanges } from "../change/index.ts";
import { Field } from "../field/index.tsx";
import type { Enso } from "../types.ts";

export class EventsTree {
  #tree: EventsTree.Node = EventsTree.node();

  at(path: Enso.Path): Field<any>[] {
    let node: EventsTree.Node | undefined = this.#tree;
    for (const key of path) {
      node = node.children[key];
      if (!node) return [];
    }
    return Array.from(node.fields);
  }

  traverse(path: Enso.Path, callback: EventsTree.TraverseCallback) {
    const queue = [];
    let node: EventsTree.Node | undefined = this.#tree;
    const pathQueue = [...path];
    let curPath: Enso.Path = [];
    while (true) {
      const fields = node ? Array.from(node.fields) : [];
      queue.push([curPath, fields] as const);
      const key = pathQueue.shift();
      if (key === undefined) break;
      node = node?.children[key];
      curPath = curPath.concat(key);
    }
    queue.reverse().forEach(([path, fields]) => callback(path, fields));
  }

  add(path: Enso.Path, field: Field<any>) {
    let node = this.#tree;
    for (const key of path) {
      node = node.children[key] ??= EventsTree.node();
    }
    node.fields.add(field);
  }

  delete(path: Enso.Path, field: Field<any>): boolean {
    let node: EventsTree.Node | undefined = this.#tree;
    for (const key of path) {
      node = node?.children[key];
      if (!node) return false;
    }
    return node.fields.delete(field);
  }

  move(from: Enso.Path, to: Enso.Path, field: Field<any>): boolean {
    if (this.delete(from, field)) {
      this.add(to, field);
      return true;
    }
    return false;
  }

  static node(): EventsTree.Node {
    return { fields: new Set(), children: {} };
  }

  trigger(path: Enso.Path, changes: FieldChange) {
    let curChanges = changes;
    this.traverse(path, (_, fields) => {
      fields.forEach((field) => {
        field.trigger(curChanges);
      });
      curChanges = shiftChildChanges(curChanges);
    });
  }
}

export namespace EventsTree {
  export interface Node {
    fields: Set<Field<any>>;
    children: Record<string, Node>;
  }

  export type TraverseCallback = (
    path: Enso.Path,
    fields: Field<any>[],
  ) => void;
}
