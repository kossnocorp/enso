import { Atom } from "../../index.js";
import { AtomRef } from "../definition.ts";

export declare class AtomRefGhost<
  Type extends AtomRef.Type,
  Value,
  Qualifier extends AtomRef.Qualifier = never,
  ParentValue = unknown,
> {
  //#region Type

  forEach: AtomRef.ForEachProp<Type, Value>;

  //#endregion Type
}

export namespace AtomRefGhost {
  //#region Shell

  // WIP: Try to find a better name for this type, so region can be more precise.
  export type Type = Atom.Type | "ref-ghost" | AtomRef.Variant;

  //#endregion Shell

  //#region Interface

  export interface Interface<
    Type extends AtomRefGhost.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  > extends AtomRef.Interface<
      Type | "ref-ghost",
      Value,
      Qualifier,
      ParentValue
    > {}

  //#endregion Interface
}
