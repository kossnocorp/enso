import { EnsoUtils as Utils } from "../utils.ts";
import { Atom } from "./index.js";

//#region Static

//#region Atom.safeNullish
{
  tyst<undefined>(Atom.safeNullish(undefined));
  tyst<null>(Atom.safeNullish(null));
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
    type NumberProp = Atom.Value.Opaque<number>;

    tyst<NumberProp>({} as number);
    // @ts-expect-error
    tyst<NumberProp>({} as string);
    // @ts-expect-error
    tyst<NumberProp>({} as unknown);
  }

  // Object
  {
    type AnyProp = Atom.Value.Opaque<Entity>;

    tyst<AnyProp>({} as Entity);
    tyst<AnyProp>({} as User);
    tyst<AnyProp>({} as Atom.Value.Opaque<User>);
    tyst<AnyProp>({} as Account);
    tyst<AnyProp>({} as any);
    // @ts-expect-error
    tyst<AnyProp>({} as Hello);
    // @ts-expect-error
    tyst<AnyProp>({} as unknown);
  }

  // Mixed
  {
    type AnyProp = Atom.Value.Opaque<Entity | number>;

    tyst<AnyProp>({} as Entity);
    tyst<AnyProp>({} as number);
    tyst<AnyProp>({} as Atom.Value.Opaque<User>);
    tyst<AnyProp>({} as Account);
    tyst<AnyProp>({} as any);
    // @ts-expect-error
    tyst<AnyProp>({} as Hello);
    // @ts-expect-error
    tyst<AnyProp>(string);
    // @ts-expect-error
    tyst<AnyProp>({} as unknown);
  }

  // Any
  {
    type AnyProp = Atom.Value.Opaque<any>;

    tyst<AnyProp>({} as number);
    tyst<AnyProp>({} as unknown);
  }

  // Unknown
  {
    type AnyProp = Atom.Value.Opaque<unknown>;

    // @ts-expect-error
    tyst<AnyProp>({} as any);
    // @ts-expect-error
    tyst<AnyProp>({} as number);
    // @ts-expect-error
    tyst<AnyProp>({} as unknown);
    // @ts-expect-error
    tyst<AnyProp>({} as Atom.Value.Opaque<number>);
    // @ts-expect-error
    tyst<AnyProp>({} as Atom.Value.Opaque<User>);
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
    Atom.Envelop<any, any, "bound"> | Atom.Envelop<any, any, "detachable">
  >;

  tyst<never>({} as NoSharedQualifier);
  // @ts-expect-error
  tyst<NoSharedQualifier>({} as any);

  type SharedQualifier = Atom.Base.Qualifier.Shared<
    | Atom.Envelop<any, any, "bound">
    | Atom.Envelop<any, any, "bound" | "detachable">
  >;

  tyst<SharedQualifier>("bound");
  // @ts-expect-error
  tyst<SharedQualifier>("bound" | "detachable");
  // @ts-expect-error
  tyst<SharedQualifier>("detachable");
  // @ts-expect-error
  tyst<SharedQualifier>(unknown);
}
//#endregion

//#region Atom.$.Prop
{
  // Primitive
  {
    type NumberProp = Atom.$.Prop<"field", Atom.Def<number>>;

    const _test: NumberProp = {} as any;
    _test satisfies undefined;

    tyst<NumberProp>(undefined as Atom.$.Prop<"field", Atom.Def<number>>);
    tyst<NumberProp>(
      undefined as Atom.$.Prop<"field", Atom.Def<Branded<number>>>,
    );
  }

  // Branded primitive
  {
    type BrandedProp = Atom.$.Prop<"field", Atom.Def<Branded<number>>>;

    const _test: BrandedProp = {} as any;
    _test satisfies undefined;

    tyst<BrandedProp>(undefined as Atom.$.Prop<"field", Atom.Def<string>>);
  }

  // Object
  {
    type ObjectProp = Atom.$.Prop<"field", Atom.Def<Entity>>;

    tyst<ObjectProp>({} as Atom.$.Prop<"field", Atom.Def<User>>);
    tyst<ObjectProp>({} as Atom.$.Prop<"field", any>);
    // @ts-expect-error
    tyst<ObjectProp>({} as User);
    // @ts-expect-error
    tyst<ObjectProp>({} as Atom.$.Prop<"field", Hello>);
  }

  // Any
  {
    type AnyProp = Atom.$.Prop<"field", any>;

    tyst<AnyProp>({} as unknown);
    tyst<AnyProp>({} as string);
    tyst<AnyProp>({} as Atom.$.Prop<"field", Atom.Def<any>>);
    tyst<AnyProp>({} as Atom.$.Prop<"field", Atom.Def<unknown>>);
    tyst<AnyProp>(undefined as Atom.$.Prop<"field", Atom.Def<string>>);
  }

  // Unknown
  {
    type UnknownProp = Atom.$.Prop<"field", Atom.Def<unknown>>;

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

//#region Atom.Qualifier.Map
{
  // Basic
  {
    tyst<Atom.Qualifier.Map<Atom.Qualifier.Default>>(
      {} as Atom.Qualifier.Map<"bound">,
    );
    tyst<Atom.Qualifier.Map<"bound">>(
      // @ts-expect-error
      {} as Atom.Qualifier.Map<Atom.Qualifier.Default>,
    );
  }

  // Proxied
  {
    tyst<Atom.Qualifier.Map<Atom.Qualifier.Default>>(
      {} as Atom.Qualifier.Map<Atom.Proxy.Qualifier<string>>,
    );
    tyst<Atom.Qualifier.Map<Atom.Proxy.Qualifier<string>>>(
      {} as Atom.Qualifier.Map<Atom.Proxy.Qualifier<any>>,
    );
    tyst<Atom.Qualifier.Map<Atom.Proxy.Qualifier<any>>>(
      {} as Atom.Qualifier.Map<Atom.Proxy.Qualifier<unknown>>,
    );
    tyst<Atom.Qualifier.Map<Atom.Proxy.Qualifier<string>>>(
      // @ts-expect-error
      {} as Atom.Qualifier.Map<Atom.Proxy.Qualifier<number>>,
    );
    tyst<Atom.Qualifier.Map<Atom.Proxy.Qualifier<any> | "bound">>(
      // @ts-expect-error
      {} as Atom.Qualifier.Map<Atom.Proxy.Qualifier<string>>,
    );
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
