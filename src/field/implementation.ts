"use client";

import type { Atom } from "../atom/definition.ts";
import { UseAtomHook, useAtomHook } from "../atom/hooks/index.ts";
import { AtomImpl } from "../atom/implementation.ts";
import { AtomInternalArray } from "../atom/internal/array/index.ts";
import { AtomInternalObject } from "../atom/internal/object/index.ts";
import {
  change,
  ChangesEvent,
  metaChanges,
  structuralChanges,
} from "../change/index.ts";
import { useCallback } from "../hooks/index.ts";
import { ValidationTree } from "../validation/index.ts";
import { Field } from "./definition.ts";

export { FieldImpl as Field, FieldProxyImpl as FieldProxy };

export class FieldImpl<Value> extends AtomImpl<Value> {
  //#region Static

  static override create<Value>(
    value: Value,
    parent?: Atom.Parent.Bare.Ref<any, any>,
  ) {
    return new FieldImpl(value, parent);
  }

  static proxy(field: any, intoMapper: any, fromMapper: any) {
    return new FieldProxyImpl(field, intoMapper, fromMapper);
  }

  static Component<Value>(props: Field.Component.Props<Value>) {
    const { field } = props;
    const value = field.useValue();
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

    return props.render(control as any, meta);
  }

  //#endregion

  //#region Instance

  constructor(value: Value, parent?: Atom.Parent.Bare.Ref<any, any>) {
    super(value, parent);

    this.#initial = value;

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      const value = target.value as Value;
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

    this.#onBlur = <Element extends HTMLElement>(
      event: React.FocusEvent<Element>,
    ) => {
      this.trigger(change.field.blur, true);
      this.#customOnBlur?.(event);
    };

    this.set = this.set.bind(this);
    this.ref = this.ref.bind(this);
  }

  //#endregion

  //#region Value

  #initial: Value;

  get dirty(): boolean {
    if (this.__parent && "source" in this.__parent)
      return this.__parent.source.dirty;

    if (this.#cachedDirty === undefined)
      this.#cachedDirty = this.internal.dirty(this.#initial);
    return this.#cachedDirty as any;
  }

  useDirty<Enable extends boolean | undefined = undefined>(
    enable?: Enable,
  ): Atom.Hooks.Result<Enable, boolean> {
    const getValue = useCallback(
      () => this.dirty,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    return useAtomHook({
      enable,
      // @ts-ignore
      atom: this as FieldOld<any>,
      getValue,
    }) as any;
  }

  get initial(): Value {
    return this.#initial;
  }

  commit() {
    this.#commit(this.value as any);

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
  #commit(newInitial: Value, notify = true) {
    const wasDirty = notify && this.dirty;

    this.#initial = newInitial;
    if (
      this.internal instanceof AtomInternalObject ||
      this.internal instanceof AtomInternalArray
    ) {
      this.internal.forEach((field: any, key: any) =>
        field.#commit((newInitial as any)[key], notify),
      );
    }
    this.clearCache();

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

  //#endregion

  //#region Meta

  override useMeta<Props extends Field.Meta.Props | undefined = undefined>(
    props?: Props,
  ) {
    const valid = this.useValid(!props || !!props.valid);
    const errors = this.useErrors(!props || !!props.errors);
    const dirty = this.useDirty(!props || !!props.dirty);
    return { valid, errors, dirty };
  }

  //#endregion

  //#region Events

  // ...

  //#endregion

  //#region Interop

  #customOnBlur: any;

  #onInput;
  #onBlur;

  control(props: any) {
    this.#customRef = props?.ref;
    this.#customOnBlur = props?.onBlur;

    return {
      name: this.name,
      ref: (this as any).ref,
      onBlur: (this as any).onBlur,
    };
  }

  #element: HTMLElement | null = null;
  #elementUnwatch: Atom.Unwatch | undefined;
  #customRef:
    | React.RefCallback<Element>
    | React.RefObject<Element | null>
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
        element.value = String(this.value);
        this.#elementUnwatch = this.watch((value) => {
          element.value = String(value) as string;
        });
        break;
    }

    element.addEventListener("input", this.#onInput(element));
    this.#element = element;
  }

  //#endregion

  //#region Validation

  get errors() {
    // if (this.#cachedErrors)return this.#cachedErrors;
    // return (this.#cachedErrors = this.validation.at(this.path));
    return this.validationTree.at(this.path);
  }

  useErrors<Enable extends boolean | undefined = undefined>(
    enable?: Enable,
  ): Atom.Hooks.Result<Enable, Field.Error[]> {
    const getValue = useCallback(
      () => this.errors,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    const shouldRender = useCallback<UseAtomHook.ShouldRender<Field.Error[]>>(
      (prev, next) =>
        !(
          next === prev ||
          (next.length === prev?.length &&
            next.every((error, index) => prev?.[index] === error))
        ),
      [],
    );

    return useAtomHook({
      enable,
      // @ts-ignore
      atom: this as FieldOld<any>,
      getValue,
      shouldRender,
    }) as any;
  }

  addError(error: any) {
    const changes = this.#errorChangesFor(this.valid);
    this.validationTree.add(this.path, this.#normalizeError(error));
    this.events.trigger(this.path, changes);
  }

  clearErrors() {
    if (this.valid) return;
    const errors = this.validationTree.nested(this.path);

    // First, we clear all errors, so that when we trigger changes, sync
    // handlers don't see the errors.
    // TODO: Add test for this case
    this.validationTree.clear(this.path);

    const errorsByPaths = Object.groupBy(errors, ([path]: any) =>
      AtomImpl.name(this.path),
    );

    const clearChanges = change.field.errors | change.field.valid;

    Object.values(errorsByPaths).forEach((group) => {
      const path = group?.[0]?.[0];
      if (!path) return;
      this.events.trigger(path, clearChanges);
    });
  }

  #normalizeError(error: any) {
    return typeof error === "string" ? { message: error } : error;
  }

  #errorChangesFor(wasValid: any) {
    let changes = change.field.errors;
    if (wasValid) changes |= change.field.invalid;
    return changes;
  }

  #validation = undefined;

  get validationTree() {
    return (this.root.#validation ??= new ValidationTree());
  }

  get valid() {
    // TODO: Figure out if caching is needed here
    return !this.validationTree.nested(this.path).length;
  }

  useValid<Enable extends boolean | undefined = undefined>(
    enable?: Enable,
  ): Atom.Hooks.Result<Enable, boolean> {
    const getValue = useCallback(
      () => this.valid,
      [
        // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
        this,
      ],
    );

    return useAtomHook({
      enable,
      atom: this as any,
      getValue,
    }) as any;
  }

  async validate(validator: any) {
    this.clearErrors();
    // Withhold all the changes until the validation is resolved, so that
    // there're no chain reactions.
    // TODO: There's a problem with this approach, if the validation is async,
    // and hits external APIs, form interactions might not react as expected and
    // even lead to impossible state. Either block the form or make withhold
    // optional.
    this.withhold();
    await validator(this);
    this.unleash();
  }

  //#endregion

  //#region Cache

  #cachedDirty: boolean | undefined;

  override clearCache() {
    AtomImpl.prototype.clearCache.call(this);
    this.#cachedDirty = undefined;
  }

  //#endregion
}

export class FieldProxyImpl<Value> extends FieldImpl<Value> {
  #source: FieldImpl<unknown>;
  #brand = Symbol();
  #into: any;
  #from: any;
  #unsubs: Atom.Unwatch[] = [];

  constructor(source: FieldImpl<unknown>, into: any, from: any) {
    const payload = into(source.value, undefined);
    super(payload, { source });

    this.#source = source;
    this.#into = into;
    this.#from = from;

    // Watch for the atom (source) and update the computed value
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
            // be replaced with simple atom.
            this.set(this.#into(sourceValue, this.value));
          }
        },
        // TODO: Add tests and rationale for this. Without it, though, when
        // rendering collection settings in Mind Control and disabling a package
        // that triggers rerender and makes the computed atom set to initial
        // value. The culprit is "Prevent extra mapper call" code above that
        // resets parent computed atom value before it gets a chance to update.
        true,
      ),
    );

    // Listen for the computed atom changes and update the atom
    // (source) value.
    this.#unsubs.push(
      this.watch(
        (computedValue, computedEvent) => {
          // Check if the change was triggered by the source value and ignore it
          // to stop circular updates.
          if (computedEvent.context[this.#brand]) return;

          // Set context so we can know if the atom change was triggered by
          // the computed value and stop circular updates.
          ChangesEvent.context({ [this.#brand]: true }, () => {
            // If there are structural changes, update the source atom.
            // // TODO: Tests
            if (structuralChanges(computedEvent.changes)) {
              // TODO: Second argument is unnecessary expensive and probably can
              // be replaced with simple atom.
              this.#source.set(this.#from(computedValue, this.#source.value));
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
    FieldImpl.prototype.deconstruct.call(this);
    this.#unsubs.forEach((unsub) => unsub());
    this.#unsubs = [];
  }

  //#region Computed

  connect(source: FieldImpl<unknown>) {
    this.#source = source;
  }

  //#endregion
}
