import type { Atom } from "../../../atom/definition.ts";
import type { AtomRef } from "../../../atom/ref/definition.ts";
import { AtomRefGhost } from "../../../atom/ref/ghost/index.js";

const hintSymbol = Symbol();

export declare class FieldRefGhost<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  >
  extends AtomRefGhost<"field", Value, Qualifier, Parent>
  implements FieldRefGhost.Interface<Value, Qualifier, Parent>
{
  //#region Instance

  [hintSymbol]: true;

  //#endregion Instance
}

export namespace FieldRefGhost {
  //#region Interface

  export interface Interface<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > extends Hint,
      AtomRefGhost.Interface<"field", Value, Qualifier, Parent> {}

  export interface Hint {
    [hintSymbol]: true;
  }

  //#endregion Interface
}
