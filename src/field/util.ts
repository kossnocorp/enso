export function staticImplements<Type>() {
  return <Constructor extends Type>(constructor: Constructor) => {
    constructor;
  };
}

export type StaticImplements<Type> = {
  constructor: Type;
};
