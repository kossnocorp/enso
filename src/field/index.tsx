"use client";

import { nanoid } from "nanoid";
import React, {
  DependencyList,
  FocusEvent,
  FocusEventHandler,
  MutableRefObject,
  RefCallback,
  useEffect,
  useRef,
} from "react";
import {
  change,
  ChangesEvent,
  fieldChange,
  FieldChange,
  metaChanges,
  shapeChanges,
  shiftChildChanges,
  structuralChanges,
} from "../change/index.ts";
import { EventsTree } from "../events/index.ts";
import { useRerender } from "../hooks/rerender.ts";
import { AsState } from "../state/index.ts";
import type { Enso } from "../types.ts";
import type { EnsoUtils as Utils } from "../utils.ts";
import { ValidationTree } from "../validation/index.ts";
import { AsCollection } from "./collection/index.ts";
import {
  useTypedCallback as useCallback,
  useFieldHook,
  UseFieldHook,
  useTypedMemo as useMemo,
} from "./hook/index.ts";
import { FieldRef } from "./ref/index.ts";
import { fieldDiscriminate } from "./type/index.ts";
import { staticImplements } from "./util.ts";

export { FieldRef };

export * from "./collection/index.ts";
export * from "./transform/index.ts";
export * from "./type/index.ts";

//#region Field

const externalSymbol = Symbol();

const hintSymbol = Symbol();

@staticImplements<AsCollection>()
// TODO: Try making this work or remove:
// Static<typeof Field<unknown>, AsCollection>,
export class Field<Payload>
  implements
    Field.Hint,
    Enso.InterfaceAttributes<Field.InterfaceDef<Payload>>,
    Enso.InterfaceValueRead<Payload>,
    Field.InterfaceValueWrite<Field.InterfaceDef<Payload>>,
    Field.InterfaceTree<Field.InterfaceDef<Payload>>,
    Enso.InterfaceEvents,
    Enso.InterfaceWatch<Field.InterfaceDef<Payload>>,
    Enso.InterfaceMap<Field.InterfaceDef<Payload>>,
    Field.InterfaceComputed<Field.InterfaceDef<Payload>>,
    Field.InterfaceCollection<Field.InterfaceDef<Payload>>,
    Enso.InterfaceSystem
{
  //#region Static

  /**
   * Creates and memoizes a new field instance from the provided initial value.
   * Just like `useState`, it will not recreate the field on the value change.
   *
   * @param initialValue - Initial value of the field.
   * @returns Memoized field instance.
   */
  static use<Value>(
    initialValue: Value,
    // TODO: Add tests
    deps: DependencyList,
  ): Field<Value> {
    const field = useMemo(() => new Field(initialValue), deps);
    useEffect(() => () => field.deconstruct(), [field]);
    return field;
  }

  static Component<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorsEnable extends boolean = false,
    ValidEnable extends boolean = false,
  >(
    props: Field.ComponentProps<
      Payload,
      MetaEnable,
      DirtyEnable,
      ErrorsEnable,
      ValidEnable
    >,
  ): React.ReactNode {
    const { field } = props;
    const value = field.useGet();
    const meta = field.useMeta({
      dirty: props.meta || !!props.dirty,
      errors: props.meta || !!props.errors,
      valid: props.meta || !!props.valid,
    });

    const control = {
      name: field.name,
      value,
      onChange: field.set,
      onBlur: () => field.trigger(change.field.blur, true),
    };

    return props.render(control, meta as any);
  }

  //#endregion

  [hintSymbol] = true as const;

  #id = nanoid();
  #parent?: Field.Parent<any> | undefined;
  #onInput;

  #internal: InternalState<Payload> = new InternalValueState(
    this,
    detachedValue,
  );

  #initial: Payload;

  constructor(value: Payload, parent?: Field.Parent<any>) {
    this.#initial = value;
    this.#parent = parent;

    // NOTE: Parent **must** set before, so that when we setting the children
    // values, the path is already set. If not, they won't properly register in
    // the events tree.
    this.#set(value);

    this.eventsTree.add(this.path, this as any);

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      const value = target.value as Payload;
      this.set(value);
    };

    this.#onInput = <Element extends HTMLElement>(element: Element) => {
      switch (true) {
        case element instanceof HTMLInputElement:
        case element instanceof HTMLTextAreaElement:
        // TODO:
        default:
          return onInput;
      }
    };

    this.set = this.set.bind(this);
    this.ref = this.ref.bind(this);
    this.onBlur = this.onBlur.bind(this);
  }

  deconstruct() {
    this.eventsTree.delete(this.path, this as any);
  }

  #clearCache() {
    this.#cachedGet = detachedValue;
    this.#cachedDirty = undefined;
  }

  //#region Attributes

  get id(): string {
    return this.#id;
  }

  get parent(): Field<unknown> | undefined {
    return this.#parent && "source" in this.#parent
      ? this.#parent.source.parent
      : (this.#parent?.field as Field<unknown> | undefined);
  }

  get key(): string | undefined {
    if (!this.#parent) return;
    return "source" in this.#parent
      ? this.#parent.source.key
      : this.#parent.key;
  }

  get path(): string[] {
    return this.#parent && "source" in this.#parent
      ? this.#parent.source.path
      : this.#parent
        ? [...this.#parent.field.path, this.#parent.key]
        : [];
  }

  static nameFromPath(path: Enso.Path): string {
    return path.join(".") || ".";
  }

  get name(): string {
    return Field.nameFromPath(this.path);
  }

  //#endregion

  //#region Interface

  // static asState<Value>(state: State<Value>): State.StateLike<Value> {
  //   // return this;
  // }

  //#endregion

  //#region Value

  #cachedGet: Payload | DetachedValue = detachedValue;

  get(): Payload {
    if (this.#cachedGet === detachedValue) {
      this.#cachedGet = this.#internal.get();
    }
    return this.#cachedGet;
  }

  useGet<Props extends Enso.UseGetProps | undefined = undefined>(
    props?: Props,
  ): Enso.UseGet<Payload, Props> {
    const watchAllMeta = !!props?.meta;
    const watchMeta = watchAllMeta || props?.valid || props?.dirty;
    const meta = this.useMeta(
      watchAllMeta
        ? undefined
        : {
            dirty: !!props?.dirty,
            errors: !!props?.errors,
            valid: !!props?.valid,
          },
    );

    const getValue = useCallback(
      () => this.get(),
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    const watch = useCallback<UseFieldHook.Watch<Payload>>(
      ({ valueRef, rerender }) =>
        this.watch((payload, event) => {
          // React only on structural changes
          if (!structuralChanges(event.changes)) return;

          valueRef.current = { id: this.id, enable: true, value: payload };
          rerender();
        }),
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    const toResult = useCallback<
      UseFieldHook.ToResult<Payload, Enso.UseGet<Payload, Props>>
    >(
      (result) =>
        (watchMeta ? [result, meta] : result) as Enso.UseGet<Payload, Props>,
      [meta, watchMeta],
    );

    return useFieldHook({
      field: this as Field<any>,
      getValue,
      watch,
      toResult,
    }) as Enso.UseGet<Payload, Props>;
  }

  get initial(): Payload {
    return this.#initial;
  }

  // NOTE: Since `Field.useEnsure` freezes the dummy field but still allows
  // running operations such as `set` albeit with no effect, we need to ensure
  // that `lastChanges` is still assigned correctly, so we must use a static
  // map instead of changing the field instance directly.
  static lastChanges: WeakMap<Field<unknown>, FieldChange> = new WeakMap();

  get lastChanges(): FieldChange {
    // @ts-ignore
    return Field.lastChanges.get(this) || 0n;
  }

  // TODO: Exposing the notify parents flag might be dangerous
  // TODO: Share interface with set
  set<SetValue extends Payload | DetachedValue>(
    value: SetValue,
    notifyParents = true,
  ): Field<SetValue> {
    const changes = this.#set(value);
    if (changes) this.trigger(changes, notifyParents);

    // @ts-ignore
    Field.lastChanges.set(this, changes);
    return this as any;
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

  #cachedDirty: boolean | undefined;

  commit() {
    this.#commit(this.get());

    // const wasDirty = this.dirty;
    // this.#initial = this.get();

    // TODO: Add tests for the new approach, before it was:
    //
    //   if (
    //     this.#internal instanceof InternalObjectState ||
    //     this.#internal instanceof InternalArrayState
    //   ) {
    //     this.#internal.forEach((field: any) => field.commit());
    //   }
    //   if (wasDirty) this.trigger(change.field.commit, true);
    //
    // The problem was is that initial is set to `this.get()` and get
    // a new reference on field level. So a root initial internals have
    // different references than the children's `this.#initial` and produce
    // incorrect `this.dirty` value. The new approach fixes this issue.
    // I found it trying to make the `reset` method work correctly. I couln't
    // reproduce it fully in tests, so it still needs to be done.
  }

  // TODO: Add tests for this new approach
  #commit(newInitial: Payload, notify = true) {
    const wasDirty = notify && this.dirty;

    this.#initial = newInitial;
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    ) {
      this.#internal.each((field: any, key: any) =>
        // @ts-ignore: TODO:
        field.#commit(newInitial[key], notify),
      );
    }
    this.#clearCache();

    if (notify && wasDirty) this.trigger(change.field.commit, true);
  }

  // TODO: Add tests
  reset() {
    const newInitial = this.#initial;
    this.set(newInitial);
    this.#commit(newInitial, false);

    // TODO: Add tests for the new approach, before it was (see `commit`):
    //   this.set(this.#initial);
  }

  /**
   * Paves the field with the provided fallback value if the field is undefined
   * or null. It ensures that the field has a value, which is useful when
   * working with deeply nested optional objects, i.e., settings. It allows
   * creating the necessary fields to assign validation errors to them, even if
   * the parents and the field itself are not set.
   *
   * @param fallback - Fallback value to set if the field is undefined or null.
   *
   * @returns Field without null or undefined value in the type.
   */
  pave(fallback: Utils.NonNullish<Payload>): Field<Utils.NonNullish<Payload>> {
    const value = this.get();
    if (value === undefined || value === null) this.set(fallback);
    return this as Field<Utils.NonNullish<Payload>>;
  }

  //#endregion

  //#region Meta

  get dirty(): boolean {
    if (this.#parent && "source" in this.#parent)
      return this.#parent.source.dirty;

    if (this.#cachedDirty === undefined)
      this.#cachedDirty = this.#internal.dirty(this.#initial);
    return this.#cachedDirty;
  }

  useDirty<Enable extends boolean | undefined = undefined>(
    enable?: Enable,
  ): Enso.ToggleableResult<Enable, boolean> {
    const getValue = useCallback(
      () => this.dirty,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue,
    }) as Enso.ToggleableResult<Enable, boolean>;
  }

  useMeta<Props extends Enso.UseMetaProps | undefined = undefined>(
    props?: Props,
  ): Enso.Meta<Props> {
    const valid = this.useValid(!props || !!props.valid);
    const errors = this.useErrors(!props || !!props.errors);
    const dirty = this.useDirty(!props || !!props.dirty);
    return { valid, errors, dirty } as Enso.Meta<Props>;
  }

  //#endregion

  //#region Tree

  get root(): Field<unknown> {
    return this.#parent && "source" in this.#parent
      ? this.#parent.source.root
      : this.#parent?.field.root || (this as any as Field<unknown>);
  }

  get $(): Field.$<Payload> {
    return this.#internal.$();
  }

  // @ts-ignore: DO
  at<Key extends keyof Payload>(key: Key): Field.At<Payload, Key> {
    if (
      this.#internal instanceof InternalObjectState ||
      this.#internal instanceof InternalArrayState
    )
      // @ts-ignore: TODO:
      return this.#internal.at(key);
    // DO:
    // throw new Error(
    //   `Field at ${this.path.join(".")} is not an object or array`,
    // );
  }

  try(): Enso.TryUnion<Field.InterfaceDef<Payload>>;

  try<Key extends keyof Utils.NonNullish<Payload>>(
    key: Key,
  ): Field.TryKey<Field.InterfaceDef<Payload>, Key>;

  try(key?: any): any {
    return this.#internal.try(key);
  }

  lookup(path: Enso.Path): Field<unknown> | undefined {
    return this.#internal.lookup(path);
  }

  //#endregion

  //#region Events

  #batchTarget = new EventTarget();
  #syncTarget = new EventTarget();
  #subs = new Set<(event: Event) => void>();

  #eventsTree: EventsTree | undefined;

  get eventsTree(): EventsTree {
    return (this.root.#eventsTree ??= new EventsTree());
  }

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
    } else {
      ChangesEvent.batch(this.#batchTarget, changes);
      // TODO: Add tests for this
      this.#syncTarget.dispatchEvent(new ChangesEvent(changes));
    }

    // If the updates should flow upstream, trigger parents too
    if (
      notifyParents &&
      this.#parent &&
      "field" in this.#parent &&
      this.#parent.field
    )
      this.#parent.field.#childTrigger(changes, this.#parent.key);
  }

  #childTrigger(childChanges: FieldChange, key: string) {
    let changes =
      // Shift child's field changes into child/subtree range
      shiftChildChanges(childChanges) |
      // Apply field changes
      this.#internal.childUpdate(childChanges, key);

    // Apply shape change
    changes |= shapeChanges(changes);

    this.trigger(changes, true);
  }

  #withholded: [FieldChange, boolean] | undefined;

  /**
   * Withholds the field changes until `unleash` is called. It allows to batch
   * changes when submittiing a form and send the submitting even to the field
   * along with the submitting state.
   *
   * TODO: I added automatic batching of changes, so all the changes are send
   * after the current stack is cleared. Check if this functionality is still
   * needed.
   */
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

  //#region Watch

  watch(callback: Enso.WatchCallback<Payload>, sync = false): Enso.Unwatch {
    // TODO: Add tests for this
    const target = sync ? this.#syncTarget : this.#batchTarget;
    const handler = (event: Event) => {
      callback(this.get(), event as ChangesEvent);
    };

    this.#subs.add(handler);
    target.addEventListener("change", handler);

    return () => {
      this.#subs.delete(handler);
      target.removeEventListener("change", handler);
    };
  }

  useWatch(callback: Enso.WatchCallback<Payload>): void {
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
    // TODO: Add tests for this
    this.#subs.forEach((sub) => {
      this.#batchTarget.removeEventListener("change", sub);
      this.#syncTarget.removeEventListener("change", sub);
    });
    this.#subs.clear();
    this.#internal.unwatch();
  }

  useBind(): Field.Bound<Payload> {
    const rerender = useRerender();

    useEffect(
      () =>
        this.watch((_, event) => {
          if (shapeChanges(event.changes)) rerender();
        }),
      [this.id, rerender],
    );

    return this as unknown as Field.Bound<Payload>;
  }

  //#endregion

  //#region Map

  useCompute<Computed>(
    callback: Enso.ComputeCallback<Payload, Computed>,
    deps: DependencyList,
  ): Computed {
    const getValue = useCallback(
      () => callback(this.get()),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
      [this, ...deps],
    );

    return useFieldHook({
      field: this as Field<any>,
      getValue,
    }) as Computed;
  }

  narrow<Narrowed extends Payload>(
    callback: Field.NarrowCallback<Payload, Narrowed>,
  ): Field<Narrowed> | undefined {
    let matching = false;
    const payload = this.get();
    // @ts-ignore: TODO:
    callback(payload, (narrowed) => {
      // @ts-ignore: TODO:
      if (payload === narrowed) matching = true;
      return {};
    });
    // @ts-ignore: TODO:
    if (matching) return this;
  }

  useNarrow<Narrowed extends Payload>(
    callback: Field.NarrowCallback<Payload, Narrowed>,
    // TODO: Add tests
    deps: DependencyList,
  ): Field<Narrowed> | undefined {
    const getValue = useCallback(
      () => this.narrow(callback),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
      [this, ...deps],
    );

    return useFieldHook({
      field: this as Field<any>,
      getValue,
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
  static useEnsure<Payload, Result = undefined>(
    field: Field<Payload> | Utils.Falsy,
    map?: Field.MapField<Payload, Result>,
  ): Result extends undefined
    ? Field<Payload | undefined>
    : Field<Result | undefined> {
    const dummy = Field.use(undefined, []);
    const frozenDummy = useMemo(() => Object.freeze(dummy), [dummy]);
    const mappedField = (map && field && map(field)) || field;
    // @ts-ignore: TODO:
    return (mappedField || frozenDummy) as Field<Payload | undefined>;
  }

  /**
   * Widens the field type, adding the provided type to the payload type. It
   * returns the same field instance. It is useful when passing as an argument
   * that expects a wider type.
   *
   * Despite TypeScript not allowing passing `Field<A>` as `Field<A | B>`,
   * it is safe to widen the field type this way.
   *
   * @typeparam Wide - The type to widen the field to.
   *
   * @returns The same field instance with `Widening` added to the payload type.
   */
  // TODO: Research if it's possible to make TypeScript accept wider paths.
  widen<Wide>(): Field<Payload | Wide> {
    return this as Field<Payload | Wide>;
  }

  //#endregion

  //#region Computed

  /**
   * Initiates a computed field builder. It accepts mapper function that
   * transforms the current field value into another.
   *
   * The returned builder {@link IntoObj} with `from` method allows to define how
   * the computed value is transformed back into the original and returns
   * the computed field.
   *
   * @param mapper - Mapper function computing new value from field value
   *
   * @returns Builder object with `from` method
   */
  into<ComputedValue>(
    intoMapper: Field.IntoCallback<Payload, ComputedValue>,
  ): Field.IntoObj<Payload, ComputedValue> {
    return {
      from: (fromMapper) => new ComputedField(this, intoMapper, fromMapper),
    };
  }

  // TODO: Add tests
  useInto<Computed>(
    intoCallback: Field.IntoCallback<Payload, Computed>,
    intoDeps: DependencyList,
  ): Field.IntoHook<Payload, Computed> {
    const from = useCallback<Field.FromHook<Payload, Computed>>(
      (fromCallback, fromDeps) => {
        const computed = useMemo(
          () => new ComputedField(this, intoCallback, fromCallback),
          // eslint-disable-next-line react-hooks/exhaustive-deps -- We control `intoMapper` and `fromMapper` via `intoDeps` and `fromDeps`.
          [this, ...intoDeps, ...fromDeps],
        );
        useEffect(() => computed.deconstruct.bind(computed), [computed]);
        return computed;
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps -- We control `intoMapper` via `intoDeps`
      [this, ...intoDeps],
    );
    return useMemo(() => ({ from }), [from]);
  }

  //#endregion

  //#region Collection

  static asCollection<Value>(field: Field<Value>): AsCollection.Result<Value> {
    if (
      field.#internal instanceof InternalObjectState ||
      field.#internal instanceof InternalArrayState
    )
      return field.#internal as any;
  }

  static asArray<Value>(
    field: Field<Value>,
  ): AsCollection.AsArrayResult<Value> {
    if (field.#internal instanceof InternalArrayState)
      return field.#internal as any;
  }

  static asObject<Value>(
    field: Field<Value>,
  ): AsCollection.AsObjectResult<Value> {
    if (field.#internal instanceof InternalObjectState)
      return field.#internal as any;
  }

  static asChild<Value>(
    field: Field<Value>,
  ): AsCollection.AsChildResult<Value> {
    return field.#internal as any;
  }

  static asState<Value>(
    field: Field<Value>,
  ): AsState.ReadWriteResult<Value> | undefined {
    return field as any;
  }

  static fromField<Value>(
    field: Field<Value> | undefined,
  ): Field<Value> | undefined {
    return field;
  }

  static remove<Value>(
    field: Field<Value>,
    key?: keyof Value | undefined,
  ): Field<DetachedValue> {
    if (key === undefined) return field.set(detachedValue, true);
    return Field.remove(field.at(key as any) as any);
  }

  //#endregion

  //#region Control

  control<Element extends HTMLElement>(
    props?: Field.InputProps<Element>,
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
  #elementUnwatch: Enso.Unwatch | undefined;
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
        // TODO: Watch for changes and set the value
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

  // TODO: Consider caching errors.
  // #cachedErrors: Field.Error[] | undefined = undefined;

  get errors(): Field.Error[] {
    // if (this.#cachedErrors)return this.#cachedErrors;
    // return (this.#cachedErrors = this.validation.at(this.path));
    return this.validationTree.at(this.path);
  }

  useErrors<Enable extends boolean | undefined = undefined>(
    enable?: Enable,
  ): Enable extends true | undefined ? Field.Error[] | undefined : undefined {
    const getValue = useCallback(
      () => this.errors,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    const shouldRender = useCallback<UseFieldHook.ShouldRender<Field.Error[]>>(
      (prev, next) =>
        !(
          next === prev ||
          (next.length === prev?.length &&
            next.every((error, index) => prev?.[index] === error))
        ),
      [],
    );

    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue,
      shouldRender,
    });
  }

  static errorChangesFor(wasValid: boolean): FieldChange {
    let changes = change.field.errors;
    if (wasValid) changes |= change.field.invalid;
    return changes;
  }

  static normalizeError(error: string | Field.Error): Field.Error {
    return typeof error === "string" ? { message: error } : error;
  }

  addError(error: string | Field.Error) {
    const changes = Field.errorChangesFor(this.valid);
    this.validationTree.add(this.path, Field.normalizeError(error));
    this.eventsTree.trigger(this.path, changes);
  }

  clearErrors() {
    if (this.valid) return;
    const errors = this.validationTree.nested(this.path);

    // First, we clear all errors, so that when we trigger changes, sync
    // handlers don't see the errors.
    // TODO: Add test for this case
    this.validationTree.clear(this.path);

    const errorsByPaths = Object.groupBy(errors, ([path]) =>
      Field.nameFromPath(path),
    );

    const clearChanges = change.field.errors | change.field.valid;

    Object.values(errorsByPaths).forEach((group) => {
      const path = group?.[0]?.[0];
      if (!path) return;
      this.eventsTree.trigger(path, clearChanges);
    });
  }

  /**
   * True if the field and its children have no validation errors.
   */
  get valid(): boolean {
    // TODO: Figure out if caching is needed here
    return !this.validationTree.nested(this.path).length;
  }

  useValid<Enable extends boolean | undefined = undefined>(
    enable?: Enable,
  ): Enso.ToggleableResult<Enable, undefined> {
    const getValue = useCallback(
      () => this.valid,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    return useFieldHook({
      enable,
      field: this as Field<any>,
      getValue,
    });
  }

  //#endregion

  //#region Validation

  #validation: ValidationTree | undefined = undefined;

  get validationTree(): ValidationTree {
    return (this.root.#validation ??= new ValidationTree());
  }

  validate<Context>(
    validator: Field.Validator<Payload, Context>,
    context: Context,
  ): Promise<void>;

  validate(
    validator: Field.Validator<Payload, undefined>,
    context?: undefined,
  ): Promise<void>;

  /**
   * Validates the field using the provided validator function.
   * It clears all the previous errors and withholds any changes until
   * the validation is resolved.
   */
  async validate<Context>(
    validator: Field.Validator<Payload, undefined>,
    context?: Context | undefined,
  ) {
    this.clearErrors();
    // Withhold all the changes until the validation is resolved, so that
    // there're no chain reactions.
    // TODO: There's a problem with this approach, if the validation is async,
    // and hits external APIs, form interactions might not react as expected and
    // even lead to impossible state. Either block the form or make withhold
    // optional.
    this.withhold();
    // @ts-ignore: TODO:
    await validator(FieldRef.get(this), context);
    this.unleash();
  }

  //#endregion

  //#region External

  #external = {
    move: (newKey: string) => {
      always(this.#parent && "field" in this.#parent);
      const prevPath = this.path;
      this.#parent.key = newKey;
      this.eventsTree.move(prevPath, this.path, this as any);
      return this.trigger(fieldChange.key);
    },

    create: (value: Payload): FieldChange => {
      const changes = this.#set(value) | change.field.attach;
      this.trigger(changes, false);
      return changes;
    },

    clear: () => {
      this.#set(undefined as Payload);
    },
  };

  get [externalSymbol]() {
    return this.#external;
  }

  //#endregion
}

export namespace Field {
  //#region Interfaces

  export interface Hint {
    [hintSymbol]: true;
  }

  export type InterfaceDef<Payload> = {
    Payload: Payload;
    Unknown: Field<unknown>;
    NonNullish: Field<Utils.NonNullish<Payload>>;
    Bound: Bound<Payload>;
  };

  export interface InterfaceValueWrite<Def extends Enso.InterfaceDef>
    extends Enso.InterfaceValueWrite<Def> {
    set<SetValue extends Def["Payload"] | DetachedValue>(
      value: SetValue,
      notifyParents?: boolean,
    ): Field<SetValue>;
  }

  export interface InterfaceTree<Def extends Enso.InterfaceDef>
    extends Enso.InterfaceTree<Def> {
    get $(): $<Def["Payload"]>;

    at<Key extends keyof Def["Payload"]>(key: Key): At<Def["Payload"], Key>;

    try(): Enso.TryUnion<Def>;

    try<Key extends keyof Utils.NonNullish<Def["Payload"]>>(
      key: Key,
    ): Field.TryKey<Field.InterfaceDef<Def["Payload"]>, Key>;
  }

  export interface InterfaceMap<Def extends Enso.InterfaceDef>
    extends Enso.InterfaceMap<Def> {
    // DO: Figure out variants-returned methods!
    //
    // decompose(): Decomposed<Def["Payload"]>;
    //
    // useDecompose(
    //   callback: DecomposeCallback<Def["Payload"]>,
    //   deps: DependencyList,
    // ): Decomposed<Def["Payload"]>;
    //
    // discriminate<Discriminator extends keyof Utils.NonUndefined<Def["Payload"]>>(
    //   discriminator: Discriminator,
    // ): Field.Discriminated<Def["Payload"], Discriminator>;
    //
    // useDiscriminate<
    //   Discriminator extends Field.DiscriminatorKey<Def["Payload"]>,
    // >(
    //   discriminator: Discriminator,
    // ): Field.Discriminated<Def["Payload"], Discriminator>;
    //
    // narrow<Narrowed extends Def["Payload"]>(
    //   callback: NarrowCallback<Def["Payload"], Narrowed>,
    // ): Field<Narrowed> | undefined;
    //
    // useNarrow<Narrowed extends Def["Payload"]>(
    //   callback: NarrowCallback<Def["Payload"], Narrowed>,
    //   // TODO: Add tests
    //   deps: DependencyList,
    // ): Field<Narrowed> | undefined;
    //
    // widen<Wide>(): Field<Def["Payload"] | Wide>;
  }

  export interface InterfaceComputed<Def extends Enso.InterfaceDef>
    extends Enso.InterfaceComputed {
    into<ComputedValue>(
      intoMapper: IntoCallback<Def["Payload"], ComputedValue>,
    ): Field.IntoObj<Def["Payload"], ComputedValue>;

    useInto<Computed>(
      intoMapper: IntoCallback<Def["Payload"], Computed>,
      intoDeps: DependencyList,
    ): Field.IntoHook<Def["Payload"], Computed>;
  }

  export interface InterfaceCollection<Def extends Enso.InterfaceDef>
    extends Enso.InterfaceCollection {
    // forEach: Field.ForEachFn<Def["Payload"]>;
  }

  //#endregion

  //#region Properties

  export type Detachable<Value> = Enso.Detachable<Field<Value>>;

  export type Tried<Value> = Enso.Tried<Field<Value>>;

  export type Bound<Value> = Enso.Bound<Field<Value>>;

  export type Branded<Value, Flags extends Enso.Flags> = Enso.Branded<
    Field<Value>,
    Flags
  >;

  //#endregion

  //#region Tree

  export type Parent<Payload> = ParentDirect<Payload> | ParentSource<Payload>;

  export interface ParentDirect<Payload> {
    key: string;
    field: Field<Payload>;
  }

  export interface ParentSource<Payload> {
    source: Field<Payload>;
  }

  export type $<Payload> = Payload extends object ? $Object<Payload> : never;

  export type $Object<Payload> = {
    [Key in keyof Payload]-?: Utils.IsStaticKey<Payload, Key> extends true
      ? Utils.IsOptionalKey<Payload, Key> extends true
        ? Enso.Detachable<Field<Payload[Key]>>
        : Field<Payload[Key]>
      : Enso.Detachable<Field<Payload[Key] | undefined>>;
  };

  export type At<Payload, Key extends keyof Payload> =
    Utils.IsStaticKey<Payload, Key> extends true
      ? Utils.IsOptionalKey<Payload, Key> extends true
        ? Enso.Detachable<Field<Payload[Key]>>
        : Field<Payload[Key]>
      : Enso.Detachable<Field<Payload[Key] | undefined>>;

  export type TryKey<
    Def extends Enso.InterfaceDef,
    Key extends keyof Utils.NonNullish<Def["Payload"]>,
  > =
    | Enso.TryUnion<InterfaceDef<Utils.NonNullish<Def["Payload"]>[Key]>>
    // Add undefined if the key is not static (i.e. a record key).
    | (Utils.IsStaticKey<Utils.NonNullish<Def["Payload"]>, Key> extends true
        ? never
        : undefined);

  //#endregion

  //#region Type

  export type Every<Value> =
    // Handle boolean separately, so it doesn't produce Field<true> | Field<false>
    | (boolean extends Value ? Field<boolean> : never)
    | (Exclude<Value, boolean> extends infer Value
        ? Value extends Value
          ? Field<Value>
          : never
        : never);

  export type EveryValueUnion<FieldType> =
    FieldType extends Field<infer Value> ? Value : never;

  export type DiscriminateResult<
    FieldType,
    Discriminator extends keyof Utils.NonUndefined<EveryValueUnion<FieldType>>,
  > = DiscriminatedInner<EveryValueUnion<FieldType>, FieldType, Discriminator>;

  export type Discriminated<
    Value,
    Discriminator extends keyof Utils.NonUndefined<Value>,
  > = DiscriminatedInner<Value, Value, Discriminator>;

  export type DiscriminatedInner<
    Payload,
    BrandsSource,
    Discriminator extends keyof Utils.NonUndefined<Payload>,
  > = Payload extends Payload
    ? Discriminator extends keyof Payload
      ? Payload[Discriminator] extends infer DiscriminatorValue
        ? DiscriminatorValue extends Payload[Discriminator]
          ? {
              discriminator: DiscriminatorValue;
              field: Enso.TransferBrands<Field<Payload>, BrandsSource>;
            }
          : never
        : never
      : // Add the payload type without the discriminator (i.e. undefined)
        {
          discriminator: undefined;
          field: Enso.TransferBrands<Field<Payload>, BrandsSource>;
        }
    : never;

  export type DiscriminatorFor<FieldType> = keyof Utils.NonUndefined<
    EveryValueUnion<FieldType>
  >;

  export type DiscriminatorKey<Payload> = keyof Utils.NonUndefined<Payload>;

  //#endregion

  //#region Transform

  export type NarrowCallback<Payload, Narrowed> = (
    payload: Payload,
    wrap: NarrowWrap,
  ) => NarrowWrapper<Narrowed> | Utils.Falsy;

  export type NarrowWrap = <Payload>(
    payload: Payload,
  ) => NarrowWrapper<Payload>;

  export type NarrowWrapper<Payload> = {
    [narrowBrapperBrand]: Payload;
  };

  declare const narrowBrapperBrand: unique symbol;

  export type Ensured<Payload> = [
    Field<Payload | undefined>,
    Readonly<Field<undefined>>,
  ];

  export type MapField<Payload, Return> = (
    field: Field<Payload>,
  ) => Field<Return>;

  //#endregion

  //#region Computed

  export interface IntoObj<Value, ComputedValue> {
    from: FromFn<Value, ComputedValue>;
  }

  export interface IntoHook<Value, ComputedValue> {
    from: FromHook<Value, ComputedValue>;
  }

  /**
   * Creates a computed field. It accepts mapper function that transforms
   * the computed value into original value.
   *
   * @param mapper - Mapper function computing original value from computed
   *
   * @returns Computed field
   */
  export interface FromFn<Value, ComputedValue> {
    (
      mapper: FromCallback<Value, ComputedValue>,
    ): ComputedField<Value, ComputedValue>;
  }

  /**
   * Creates a computed field. It accepts mapper function that transforms
   * the computed value into original value.
   *
   * @param mapper - Mapper function computing original value from computed
   * @param deps - Dependency list for the mapper function.
   *
   * @returns Computed field
   */
  export interface FromHook<Value, ComputedValue> {
    (
      mapper: FromCallback<Value, ComputedValue>,
      deps: DependencyList,
    ): ComputedField<Value, ComputedValue>;
  }

  export type IntoCallback<Value, ComputedValue> = (
    value: Value,
    computedValue: ComputedValue | undefined,
  ) => ComputedValue;

  export type FromCallback<Value, ComputedValue> = (
    computedValue: ComputedValue,
    value: Value,
  ) => Value;

  //#endregion

  //#region Collection

  // Tuple

  // NOTE: We have to have two separate overloads for tuples
  // `CollectionCallbackTuplePair` and `CollectionCallbackTupleSingle` as with
  // the current approach binding the key and value in the arguments on the type
  // level, TypeScript fails to find the correct overload for when the callback
  // accepts a single argument (i.e. just the item field).

  export type CollectionCallbackTuplePair<
    Value extends Utils.Tuple,
    Result = void,
  > = (
    ...args: {
      [Key in Utils.IndexOfTuple<Value>]: [Field<Value[Key]>, Key];
    }[Utils.IndexOfTuple<Value>]
  ) => Result;

  export type CollectionCallbackTupleSingle<
    Value extends Utils.Tuple,
    Result = void,
  > = (item: Every<Value[Utils.IndexOfTuple<Value>]>) => Result;

  // Array

  export type CollectionCallbackArray<
    Value extends Array<unknown>,
    Result = void,
  > = (item: CollectionCallbackArrayItem<Value>, index: number) => Result;

  export type CollectionCallbackArrayItem<Value extends Array<unknown>> =
    Value extends Array<infer ItemValue> ? Detachable<ItemValue> : never;

  // Object

  // NOTE: We have to have two separate overloads for objects
  // `CollectionCallbackObjectPair` and `CollectionCallbackObjectSingle` as with
  // the current approach binding the key and value in the arguments on the type
  // level, TypeScript fails to find the correct overload for when the callback
  // accepts a single argument (i.e. just the item field).

  export type CollectionCallbackObjectPair<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    ...args: Exclude<
      { [Key in keyof Value]: [Field<Value[Key]>, Key] }[keyof Value],
      undefined
    >
  ) => Result;

  export type CollectionCallbackObjectSingle<
    Value extends object,
    Result = void,
  > = (
    // Exclude is needed to remove undefined that appears when there're optional
    // fields in the object.
    item: Exclude<
      { [Key in keyof Value]: Field<Value[Key]> }[keyof Value],
      undefined
    >,
  ) => Result;

  //

  export type AsCollection<Value> =
    Value extends Array<any>
      ? InternalArrayState<Value>
      : Value extends object
        ? InternalObjectState<Value>
        : undefined;

  export type AsArray<Value> =
    Value extends Array<any> ? InternalArrayState<Value> : undefined;

  export type Predicate<ItemValue> = (
    item: Enso.Detachable<Every<ItemValue>>,
    index: number,
  ) => unknown;

  export type ItemResultArray<ItemValue> = Enso.Detachable<Every<ItemValue>>;

  export type ItemResultObject<Value extends object> =
    // Remove undefined that sneaks in
    Exclude<
      // Use mapped type to preserve Type | undefined for optional fields
      { [Key in keyof Value]: Field<Value[Key]> }[keyof Value],
      undefined
    >;

  //#endregion

  //#region Input

  export type ComponentProps<
    Payload,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorsEnable extends boolean = false,
    ValidEnable extends boolean = false,
  > = {
    field: Field<Payload>;
    render: InputRender<
      Payload,
      MetaEnable extends true
        ? undefined
        : MetaEnable extends false
          ? {
              valid: false;
              errors: false;
              dirty: false;
            }
          : {
              valid: ValidEnable;
              errors: ErrorsEnable;
              dirty: DirtyEnable;
            }
    >;
    meta?: MetaEnable;
    dirty?: DirtyEnable;
    errors?: ErrorsEnable;
    valid?: ValidEnable;
  };

  export type InputRender<
    Payload,
    InputMetaProps extends Enso.UseMetaProps | undefined,
  > = (
    input: Input<Payload>,
    meta: Enso.Meta<InputMetaProps>,
  ) => React.ReactNode;

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

// export const isBrandedSymbol = Symbol("isBranded");

export class IsBranded<Value> {
  constructor(public readonly value: Value) {}
}

// export type IsBranded<Type> = Type & { [isBrandedSymbol]: true };

//#endregion

//#region Field Declarations

declare module "./collection/index.ts" {
  // `fieldEach`

  interface FieldEach {
    // Tuple

    <Value extends Utils.Tuple>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackTuplePair<Value>,
    ): void;

    <Value extends Utils.Tuple>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackTupleSingle<Value>,
    ): void;

    // Array

    <Value extends unknown[]>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackArray<Value>,
    ): void;

    // Object

    <Value extends object>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackObjectPair<Value>,
    ): void;

    <Value extends object>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackObjectSingle<Value>,
    ): void;
  }

  // `fieldMap`

  interface FieldMap {
    // Array

    <Value extends Array<unknown>, Result>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackArray<Value, Result>,
    ): Result[];

    // Object

    <Value extends object, Result>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackObjectPair<Value, Result>,
    ): Result[];

    <Value extends object, Result>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.CollectionCallbackObjectSingle<Value, Result>,
    ): Result[];
  }

  // `fieldSize`

  interface FieldSize {
    <Value extends Array<unknown>>(field: Field<Value>): number;

    <Value extends object>(field: Field<Value>): number;
  }

  // `fieldFind`

  interface FieldFind {
    // Array

    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      predicate: Field.Predicate<ItemValue>,
    ): Field.ItemResultArray<ItemValue> | undefined;

    // Object

    <Value extends object>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      predicate: Field.CollectionCallbackObjectPair<Value, unknown>,
    ): Field.ItemResultObject<Value> | undefined;

    <Value extends object>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      predicate: Field.CollectionCallbackObjectSingle<Value, unknown>,
    ): Field.ItemResultObject<Value> | undefined;
  }

  // `fieldFilter`

  interface FieldFilter {
    // Array

    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      callback: Field.Predicate<ItemValue>,
    ): Field.ItemResultArray<ItemValue>[];

    // Object

    <Value extends object>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      predicate: Field.CollectionCallbackObjectPair<Value, unknown>,
    ): Field.ItemResultObject<Value>[];

    <Value extends object>(
      field: Field<Value> | Utils.Nullish<Enso.Tried<Field<Value>>>,
      predicate: Field.CollectionCallbackObjectSingle<Value, unknown>,
    ): Field.ItemResultObject<Value>[];
  }

  // `fieldPush`

  interface FieldPush {
    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Field<Value>,
      item: ItemValue,
    ): Field.Detachable<ItemValue>;

    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Enso.Tried<Field<Value>> | undefined | null,
      item: ItemValue,
    ): Field.Detachable<ItemValue>;
  }

  // `fieldInsert`

  interface FieldInsert {
    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Field<Value>,
      index: number,
      item: ItemValue,
    ): Field.Detachable<ItemValue>;

    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Enso.Tried<Field<Value>> | undefined | null,
      index: number,
      item: ItemValue,
    ): Field.Detachable<ItemValue>;
  }

  // `fieldRemove`

  interface FieldRemove {
    // Array

    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Field<Value>,
      item: ItemValue,
    ): Field.Detachable<DetachedValue>;

    <Value extends Array<unknown>, ItemValue extends Value[number]>(
      field: Enso.Tried<Field<Value>> | undefined | null,
      item: ItemValue,
    ): Field.Detachable<DetachedValue>;

    // Object

    <Value extends object, Key extends Enso.DetachableKeys<Value>>(
      field: Field<Value>,
      key: Key,
    ): Field.Detachable<DetachedValue>;

    <Value extends object, Key extends Enso.DetachableKeys<Value>>(
      field: Enso.Tried<Field<Value>> | undefined | null,
      key: Key,
    ): Field.Detachable<DetachedValue>;

    // Self

    <Value>(
      field: Enso.Detachable<Field<Value>>,
    ): Field.Detachable<DetachedValue>;

    <Value>(
      field: Enso.Tried<Enso.Detachable<Field<Value>>> | undefined | null,
    ): Field.Detachable<DetachedValue>;
  }
}

declare module "./type/index.ts" {
  // `fieldDiscriminate`

  interface FieldDiscriminate {
    <
      FieldType extends Field.Hint,
      Discriminator extends Utils.NonUndefined<
        Field.DiscriminatorFor<FieldType>
      >,
    >(
      field: FieldType,
      discriminator: Discriminator,
    ): Field.DiscriminateResult<FieldType, Discriminator>;
  }

  // `useFieldDiscriminate`

  interface UseFieldDiscriminate {
    <
      FieldType extends Field.Hint,
      Discriminator extends Utils.NonUndefined<
        Field.DiscriminatorFor<FieldType>
      >,
    >(
      field: FieldType,
      discriminator: Discriminator,
    ): Field.DiscriminateResult<FieldType, Discriminator>;
  }
}

//#endregion

//#region ComputedField

// NOTE: We have to keep `ComputedField` in the same file as `Field` to avoid
// circular dependencies, as it extends `Field` and `Field` uses it in its
// `into` method.

export class ComputedField<Payload, Computed> extends Field<Computed> {
  #source: Field<Payload>;
  #brand: symbol = Symbol();
  #into: Field.IntoCallback<Payload, Computed>;
  #from: Field.FromCallback<Payload, Computed>;
  #unsubs: Enso.Unwatch[] = [];

  constructor(
    source: Field<Payload>,
    into: Field.IntoCallback<Payload, Computed>,
    from: Field.FromCallback<Payload, Computed>,
  ) {
    const payload = into(source.get(), undefined);
    super(payload, { source: source as any });

    this.#source = source;
    this.#into = into;
    this.#from = from;

    // Add itself to the computed map, so that we can find it later by the path,
    // i.e. for validation through maybe references.
    // this.computedMap.add(this as any as ComputedField<unknown, unknown>);

    // Watch for the field (source) and update the computed value
    // on structural changes.
    this.#unsubs.push(
      this.#source.watch(
        (sourceValue, sourceEvent) => {
          // Check if the change was triggered by the computed value and ignore
          // it to stop circular updates.
          if (sourceEvent.context[this.#brand]) return;

          // Update the computed value if the change is structural.
          // TODO: Tests
          if (structuralChanges(sourceEvent.changes)) {
            // TODO: Second argument is unnecessary expensive and probably can
            // be replaced with simple field.
            this.set(this.#into(sourceValue, this.get()));
          }
        },
        // TODO: Add tests and rationale for this. Without it, though, when
        // rendering collection settings in Mind Control and disabling a package
        // that triggers rerender and makes the computed field set to initial
        // value. The culprit is "Prevent extra mapper call" code above that
        // resets parent computed field value before it gets a chance to update.
        true,
      ),
    );

    // Listen for the computed field changes and update the field
    // (source) value.
    this.#unsubs.push(
      this.watch(
        (computedValue, computedEvent) => {
          // Check if the change was triggered by the source value and ignore it
          // to stop circular updates.
          if (computedEvent.context[this.#brand]) return;

          // Set context so we can know if the field change was triggered by
          // the computed value and stop circular updates.
          ChangesEvent.context({ [this.#brand]: true }, () => {
            // If there are structural changes, update the source field.
            // // TODO: Tests
            if (structuralChanges(computedEvent.changes)) {
              // TODO: Second argument is unnecessary expensive and probably can
              // be replaced with simple field.
              this.#source.set(this.#from(computedValue, this.#source.get()));
            }

            // Trigger meta changes.
            // TODO: Add tests and rationale for this.
            const computedMetaChanges = metaChanges(computedEvent.changes);
            if (computedMetaChanges) {
              this.#source.trigger(
                computedMetaChanges,
                // TODO: Add tests and rationale for this (see a todo above).
                true,
              );
            }
          });
        },
        // TODO: Add tests and rationale for this (see a todo above).
        true,
      ),
    );
  }

  override deconstruct() {
    Field.prototype.deconstruct.call(this);
    this.#unsubs.forEach((unsub) => unsub());
    this.#unsubs = [];
  }

  //#region Computed

  connect(source: Field<Payload>): void {
    this.#source = source;
  }

  //#endregion
}

export namespace ComputedField {}

//#endregion

//#region InternalState

export abstract class InternalState<Payload> {
  static detect(
    value: any,
  ):
    | typeof InternalArrayState
    | typeof InternalObjectState
    | typeof InternalValueState {
    if (value !== null && typeof value === "object" && value !== detachedValue)
      return Array.isArray(value)
        ? InternalArrayState
        : Object.prototype.toString.call(value) === "[object Object]"
          ? InternalObjectState
          : InternalValueState;
    return InternalValueState;
  }

  #external: Field<Payload>;

  constructor(field: Field<Payload>, _value: Payload | DetachedValue) {
    this.#external = field;
  }

  abstract unwatch(): void;

  abstract set(value: Payload | DetachedValue): FieldChange;

  abstract get(): Payload;

  //#region Tree

  abstract $(): Field.$<Payload>;

  try(): Enso.TryUnion<Field.InterfaceDef<Payload>>;

  try<Key extends keyof Payload>(
    key: Key,
  ): Field.TryKey<Field.InterfaceDef<Payload>, Key>;

  try(): any {
    const value = this.get();
    if (value === undefined || value === null) return value;
    return this.external;
  }

  abstract lookup(path: Enso.Path): Field<unknown> | undefined;

  //#endregion

  childUpdate(type: FieldChange, _key: string): FieldChange {
    return type;
  }
  abstract dirty(value: Payload): boolean;

  protected get external() {
    return this.#external;
  }

  abstract withhold(): void;

  abstract unleash(): void;

  detached(): boolean {
    return false;
  }

  discriminate<Discriminator extends keyof Utils.NonUndefined<Payload>>(
    discriminator: Discriminator,
  ): Field.Discriminated<Payload, Discriminator> {
    return {
      // @ts-ignore: TODO:
      discriminator: this.external.$?.[discriminator]?.get(),
      field: this.external,
    } as any;
  }
}

//#endregion

//#region InternalValueState

export class InternalValueState<Payload> extends InternalState<Payload> {
  #value: Payload | DetachedValue;

  constructor(field: Field<Payload>, value: Payload | DetachedValue) {
    super(field, value);
    this.#value = value;
  }

  set(value: Payload): FieldChange {
    let changes = 0n;
    if (this.#value === detachedValue && value !== detachedValue)
      changes |= change.field.attach;
    else if (this.#value !== detachedValue && value === detachedValue)
      changes |= change.field.detach;
    else if (
      typeof this.#value !== typeof value ||
      (this.#value &&
        typeof this.#value === "object" &&
        Object.getPrototypeOf(this.#value) !== Object.getPrototypeOf(value))
    )
      changes |= change.field.type;
    else if (this.#value !== value) changes |= change.field.value;

    if (this.#value !== value) this.#value = value;

    return changes;
  }

  get(): Payload {
    return this.#value === detachedValue ? (undefined as Payload) : this.#value;
  }

  remove(): Field<DetachedValue> {
    return Field.remove(this.external);
  }

  //#region Tree

  $(): Field.$<Payload> {
    return undefined as unknown as Field.$<Payload>;
  }

  lookup(path: Enso.Path): Field<unknown> | undefined {
    if (path.length === 0) return this.external as any;
    return undefined;
  }

  //#endregion

  unwatch() {}

  dirty(initial: Payload): boolean {
    return initial !== this.#value;
  }

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
    // @ts-ignore: TODO:
    this.#undefined = new UndefinedStateRegistry(external);
  }

  set(newValue: Payload): FieldChange {
    let changes = 0n;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[externalSymbol].clear();
        // @ts-ignore: This is fine
        this.#undefined.register(key, child);
        changes |= change.child.detach;
      }
    });

    for (const [key, value] of Object.entries(newValue)) {
      const child = this.#children.get(key);
      if (child) {
        child.set(value, false);
        changes |= shiftChildChanges(child.lastChanges);
      } else {
        const undefinedState = this.#undefined.claim(key);
        if (undefinedState) undefinedState[externalSymbol].create(value);

        const newChild =
          undefinedState ||
          new Field(value, { key, field: this.external as Field<any> });
        this.#children.set(key, newChild as Field<any>);
        changes |= change.child.attach;
      }
    }

    // Apply shape change
    changes |= shapeChanges(changes);

    return changes;
  }

  get(): Payload {
    return Object.fromEntries(
      Array.from(this.#children.entries()).map(([k, v]) => [k, v.get()]),
    ) as Payload;
  }

  //#region Tree

  $(): Field.$<Payload> {
    return this.#$;
  }

  #$ = new Proxy({} as Field.$<Payload>, {
    get: (_, key: string) => this.#$field(key),
  });

  at<Key extends keyof Payload>(key: Key): Field.At<Payload, Key> {
    return this.#$field(String(key)) as Field.At<Payload, Key>;
  }

  lookup(path: Enso.Path): Field<unknown> | undefined {
    if (path.length === 0) return this.external as any;
    const [key, ...restPath] = path;
    return this.#$field(String(key))?.lookup(restPath);
  }

  //#endregion

  #$field(key: string) {
    const field = this.#children.get(key);
    if (field) return field;

    return this.#undefined.ensure(key);
  }

  override try(key?: string): any {
    if (key !== undefined && key !== null) {
      return this.#children.get(key)?.try();
    } else {
      return this.external;
    }
  }

  override childUpdate(childChanges: FieldChange, key: string): FieldChange {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.field.attach) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");

      // @ts-ignore: TODO:
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

      // @ts-ignore: TODO:
      this.#undefined.register(key, child);
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

  override withhold(): void {
    this.#children.forEach((field) => field.withhold());
  }

  override unleash(): void {
    this.#children.forEach((field) => field.unleash());
  }

  //#region Collection

  size(): number {
    return this.#children.size;
  }

  each(callback: InternalObjectState.CollectionCallback<Payload>) {
    this.#children.forEach((field, key) => (callback as any)(field, key));
  }

  map<Result>(
    callback: InternalObjectState.CollectionCallback<Payload, Result>,
  ): Result[] {
    const result: Result[] = [];
    this.#children.forEach((field, key) =>
      result.push((callback as any)(field, key as keyof Payload)),
    );
    return result;
  }

  find(
    predicate: InternalObjectState.CollectionCallback<Payload, any>,
  ): Field<Payload[keyof Payload]> | undefined {
    for (const [key, value] of this.#children.entries() as any) {
      if (predicate(value, key)) return value;
    }
  }

  filter(
    predicate: InternalObjectState.CollectionCallback<Payload, unknown>,
  ): Field<Payload[keyof Payload]>[] {
    return Array.from(this.#children.entries()).reduce<any[]>(
      (acc, [key, value]: any) =>
        predicate(value, key) ? (acc.push(value), acc) : acc,
      [],
    );
  }

  remove(key?: keyof Payload): Field<DetachedValue> {
    return Field.remove(this.external, key);
  }

  //#endregion
}

export namespace InternalObjectState {
  export type CollectionCallback<Value extends object, Result = void> = <
    Key extends keyof Value,
  >(
    item: Field<Value[Key]>,
    key: Key,
  ) => Result;
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
        item[externalSymbol].clear();
        // @ts-ignore: This is fine
        this.#undefined.register(index.toString(), item);
        changes |= change.child.detach;
      }
    });

    // @ts-ignore: TODO:
    this.#children = newValue.map((value, index) => {
      const child = this.#children[index];
      if (child) {
        child.set(value, false);
        changes |= shiftChildChanges(child.lastChanges);
        return child;
      } else {
        const undefinedState = this.#undefined.claim(index.toString());
        if (undefinedState) undefinedState[externalSymbol].create(value);

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
    changes |= shapeChanges(changes);

    return changes;
  }

  //#region Tree

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

  override try(index?: number): any {
    if (index !== undefined && index !== null) {
      return this.#item(index)?.try();
    } else {
      return this.external;
    }
  }

  lookup(path: Enso.Path): Field<unknown> | undefined {
    if (path.length === 0) return this.external as any;
    const [index, ...restPath] = path;
    return this.#item(Number(index))?.lookup(restPath);
  }

  //#endregion

  override childUpdate(childChanges: FieldChange, key: string): FieldChange {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.field.attach) {
      const item = this.#undefined.claim(key);
      if (!item)
        throw new Error("Failed to find the child field when updating");

      const idx = Number(key);
      const existingItem = this.#children[idx];
      // Item already exists at this index, so we need to move it
      if (existingItem) {
        // Insert the attaching item
        // @ts-ignore: TODO:
        this.#children.splice(idx, 0, item);

        // Shift children keys
        this.#children.slice(idx).forEach((item, index) => {
          item[externalSymbol].move(String(idx + index));
        });
      } else {
        // @ts-ignore: TODO:
        this.#children[idx] = item;
      }

      // TODO: Update keys for the rest of the children and trigger move change
      changes |= change.child.attach;
    }

    // Handle when child goes from defined to undefined
    if (childChanges & change.field.detach) {
      const item = this.#children[Number(key)];
      if (!item)
        throw new Error("Failed to find the child field when updating");

      // Remove the child from the array
      const idx = Number(key);
      this.#children.splice(idx, 1);
      item.unwatch();
      changes |= change.child.detach;

      // Shift children keys
      this.#children.slice(idx).forEach((item, index) => {
        item[externalSymbol].move(String(idx + index));
      });

      // @ts-ignore: TODO:
      this.#undefined.register(key, item);
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

  override withhold(): void {
    this.#children.forEach((field) => field.withhold());
  }

  override unleash(): void {
    this.#children.forEach((field) => field.unleash());
  }

  //#region Collection

  get length(): number {
    return this.#children.length;
  }

  each(callback: InternalArrayState.CollectionCallback<Payload>) {
    this.#children.forEach(callback as any);
  }

  map<Result>(
    callback: InternalArrayState.CollectionCallback<Payload, Result>,
  ): Result[] {
    return this.#children.map(callback as any);
  }

  size(): number {
    return this.#children.length;
  }

  push<ItemValue extends Payload[number]>(item: ItemValue): Field<ItemValue> {
    const length = this.#children.length;
    const field = new Field(item, {
      key: String(length),
      // @ts-ignore: This is fine
      field: this.external,
    });
    // @ts-ignore: TODO:
    this.#children[length] = field;

    this.external.trigger(change.field.shape | change.child.attach, true);
    return field;
  }

  insert(index: number, item: Payload[number]) {
    // @ts-ignore: TODO
    const field = new Field(item, { key: String(index), field: this.external });
    this.#children.splice(
      index,
      0,
      // @ts-ignore: TODO
      field,
    );

    this.#children.slice(index).forEach((item, index) => {
      item[externalSymbol].move(String(index));
    });

    this.external.trigger(change.field.shape | change.child.attach, true);
    return field;
  }

  remove(key?: keyof Payload): Field<DetachedValue> {
    return Field.remove(this.external, key);
  }

  find(
    predicate: Field.Predicate<Payload[number]>,
  ): Field<Payload[number]> | undefined {
    // @ts-ignore: This is fine
    return this.#children.find(predicate);
  }

  filter(
    predicate: Field.Predicate<Payload[number]>,
  ): Field<Payload[number]>[] {
    // @ts-ignore: This is fine
    return this.#children.filter(predicate);
  }

  //#endregion
}

export namespace InternalArrayState {
  export type CollectionCallback<Value extends Array<any>, Result = void> = (
    item: Field<Value[number]>,
    index: number,
  ) => Result;
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
      this.#refsMap.delete(key),
    );
  }

  register(key: string, field: Field<DetachedValue>) {
    const fieldRef = new WeakRef(field);
    // @ts-ignore: TODO:
    this.#refsMap.set(key, fieldRef);
    this.#registry.register(fieldRef, key);
  }

  claim(key: string): Field<undefined> | undefined {
    // Look up if the undefined field exists
    const ref = this.#refsMap.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregister the field and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#refsMap.delete(key);
    // @ts-ignore: This is fine
    return registered;
  }

  ensure(key: string): Field<DetachedValue> {
    // Try to look up registered undefined item
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

// TODO: Move into some kind of helpers module
// TODO: Add tests

export function useUndefinedStringField<Type extends string>(
  field: Field<Type | undefined>,
): Field<Type> {
  return field
    .useInto((value) => value ?? ("" as Type), [])
    .from((value) => value || undefined, []);
}

//#endregion

function always(condition: unknown): asserts condition {
  if (!condition) throw new Error("Assertion failed");
}
