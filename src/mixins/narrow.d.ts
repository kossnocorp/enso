import type { EnsoUtils } from "../utils.ts";

export function narrowMixin(): () => any | undefined;

export function useNarrowMixin(): () => any | undefined;

export namespace NarrowMixin {
  export type Callback<Payload, Narrowed> = (
    payload: Payload,
    wrap: Wrap
  ) => Wrapper<Narrowed> | EnsoUtils.Falsy;

  export type Wrap = <Payload>(payload: Payload) => Wrapper<Payload>;

  export type Wrapper<Payload> = {
    [wrapperBrand]: Payload;
  };

  const wrapperBrand: unique symbol;
}
