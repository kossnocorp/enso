export {};

declare global {
  /**
   * Nullish value type.
   */
  type Nullish<Type = never> = Type | null | undefined;

  /**
   * Falsy value type.
   */
  type Falsy = false | 0 | "" | Nullish;

  /**
   * Excludes nulish values from the given type.
   */
  type NonNullish<Type> = Exclude<Type, Nullish>;

  /**
   * Excludes undefined values from the given type.
   */
  type NonUndefined<Type> = Exclude<Type, undefined>;

  // type Well<Type> = Type extends { constructor: Function }
  //   ? Type["constructor"] extends ObjectConstructor
  //     ? Type
  //     : never
  //   : never;

  type TestAgainst = { constructor: ObjectConstructor };
  type OnlyPlainObject<Type> = Type extends TestAgainst ? true : false;

  // type OnlyPlainObject<Type> = Type["constructor"];

  type Test1 = OnlyPlainObject<{
    a: string;
    b: number;
  }>;

  type Test2 = OnlyPlainObject<[string, number]>;

  type Test3 = OnlyPlainObject<() => void>;

  type Test4 = OnlyPlainObject<null>;

  type Test51 = OnlyPlainObject<Map<string, string>>;
  type Test52 = OnlyPlainObject<Set<string>>;
  type Test53 = OnlyPlainObject<Array<string>>;

  class Test6Class {
    a: string;
    b: number;
  }

  type Test6 = OnlyPlainObject<Test6Class>;
}
