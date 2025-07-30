import { EnsoUtils as Utils } from "../utils.ts";
import { Atom } from "./definition.ts";
import { ty } from "tysts";

//#region Static

//#region Atom.safeNullish
{
  ty(Atom.safeNullish(undefined)).is(ty<never>());
  ty(Atom.safeNullish(null)).is(ty<never>());
  tyst<keyof User | Utils.Nullish>(Atom.safeNullish(null));
  tyst<keyof User | Utils.Nullish>(
    Atom.safeNullish({} as keyof User | undefined | null),
  );
  tyst<keyof User | Utils.Nullish>(
    // @ts-expect-error
    Atom.safeNullish({} as keyof Account | null),
  );
  tyst<keyof User | Utils.Nullish>(
    // @ts-expect-error
    Atom.safeNullish({} as keyof User | number),
  );
  tyst<keyof User | Utils.Nullish>(
    // @ts-expect-error
    Atom.safeNullish("hello"),
  );
}
//#endregion

//#endregion

//#region Atom.Value
{
  // Primitive
  {
    ty<Atom.Value.Opaque<number>>().is(ty<number>());
  }

  // Object
  {
    ty<Atom.Value.Opaque<Entity>>()
      .is(ty.assignableFrom<Entity>())
      .is(ty.assignableFrom<User>())
      .is(ty.assignableFrom<Account>())
      .is.not(ty.assignableFrom<unknown>())
      .is(ty.assignableFrom<any>());
  }

  // Mixed
  {
    ty<Atom.Value.Opaque<Entity | number>>()
      .is(ty.assignableFrom<Entity>())
      .is(ty.assignableFrom<User>())
      .is(ty.assignableFrom<Account>())
      .is(ty.assignableFrom<number>())
      .is.not(ty.assignableFrom<unknown>())
      .is(ty.assignableFrom<any>());
  }

  // Any
  {
    ty<Atom.Value.Opaque<any>>()
      .is(ty.assignableFrom<number>())
      .is(ty.assignableFrom<null>())
      .is(ty.assignableFrom<unknown>())
      .is(ty.assignableFrom<any>());
  }

  // Unknown
  {
    ty<Atom.Value.Opaque<unknown>>()
      .is.not(ty.assignableFrom<number>())
      .is.not(ty.assignableFrom<null>())
      .is.not(ty.assignableFrom<unknown>())
      .is.not(ty.assignableFrom<any>());
  }

  // Union
  {
    type UnionProp = Atom.Value.Opaque<string | number>;

    tyst<UnionProp>({} as string | number);
    tyst<UnionProp>({} as number);
    tyst<UnionProp>({} as string);
    // @ts-expect-error
    tyst<UnionProp>({} as unknown);
    // @ts-expect-error
    tyst<UnionProp>({} as Atom.Value.Opaque<boolean>);
    // @ts-expect-error
    tyst<UnionProp>({} as Atom.Value.Opaque<User>);
  }

  // Nullish
  {
    type NullishProp = Atom.Value.Opaque<string | undefined | null>;

    tyst<NullishProp>({} as string | undefined | null);
    tyst<NullishProp>({} as string);
    tyst<NullishProp>(undefined);
    tyst<NullishProp>(null);
    // @ts-expect-error
    tyst<NullishProp>({} as unknown);
    // @ts-expect-error
    tyst<NullishProp>({} as Atom.Value.Opaque<boolean>);
    // @ts-expect-error
    tyst<NullishProp>({} as Atom.Value.Opaque<User>);
  }

  // Branded
  {
    type Branded<Value> = Value & { [brand]: true };

    // Number
    {
      type NumberProp = Atom.Value.Opaque<Branded<number>>;

      tyst<NumberProp>({} as Branded<number>);
      tyst<number>({} as NumberProp);
      // @ts-expect-error
      tyst<NumberProp>({} as number);
      // @ts-expect-error
      tyst<NumberProp>({} as string);
      // @ts-expect-error
      tyst<NumberProp>({} as unknown);
    }

    // String
    {
      type StringProp = Atom.Value.Opaque<Branded<string>>;

      tyst<StringProp>({} as Branded<string>);
      tyst<string>({} as StringProp);
      // @ts-expect-error
      tyst<StringProp>({} as string);
      // @ts-expect-error
      tyst<StringProp>({} as number);
      // @ts-expect-error
      tyst<StringProp>({} as unknown);
    }

    // Boolean
    {
      type BooleanProp = Atom.Value.Opaque<Branded<boolean>>;

      tyst<BooleanProp>({} as Branded<boolean>);
      tyst<boolean>({} as BooleanProp);
      // @ts-expect-error
      tyst<BooleanProp>({} as boolean);
      // @ts-expect-error
      tyst<BooleanProp>({} as number);
      // @ts-expect-error
      tyst<BooleanProp>({} as unknown);
    }

    // Symbol
    {
      type SymbolProp = Atom.Value.Opaque<Branded<symbol>>;

      tyst<SymbolProp>({} as Branded<symbol>);
      tyst<symbol>({} as SymbolProp);
      // @ts-expect-error
      tyst<SymbolProp>({} as symbol);
      // @ts-expect-error
      tyst<BooleanProp>({} as number);
      // @ts-expect-error
      tyst<BooleanProp>({} as unknown);
    }
  }
}
//#endregion

//#region Atom.Base.Value.Base
{
  type BaseValue = Atom.Base.Value.BaseDef<
    Atom.Envelop<any, Atom.Def<Account>> | Atom.Envelop<any, Atom.Def<User>>
  >;

  tyst<BaseValue>({} as Atom.Def<Account>);
  tyst<BaseValue>({} as Atom.Def<User>);
  // @ts-expect-error
  tyst<BaseValue>({} as Atom.Def<Entity>);
  // @ts-expect-error
  tyst<BaseValue>({} as Atom.Def<unknown>);
}
//#endregion

//#region Atom.Base.Value.Shared
{
  type NoSharedValue = Atom.Base.Value.Shared<
    Atom.Envelop<any, Atom.Def<Account>> | Atom.Envelop<any, Atom.Def<User>>
  >;

  tyst<never>({} as NoSharedValue);
  // @ts-expect-error
  tyst<NoSharedValue>({} as any);

  type SharedValue = Atom.Base.Value.Shared<
    | Atom.Envelop<any, Atom.Def<User | undefined>>
    | Atom.Envelop<any, Atom.Def<User>>
  >;

  tyst<SharedValue>({} as Atom.Def<User>);
  // @ts-expect-error
  tyst<SharedValue>({} as Atom.Def<User | undefined>);
  // @ts-expect-error
  tyst<SharedValue>({} as Atom.Def<undefined>);
  // @ts-expect-error
  tyst<SharedValue>({} as Atom.Def<Account>);
  // @ts-expect-error
  tyst<SharedValue>({} as Atom.Def<Entity>);
  // @ts-expect-error
  tyst<SharedValue>({} as Atom.Def<unknown>);
}
//#endregion

//#region Atom.Base.Qualifier.Shared
{
  type NoSharedQualifier = Atom.Base.Qualifier.Shared<
    | Atom.Envelop<any, any, { bound: true }>
    | Atom.Envelop<any, any, { detachable: true }>
  >;
  ty<NoSharedQualifier>().is(ty<{}>());

  type SharedQualifier = Atom.Base.Qualifier.Shared<
    | Atom.Envelop<any, any, { bound: true }>
    | Atom.Envelop<any, any, { bound: true; detachable: true }>
  >;
  ty<SharedQualifier>().is(ty<{ bound: true }>());
}
//#endregion

//#region Atom.$.Prop
{
  // Primitive
  {
    type NumberProp = Atom.$.Prop<"field", number, never>;

    const _test: NumberProp = {} as any;
    _test satisfies undefined;

    tyst<NumberProp>(undefined as Atom.$.Prop<"field", number, never>);
    tyst<NumberProp>(undefined as Atom.$.Prop<"field", Branded<number>, never>);
  }

  // Branded primitive
  {
    type BrandedProp = Atom.$.Prop<"field", Branded<number>, never>;

    const _test: BrandedProp = {} as any;
    _test satisfies undefined;

    tyst<BrandedProp>(undefined as Atom.$.Prop<"field", string, never>);
  }

  // Object
  {
    type ObjectProp = Atom.$.Prop<"field", Entity, never>;

    tyst<ObjectProp>({} as Atom.$.Prop<"field", User, never>);
    tyst<ObjectProp>({} as Atom.$.Prop<"field", any, never>);
    // @ts-expect-error
    tyst<ObjectProp>({} as User);
    // @ts-expect-error
    tyst<ObjectProp>({} as Atom.$.Prop<"field", Hello>);
  }

  // Any
  {
    type AnyProp = Atom.$.Prop<"field", any, never>;

    tyst<AnyProp>({} as unknown);
    tyst<AnyProp>({} as string);
    tyst<AnyProp>({} as Atom.$.Prop<"field", any, never>);
    tyst<AnyProp>({} as Atom.$.Prop<"field", unknown, never>);
    tyst<AnyProp>(undefined as Atom.$.Prop<"field", string, never>);
  }

  // Unknown
  {
    type UnknownProp = Atom.$.Prop<"field", unknown, never>;

    // @ts-expect-error
    tyst<UnknownProp>({} as Atom.$.Prop<"field", any>);
    // @ts-expect-error
    tyst<UnknownProp>({} as any);
    // @ts-expect-error
    tyst<UnknownProp>({} as unknown);
    // @ts-expect-error
    tyst<UnknownProp>({} as string);
  }
}
//#endregion

//#region Atom.Qualifier.Internalize
{
  // Basic
  {
    ty<Atom.Qualifier.Internalize<Atom.Qualifier.External.Default>>().is(
      ty<{}>(),
    );
    ty<Atom.Qualifier.Internalize<"bound">>().is(ty<{ bound: true }>());
    ty<Atom.Qualifier.Internalize<"bound" | "detachable">>().is(
      ty<{ bound: true; detachable: true }>(),
    );
    ty<Atom.Qualifier.Internalize<never>>().is(ty<{}>());
    ty<Atom.Qualifier.Internalize<any>>().is(
      ty<{
        root: true;
        detachable: true;
        tried: true;
        bound: true;
        ref: true;
      }>(),
    );
  }

  // Proxied
  {
    ty<Atom.Qualifier.Internalize<Atom.Proxy.Qualifier<string>>>().is(
      ty<{ source: string }>(),
    );

    ty<
      Atom.Qualifier.Internalize<Atom.Proxy.Qualifier<string> | "detachable">
    >().is(ty<{ source: string; detachable: true }>());
  }
}
//#endregion

//#region Atom.Shared.Def
{
  // Basic
  {
    type Prop = Atom.Shared.Def<[number, number | undefined]>;

    tyst<Prop>({} as Atom.Def<number | undefined, number>);
  }
}
//#endregion

//#region Atom.Shared.Result.Tuple
{
  // Exact
  {
    // Wide
    {
      type Tuple = Atom.Shared.Result.Tuple<
        "field" | "exact",
        Atom.Def<number>,
        [number, number | undefined]
      >;
      tyst<Tuple>({} as [number, number | undefined]);
    }

    // Narrow
    {
      type Tuple = Atom.Shared.Result.Tuple<
        "field" | "exact",
        Atom.Def<number | undefined>,
        [number, number | undefined]
      >;
      tyst<Tuple>({} as [number, number | undefined]);
    }
  }

  // Base
  {
    // Wide
    {
      type Tuple = Atom.Shared.Result.Tuple<
        "field" | "base",
        Atom.Def<number>,
        [number, number | undefined]
      >;
      tyst<Tuple>({} as [number, number | undefined]);
    }

    // Narrow
    {
      type Tuple = Atom.Shared.Result.Tuple<
        "field" | "base",
        Atom.Def<number | undefined>,
        [number, number | undefined]
      >;
      tyst<Tuple>({} as [number, number | undefined]);
    }
  }
}
//#endregion

//#region Atom.Shared.Result.ExcludeSubclasses
{
  // Exact
  {
    type Excluded = Atom.Shared.Result.ExcludeSubclasses<
      Entity,
      Entity | undefined | number
    >;
    tyst<Excluded>({} as Entity | undefined | number);
  }

  // Subclass
  {
    type Excluded = Atom.Shared.Result.ExcludeSubclasses<
      User,
      Entity | undefined | number
    >;
    tyst<Excluded>({} as User | undefined | number);
  }
}
//#endregion

//#region Atom.Shared.Result.Sharable
{
  // Sharable
  {
    type Sharable = Atom.Shared.Result.Sharable<
      [Entity | undefined | number, Entity | undefined, Entity]
    >;
    tyst<true>({} as Sharable);
    // @ts-expect-error
    tyst<false>({} as Sharable);
  }

  // Mismatch
  {
    type Sharable = Atom.Shared.Result.Sharable<
      [Entity | undefined | number, Entity | undefined, Entity | null]
    >;
    tyst<false>({} as Sharable);
    // @ts-expect-error
    tyst<true>({} as Sharable);
  }

  // Mixed
  {
    type Sharable = Atom.Shared.Result.Sharable<
      [string | number, string | number | undefined, number]
    >;
    tyst<true>({} as Sharable);
    // @ts-expect-error
    tyst<false>({} as Sharable);
  }
}
//#endregion

//#region Atom.Shared.Result.Extends
{
  // Extends
  {
    type Extends = Atom.Shared.Result.Extends<
      Entity,
      [Entity | undefined | number, Entity | undefined, Entity]
    >;
    tyst<true>({} as Extends);
    // @ts-expect-error
    tyst<false>({} as Extends);
  }

  // Mismatch
  {
    type Extends = Atom.Shared.Result.Extends<
      Entity,
      [Entity | undefined | number, Entity | undefined, Entity | null]
    >;
    tyst<false>({} as Extends);
    // @ts-expect-error
    tyst<true>({} as Extends);
  }

  // Extends base
  {
    type Extends = Atom.Shared.Result.Extends<
      User,
      [Entity | undefined | number, Entity | undefined, Entity]
    >;
    tyst<true>({} as Extends);
    // @ts-expect-error
    tyst<false>({} as Extends);
  }
}
//#endregion

//#region Atom.Shared.Result.EachExtends
{
  // Extends
  {
    type Extends = Atom.Shared.Result.EachExtends<
      Entity | undefined | number,
      Entity | undefined | number
    >;
    tyst<true>({} as Extends);
    // @ts-expect-error
    tyst<false>({} as Extends);
  }

  // Wide
  {
    type Extends = Atom.Shared.Result.EachExtends<Entity, Entity | undefined>;
    tyst<false>({} as Extends);
    // @ts-expect-error
    tyst<true>({} as Extends);
  }

  // Narrow
  {
    type Extends = Atom.Shared.Result.EachExtends<Entity | undefined, Entity>;
    tyst<false>({} as Extends);
    // @ts-expect-error
    tyst<true>({} as Extends);
  }

  // Extends base
  {
    type Extends = Atom.Shared.Result.EachExtends<
      User | undefined,
      Entity | undefined
    >;
    tyst<true>({} as Extends);
    // @ts-expect-error
    tyst<false>({} as Extends);
  }

  // Extends with extra base
  {
    type Extends = Atom.Shared.Result.EachExtends<
      User | undefined,
      User | Entity | undefined
    >;
    tyst<true>({} as Extends);
    // @ts-expect-error
    tyst<false>({} as Extends);
  }

  // Mismatch union
  {
    type Extends = Atom.Shared.Result.EachExtends<
      User | undefined,
      User | Entity | undefined | Account
    >;
    tyst<false>({} as Extends);
    // @ts-expect-error
    tyst<true>({} as Extends);
  }

  // Mixed
  {
    type Extends = Atom.Shared.Result.EachExtends<string | number, number>;
    tyst<false>({} as Extends);
    // @ts-expect-error
    tyst<true>({} as Extends);
  }
}
//#endregion

//#region Helpers

function tyst<Type>(_arg: Type): void {}

interface Hello {
  hello: string;
}

interface Entity {
  name: string;
}

interface Account extends Entity {
  paid: boolean;
}

interface User extends Entity {
  age: number;
  email?: string;
}

type Branded<Type> = Type & { [brand]: true };
declare const brand: unique symbol;

//#endregion
