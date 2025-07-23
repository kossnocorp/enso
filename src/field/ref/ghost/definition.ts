import type { Atom } from "../../../atom/definition.ts";
import type { AtomRef } from "../../../atom/ref/definition.ts";
import { AtomRefGhost } from "../../../atom/ref/ghost/index.js";

const hintSymbol = Symbol();

export declare class FieldRefGhost<
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  >
  extends AtomRefGhost<"field", ValueDef, Qualifier, Parent>
  implements FieldRefGhost.Interface<ValueDef, Qualifier, Parent>
{
  //#region Instance

  [hintSymbol]: true;

  //#endregion Instance
}

export namespace FieldRefGhost {
  //#region Interface

  export interface Interface<
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends Hint,
      AtomRefGhost.Interface<"field", ValueDef, Qualifier, Parent> {}

  export interface Hint {
    [hintSymbol]: true;
  }

  //#endregion Interface
}
