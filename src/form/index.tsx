import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  InternalPrimitiveState,
  State,
  StateChange,
  statePrivate,
  StateTriggerFlow,
  undefinedValue,
} from "../state/index.ts";
import { EnsoUtils } from "../utils.ts";
import {
  type NarrowMixin,
  narrowMixin,
  useNarrowMixin,
} from "../mixins/narrow.js";
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

//#region Field

export class Field<Payload> {
  static use<Payload>(value: Payload): Field<Payload> {
    const field = useMemo(() => new Field(value), []);
    return field;
  }

  #proxy;
  #use;
  #onInput;

  #state: State<Payload>;

  #fields = new WeakMap<State<any>, Field<any>>();

  constructor(payload: Payload | State<Payload>) {
    this.#state = payload instanceof State ? payload : new State(payload);

    this.#proxy = new Proxy((() => {}) as unknown as State.$<Payload>, {
      // @ts-ignore: This is okay
      apply: (_, __, [key]: [string]) => this.#field(this.#state.$(key)),
      // @ts-ignore: This is okay
      get: (_, key: string) => this.#field(this.#state.$(key)),
    });

    this.#use = new Proxy((() => {}) as unknown as State.Use<Payload>, {
      // @ts-ignore: This is okay
      get: (_, key: string) => this.$[key].use,

      apply: () => {
        const [_, setState] = useState(0);
        useEffect(
          () =>
            this.watch((_payload, event) => {
              if (this.#internal.updated(event)) setState(Date.now());
            }),
          []
        );
        return this;
      },
    });

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

  get id(): string {
    return this.#state.id;
  }

  get $(): Field.$<Payload> {
    // Primitive state always returns itself
    if (this.#internal instanceof InternalPrimitiveState)
      return this as unknown as Field.$<Payload>;

    return this.#proxy as unknown as Field.$<Payload>;
  }

  get(): Payload {
    return this.#state.get();
  }

  set(payload: Payload): StateChange | 0 {
    return this.#state.set(payload);
  }

  get use(): Field.Use<Payload> {
    return this.#use as unknown as Field.Use<Payload>;
  }

  Control(props: Field.ControlProps<Payload>): React.ReactNode {
    return props.render({
      value: this.get(),
      onChange: this.set,
      // [TODO]
      onBlur: () => {},
      error: this.error,
    });
  }

  register<Element extends HTMLElement>(): Field.Registration<Element> {
    return {
      // [TODO] Generate and maintain the path
      name: "[TODO]",
      ref: this.ref,
    };
  }

  ref<Element extends HTMLElement>(element: Element | null) {
    if (this.#element === element) return;

    if (this.#element)
      this.#element.removeEventListener("input", this.#onInput(this.#element));

    if (!element) return;

    element.addEventListener("input", this.#onInput(element));
    this.#element = element;
  }

  #element: HTMLElement | null = null;

  watch(callback: State.WatchCallback<Payload>): State.Unwatch {
    return this.#state.watch(callback);
  }

  useWatch(): Payload {
    return this.#state.useWatch();
  }

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
      field = new Field(state);
      this.#fields.set(state, field);
    }

    return field;
  }

  get #internal() {
    return this.#state[statePrivate].internal;
  }

  // @ts-ignore: This is fine
  map: Payload extends Array<infer Item>
    ? <Return>(
        callback: (item: Field<Item>, index: number) => Return
      ) => Return[]
    : never = (callback: (item: any, index: number) => any) => {
    return this.#state.map((item, index) => callback(this.#field(item), index));
  };

  // @ts-ignore: This is fine
  push: Payload extends Array<infer Item> ? (item: Item) => void : never = (
    item: Payload extends Array<infer Item> ? Item : never
  ) => {
    return this.#state.push(item);
  };

  remove() {
    this.#state.set(undefinedValue, StateTriggerFlow.Bidirectional);
  }

  //#endregion

  // vvv PoC vvv

  get error(): FieldError | undefined {
    return {} as FieldError | undefined;
  }

  get dirty(): boolean {
    return false;
  }

  get valid(): boolean {
    return false;
  }

  // @ts-ignore: [TODO]
  get length(): Payload extends any[] ? number : never {}
}

export namespace Field {
  export type $<Payload> = Payload extends object
    ? Object$<Payload>
    : Field<Payload>;

  export type Object$<Payload> = $Fn<Payload> & {
    [Key in keyof Payload]-?: Field<Payload[Key]>;
  };

  export type $Fn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => Field<
    EnsoUtils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  //#region Use

  export type Use<Payload> = Payload extends Array<any>
    ? HookFieldUseFn<Payload>
    : Payload extends object
    ? HookFieldUse<Payload>
    : never;

  export interface HookField<Payload> {
    (): State<Payload>;

    get use(): HookFieldUse<Payload>;

    // watch(): Payload;

    // discriminated<Discriminator extends keyof Exclude<Payload, undefined>>(
    //   discriminator: Discriminator
    // ): State.Discriminated<Payload, Discriminator>;

    // narrow<Return extends Field<any> | false | undefined | "" | null | 0>(
    //   callback: (decomposed: State.Decomposed<Payload>) => Return
    // ): Return;
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
    error: FieldError | undefined;
  }

  export type OnChange<Payload> = (value: Payload) => void;

  export type OnBlur = () => void;

  //#endregion

  //#region Register

  export interface Registration<Element extends HTMLElement> {
    name: string;
    ref: RegistrationRef<Element>;
  }

  // [TODO] Add possible types
  export type RegistrationRef<Element extends HTMLElement> =
    React.LegacyRef<Element>;

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

//#region FieldParent

export interface FieldParent<Payload> {
  key: string;
  state: Field<Payload>;
}

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

//#region FieldError

export interface FieldError {
  type?: string | undefined;
  message: string;
}

//#endregion

export namespace Enso {
  export namespace Utils {
    /**
     * Any brand type that can be mixed with string number or symbol to create
     * opaque primitive.
     */
    export type AnyBrand = { [key: string | number | symbol]: any };

    /**
     * Removes brand from the given type.
     */
    export type Debrand<Type> = Type extends infer _Brand extends AnyBrand &
      infer Debranded extends string | number | symbol
      ? Debranded
      : Type;

    /**
     * Removes indexed fields leaving only statically defined.
     */
    export type WithoutIndexed<Model> = {
      [Key in keyof Model as string extends Debrand<Key>
        ? never
        : number extends Debrand<Key>
        ? never
        : symbol extends Debrand<Key>
        ? never
        : Key]: Model[Key];
    };

    /**
     * Resolves true if the given key is statically defined in the given type.
     */
    export type StaticKey<
      Model,
      Key extends keyof Model
    > = Key extends keyof WithoutIndexed<Model> ? true : false;
  }
}

//#endregion

export function useUndefinedStringField(
  field: Field<string | undefined>
): Field<string> {
  return field
    .into((value) => value ?? "")
    .from((value) => value || undefined)
    .use();
}

export function useForm<Payload extends object & { length?: never }>(
  props: Form.UseProps<Payload>
): Form<Payload> {
  const form = useMemo(() => new Form(props.initial), []);

  return form;
}

//#region Form

export class Form<
  Payload extends object & { length?: never }
> extends Field<Payload> {
  // #id: string;
  // #payload: Payload;
  // #dirty: boolean = false;
  // #errors: FieldError[] = [];
  // #target = new EventTarget();

  constructor(initial: Form.InitialPayload<Payload>) {
    super(initial());

    // this.#id = nanoid();

    // this.#useWatchEffect.bind(this);
    // this.#useWatchState.bind(this);
  }

  handleSubmit(callback: Form.HandleSubmitCallback<Payload>) {
    return async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // [TODO] Resolve the form

      // await callback(this.#payload);
    };
  }

  commit(): void {}

  // get at(): LegacyField.At<Payload> {
  //   return {};
  // }

  // get $(): Form.$<Payload> {
  //   return {};
  // }

  // get dirty() {
  //   return this.#dirty;
  // }

  get submitting() {
    return false;
  }
}

export namespace Form {
  export interface UseProps<Payload extends object & { length?: never }> {
    initial: InitialPayload<Payload>;
    resolve?: Resolve<Payload>;
  }

  export type InitialPayload<Payload> = () => Payload;

  export type Resolve<Payload extends object & { length?: never }> = (
    form: Form<Payload>
  ) => void;

  export type HandleSubmitCallback<Payload> = (
    payload: Payload
  ) => unknown | Promise<unknown>;

  export type $<Payload> = Payload extends Record<string, any>
    ? {
        [Key in keyof Payload]-?: Field<Payload[Key]>;
      }
    : never;
}

//#endregion

//#endregion
