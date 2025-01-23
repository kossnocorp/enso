import { nanoid } from "nanoid";
import React, {
  DependencyList,
  FocusEvent,
  FocusEventHandler,
  MutableRefObject,
  RefCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  change,
  ChangesEvent,
  FieldChange,
  shapeChange,
  shiftChildChanges,
  structuralChanges,
} from "../change/index.ts";
import { useRerender } from "../hooks/rerender.ts";
import { type EnsoUtils } from "../utils.ts";
import { FieldRef } from "./ref/index.ts";
import { devHumanizeChanges, devStringifyChanges } from "../dev.ts";

export { FieldRef };

//#region Field

const createSymbol = Symbol();
const clearSymbol = Symbol();

export const fieldPrivate = Symbol();

export class Field<Payload> {
  static use<Payload>(value: Payload): Field<Payload> {
    const field = useMemo(() => new Field(value), []);
    return field;
  }

  static Component<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorEnable extends boolean = false,
    ValidEnable extends boolean = false,
    InvalidsEnable extends boolean = false,
  >(
    props: Field.ComponentProps<
      Payload,
      MetaEnable,
      DirtyEnable,
      ErrorEnable,
      ValidEnable,
      InvalidsEnable
    >
  ): React.ReactNode {
    const { field } = props;
    const value = field.useGet();
    const meta = field.useMeta({
      dirty: props.meta || !!props.dirty,
      error: props.meta || !!props.error,
      valid: props.meta || !!props.valid,
      invalids: props.meta || !!props.invalids,
    });

    const control = {
      name: field.name,
      value,
      onChange: field.set,
      onBlur: () => {
        field.trigger(change.field.blur, true);
      },
    };

    return props.render(control, meta as any);
  }

  #id = nanoid();
  #parent?: Field.Parent<any> | undefined;
  #onInput;

  #internal: InternalState<Payload> = new InternalPrimitiveState(
    this,
    // @ts-ignore
    detachedValue
  );

  #initial: Payload;

  constructor(value: Payload, parent?: Field.Parent<any>) {
    this.#initial = value;

    this.#set(value);
    this.#parent = parent;

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      const value = target.value as Payload;
      this.set(value);
    };

    this.#onInput = <Element extends HTMLElement>(element: Element) => {
      switch (true) {
        case element instanceof HTMLInputElement:
        case element instanceof HTMLTextAreaElement:
        // [TODO]
        default:
          return onInput;
      }
    };

    this.set = this.set.bind(this);
    this.ref = this.ref.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  #clearCache() {
    this.#cachedGet = detachedValue;
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

  get name(): string {
    return this.path.join(".") || ".";
  }

  get parent(): Field<any> | undefined {
    return this.#parent?.field;
  }

  //#endregion

  //#region Value

  #cachedGet: Payload | DetachedValue = detachedValue;

  get(): Payload {
    if (this.#cachedGet === detachedValue) {
      this.#cachedGet = this.#internal.get();
    }
    return this.#cachedGet;
  }

  useGet<Props extends Field.UseGetProps | undefined = undefined>(
    props?: Props
  ): Field.UseGet<Payload, Props> {
    const watchAllMeta = !!props?.meta;
    const watchMeta =
      watchAllMeta || props?.invalids || props?.valid || props?.dirty;
    const meta = this.useMeta(
      watchAllMeta
        ? undefined
        : {
            dirty: !!props?.dirty,
            error: !!props?.error,
            valid: !!props?.valid,
            invalids: !!props?.invalids,
          }
    );

    // @ts-ignore: [TODO]
    return useFieldHook({
      field: this as Field<any>,
      getValue: () => this.get(),
      watch: ({ valueRef, rerender }) =>
        this.watch((payload, event) => {
          // React only on structural changes
          if (!structuralChanges(event.changes)) return;

          valueRef.current = { id: this.id, enable: true, value: payload };
          rerender();
        }),
      toResult: (result) => (watchMeta ? [result, meta] : result),
    });
  }

  // [TODO] Exposing the notify parents flag might be dangerous
  set(value: Payload | DetachedValue, notifyParents = true): FieldChange {
    const changes = this.#set(value);
    if (changes) this.trigger(changes, notifyParents);

    return changes;
  }

  #set(value: Payload | DetachedValue): FieldChange {
    // Frozen fields should not change!
    if (Object.isFrozen(this)) return 0n;

    const ValueConstructor = InternalState.detect(value);

    // The field is already of the same type
    if (this.#internal instanceof ValueConstructor)
      return this.#internal.set(value);

    // The field is of a different type
    this.#internal.unwatch();

    let changes = 0n;
    // Field is being detached
    if (value === detachedValue) changes |= change.field.detach;
    // Field is being attached
    else if (this.#internal.detached()) changes |= change.field.attach;
    // Field type is changing
    else changes |= change.field.type;

    // @ts-ignore: This is fine
    this.#internal = new ValueConstructor(this, value);
    this.#internal.set(value);
    return changes;
  }

  [createSymbol](value: Payload): FieldChange {
    const changes = this.#set(value) | change.field.attach;
    this.trigger(changes, false);
    return changes;
  }

  [clearSymbol]() {
    this.#set(undefined as Payload);
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
    // @ts-ignore: [TODO]
    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue: () => this.dirty,
    });
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

  at<Key extends keyof Payload | undefined>(
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

  //#region Events

  #target = new EventTarget();
  #subs = new Set<(event: Event) => void>();

  trigger(changes: FieldChange, notifyParents: boolean = false) {
    this.#clearCache();

    if (this.#withholded) {
      this.#withholded[0] |= changes;

      if (
        this.#withholded[0] & change.field.valid &&
        changes & change.field.invalid
      )
        this.#withholded[0] &= ~change.field.valid;

      if (
        this.#withholded[0] & change.field.invalid &&
        changes & change.field.valid
      )
        this.#withholded[0] &= ~(change.field.invalid | change.field.valid);

      if (notifyParents) this.#withholded[1] = true;

      return;
    }

    this.#target.dispatchEvent(new ChangesEvent(changes));

    // If the updates should flow upstream, trigger parents too
    if (notifyParents && this.#parent)
      this.#parent.field.#childTrigger(changes, this.#parent.key);
  }

  #childTrigger(childChanges: FieldChange, key: string) {
    let changes =
      // Shift child's field changes into child/subtree range
      shiftChildChanges(childChanges) |
      // Apply field changes
      this.#internal.childUpdate(childChanges, key);

    // Apply shape change
    changes |= shapeChange(changes);

    this.trigger(changes, true);
  }

  #withholded: [FieldChange, boolean] | undefined;

  withhold() {
    this.#withholded = [0n, false];
    this.#internal.withhold();
  }

  unleash() {
    this.#internal.unleash();
    const withholded = this.#withholded;
    this.#withholded = undefined;
    if (withholded?.[0]) this.trigger(...withholded);
  }

  //#endregion

  //#region Watching

  watch(callback: Field.WatchCallback<Payload>): Field.Unwatch {
    const handler = (event: Event) => {
      callback(this.get(), event as ChangesEvent);
    };

    this.#subs.add(handler);
    this.#target.addEventListener("change", handler);

    return () => {
      this.#subs.delete(handler);
      this.#target.removeEventListener("change", handler);
    };
  }

  useWatch(callback: Field.WatchCallback<Payload>): void {
    // Preserve id to detected the active field swap.
    const idRef = useRef(this.id);

    useEffect(() => {
      // If the field id changes, trigger the callback with the swapped change.
      if (idRef.current !== this.id) {
        idRef.current = this.id;
        callback(this.get(), new ChangesEvent(change.field.id));
      }

      return this.watch(callback);
    }, [this.id, callback]);
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
      [this.id, rerender]
    );

    return this as unknown as BoundField<Payload>;
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
    callback: Field.ComputeCallback<Payload, Computed>,
    deps?: DependencyList
  ): Computed {
    // @ts-ignore: [TODO]
    return useFieldHook({
      field: this as Field<any>,
      getValue: () => callback(this.get()),
      deps,
    });
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
    // @ts-ignore: [TODO]
    return useFieldHook({
      field: this as Field<any>,
      getValue: () => this.decompose(),
      shouldRender: (prev, next) => !!prev && callback(next.value, prev.value),
    });
  }

  discriminate<Discriminator extends keyof Exclude<Payload, undefined>>(
    discriminator: Discriminator
  ): Field.Discriminated<Payload, Discriminator> {
    // @ts-ignore: [TODO]
    return {
      // @ts-ignore: [TODO]
      discriminator: this.$?.[discriminator]?.get(),
      field: this,
    };
  }

  useDiscriminate<Discriminator extends Field.DiscriminatorKey<Payload>>(
    discriminator: Discriminator
  ): Field.Discriminated<Payload, Discriminator> {
    // @ts-ignore: [TODO]
    return useFieldHook({
      field: this as Field<any>,
      getValue: () => this.discriminate(discriminator),
      shouldRender: (prev, next) => prev?.discriminator !== next.discriminator,
    });
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
      [this.id]
    );

    useEffect(() => {
      // It's ok to trigger set here because the setting the same value won't
      // trigger any events, however for the better performance, it is better
      // if the into and from callbacks are memoized.
      computed.set(intoCallback(this.get()));
      return this.watch((payload) => computed.set(intoCallback(payload)));
    }, [this.id, intoCallback]);

    return useMemo(
      () => ({
        from: (fromCallback) => {
          useEffect(
            () => computed.watch((payload) => this.set(fromCallback(payload))),
            [this.id, computed, fromCallback]
          );
          return computed;
        },
      }),
      [this.id, computed]
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
    return useFieldHook({
      field: this as Field<any>,
      getValue: () => this.narrow(callback),
    });
  }

  /**
   * Ensures that the field is not undefined. It returns a tuple with ensured
   * field and dummy field. If the field is undefined, the dummy field will
   * return as the ensured, otherwise the passed field.
   *
   * It allows to workaround the React Hooks limitation of not being able to
   * call hooks conditionally.
   *
   * The dummy field is frozen and won't change or trigger any events.
   *
   * @param field - The field to ensure. Can be undefined.
   * @returns Fields tuple, first element - ensured field, second - dummy field
   */
  static useEnsure<Payload>(
    field: Field<Payload> | undefined
  ): Field<Payload | undefined> {
    const dummy = Field.use(undefined);
    const frozenDummy = useMemo(() => Object.freeze(dummy), [dummy]);
    return (field || frozenDummy) as Field<Payload | undefined>;
  }

  //#endregion

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
    this.trigger(change.child.attach, true);
    return length;
  };

  // @ts-ignore: This is fine
  find: Field.FindFn<Payload> = (predicate) => {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");
    // @ts-ignore: This is fine
    return this.#internal.find(predicate);
  };

  get length(): Payload extends Array<any> ? number : never {
    if (!(this.#internal instanceof InternalArrayState))
      throw new Error("State is not an array");

    // @ts-ignore: This is fine
    return this.#internal.length;
  }

  remove: Field.RemoveFn<Payload> = function <Key extends keyof Payload>(
    key: Key
  ) {
    // @ts-ignore: [TODO]
    if (arguments.length === 0) return this.set(detachedValue);
    // @ts-ignore: [TODO]
    else return this.at(key).remove();
  } as Field.RemoveFn<Payload>;

  //#endregion

  //#region Control

  control<Element extends HTMLElement>(
    props?: Field.InputProps<Element>
  ): Field.Registration<Element> {
    this.#customRef = props?.ref;
    this.#customOnBlur = props?.onBlur;

    return {
      name: this.name,
      ref: this.ref,
      onBlur: this.onBlur,
    };
  }

  #element: HTMLElement | null = null;
  #elementUnwatch: Field.Unwatch | undefined;
  #customRef:
    | RefCallback<Element>
    | MutableRefObject<Element | null>
    | undefined;

  ref<Element extends HTMLElement>(element: Element | null) {
    if (this.#customRef) {
      if (typeof this.#customRef === "function") this.#customRef(element);
      else this.#customRef.current = element;
    }

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
      case element instanceof HTMLTextAreaElement:
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

  #customOnBlur: FocusEventHandler<Element> | undefined;

  onBlur<Element extends HTMLElement>(event: FocusEvent<Element>) {
    this.trigger(change.field.blur, true);
    this.#customOnBlur?.(event);
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
    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue: () => this.error,
    });
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
      this.trigger(change.field.invalid, true);
    } else if (!error && prevError) {
      this.#error = error;
      this.trigger(change.field.valid, true);
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
    // @ts-ignore: [TODO]
    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue: () => this.invalids,
      shouldRender: (prev, next) =>
        !(
          next === prev ||
          (next.size === prev?.size &&
            Array.from(next).every(
              ([field, error]) => prev?.get(field) === error
            ))
        ),
    });
  }

  get valid(): boolean {
    return !this.invalids.size;
  }

  useValid<Enable extends boolean | undefined = undefined>(
    enable?: Enable
  ): Enable extends true | undefined ? boolean : undefined {
    // @ts-ignore: [TODO]
    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue: () => this.valid,
    });
  }

  // [TODO] Try to find a better name.
  expunge() {
    this.#cachedInvalids = undefined;
    this.setError(undefined);
    this.#internal.expunge();
  }

  //#endregion

  //#region Validation

  validate<Context>(
    validator: Field.Validator<Payload, Context>,
    context: Context
  ): Promise<void>;

  validate(
    validator: Field.Validator<Payload, undefined>,
    context?: undefined
  ): Promise<void>;

  async validate<Context>(
    validator: Field.Validator<Payload, undefined>,
    context?: Context | undefined
  ) {
    this.expunge();
    this.withhold();
    // @ts-ignore: [TODO]
    await validator(FieldRef.get(this), context);
    this.unleash();
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
    : undefined;

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

  export type At<
    Payload,
    Key extends keyof Payload | undefined,
  > = Key extends keyof Payload
    ? Field<
        EnsoUtils.IsStaticKey<Payload, Key> extends true
          ? Payload[Key]
          : Payload[Key] | undefined
      >
    : Field<undefined>;

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
    event: ChangesEvent
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

  export type Ensured<Payload> = [
    Field<Payload | undefined>,
    Readonly<Field<undefined>>,
  ];

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
    : () => void;

  export type ArrayPredicate<Item, Return> = (
    item: Field<Item>,
    index: number
  ) => Return;

  export type FindFn<Payload> =
    Payload extends Array<infer Item>
      ? (predicate: FindPredicate<Item>) => Field<Item> | undefined
      : never;

  export type FindPredicate<Item> = ArrayPredicate<
    Item,
    boolean | false | 0 | "" | null | undefined
  >;

  export interface ObjectRemoveFn<Payload extends object> {
    (): void;

    <Key extends EnsoUtils.OptionalKeys<Payload>>(key: Key): At<Payload, Key>;

    <Key extends EnsoUtils.IndexedKeys<Payload>>(key: Key): At<Payload, Key>;
  }

  //#endregion

  //#region Input

  export type ComponentProps<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorEnable extends boolean = false,
    ValidEnable extends boolean = false,
    InvalidsEnable extends boolean = false,
  > = {
    field: Field<Payload>;
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
    name: string;
    value: Payload;
    onChange: OnChange<Payload>;
    onBlur: FocusEventHandler<Element>;
  };

  export type OnChange<Payload> = (value: Payload) => void;

  export interface InputProps<Element extends HTMLElement> {
    ref?: RefCallback<Element> | MutableRefObject<Element | null> | undefined;
    onBlur?: FocusEventHandler<Element> | undefined;
  }

  export interface Registration<Element extends HTMLElement> {
    name: string;
    ref: RefCallback<Element>;
    onBlur: FocusEventHandler<Element>;
  }

  //#endregion

  //#region Errors

  export interface Error {
    type?: string | undefined;
    message: string;
  }

  export type Invalids = Map<Field<any>, Field.Error>;

  //#endregion

  //#region Validation

  export type Validator<
    Payload,
    Context = undefined,
  > = undefined extends Context
    ? (payload: FieldRef<Payload>) => Promise<void> | void
    : (payload: FieldRef<Payload>, context: Context) => Promise<void> | void;

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

  // [NOTE] id mustn't be overridden as it's used as the hooks dependency

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
      value !== detachedValue &&
      value !== null &&
      typeof value === "object" &&
      value !== detachedValue
    )
      return Array.isArray(value) ? InternalArrayState : InternalObjectState;
    return InternalPrimitiveState;
  }

  #external: Field<Payload>;

  constructor(field: Field<Payload>, _value: Payload | DetachedValue) {
    this.#external = field;
  }

  abstract unwatch(): void;

  abstract set(value: Payload | DetachedValue): FieldChange;

  abstract get(): Payload;

  abstract $(): Field.$<Payload>;

  abstract try(): Field.Try<Payload>;

  childUpdate(type: FieldChange, _key: string): FieldChange {
    return type;
  }

  abstract updated(event: ChangesEvent): boolean;

  abstract dirty(value: Payload): boolean;

  protected get external() {
    return this.#external;
  }

  abstract expunge(): void;

  abstract withhold(): void;

  abstract unleash(): void;

  detached(): boolean {
    return false;
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

  set(value: Payload): FieldChange {
    let changes = 0n;
    if (this.#value === detachedValue && value !== detachedValue)
      changes |= change.field.attach;
    else if (this.#value !== detachedValue && value === detachedValue)
      changes |= change.field.detach;
    else if (typeof this.#value !== typeof value) changes |= change.field.type;
    else if (this.#value !== value) changes |= change.field.value;

    if (this.#value !== value) this.#value = value;

    return changes;
  }

  get(): Payload {
    return this.#value === detachedValue ? (undefined as Payload) : this.#value;
  }

  $(): Field.$<Payload> {
    return undefined as Field.$<Payload>;
  }

  try(): Field.Try<Payload> {
    const value = this.get();
    if (value === undefined || value === null)
      return value as Field.Try<Payload>;
    return this.external as Field.Try<Payload>;
  }

  updated(event: ChangesEvent): boolean {
    return !!(
      event.changes & change.field.attach ||
      event.changes & change.field.detach ||
      event.changes & change.field.type
    );
  }

  unwatch() {}

  dirty(initial: Payload): boolean {
    return initial !== this.#value;
  }

  override expunge(): void {}

  override withhold(): void {}

  override unleash(): void {}

  override detached(): boolean {
    return this.#value === detachedValue;
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

  set(newValue: Payload): FieldChange {
    let changes = 0n;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[clearSymbol]();
        // @ts-ignore: This is fine
        this.#undefined.register(key, child);
        changes |= change.child.detach;
      }
    });

    for (const [key, value] of Object.entries(newValue)) {
      const child = this.#children.get(key);
      if (child) {
        const childChanges = child.set(value, false);
        changes |= shiftChildChanges(childChanges);
      } else {
        const undefinedState = this.#undefined.claim(key);
        if (undefinedState) undefinedState[createSymbol](value);

        this.#children.set(
          key,
          // @ts-ignore: [TODO]
          undefinedState || new Field(value, { key, field: this.external })
        );
        changes |= change.child.attach;
      }
    }

    // Apply shape change
    changes |= shapeChange(changes);

    return changes;
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

  updated(event: ChangesEvent): boolean {
    return !!(
      event.changes & change.field.attach ||
      event.changes & change.field.detach ||
      event.changes & change.field.type ||
      event.changes & change.child.detach ||
      event.changes & change.child.attach
    );
  }

  override childUpdate(childChanges: FieldChange, key: string): FieldChange {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.field.attach) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");
      // @ts-ignore: [TODO]
      this.#children.set(key, child);
      changes |= change.child.attach;
    }

    if (childChanges & change.field.detach) {
      const child = this.#children.get(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");
      this.#children.delete(key);
      child.unwatch();
      changes |= change.child.detach;
    }

    return changes;
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

  override expunge(): void {
    this.#children.forEach((field) => field.expunge());
  }

  override withhold(): void {
    this.#children.forEach((field) => field.withhold());
  }

  override unleash(): void {
    this.#children.forEach((field) => field.unleash());
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

  set(newValue: Payload): FieldChange {
    let changes = 0n;

    this.#children.forEach((item, index) => {
      if (!(index in newValue)) {
        delete this.#children[index];
        item[clearSymbol]();
        // @ts-ignore: This is fine
        this.#undefined.register(index.toString(), item);
        changes |= change.child.detach;
      }
    });

    // @ts-ignore: [TODO]
    this.#children = newValue.map((value, index) => {
      const child = this.#children[index];
      if (child) {
        const childChanges = child.set(value, false);
        changes |= shiftChildChanges(childChanges);
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
        changes |= change.child.attach;
        return newChild;
      }
    });

    // Apply shape change
    changes |= shapeChange(changes);

    return changes;
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

  updated(event: ChangesEvent): boolean {
    return !!(
      event.changes & change.field.attach ||
      event.changes & change.field.detach ||
      event.changes & change.field.type ||
      event.changes & change.child.detach ||
      event.changes & change.child.attach
    );
  }

  override childUpdate(childChanges: FieldChange, key: string): FieldChange {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.field.attach) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");
      // @ts-ignore: [TODO]
      this.#children[Number(key)] = child;
      changes |= change.child.attach;
    }

    // Handle when child goes from defined to undefined
    if (childChanges & change.field.detach) {
      const child = this.#children[Number(key)];
      if (!child)
        throw new Error("Failed to find the child field when updating");
      this.#children.splice(Number(key), 1);
      child.unwatch();
      changes |= change.child.detach;
    }

    return changes;
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

  override expunge(): void {
    this.#children.forEach((field) => field.expunge());
  }

  override withhold(): void {
    this.#children.forEach((field) => field.withhold());
  }

  override unleash(): void {
    this.#children.forEach((field) => field.unleash());
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

  find(
    predicate: Field.FindPredicate<Payload[number]>
  ): Field<Payload[number]> | undefined {
    // @ts-ignore: This is fine
    return this.#children.find(predicate);
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

  register(key: string, field: Field<DetachedValue>) {
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

  ensure(key: string): Field<DetachedValue> {
    // Try to look up registed undefined item
    const registered = this.#refsMap.get(key)?.deref();
    // @ts-ignore: This is fine
    if (registered) return registered;

    // Or create and register a new one
    const field = new Field(detachedValue, {
      key,
      field: this.#external,
    });
    this.register(key, field);
    return field;
  }
}

//#endregion

//#region Detached value

export const detachedValue = Symbol();

export type DetachedValue = typeof detachedValue;

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

//#region Internals

interface UseFieldHookRef<Value> {
  id: string;
  value: Value | undefined;
  enable: boolean;
}

interface UseFieldHookWatchProps<Value> {
  valueRef: React.MutableRefObject<UseFieldHookRef<Value>>;
  rerender: () => void;
}

interface UseFieldHookProps<Value, Result = Value> {
  enable?: boolean | undefined;
  field: Field<any>;
  getValue(): Value;
  shouldRender?(prevValue: Value | undefined, nextValue: Value): boolean;
  watch?(props: UseFieldHookWatchProps<Value>): Field.Unwatch;
  toResult?(value: Value | undefined): Result;
  deps?: DependencyList;
}

function defaultShouldRender<Value>(
  prev: Value | undefined,
  next: Value
): boolean {
  return prev !== next;
}

function useFieldHook<Value, Result = Value>(
  props: UseFieldHookProps<Value, Result>
): Result | undefined {
  // Defaults to true
  // [TODO] Can I use the default value instead of setting it to undefined?
  const enable = props.enable ?? true;

  const {
    field,
    getValue,
    shouldRender = defaultShouldRender,
    watch,
    toResult,
    deps,
  } = props;

  const initial = useMemo(
    () => (enable ? getValue() : undefined),
    [field.id, enable]
  );
  const valueRef = useRef({ id: field.id, value: initial, enable });

  // When the id changes, we update the value
  useEffect(() => {
    if (valueRef.current.id === field.id && valueRef.current.enable === enable)
      return;

    valueRef.current = {
      id: field.id,
      value: enable ? getValue() : undefined,
      enable,
    };
    // We don't need to rerender as the value will resolve to initial and we
    // don't want to trigger another render.
  }, [field.id, enable]);

  function onUpdate() {
    const prevValue = valueRef.current.value;

    const nextValue = getValue();
    valueRef.current = { id: field.id, value: nextValue, enable };

    if (shouldRender(prevValue, nextValue)) rerender();
  }

  const rerender = useRerender();
  useEffect(() => {
    if (enable === false) return;

    return watch?.({ valueRef, rerender }) || field.watch(onUpdate);
  }, [field.id, rerender, enable, ...(deps || [])]);

  // Handle dependencies. When they change, we trigger update.
  const depsInitialized = useRef(false);
  useEffect(() => {
    if (enable === false) return;

    // Prevent unnecessary update on first render
    if (depsInitialized.current) onUpdate();
    else depsInitialized.current = true;
  }, [rerender, enable, ...(deps || [])]);

  // If the ref value id doesn't match the current id, use initial value.
  // Otherwise, use the value from the ref.
  const value =
    valueRef.current.id === field.id && valueRef.current.enable === enable
      ? valueRef.current.value
      : initial;

  const result = enable ? value : undefined;
  // @ts-ignore: [TODO]
  return toResult ? toResult(result) : result;
}

//#endregion
