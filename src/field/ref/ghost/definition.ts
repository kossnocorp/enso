import type { AtomRef } from "../../../atom/ref/definition.ts";
import { AtomRefGhost } from "../../../atom/ref/ghost/index.js";

const hintSymbol = Symbol();

export declare class FieldRefGhost<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  >
  extends AtomRefGhost<"field", Value, Qualifier, ParentValue>
  implements FieldRefGhost.Interface<Value, Qualifier, ParentValue>
{
  //#region Instance

  [hintSymbol]: true;

  //#endregion Instance
}

export namespace FieldRefGhost {
  //#region Interface

  export interface Interface<
    Value,
    Qualifier extends AtomRef.Qualifier = never,
    ParentValue = unknown,
  > extends Hint,
      AtomRefGhost.Interface<"field", Value, Qualifier, ParentValue> {}

  export interface Hint {
    [hintSymbol]: true;
  }

  //#endregion Interface
}
