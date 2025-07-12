import type { Enso } from "../../types.ts";
import { EnsoUtils as Utils } from "../../utils.ts";
import type { FieldOld } from "../old.tsx";

export interface BaseField<Payload>
  extends Enso.InterfaceAttributes<BaseField.Def<Payload>>,
    Enso.InterfaceValueRead<BaseField.Def<Payload>>,
    Enso.InterfaceMeta,
    FieldOld.InterfaceTree<BaseField.Def<Payload>>,
    Enso.InterfaceEvents,
    Enso.InterfaceWatch<BaseField.Def<Payload>>,
    FieldOld.InterfaceMap<BaseField.Def<Payload>>,
    FieldOld.InterfaceCollection<FieldOld.InterfaceDef<Payload>>,
    Enso.InterfaceSystem {}

export namespace BaseField {
  export type Def<Payload> = {
    Payload: Payload;
    Unknown: FieldOld<unknown>;
    NonNullish: BaseField<Utils.NonNullish<Payload>>;
    Bound: Bound<Payload>;
  };

  export interface Bound<Payload>
    extends BaseField<Payload>,
      Enso.InterfaceBound {}
}
