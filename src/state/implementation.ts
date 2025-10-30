"use client";

import type { Atom } from "../atom/definition.ts";
import { AtomImpl } from "../atom/implementation.ts";
import {
  ChangesEvent,
  metaChanges,
  structuralChanges,
} from "../change/index.ts";
import { EnsoUtils as Utils } from "../utils.ts";
import { State } from "./definition.ts";

export { StateImpl as State, StateProxyImpl as StateProxy };

//#region State

export class StateImpl<Value> extends AtomImpl<Value> {
  //#region Static

  static override prop = "state";

  static override create<Value>(
    value: Value,
    parent?: Atom.Parent.Bare.Ref<"state", any, any>,
  ) {
    return new StateImpl(value, parent);
  }

  static proxy(state: any, intoMapper: any, fromMapper: any) {
    return new StateProxyImpl(state, intoMapper, fromMapper);
  }

  static optional(state: StateImpl<unknown>) {
    return new StateOptionalImpl({ type: "direct", atom: state as any });
  }

  //#endregion

  //#region Instance

  constructor(value: Value, parent?: Atom.Parent.Bare.Ref<"state", any, any>) {
    super(value, parent);

    // this.#initial = value;

    // const onInput = (event: Event) => {
    //   const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    //   const value = target.value as Value;
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

    // this.#onBlur = <Element extends HTMLElement>(
    //   event: React.FocusEvent<Element>,
    // ) => {
    //   this.trigger(change.atom.blur, true);
    //   this.#customOnBlur?.(event);
    // };

    // this.set = this.set.bind(this);
    // this.ref = this.ref.bind(this);
  }

  //#endregion

  //#region Value

  // #initial: Value;

  // get dirty(): boolean {
  //   if (this.__parent && "source" in this.__parent)
  //     return this.__parent.source.dirty;

  //   if (this.#cachedDirty === undefined)
  //     this.#cachedDirty = this.internal.dirty(this.#initial);
  //   return this.#cachedDirty as any;
  // }

  // useDirty<Enable extends boolean | undefined = undefined>(
  //   enable?: Enable,
  // ): Atom.Hooks.Result<Enable, boolean> {
  //   const getValue = useCallback(
  //     () => this.dirty,
  //     [
  //       // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
  //       this,
  //     ],
  //   );

  //   return useAtomHook({
  //     enable,
  //     // @ts-expect-error
  //     atom: this,
  //     getValue,
  //   }) as any;
  // }

  // get initial(): Value {
  //   return this.#initial;
  // }

  // commit() {
  //   this.#commit(this.value as any);

  //   // const wasDirty = this.dirty;
  //   // this.#initial = this.get();

  //   // TODO: Add tests for the new approach, before it was:
  //   //
  //   //   if (
  //   //     this.#internal instanceof InternalObjectState ||
  //   //     this.#internal instanceof InternalArrayState
  //   //   ) {
  //   //     this.#internal.forEach((atom: any) => atom.commit());
  //   //   }
  //   //   if (wasDirty) this.trigger(change.atom.commit, true);
  //   //
  //   // The problem was is that initial is set to `this.get()` and get
  //   // a new reference on state level. So a root initial internals have
  //   // different references than the children's `this.#initial` and produce
  //   // incorrect `this.dirty` value. The new approach fixes this issue.
  //   // I found it trying to make the `reset` method work correctly. I couln't
  //   // reproduce it fully in tests, so it still needs to be done.
  // }

  // // TODO: Add tests for this new approach
  // #commit(newInitial: Value, notify = true) {
  //   const wasDirty = notify && this.dirty;

  //   this.#initial = newInitial;
  //   if (
  //     this.internal instanceof AtomInternalObject ||
  //     this.internal instanceof AtomInternalArray
  //   ) {
  //     this.internal.forEach((state: any, key: any) =>
  //       state.#commit((newInitial as any)[key], notify),
  //     );
  //   }
  //   this.clearCache();

  //   if (notify && wasDirty) this.trigger(change.atom.commit, true);
  // }

  // // TODO: Add tests
  // reset() {
  //   const newInitial = this.#initial;
  //   this.set(newInitial);
  //   this.#commit(newInitial, false);

  //   // TODO: Add tests for the new approach, before it was (see `commit`):
  //   //   this.set(this.#initial);
  // }

  //#endregion

  //#region Meta

  override useMeta<Props extends State.Meta.Props | undefined = undefined>(
    _props?: Props,
  ): State.Meta<Props> {
    return {};
  }

  //#endregion

  //#region Events

  // ...

  //#endregion

  //#region Interop

  // #customOnBlur: any;

  // #onInput;
  // #onBlur;

  // control(props: any) {
  //   this.#customRef = props?.ref;
  //   this.#customOnBlur = props?.onBlur;

  //   return {
  //     name: this.name,
  //     ref: this.ref,
  //     onBlur: this.#onBlur,
  //   };
  // }

  // #element: HTMLElement | null = null;
  // #elementUnwatch: Atom.Unwatch | undefined;
  // #customRef:
  //   | React.RefCallback<Element>
  //   | React.RefObject<Element | null>
  //   | undefined;

  // ref<Element extends HTMLElement>(element: Element | null) {
  //   if (this.#customRef) {
  //     if (typeof this.#customRef === "function") this.#customRef(element);
  //     else this.#customRef.current = element;
  //   }

  //   if (this.#element === element) return;

  //   if (this.#element)
  //     this.#element.removeEventListener("input", this.#onInput(this.#element));

  //   if (this.#elementUnwatch) {
  //     this.#elementUnwatch();
  //     this.#elementUnwatch = undefined;
  //   }

  //   if (!element) return;

  //   switch (true) {
  //     case element instanceof HTMLInputElement:
  //     case element instanceof HTMLTextAreaElement:
  //       // TODO: Watch for changes and set the value
  //       element.value = String(this.value);
  //       this.#elementUnwatch = this.watch((value) => {
  //         element.value = String(value) as string;
  //       });
  //       break;
  //   }

  //   element.addEventListener("input", this.#onInput(element));
  //   this.#element = element;
  // }

  //#endregion

  //#region Validation

  // get errors() {
  //   // if (this.#cachedErrors)return this.#cachedErrors;
  //   // return (this.#cachedErrors = this.validation.at(this.path));
  //   return this.validationTree.at(this.path);
  // }

  // useErrors<Enable extends boolean | undefined = undefined>(
  //   enable?: Enable,
  // ): Atom.Hooks.Result<Enable, State.Error[]> {
  //   const getValue = useCallback(
  //     () => this.errors,
  //     [
  //       // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
  //       this,
  //     ],
  //   );

  //   const shouldRender = useCallback<UseAtomHook.ShouldRender<State.Error[]>>(
  //     (prev, next) =>
  //       !(
  //         next === prev ||
  //         (next.length === prev?.length &&
  //           next.every((error, index) => prev?.[index] === error))
  //       ),
  //     [],
  //   );

  //   return useAtomHook({
  //     enable,
  //     // @ts-ignore
  //     atom: this as FieldOld<any>,
  //     getValue,
  //     shouldRender,
  //   }) as any;
  // }

  // addError(error: any) {
  //   const changes = StateImpl.errorChangesFor(this.valid);
  //   this.validationTree.add(this.path, StateImpl.normalizeError(error));
  //   this.events.trigger(this.path, changes);
  // }

  // clearErrors() {
  //   if (this.valid) return;
  //   const errors = this.validationTree.nested(this.path);

  //   // First, we clear all errors, so that when we trigger changes, sync
  //   // handlers don't see the errors.
  //   // TODO: Add test for this case
  //   this.validationTree.clear(this.path);

  //   const errorsByPaths = Object.groupBy(errors, ([path]: any) =>
  //     AtomImpl.name(this.path),
  //   );

  //   const clearChanges = change.atom.errors | change.atom.valid;

  //   Object.values(errorsByPaths).forEach((group) => {
  //     const path = group?.[0]?.[0];
  //     if (!path) return;
  //     this.events.trigger(path, clearChanges);
  //   });
  // }

  // #validation = undefined;

  // get validationTree() {
  //   return (this.root.#validation ??= new ValidationTree());
  // }

  // get valid() {
  //   // TODO: Figure out if caching is needed here
  //   return !this.validationTree.nested(this.path).length;
  // }

  // useValid<Enable extends boolean | undefined = undefined>(
  //   enable?: Enable,
  // ): Atom.Hooks.Result<Enable, boolean> {
  //   const getValue = useCallback(
  //     () => this.valid,
  //     [
  //       // eslint-disable-next-line react-hooks/exhaustive-deps -- It can't handle this
  //       this,
  //     ],
  //   );

  //   return useAtomHook({
  //     enable,
  //     atom: this as any,
  //     getValue,
  //   }) as any;
  // }

  // async validate(validator: any) {
  //   this.clearErrors();
  //   // Withhold all the changes until the validation is resolved, so that
  //   // there're no chain reactions.
  //   // TODO: There's a problem with this approach, if the validation is async,
  //   // and hits external APIs, form interactions might not react as expected and
  //   // even lead to impossible state. Either block the form or make withhold
  //   // optional.
  //   this.withhold();
  //   await validator(this);
  //   this.unleash();
  // }

  //#endregion

  //#region Cache

  #cachedDirty: boolean | undefined;

  override clearCache() {
    AtomImpl.prototype.clearCache.call(this);
    this.#cachedDirty = undefined;
  }

  //#endregion
}

//#endregion

//#region FieldProxy

export class StateProxyImpl<Value> extends StateImpl<Value> {
  #source: StateImpl<unknown>;
  #brand = Symbol();
  #into: any;
  #from: any;
  #unsubs: Atom.Unwatch[] = [];

  constructor(source: StateImpl<unknown>, into: any, from: any) {
    const value = into(source.value, undefined);
    super(value, { source });

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
    StateImpl.prototype.deconstruct.call(this);
    this.#unsubs.forEach((unsub) => unsub());
    this.#unsubs = [];
  }

  //#region Computed

  connect(source: StateImpl<unknown>) {
    this.#source = source;
  }

  //#endregion
}

//#endregion

//#region StateOptional

export class StateOptionalImpl<Value> extends StateImpl<Value> {
  //#region Static

  static instances = new WeakMap<
    StateImpl<unknown>,
    StateOptionalImpl<unknown>
  >();

  static instance(state: StateImpl<unknown>): StateOptionalImpl<unknown> {
    let ref = StateOptionalImpl.instances.get(state);
    if (!ref) {
      ref = new StateOptionalImpl({ type: "direct", atom: state });
      StateOptionalImpl.instances.set(state, ref);
    }
    return ref;
  }

  //#endregion

  #target: Atom.BareOptionalTarget<StateImpl<unknown>>;

  constructor(target: Atom.BareOptionalTarget<StateImpl<unknown>>) {
    super(StateOptionalImpl.value(target) as any);

    this.#target = target;

    this.#try = this.#try.bind(this);
  }

  override get value(): Value {
    return StateOptionalImpl.value(this.#target) as any;
  }

  //#region Value

  static value(target: Atom.BareOptionalTarget<StateImpl<unknown>>) {
    if (target.type !== "direct") return undefined;
    return target.atom.value;
  }

  //#endregion

  //#region Tree

  override at<Key extends keyof Utils.NonNullish<Value>>(key: Key): any {
    let target: Atom.BareOptionalTarget<StateImpl<unknown>>;
    if (this.#target.type === "direct") {
      const atom = (this.#target.atom.at as any)(key as any);
      target = atom
        ? ({
            type: "direct",
            atom,
          } as any)
        : { type: "shadow", closest: this.#target.atom, path: [key] };
    } else {
      target = {
        type: "shadow",
        closest: this.#target.closest,
        path: [...this.#target.path, String(key)],
      };
    }

    return new StateOptionalImpl(target);
  }

  #try: Atom.BareTry<AtomImpl<Value[keyof Value]>, keyof Value> = (key) => {
    // If it is a shadow atom, there can't be anything to try.
    if (this.#target.type !== "direct") return;
    // @ts-expect-error
    const atom = this.#target.atom.try?.(key);
    return atom && (StateOptionalImpl.instance(atom as any) as any);
  };

  override get try():
    | Atom.BareTry<AtomImpl<Value[keyof Value]>, keyof Value>
    | undefined
    | null {
    return this.#try;
  }

  //#endregion

  //#region Validation

  // override addError(error: State.Error | string): void {
  //   const path = this.#targetPath();
  //   const root = this.#targetRoot();

  //   // If there are any nested errors at this path, field is not valid.
  //   const wasValid = !root.validationTree.nested(path).length;
  //   const changes = StateImpl.errorChangesFor(wasValid);

  //   root.validationTree.add(path, StateImpl.normalizeError(error));
  //   root.events.trigger(path, changes);
  // }

  //#endregion

  //#region Optional

  // #targetPath(): Atom.Path {
  //   return this.#target.type === "direct"
  //     ? this.#target.atom.path
  //     : [...this.#target.closest.path, ...this.#target.path];
  // }

  // #targetRoot(): StateImpl<any> {
  //   return this.#target.type === "direct"
  //     ? (this.#target.atom.root as any)
  //     : (this.#target.closest.root as any);
  // }

  //#endregion
}

//#endregion
