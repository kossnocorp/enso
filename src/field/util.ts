export function staticImplements<Type>() {
  return <Constructor extends Type>(constructor: Constructor) => {
    constructor;
  };
}

export type StaticImplements<Type> = {
  constructor: Type;
};

export type Static<
  Class extends Interface & { new (...args: any[]): any },
  Interface,
> = InstanceType<Class>;
