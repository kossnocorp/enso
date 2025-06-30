import type { Enso } from "../../types.ts";
import { EnsoUtils as Utils } from "../../utils.ts";
import type { Field } from "../index.tsx";

export interface BaseField<Payload>
  extends Enso.InterfaceAttributes<BaseField.Def<Payload>>,
    Enso.InterfaceValueRead<BaseField.Def<Payload>>,
    Enso.InterfaceMeta,
    Field.InterfaceTree<BaseField.Def<Payload>>,
    Enso.InterfaceEvents,
    Enso.InterfaceWatch<BaseField.Def<Payload>>,
    Field.InterfaceMap<BaseField.Def<Payload>>,
    Field.InterfaceCollection<Field.InterfaceDef<Payload>>,
    Enso.InterfaceSystem {}

export namespace BaseField {
  export type Def<Payload> = {
    Payload: Payload;
    Unknown: Field<unknown>;
    NonNullish: BaseField<Utils.NonNullish<Payload>>;
    Bound: Bound<Payload>;
  };

  export interface Bound<Payload>
    extends BaseField<Payload>,
      Enso.InterfaceBound {}
}
