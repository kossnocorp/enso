import type { Atom } from "../index.js";

export declare class AtomDouble<
  Type extends Atom.Type,
  Value,
  Qualifier extends Atom.Qualifier = never,
  Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
> implements AtomDouble.Interface<Type, Value, Qualifier, Parent> {}

export namespace AtomDouble {
  //#region Interface

  export interface Interface<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > {}

  //#endregion Interface
}
