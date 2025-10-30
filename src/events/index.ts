import type { Atom } from "../atom/definition.ts";
import { AtomChange, shiftChildChanges } from "../change/index.ts";

export class EventsTree<Kind extends Atom.Flavor.Kind> {
  #tree: EventsTree.Node<Kind> = EventsTree.node();

  at(
    path: Atom.Path,
  ): Atom.Exact.Envelop<Kind, any, any, Atom.Qualifier.Default, never>[] {
    let node: EventsTree.Node<Kind> | undefined = this.#tree;
    for (const key of path) {
      node = node.children[key];
      if (!node) return [];
    }
    return Array.from(node.atoms);
  }

  traverse(path: Atom.Path, callback: EventsTree.TraverseCallback<Kind>) {
    const queue = [];
    let node: EventsTree.Node<Kind> | undefined = this.#tree;
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

  add(
    path: Atom.Path,
    atom: Atom.Exact.Envelop<Kind, any, any, Atom.Qualifier.Default, never>,
  ) {
    let node = this.#tree;
    for (const key of path) {
      node = node.children[key] ??= EventsTree.node();
    }
    node.atoms.add(atom);
  }

  delete(
    path: Atom.Path,
    atom: Atom.Exact.Envelop<Kind, any, any, Atom.Qualifier.Default, never>,
  ): boolean {
    let node: EventsTree.Node<Kind> | undefined = this.#tree;
    for (const key of path) {
      node = node?.children[key];
      if (!node) return false;
    }
    return node.atoms.delete(atom);
  }

  move(
    from: Atom.Path,
    to: Atom.Path,
    atom: Atom.Exact.Envelop<Kind, any, any, Atom.Qualifier.Default, never>,
  ): boolean {
    if (this.delete(from, atom)) {
      this.add(to, atom);
      return true;
    }
    return false;
  }

  static node<Kind extends Atom.Flavor.Kind>(): EventsTree.Node<Kind> {
    return { atoms: new Set(), children: {} };
  }

  trigger(path: Atom.Path, changes: AtomChange) {
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
  export interface Node<Kind extends Atom.Flavor.Kind> {
    atoms: Set<
      Atom.Exact.Envelop<
        Kind,
        any,
        Atom.Def<unknown>,
        Atom.Qualifier.Default,
        never
      >
    >;
    children: Record<keyof any, Node<Kind>>;
  }

  export type TraverseCallback<Kind extends Atom.Flavor.Kind> = (
    path: Atom.Path,
    atoms: Atom.Exact.Envelop<
      Kind,
      any,
      Atom.Def<unknown>,
      Atom.Qualifier.Default,
      never
    >[],
  ) => void;
}
