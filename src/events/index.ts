import { Atom } from "../atom/definition.ts";
import { FieldChange, shiftChildChanges } from "../change/index.ts";
import type { Enso } from "../types.ts";

export class EventsTree<Shell extends Atom.Shell> {
  #tree: EventsTree.Node<Shell> = EventsTree.node();

  at(path: Enso.Path): Atom.Invariant.Envelop<Shell, any>[] {
    let node: EventsTree.Node<Shell> | undefined = this.#tree;
    for (const key of path) {
      node = node.children[key];
      if (!node) return [];
    }
    return Array.from(node.atoms);
  }

  traverse(path: Enso.Path, callback: EventsTree.TraverseCallback<Shell>) {
    const queue = [];
    let node: EventsTree.Node<Shell> | undefined = this.#tree;
    const pathQueue = [...path];
    let curPath: Enso.Path = [];
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

  add(path: Enso.Path, atom: Atom.Invariant.Envelop<Shell, any>) {
    let node = this.#tree;
    for (const key of path) {
      node = node.children[key] ??= EventsTree.node();
    }
    node.atoms.add(atom);
  }

  delete(path: Enso.Path, atom: Atom.Invariant.Envelop<Shell, any>): boolean {
    let node: EventsTree.Node<Shell> | undefined = this.#tree;
    for (const key of path) {
      node = node?.children[key];
      if (!node) return false;
    }
    return node.atoms.delete(atom);
  }

  move(
    from: Enso.Path,
    to: Enso.Path,
    atom: Atom.Invariant.Envelop<Shell, any>,
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

  trigger(path: Enso.Path, changes: FieldChange) {
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
    atoms: Set<Atom.Invariant.Envelop<Shell, unknown>>;
    children: Record<string, Node<Shell>>;
  }

  export type TraverseCallback<Shell extends Atom.Shell> = (
    path: Enso.Path,
    atoms: Atom.Invariant.Envelop<Shell, unknown>[],
  ) => void;
}
