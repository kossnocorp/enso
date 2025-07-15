import type { Atom } from "../../definition.ts";
import { AtomRef } from "../index.js";

export declare class AtomRefGhost<
    Type extends Atom.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >
  extends AtomRef<Type | "ref-ghost", Value, Qualifier, Parent>
  implements AtomRefGhost.Interface<Type, Value, Qualifier, Parent> {}

export namespace AtomRefGhost {
  //#region Interface

  export interface Interface<
    Type extends Atom.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends AtomRef.Interface<Type | "ref-ghost", Value, Qualifier, Parent> {}

  //#endregion Interface
}
