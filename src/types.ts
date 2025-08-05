import { DependencyList } from "react";
import { ChangesEvent, FieldChange } from "./change/index.ts";
import { EventsTree } from "./events/index.ts";
import { EnsoUtils as Utils } from "./utils.ts";

declare const safeNullish: unique symbol;

export namespace Enso {
  //#region Basics

  export type SafeNullish<Type> = Utils.Branded<
    Type | Utils.Nullish,
    typeof safeNullish
  >;

  //#endregion
}
