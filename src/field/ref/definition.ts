import { Atom } from "../../atom/index.js";
import { AtomRef } from "../../atom/ref/index.js";
import type { FieldRefGhost } from "./ghost/definition.ts";

export * from "./old.ts";

const hintSymbol = Symbol();

export declare class FieldRef<
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<ValueDef>
    > = Atom.Parent.Default,
  >
  extends AtomRef<"field" | "ref", ValueDef, Qualifier, Parent>
  implements FieldRef.Interface<ValueDef, Qualifier, Parent>
{
  //#region Instance

  [hintSymbol]: true;

  constructor(
    atom: Atom.Envelop<"field", Atom.Def<ValueDef>, Qualifier, Parent>,
  );

  //#endregion
}

export namespace FieldRef {
  //#region Kind

  export type Envelop<
    Flavor extends AtomRef.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<ValueDef>
    > = Atom.Parent.Default,
  > = "ref" extends Flavor
    ? FieldRef<ValueDef, Qualifier, Parent>
    : "ref-ghost" extends Flavor
      ? FieldRefGhost<ValueDef, Qualifier, Parent>
      : never;

  //#endregion

  //#region Interface

  export interface Hint {
    [hintSymbol]: true;
  }

  export interface Interface<
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Hint,
      AtomRef.Interface<"field" | "ref", ValueDef, Qualifier, Parent> {}

  //#endregion
}
