import { Atom } from "../../atom/index.js";
import { AtomRef } from "../../atom/ref/index.js";
import type { FieldRefGhost } from "./ghost/definition.ts";

export * from "./old.ts";

const hintSymbol = Symbol();

export declare class FieldRef<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >
  extends AtomRef<"field" | "ref", Value, Qualifier, Parent>
  implements FieldRef.Interface<Value, Qualifier, Parent>
{
  //#region Instance

  [hintSymbol]: true;

  constructor(atom: Atom.Envelop<"field", Atom.Def<Value>, Qualifier, Parent>);

  //#endregion Instance
}

export namespace FieldRef {
  //#region Kind

  export type Envelop<
    Type extends AtomRef.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Type extends "ref"
    ? FieldRef<Value, Qualifier, Parent>
    : Type extends "ref-ghost"
      ? FieldRefGhost<Value, Qualifier, Parent>
      : never;

  //#endregion Kind

  //#region Interface

  export interface Hint {
    [hintSymbol]: true;
  }

  export interface Interface<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Hint,
      AtomRef.Interface<"field" | "ref", Value, Qualifier, Parent> {}

  //#endregion Interface
}
