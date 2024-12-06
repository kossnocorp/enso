export function decomposeMixin(stateField: string): () => any;

export function useDecomposeMixin(): () => any;

export namespace DecomposeMixin {
  export type Callback<Payload> = (
    newPayload: Payload,
    prevPayload: Payload
  ) => boolean;
}
