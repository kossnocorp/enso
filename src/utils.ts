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
  export type IsStaticKey<Payload, Key extends keyof Payload> =
    Key extends StaticKeys<Payload> ? true : false;

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

  export type IsOptionalKey<Payload, Key extends keyof Payload> =
    Key extends OptionalKeys<Payload> ? true : false;

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
}
