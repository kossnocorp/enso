import type { Atom } from "../index.js";

export declare class AtomDouble<
  Flavor extends Atom.Flavor,
  Value,
  Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
  Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
> implements AtomDouble.Interface<Flavor, Value, Qualifier, Parent> {}

export namespace AtomDouble {
  //#region Interface

  export interface Interface<
    Flavor extends Atom.Flavor,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > {}

  //#endregion Interface
}
