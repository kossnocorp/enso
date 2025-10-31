"use client";

import type { Atom } from "../atom/definition.ts";
import {
  AtomImpl,
  AtomOptionalInternal,
  AtomProxyInternal,
} from "../atom/implementation.ts";
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

  static optional(
    target: Atom.BareOptionalTarget<"state", StateImpl<unknown>>,
  ) {
    return new StateOptionalImpl(target);
  }

  //#endregion

  //#region Instance

  constructor(value: Value, parent?: Atom.Parent.Bare.Ref<"state", any, any>) {
    super(value, parent as any);
  }

  //#endregion

  //#region Meta

  override useMeta<Props extends State.Meta.Props | undefined = undefined>(
    _props?: Props,
  ): State.Meta<Props> {
    return {};
  }

  //#endregion

  //#region Cache

  override clearCache() {
    AtomImpl.prototype.clearCache.call(this);
  }

  //#endregion
}

//#endregion

//#region StateProxy

export class StateProxyImpl<Value> extends StateImpl<Value> {
  #internal: AtomProxyInternal<"state", Value>;

  constructor(source: StateImpl<unknown>, into: any, from: any) {
    const value = into(source.value, undefined);
    super(value, { source });

    this.#internal = new AtomProxyInternal(this as any, source, into, from);
  }

  override deconstruct() {
    this.#internal.deconstruct();
  }

  connect(source: StateImpl<unknown>) {
    this.#internal.connect(source);
  }
}

//#endregion

//#region StateOptional

export class StateOptionalImpl<Value> extends StateImpl<Value> {
  #internal: AtomOptionalInternal<"state", Value>;

  constructor(target: Atom.BareOptionalTarget<"state", StateImpl<unknown>>) {
    super(AtomOptionalInternal.value("state", target) as any);

    this.#internal = new AtomOptionalInternal(this, target);
  }

  //#region Value

  override get value(): Value {
    return this.#internal.value;
  }

  //#endregion

  //#region Tree

  override at<Key extends keyof Utils.NonNullish<Value>>(key: Key): any {
    return this.#internal.at(key);
  }

  override get try():
    | Atom.BareTry<AtomImpl<Value[keyof Value]>, keyof Value>
    | undefined
    | null {
    return this.#internal.try;
  }

  //#endregion
}

//#endregion
