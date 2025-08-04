"use client";

import { nanoid } from "nanoid";
import React, { useEffect, useRef } from "react";
import {
  change,
  ChangesEvent,
  FieldChange,
  fieldChange,
  shapeChanges,
  shiftChildChanges,
  structuralChanges,
} from "../change/index.ts";
// import { detachedValue } from "../detached/index.ts";
import { DetachedValue, detachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { useCallback, useMemo } from "../hooks/index.ts";
import { useRerender } from "../hooks/rerender.ts";
import { EnsoUtils as Utils } from "../utils.ts";
import type { Atom } from "./definition.ts";
import { useAtomHook } from "./hooks/index.ts";
import { AtomInternalArray } from "./internal/array/index.ts";
import { externalSymbol } from "./internal/base/index.ts";
import {
  AtomInternal,
  detectInternalConstructor,
  AtomInternalObject,
  AtomInternalOpaque,
  AtomInternalCollection,
} from "./internal/index.ts";

export class AtomImpl<Value> {
  //#region Static

  /**
   * Creates and memoizes a new instance from the provided initial value.
   * Just like `useState`, it will not recreate the instance on the value
   * change.
   *
   * @param initialValue - Initial value.
   * @param deps - Hook dependencies.
   *
   * @returns Memoized instance.
   */
  static use<Value>(
    initialValue: Value,
    // TODO: Add tests
    deps: React.DependencyList,
  ) {
    const atom = useMemo(() => this.create(initialValue), deps);
    useEffect(() => () => atom.deconstruct(), [atom]);
    return atom;
  }

  static create<Value>(value: Value, parent?: Atom.Parent.Bare.Ref<any, any>) {
    return new AtomImpl(value, parent);
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
  static useEnsure<Value, Result = undefined>(
    atom: AtomImpl<Value> | Utils.Falsy,
    mapper?: Atom.Static.Ensure.Bare.Mapper<AtomImpl<Value>, Result>,
  ): AtomImpl<unknown> {
    const dummy = this.use(undefined, []);
    const frozenDummy = useMemo(() => Object.freeze(dummy), [dummy]);
    const mappedAtom = (mapper && atom && mapper(atom)) || atom;
    return (mappedAtom || frozenDummy) as any;
  }

  //#endregion

  //#region Instance

  constructor(value: Value, parent?: Atom.Parent.Bare.Ref<any, any>) {
    // this.#initial = value;
    this.__parent = parent;

    // NOTE: Parent **must** set before, so that when we setting the children
    // values, the path is already set. If not, they won't properly register in
    // the events tree.
    this.#set(value);

    this.events.add(this.path, this);

    // this.set = this.set.bind(this);
    // this.ref = this.ref.bind(this);
  }

  deconstruct() {
    this.events.delete(this.path, this);
  }

  //#endregion

  //#region Attributes

  readonly id = nanoid();

  //#endregion

  //#region Value

  get value(): Value {
    if (this.#cachedGet === detachedValue) {
      this.#cachedGet = this.internal.value;
    }
    return this.#cachedGet as any;
  }

  useValue(props: any) {
    const watchAllMeta = !!props?.meta;
    const watchMeta = watchAllMeta || props?.valid || props?.dirty;
    const meta = (this as any).useMeta(
      watchAllMeta
        ? undefined
        : {
            dirty: !!props?.dirty,
            errors: !!props?.errors,
            valid: !!props?.valid,
          },
    );

    const getValue = useCallback(
      () => this.value,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    const watch = useCallback(
      ({ valueRef, rerender }: any) =>
        this.watch((payload: any, event: any) => {
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

    const toResult = useCallback(
      (result: any) => (watchMeta ? [result, meta] : result),
      [meta, watchMeta],
    );

    return useAtomHook({
      atom: this,
      getValue,
      watch,
      toResult,
    } as any);
  }

  // TODO: Exposing the notify parents flag might be dangerous
  set(value: Value | DetachedValue, notifyParents = true) {
    const changes = this.#set(value);
    if (changes) this.trigger(changes, notifyParents);

    AtomImpl.lastChanges.set(this, changes);
    return this;
  }

  #set(value: unknown) {
    // Frozen fields should not change!
    if (Object.isFrozen(this)) return 0n;

    const Internal = detectInternalConstructor(value);

    // The field is already of the same type
    if (this.internal instanceof Internal)
      return this.internal.set(value as any);

    // The field is of a different type
    this.internal.unwatch();

    let changes = 0n;
    // Field is being detached
    if (value === detachedValue) changes |= change.field.detach;
    // Field is being attached
    else if (this.internal.detached()) changes |= change.field.attach;
    // Field type is changing
    else changes |= change.field.type;

    this.internal = new Internal(this as any, value as any);
    this.internal.set(value);
    return changes;
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
  pave(fallback: Utils.NonNullish<Value>): AtomImpl<Utils.NonNullish<Value>> {
    const value = this.value;
    if (value === undefined || value === null) this.set(fallback);
    return this as AtomImpl<Utils.NonNullish<Value>>;
  }

  compute<Computed>(
    callback: Atom.Compute.Callback<Value, Computed>,
  ): Computed {
    return callback(this.value);
  }

  useCompute<Computed>(
    callback: Atom.Compute.Callback<Value, Computed>,
    deps: React.DependencyList,
  ): Computed {
    const getValue = useCallback(
      () => callback(this.value),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
      [this, ...deps],
    );

    return useAtomHook({
      atom: this as any,
      getValue,
    }) as any;
  }

  //#endregion

  //#region Meta

  useMeta() {
    return {};
  }

  //#endregion

  //#region Type

  internal: AtomInternal = new AtomInternalOpaque(this, detachedValue as any);

  // Collection

  get size(): number {
    always(this.internal instanceof AtomInternalCollection);
    return this.internal.size;
  }

  remove(key: keyof Value) {
    always(this.internal instanceof AtomInternalCollection);
    return this.internal.remove(key as any);
  }

  forEach(callback: AtomInternalCollection.Callback<Value>): void {
    always(this.internal instanceof AtomInternalCollection);
    this.internal.forEach(callback);
  }

  map<Result>(
    callback: AtomInternalCollection.Callback<Value, Result>,
  ): Result[] {
    always(this.internal instanceof AtomInternalCollection);
    return this.internal.map(callback);
  }

  find(
    predicate: AtomInternalCollection.Predicate<Value>,
  ): AtomImpl<unknown> | undefined {
    always(this.internal instanceof AtomInternalCollection);
    return this.internal.find(predicate);
  }

  filter(
    predicate: AtomInternalCollection.Predicate<Value>,
  ): AtomImpl<unknown>[] {
    always(this.internal instanceof AtomInternalCollection);
    return this.internal.filter(predicate);
  }

  self: any = {
    try: () => {
      if (this.value === undefined || this.value === null) return this.value;
      return this;
    },

    remove: () => {
      return this.set(detachedValue, true);
    },
  };

  // Array

  push<ItemValue extends Value[keyof Value]>(
    item: ItemValue,
  ): AtomImpl<ItemValue> {
    always(this.internal instanceof AtomInternalArray);
    return this.internal.push(item);
  }

  insert<ItemValue extends Value[keyof Value]>(
    index: number,
    item: ItemValue,
  ): AtomImpl<ItemValue> {
    always(this.internal instanceof AtomInternalArray);
    return this.internal.insert(index, item);
  }

  useCollection(): AtomImpl<Value> {
    const rerender = useRerender();

    useEffect(
      () =>
        this.watch((_, event) => {
          if (shapeChanges(event.changes)) rerender();
        }),
      [this.id, rerender],
    );

    return this;
  }

  //#endregion

  //#region Tree

  __parent: Atom.Parent.Bare.Ref<any, any> | undefined;

  get root() {
    return this.__parent && "source" in this.__parent
      ? this.__parent.source.root
      : this.__parent?.field.root || this;
  }

  get parent() {
    return this.__parent && "source" in this.__parent
      ? this.__parent.source.parent
      : this.__parent?.field;
  }

  get key() {
    if (!this.__parent) return;
    return "source" in this.__parent
      ? this.__parent.source.key
      : this.__parent.key;
  }

  get $() {
    return this.internal.$();
  }

  at(key: keyof Value) {
    if (
      this.internal instanceof AtomInternalArray ||
      this.internal instanceof AtomInternalObject
    )
      return this.internal.at(key);
    // WIP:
    // throw new Error(
    //   `Field at ${this.path.join(".")} is not an object or array`,
    // );
  }

  try(key: any) {
    return this.internal.try(key);
  }

  get path() {
    return this.__parent && "source" in this.__parent
      ? this.__parent.source.path
      : this.__parent
        ? [...this.__parent.field.path, this.__parent.key]
        : [];
  }

  get name() {
    return AtomImpl.name(this.path);
  }

  static name(path: any) {
    return path.join(".") || ".";
  }

  lookup(path: Atom.Path): AtomImpl<unknown> | undefined {
    return this.internal.lookup(path);
  }

  //#endregion

  //#region Events

  #batchTarget = new EventTarget();
  #syncTarget = new EventTarget();
  #subs = new Set();
  #eventsTree: EventsTree<any> | undefined;

  // NOTE: Since `Atom.useEnsure` freezes the dummy atom but still allows
  // running operations such as `set` albeit with no effect, we need to ensure
  // that `lastChanges` is still assigned correctly, so we must use a static
  // map instead of changing the atom instance directly.
  static lastChanges = new WeakMap();

  get lastChanges() {
    return AtomImpl.lastChanges.get(this) || 0n;
  }

  get events() {
    return (this.root.#eventsTree ??= new EventsTree());
  }

  trigger(changes: FieldChange, notifyParents = false) {
    this.clearCache();

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
      this.__parent &&
      "field" in this.__parent &&
      this.__parent.field
    )
      this.__parent.field.#childTrigger(changes, this.__parent.key);
  }

  #childTrigger(childChanges: FieldChange, key: any) {
    let changes =
      // Shift child's field changes into child/subtree range
      shiftChildChanges(childChanges) |
      // Apply field changes
      this.internal.childUpdate(childChanges, key);

    // Apply shape change
    changes |= shapeChanges(changes);

    this.trigger(changes, true);
  }

  watch(callback: Atom.Watch.Bare.Callback<Value>, sync = false): Atom.Unwatch {
    // TODO: Add tests for this
    const target = sync ? this.#syncTarget : this.#batchTarget;
    const handler = (event: any) => {
      callback(this.value as any, event);
    };

    this.#subs.add(handler);
    target.addEventListener("change", handler);

    return () => {
      this.#subs.delete(handler);
      target.removeEventListener("change", handler);
    };
  }

  useWatch(callback: Atom.Watch.Bare.Callback<Value>): void {
    // Preserve id to detected the active field swap.
    const idRef = useRef(this.id);

    useEffect(() => {
      // If the field id changes, trigger the callback with the swapped change.
      if (idRef.current !== this.id) {
        idRef.current = this.id;
        callback(this.value as any, new ChangesEvent(change.field.id));
      }

      return this.watch(callback);
    }, [this.id, callback]);
  }

  unwatch() {
    // TODO: Add tests for this
    this.#subs.forEach((sub: any) => {
      this.#batchTarget.removeEventListener("change", sub);
      this.#syncTarget.removeEventListener("change", sub);
    });
    this.#subs.clear();
    this.internal.unwatch();
  }

  #withholded: any[] | undefined;

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
    this.internal.withhold();
  }

  unleash() {
    this.internal.unleash();
    const withholded = this.#withholded;
    this.#withholded = undefined;
    if (withholded?.[0]) (this as any).trigger(...withholded);
  }

  //#endregion

  //#region Transform

  into(intoMapper: any) {
    return {
      from: (fromMapper: any) =>
        (this.constructor as any).proxy(this, intoMapper, fromMapper),
    };
  }

  // TODO: Add tests
  useInto(intoMapper: any, intoDeps: React.DependencyList) {
    const from = useCallback(
      (fromMapper: any, fromDeps: React.DependencyList) => {
        const computed = useMemo(
          () => (this.constructor as any).proxy(this, intoMapper, fromMapper),
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

  //#region External

  #external = {
    move: (newKey: any) => {
      always(this.__parent && "field" in this.__parent);
      const prevPath = this.path;
      (this.__parent as any).key = newKey;
      this.events.move(prevPath, this.path, this);
      return this.trigger(fieldChange.key);
    },

    create: (value: any) => {
      const changes = this.#set(value) | change.field.attach;
      this.trigger(changes, false);
      return changes;
    },

    clear: () => {
      this.#set(undefined);
    },
  };

  get [externalSymbol]() {
    return this.#external;
  }

  //#endregion

  //#region Cache

  #cachedGet: Value | DetachedValue = detachedValue;

  clearCache() {
    this.#cachedGet = detachedValue;
  }

  //#endregion
}

function always(condition: unknown): asserts condition {
  if (!condition) throw new Error("Assertion failed");
}
