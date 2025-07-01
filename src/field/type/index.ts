import { AsState } from "../../state/index.ts";
import { EnsoUtils } from "../../utils.ts";
import { StaticImplements } from "../util.ts";

export const fieldDiscriminate = ((
  field: EnsoUtils.Nullish<StaticImplements<AsState.Read>>,
  key: any,
) =>
  field && {
    discriminator: (field.constructor.asState(field).get() as any)?.[key],
    field: field.constructor.fromField(field),
  }) as unknown as FieldDiscriminate;

export interface FieldDiscriminate {}
