import type { Atom } from "../index.js";

export declare class AtomDouble<
  Type extends Atom.Type,
  Value,
  Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
  Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
> implements AtomDouble.Interface<Type, Value, Qualifier, Parent> {}

export namespace AtomDouble {
  //#region Interface

  export interface Interface<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<Value> = Atom.Parent.Default,
  > {}

  //#endregion Interface
}
