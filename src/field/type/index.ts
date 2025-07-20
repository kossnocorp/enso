import { useCallback } from "react";
import { AsState } from "../../state/index.ts";
import { EnsoUtils as Utils } from "../../utils.ts";
import { useAtomHook } from "../../atom/hooks/index.ts";
import { StaticImplementsOld } from "../old.tsx";

export const fieldDiscriminate = ((
  field: Utils.Nullish<StaticImplementsOld<AsState.Read>>,
  discriminator: any,
) =>
  field && {
    discriminator: (field.constructor.asState(field).get() as any)?.[
      discriminator
    ],
    // @ts-expect-error -- WIP: Types revamp
    field: field.constructor.fromField(field),
  }) as unknown as FieldDiscriminate;

export interface FieldDiscriminate {}

export const useFieldDiscriminate = ((
  field: Utils.Nullish<StaticImplementsOld<AsState.Read>>,
  discriminator: any,
) => {
  const getValue = useCallback(
    () => (fieldDiscriminate as any)(field, discriminator),
    [field, discriminator],
  );

  const shouldRender = useCallback(
    (prev: any, next: any) => prev?.discriminator !== next.discriminator,
    [],
  );

  // @ts-ignore -- TODO
  return useAtomHook({ atom: field, getValue, shouldRender });
}) as unknown as UseFieldDiscriminate;

export interface UseFieldDiscriminate {}
