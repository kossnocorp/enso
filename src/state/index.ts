import { nanoid } from "nanoid";
import { EnsoUtils } from "../utils.ts";
import { useEffect, useMemo, useState } from "react";

//#region State

const createSymbol = Symbol();
const clearSymbol = Symbol();
const childTriggerSymbol = Symbol();

export class State<Payload> {
  static use<Payload>(value: Payload): State<Payload> {
    const state = useMemo(() => new State(value), []);
    return state;
  }

  #id = nanoid();
  #target = new EventTarget();
  #internal!: InternalState<Payload>;
  #parent?: State<any> | undefined;
  #subs = new Set<(event: Event) => void>();

  constructor(value: Payload, parent?: State<any>) {
    this.#set(value);
    this.#parent = parent;
  }

  get(): Payload {
    return this.#internal.get();
  }

  // [TODO] Get rid of the type argument and expose directional set via symbol.
  set(value: Payload, type = StateTriggerFlow.Bidirectional): StateChange | 0 {
    const changed = this.#internal.set(value);
    if (changed) this.#trigger(changed, type);
    return changed;
  }

  [createSymbol](value: Payload): StateChange | 0 {
    const changed = this.#internal.set(value) | StateChangeType.Created;
    this.#trigger(changed, StateTriggerFlow.Directional);
    return changed;
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

  free() {
    this.#subs.forEach((sub) =>
      this.#target.removeEventListener("change", sub)
    );
    this.#subs.clear();
    this.#internal.free();
  }

  [clearSymbol]() {
    this.#internal.set(undefined as Payload);
  }

  // [TODO] Hide from non-object states?
  decompose(): State.Decomposed<Payload> {
    // @ts-ignore: TypeScript is picky about the type here
    return {
      value: this.get(),
      state: this,
    } as State.Decomposed<Payload>;
  }

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): State.Discriminated<Payload, Discriminator> {
    return {
      // @ts-ignore: TypeScript is picky about the type here
      discriminator: this.$[discriminator]?.get(),
      state: this as State<Payload>,
    } as State.Discriminated<Payload, Discriminator>;
  }

  push: Payload extends Array<infer Item> ? (item: Item) => void : never = (
    item: Payload extends Array<infer Item> ? Item : never
  ) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    this.#internal.push(item);
    this.#trigger(StateChangeType.Added, StateTriggerFlow.Bidirectional);
  };

  map: Payload extends Array<infer Item>
    ? <Return>(
        callback: (item: State<Item>, index: number) => Return
      ) => Return[]
    : never = (callback: (item: any, index: number) => any) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    return this.#internal.map(callback);
  };

  get id(): string {
    return this.#id;
  }

  get $(): State.$<Payload> {
    return this.#internal.$();
  }

  get use(): State.Use<Payload> {
    return new Proxy((() => {}) as unknown as State.Use<Payload>, {
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

  #set(value: Payload, internal?: InternalState<any>): StateChange | 0 {
    const ValueConstructor = InternalState.detect(value);

    // The state is already of the same type
    if (internal instanceof ValueConstructor) return internal.set(value);

    // The state is of a different type
    internal?.free();
    // @ts-ignore: TypeScript is picky about the type here
    this.#internal = new ValueConstructor(this, value);
    this.#internal.set(value);
    return StateChangeType.Type;
  }

  #trigger(changed: StateChange, type: StateTriggerFlow) {
    this.#target.dispatchEvent(new StateChangeEvent(changed));
    if (type === StateTriggerFlow.Bidirectional)
      this.#parent?.[childTriggerSymbol](changed, this);
  }

  [childTriggerSymbol](type: StateChange, child: State<any>) {
    const updated =
      this.#internal.childUpdate(type, child) | StateChangeType.Child;
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
    ? UseFieldRef.UseFn<Payload>
    : Payload extends object
    ? UseFieldRef.Use<Payload>
    : never;

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

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        state: State<Payload>;
      }
    : never;
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
      value !== null &&
      typeof value === "object" &&
      !(value instanceof UndefinedValue)
    )
      return Array.isArray(value) ? InternalArrayState : InternalObjectState;
    return InternalPrimitiveState;
  }

  #external: State<Payload>;

  constructor(state: State<Payload>, _value: Payload) {
    this.#external = state;
  }

  abstract free(): void;

  abstract set(value: Payload): StateChange | 0;

  abstract get(): Payload;

  abstract $(): State.$<Payload>;

  childUpdate(type: StateChangeType, _child: State<any>): StateChange {
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

    if (this.#value instanceof UndefinedValue)
      changed |= StateChangeType.Type | StateChangeType.Created;
    else if (typeof this.#value !== typeof value)
      changed |= StateChangeType.Type;
    else if (this.#value !== value) changed |= StateChangeType.Value;

    if (this.#value !== value) this.#value = value;

    return changed;
  }

  get(): Payload {
    return this.#value instanceof UndefinedValue
      ? (undefined as Payload)
      : this.#value;
  }

  $(): State.$<Payload> {
    return this.external as State.$<Payload>;
  }

  updated(event: StateChangeEvent): boolean {
    return !!(
      event.detail & StateChangeType.Created ||
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
        changed |= StateChangeType.Removed;
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
          undefinedState || new State(value, this.external)
        );
        changed |= StateChangeType.Added;
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
      event.detail & StateChangeType.Type ||
      event.detail & StateChangeType.Removed ||
      event.detail & StateChangeType.Added
    );
  }

  childUpdate(childChanged: StateChange, child: State<any>): StateChange {
    let changed = StateChangeType.Child;

    // Handle when child goes from undefined to defined
    if (childChanged & StateChangeType.Created) {
      const key = this.#undefined.key(child);
      if (!key) throw new Error("Failed to find the child state when updating");
      this.#undefined.claim(key);
      this.#children.set(key, child);
      changed |= StateChangeType.Added;
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
        changed |= StateChangeType.Removed;
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

        const newChild = undefinedState || new State(value, this.external);
        changed |= StateChangeType.Added;
        return newChild;
      }
    });

    return changed;
  }

  push(item: Payload[number]) {
    this.#children.push(new State(item, this.external));
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
      event.detail & StateChangeType.Type ||
      event.detail & StateChangeType.Removed ||
      event.detail & StateChangeType.Added ||
      event.detail & StateChangeType.Reordered
    );
  }

  childUpdate(childChanged: StateChange, child: State<any>): StateChange {
    let changed = StateChangeType.Child;

    // Handle when child goes from undefined to defined
    if (childChanged & StateChangeType.Created) {
      const key = this.#undefined.key(child);
      if (!key) throw new Error("Failed to find the child state when updating");
      this.#undefined.claim(key);
      this.#children[Number(key)] = child;
      changed |= StateChangeType.Added;
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
  #keysMap = new WeakMap<State<any>, string>();
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
    this.#keysMap.set(state, key);
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
    this.#keysMap.delete(registered);
    return registered;
  }

  key(state: State<any>): string | undefined {
    return this.#keysMap.get(state);
  }

  ensure(key: string): State<UndefinedValue> {
    // Try to look up registed undefined item
    const registered = this.#refsMap.get(key)?.deref();
    if (registered) return registered;

    // Or create and register a new one
    const state = new State(new UndefinedValue(), this.#external);
    this.register(key, state);
    return state;
  }
}

//#endregion

//#region UndefinedValue

class UndefinedValue {}

//#endregion

//# StateChange

export type StateChange = number;

export enum StateChangeType {
  /** Nothing has changed, the initial value. */
  Nothing = 0, // 0
  /** The state has been inserted into an object or an array. */
  Created = 0b00000001, // 1
  /** The primitive value of the state has changed. */
  Value = 0b0000010, // 2
  /** The type of the state has changed. */
  Type = 0b0000100, // 4
  /** An object field or an array item has changed. */
  Child = 0b0001000, // 8
  /** An object field or an array item has been removed. */
  Removed = 0b0010000, // 16
  /** An object field or an array item has been added. */
  Added = 0b0100000, // 32
  /** The order of array items has changed. */
  Reordered = 0b10000000, // 64
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

//#region UseFieldRef

interface UseFieldRef<Payload> {
  (): State<Payload>;

  get use(): UseFieldRef.Use<Payload>;

  watch(): Payload;

  discriminated<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): State.Discriminated<Payload, Discriminator>;

  narrow<Return extends State<any> | false | undefined | "" | null | 0>(
    callback: (decomposed: State.Decomposed<Payload>) => Return
  ): Return;
}

export namespace UseFieldRef {
  export type Use<Payload> = UseFn<Payload> & {
    [Key in keyof Payload]-?: UseFieldRef<Payload[Key]>;
  };

  export interface UseFn<Payload> {
    (): State<Payload>;

    <Key extends keyof Payload>(key: Key): UseFieldRef<
      EnsoUtils.StaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  }
}

//#endregion
