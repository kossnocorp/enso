import { Atom } from "./index.js";

// `Atom.ValueProp`
{
  // Variance
  {
    // Primitive
    {
      type NumberProp = Atom.ValueProp<number>;

      tyst<NumberProp>({} as number);
      // @ts-expect-error
      tyst<NumberProp>({} as string);
      // @ts-expect-error
      tyst<NumberProp>({} as unknown);
    }

    // Object
    {
      type AnyProp = Atom.ValueProp<Entity>;

      tyst<AnyProp>({} as Entity);
      tyst<AnyProp>({} as User);
      tyst<AnyProp>({} as Atom.ValueProp<User>);
      tyst<AnyProp>({} as Account);
      tyst<AnyProp>({} as any);
      // @ts-expect-error
      tyst<AnyProp>({} as Hello);
      // @ts-expect-error
      tyst<AnyProp>({} as unknown);
    }

    // Any
    {
      type AnyProp = Atom.ValueProp<any>;

      tyst<AnyProp>({} as number);
      tyst<AnyProp>({} as unknown);
    }

    // Unknown
    {
      type AnyProp = Atom.ValueProp<unknown>;

      // @ts-expect-error
      tyst<AnyProp>({} as any);
      // @ts-expect-error
      tyst<AnyProp>({} as number);
      // @ts-expect-error
      tyst<AnyProp>({} as unknown);
      // @ts-expect-error
      tyst<AnyProp>({} as Atom.ValueProp<number>);
      // @ts-expect-error
      tyst<AnyProp>({} as Atom.ValueProp<User>);
    }
  }
}

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

function tyst<Type>(arg: Type): void {}

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

//#endregion
