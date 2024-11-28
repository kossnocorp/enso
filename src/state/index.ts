import { nanoid } from "nanoid";

//#region State

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
  export type $<Payload> = Payload extends Array<infer Item>
    ? Array<State<Item>>
    : Payload extends object
    ? { [Key in keyof Payload]: State<Payload[Key]> }
    : State<Payload>;

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

  set(value: Payload): StateChange | 0 {
    let changed = 0;

    this.#children.forEach((child, key) => {
      if (!(key in value)) {
        this.#children.delete(key);
        child.free();
        changed |= StateChangeType.Removed;
      }
    });

    for (const [k, v] of Object.entries(value)) {
      const child = this.#children.get(k);
      if (child) {
        const childChanged = child.set(v);
        if (childChanged) changed |= StateChangeType.Child;
      } else {
        this.#children.set(k, new State(v, this.external));
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
    return Object.fromEntries(this.#children.entries()) as State.$<Payload>;
  }

  free() {
    this.#children.forEach((child) => child.free());
    this.#children.clear();
  }
}

//#endregion

//#region ArrayState

export class ArrayState<
  Payload extends Array<any>
> extends InternalState<Payload> {
  #children: State<any>[] = [];

  set(value: Payload): StateChange | 0 {
    let changed = 0;

    this.#children.forEach((child, index) => {
      if (!(index in value)) {
        delete this.#children[index];
        child.free();
        changed |= StateChangeType.Removed;
      }
    });

    this.#children = value.map((v, i) => {
      const child = this.#children[i];
      if (child) {
        const childChanged = child.set(v);
        if (childChanged) changed |= StateChangeType.Child;
        return child;
      } else {
        const newChild = new State(v, this.external);
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
    return Object.fromEntries(this.#children.entries()) as State.$<Payload>;
  }

  free() {
    this.#children.forEach((child) => child.free());
    this.#children.length = 0;
  }
}

//#endregion

//#endregion

//# StateChange

export type StateChange = number;

export enum StateChangeType {
  /** Nothing has changed, the initial value. */
  Nothing = 0b000000, // 0
  /** The primitive value of the state has changed. */
  Value = 0b000001, // 1
  /** The type of the state has changed. */
  Type = 0b000010, // 2
  /** An object field or an array item has changed. */
  Child = 0b000100, // 4
  /** An object field or an array item has been removed. */
  Removed = 0b001000, // 8
  /** An object field or an array item has been added. */
  Added = 0b010000, // 16
  /** The order of array items has changed. */
  Reordered = 0b100000, // 32
}

export class StateChangeEvent extends CustomEvent<StateChange> {
  constructor(type: StateChange) {
    super("change", { detail: type });
  }
}

//#endregion
