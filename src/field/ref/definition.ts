import { Atom } from "../../atom/index.js";
import { AtomRef } from "../../atom/ref/index.js";
import type { FieldRefGhost } from "./ghost/definition.ts";

export * from "./old.ts";

const refHintSymbol = Symbol();

export declare class FieldRef<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  >
  extends AtomRef<"field" | "ref", Value, Qualifier, Parent>
  implements FieldRef.Interface<Value, Qualifier, Parent>
{
  //#region Instance

  [refHintSymbol]: true;

  constructor(atom: Atom.Envelop<"field", Value, Qualifier, Parent>);

  //#endregion Instance
}

export namespace FieldRef {
  //#region Shell

  export type Envelop<
    Type extends AtomRef.Type,
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > = Type extends "ref"
    ? FieldRef<Value, Qualifier, Parent>
    : Type extends "ref-ghost"
      ? FieldRefGhost<Value, Qualifier, Parent>
      : never;

  //#endregion Shell

  //#region Interface

  export interface Interface<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    Parent extends Atom.Parent.Constraint<Value> = never,
  > extends Hint,
      AtomRef.Interface<"field" | "ref", Value, Qualifier, Parent> {}

  export interface Hint {
    [refHintSymbol]: true;
  }

  //#endregion Interface
}
