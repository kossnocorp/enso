import type { Atom } from "../index.js";

export declare class AtomDouble<
  Flavor extends Atom.Flavor.Constraint,
  Value,
  Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
  Parent extends Atom.Parent.Constraint<Atom.Def<Value>> = Atom.Parent.Default,
> implements AtomDouble.Interface<Flavor, Value, Qualifier, Parent> {}

export namespace AtomDouble {
  //#region Interface

  export interface Interface<
    Flavor extends Atom.Flavor.Constraint,
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > {}

  //#endregion Interface
}
