import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import { useRerender } from "../hooks/rerender.ts";
import {
  decomposeMixin,
  type DecomposeMixin,
  useDecomposeMixin,
} from "../mixins/decompose.js";
import {
  discriminateMixin,
  type DiscriminateMixin,
  useDiscriminateMixin,
} from "../mixins/discriminate.js";
import { intoMixin, IntoMixin, useIntoMixin } from "../mixins/into.js";
import {
  narrowMixin,
  type NarrowMixin,
  useNarrowMixin,
} from "../mixins/narrow.js";
import { type EnsoUtils } from "../utils.ts";

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
  #parent?: State.Parent<any> | undefined;
  #use: State.Use<Payload>;

  value: Payload;

  constructor(value: Payload, parent?: State.Parent<any>) {
    this.value = value;
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

  get internal(): InternalState<Payload> {
    return this.#internal;
  }

  //#endregion

  get(): Payload {
    return this.#internal.get();
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
      return this.#internal.set(value);

    // The state is of a different type
    this.#internal.unwatch();

    let change = stateChangeType.type;
    // The state is being removed
    if (value === undefinedValue) change |= stateChangeType.removed;

    // @ts-ignore: This is fine
    this[statePrivate].internal = new ValueConstructor(this, value);
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

  [statePrivate]: {
    internal: InternalState<Payload>;
  } = {
    // @ts-ignore: This is fine
    internal: new InternalPrimitiveState(this, undefinedValue),
  };

  get #internal() {
    return this[statePrivate].internal;
  }

  get $(): State.$<Payload> {
    return this.#internal.$();
  }

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

  useWatch(): Payload {
    const [payload, setPayload] = useState(this.get());
    useEffect(() => this.watch(setPayload), []);
    return payload;
  }

  unwatch() {
    this.#subs.forEach((sub) =>
      this.#target.removeEventListener("change", sub)
    );
    this.#subs.clear();
    this.#internal.unwatch();
  }

  trigger(change: StateChange, notifyParents: boolean = false) {
    this.#target.dispatchEvent(new StateChangeEvent(change));
    // If the updates should flow upstream to parents too
    if (notifyParents)
      this.#parent?.state[childTriggerSymbol](change, this.#parent.key);
  }

  [childTriggerSymbol](type: StateChange, key: string) {
    const updated =
      this.#internal.childUpdate(type, key) | stateChangeType.child;
    this.trigger(updated, false);
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
    intoCallback: IntoMixin.IntoCallback<Payload, Computed>
  ) => State.Into<Payload, Computed> = intoMixin(State);

  useInto: <Computed>(
    intoCallback: IntoMixin.IntoCallback<Payload, Computed>
  ) => State.Into<Payload, Computed> = useIntoMixin(State);

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
}

export namespace State {
  //#region Traverse

  export interface Parent<Payload> {
    key: string;
    state: State<Payload>;
  }

  export type $<Payload> = Payload extends object
    ? $Object<Payload>
    : State<Payload>;

  export type $Object<Payload> = $Fn<Payload> & {
    [Key in keyof Payload]-?: State<Payload[Key]>;
  };

  export type $Fn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => State<
    EnsoUtils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

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
    from(callback: IntoMixin.FromCallback<Payload, Computed>): State<Computed>;
  }

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

  childUpdate(type: StateChange, _key: string): StateChange {
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

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & stateChangeType.created ||
      event.detail & stateChangeType.removed ||
      event.detail & stateChangeType.type
    );
  }

  unwatch() {}
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
    return this.#proxy;
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

  #field(key: string) {
    const field = this.#children.get(key);
    if (field) return field;

    return this.#undefined.ensure(key);
  }

  //#region Array methods

  forEach(
    callback: <Key extends keyof Payload>(
      item: State<Payload[Key]>,
      index: Key
    ) => void
  ) {
    this.#children.forEach((state, key) =>
      callback(state, key as keyof Payload)
    );
  }

  map<Return>(
    callback: <Key extends keyof Payload>(
      item: State<Payload[Key]>,
      index: Key
    ) => Return
  ): Return[] {
    const result = [];
    this.#children.forEach((state, key) =>
      result.push(callback(state, key as keyof Payload))
    );
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
  #proxy;
  #undefined;

  constructor(external: State<Payload>, value: Payload) {
    super(external, value);

    this.#proxy = new Proxy((() => {}) as unknown as State.$<Payload>, {
      apply: (_, __, [index]: [number]) => this.#item(index),
      get: (_, index: string) => this.#item(Number(index)),
    });

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
    return this.#proxy;
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

  #item(index: number) {
    const item = this.#children[index];
    if (item) return item;

    const indexStr = index.toString();
    return this.#undefined.ensure(indexStr);
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
  /** An object field or an array item has change. */
  child: 0b00010000, // 16
  /** An object field or an array item has been removed. */
  childRemoved: 0b00100000, // 32
  /** An object field or an array item has been added. */
  childAdded: 0b01000000, // 64
  /** The order of array items has change. */
  childrenReordered: 0b100000000, // 128
};

export class StateChangeEvent extends CustomEvent<StateChange> {
  constructor(type: StateChange) {
    super("change", { detail: type });
  }
}

//#endregion
