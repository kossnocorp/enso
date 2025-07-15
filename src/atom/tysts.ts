import { Atom } from "./index.js";

//#region Atom.Value
{
  // Variance
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
}
//#endregion

// `Atom.$Prop`
{
  // Variance
  {
    // Primitive
    {
      type NumberProp = Atom.$Prop<"field", number>;

      tyst<NumberProp>({} as number);
      tyst<NumberProp>({} as Atom.$Prop<"field", any>);
      // @ts-expect-error
      tyst<NumberProp>({} as string);
    }

    // Object
    {
      type ObjectProp = Atom.$Prop<"field", Entity>;

      tyst<ObjectProp>({} as Atom.$Prop<"field", User>);
      tyst<ObjectProp>({} as Atom.$Prop<"field", any>);
      // @ts-expect-error
      tyst<ObjectProp>({} as User);
      // @ts-expect-error
      tyst<ObjectProp>({} as Atom.$Prop<"field", Hello>);
    }

    // Any
    {
      type AnyProp = Atom.$Prop<"field", any>;

      tyst<AnyProp>({} as unknown);
      tyst<AnyProp>({} as string);
      tyst<AnyProp>({} as Atom.$Prop<"field", any>);
      tyst<AnyProp>({} as Atom.$Prop<"field", unknown>);
      tyst<AnyProp>({} as Atom.$Prop<"field", string>);
    }

    // Unknown
    {
      type UnknownProp = Atom.$Prop<"field", unknown>;

      // @ts-expect-error
      tyst<UnknownProp>({} as Atom.$Prop<"field", any>);
      // @ts-expect-error
      tyst<UnknownProp>({} as any);
      // @ts-expect-error
      tyst<UnknownProp>({} as unknown);
      // @ts-expect-error
      tyst<UnknownProp>({} as string);
      // @ts-expect-error
      tyst<UnknownProp>({} as Atom.$Prop<"field", string>);
    }
  }
}

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

declare const brand: unique symbol;

//#endregion
