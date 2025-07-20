import type { Atom } from "../atom/definition.ts";
import { FieldChange, shiftChildChanges } from "../change/index.ts";

export class EventsTree<Shell extends Atom.Shell> {
  #tree: EventsTree.Node<Shell> = EventsTree.node();

  at(path: Atom.Path): Atom.Exact.Envelop<Shell, any>[] {
    let node: EventsTree.Node<Shell> | undefined = this.#tree;
    for (const key of path) {
      node = node.children[key];
      if (!node) return [];
    }
    return Array.from(node.atoms);
  }

  traverse(path: Atom.Path, callback: EventsTree.TraverseCallback<Shell>) {
    const queue = [];
    let node: EventsTree.Node<Shell> | undefined = this.#tree;
    const pathQueue = [...path];
    let curPath: Atom.Path = [];
    while (true) {
      const atoms = node ? Array.from(node.atoms) : [];
      queue.push([curPath, atoms] as const);
      const key = pathQueue.shift();
      if (key === undefined) break;
      node = node?.children[key];
      curPath = curPath.concat(key);
    }
    queue.reverse().forEach(([path, atoms]) => callback(path, atoms));
  }

  add(path: Atom.Path, atom: Atom.Exact.Envelop<Shell, any>) {
    let node = this.#tree;
    for (const key of path) {
      node = node.children[key] ??= EventsTree.node();
    }
    node.atoms.add(atom);
  }

  delete(path: Atom.Path, atom: Atom.Exact.Envelop<Shell, any>): boolean {
    let node: EventsTree.Node<Shell> | undefined = this.#tree;
    for (const key of path) {
      node = node?.children[key];
      if (!node) return false;
    }
    return node.atoms.delete(atom);
  }

  move(
    from: Atom.Path,
    to: Atom.Path,
    atom: Atom.Exact.Envelop<Shell, any>,
  ): boolean {
    if (this.delete(from, atom)) {
      this.add(to, atom);
      return true;
    }
    return false;
  }

  static node<Shell extends Atom.Shell>(): EventsTree.Node<Shell> {
    return { atoms: new Set(), children: {} };
  }

  trigger(path: Atom.Path, changes: FieldChange) {
    let curChanges = changes;
    this.traverse(path, (_, atoms) => {
      atoms.forEach((atom) => {
        atom.trigger(curChanges);
      });
      curChanges = shiftChildChanges(curChanges);
    });
  }
}

export namespace EventsTree {
  export interface Node<Shell extends Atom.Shell> {
    atoms: Set<Atom.Exact.Envelop<Shell, unknown>>;
    children: Record<keyof any, Node<Shell>>;
  }

  export type TraverseCallback<Shell extends Atom.Shell> = (
    path: Atom.Path,
    atoms: Atom.Exact.Envelop<Shell, unknown>[],
  ) => void;
}
