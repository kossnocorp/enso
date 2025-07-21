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
    type NumberProp = Atom.Value<number>;

    tyst<NumberProp>({} as number);
    // @ts-expect-error
    tyst<NumberProp>({} as string);
    // @ts-expect-error
    tyst<NumberProp>({} as unknown);
  }

  // Object
  {
    type AnyProp = Atom.Value<Entity>;

    tyst<AnyProp>({} as Entity);
    tyst<AnyProp>({} as User);
    tyst<AnyProp>({} as Atom.Value<User>);
    tyst<AnyProp>({} as Account);
    tyst<AnyProp>({} as any);
    // @ts-expect-error
    tyst<AnyProp>({} as Hello);
    // @ts-expect-error
    tyst<AnyProp>({} as unknown);
  }

  // Mixed
  {
    type AnyProp = Atom.Value<Entity | number>;

    tyst<AnyProp>({} as Entity);
    tyst<AnyProp>({} as number);
    tyst<AnyProp>({} as Atom.Value<User>);
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
    type AnyProp = Atom.Value<any>;

    tyst<AnyProp>({} as number);
    tyst<AnyProp>({} as unknown);
  }

  // Unknown
  {
    type AnyProp = Atom.Value<unknown>;

    // @ts-expect-error
    tyst<AnyProp>({} as any);
    // @ts-expect-error
    tyst<AnyProp>({} as number);
    // @ts-expect-error
    tyst<AnyProp>({} as unknown);
    // @ts-expect-error
    tyst<AnyProp>({} as Atom.Value<number>);
    // @ts-expect-error
    tyst<AnyProp>({} as Atom.Value<User>);
  }

  // Union
  {
    type UnionProp = Atom.Value<string | number>;

    tyst<UnionProp>({} as string | number);
    tyst<UnionProp>({} as number);
    tyst<UnionProp>({} as string);
    // @ts-expect-error
    tyst<UnionProp>({} as unknown);
    // @ts-expect-error
    tyst<UnionProp>({} as Atom.Value<boolean>);
    // @ts-expect-error
    tyst<UnionProp>({} as Atom.Value<User>);
  }

  // Nullish
  {
    type NullishProp = Atom.Value<string | undefined | null>;

    tyst<NullishProp>({} as string | undefined | null);
    tyst<NullishProp>({} as string);
    tyst<NullishProp>(undefined);
    tyst<NullishProp>(null);
    // @ts-expect-error
    tyst<NullishProp>({} as unknown);
    // @ts-expect-error
    tyst<NullishProp>({} as Atom.Value<boolean>);
    // @ts-expect-error
    tyst<NullishProp>({} as Atom.Value<User>);
  }

  // Branded
  {
    type Branded<Value> = Value & { [brand]: true };

    // Number
    {
      type NumberProp = Atom.Value<Branded<number>>;

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
      type StringProp = Atom.Value<Branded<string>>;

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
      type BooleanProp = Atom.Value<Branded<boolean>>;

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
      type SymbolProp = Atom.Value<Branded<symbol>>;

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
  type BaseValue = Atom.Base.Value.Base<
    Atom.Envelop<any, Account> | Atom.Envelop<any, User>
  >;

  tyst<BaseValue>({} as Account);
  tyst<BaseValue>({} as User);
  // @ts-expect-error
  tyst<BaseValue>({} as Entity);
  // @ts-expect-error
  tyst<BaseValue>(unknown);
}
//#endregion

//#region Atom.Base.Value.Shared
{
  type NoSharedValue = Atom.Base.Value.Shared<
    Atom.Envelop<any, Account> | Atom.Envelop<any, User>
  >;

  tyst<never>({} as NoSharedValue);
  // @ts-expect-error
  tyst<NoSharedValue>({} as any);

  type SharedValue = Atom.Base.Value.Shared<
    Atom.Envelop<any, User | undefined> | Atom.Envelop<any, User>
  >;

  tyst<SharedValue>({} as User);
  // @ts-expect-error
  tyst<SharedValue>({} as User | undefined);
  // @ts-expect-error
  tyst<SharedValue>({} as undefined);
  // @ts-expect-error
  tyst<SharedValue>({} as Account);
  // @ts-expect-error
  tyst<SharedValue>({} as Entity);
  // @ts-expect-error
  tyst<SharedValue>(unknown);
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
    type NumberProp = Atom.$.Prop<"field", number>;

    const _test: NumberProp = {} as any;
    _test satisfies undefined;

    tyst<NumberProp>(undefined as Atom.$.Prop<"field", number>);
    tyst<NumberProp>(undefined as Atom.$.Prop<"field", Branded<number>>);
  }

  // Branded primitive
  {
    type BrandedProp = Atom.$.Prop<"field", Branded<number>>;

    const _test: BrandedProp = {} as any;
    _test satisfies undefined;

    tyst<BrandedProp>(undefined as Atom.$.Prop<"field", string>);
  }

  // Object
  {
    type ObjectProp = Atom.$.Prop<"field", Entity>;

    tyst<ObjectProp>({} as Atom.$.Prop<"field", User>);
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
    tyst<AnyProp>({} as Atom.$.Prop<"field", any>);
    tyst<AnyProp>({} as Atom.$.Prop<"field", unknown>);
    tyst<AnyProp>(undefined as Atom.$.Prop<"field", string>);
  }

  // Unknown
  {
    type UnknownProp = Atom.$.Prop<"field", unknown>;

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
