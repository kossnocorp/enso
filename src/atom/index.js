import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo } from "react";
import {
  change,
  ChangesEvent,
  shapeChanges,
  shiftChildChanges,
  structuralChanges,
} from "../change/index.ts";
// import { detachedValue } from "../detached/index.ts";
import { detachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { useAtomHook } from "./hooks/index.ts";
import { detectValueConstructor } from "./value/index.ts";
import { AtomValuePrimitive } from "./value/opaque/index.ts";

export class Atom {
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
  static use(
    initialValue,
    // TODO: Add tests
    deps,
  ) {
    const atom = useMemo(() => this.create(initialValue), deps);
    useEffect(() => () => atom.deconstruct(), [atom]);
    return atom;
  }

  //#endregion

  //#region Instance

  constructor(value, parent) {
    this.#initial = value;
    this.#parent = parent;

    // NOTE: Parent **must** set before, so that when we setting the children
    // values, the path is already set. If not, they won't properly register in
    // the events tree.
    this.#set(value);

    this.eventsTree.add(this.path, this);

    // const onInput = (event: Event) => {
    //   const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    //   const value = target.value as Payload;
    //   this.set(value);
    // };

    // this.#onInput = <Element extends HTMLElement>(element: Element) => {
    //   switch (true) {
    //     case element instanceof HTMLInputElement:
    //     case element instanceof HTMLTextAreaElement:
    //     // TODO:
    //     default:
    //       return onInput;
    //   }
    // };

    // this.set = this.set.bind(this);
    // this.ref = this.ref.bind(this);
    // this.onBlur = this.onBlur.bind(this);
  }

  deconstruct() {
    this.eventsTree.delete(this.path, this);
  }

  //#endregion

  //#region Attributes

  #id = nanoid();

  get id() {
    return this.#id;
  }

  //#endregion

  //#region Value

  #initial;

  get value() {
    if (this.#cachedGet === detachedValue) {
      this.#cachedGet = this.#internal.value;
    }
    return this.#cachedGet;
  }

  useValue(props) {
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

    console.log("!!!!!!!!!!!!!!!", typeof this.constructor);

    const getValue = useCallback(
      () => this.value,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    const watch = useCallback(
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

    const toResult = useCallback(
      (result) => (watchMeta ? [result, meta] : result),
      [meta, watchMeta],
    );

    return useAtomHook({
      atom: this,
      getValue,
      watch,
      toResult,
    });
  }

  set(value, notifyParents = true) {
    const changes = this.#set(value);
    if (changes) this.trigger(changes, notifyParents);

    Atom.lastChanges.set(this, changes);
    return this;
  }

  #set(value) {
    // Frozen fields should not change!
    if (Object.isFrozen(this)) return 0n;

    const Value = detectValueConstructor(value);

    // The field is already of the same type
    if (this.#internal instanceof Value) return this.#internal.set(value);

    // The field is of a different type
    this.#internal.unwatch();

    let changes = 0n;
    // Field is being detached
    if (value === detachedValue) changes |= change.field.detach;
    // Field is being attached
    else if (this.#internal.detached()) changes |= change.field.attach;
    // Field type is changing
    else changes |= change.field.type;

    this.#internal = new Value(this, value);
    this.#internal.set(value);
    return changes;
  }

  // NOTE: Since `Atom.useEnsure` freezes the dummy atom but still allows
  // running operations such as `set` albeit with no effect, we need to ensure
  // that `lastChanges` is still assigned correctly, so we must use a static
  // map instead of changing the atom instance directly.
  static lastChanges = new WeakMap();

  get lastChanges() {
    return Atom.lastChanges.get(this) || 0n;
  }

  //#endregion

  //#region Type

  #internal = new AtomValuePrimitive(this, detachedValue);

  get _() {
    return {};
  }

  //#endregion

  //#region Tree

  #parent;

  get root() {
    return this.#parent && "source" in this.#parent
      ? this.#parent.source.root
      : this.#parent?.field.root || this;
  }

  get parent() {
    return this.#parent && "source" in this.#parent
      ? this.#parent.source.parent
      : this.#parent?.field;
  }

  get key() {
    if (!this.#parent) return;
    return "source" in this.#parent
      ? this.#parent.source.key
      : this.#parent.key;
  }

  get $() {
    return this.#internal.$();
  }

  // @ts-ignore: WIP
  at(key) {
    // WIP:
    return this.#internal.at(key);
    // if (
    //   this.#internal instanceof InternalObjectState ||
    //   this.#internal instanceof InternalArrayState
    // )
    //   // @ts-ignore: TODO:
    //   return this.#internal.at(key);
    // // WIP:
    // // throw new Error(
    // //   `Field at ${this.path.join(".")} is not an object or array`,
    // // );
  }

  get path() {
    return this.#parent && "source" in this.#parent
      ? this.#parent.source.path
      : this.#parent
        ? [...this.#parent.field.path, this.#parent.key]
        : [];
  }

  get name() {
    return Atom.name(this.path);
  }

  static name(path) {
    return path.join(".") || ".";
  }

  //#endregion

  //#region Meta

  useMeta(props) {
    // WIP: Types revamp
    // const valid = this.useValid(!props || !!props.valid);
    // const errors = this.useErrors(!props || !!props.errors);
    // const dirty = this.useDirty(!props || !!props.dirty);
    const valid = false;
    const errors = false;
    const dirty = false;
    return { valid, errors, dirty };
  }

  //#endregion

  //#region Watch

  watch(callback, sync = false) {
    // TODO: Add tests for this
    const target = sync ? this.#syncTarget : this.#batchTarget;
    const handler = (event) => {
      callback(this.value, event);
    };

    this.#subs.add(handler);
    target.addEventListener("change", handler);

    return () => {
      this.#subs.delete(handler);
      target.removeEventListener("change", handler);
    };
  }

  //#endregion

  //#region Events

  #withholded;

  #batchTarget = new EventTarget();
  #syncTarget = new EventTarget();
  #subs = new Set();
  #eventsTree;

  get eventsTree() {
    return (this.root.#eventsTree ??= new EventsTree());
  }

  trigger(changes, notifyParents = false) {
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

  #childTrigger(childChanges, key) {
    let changes =
      // Shift child's field changes into child/subtree range
      shiftChildChanges(childChanges) |
      // Apply field changes
      this.#internal.childUpdate(childChanges, key);

    // Apply shape change
    changes |= shapeChanges(changes);

    this.trigger(changes, true);
  }

  //#endregion

  //#region Cache

  #cachedGet = detachedValue;
  #cachedDirty;

  #clearCache() {
    this.#cachedGet = detachedValue;
    this.#cachedDirty = undefined;
  }

  //#endregion
}
