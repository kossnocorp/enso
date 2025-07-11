import type { Atom } from "../index.js";

export declare class AtomProxy<
  Type extends Atom.Type,
  Value,
  Qualifier extends Atom.Qualifier = never,
  Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
> implements AtomProxy.Interface<Type, Value, Qualifier, Parent> {}

export namespace AtomProxy {
  //#region Interface

  export interface Interface<
    Type extends Atom.Type,
    Value,
    Qualifier extends Atom.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Type, Value> = unknown,
  > {}

  //#endregion Interface
}
