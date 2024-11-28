import { nanoid } from "nanoid";
import React, { useMemo, type FormEvent } from "react";

//#region PoC

//#region DiscriminatedField

export type DiscriminatedField<
  Payload,
  Discriminator extends keyof Exclude<Payload, undefined>,
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

const payloadSymbol = Symbol();

export class Field<Payload> {
  #id = nanoid();

  [payloadSymbol]: Payload;

  constructor(payload: Payload) {
    this[payloadSymbol] = payload;
    this.Control = this.Control.bind(this);
  }

  get(): Payload {
    return this[payloadSymbol];
  }

  set(payload: Payload): void {
    this[payloadSymbol] = payload;
  }

  Control(props: Field.ControlProps<Payload>): React.ReactNode {
    return null;
  }

  useWatch(callback: Field.UseWatchCallback<Payload>): void;

  useWatch(): Payload;

  useWatch(callback?: Field.UseWatchCallback<Payload>): Payload | void {
    return {} as Payload;
  }

  useComputed<ComputedPayload>(
    callback: Field.IntoCallback<Payload, ComputedPayload>
  ): ComputedPayload {
    return {} as ComputedPayload;
  }

  useNarrow<Return extends Field<any> | false | undefined | "" | null | 0>(
    callback: (decomposed: DecomposedField<Payload>) => Return
  ): Return {
    return {} as any;
  }

  into<ComputedPayload>(
    callback: Field.IntoCallback<Payload, ComputedPayload>
  ): Field.Into<Payload, ComputedPayload> {
    return {} as Field.Into<Payload, ComputedPayload>;
  }

  get id(): string {
    return this.#id;
  }

  get error(): FieldError | undefined {
    return {} as FieldError | undefined;
  }

  get dirty(): boolean {
    return false;
  }

  get valid(): boolean {
    return false;
  }

  get $(): FieldRef.$<Payload> {
    return {} as FieldRef.$<Payload>;
  }

  get use(): Field.Use<Payload> {
    return (() => {}) as unknown as Field.Use<Payload>;
  }

  // @ts-ignore: [TODO]
  map: Payload extends any[] ? ArrayField.Map<Payload> : never = () => {};

  // @ts-ignore: [TODO]
  append: Payload extends any[] ? ArrayField.Append<Payload> : never = () => {};

  // @ts-ignore: [TODO]
  remove: Payload extends any[] ? ArrayField.Remove : never = () => {};

  // @ts-ignore: [TODO]
  get length(): Payload extends any[] ? number : never {}
}

export namespace Field {
  export type UseWatchCallback<Payload> = (payload: Payload) => void;

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

  //#region Computed

  export type IntoCallback<Payload, ComputedPayload> = (
    payload: Payload
  ) => ComputedPayload;

  export interface Into<Payload, ComputedPayload> {
    from(
      callback: FromCallback<Payload, ComputedPayload>
    ): From<ComputedPayload>;
  }

  export type FromCallback<Payload, ComputedPayload> = (
    payload: ComputedPayload
  ) => Payload;

  export interface From<Payload> {
    use(): Field<Payload>;
  }

  //#endregion

  //#region Shared

  export type Use<Payload> =
    Payload extends Array<any>
      ? UseFieldRef.UseFn<Payload>
      : Payload extends object
        ? UseFieldRef.Use<Payload>
        : never;

  export type ObjectOnly<Payload, Type> = Payload extends object & {
    length?: never;
  }
    ? Type
    : never;

  export type ArrayOnly<Payload, Type> =
    Payload extends Array<any> ? Type : never;

  //#endregion
}

//#endregion

//#region ArrayField

export namespace ArrayField {
  export type Use<Payload extends Array<any>> = (
    index: number
  ) => UseFieldRef<Payload[number] | undefined>;

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

interface UseFieldRef<Payload> {
  (): Field<Payload>;

  get use(): UseFieldRef.Use<Payload>;

  watch(): Payload;

  discriminated<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): DiscriminatedField<Payload, Discriminator>;

  narrow<Return extends Field<any> | false | undefined | "" | null | 0>(
    callback: (decomposed: DecomposedField<Payload>) => Return
  ): Return;
}

export namespace UseFieldRef {
  export type Use<Payload> = UseFn<Payload> & {
    [Key in keyof Payload]-?: UseFieldRef<Payload[Key]>;
  };

  export type UseFn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => UseFieldRef<
    Enso.Utils.StaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;
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
  Discriminator extends keyof Exclude<Payload, undefined>,
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
      (infer Debranded extends string | number | symbol)
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
      Key extends keyof Model,
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
  Payload extends object & { length?: never },
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

  export type $<Payload> =
    Payload extends Record<string, any>
      ? {
          [Key in keyof Payload]-?: Field<Payload[Key]>;
        }
      : never;
}

//#endregion
