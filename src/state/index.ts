import { nanoid } from "nanoid";
import { EnsoUtils } from "../utils.ts";

//#region State

const createSymbol = Symbol();

const clearSymbol = Symbol();

export class State<Payload> {
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

  set(value: Payload): StateChange | 0 {
    const changed = this.#internal.set(value);
    if (changed) this.#changed(changed);
    return changed;
  }

  [createSymbol] = (value: Payload): StateChange | 0 => {
    const changed = this.#internal.set(value) | StateChangeType.Created;
    this.#changed(changed);
    return changed;
  };

  watch(callback: State.WatchCallback<Payload>): () => void {
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

  free() {
    this.#subs.forEach((sub) =>
      this.#target.removeEventListener("change", sub)
    );
    this.#internal.free();
  }

  [clearSymbol] = () => {
    this.#internal.set(undefined as Payload);
  };

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

  get id(): string {
    return this.#id;
  }

  get $(): State.$<Payload> {
    return this.#internal.$();
  }

  #set(value: Payload, internal?: InternalState<any>): StateChange | 0 {
    const ValueConstructor = InternalState.detect(value);

    // The state is already of the same type
    if (internal instanceof ValueConstructor) {
      // @ts-ignore: TypeScript is picky about the type here
      internal as InternalState<Payload>;
      return internal.set(value);
    }

    // The state is of a different type
    internal?.free();
    // @ts-ignore: TypeScript is picky about the type here
    this.#internal = new ValueConstructor(this, value);
    this.#internal.set(value);
    return StateChangeType.Type;
  }

  #changed(type: StateChangeType) {
    this.#target.dispatchEvent(new StateChangeEvent(type));
    if (this.#parent) this.#parent.#changed(StateChangeType.Child);
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

  export type WatchCallback<Payload> = (
    payload: Payload,
    event: StateChangeEvent
  ) => void;

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
  #external: State<Payload>;

  constructor(state: State<Payload>, value: Payload) {
    this.#external = state;
  }

  abstract free(): void;

  abstract set(value: Payload): StateChange | 0;

  abstract get(): Payload;

  abstract $(): State.$<Payload>;

  protected get external() {
    return this.#external;
  }

  static detect(
    value: any
  ): typeof ArrayState | typeof ObjectState | typeof PrimitiveState {
    if (value !== null && typeof value === "object")
      return Array.isArray(value) ? ArrayState : ObjectState;
    return PrimitiveState;
  }
}

//#region PrimitiveState

export class PrimitiveState<Payload> extends InternalState<Payload> {
  #value: Payload;

  constructor(state: State<Payload>, value: Payload) {
    super(state, value);
    this.#value = value;
  }

  set(value: Payload): StateChange | 0 {
    let changed = 0;

    if (typeof this.#value !== typeof value) changed |= StateChangeType.Type;
    else if (this.#value !== value) changed |= StateChangeType.Value;

    if (this.#value !== value) this.#value = value;

    return changed;
  }

  get(): Payload {
    return this.#value;
  }

  $(): State.$<Payload> {
    return this.external as State.$<Payload>;
  }

  free() {}
}

//#endregion

//#region ObjectState

export class ObjectState<
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
        const childChanged = child.set(value);
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

//#region ArrayState

export class ArrayState<
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
        const childChanged = child.set(value);
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

  get(): Payload {
    return this.#children.map((child) => child.get()) as Payload;
  }

  $(): State.$<Payload> {
    return this.#proxy;
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
  #map = new Map<string, WeakRef<State<any>>>();
  #registry;

  constructor(external: State<any>) {
    this.#external = external;
    this.#registry = new FinalizationRegistry<string>((key) =>
      this.#map.delete(key)
    );
  }

  register(key: string, state: State<undefined>) {
    const stateRef = new WeakRef(state);
    this.#map.set(key, stateRef);
    this.#registry.register(stateRef, key);
  }

  claim(key: string): State<undefined> | undefined {
    // Look up if the undefined state exists
    const ref = this.#map.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregisted the state and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#map.delete(key);
    return registered;
  }

  ensure(key: string): State<undefined> {
    // Try to look up registed undefined item
    const registered = this.#map.get(key)?.deref();
    if (registered) return registered;

    // Or create and register a new one
    const state = new State(undefined, this.#external);
    this.register(key, state);
    return state;
  }
}

//#endregion

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
