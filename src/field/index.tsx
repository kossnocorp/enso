import { nanoid } from "nanoid";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRerender } from "../hooks/rerender.ts";
import { type EnsoUtils } from "../utils.ts";
import { FieldRef } from "./ref/index.ts";

//#region Field

const createSymbol = Symbol();
const clearSymbol = Symbol();

export const fieldPrivate = Symbol();

export class Field<Payload> {
  static use<Payload>(value: Payload): Field<Payload> {
    const field = useMemo(() => new Field(value), []);
    return field;
  }

  #id = nanoid();
  #parent?: Field.Parent<any> | undefined;
  #onInput;

  #internal: InternalState<Payload> = new InternalPrimitiveState(
    this,
    // @ts-ignore
    undefinedValue
  );

  #initial: Payload;

  constructor(value: Payload, parent?: Field.Parent<any>) {
    this.#initial = value;

    this.#set(value);
    this.#parent = parent;

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
    this.#cachedGet = undefinedValue;
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
    return this.#parent ? [...this.#parent.field.path, this.#parent.key] : [];
  }

  get parent(): Field<any> | undefined {
    return this.#parent?.field;
  }

  //#endregion

  //#region Value

  #cachedGet: Payload | UndefinedValue = undefinedValue;

  get(): Payload {
    if (this.#cachedGet === undefinedValue) {
      this.#cachedGet = this.#internal.get();
    }
    return this.#cachedGet;
  }

  useGet<Props extends Field.UseGetProps | undefined = undefined>(
    props?: Props
  ): Field.UseGet<Payload, Props> {
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
          if (!(event.changes & ~(fieldChange.valid | fieldChange.invalid)))
            return;

          setPayload(payload);
        }),
      []
    );
    // @ts-ignore: [TODO]
    return watchMeta ? [payload, meta] : payload;
  }

  // [TODO] Exposing the notify parents flag might be dangerous
  set(value: Payload | UndefinedValue, notifyParents = true): FieldChange | 0 {
    const change = this.#set(value);
    if (change) this.trigger(change, notifyParents);

    return change;
  }

  #set(value: Payload | UndefinedValue): FieldChange | 0 {
    const ValueConstructor = InternalState.detect(value);

    // The field is already of the same type
    if (this.#internal instanceof ValueConstructor)
      // @ts-ignore: [TODO]
      return this.#internal.set(value);

    // The field is of a different type
    this.#internal.unwatch();

    let changes = fieldChange.type;
    // The field is being detached
    if (value === undefinedValue) changes |= fieldChange.detached;

    // @ts-ignore: This is fine
    this.#internal = new ValueConstructor(this, value);
    // @ts-ignore: [TODO]
    this.#internal.set(value);
    return changes;
  }

  [createSymbol](value: Payload): FieldChange | 0 {
    const change = this.#internal.set(value) | fieldChange.created;
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
    if (this.#cachedDirty === undefined)
      this.#cachedDirty = this.#internal.dirty(this.#initial);
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

  commit() {
    this.#initial = this.get();
    this.#cachedDirty = undefined;
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    ) {
      this.#internal.forEach((field: any) => field.commit());
    }
  }

  reset() {
    this.set(this.#initial);
    this.#clearCache();
  }

  //#endregion

  //#region Tree

  get $(): Field.$<Payload> {
    return this.#internal.$();
  }

  at<Key extends keyof Payload>(
    key: Payload extends object ? Key : never
    // @ts-ignore: [TODO]
  ): Payload extends object ? Field.At<Payload, Key> : void {
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    )
      // @ts-ignore: [TODO]
      return this.#internal.at(key);
  }

  get try(): Field.Try<Payload> {
    return this.#internal.try();
  }

  //#endregion

  //#region Watching

  #target = new EventTarget();
  #subs = new Set<(event: Event) => void>();

  watch(callback: Field.WatchCallback<Payload>): Field.Unwatch {
    const handler = (event: Event) => {
      callback(this.get(), event as FieldChangeEvent);
    };

    this.#subs.add(handler);
    this.#target.addEventListener("change", handler);

    return () => {
      this.#subs.delete(handler);
      this.#target.removeEventListener("change", handler);
    };
  }

  useWatch(callback: Field.WatchCallback<Payload>): void {
    useEffect(() => this.watch(callback), [callback]);
  }

  unwatch() {
    this.#subs.forEach((sub) =>
      this.#target.removeEventListener("change", sub)
    );
    this.#subs.clear();
    this.#internal.unwatch();
  }

  useBind(): BoundField<Payload> {
    const rerender = useRerender();

    useEffect(
      () =>
        this.watch((_, event) => {
          if (this.#internal.updated(event)) rerender();
        }),
      [rerender]
    );

    return this as unknown as BoundField<Payload>;
  }

  trigger(change: FieldChange, notifyParents: boolean = false) {
    this.#clearCache();

    this.#target.dispatchEvent(new FieldChangeEvent(change));
    // If the updates should flow upstream to parents too
    if (notifyParents && this.#parent)
      this.#parent.field.#childTrigger(change, this.#parent.key);
  }

  #childTrigger(type: FieldChange, key: string) {
    const updated = this.#internal.childUpdate(type, key) | fieldChange.child;
    this.trigger(updated, true);
  }

  useMeta<Props extends Field.UseMetaProps | undefined = undefined>(
    props?: Props
  ): Field.Meta<Props> {
    const invalids = this.useInvalids(!props || !!props.invalids);
    const valid = this.useValid(!props || !!props.valid);
    const error = this.useError(!props || !!props.error);
    const dirty = this.useDirty(!props || !!props.dirty);
    return { invalids, valid, error, dirty } as Field.Meta<Props>;
  }

  //#endregion

  //#region Mapping

  useCompute<Computed>(
    callback: Field.ComputeCallback<Payload, Computed>
  ): Computed {
    const [computed, setComputed] = useState(() => callback(this.get()));

    useEffect(
      () =>
        this.watch((payload) => {
          const nextComputed = callback(payload);
          // [TODO] Use deep object comparison?
          if (nextComputed !== computed) setComputed(nextComputed);
        }),
      // [TODO] Consider using a ref for performance
      [computed, setComputed]
    );

    return computed;
  }

  decompose(): Field.Decomposed<Payload> {
    return {
      value: this.get(),
      field: this,
    } as unknown as Field.Decomposed<Payload>;
  }

  useDecompose(
    callback: Field.DecomposeCallback<Payload>
  ): Field.Decomposed<Payload> {
    const rerender = useRerender();
    const initial = useMemo(() => this.decompose(), []);
    const ref = useRef(initial);
    const prevRef = useRef(ref.current.value);
    useEffect(
      () =>
        this.watch((next) => {
          ref.current = this.decompose();
          if (callback(next, prevRef.current)) rerender();
          prevRef.current = next;
        }),
      []
    );
    return ref.current;
  }

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): Field.Discriminated<Payload, Discriminator> {
    // @ts-ignore: [TODO]
    return {
      // @ts-ignore: [TODO]
      discriminator: this.$[discriminator]?.get(),
      field: this,
    };
  }

  useDiscriminate<Discriminator extends Field.DiscriminatorKey<Payload>>(
    discriminator: Discriminator
  ): Field.Discriminated<Payload, Discriminator> {
    const rerender = useRerender();
    const initial = useMemo(() => this.discriminate(discriminator), []);
    const ref = useRef(initial);
    useEffect(
      () =>
        this.watch(() => {
          const discriminated = this.discriminate(discriminator);
          if (discriminated.discriminator !== ref.current.discriminator)
            rerender();
          ref.current = discriminated;
        }),
      []
    );
    return ref.current;
  }

  into<Computed>(
    intoCallback: Field.IntoCallback<Payload, Computed>
  ): Field.Into<Payload, Computed> {
    const computed = new ComputedField(intoCallback(this.get()), this);
    // [TODO] This creates a leak, so rather than holding on to the computed
    // field, store it as a weak ref and unsubscribe when it's no longer needed.
    this.watch((payload) => computed.set(intoCallback(payload)));

    return {
      from: (fromCallback) => {
        computed.watch((payload) => this.set(fromCallback(payload)));
        return computed;
      },
    };
  }

  useInto<Computed>(
    intoCallback: Field.IntoCallback<Payload, Computed>
  ): Field.Into<Payload, Computed> {
    const computed = useMemo(
      () => new ComputedField(intoCallback(this.get()), this),
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
  }

  narrow<Narrowed extends Payload>(
    callback: Field.NarrowCallback<Payload, Narrowed>
  ): Field<Narrowed> | undefined {
    let matching = false;
    const payload = this.get();
    // @ts-ignore: [TODO]
    callback(payload, (narrowed) => {
      // @ts-ignore: [TODO]
      if (payload === narrowed) matching = true;
      return {};
    });
    // @ts-ignore: [TODO]
    if (matching) return this;
  }

  useNarrow<Narrowed extends Payload>(
    callback: Field.NarrowCallback<Payload, Narrowed>
  ): Field<Narrowed> | undefined {
    const rerender = useRerender();
    const initial = useMemo(() => !!this.narrow(callback), []);
    const ref = useRef(initial);
    useEffect(
      () =>
        this.watch(() => {
          const narrowed = !!this.narrow(callback);
          if (narrowed === ref.current) return;
          ref.current = narrowed;
          rerender();
        }),
      []
    );
    // @ts-ignore: [TODO]
    return ref.current ? this : undefined;
  }

  //#endregion

  detach() {
    this.set(undefinedValue);
  }

  //#region Collections

  forEach: Field.ForEachFn<Payload> = ((callback: any) => {
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    )
      this.#internal.forEach(callback);
  }) as Field.ForEachFn<Payload>;

  map: Field.MapFn<Payload> = ((callback: any) => {
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    )
      return this.#internal.map(callback);
  }) as Field.MapFn<Payload>;

  // @ts-ignore: This is fine
  push: Payload extends Array<infer Item> ? (item: Item) => void : never = (
    item: Payload extends Array<infer Item> ? Item : never
  ) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    const length = this.#internal.push(item);
    this.trigger(fieldChange.childAdded, true);
    return length;
  };

  // @ts-ignore: This is fine
  get length(): Payload extends Array<any> ? number : never {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    // @ts-ignore: This is fine
    return this.#internal.length;
  }

  remove: Field.RemoveFn<Payload> = (<Key extends keyof Payload>(key: Key) => {
    // @ts-ignore: [TODO]
    this.at(key).detach();
  }) as Field.RemoveFn<Payload>;

  //#endregion

  //#region Input

  Control<
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorEnable extends boolean = false,
    ValidEnable extends boolean = false,
    InvalidsEnable extends boolean = false,
  >(
    props: Field.InputProps<
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

  input<Element extends HTMLElement>(): Field.Registration<Element> {
    return {
      name: this.path.join(".") || ".",
      ref: this.ref,
    };
  }

  #element: HTMLElement | null = null;
  #elementUnwatch: Field.Unwatch | undefined;

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

  #error: Field.Error | undefined;

  get error(): Field.Error | undefined {
    return this.#error;
  }

  useError<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? Field.Error | undefined : undefined {
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

  setError(error?: string | Field.Error | undefined) {
    const prevError = this.#error;
    error = typeof error === "string" ? { message: error } : error;

    if (
      error &&
      (!prevError ||
        prevError.type !== error.type ||
        prevError.message !== error.message)
    ) {
      this.#error = error;
      this.trigger(fieldChange.invalid, true);
    } else if (!error && prevError) {
      this.#error = error;
      this.trigger(fieldChange.valid, true);
    }
  }

  #cachedInvalids: Map<Field<any>, Field.Error> | undefined;

  get invalids(): Field.Invalids {
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
          item.invalids.forEach((error, field) => invalids.set(field, error));
        });
      }

      this.#cachedInvalids = invalids;
    }

    return this.#cachedInvalids;
  }

  useInvalids<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? Field.Invalids : undefined {
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
                ([field, error]) => invalids.get(field) === error
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

  //#region Validation

  validate<Payload, Context>(
    validator: Field.Validator<Payload, Context>,
    context: Context
  ): void;

  validate<Payload>(
    validator: Field.Validator<Payload, undefined>,
    context?: undefined
  ): void;

  validate<Payload, Context>(
    validator: Field.Validator<Payload, undefined>,
    context?: Context | undefined
  ) {
    const ref = new FieldRef(this);
    // @ts-expect-error: [TODO]
    return validator(ref, context);
  }

  //#endregion
}

export namespace Field {
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
    field: Field<Payload>;
  }

  export type $<Payload> = Payload extends object
    ? $Object<Payload>
    : Field<Payload>;

  export type $Object<Payload> = {
    [Key in keyof Payload]-?: Field<
      EnsoUtils.IsStaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type AtFn<Payload> = Payload extends object
    ? <Key extends keyof Payload>(key: Key) => At<Payload, Key>
    : (key: never) => never;

  export type At<Payload, Key extends keyof Payload> = Field<
    EnsoUtils.IsStaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  export type Try<Payload> = [Payload] extends [object]
    ? TryObject<Payload>
    : TryState<Payload>;

  export type TryObject<Payload> = TryFn<Payload> & {
    [Key in keyof Payload]-?: TryState<
      EnsoUtils.IsStaticKey<Payload, Key> extends true
        ? Payload[Key]
        : Payload[Key] | undefined
    >;
  };

  export type TryFn<Payload> = <Key extends keyof Payload>(
    key: Key
  ) => TryState<
    EnsoUtils.IsStaticKey<Payload, Key> extends true
      ? Payload[Key]
      : Payload[Key] | undefined
  >;

  export type TryState<Payload> =
    // Add null to the union
    | (null extends Payload ? null : never)
    // Add undefined to the union
    | (undefined extends Payload ? undefined : never)
    // Resolve field without null or undefined
    | Field<Exclude<Payload, null | undefined>>;

  //#endregion

  //#region Watching

  export type WatchCallback<Payload> = (
    payload: Payload,
    event: FieldChangeEvent
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

  export type ComputeCallback<Payload, Computed> = (
    payload: Payload
  ) => Computed;

  export type Decomposed<Payload> = Payload extends Payload
    ? {
        value: Payload;
        field: Field<Payload>;
      }
    : never;

  export type DecomposeCallback<Payload> = (
    newPayload: Payload,
    prevPayload: Payload
  ) => boolean;

  export type Discriminated<
    Payload,
    Discriminator extends keyof Exclude<Payload, undefined>,
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

  export type DiscriminatorKey<Payload> = keyof Exclude<Payload, undefined>;

  export interface Into<Payload, Computed> {
    from(
      callback: FromCallback<Payload, Computed>
    ): ComputedField<Payload, Computed>;
  }

  export type IntoCallback<Payload, Computed> = (payload: Payload) => Computed;

  export type FromCallback<Payload, ComputedPayload> = (
    payload: ComputedPayload
  ) => Payload;

  export type NarrowCallback<Payload, Narrowed> = (
    payload: Payload,
    wrap: NarrowWrap
  ) => NarrowWrapper<Narrowed> | EnsoUtils.Falsy;

  export type NarrowWrap = <Payload>(
    payload: Payload
  ) => NarrowWrapper<Payload>;

  export type NarrowWrapper<Payload> = {
    [narrowBrapperBrand]: Payload;
  };

  declare const narrowBrapperBrand: unique symbol;

  //#endregion

  //#region Collections

  export type ForEachFn<Payload> =
    Payload extends Array<any>
      ? ArrayForEach<Payload>
      : Payload extends object
        ? ObjectForEach<Payload>
        : (cb: never) => never;

  export type ObjectForEach<Payload extends object> = (
    callback: <Key extends keyof Payload>(
      item: Field<Payload[Key]>,
      key: Key
    ) => void
  ) => void;

  export type ArrayForEach<Payload extends Array<any>> = (
    callback: (item: Field<Payload[number]>, index: number) => void
  ) => void;

  export type MapFn<Payload> =
    Payload extends Array<any>
      ? ArrayMap<Payload>
      : Payload extends object
        ? ObjectMap<Payload>
        : (cb: never) => never;

  export type ObjectMap<Payload extends object> = <Return>(
    callback: <Key extends keyof Payload>(
      item: Field<Payload[Key]>,
      key: Key
    ) => Return
  ) => Return[];

  export type ArrayMap<Payload extends Array<any>> = <Return>(
    callback: (item: Field<Payload[number]>, index: number) => Return
  ) => Return[];

  export type RemoveFn<Payload> = Payload extends object
    ? ObjectRemoveFn<Payload>
    : (key: never) => void;

  export interface ObjectRemoveFn<Payload extends object> {
    <Key extends EnsoUtils.OptionalKeys<Payload>>(key: Key): At<Payload, Key>;

    <Key extends EnsoUtils.IndexedKeys<Payload>>(key: Key): At<Payload, Key>;
  }

  //#endregion

  //#region Input

  export type InputProps<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorEnable extends boolean = false,
    ValidEnable extends boolean = false,
    InvalidsEnable extends boolean = false,
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
    InputMetaProps extends UseMetaProps | undefined,
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

  export type Invalids = Map<Field<any>, Field.Error>;

  //#endregion

  //#region Validation

  export type Validator<Payload, Context = undefined> = Payload extends object
    ? () => Promise<unknown> | unknown
    : PrimitiveValidator<Payload, Context>;

  export type PrimitiveValidator<Payload, Context> = undefined extends Context
    ? (payload: Ref<Payload>) => Promise<void> | void
    : (payload: Ref<Payload>, context: Context) => Promise<void> | void;

  //#endregion

  //#region Ref

  export interface Ref<Payload> {
    value: Payload;
    error(error: Field.Error | string): void;
  }

  //#endregion
}

//#endregion

//#region BoundField

export interface BoundField<Payload> extends Field<Payload> {
  [boundBrand]: true;
}

declare const boundBrand: unique symbol;

//#endregion

//#region ComputedField

export class ComputedField<Payload, Computed> extends Field<Computed> {
  #source: Field<Payload>;

  constructor(payload: Computed, source: Field<Payload>) {
    super(payload);
    this.#source = source;
  }

  override get id(): string {
    return this.#source.id;
  }

  override get key(): string | undefined {
    return this.#source.key;
  }

  override get path(): string[] {
    return this.#source.path;
  }

  override get invalids(): Field.Invalids {
    return this.#source.invalids;
  }

  override get parent(): Field<any> | undefined {
    return this.#source.parent;
  }

  override setError(error?: string | Field.Error | undefined): void {
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

  #external: Field<Payload>;

  constructor(field: Field<Payload>, _value: Payload | UndefinedValue) {
    this.#external = field;
  }

  abstract unwatch(): void;

  abstract set(value: Payload | UndefinedValue): FieldChange | 0;

  abstract get(): Payload;

  abstract $(): Field.$<Payload>;

  abstract try(): Field.Try<Payload>;

  childUpdate(type: FieldChange, _key: string): FieldChange {
    return type;
  }

  abstract updated(event: FieldChangeEvent): boolean;

  abstract dirty(value: Payload): boolean;

  protected get external() {
    return this.#external;
  }
}

//#endregion

//#region InternalPrimitiveState

export class InternalPrimitiveState<Payload> extends InternalState<Payload> {
  #value: Payload;

  constructor(field: Field<Payload>, value: Payload) {
    super(field, value);
    this.#value = value;
  }

  set(value: Payload): FieldChange | 0 {
    let change = 0;

    if (this.#value === undefinedValue && value !== undefinedValue)
      change |= fieldChange.type | fieldChange.created;
    else if (this.#value !== undefinedValue && value === undefinedValue)
      change |= fieldChange.type | fieldChange.detached;
    else if (typeof this.#value !== typeof value) change |= fieldChange.type;
    else if (this.#value !== value) change |= fieldChange.value;

    if (this.#value !== value) this.#value = value;

    return change;
  }

  get(): Payload {
    return this.#value === undefinedValue
      ? (undefined as Payload)
      : this.#value;
  }

  $(): Field.$<Payload> {
    return this.external as Field.$<Payload>;
  }

  try(): Field.Try<Payload> {
    const value = this.get();
    if (value === undefined || value === null)
      return value as Field.Try<Payload>;
    return this.external as Field.Try<Payload>;
  }

  updated(event: FieldChangeEvent): boolean {
    return !!(
      event.changes & fieldChange.created ||
      event.changes & fieldChange.detached ||
      event.changes & fieldChange.type
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
  Payload extends object,
> extends InternalState<Payload> {
  #children: Map<string, Field<any>> = new Map();
  #undefined;

  constructor(external: Field<Payload>, value: Payload) {
    super(external, value);
    // @ts-ignore: [TODO]
    this.#undefined = new UndefinedStateRegistry(external);
  }

  set(newValue: Payload): FieldChange | 0 {
    let change = 0;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[clearSymbol]();
        // @ts-ignore: This is fine
        this.#undefined.register(key, child);
        change |= fieldChange.childDetached;
      }
    });

    for (const [key, value] of Object.entries(newValue)) {
      const child = this.#children.get(key);
      if (child) {
        const childChange = child.set(value, false);
        if (childChange) change |= fieldChange.child;
      } else {
        const undefinedState = this.#undefined.claim(key);
        if (undefinedState) undefinedState[createSymbol](value);

        this.#children.set(
          key,
          // @ts-ignore: [TODO]
          undefinedState || new Field(value, { key, field: this.external })
        );
        change |= fieldChange.childAdded;
      }
    }

    return change;
  }

  get(): Payload {
    return Object.fromEntries(
      Array.from(this.#children.entries()).map(([k, v]) => [k, v.get()])
    ) as Payload;
  }

  $(): Field.$<Payload> {
    return this.#$;
  }

  #$ = new Proxy({} as Field.$<Payload>, {
    get: (_, key: string) => this.#$field(key),
  });

  at<Key extends keyof Payload>(key: Key): Field.At<Payload, Key> {
    return this.#$field(String(key)) as Field.At<Payload, Key>;
  }

  #$field(key: string) {
    const field = this.#children.get(key);
    if (field) return field;

    return this.#undefined.ensure(key);
  }

  try(): Field.Try<Payload> {
    return this.#try;
  }

  #try = new Proxy((() => {}) as unknown as Field.Try<Payload>, {
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

  updated(event: FieldChangeEvent): boolean {
    return !!(
      event.changes & fieldChange.created ||
      event.changes & fieldChange.detached ||
      event.changes & fieldChange.type ||
      event.changes & fieldChange.childDetached ||
      event.changes & fieldChange.childAdded
    );
  }

  override childUpdate(childChange: FieldChange, key: string): FieldChange {
    let change = fieldChange.child;

    // Handle when child goes from undefined to defined
    if (childChange & fieldChange.created) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");
      // @ts-ignore: [TODO]
      this.#children.set(key, child);
      change |= fieldChange.childAdded;
    }

    if (childChange & fieldChange.detached) {
      const child = this.#children.get(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");
      this.#children.delete(key);
      child.unwatch();
      change |= fieldChange.childDetached;
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
      const field = this.#children.get(key);

      if (!field || field.initial !== value || field.dirty) return true;
    }

    return false;
  }

  //#region Array methods

  forEach(
    callback: <Key extends keyof Payload>(
      item: Field<Payload[Key]>,
      index: Key
    ) => void
  ) {
    this.#children.forEach((field, key) =>
      // @ts-ignore: [TODO]
      callback(field, key as keyof Payload)
    );
  }

  map<Return>(
    callback: <Key extends keyof Payload>(
      item: Field<Payload[Key]>,
      index: Key
    ) => Return
  ): Return[] {
    // @ts-ignore: [TODO]
    const result = [];
    this.#children.forEach((field, key) =>
      // @ts-ignore: [TODO]
      result.push(callback(field, key as keyof Payload))
    );
    // @ts-ignore: [TODO]
    return result;
  }

  //#endregion
}

//#endregion

//#region InternalArrayState

export class InternalArrayState<
  Payload extends Array<any>,
> extends InternalState<Payload> {
  #children: Field<any>[] = [];
  #undefined;

  constructor(external: Field<Payload>, value: Payload) {
    super(external, value);

    // @ts-ignore: This is fine
    this.#undefined = new UndefinedStateRegistry(external);
  }

  get(): Payload {
    return this.#children.map((child) => child.get()) as Payload;
  }

  set(newValue: Payload): FieldChange | 0 {
    let change = 0;

    this.#children.forEach((item, index) => {
      if (!(index in newValue)) {
        delete this.#children[index];
        item[clearSymbol]();
        // @ts-ignore: This is fine
        this.#undefined.register(index.toString(), item);
        change |= fieldChange.childDetached;
      }
    });

    // @ts-ignore: [TODO]
    this.#children = newValue.map((value, index) => {
      const child = this.#children[index];
      if (child) {
        const childChange = child.set(value, false);
        if (childChange) change |= fieldChange.child;
        return child;
      } else {
        const undefinedState = this.#undefined.claim(index.toString());
        if (undefinedState) undefinedState[createSymbol](value);

        const newChild =
          undefinedState ||
          new Field(value, {
            key: String(index),
            // @ts-ignore: This is fine
            field: this.external,
          });
        change |= fieldChange.childAdded;
        return newChild;
      }
    });

    return change;
  }

  $(): Field.$<Payload> {
    return this.#$;
  }

  #$ = new Proxy({} as Field.$<Payload>, {
    get: (_, index: string) => this.#item(Number(index)),
  });

  at<Key extends keyof Payload>(key: Key): Field.At<Payload, Key> {
    return this.#item(Number(key)) as Field.At<Payload, Key>;
  }

  #item(index: number) {
    const item = this.#children[index];
    if (item) return item;

    const indexStr = index.toString();
    return this.#undefined.ensure(indexStr);
  }

  try(): Field.Try<Payload> {
    return this.#try;
  }

  #try = new Proxy((() => {}) as unknown as Field.Try<Payload>, {
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

  updated(event: FieldChangeEvent): boolean {
    return !!(
      event.changes & fieldChange.created ||
      event.changes & fieldChange.detached ||
      event.changes & fieldChange.type ||
      event.changes & fieldChange.childDetached ||
      event.changes & fieldChange.childAdded ||
      event.changes & fieldChange.childrenReordered
    );
  }

  override childUpdate(childChange: FieldChange, key: string): FieldChange {
    let change = fieldChange.child;

    // Handle when child goes from undefined to defined
    if (childChange & fieldChange.created) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");
      // @ts-ignore: [TODO]
      this.#children[Number(key)] = child;
      change |= fieldChange.childAdded;
    }

    // Handle when child goes from defined to undefined
    if (childChange & fieldChange.detached) {
      const child = this.#children[Number(key)];
      if (!child)
        throw new Error("Failed to find the child field when updating");
      delete this.#children[Number(key)];
      child.unwatch();
      change |= fieldChange.childDetached;
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
      const field = this.#children[index];

      if (!field || field.initial !== value || field.dirty) return true;
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
    this.#children[length] = new Field(item, {
      key: String(length),
      // @ts-ignore: This is fine
      field: this.external,
    });
    return length + 1;
  }

  //#endregion
}

//#endregion

//#region UndefinedStateRegistry

export class UndefinedStateRegistry {
  #external;
  #refsMap = new Map<string, WeakRef<Field<any>>>();
  #registry;

  constructor(external: Field<any>) {
    this.#external = external;
    this.#registry = new FinalizationRegistry<string>((key) =>
      this.#refsMap.delete(key)
    );
  }

  register(key: string, field: Field<UndefinedValue>) {
    const fieldRef = new WeakRef(field);
    // @ts-ignore: [TODO]
    this.#refsMap.set(key, fieldRef);
    this.#registry.register(fieldRef, key);
  }

  claim(key: string): Field<undefined> | undefined {
    // Look up if the undefined field exists
    const ref = this.#refsMap.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregisted the field and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#refsMap.delete(key);
    // @ts-ignore: This is fine
    return registered;
  }

  ensure(key: string): Field<UndefinedValue> {
    // Try to look up registed undefined item
    const registered = this.#refsMap.get(key)?.deref();
    // @ts-ignore: This is fine
    if (registered) return registered;

    // Or create and register a new one
    const field = new Field(undefinedValue, {
      key,
      field: this.#external,
    });
    this.register(key, field);
    return field;
  }
}

//#endregion

//# FieldChange

export type FieldChange = number;

export const fieldChange = {
  /** Nothing has change, the initial value. */
  nothing: 0,
  /** The field has been inserted into an object or an array. */
  created: 0b000000000001, // 1
  /** The field has been detached from an object or an array. */
  detached: 0b000000000010, // 2
  /** The primitive value of the field has change. */
  value: 0b000000000100, // 4
  /** The type of the field has change. */
  type: 0b000000001000, // 8
  /** An object field or an array item has changed. */
  child: 0b000000010000, // 16
  /** An object field or an array item has been detached. */
  childDetached: 0b000000100000, // 32
  /** An object field or an array item has been added. */
  childAdded: 0b000001000000, // 64
  /** The order of array items has change. */
  childrenReordered: 0b000010000000, // 128
  /** The field become invalid. */
  invalid: 0b000100000000, // 256
  /** The field become valid. */
  valid: 0b001000000000, // 512,
  /** The current field got commited as initial */
  committed: 0b010000000000, // 1024
  // Just in case to give a little room, first 12 bits are reserved for State
  // reserved: 0b100000000000, // 2048
};

export class FieldChangeEvent extends Event {
  changes: FieldChange;

  constructor(changes: FieldChange) {
    super("change");
    this.changes = changes;
  }
}

//#endregion

//#region undefinedValue

export const undefinedValue = Symbol();

export type UndefinedValue = typeof undefinedValue;

//#endregion

//#region PoC

export function useUndefinedStringField(
  field: Field<string | undefined>
): Field<string> {
  return field
    .useInto((value) => value ?? "")
    .from((value) => value || undefined);
}

//#endregion
