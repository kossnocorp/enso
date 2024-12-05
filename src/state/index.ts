import { nanoid } from "nanoid";
import { EnsoUtils } from "../utils.ts";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  narrowMixin,
  type NarrowMixin,
  useNarrowMixin,
} from "../mixins/narrow.js";

//#region undefinedValue

export const undefinedValue = Symbol();

export type UndefinedValue = typeof undefinedValue;

//#endregion

//#region State

const createSymbol = Symbol();
const clearSymbol = Symbol();
const childTriggerSymbol = Symbol();

export const statePrivate = Symbol();

export class State<Payload> {
  static use<Payload>(value: Payload): State<Payload> {
    const state = useMemo(() => new State(value), []);
    return state;
  }

  #id = nanoid();
  #target = new EventTarget();
  #parent?: StateParent<any> | undefined;
  #subs = new Set<(event: Event) => void>();
  #use;

  value: Payload;

  constructor(value: Payload, parent?: StateParent<any>) {
    this.value = value;
    this.#set(value);
    this.#parent = parent;

    this.#use = new Proxy((() => {}) as unknown as State.Use<Payload>, {
      // @ts-ignore: This is okay
      get: (_, key: string) => this.$[key].use,

      apply: () => {
        const [_, setState] = useState(0);
        useEffect(
          () =>
            this.watch((payload, event) => {
              if (this.#internal.updated(event)) setState(Date.now());
            }),
          []
        );
        return this;
      },
    });
  }

  free() {
    this.#subs.forEach((sub) =>
      this.#target.removeEventListener("change", sub)
    );
    this.#subs.clear();
    this.#internal.free();
  }

  get id(): string {
    return this.#id;
  }

  get $(): State.$<Payload> {
    return this.#internal.$();
  }

  [statePrivate]: {
    internal: InternalState<Payload>;
  } = {
    internal: new InternalPrimitiveState(this, undefinedValue),
  };

  get #internal() {
    return this[statePrivate].internal;
  }

  get(): Payload {
    return this.#internal.get();
  }

  // [TODO] Get rid of the type argument and expose directional set via symbol.
  set(
    value: Payload | UndefinedValue,
    type = StateTriggerFlow.Bidirectional
  ): StateChange | 0 {
    const changed = this.#set(value);
    if (changed) this.#trigger(changed, type);
    return changed;
  }

  #set(value: Payload | UndefinedValue): StateChange | 0 {
    const ValueConstructor = InternalState.detect(value);

    // The state is already of the same type
    if (this.#internal instanceof ValueConstructor)
      return this.#internal.set(value);

    // The state is of a different type
    this.#internal.free();

    let changed = StateChangeType.Type;
    // The state is being removed
    if (value === undefinedValue) changed |= StateChangeType.Removed;

    // @ts-ignore: This is fine
    this[statePrivate].internal = new ValueConstructor(this, value);
    this.#internal.set(value);
    return changed;
  }

  [createSymbol](value: Payload): StateChange | 0 {
    const changed = this.#internal.set(value) | StateChangeType.Created;
    this.#trigger(changed, StateTriggerFlow.Directional);
    return changed;
  }

  [clearSymbol]() {
    this.#internal.set(undefined as Payload);
  }

  get use(): State.Use<Payload> {
    return this.#use;
  }

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

  useWatch(): Payload {
    const [payload, setPayload] = useState(this.get());
    useEffect(
      () =>
        this.watch((newPayload, event) => {
          // [TODO] Check event changes?
          setPayload(newPayload);
        }),
      []
    );
    return payload;
  }

  // [TODO] Hide from non-object states?
  decompose(): State.Decomposed<Payload> {
    // @ts-ignore: TypeScript is picky about the type here
    return {
      value: this.get(),
      state: this,
    } as State.Decomposed<Payload>;
  }

  useDecompose(
    callback: State.DecomposeCallback<Payload>
  ): State.Decomposed<Payload> {
    const [_, setState] = useState(0);
    const initialDecomposed = useMemo(() => this.decompose(), []);
    const decomposedRef = useRef(initialDecomposed);
    const prevPayload = useRef(decomposedRef.current.value);
    useEffect(
      () =>
        this.watch((newPayload, _event) => {
          decomposedRef.current = this.decompose();
          if (callback(newPayload, prevPayload.current)) setState(Date.now());
          prevPayload.current = newPayload;
        }),
      []
    );
    return decomposedRef.current;
  }

  narrow: <Narrowed extends Payload>(
    callback: NarrowMixin.Callback<Payload, Narrowed>
  ) => State<Narrowed> | undefined = narrowMixin();

  useNarrow: <Narrowed extends Payload>(
    callback: NarrowMixin.Callback<Payload, Narrowed>
  ) => State<Narrowed> | undefined = useNarrowMixin();

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): State.Discriminated<Payload, Discriminator> {
    return {
      // @ts-ignore: TypeScript is picky about the type here
      discriminator: this.$[discriminator]?.get(),
      state: this as State<Payload>,
    } as State.Discriminated<Payload, Discriminator>;
  }

  useDiscriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): State.Discriminated<Payload, Discriminator> {
    const [_, setState] = useState(0);
    const initialDiscriminated = useMemo(
      () => this.discriminate(discriminator),
      []
    );
    const discriminatedRef = useRef(initialDiscriminated);
    useEffect(
      () =>
        this.watch((_payload, _event) => {
          const newDiscriminated = this.discriminate(discriminator);
          if (
            newDiscriminated.discriminator !==
            discriminatedRef.current.discriminator
          )
            setState(Date.now());
          discriminatedRef.current = newDiscriminated;
        }),
      []
    );
    return discriminatedRef.current;
  }

  into<Computed>(
    intoCallback: State.IntoCallback<Payload, Computed>
  ): State.Into<Payload, Computed> {
    const computed = new State(intoCallback(this.get()));
    // [TODO] This creates a leak, so rather than holding on to the computed
    // state, store it as a weak ref and unsubscribe when it's no longer needed.
    this.watch((payload) => computed.set(intoCallback(payload)));

    return {
      from: (fromCallback) => {
        computed.watch((payload) => this.set(fromCallback(payload)));
        return computed;
      },
    };
  }

  useInto<Computed>(
    intoCallback: State.IntoCallback<Payload, Computed>
  ): State.Into<Payload, Computed> {
    const computed = useMemo(() => new State(intoCallback(this.get())), []);

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
  }

  // @ts-ignore: This is fine
  map: Payload extends Array<infer Item>
    ? <Return>(
        callback: (item: State<Item>, index: number) => Return
      ) => Return[]
    : never = (callback: (item: any, index: number) => any) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    return this.#internal.map(callback);
  };

  // @ts-ignore: This is fine
  push: Payload extends Array<infer Item> ? (item: Item) => void : never = (
    item: Payload extends Array<infer Item> ? Item : never
  ) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    this.#internal.push(item);
    this.#trigger(StateChangeType.ChildAdded, StateTriggerFlow.Bidirectional);
  };

  remove() {
    this.set(undefinedValue, StateTriggerFlow.Bidirectional);
  }

  #trigger(changed: StateChange, type: StateTriggerFlow) {
    this.#target.dispatchEvent(new StateChangeEvent(changed));
    // If the updates should flow upstream to parents too
    if (type === StateTriggerFlow.Bidirectional)
      this.#parent?.state[childTriggerSymbol](changed, this.#parent.key);
  }

  [childTriggerSymbol](type: StateChange, key: string) {
    const updated =
      this.#internal.childUpdate(type, key) | StateChangeType.Child;
    this.#trigger(updated, StateTriggerFlow.Directional);
  }
}

export namespace State {
  export type $<Payload> = Payload extends object
    ? Object$<Payload>
    : State<Payload>;

  export type Object$<Payload> = $Fn<Payload> & {
    [Key in keyof Payload]-?: State<Payload[Key]>;
  };

  export type $Fn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => State<
    EnsoUtils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  export type Use<Payload> = Payload extends Array<any>
    ? State.HookStateUseFn<Payload>
    : Payload extends object
    ? State.HookStateUse<Payload>
    : never;

  export interface HookState<Payload> {
    (): State<Payload>;

    get use(): HookStateUse<Payload>;

    watch(): Payload;

    discriminated<Discriminator extends keyof Exclude<Payload, undefined>>(
      discriminator: Discriminator
    ): State.Discriminated<Payload, Discriminator>;

    narrow<Return extends State<any> | false | undefined | "" | null | 0>(
      callback: (decomposed: State.Decomposed<Payload>) => Return
    ): Return;
  }

  export type HookStateUse<Payload> = HookStateUseFn<Payload> & {
    [Key in keyof Payload]-?: HookState<Payload[Key]>;
  };

  export interface HookStateUseFn<Payload> {
    (): State<Payload>;

    <Key extends keyof Payload>(key: Key): HookState<
      EnsoUtils.StaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  }

  export type WatchCallback<Payload> = (
    payload: Payload,
    event: StateChangeEvent
  ) => void;

  export type Unwatch = () => void;

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

  //#region Decompose

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        state: State<Payload>;
      }
    : never;

  export type DecomposeCallback<Payload> = (
    newPayload: Payload,
    prevPayload: Payload
  ) => boolean;

  //#endregion

  export type IntoCallback<Payload, Computed> = (payload: Payload) => Computed;

  export interface Into<Payload, Computed> {
    from(callback: FromCallback<Payload, Computed>): State<Computed>;
  }

  export type FromCallback<Payload, ComputedPayload> = (
    payload: ComputedPayload
  ) => Payload;
}

//#endregion

//#region StateParent

export interface StateParent<Payload> {
  key: string;
  state: State<Payload>;
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

  abstract free(): void;

  abstract set(value: Payload | UndefinedValue): StateChange | 0;

  abstract get(): Payload;

  abstract $(): State.$<Payload>;

  childUpdate(type: StateChangeType, _key: string): StateChange {
    return type;
  }

  abstract updated(event: StateChangeEvent): boolean;

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
    let changed = 0;

    if (this.#value === undefinedValue && value !== undefinedValue)
      changed |= StateChangeType.Type | StateChangeType.Created;
    else if (this.#value !== undefinedValue && value === undefinedValue)
      changed |= StateChangeType.Type | StateChangeType.Removed;
    else if (typeof this.#value !== typeof value)
      changed |= StateChangeType.Type;
    else if (this.#value !== value) changed |= StateChangeType.Value;

    if (this.#value !== value) this.#value = value;

    return changed;
  }

  get(): Payload {
    return this.#value === undefinedValue
      ? (undefined as Payload)
      : this.#value;
  }

  $(): State.$<Payload> {
    return this.external as State.$<Payload>;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & StateChangeType.Created ||
      event.detail & StateChangeType.Removed ||
      event.detail & StateChangeType.Type
    );
  }

  free() {}
}

//#endregion

//#region InternalObjectState

export class InternalObjectState<
  Payload extends object
> extends InternalState<Payload> {
  #children: Map<string, State<any>> = new Map();
  #proxy;
  #undefined;

  constructor(external: State<Payload>, value: Payload) {
    super(external, value);

    this.#proxy = new Proxy((() => {}) as unknown as State.$<Payload>, {
      apply: (_, __, [key]: [string]) => this.#field(key),
      get: (_, key: string) => this.#field(key),
    });

    this.#undefined = new UndefinedStateRegistry(external);
  }

  set(newValue: Payload): StateChange | 0 {
    let changed = 0;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[clearSymbol]();
        this.#undefined.register(key, child);
        changed |= StateChangeType.ChildRemoved;
      }
    });

    for (const [key, value] of Object.entries(newValue)) {
      const child = this.#children.get(key);
      if (child) {
        const childChanged = child.set(value, StateTriggerFlow.Directional);
        if (childChanged) changed |= StateChangeType.Child;
      } else {
        const undefinedState = this.#undefined.claim(key);
        if (undefinedState) undefinedState[createSymbol](value);

        this.#children.set(
          key,
          undefinedState || new State(value, { key, state: this.external })
        );
        changed |= StateChangeType.ChildAdded;
      }
    }

    return changed;
  }

  get(): Payload {
    return Object.fromEntries(
      Array.from(this.#children.entries()).map(([k, v]) => [k, v.get()])
    ) as Payload;
  }

  $(): State.$<Payload> {
    return this.#proxy;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & StateChangeType.Created ||
      event.detail & StateChangeType.Removed ||
      event.detail & StateChangeType.Type ||
      event.detail & StateChangeType.ChildRemoved ||
      event.detail & StateChangeType.ChildAdded
    );
  }

  childUpdate(childChanged: StateChange, key: string): StateChange {
    let changed = StateChangeType.Child;

    // Handle when child goes from undefined to defined
    if (childChanged & StateChangeType.Created) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child state when updating");
      this.#children.set(key, child);
      changed |= StateChangeType.ChildAdded;
    }

    if (childChanged & StateChangeType.Removed) {
      const child = this.#children.get(key);
      if (!child)
        throw new Error("Failed to find the child state when updating");
      this.#children.delete(key);
      child.free();
      changed |= StateChangeType.ChildRemoved;
    }

    return changed;
  }

  free() {
    this.#children.forEach((child) => child.free());
    this.#children.clear();
  }

  #field(key: string) {
    const field = this.#children.get(key);
    if (field) return field;

    return this.#undefined.ensure(key);
  }
}

//#endregion

//#region InternalArrayState

export class InternalArrayState<
  Payload extends Array<any>
> extends InternalState<Payload> {
  #children: State<any>[] = [];
  #proxy;
  #undefined;

  constructor(external: State<Payload>, value: Payload) {
    super(external, value);

    this.#proxy = new Proxy((() => {}) as unknown as State.$<Payload>, {
      apply: (_, __, [index]: [number]) => this.#item(index),
      get: (_, index: string) => this.#item(Number(index)),
    });

    this.#undefined = new UndefinedStateRegistry(external);
  }

  get(): Payload {
    return this.#children.map((child) => child.get()) as Payload;
  }

  set(newValue: Payload): StateChange | 0 {
    let changed = 0;

    this.#children.forEach((item, index) => {
      if (!(index in newValue)) {
        delete this.#children[index];
        item[clearSymbol]();
        this.#undefined.register(index.toString(), item);
        changed |= StateChangeType.ChildRemoved;
      }
    });

    this.#children = newValue.map((value, index) => {
      const child = this.#children[index];
      if (child) {
        const childChanged = child.set(value, StateTriggerFlow.Directional);
        if (childChanged) changed |= StateChangeType.Child;
        return child;
      } else {
        const undefinedState = this.#undefined.claim(index.toString());
        if (undefinedState) undefinedState[createSymbol](value);

        const newChild =
          undefinedState ||
          new State(value, {
            key: String(index),
            state: this.external,
          });
        changed |= StateChangeType.ChildAdded;
        return newChild;
      }
    });

    return changed;
  }

  push(item: Payload[number]) {
    const index = this.#children.length;
    this.#children[index] = new State(item, {
      key: String(index),
      state: this.external,
    });
  }

  map<Return>(
    callback: (item: Payload[number], index: number) => Return
  ): Return[] {
    return this.#children.map(callback);
  }

  $(): State.$<Payload> {
    return this.#proxy;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & StateChangeType.Created ||
      event.detail & StateChangeType.Removed ||
      event.detail & StateChangeType.Type ||
      event.detail & StateChangeType.ChildRemoved ||
      event.detail & StateChangeType.ChildAdded ||
      event.detail & StateChangeType.ChildrenReordered
    );
  }

  childUpdate(childChanged: StateChange, key: string): StateChange {
    let changed = StateChangeType.Child;

    // Handle when child goes from undefined to defined
    if (childChanged & StateChangeType.Created) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child state when updating");
      this.#children[Number(key)] = child;
      changed |= StateChangeType.ChildAdded;
    }

    // Handle when child goes from defined to undefined
    if (childChanged & StateChangeType.Removed) {
      const child = this.#children[Number(key)];
      if (!child)
        throw new Error("Failed to find the child state when updating");
      delete this.#children[Number(key)];
      child.free();
      changed |= StateChangeType.ChildRemoved;
    }

    return changed;
  }

  free() {
    this.#children.forEach((child) => child.free());
    this.#children.length = 0;
  }

  #item(index: number) {
    const item = this.#children[index];
    if (item) return item;

    const indexStr = index.toString();
    return this.#undefined.ensure(indexStr);
  }
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
    return registered;
  }

  ensure(key: string): State<UndefinedValue> {
    // Try to look up registed undefined item
    const registered = this.#refsMap.get(key)?.deref();
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

export enum StateChangeType {
  /** Nothing has changed, the initial value. */
  Nothing = 0, // 0
  /** The state has been inserted into an object or an array. */
  Created = 0b00000001, // 1
  /** The state has been removed from an object or an array. */
  Removed = 0b00000010, // 2
  /** The primitive value of the state has changed. */
  Value = 0b00000100, // 4
  /** The type of the state has changed. */
  Type = 0b00001000, // 8
  /** An object field or an array item has changed. */
  Child = 0b00010000, // 16
  /** An object field or an array item has been removed. */
  ChildRemoved = 0b00100000, // 32
  /** An object field or an array item has been added. */
  ChildAdded = 0b01000000, // 64
  /** The order of array items has changed. */
  ChildrenReordered = 0b100000000, // 128
}

export class StateChangeEvent extends CustomEvent<StateChange> {
  constructor(type: StateChange) {
    super("change", { detail: type });
  }
}

//#endregion

//#region

export enum StateTriggerFlow {
  /** Parent updates its children, so no need to go upstream. */
  Directional,
  /** Child updates its parents. */
  Bidirectional,
}

//#endregion
