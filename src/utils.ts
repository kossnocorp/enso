import { K } from "vitest/dist/chunks/reporters.d.DL9pg5DB.js";

export namespace EnsoUtils {
  /**
   * Any brand type that can be mixed with string number or symbol to create
   * opaque primitive.
   */
  export type AnyBrand = { [key: string | number | symbol]: any };

  /**
   * Removes brand from the given type.
   */
  export type Debrand<Type> = Type extends infer _Brand extends AnyBrand &
    (infer Debranded extends string | number | symbol)
    ? Debranded
    : Type;

  /**
   * Removes indexed fields leaving only statically defined.
   */
  export type PickIndexed<Payload> = {
    [Key in keyof Payload as string extends Debrand<Key>
      ? Key
      : number extends Debrand<Key>
        ? Key
        : symbol extends Debrand<Key>
          ? Key
          : never]: Payload[Key];
  };

  export type IndexedKeys<Payload> = keyof PickIndexed<Payload>;

  /**
   * Removes indexed fields leaving only statically defined.
   */
  export type PickStatic<Payload> = {
    [Key in keyof Payload as string extends Debrand<Key>
      ? never
      : number extends Debrand<Key>
        ? never
        : symbol extends Debrand<Key>
          ? never
          : Key]: Payload[Key];
  };

  export type StaticKeys<Payload> = keyof PickStatic<Payload>;

  /**
   * Resolves true if the given key is statically defined in the given type.
   */
  export type IsStaticKey<Type, Key extends keyof NonNullish<Type>> =
    Key extends StaticKeys<Type> ? true : false;

  /**
   * Resolves true if the passed key is a required field of the passed model.
   */
  export type IsRequiredKey<Payload, Key extends keyof Payload> =
    IsStaticKey<Payload, Key> extends true
      ? Partial<Pick<Payload, Key>> extends Pick<Payload, Key>
        ? false
        : true
      : false;

  export type PickOptional<Payload> = {
    [Key in keyof Payload as IsStaticKey<Payload, Key> extends true
      ? Partial<Pick<Payload, Key>> extends Pick<Payload, Key>
        ? Key
        : never
      : never]: Payload[Key];
  };

  export type OptionalKeys<Payload> = keyof PickOptional<Payload>;

  export type IsOptionalKey<Type, Key extends keyof NonNullish<Type>> =
    Key extends OptionalKeys<Type> ? true : false;

  /**
   * Nullish value type.
   */
  export type Nullish<Type = never> = Type | null | undefined;

  /**
   * Excludes nulish values from the given type.
   */
  export type NonNullish<Type> = Exclude<Type, Nullish>;

  /**
   * Excludes undefined values from the given type.
   */
  export type NonUndefined<Type> = Exclude<Type, undefined>;

  /**
   * Falsy value type.
   */
  export type Falsy = false | 0 | "" | Nullish;

  export type Static<
    Class extends Interface & { new (...args: any[]): any },
    Interface,
  > = InstanceType<Class>;

  export type NonTuple<Type> = Type extends Tuple ? never : Type;

  export type Tuple = [unknown, ...unknown[]];

  export type KeyOfTuple<Type extends Tuple> = Exclude<
    keyof Type,
    keyof unknown[]
  >;

  export type IndexOfTuple<Type extends Tuple> =
    Exclude<keyof Type, keyof any[]> extends infer Key
      ? Key extends `${infer Index extends number}`
        ? Index
        : never
      : never;

  //#region Conditions

  export type Not<Type> = Type extends true ? false : true;

  export type And<
    Type1,
    Type2,
    Type3 = Type2,
    Type4 = Type3,
    Type5 = Type4,
    Type6 = Type5,
    Type7 = Type6,
    Type8 = Type7,
    Type9 = Type8,
    Type10 = Type9,
  > = true extends Type1 &
    Type2 &
    Type3 &
    Type4 &
    Type5 &
    Type6 &
    Type7 &
    Type8 &
    Type9 &
    Type10
    ? true
    : false;

  export type Or<
    Type1,
    Type2,
    Type3 = Type2,
    Type4 = Type3,
    Type5 = Type4,
    Type6 = Type5,
    Type7 = Type6,
    Type8 = Type7,
    Type9 = Type8,
    Type10 = Type9,
  > = true extends
    | Type1
    | Type2
    | Type3
    | Type4
    | Type5
    | Type6
    | Type7
    | Type8
    | Type9
    | Type10
    ? true
    : false;

  //#endregion

  //#region Any

  export type IfAnyOr<Type, IfType, OrType> = 0 extends 1 & Type
    ? IfType
    : OrType;

  export type AnyOr<Type, OrType> = IfAnyOr<Type, any, OrType>;

  export type IsAny<Type> = IfAnyOr<Type, true, false>;

  //#endregion

  //#region Unknown

  export type IfUnknownOr<Type, IfType, OrType> = IfAnyOr<
    Type,
    OrType,
    [Type] extends [unknown] ? (unknown extends Type ? IfType : OrType) : OrType
  >;

  export type UnknownOr<Type, OrType> = IfUnknownOr<Type, unknown, OrType>;

  export type IsUnknown<Type> = IfUnknownOr<Type, true, false>;

  //#endregion

  //#region Top (any & unknown)

  export type IsTop<Type> = Type extends {} ? true : false;

  export type IsNotTop<Type> = Type extends {} ? true : false;

  export type ResolveTop<Type> = IsUnknown<Type> extends true ? never : any;

  //#endregion

  //#region Never

  export type IsNever<Type> = [Type] extends [never] ? true : false;

  //#endregion

  //#region Variance

  export type CovariantifyProperty<Type> = {
    [Key in keyof Type]: Type[Key];
  };

  //#endregion
}
