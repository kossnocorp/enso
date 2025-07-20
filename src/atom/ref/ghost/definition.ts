import type { Atom } from "../../definition.ts";
import { AtomRef } from "../index.js";

export declare class AtomRefGhost<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  >
  extends AtomRef<Flavor | "ref-ghost", Value, Qualifier, Parent>
  implements AtomRefGhost.Interface<Flavor, Value, Qualifier, Parent> {}

export namespace AtomRefGhost {
  //#region Interface

  export interface Interface<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > extends AtomRef.Interface<Flavor | "ref-ghost", Value, Qualifier, Parent> {}

  //#endregion Interface
}
