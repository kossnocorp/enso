export {};

declare global {
  /**
   * Nullish value type.
   */
  type Nullish<Type = never> = Type | null | undefined;

  /**
   * Excludes nulish values from the given type.
   */
  type NonNullish<Type> = Exclude<Type, Nullish>;

  /**
   * Excludes undefined values from the given type.
   */
  type NonUndefined<Type> = Exclude<Type, undefined>;

  /**
   * Falsy value type.
   */
  type Falsy = false | 0 | "" | Nullish;

  type Static<
    Class extends Interface & { new (...args) },
    Interface,
  > = InstanceType<Class>;
}
