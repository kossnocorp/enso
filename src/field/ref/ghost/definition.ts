import type { Atom } from "../../../atom/index.js";
import type { AtomRef } from "../../../atom/ref/definition.ts";
import { AtomRefGhost } from "../../../atom/ref/ghost/index.js";

const maybeRefHintSymbol = Symbol();

export declare class FieldRefGhost<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"field", Value> = unknown,
  >
  extends AtomRefGhost<"field" | "ref", Value, Qualifier, Parent>
  implements FieldRefGhost.Interface<Value, Qualifier, Parent>
{
  //#region Instance

  [maybeRefHintSymbol]: true;

  //#endregion Instance

  //#region Value

  value: Atom.ValueProp<Value>;

  //#endregion Value
}

export namespace FieldRefGhost {
  //#region Interface

  export interface Interface<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<"field", Value> = unknown,
  > extends Hint,
      AtomRefGhost.Interface<"field" | "ref-ghost", Value, Qualifier, Parent> {}

  export interface Hint {
    [maybeRefHintSymbol]: true;
  }

  //#endregion Interface
}
