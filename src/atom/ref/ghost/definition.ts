import type { Atom } from "../../definition.ts";
import { AtomRef } from "../index.js";

export declare class AtomRefGhost<
    Type extends Atom.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  >
  extends AtomRef<Type | "ref-ghost", Value, Qualifier, ParentValue>
  implements AtomRefGhost.Interface<Type, Value, Qualifier, ParentValue> {}

export namespace AtomRefGhost {
  //#region Interface

  export interface Interface<
    Type extends Atom.Type,
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
