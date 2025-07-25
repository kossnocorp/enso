import { DependencyList } from "react";
import { ChangesEvent, FieldChange } from "./change/index.ts";
import { EventsTree } from "./events/index.ts";
import { EnsoUtils as Utils } from "./utils.ts";

export namespace Enso {
  //#region Base

  export type Path = readonly (string | number)[];

  //#endregion

  // TODO: Brands and Flags are State properties, but I don't want to force
  // State right now, until there is a good reason to do so.

  //#region Brands

  export type TransferBrands<Type, TypeSource> = Type &
    (TypeSource extends DetachableBrand ? DetachableBrand : unknown) &
    (TypeSource extends TriedBrand ? TriedBrand : unknown) &
    (TypeSource extends BoundBrand ? BoundBrand : unknown);

  export type TransferDetachable<Type, SourceType> =
    SourceType extends Detachable<unknown> ? Detachable<Type> : Type;

  export type Branded<Type, TypeFlags extends Flags | undefined> = Type &
    (FlagDetachable extends TypeFlags ? DetachableBrand : unknown) &
    (FlagTried extends TypeFlags ? TriedBrand : unknown) &
    (FlagBound extends TypeFlags ? BoundBrand : unknown);

  // Detachable

  export type Detachable<Type> = Type & DetachableBrand;

  export type DetachableBrand = { [detachableBrand]: true };
  declare const detachableBrand: unique symbol;

  export type DetachableKeys<Value> = Exclude<
    {
      [Key in keyof Value]: Utils.IsStaticKey<Value, Key> extends true
        ? Utils.IsOptionalKey<Value, Key> extends true
          ? Key
          : never
        : Key;
    }[keyof Value],
    undefined
  >;

  // Tried

  export type Tried<Type> = Type & TriedBrand;

  export type TriedBrand = { [triedBrand]: true };
  declare const triedBrand: unique symbol;

  // Bound

  export type Bound<Type> = Type & BoundBrand;

  export type BoundBrand = { [boundBrand]: true };
  declare const boundBrand: unique symbol;

  //#endregion

  //#region Flags

  export type Flags = FlagDetachable | FlagTried | FlagBound;

  export type FlagDetachable = "detachable";

  export type FlagTried = "tried";

  export type FlagBound = "bound";

  //#endregion

  //#region Interfaces

  export interface InterfaceDef {
    Payload: unknown;
    Unknown: unknown;
    NonNullish: unknown;
    Bound: unknown;
  }

  export interface InterfaceAttributes<Def extends InterfaceDef> {
    id: string;

    // TODO: Move into InterfaceTree
    parent: Def["Unknown"] | undefined;

    key: string | undefined;

    path: string[];

    name: string;
  }

  export interface InterfaceValueRead<Payload> {
    get(): Payload;

    useGet<Props extends UseGetProps | undefined = undefined>(
      props?: Props,
    ): UseGet<Payload, Props>;

    initial: Payload;
  }

  export interface InterfaceValueWrite<Def extends InterfaceDef> {
    lastChanges: FieldChange;

    // NOTE: `set` must be defined in the proxy interface (i.e. `Field.InterfaceValueWrite`),
    // as it involves a generic type altering the payload type.

    commit(): void;

    reset(): void;

    pave(fallback: Utils.NonNullish<Def["Payload"]>): Def["NonNullish"];
  }

  export interface InterfaceMeta {
    dirty: boolean;

    useDirty<Enable extends boolean | undefined = undefined>(
      enable?: Enable,
    ): ToggleableResult<Enable, boolean>;

    useMeta<Props extends UseMetaProps | undefined = undefined>(
      props?: Props,
    ): Meta<Props>;
  }

  export interface InterfaceTree<Def extends InterfaceDef> {
    root: Def["Unknown"];

    // NOTE: `$` and `at` must be defined in the proxy interface (i.e. `Field.InterfaceTree`),
    // as they involve generic types altering the payload type.

    try(): TryUnion<Def>;

    // NOTE: `try` with a key argument must be defined in the proxy interface (i.e. `Field.InterfaceTree`),
    // as it involves a generic type altering the payload type.

    lookup(path: Path): Def["Unknown"] | undefined;
  }

  export interface InterfaceEvents {
    get eventsTree(): EventsTree;

    trigger(changes: FieldChange, notifyParents?: boolean): void;

    withhold(): void;

    unleash(): void;
  }

  export interface InterfaceWatch<Def extends InterfaceDef> {
    watch(callback: WatchCallback<Def["Payload"]>, sync?: boolean): Unwatch;

    useWatch(callback: Enso.WatchCallback<Def["Payload"]>): void;

    unwatch(): void;

    useBind(): Def["Bound"];
  }

  export interface InterfaceMap<Def extends InterfaceDef> {
    useCompute<Computed>(
      callback: ComputeCallback<Def["Payload"], Computed>,
      deps: DependencyList,
    ): Computed;

    // NOTE: `decompose`, `useDecompose`, `discriminate`, `useDiscriminate`,
    // `narrow`, `useNarrow` and `widen` must be defined in the proxy interface
    // (i.e. `Field.InterfaceMap`), as they involve generic types altering
    // the payload type.
  }

  export interface InterfaceComputed {
    // NOTE: `into` and `useInto` must be defined in the proxy interface (i.e. `Field.InterfaceTree`),
    // as they involve generic types altering the payload type.
  }

  export interface InterfaceCollection {}

  export interface InterfaceSystem {
    deconstruct(): void;
  }

  export interface InterfaceBound {
    [interfaceBoundBrand]: true;
  }

  declare const interfaceBoundBrand: unique symbol;

  //#endregion

  //#region Value

  export interface UseGetProps extends UseMetaProps {
    meta?: boolean | undefined;
  }

  export type UseGet<Payload, Props extends UseGetProps | undefined> =
    UseGetIncludeMeta<Props> extends true
      ? [Payload, Props extends { meta: true } ? Meta<undefined> : Meta<Props>]
      : Payload;

  export type UseGetIncludeMeta<Props extends UseGetProps | undefined> =
    undefined extends Props
      ? false
      : Props extends UseGetProps
        ? Props["meta"] extends true
          ? true
          : Props["meta"] extends false
            ? false
            : Props["valid"] extends true
              ? true
              : Props["dirty"] extends true
                ? true
                : false
        : false;

  //#endregion

  //#region Meta

  export interface UseMetaProps {
    valid?: boolean | undefined;
    errors?: boolean | undefined;
    dirty?: boolean | undefined;
  }

  export type Meta<Props extends UseMetaProps | undefined> =
    Props extends UseMetaProps
      ? {
          valid: MetaEnable<Props["valid"], boolean>;
          errors: MetaEnable<Props["errors"], Error[]>;
          dirty: MetaEnable<Props["dirty"], boolean>;
        }
      : {
          valid: boolean;
          errors: Error[];
          dirty: boolean;
        };

  export type MetaEnable<Enable, Payload> = Enable extends true
    ? Payload
    : Enable extends false
      ? undefined
      : Enable extends boolean
        ? Payload | undefined
        : Enable extends undefined
          ? undefined
          : never;

  //#endregion

  //#region Tree

  export type TryUnion<Def extends InterfaceDef> =
    // Add null to the union
    | (null extends Def["Payload"] ? null : never)
    // Add undefined to the union
    | (undefined extends Def["Payload"] ? undefined : never)
    // Resolve branded field without null or undefined
    | Tried<Def["NonNullish"]>;

  //#endregion

  //#region Watch

  export type WatchCallback<Payload> = (
    payload: Payload,
    event: ChangesEvent,
  ) => void;

  export type Unwatch = () => void;

  //#endregion

  //#region Transform

  export type ComputeCallback<Payload, Computed> = (
    payload: Payload,
  ) => Computed;

  //#endregion

  //#region Collection

  //#endregion

  //#region Hooks

  export type ToggleableResult<
    Enable extends boolean | undefined,
    Type,
  > = Enable extends true | undefined ? Type : undefined;

  //#endregion
}
