import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo } from "react";
import {
  change,
  ChangesEvent,
  shapeChanges,
  structuralChanges,
} from "../change/index.ts";
// import { detachedValue } from "../detached/index.ts";
import { detachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { useAtomHook } from "./hooks/index.ts";

const externalSymbol = Symbol();

// vvvvvvvvvvvvvvvvvvv  PENDING  vvvvvvvvvvvvvvvvvvv

const hintSymbol = Symbol();

// ^^^^^^^^^^^^^^^^^^^  PENDING  ^^^^^^^^^^^^^^^^^^^

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

    const ValueConstructor = AtomValue.detect(value);

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

    this.#internal = new ValueConstructor(this, value);
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

//#region AtomValue

export class AtomValue {
  static detect(value) {
    if (value !== null && typeof value === "object" && value !== detachedValue)
      return Array.isArray(value)
        ? AtomValueArray
        : Object.prototype.toString.call(value) === "[object Object]"
          ? AtomValueObject
          : AtomValuePrimitive;
    return AtomValuePrimitive;
  }

  #external;

  constructor(atom, _value) {
    this.#external = atom;
  }

  //#region Tree

  try() {
    const value = this.value;
    if (value === undefined || value === null) return value;
    return this.external;
  }

  //#endregion

  childUpdate(type, _key) {
    return type;
  }

  get external() {
    return this.#external;
  }

  detached() {
    return false;
  }

  discriminate(discriminator) {
    return {
      discriminator: this.external.$?.[discriminator]?.value,
      field: this.external,
    };
  }

  create(value, parent) {
    return this.#external.constructor.create(value, parent);
  }
}

//#endregion

//#region AtomValuePrimitive

export class AtomValuePrimitive extends AtomValue {
  #value;

  constructor(atom, value) {
    super(atom, value);
    this.#value = value;
  }

  #create() {
    // this.#external
  }

  //#region Old

  set(value) {
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

  get value() {
    return this.#value === detachedValue ? undefined : this.#value;
  }

  remove() {
    return Atom.remove(this.external);
  }

  //#region Tree

  $() {
    return undefined;
  }

  lookup(path) {
    if (path.length === 0) return this.external;
    return undefined;
  }

  //#endregion

  unwatch() {}

  dirty(initial) {
    return initial !== this.#value;
  }

  //#endregion
}

//#endregion

//#region AtomValueObject

export class AtomValueObject extends AtomValue {
  #children = new Map();
  #undefined;

  constructor(external, value) {
    super(external, value);
    this.#undefined = new UndefinedStateRegistry(external);
  }

  set(newValue) {
    let changes = 0n;

    this.#children.forEach((child, key) => {
      if (!(key in newValue)) {
        this.#children.delete(key);
        child[externalSymbol].clear();
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
          undefinedState || this.create(value, { key, field: this.external });
        this.#children.set(key, newChild);
        changes |= change.child.attach;
      }
    }

    // Apply shape change
    changes |= shapeChanges(changes);

    return changes;
  }

  get value() {
    return Object.fromEntries(
      Array.from(this.#children.entries()).map(([k, v]) => [k, v.value]),
    );
  }

  //#region Tree

  $() {
    return this.#$;
  }

  #$ = new Proxy(
    {},
    {
      get: (_, key) => this.#$field(key),
    },
  );

  at(key) {
    return this.#$field(String(key));
  }

  lookup(path) {
    if (path.length === 0) return this.external;
    const [key, ...restPath] = path;
    return this.#$field(String(key))?.lookup(restPath);
  }

  //#endregion

  #$field(key) {
    const field = this.#children.get(key);
    if (field) return field;

    return this.#undefined.ensure(key);
  }

  try(key) {
    if (key !== undefined && key !== null) {
      return this.#children.get(key)?.try();
    } else {
      return this.external;
    }
  }

  childUpdate(childChanges, key) {
    let changes = 0n;

    // Handle when child goes from undefined to defined
    if (childChanges & change.field.attach) {
      const child = this.#undefined.claim(key);
      if (!child)
        throw new Error("Failed to find the child field when updating");

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

      this.#undefined.register(key, child);
    }

    return changes;
  }

  unwatch() {
    this.#children.forEach((child) => child.unwatch());
    this.#children.clear();
  }

  dirty(initial) {
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

  withhold() {
    this.#children.forEach((field) => field.withhold());
  }

  unleash() {
    this.#children.forEach((field) => field.unleash());
  }

  //#region Collection

  size() {
    return this.#children.size;
  }

  each(callback) {
    this.#children.forEach((field, key) => callback(field, key));
  }

  map(callback) {
    const result = [];
    this.#children.forEach((field, key) => result.push(callback(field, key)));
    return result;
  }

  find(predicate) {
    for (const [key, value] of this.#children.entries()) {
      if (predicate(value, key)) return value;
    }
  }

  filter(predicate) {
    return Array.from(this.#children.entries()).reduce(
      (acc, [key, value]) =>
        predicate(value, key) ? (acc.push(value), acc) : acc,
      [],
    );
  }

  remove(key) {
    return Field.remove(this.external, key);
  }

  //#endregion
}

//#endregion

//#region AtomValueArray

export class AtomValueArray extends AtomValue {
  #children = [];
  #undefined;

  constructor(external, value) {
    super(external, value);

    this.#undefined = new UndefinedStateRegistry(external);
  }

  get value() {
    return this.#children.map((child) => child.value);
  }

  set(newValue) {
    let changes = 0n;

    this.#children.forEach((item, index) => {
      if (!(index in newValue)) {
        delete this.#children[index];
        item[externalSymbol].clear();
        this.#undefined.register(index.toString(), item);
        changes |= change.child.detach;
      }
    });

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
          this.create(value, {
            key: String(index),
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

  $() {
    return this.#$;
  }

  #$ = new Proxy(
    {},
    {
      get: (_, index) => this.#item(Number(index)),
    },
  );

  at(key) {
    return this.#item(Number(key));
  }

  #item(index) {
    const item = this.#children[index];
    if (item) return item;

    const indexStr = index.toString();
    return this.#undefined.ensure(indexStr);
  }

  try(index) {
    if (index !== undefined && index !== null) {
      return this.#item(index)?.try();
    } else {
      return this.external;
    }
  }

  lookup(pathh) {
    if (path.length === 0) return this.external;
    const [index, ...restPath] = path;
    return this.#item(Number(index))?.lookup(restPath);
  }

  //#endregion

  childUpdate(childChanges, key) {
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
        this.#children.splice(idx, 0, item);

        // Shift children keys
        this.#children.slice(idx).forEach((item, index) => {
          item[externalSymbol].move(String(idx + index));
        });
      } else {
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

      this.#undefined.register(key, item);
    }

    return changes;
  }

  unwatch() {
    this.#children.forEach((child) => child.unwatch());
    this.#children.length = 0;
  }

  dirty(initial) {
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

  withhold() {
    this.#children.forEach((field) => field.withhold());
  }

  unleash() {
    this.#children.forEach((field) => field.unleash());
  }

  //#region Collection

  get length() {
    return this.#children.length;
  }

  each(callback) {
    this.#children.forEach(callback);
  }

  map(callback) {
    return this.#children.map(callback);
  }

  size() {
    return this.#children.length;
  }

  push(item) {
    const length = this.#children.length;
    const field = this.create(item, {
      key: String(length),
      field: this.external,
    });
    this.#children[length] = field;

    this.external.trigger(change.field.shape | change.child.attach, true);
    return field;
  }

  insert(index, item) {
    const field = this.create(item, {
      key: String(index),
      field: this.external,
    });
    this.#children.splice(index, 0, field);

    this.#children.slice(index).forEach((item, index) => {
      item[externalSymbol].move(String(index));
    });

    this.external.trigger(change.field.shape | change.child.attach, true);
    return field;
  }

  remove(key) {
    return Field.remove(this.external, key);
  }

  find(predicate) {
    return this.#children.find(predicate);
  }

  filter(predicate) {
    return this.#children.filter(predicate);
  }

  //#endregion
}

//#endregion

//#region UndefinedStateRegistry

export class UndefinedStateRegistry {
  #external;
  #refsMap = new Map();
  #registry;

  constructor(external) {
    this.#external = external;
    this.#registry = new FinalizationRegistry((key) =>
      this.#refsMap.delete(key),
    );
  }

  register(key, field) {
    const fieldRef = new WeakRef(field);
    this.#refsMap.set(key, fieldRef);
    this.#registry.register(fieldRef, key);
  }

  claim(key) {
    // Look up if the undefined field exists
    const ref = this.#refsMap.get(key);
    const registered = ref?.deref();
    if (!ref || !registered) return;

    // Unregister the field and allow the caller to claim it
    this.#registry.unregister(ref);
    this.#refsMap.delete(key);
    return registered;
  }

  ensure(key) {
    // Try to look up registered undefined item
    const registered = this.#refsMap.get(key)?.deref();
    if (registered) return registered;

    // Or create and register a new one
    const field = this.create(detachedValue, {
      key,
      field: this.#external,
    });
    this.register(key, field);
    return field;
  }
}

//#endregion
