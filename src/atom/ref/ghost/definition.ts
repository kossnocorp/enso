import type { Atom } from "../../definition.ts";
import { AtomRef } from "../index.js";

export declare class AtomRefGhost<
    Flavor extends AtomRef.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  >
  extends AtomRef<Flavor | "ref-ghost", ValueDef, Qualifier, Parent>
  implements AtomRefGhost.Interface<Flavor, ValueDef, Qualifier, Parent> {}

export namespace AtomRefGhost {
  //#region Interface

  export interface Interface<
    Flavor extends AtomRef.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
  > extends AtomRef.Interface<
      Flavor | "ref-ghost",
      ValueDef,
      Qualifier,
      Parent
    > {}

  //#endregion Interface
}
