import React, { DependencyList, FocusEventHandler, ReactElement } from "react";
import type { Atom } from "../atom/index.js";
import type { EnsoUtils as Utils } from "../utils.ts";

const hintSymbol = Symbol();

export declare class Field<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >
  extends Atom<"field" | "exact", Atom.Def<Value>, Qualifier, Parent>
  implements
    Utils.StaticImplements<
      typeof Field<Value, Qualifier, Parent>,
      Atom.Static.Subclass<"field">
    >,
    Field.Exact<Value, Qualifier, Parent>
{
  //#region Static

  // Atom

  static create<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  >(
    value: Value,
    parent?: Atom.Parent.Ref<"field", Qualifier, Parent>,
  ): Atom.Envelop<"field" | "exact", Atom.Def<Value>, Qualifier, Parent>;

  static base<Envelop extends Field<any>>(
    field: Envelop,
  ): Atom.Base.Result<"field", Envelop>;

  static proxy<
    Variant extends Atom.Flavor.Variant,
    ValueDef extends Atom.Def.Constraint,
    ComputedValue,
    MappedValue,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  >(
    field: Atom.Envelop<"field" | Variant, ValueDef, Qualifier, Parent>,
    intoMapper: Atom.Proxy.Into.Mapper<ValueDef, ComputedValue>,
    fromMapper: Atom.Proxy.From.Mapper<ValueDef, ComputedValue, MappedValue>,
  ): Atom.Proxy.Envelop<
    "field" | "exact",
    ValueDef,
    ComputedValue,
    Qualifier,
    Parent
  >;

  static use<Value>(
    initialValue: Value,
    deps: DependencyList,
  ): Field.Exact<Value>;

  static useEnsure<
    FieldType extends Atom.Envelop<"field", any> | Utils.Nullish,
    MappedValue = undefined,
  >(
    field: FieldType,
    map?: Atom.Static.Ensure.Mapper<"field", FieldType, MappedValue>,
  ): Atom.Static.Ensure.Result<"field", FieldType, MappedValue>;

  // Field

  static Component<
    Value,
    MetaEnable extends boolean | undefined = undefined,
    DirtyEnable extends boolean = false,
    ErrorsEnable extends boolean = false,
    ValidEnable extends boolean = false,
  >(
    props: Field.Component.Props<
      Value,
      MetaEnable,
      DirtyEnable,
      ErrorsEnable,
      ValidEnable
    >,
  ): ReactElement<HTMLElement>;

  //#endregion

  //#region Instance

  [hintSymbol]: true;

  //#endregion

  //#region Value

  get dirty(): boolean;

  useDirty: Field.Dirty.Use.Prop<Qualifier>;

  commit: Field.Commit.Prop<Qualifier>;

  reset: Field.Reset.Prop<Qualifier>;

  get initial(): Atom.Value.Prop<Atom.Def<Value>>;

  //#endregion

  //#region Meta

  // TODO: useMeta

  //#endregion

  //#region Interop

  control<Element extends HTMLElement>(
    props?: Field.Control.Props<Element>,
  ): Field.Control.Registration<Element>;

  ref<Element extends HTMLElement>(element: Element | null): void;

  //#endregion

  //#region Validation

  get errors(): Field.Error[];

  useErrors: Field.Errors.Use.Prop<Qualifier>;

  get valid(): boolean;

  useValid: Field.Valid.Use.Prop<Qualifier>;

  validate: Field.Validate.Prop<Value, Qualifier>;

  addError: Field.AddError.Prop;

  clearErrors(): void;

  //#endregion
}

export namespace Field {
  export type Envelop<
    Flavor extends Atom.Flavor.Constraint,
    ValueDef extends Atom.Def.Constraint,
    Qualifier extends Atom.Qualifier.Constraint,
    Parent extends Atom.Parent.Constraint<ValueDef>,
  > = "immutable" extends Flavor
    ? Immutable.Internal<ValueDef, Qualifier, Parent>
    : "optional" extends Flavor
      ? Optional.Internal<ValueDef, Qualifier, Parent>
      : "base" extends Flavor
        ? Base.Internal<ValueDef, Qualifier, Parent>
        : "exact" extends Flavor
          ? Exact.Internal<ValueDef, Qualifier, Parent>
          : never;

  //#region Interface

  //#region Exact

  export interface Exact<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Exact.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Exact {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Ish.Value.Write<Qualifier>,
        Atom.Exact<"field" | "exact", ValueDef, Qualifier, Parent>,
        Immutable.Interface<"exact", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > extends Ish.Value.Write<Qualifier>,
        Atom.Exact<"field" | Variant, Atom.Def<Value>, Qualifier, Parent>,
        Immutable.Interface<Variant, Atom.Def<Value>, Qualifier, Parent> {}
  }

  //#endregion

  //#region Base

  export interface Base<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Base.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Base {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Base.Interface<"base", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<Variant, ValueDef, Qualifier, Parent> {}

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "base",
      Atom.Def<Value>,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  //#endregion

  //#region Optional

  export interface Optional<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Optional.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Optional {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Optional.Interface<"optional", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<Variant, ValueDef, Qualifier, Parent> {}

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "optional",
      Atom.Def<Value>,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  //#endregion

  //#region Immutable

  export interface Immutable<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > extends Immutable.Internal<Atom.Def<Value>, Qualifier, Parent> {}

  export namespace Immutable {
    export interface Internal<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Immutable.Interface<"immutable", ValueDef, Qualifier, Parent> {}

    export interface Interface<
      Variant extends Atom.Flavor.Variant,
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<ValueDef> = Atom.Parent.Default,
    > extends Ish.Value.Read<ValueDef, Qualifier>,
        Ish.Validation<ValueDef, Qualifier>,
        Atom.Immutable<"field" | Variant, ValueDef, Qualifier, Parent> {
      [hintSymbol]: true;

      control<Element extends HTMLElement>(
        props?: Field.Control.Props<Element>,
      ): Field.Control.Registration<Element>;

      ref<Element extends HTMLElement>(element: Element | null): void;
    }

    export type Discriminated<
      Value,
      Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Atom.Discriminate.Result<
      "field" | "immutable",
      Atom.Def<Value>,
      Discriminator,
      Qualifier,
      Parent
    >;
  }

  //#endregion

  //#region Shared

  export type Shared<
    ValueTuple extends Atom.Shared.Value.Tuple,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Shared.Def<ValueTuple>
    > = Atom.Parent.Default,
  > = Shared.Exact<ValueTuple, Qualifier, Parent>;

  export namespace Shared {
    export type Def<ValueTuple extends Atom.Shared.Value.Tuple> =
      Atom.Shared.Def<ValueTuple>;

    export type Proxy<ValueTuple extends Atom.Shared.Value.Tuple> =
      Atom.Proxy.Qualifier<Atom.Shared.Def<ValueTuple>>;

    export type Exact<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = Field.Exact.Internal<Atom.Shared.Def<ValueTuple>, Qualifier, Parent>;

    export type Base<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = Field.Base.Internal<Atom.Shared.Def<ValueTuple>, Qualifier, Parent>;

    export type Immutable<
      ValueTuple extends Atom.Shared.Value.Tuple,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Shared.Def<ValueTuple>
      > = Atom.Parent.Default,
    > = Field.Immutable.Internal<
      Atom.Shared.Def<ValueTuple>,
      Qualifier,
      Parent
    >;
  }

  //#endregion

  //#region Ref

  export type Ref<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Field.Immutable<Value, Qualifier | "ref", Parent>;

  export namespace Ref {
    export type Optional<
      Value,
      Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
      Parent extends Atom.Parent.Constraint<
        Atom.Def<Value>
      > = Atom.Parent.Default,
    > = Field.Optional<Value, Qualifier | "ref", Parent>;
  }

  //#endregion

  //#region Fieldish

  export namespace Ish {
    export namespace Value {
      export interface Read<
        ValueDef extends Atom.Def.Constraint,
        Qualifier extends Atom.Qualifier.Constraint,
      > {
        initial: Atom.Value.Prop<ValueDef>;

        dirty: boolean;

        useDirty: Dirty.Use.Prop<Qualifier>;
      }

      export interface Write<Qualifier extends Atom.Qualifier.Constraint> {
        commit: Commit.Prop<Qualifier>;

        reset: Reset.Prop<Qualifier>;
      }
    }

    export interface Validation<
      ValueDef extends Atom.Def.Constraint,
      Qualifier extends Atom.Qualifier.Constraint,
    > {
      errors: Field.Error[];

      useErrors: Field.Errors.Use.Prop<Qualifier>;

      valid: boolean;

      useValid: Field.Valid.Use.Prop<Qualifier>;

      validate: Validate.Prop<ValueDef["read"], Qualifier>;

      addError: Field.AddError.Prop;

      clearErrors(): void;
    }
  }

  //#endregion

  //#endregion

  //#region Value

  export type Def<ReadValue, WriteValue = ReadValue> = Atom.Def<
    ReadValue,
    WriteValue
  >;

  export namespace Value {
    export namespace Use {
      export type IncludeMeta<Props extends Use.Props | undefined> =
        undefined extends Props
          ? false
          : Props extends Use.Props
            ? Props["meta"] extends true
              ? true
              : Props["meta"] extends false
                ? false
                : Props["valid"] extends true
                  ? true
                  : Props["dirty"] extends true
                    ? true
                    : false
            : false;

      export interface Props extends Meta.Props {
        meta?: boolean | undefined;
      }
    }
  }

  export namespace Dirty {
    export namespace Use {
      export type Prop<Qualifier extends Atom.Qualifier.Constraint> =
        Atom.Qualifier.Ref.DisableFor<Qualifier, Fn>;

      export interface Fn {
        (): boolean;
      }
    }
  }

  export namespace Commit {
    export type Prop<Qualifier extends Atom.Qualifier.Constraint> =
      Atom.Qualifier.Ref.DisableFor<Qualifier, Fn>;

    export interface Fn {
      (): void;
    }
  }

  export namespace Reset {
    export type Prop<Qualifier extends Atom.Qualifier.Constraint> =
      Atom.Qualifier.Ref.DisableFor<Qualifier, Fn>;

    export interface Fn {
      (): void;
    }
  }

  //#endregion

  //#region Tree

  export type Parent<
    ParentValue,
    Key extends keyof ParentValue,
  > = Atom.Parent.Interface<ParentValue, Key>;

  //#endregion

  //#region Events

  export type Unwatch = Atom.Unwatch;

  //#endregion

  //#region Transform

  export type Decomposed<
    Value,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Atom.Decompose.Result<"field", Atom.Def<Value>, Qualifier, Parent>;

  export type Discriminated<
    Value,
    Discriminator extends Atom.Discriminate.Discriminator<Atom.Def<Value>>,
    Qualifier extends Atom.Qualifier.Constraint = Atom.Qualifier.Default,
    Parent extends Atom.Parent.Constraint<
      Atom.Def<Value>
    > = Atom.Parent.Default,
  > = Atom.Discriminate.Result<
    "field" | "exact",
    Atom.Def<Value>,
    Discriminator,
    Qualifier,
    Parent
  >;

  export type Proxy<SourceValue = any> = Atom.Proxy.Qualifier<
    Atom.Def<SourceValue>
  >;

  //#endregion

  //#region Meta

  export type Meta<Props extends Meta.Props | undefined> =
    Props extends Meta.Props
      ? {
          valid: Meta.Enable<Props["valid"], boolean>;
          errors: Meta.Enable<Props["errors"], Error[]>;
          dirty: Meta.Enable<Props["dirty"], boolean>;
        }
      : {
          valid: boolean;
          errors: Error[];
          dirty: boolean;
        };

  export namespace Meta {
    export interface Props {
      valid?: boolean | undefined;
      errors?: boolean | undefined;
      dirty?: boolean | undefined;
    }

    export type Enable<Enable, Value> = Enable extends true
      ? Value
      : Enable extends false
        ? undefined
        : Enable extends boolean
          ? Value | undefined
          : Enable extends undefined
            ? undefined
            : never;
  }

  //#endregion

  //#region Form

  //#region Control

  export namespace Control {
    export interface Props<Element extends HTMLElement> {
      ref?:
        | React.RefCallback<Element>
        | React.RefObject<Element | null>
        | undefined;
      onBlur?: FocusEventHandler<Element> | undefined;
    }

    export interface Registration<Element extends HTMLElement> {
      name: string;
      ref: React.RefCallback<Element>;
      onBlur: FocusEventHandler<Element>;
    }
  }

  //#endregion

  //#region Component

  export namespace Component {
    export type Props<
      Value,
      MetaEnable extends boolean | undefined = undefined,
      DirtyEnable extends boolean = false,
      ErrorsEnable extends boolean = false,
      ValidEnable extends boolean = false,
    > = {
      field: Field<Value>;
      render: Render<
        Value,
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

    export type Render<Value, MetaProps extends Meta.Props | undefined> = (
      input: Input<Value>,
      meta: Meta<MetaProps>,
    ) => React.ReactNode;
  }

  //#endregion

  //#region Input

  export type Input<Value> = {
    name: string;
    value: Value;
    onChange: Input.OnChange<Value>;
    onBlur: FocusEventHandler<Element>;
  };

  export namespace Input {
    export type OnChange<Value> = (value: Value) => void;
  }

  //#endregion

  //#endregion

  //#region Validation

  export interface Error {
    type?: string | undefined;
    message: string;
  }

  export namespace Error {
    export type Type = Error | string;
  }

  export namespace Valid {
    export namespace Use {
      export type Prop<Qualifier extends Atom.Qualifier.Constraint> =
        Atom.Qualifier.Ref.DisableFor<Qualifier, Fn>;

      export interface Fn {
        (): boolean;
      }
    }
  }

  export interface Validator<Value> {
    (field: Field.Immutable<Value, "ref">): Promise<void> | void;
  }

  export namespace Validate {
    export type Prop<
      Value,
      Qualifier extends Atom.Qualifier.Constraint,
    > = Atom.Qualifier.Ref.DisableFor<Qualifier, Fn<Value>>;

    export interface Fn<Value> {
      (validator: Field.Validator<Value>): Promise<void>;
    }
  }

  export namespace Errors {
    export namespace Use {
      export type Prop<Qualifier extends Atom.Qualifier.Constraint> =
        Atom.Qualifier.Ref.DisableFor<Qualifier, Fn>;

      export interface Fn {
        (): Field.Error[];
      }
    }
  }

  export namespace AddError {
    export type Prop = Fn;

    export interface Fn {
      (error: Error.Type): void;
    }
  }

  //#endregion
}
