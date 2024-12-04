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
    infer Debranded extends string | number | symbol
    ? Debranded
    : Type;

  /**
   * Removes indexed fields leaving only statically defined.
   */
  export type WithoutIndexed<Model> = {
    [Key in keyof Model as string extends Debrand<Key>
      ? never
      : number extends Debrand<Key>
      ? never
      : symbol extends Debrand<Key>
      ? never
      : Key]: Model[Key];
  };

  /**
   * Resolves true if the given key is statically defined in the given type.
   */
  export type StaticKey<
    Model,
    Key extends keyof Model
  > = Key extends keyof WithoutIndexed<Model> ? true : false;

  export type Falsy = false | 0 | "" | null | undefined;
}
