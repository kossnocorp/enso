export function discriminateMixin(stateField: string): () => any;

export function useDiscriminateMixin(): () => any;

export namespace DiscriminateMixin {
  export type DiscriminatorKey<Payload> = keyof Exclude<Payload, undefined>;
}
