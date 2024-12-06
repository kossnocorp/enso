export function intoMixin(Self: IntoMixin.Constructor): () => any;

export function useIntoMixin(Self: IntoMixin.Constructor): () => any;

export namespace IntoMixin {
  export type Constructor<Type = {}> = new (...args: any[]) => Type;

  export type IntoCallback<Payload, Computed> = (payload: Payload) => Computed;

  export type FromCallback<Payload, ComputedPayload> = (
    payload: ComputedPayload
  ) => Payload;
}
