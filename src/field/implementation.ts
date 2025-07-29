"use client";

import type { Atom } from "../atom/definition.ts";
import { AtomImpl } from "../atom/implementation.ts";
import {
  change,
  ChangesEvent,
  metaChanges,
  structuralChanges,
} from "../change/index.ts";
import { ValidationTree } from "../validation/index.ts";

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

  static Component(props: any) {
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

    return props.render(control, meta);
  }

  // static use<Value>(
  //   initialValue: Value,
  //   deps: DependencyList,
  // ): Field.Envelop<never, Value> {
  //   const field = useMemo(() => new Field(initialValue), deps);
  //   useEffect(() => () => field.deconstruct(), [field]);
  //   return field;
  // }

  //#endregion

  //#region Value

  // TODO:

  //#endregion

  //#region Meta

  useMeta(props: any) {
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

  //#region Events

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

  //#region Interop

  #customRef: any;
  #customOnBlur: any;

  control(props: any) {
    this.#customRef = props?.ref;
    this.#customOnBlur = props?.onBlur;

    return {
      name: this.name,
      ref: (this as any).ref,
      onBlur: (this as any).onBlur,
    };
  }

  //#endregion

  //#region Validation

  get errors() {
    // if (this.#cachedErrors)return this.#cachedErrors;
    // return (this.#cachedErrors = this.validation.at(this.path));
    return this.validationTree.at(this.path);
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
}

export class FieldProxyImpl<Value> extends FieldImpl<Value> {
  #source: any;
  #brand = Symbol();
  #into: any;
  #from: any;
  #unsubs: any[] = [];

  constructor(source: any, into: any, from: any) {
    const payload = into(source.value, undefined);
    super(payload, { source });

    this.#source = source;
    this.#into = into;
    this.#from = from;

    // Add itself to the computed map, so that we can find it later by the path,
    // i.e. for validation through maybe references.
    // this.computedMap.add(this as any as ComputedField<unknown, unknown>);

    // Watch for the atom (source) and update the computed value
    // on structural changes.
    this.#unsubs.push(
      this.#source.watch(
        (sourceValue: any, sourceEvent: any) => {
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
        (computedValue: any, computedEvent: any) => {
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
    FieldImpl.prototype.deconstruct.call(this);
    this.#unsubs.forEach((unsub) => unsub());
    this.#unsubs = [];
  }

  //#region Computed

  connect(source: any) {
    this.#source = source;
  }

  //#endregion
}
