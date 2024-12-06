import React, { useEffect, useMemo } from "react";
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
import { intoMixin, type IntoMixin, useIntoMixin } from "../mixins/into.js";
import {
  type NarrowMixin,
  narrowMixin,
  useNarrowMixin,
} from "../mixins/narrow.js";
import {
  InternalArrayState,
  InternalObjectState,
  InternalPrimitiveState,
  InternalState,
  State,
  StateChange,
  stateChangeType,
  statePrivate,
  undefinedValue,
} from "../state/index.ts";
import { type EnsoUtils } from "../utils.ts";

//#region Field

export class Field<Payload> {
  static use<Payload>(value: Payload): Field<Payload> {
    const field = useMemo(() => new Field(value), []);
    return field;
  }

  #parent?: Field<any> | undefined;

  #proxy: Field.$<Payload>;
  #use: Field.Use<Payload>;
  #onInput;

  #state: State<Payload>;

  #fields = new WeakMap<State<any>, Field<any>>();

  constructor(payload: Payload | State<Payload>, parent?: Field<any>) {
    this.#state = payload instanceof State ? payload : new State(payload);
    this.#parent = parent;

    this.#proxy = new Proxy((() => {}) as unknown as Field.$<Payload>, {
      // @ts-ignore: This is okay
      apply: (_, __, [key]: [string]) => this.#field(this.#state.$(key)),
      // @ts-ignore: This is okay
      get: (_, key: string) => this.#field(this.#state.$(key)),
    }) as Field.$<Payload>;

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
    }) as Field.Use<Payload>;

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

    this.#watchError();

    this.set = this.set.bind(this);
    this.Control = this.Control.bind(this);
    this.ref = this.ref.bind(this);
  }

  //#region Attributes

  get id(): string {
    return this.#state.id;
  }

  get key(): string | undefined {
    return this.#state.key;
  }

  get path(): string[] {
    return this.#state.path;
  }

  get parent(): Field<any> | undefined {
    return this.#parent;
  }

  get internal(): InternalState<Payload> {
    return this.#state.internal;
  }

  //#endregion

  get(): Payload {
    return this.#state.get();
  }

  set(payload: Payload): StateChange | 0 {
    return this.#state.set(payload);
  }

  get $(): Field.$<Payload> {
    // Primitive state always returns itself
    if (this.#internal instanceof InternalPrimitiveState)
      return this as unknown as Field.$<Payload>;

    return this.#proxy as unknown as Field.$<Payload>;
  }

  get use(): Field.Use<Payload> {
    return this.#use;
  }

  //#region Watching

  watch(callback: State.WatchCallback<Payload>): State.Unwatch {
    return this.#state.watch(callback);
  }

  useWatch(): Payload {
    return this.#state.useWatch();
  }

  unwatch() {
    this.#state.unwatch();
  }

  trigger(change: StateChange, notifyParents: boolean = false) {
    this.#state.trigger(change, notifyParents);
  }

  //#endregion

  //#region Mapping

  decompose: () => Field.Decomposed<Payload> = decomposeMixin("field");

  useDecompose: (
    callback: DecomposeMixin.Callback<Payload>
  ) => Field.Decomposed<Payload> = useDecomposeMixin();

  discriminate: <Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ) => Field.Discriminated<Payload, Discriminator> = discriminateMixin("field");

  useDiscriminate: <
    Discriminator extends DiscriminateMixin.DiscriminatorKey<Payload>
  >(
    discriminator: Discriminator
  ) => Field.Discriminated<Payload, Discriminator> = useDiscriminateMixin();

  into: <Computed>(
    intoCallback: IntoMixin.IntoCallback<Payload, Computed>
  ) => Field.Into<Payload, Computed> = intoMixin(Field);

  useInto: <Computed>(
    intoCallback: IntoMixin.IntoCallback<Payload, Computed>
  ) => Field.Into<Payload, Computed> = useIntoMixin(Field);

  narrow: <Narrowed extends Payload>(
    callback: NarrowMixin.Callback<Payload, Narrowed>
  ) => Field<Narrowed> | undefined = narrowMixin();

  useNarrow: <Narrowed extends Payload>(
    callback: NarrowMixin.Callback<Payload, Narrowed>
  ) => Field<Narrowed> | undefined = useNarrowMixin();

  //#endregion

  //#region Private

  #field(state: State<any>): Field<any> {
    let field = this.#fields.get(state);

    if (!field) {
      // @ts-ignore: This is fine
      field = new Field(state, this);
      this.#fields.set(state, field);
    }

    return field;
  }

  get #internal() {
    return this.#state[statePrivate].internal;
  }

  //#endregion

  remove() {
    this.#state.remove();
  }

  //#region Array

  get length(): Payload extends Array<any> ? number : never {
    return this.#state.length;
  }

  // @ts-ignore: This is fine
  forEach: Payload extends Array<infer Item>
    ? (callback: (item: Field<Item>, index: number) => void) => void
    : never = (callback: (item: any, index: number) => any) => {
    this.#state.forEach((item, key) => callback(this.#field(item), key));
  };

  // @ts-ignore: This is fine
  map: Payload extends Array<infer Item>
    ? <Return>(
        callback: (item: Field<Item>, index: number) => Return
      ) => Return[]
    : never = (callback: (item: any, index: number) => any) => {
    return this.#state.map((item, key) => callback(this.#field(item), key));
  };

  // @ts-ignore: This is fine
  push: Payload extends Array<infer Item> ? (item: Item) => void : never = (
    item: Payload extends Array<infer Item> ? Item : never
  ) => {
    return this.#state.push(item);
  };

  //#endregion

  //#region Field

  //#region Control

  Control(props: Field.ControlProps<Payload>): React.ReactNode {
    // [TODO] Watch for changes and trigger rerender

    return props.render({
      value: this.get(),
      onChange: this.set,
      // [TODO]
      onBlur: () => {},
      // [TODO]
      error: this.error,
    });
  }

  register<Element extends HTMLElement>(): Field.Registration<Element> {
    return {
      name: this.path.join(".") || ".",
      ref: this.ref,
    };
  }

  #element: HTMLElement | null = null;

  ref<Element extends HTMLElement>(element: Element | null) {
    if (this.#element === element) return;

    if (this.#element)
      this.#element.removeEventListener("input", this.#onInput(this.#element));

    if (!element) return;

    element.addEventListener("input", this.#onInput(element));
    this.#element = element;
  }

  //#endregion

  //#region Errors

  #error: State<Field.Error | undefined> = new State(undefined);

  #watchError() {
    this.#error.watch((error) => {
      this.trigger(
        error ? fieldChangeType.invalid : fieldChangeType.valid,
        true
      );
    });
  }

  get error(): Field.Error | undefined {
    return this.#error.get();
  }

  setError(error?: string | Field.Error | undefined) {
    this.#error.set(typeof error === "string" ? { message: error } : error);
  }

  get errors(): Field.Errors {
    const errors = new Map();

    if (this.error) errors.set(this, this.error);

    if (
      this.internal instanceof InternalArrayState ||
      this.internal instanceof InternalObjectState
    ) {
      this.forEach((item) => {
        item.errors.forEach((error, state) => errors.set(state, error));
      });
    }

    return errors;
  }

  //#endregion

  // vvv PoC vvv

  get valid(): boolean {
    return false;
  }

  get dirty(): boolean {
    return false;
  }

  //#endregion
}

export namespace Field {
  //#region Traverse

  export type $<Payload> = Payload extends object
    ? $Object<Payload>
    : Field<Payload>;

  export type $Object<Payload> = $Fn<Payload> & {
    [Key in keyof Payload]-?: Field<Payload[Key]>;
  };

  export type $Fn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => Field<
    EnsoUtils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  //#endregion

  //#region Use

  export type Use<Payload> = Payload extends Array<any>
    ? HookFieldUseFn<Payload>
    : Payload extends object
    ? HookFieldUse<Payload>
    : never;

  export interface HookField<Payload> {
    (): State<Payload>;

    get use(): HookFieldUse<Payload>;
  }

  export type HookFieldUse<Payload> = HookFieldUseFn<Payload> & {
    [Key in keyof Payload]-?: HookField<Payload[Key]>;
  };

  export interface HookFieldUseFn<Payload> {
    (): Field<Payload>;

    <Key extends keyof Payload>(key: Key): HookField<
      EnsoUtils.StaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  }

  //#endregion

  //#region Mapping

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: Field<Payload>;
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
              field: Field<Payload>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: Field<Payload>;
        }
    : never;

  export interface Into<Payload, Computed> {
    from(callback: IntoMixin.FromCallback<Payload, Computed>): Field<Computed>;
  }

  //#endregion

  //#region Control

  export interface ControlProps<Payload> {
    render: ControlRender<Payload>;
  }

  export type ControlRender<Payload> = (
    control: Control<Payload>
  ) => React.ReactNode;

  export interface Control<Payload> {
    value: Payload;
    onChange: OnChange<Payload>;
    onBlur: OnBlur;
    error: Error | undefined;
  }

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

  //#region Field

  export interface Error {
    type?: string | undefined;
    message: string;
  }

  export type Errors = Map<Field<any>, Field.Error>;

  //#endregion

  // vvv PoC vvv

  export type UseWatchCallback<Payload> = (payload: Payload) => void;

  //#region Shared

  // export type Use<Payload> = Payload extends Array<any>
  //   ? HookField.HookFieldUseFn<Payload>
  //   : Payload extends object
  //   ? HookField.HookFieldUse<Payload>
  //   : never;

  export type ObjectOnly<Payload, Type> = Payload extends object & {
    length?: never;
  }
    ? Type
    : never;

  export type ArrayOnly<Payload, Type> = Payload extends Array<any>
    ? Type
    : never;

  //#endregion
}

//#endregion

//# FieldChange

export const fieldChangeType = {
  ...stateChangeType,
  /** The field become invalid. */
  invalid: 0b1000000000, // 256
  /** The field become valid. */
  valid: 0b10000000000, // 512
};

//#endregion

//#region PoC

//#region DiscriminatedField

export type DiscriminatedField<
  Payload,
  Discriminator extends keyof Exclude<Payload, undefined>
> = Payload extends Payload
  ? Discriminator extends keyof Payload
    ? Payload[Discriminator] extends infer DiscriminatorValue
      ? DiscriminatorValue extends Payload[Discriminator]
        ? { discriminator: DiscriminatorValue; field: Field<Payload> }
        : never
      : never
    : // Add the payload type without the discriminator (i.e. undefined)
      {
        discriminator: undefined;
        field: Field<Payload>;
      }
  : never;

//#endregion

//#region DecomposedField

export type DecomposedField<Payload> = Payload extends Payload
  ? {
      value: Payload;
      field: Field<Payload>;
    }
  : never;

//#endregion

//#region VariableField

export type VariableField<Payload> =
  | Field<Payload>
  | (Payload extends Payload ? Field<Payload> : never);

//#endregion

//#region BaseField

//#endregion

//#region ArrayField

export namespace ArrayField {
  export type Use<Payload extends Array<any>> = (
    index: number
  ) => Field.HookField<Payload[number] | undefined>;

  export type Map<Payload extends Array<any>> = <Result>(
    callback: IteratorCallback<Payload, Result>
  ) => Result[];

  export type ForEach<Payload extends Array<any>> = (
    callback: IteratorCallback<Payload, void>
  ) => void;

  export type IteratorCallback<Payload extends Array<any>, Result> = (
    item: Field<Payload[number]>,
    index: number
  ) => Result;

  export type Append<Payload extends Array<any>> = (
    item: Payload[number]
  ) => void;

  export type Remove = (index: number) => void;
}

//#endregion

//#region FieldRef

export interface FieldRef<Payload> {
  get $(): FieldRef.$<Payload>;

  get valid(): boolean;

  get(): Payload;

  set(payload: Payload): void;

  setError(error: string | FieldError): void;

  forEach: Payload extends any[] ? FieldRef.ForEach<Payload> : never;

  map: Payload extends any[] ? FieldRef.Map<Payload> : never;

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): DiscriminatedFieldRef<Payload, Discriminator>;

  decompose(): DecomposedFieldRef<Payload>;
}

export namespace FieldRef {
  export type $<Payload> = {
    [Key in keyof Payload]-?: FieldRef<Payload[Key]>;
  };

  export type Map<Payload extends Array<any>> = <Result>(
    callback: IteratorCallback<Payload, Result>
  ) => Result[];

  export type ForEach<Payload extends Array<any>> = (
    callback: IteratorCallback<Payload, void>
  ) => void;

  export type IteratorCallback<Payload extends Array<any>, Result> = (
    item: FieldRef<Payload[number]>,
    index: number
  ) => Result;
}

export type DiscriminatedFieldRef<
  Payload,
  Discriminator extends keyof Exclude<Payload, undefined>
> = Payload extends Payload
  ? Discriminator extends keyof Payload
    ? Payload[Discriminator] extends infer DiscriminatorValue
      ? DiscriminatorValue extends Payload[Discriminator]
        ? { discriminator: DiscriminatorValue; field: FieldRef<Payload> }
        : never
      : never
    : // Add the payload type without the discriminator (i.e. undefined)
      {
        discriminator: undefined;
        field: FieldRef<Payload>;
      }
  : never;

export type DecomposedFieldRef<Payload> = Payload extends Payload
  ? {
      value: Payload;
      field: FieldRef<Payload>;
    }
  : never;

//#endregion

export function useUndefinedStringField(
  field: Field<string | undefined>
): Field<string> {
  return field
    .useInto((value) => value ?? "")
    .from((value) => value || undefined);
}

//#endregion
