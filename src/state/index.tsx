import React, { useEffect, useMemo, useState } from "react";
import { useRerender } from "../hooks/rerender.ts";
import {
  type DecomposeMixin,
  decomposeMixin,
  useDecomposeMixin,
} from "../mixins/decompose.js";
import {
  type DiscriminateMixin,
  discriminateMixin,
  useDiscriminateMixin,
} from "../mixins/discriminate.js";
import {
  type NarrowMixin,
  narrowMixin,
  useNarrowMixin,
} from "../mixins/narrow.js";
import { type EnsoUtils } from "../utils.ts";
import { nanoid } from "nanoid";

//#region State

const createSymbol = Symbol();
const clearSymbol = Symbol();

export const statePrivate = Symbol();

export class State<Payload> {
  static use<Payload>(value: Payload): State<Payload> {
    const state = useMemo(() => new State(value), []);
    return state;
  }

  #id = nanoid();
  #parent?: State.Parent<any> | undefined;
  #use: State.Use<Payload>;
  #onInput;

  // @ts-ignore
  #internal = new InternalPrimitiveState(this, undefinedValue);

  #initial: Payload;

  constructor(value: Payload, parent?: State.Parent<any>) {
    this.#initial = value;

    this.#set(value);
    this.#parent = parent;

    this.#use = new Proxy(() => {}, {
      // @ts-ignore: This is okay
      get: (_, key: string) => this.$[key].use,

      apply: () => {
        const rerender = useRerender();
        useEffect(
          () =>
            this.watch((_payload, event) => {
              if (this.#internal.updated(event)) rerender();
            }),
          []
        );
        return this;
      },
    }) as State.Use<Payload>;

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value as Payload;
      this.set(value);
    };

    this.#onInput = <Element extends HTMLElement>(element: Element) => {
      switch (true) {
        case element instanceof HTMLInputElement:
        // [TODO]
        default:
          return onInput;
      }
    };

    this.set = this.set.bind(this);
    this.Control = this.Control.bind(this);
    this.ref = this.ref.bind(this);
  }

  #clearCache() {
    this.#cachedDirty = undefined;
    this.#cachedInvalids = undefined;
  }

  //#region Attributes

  get id(): string {
    return this.#id;
  }

  get key(): string | undefined {
    return this.#parent?.key;
  }

  get path(): string[] {
    return this.#parent ? [...this.#parent.state.path, this.#parent.key] : [];
  }

  get parent(): State<any> | undefined {
    return this.#parent?.state;
  }

  //#endregion

  //#region Value

  get(): Payload {
    return this.#internal.get();
  }

  useGet<Props extends State.UseGetProps | undefined = undefined>(
    props?: Props
  ): State.UseGet<Payload, Props> {
    const [payload, setPayload] = useState(this.get());
    const watchAllMeta = !!props?.meta;
    const watchMeta =
      watchAllMeta || props?.invalids || props?.valid || props?.dirty;
    const meta = this.useMeta(
      watchAllMeta
        ? undefined
        : {
            invalids: !!props?.invalids,
            valid: !!props?.valid,
            error: !!props?.error,
            dirty: !!props?.dirty,
          }
    );

    useEffect(
      () =>
        this.watch((payload, event) => {
          // Ignore only valid-invalid changes
          if (
            !(event.detail & ~(stateChangeType.valid | stateChangeType.invalid))
          )
            return;

          setPayload(payload);
        }),
      []
    );
    // @ts-ignore: [TODO]
    return watchMeta ? [payload, meta] : payload;
  }

  // [TODO] Exposing the notify parents flag might be dangerous
  set(value: Payload | UndefinedValue, notifyParents = true): StateChange | 0 {
    const change = this.#set(value);
    if (change) this.trigger(change, notifyParents);

    return change;
  }

  #set(value: Payload | UndefinedValue): StateChange | 0 {
    const ValueConstructor = InternalState.detect(value);

    // The state is already of the same type
    if (this.#internal instanceof ValueConstructor)
      // @ts-ignore: [TODO]
      return this.#internal.set(value);

    // The state is of a different type
    this.#internal.unwatch();

    let change = stateChangeType.type;
    // The state is being removed
    if (value === undefinedValue) change |= stateChangeType.removed;

    // @ts-ignore: This is fine
    this.#internal = new ValueConstructor(this, value);
    // @ts-ignore: [TODO]
    this.#internal.set(value);
    return change;
  }

  [createSymbol](value: Payload): StateChange | 0 {
    const change = this.#internal.set(value) | stateChangeType.created;
    this.trigger(change, false);
    return change;
  }

  [clearSymbol]() {
    this.#internal.set(undefined as Payload);
  }

  get initial(): Payload {
    return this.#initial;
  }

  #cachedDirty: boolean | undefined;

  get dirty(): boolean {
    if (this.#cachedDirty === undefined) {
      this.#cachedDirty = this.#internal.dirty(this.#initial);
    }
    return this.#cachedDirty;
  }

  useDirty<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? boolean : undefined {
    const [dirty, setDirty] = useState(enable === false ? true : this.dirty);

    useEffect(
      () => {
        if (enable === false) return;
        return this.watch(() => {
          const nextDirty = this.dirty;
          if (nextDirty !== dirty) setDirty(nextDirty);
        });
      },
      // [TODO] Consider using a ref for performance
      [enable, dirty, setDirty]
    );

    // @ts-ignore: This is fine
    return enable === false ? undefined : dirty;
  }

  //#endregion

  //#region Tree

  get $(): State.$<Payload> {
    return this.#internal.$();
  }

  get try(): State.Try<Payload> {
    return this.#internal.try();
  }

  //#endregion

  get use(): State.Use<Payload> {
    return this.#use;
  }

  //#region Watching

  #target = new EventTarget();
  #subs = new Set<(event: Event) => void>();

  watch(callback: State.WatchCallback<Payload>): State.Unwatch {
    const handler = (event: Event) => {
      callback(this.get(), event as StateChangeEvent);
    };

    this.#subs.add(handler);
    this.#target.addEventListener("change", handler);

    return () => {
      this.#subs.delete(handler);
      this.#target.removeEventListener("change", handler);
    };
  }

  unwatch() {
    this.#subs.forEach((sub) =>
      this.#target.removeEventListener("change", sub)
    );
    this.#subs.clear();
    this.#internal.unwatch();
  }

  trigger(change: StateChange, notifyParents: boolean = false) {
    this.#clearCache();

    this.#target.dispatchEvent(new StateChangeEvent(change));
    // If the updates should flow upstream to parents too
    if (notifyParents && this.#parent)
      this.#parent.state.#childTrigger(change, this.#parent.key);
  }

  #childTrigger(type: StateChange, key: string) {
    const updated =
      this.#internal.childUpdate(type, key) | stateChangeType.child;
    this.trigger(updated, true);
  }

  useMeta<Props extends State.UseMetaProps | undefined = undefined>(
    props?: Props
  ): State.Meta<Props> {
    const invalids = this.useInvalids(!props || !!props.invalids);
    const valid = this.useValid(!props || !!props.valid);
    const error = this.useError(!props || !!props.error);
    const dirty = this.useDirty(!props || !!props.dirty);
    return { invalids, valid, error, dirty } as State.Meta<Props>;
  }

  //#endregion

  //#region Mapping

  decompose: () => State.Decomposed<Payload> = decomposeMixin("state");

  useDecompose: (
    callback: DecomposeMixin.Callback<Payload>
  ) => State.Decomposed<Payload> = useDecomposeMixin();

  discriminate: <Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ) => State.Discriminated<Payload, Discriminator> = discriminateMixin("state");

  useDiscriminate: <
    Discriminator extends DiscriminateMixin.DiscriminatorKey<Payload>
  >(
    discriminator: Discriminator
  ) => State.Discriminated<Payload, Discriminator> = useDiscriminateMixin();

  into: <Computed>(
    intoCallback: State.IntoCallback<Payload, Computed>
  ) => State.Into<Payload, Computed> = (intoCallback) => {
    const computed = new ComputedState(intoCallback(this.get()), this);
    // [TODO] This creates a leak, so rather than holding on to the computed
    // state, store it as a weak ref and unsubscribe when it's no longer needed.
    this.watch((payload) => computed.set(intoCallback(payload)));

    return {
      from: (fromCallback) => {
        computed.watch((payload) => this.set(fromCallback(payload)));
        return computed;
      },
    };
  };

  useInto: <Computed>(
    intoCallback: State.IntoCallback<Payload, Computed>
  ) => State.Into<Payload, Computed> = (intoCallback) => {
    const computed = useMemo(
      () => new ComputedState(intoCallback(this.get()), this),
      []
    );

    useEffect(() => {
      // It's ok to trigger set here because the setting the same value won't
      // trigger any events, however for the better performance, it is better
      // if the into and from callbacks are memoized.
      computed.set(intoCallback(this.get()));
      return this.watch((payload) => computed.set(intoCallback(payload)));
    }, [intoCallback]);

    return useMemo(
      () => ({
        from: (fromCallback) => {
          useEffect(
            () => computed.watch((payload) => this.set(fromCallback(payload))),
            [computed, fromCallback]
          );
          return computed;
        },
      }),
      [computed]
    );
  };

  narrow: <Narrowed extends Payload>(
    callback: NarrowMixin.Callback<Payload, Narrowed>
  ) => State<Narrowed> | undefined = narrowMixin();

  useNarrow: <Narrowed extends Payload>(
    callback: NarrowMixin.Callback<Payload, Narrowed>
  ) => State<Narrowed> | undefined = useNarrowMixin();

  //#endregion

  remove() {
    this.set(undefinedValue);
  }

  //#region Collections

  forEach: State.ForEachFn<Payload> = ((callback: any) => {
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    )
      this.#internal.forEach(callback);
  }) as State.ForEachFn<Payload>;

  map: State.MapFn<Payload> = ((callback: any) => {
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    )
      return this.#internal.map(callback);
  }) as State.MapFn<Payload>;

  // @ts-ignore: This is fine
  push: Payload extends Array<infer Item> ? (item: Item) => void : never = (
    item: Payload extends Array<infer Item> ? Item : never
  ) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    const length = this.#internal.push(item);
    this.trigger(stateChangeType.childAdded, true);
    return length;
  };

  // @ts-ignore: This is fine
  get length(): Payload extends Array<any> ? number : never {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    // @ts-ignore: This is fine
    return this.#internal.length;
  }

  //#endregion

  //#region Input

  Control<
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorEnable extends boolean = false,
    ValidEnable extends boolean = false,
    InvalidsEnable extends boolean = false
  >(
    props: State.InputProps<
      Payload,
      MetaEnable,
      DirtyEnable,
      ErrorEnable,
      ValidEnable,
      InvalidsEnable
    >
  ): React.ReactNode {
    const value = this.useGet();
    const meta = this.useMeta({
      dirty: props.meta || !!props.dirty,
      error: props.meta || !!props.error,
      valid: props.meta || !!props.valid,
      invalids: props.meta || !!props.invalids,
    });

    const control = {
      value,
      onChange: this.set,
      // [TODO] Connect it to the validation?
      onBlur: () => {},
    };

    return props.render(control, meta as any);
  }

  input<Element extends HTMLElement>(): State.Registration<Element> {
    return {
      name: this.path.join(".") || ".",
      ref: this.ref,
    };
  }

  #element: HTMLElement | null = null;
  #elementUnwatch: State.Unwatch | undefined;

  ref<Element extends HTMLElement>(element: Element | null) {
    if (this.#element === element) return;

    if (this.#element)
      this.#element.removeEventListener("input", this.#onInput(this.#element));

    if (this.#elementUnwatch) {
      this.#elementUnwatch();
      this.#elementUnwatch = undefined;
    }

    if (!element) return;

    switch (true) {
      case element instanceof HTMLInputElement:
        // [TODO] Watch for changes and set the value
        element.value = String(this.get()) as string;
        this.#elementUnwatch = this.watch((value) => {
          element.value = String(value) as string;
        });
        break;
    }

    element.addEventListener("input", this.#onInput(element));
    this.#element = element;
  }

  //#endregion

  //#region Errors

  #error: State.Error | undefined;

  get error(): State.Error | undefined {
    return this.#error;
  }

  useError<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? State.Error | undefined : undefined {
    const [error, setError] = useState(
      enable === false ? undefined : this.error
    );

    useEffect(
      () => {
        if (enable === false) return;
        return this.watch(() => {
          const nextError = this.error;
          if (nextError !== error) setError(nextError);
        });
      },
      // [TODO] Consider using a ref for performance
      [enable, error, setError]
    );

    // @ts-ignore: This is fine
    return enable === false ? undefined : error;
  }

  setError(error?: string | State.Error | undefined) {
    const prevError = this.#error;
    error = typeof error === "string" ? { message: error } : error;

    if (
      error &&
      (!prevError ||
        prevError.type !== error.type ||
        prevError.message !== error.message)
    ) {
      this.#error = error;
      this.trigger(stateChangeType.invalid, true);
    } else if (!error && prevError) {
      this.#error = error;
      this.trigger(stateChangeType.valid, true);
    }
  }

  #cachedInvalids: Map<State<any>, State.Error> | undefined;

  get invalids(): State.Invalids {
    if (!this.#cachedInvalids) {
      const invalids = new Map();

      if (this.error) invalids.set(this, this.error);

      if (
        this.#internal instanceof InternalArrayState ||
        this.#internal instanceof InternalObjectState
      ) {
        // @ts-ignore: [TODO]
        this.forEach((item) => {
          // @ts-ignore: [TODO]
          item.invalids.forEach((error, state) => invalids.set(state, error));
        });
      }

      this.#cachedInvalids = invalids;
    }

    return this.#cachedInvalids;
  }

  useInvalids<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? State.Invalids : undefined {
    const emptyMap = useMemo(() => new Map(), []);
    const [invalids, setInvalids] = useState(
      enable === false ? emptyMap : this.invalids
    );

    useEffect(
      () => {
        if (enable === false) return;
        return this.watch(() => {
          const nextInvalids = this.invalids;
          const equal =
            nextInvalids === invalids ||
            (nextInvalids.size === invalids.size &&
              Array.from(nextInvalids).every(
                ([state, error]) => invalids.get(state) === error
              ));
          if (!equal) setInvalids(nextInvalids);
        });
      },
      // [TODO] Consider using a ref for performance
      [enable, invalids, setInvalids]
    );

    // @ts-ignore: This is fine
    return enable === false ? undefined : invalids;
  }

  get valid(): boolean {
    return !this.invalids.size;
  }

  useValid<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? boolean : undefined {
    const [valid, setValid] = useState(enable === false ? true : this.valid);

    useEffect(
      () => {
        if (enable === false) return;
        return this.watch(() => {
          const nextValid = this.valid;
          if (nextValid !== valid) setValid(nextValid);
        });
      },
      // [TODO] Consider using a ref for performance
      [enable, valid, setValid]
    );

    // @ts-ignore: This is fine
    return enable === false ? undefined : valid;
  }

  //#endregion
}

export namespace State {
  //#region Value

  export interface UseGetProps extends UseMetaProps {
    meta?: boolean | undefined;
  }

  export type UseGet<
    Payload,
    Props extends UseGetProps | undefined
  > = UseGetIncludeMeta<Props> extends true
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
        : Props["invalids"] extends true
        ? true
        : Props["valid"] extends true
        ? true
        : Props["dirty"] extends true
        ? true
        : false
      : false;

  //#endregion

  //#region Tree

  export interface Parent<Payload> {
    key: string;
    state: State<Payload>;
  }

  export type $<Payload> = Payload extends object
    ? $Object<Payload>
    : State<Payload>;

  export type $Object<Payload> = $Fn<Payload> & {
    [Key in keyof Payload]-?: State<
      EnsoUtils.StaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type $Fn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => State<
    EnsoUtils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  export type Try<Payload> = [Payload] extends [object]
    ? TryObject<Payload>
    : TryState<Payload>;

  export type TryObject<Payload> = TryFn<Payload> & {
    [Key in keyof Payload]-?: TryState<
      EnsoUtils.StaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type TryFn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => TryState<
    EnsoUtils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  export type TryState<Payload> =
    // Add null to the union
    | (null extends Payload ? null : never)
    // Add undefined to the union
    | (undefined extends Payload ? undefined : never)
    // Resolve state without null or undefined
    | State<Exclude<Payload, null | undefined>>;

  //#endregion

  //#region Use

  export type Use<Payload> = Payload extends Array<any>
    ? State.HookStateUseFn<Payload>
    : Payload extends object
    ? State.HookStateUse<Payload>
    : never;

  export interface HookStateUseFn<Payload> {
    (): State<Payload>;

    <Key extends keyof Payload>(key: Key): HookState<
      EnsoUtils.StaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  }

  export type HookStateUse<Payload> = HookStateUseFn<Payload> & {
    [Key in keyof Payload]-?: HookState<Payload[Key]>;
  };

  export interface HookState<Payload> {
    (): State<Payload>;

    get use(): HookStateUse<Payload>;
  }

  //#endregion

  //#region Watching

  export type WatchCallback<Payload> = (
    payload: Payload,
    event: StateChangeEvent
  ) => void;

  export type Unwatch = () => void;

  export interface UseMetaProps {
    invalids?: boolean | undefined;
    valid?: boolean | undefined;
    error?: boolean | undefined;
    dirty?: boolean | undefined;
  }

  export type Meta<Props extends UseMetaProps | undefined> =
    Props extends UseMetaProps
      ? {
          invalids: MetaEnable<Props["invalids"], Invalids>;
          valid: MetaEnable<Props["valid"], boolean>;
          error: MetaEnable<Props["error"], Error | undefined>;
          dirty: MetaEnable<Props["dirty"], boolean>;
        }
      : {
          invalids: Invalids;
          valid: boolean;
          error: Error | undefined;
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

  //#region Mapping

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        state: State<Payload>;
      }
    : never;

  export type Discriminated<
    Payload,
    Discriminator extends keyof Exclude<Payload, undefined>
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              state: State<Payload>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          state: State<Payload>;
        }
    : never;

  export interface Into<Payload, Computed> {
    from(
      callback: FromCallback<Payload, Computed>
    ): ComputedState<Payload, Computed>;
  }

  export type IntoCallback<Payload, Computed> = (payload: Payload) => Computed;

  export type FromCallback<Payload, ComputedPayload> = (
    payload: ComputedPayload
  ) => Payload;

  //#endregion

  //#region Collections

  export type ForEachFn<Payload> = Payload extends Array<any>
    ? ArrayForEach<Payload>
    : Payload extends object
    ? ObjectForEach<Payload>
    : (cb: never) => never;

  export type ObjectForEach<Payload extends object> = (
    callback: <Key extends keyof Payload>(
      item: State<Payload[Key]>,
      key: Key
    ) => void
  ) => void;

  export type ArrayForEach<Payload extends Array<any>> = (
    callback: (item: State<Payload[number]>, index: number) => void
  ) => void;

  export type MapFn<Payload> = Payload extends Array<any>
    ? ArrayMap<Payload>
    : Payload extends object
    ? ObjectMap<Payload>
    : (cb: never) => never;

  export type ObjectMap<Payload extends object> = <Return>(
    callback: <Key extends keyof Payload>(
      item: State<Payload[Key]>,
      key: Key
    ) => Return
  ) => Return[];

  export type ArrayMap<Payload extends Array<any>> = <Return>(
    callback: (item: State<Payload[number]>, index: number) => Return
  ) => Return[];

  //#endregion

  //#region Input

  export type InputProps<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorEnable extends boolean = false,
    ValidEnable extends boolean = false,
    InvalidsEnable extends boolean = false
  > = {
    render: InputRender<
      Payload,
      MetaEnable extends true
        ? undefined
        : MetaEnable extends false
        ? {
            invalids: false;
            valid: false;
            error: false;
            dirty: false;
          }
        : {
            invalids: InvalidsEnable;
            valid: ValidEnable;
            error: ErrorEnable;
            dirty: DirtyEnable;
          }
    >;
    meta?: MetaEnable;
    dirty?: DirtyEnable;
    error?: ErrorEnable;
    valid?: ValidEnable;
    invalids?: InvalidsEnable;
  };

  export type InputRender<
    Payload,
    InputMetaProps extends UseMetaProps | undefined
  > = (input: Input<Payload>, meta: Meta<InputMetaProps>) => React.ReactNode;

  export type Input<Payload> = {
    value: Payload;
    onChange: OnChange<Payload>;
    onBlur: OnBlur;
  };

  export type OnChange<Payload> = (value: Payload) => void;

  export type OnBlur = () => void;

  export interface Registration<Element extends HTMLElement> {
    name: string;
    ref: RegistrationRef<Element>;
  }

  // [TODO] Add possible types
  export type RegistrationRef<Element extends HTMLElement> =
    React.LegacyRef<Element>;

  //#endregion

  //#region Errors

  export interface Error {
    type?: string | undefined;
    message: string;
  }

  export type Invalids = Map<State<any>, State.Error>;

  //#endregion
}

//#endregion

//#region ComputedState

export class ComputedState<Payload, Computed> extends State<Computed> {
  #source: State<Payload>;

  constructor(payload: Computed, source: State<Payload>) {
    super(payload);
    this.#source = source;
  }

  get id(): string {
    return this.#source.id;
  }

  get key(): string | undefined {
    return this.#source.key;
  }

  get path(): string[] {
    return this.#source.path;
  }

  get invalids(): State.Invalids {
    return this.#source.invalids;
  }

  get parent(): State<any> | undefined {
    return this.#source.parent;
  }

  setError(error?: string | State.Error | undefined): void {
    this.#source.setError(error);
  }
}

//#endregion

//#region InternalState

export abstract class InternalState<Payload> {
  static detect(
    value: any
  ):
    | typeof InternalArrayState
    | typeof InternalObjectState
    | typeof InternalPrimitiveState {
    if (
      value !== undefinedValue &&
      value !== null &&
      typeof value === "object" &&
      value !== undefinedValue
    )
      return Array.isArray(value) ? InternalArrayState : InternalObjectState;
    return InternalPrimitiveState;
  }

  #external: State<Payload>;

  constructor(state: State<Payload>, _value: Payload | UndefinedValue) {
    this.#external = state;
  }

  abstract unwatch(): void;

  abstract set(value: Payload | UndefinedValue): StateChange | 0;

  abstract get(): Payload;

  abstract $(): State.$<Payload>;

  abstract try(): State.Try<Payload>;

  childUpdate(type: StateChange, _key: string): StateChange {
    return type;
  }

  abstract updated(event: StateChangeEvent): boolean;

  abstract dirty(value: Payload): boolean;

  protected get external() {
    return this.#external;
  }
}

//#endregion

//#region InternalPrimitiveState

export class InternalPrimitiveState<Payload> extends InternalState<Payload> {
  #value: Payload;

  constructor(state: State<Payload>, value: Payload) {
    super(state, value);
    this.#value = value;
  }

  set(value: Payload): StateChange | 0 {
    let change = 0;

    if (this.#value === undefinedValue && value !== undefinedValue)
      change |= stateChangeType.type | stateChangeType.created;
    else if (this.#value !== undefinedValue && value === undefinedValue)
      change |= stateChangeType.type | stateChangeType.removed;
    else if (typeof this.#value !== typeof value)
      change |= stateChangeType.type;
    else if (this.#value !== value) change |= stateChangeType.value;

    if (this.#value !== value) this.#value = value;

    return change;
  }

  get(): Payload {
    return this.#value === undefinedValue
      ? (undefined as Payload)
      : this.#value;
  }

  $(): State.$<Payload> {
    return this.external as State.$<Payload>;
  }

  try(): State.Try<Payload> {
    const value = this.get();
    if (value === undefined || value === null)
      return value as State.Try<Payload>;
    return this.external as State.Try<Payload>;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & stateChangeType.created ||
      event.detail & stateChangeType.removed ||
      event.detail & stateChangeType.type
    );
  }

  unwatch() {}

  dirty(initial: Payload): boolean {
    return initial !== this.#value;
  }
}

//#endregion

//#region InternalObjectState

export class InternalObjectState<
  Payload extends object
> extends InternalState<Payload> {
  #children: Map<string, State<any>> = new Map();
  #undefined;

  constructor(external: State<Payload>, value: Payload) {
    super(external, value);
    // @ts-ignore: [TODO]
    this.#undefined = new UndefinedStateRegistry(external);
  }

  set(newValue: Payload): StateChange | 0 {
    let change = 0;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[clearSymbol]();
        // @ts-ignore: This is fine
        this.#undefined.register(key, child);
        change |= stateChangeType.childRemoved;
      }
    });

    for (const [key, value] of Object.entries(newValue)) {
      const child = this.#children.get(key);
      if (child) {
        const childChange = child.set(value, false);
        if (childChange) change |= stateChangeType.child;
      } else {
        const undefinedState = this.#undefined.claim(key);
        if (undefinedState) undefinedState[createSymbol](value);

        this.#children.set(
          key,
          // @ts-ignore: [TODO]
          undefinedState || new State(value, { key, state: this.external })
        );
        change |= stateChangeType.childAdded;
      }
    }

    return change;
  }

  get(): Payload {
    return Object.fromEntries(
      Array.from(this.#children.entries()).map(([k, v]) => [k, v.get()])
    ) as Payload;
  }

  $(): State.$<Payload> {
    return this.#$;
  }

  #$ = new Proxy((() => {}) as unknown as State.$<Payload>, {
    apply: (_, __, [key]: [string]) => this.#$field(key),
    get: (_, key: string) => this.#$field(key),
  });

  #$field(key: string) {
    const field = this.#children.get(key);
    if (field) return field;

    return this.#undefined.ensure(key);
  }

  try(): State.Try<Payload> {
    return this.#try;
  }

  #try = new Proxy((() => {}) as unknown as State.Try<Payload>, {
    apply: (_, __, [key]: [string]) => this.#tryField(key),
    get: (_, key: string) => this.#tryField(key),
  });

  #tryField(key: string) {
    const field = this.#children.get(key);
    if (field) {
      const value = field.get();
      if (value === undefined || value === null) return value;
    }
    return field;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & stateChangeType.created ||
      event.detail & stateChangeType.removed ||
      event.detail & stateChangeType.type ||
      event.detail & stateChangeType.childRemoved ||
      event.detail & stateChangeType.childAdded
    );
  }

  childUpdate(childChange: StateChange, key: string): StateChange {
    let change = stateChangeType.child;

    // Handle when child goes from undefined to defined
    if (childChange & stateChangeType.created) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child state when updating");
      // @ts-ignore: [TODO]
      this.#children.set(key, child);
      change |= stateChangeType.childAdded;
    }

    if (childChange & stateChangeType.removed) {
      const child = this.#children.get(key);
      if (!child)
        throw new Error("Failed to find the child state when updating");
      this.#children.delete(key);
      child.unwatch();
      change |= stateChangeType.childRemoved;
    }

    return change;
  }

  unwatch() {
    this.#children.forEach((child) => child.unwatch());
    this.#children.clear();
  }

  dirty(initial: Payload): boolean {
    if (!initial || typeof initial !== "object" || Array.isArray(initial))
      return true;

    const entries = Object.entries(initial);
    if (entries.length !== this.#children.size) return true;

    for (const [key, value] of entries) {
      const state = this.#children.get(key);

      if (!state || state.initial !== value || state.dirty) return true;
    }

    return false;
  }

  //#region Array methods

  forEach(
    callback: <Key extends keyof Payload>(
      item: State<Payload[Key]>,
      index: Key
    ) => void
  ) {
    this.#children.forEach((state, key) =>
      // @ts-ignore: [TODO]
      callback(state, key as keyof Payload)
    );
  }

  map<Return>(
    callback: <Key extends keyof Payload>(
      item: State<Payload[Key]>,
      index: Key
    ) => Return
  ): Return[] {
    // @ts-ignore: [TODO]
    const result = [];
    this.#children.forEach((state, key) =>
      // @ts-ignore: [TODO]
      result.push(callback(state, key as keyof Payload))
    );
    // @ts-ignore: [TODO]
    return result;
  }

  //#endregion
}

//#endregion

//#region InternalArrayState

export class InternalArrayState<
  Payload extends Array<any>
> extends InternalState<Payload> {
  #children: State<any>[] = [];
  #undefined;

  constructor(external: State<Payload>, value: Payload) {
    super(external, value);

    // @ts-ignore: This is fine
    this.#undefined = new UndefinedStateRegistry(external);
  }

  get(): Payload {
    return this.#children.map((child) => child.get()) as Payload;
  }

  set(newValue: Payload): StateChange | 0 {
    let change = 0;

    this.#children.forEach((item, index) => {
      if (!(index in newValue)) {
        delete this.#children[index];
        item[clearSymbol]();
        // @ts-ignore: This is fine
        this.#undefined.register(index.toString(), item);
        change |= stateChangeType.childRemoved;
      }
    });

    // @ts-ignore: [TODO]
    this.#children = newValue.map((value, index) => {
      const child = this.#children[index];
      if (child) {
        const childChange = child.set(value, false);
        if (childChange) change |= stateChangeType.child;
        return child;
      } else {
        const undefinedState = this.#undefined.claim(index.toString());
        if (undefinedState) undefinedState[createSymbol](value);

        const newChild =
          undefinedState ||
          new State(value, {
            key: String(index),
            // @ts-ignore: This is fine
            state: this.external,
          });
        change |= stateChangeType.childAdded;
        return newChild;
      }
    });

    return change;
  }

  $(): State.$<Payload> {
    return this.#$;
  }

  #$ = new Proxy((() => {}) as unknown as State.$<Payload>, {
    apply: (_, __, [index]: [number]) => this.#item(index),
    get: (_, index: string) => this.#item(Number(index)),
  });

  #item(index: number) {
    const item = this.#children[index];
    if (item) return item;

    const indexStr = index.toString();
    return this.#undefined.ensure(indexStr);
  }

  try(): State.Try<Payload> {
    return this.#try;
  }

  #try = new Proxy((() => {}) as unknown as State.Try<Payload>, {
    apply: (_, __, [index]: [number]) => this.#tryItem(index),
    // @ts-ignore: [TODO]
    get: (_, index: number) => this.#tryItem(index),
  });

  #tryItem(index: number) {
    const field = this.#children[index];
    if (field) {
      const value = field.get();
      if (value === undefined || value === null) return value;
    }
    return field;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & stateChangeType.created ||
      event.detail & stateChangeType.removed ||
      event.detail & stateChangeType.type ||
      event.detail & stateChangeType.childRemoved ||
      event.detail & stateChangeType.childAdded ||
      event.detail & stateChangeType.childrenReordered
    );
  }

  childUpdate(childChange: StateChange, key: string): StateChange {
    let change = stateChangeType.child;

    // Handle when child goes from undefined to defined
    if (childChange & stateChangeType.created) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child state when updating");
      // @ts-ignore: [TODO]
      this.#children[Number(key)] = child;
      change |= stateChangeType.childAdded;
    }

    // Handle when child goes from defined to undefined
    if (childChange & stateChangeType.removed) {
      const child = this.#children[Number(key)];
      if (!child)
        throw new Error("Failed to find the child state when updating");
      delete this.#children[Number(key)];
      child.unwatch();
      change |= stateChangeType.childRemoved;
    }

    return change;
  }

  unwatch() {
    this.#children.forEach((child) => child.unwatch());
    this.#children.length = 0;
  }

  dirty(initial: Payload): boolean {
    if (!initial || typeof initial !== "object" || !Array.isArray(initial))
      return true;

    if (initial.length !== this.#children.length) return true;

    for (const index in initial) {
      const value = initial[index];
      const state = this.#children[index];

      if (!state || state.initial !== value || state.dirty) return true;
    }

    return false;
  }

  //#region Array methods

  get length(): number {
    return this.#children.length;
  }

  forEach(callback: (item: Payload[number], index: number) => void) {
    this.#children.forEach(callback);
  }

  map<Return>(
    callback: (item: Payload[number], index: number) => Return
  ): Return[] {
    return this.#children.map(callback);
  }

  push(item: Payload[number]) {
    const length = this.#children.length;
    // @ts-ignore: [TODO]
    this.#children[length] = new State(item, {
      key: String(length),
      // @ts-ignore: This is fine
      state: this.external,
    });
    return length + 1;
  }

  //#endregion
}

//#endregion

//#region UndefinedStateRegistry

export class UndefinedStateRegistry {
  #external;
  #refsMap = new Map<string, WeakRef<State<any>>>();
  #registry;

  constructor(external: State<any>) {
    this.#external = external;
    this.#registry = new FinalizationRegistry<string>((key) =>
      this.#refsMap.delete(key)
    );
  }

  register(key: string, state: State<UndefinedValue>) {
    const stateRef = new WeakRef(state);
    // @ts-ignore: [TODO]
    this.#refsMap.set(key, stateRef);
    this.#registry.register(stateRef, key);
  }

  claim(key: string): State<undefined> | undefined {
    // Look up if the undefined state exists
    const ref = this.#refsMap.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregisted the state and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#refsMap.delete(key);
    // @ts-ignore: This is fine
    return registered;
  }

  ensure(key: string): State<UndefinedValue> {
    // Try to look up registed undefined item
    const registered = this.#refsMap.get(key)?.deref();
    // @ts-ignore: This is fine
    if (registered) return registered;

    // Or create and register a new one
    const state = new State(undefinedValue, {
      key,
      state: this.#external,
    });
    this.register(key, state);
    return state;
  }
}

//#endregion

//# StateChange

export type StateChange = number;

export const stateChangeType = {
  /** Nothing has change, the initial value. */
  nothing: 0,
  /** The state has been inserted into an object or an array. */
  created: 0b00000001, // 1
  /** The state has been removed from an object or an array. */
  removed: 0b00000010, // 2
  /** The primitive value of the state has change. */
  value: 0b00000100, // 4
  /** The type of the state has change. */
  type: 0b00001000, // 8
  /** An object state or an array item has change. */
  child: 0b00010000, // 16
  /** An object state or an array item has been removed. */
  childRemoved: 0b00100000, // 32
  /** An object state or an array item has been added. */
  childAdded: 0b01000000, // 64
  /** The order of array items has change. */
  childrenReordered: 0b100000000, // 128
  /** The state become invalid. */
  invalid: 0b1000000000, // 256
  /** The state become valid. */
  valid: 0b10000000000, // 512
};

export class StateChangeEvent extends CustomEvent<StateChange> {
  constructor(type: StateChange) {
    super("change", { detail: type });
  }
}

//#endregion

//#region undefinedValue

export const undefinedValue = Symbol();

export type UndefinedValue = typeof undefinedValue;

//#endregion

//#region PoC

export function useUndefinedStringField(
  state: State<string | undefined>
): State<string> {
  return state
    .useInto((value) => value ?? "")
    .from((value) => value || undefined);
}

//#endregion
