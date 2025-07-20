import type { ChangesEvent, FieldChange } from "../change/index.ts";
import type { DetachedValue } from "../detached/index.ts";
import { State } from "../state/index.ts";
import { Field } from "./index.js";

//#region Variance
{
  // Field.Base as Field.Base
  {
    let _entity: Field.Base<Entity>;

    // Basic
    {
      _entity = {} as Field.Base<Account | User>;
      _entity = {} as Field.Base<Account>;
      _entity = {} as Field.Base<User>;

      let _account: Field.Base<Account>;
      // @ts-expect-error
      _account = {} as Field.Base<Account | User>;
      _account = {} as Field.Base<Account>;
      // @ts-expect-error
      _account = {} as Field.Base<User>;
    }

    // Qualifier
    {
      let _base: Field.Base<Entity>;
      _base = {} as Field.Base<Account | User, "detachable">;
      _base = {} as Field.Base<Account | User, "detachable" | "tried">;

      let _detachable: Field.Base<Entity, "detachable">;
      _detachable = {} as Field.Base<Account | User, "detachable">;
      _detachable = {} as Field.Base<Account, "detachable">;
      _detachable = {} as Field.Base<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field.Base<Entity>;

      let _mixed: Field.Base<Entity, "detachable" | "tried">;
      _mixed = {} as Field.Base<Account | User, "detachable" | "tried">;
      _mixed = {} as Field.Base<Account, "detachable" | "tried">;
      _mixed = {} as Field.Base<Account, "detachable" | "tried" | "bound">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Entity, "detachable">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Entity, "tried">;
    }

    // Parent
    {
      _entity = {} as Field.Base<Entity, never, ContainerParent>;
      _entity = {} as Field.Base<Entity, never, OrganizationParent>;

      let _container: Field.Base<Entity, never, ContainerParent>;
      _container = {} as Field.Base<Entity, never, ContainerParent>;
      _container = {} as Field.Base<Account | User, never, ContainerParent>;
      _container = {} as Field.Base<Account, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Base<Account>;
      // @ts-expect-error
      _container = {} as Field.Base<Entity, never, OrganizationParent>;

      let _organization: Field.Base<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Base<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Base<
        Account | User,
        never,
        OrganizationParent
      >;
      // @ts-expect-error
      _organization = {} as Field.Base<User, never, ContainerParent>;
    }
  }

  // Field as Field.Base
  {
    let _entity: Field.Base<Entity>;

    // Basic
    {
      _entity = {} as Field<Account | User>;
      _entity = {} as Field<Account>;
      _entity = {} as Field<User>;

      let _account: Field.Base<Account>;
      // @ts-expect-error
      _account = {} as Field<Account | User>;
      _account = {} as Field<Account>;
      // @ts-expect-error
      _account = {} as Field<User>;
    }

    // Qualifier
    {
      let _base: Field.Base<Entity>;
      _base = {} as Field<Account | User, "detachable">;
      _base = {} as Field<Account | User, "detachable" | "tried">;

      let _detachable: Field.Base<Entity, "detachable">;
      _detachable = {} as Field<Account | User, "detachable">;
      _detachable = {} as Field<Account, "detachable">;
      _detachable = {} as Field<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field<Entity>;

      let _mixed: Field.Base<Entity, "detachable" | "tried">;
      _mixed = {} as Field<Account | User, "detachable" | "tried">;
      _mixed = {} as Field<Account, "detachable" | "tried">;
      _mixed = {} as Field<Account, "detachable" | "tried" | "bound">;
      // @ts-expect-error
      _mixed = {} as Field<Entity, "detachable">;
      // @ts-expect-error
      _mixed = {} as Field<Entity, "tried">;
    }

    // Parent
    {
      _entity = {} as Field<Entity, never, ContainerParent>;
      _entity = {} as Field<Entity, never, OrganizationParent>;

      let _container: Field.Base<Entity, never, ContainerParent>;
      _container = {} as Field<Account | User, never, ContainerParent>;
      _container = {} as Field<Account, never, ContainerParent>;
      _container = {} as Field<User, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field<Account>;
      // @ts-expect-error
      _container = {} as Field<Entity, never, OrganizationParent>;

      let _organization: Field.Base<User, never, OrganizationParent>;
      _organization = {} as Field<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Account | User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<User, never, ContainerParent>;
    }
  }

  // Field as Field
  {
    let _entity: Field<Entity>;

    // Basic
    {
      // @ts-expect-error
      _entity = {} as Field<Account | User>;
      // @ts-expect-error
      _entity = {} as Field<Account>;
      // @ts-expect-error
      _entity = {} as Field<User>;

      let _account: Field<Account>;
      // @ts-expect-error
      _account = {} as Field<Account | User>;
      // @ts-expect-error
      _account = {} as Field<User>;
    }

    // Qualifier
    {
      let _base: Field<Entity>;
      _base = {} as Field<Entity, "detachable">;
      _base = {} as Field<Entity, "detachable" | "tried">;

      let _detachable: Field<Entity, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field<Account | User, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field<Account, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field<User, "detachable">;

      let _mixed: Field<Entity, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field<Account | User, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field<Account, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field<Account, "detachable" | "tried" | "bound">;
      // @ts-expect-error
      _mixed = {} as Field<Entity, "detachable">;
      // @ts-expect-error
      _mixed = {} as Field<Entity, "tried">;
    }

    // Parent
    {
      _entity = {} as Field<Entity, never, ContainerParent>;
      _entity = {} as Field<Entity, never, OrganizationParent>;

      let _container: Field<Entity, never, ContainerParent>;
      _container = {} as Field<Entity, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field<Account | User, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field<Account, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field<Account>;
      // @ts-expect-error
      _container = {} as Field<Entity, never, OrganizationParent>;

      let _organization: Field<User, never, OrganizationParent>;
      _organization = {} as Field<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Account | User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<User, never, ContainerParent>;
    }

    // Primitives
    {
      let _field: Field<string>;

      // @ts-expect-error
      _field = {} as Field<"a" | "b" | "c">;
      // @ts-expect-error
      _field = {} as Field<Branded<string>>;

      function tystField<Value extends string>(_arg: Field<Value>): void {}

      tystField({} as Field<"a" | "b" | "c">);
      tystField({} as Field<Branded<string>>);
      tystField({} as Field<"a" | "b" | "c", "bound">);
      tystField(
        {} as Field<
          "a" | "b" | "c",
          Field.Proxied<{ abc: "a" | "b" | "c"; id: Branded<string> }>
        >,
      );
    }
  }

  // Field.Base as Field
  {
    let _entity: Field<Entity>;

    // Basic
    {
      // @ts-expect-error
      _entity = {} as Field.Base<Account | User>;
      // @ts-expect-error
      _entity = {} as Field.Base<Account>;
      // @ts-expect-error
      _entity = {} as Field.Base<User>;

      let _account: Field<Account>;
      // @ts-expect-error
      _account = {} as Field.Base<Account | User>;
      // @ts-expect-error
      _account = {} as Field.Base<Account>;
      // @ts-expect-error
      _account = {} as Field.Base<User>;
    }

    // Qualifier
    {
      let _base: Field<Entity>;
      // @ts-expect-error
      _base = {} as Field.Base<Entity, "detachable">;
      // @ts-expect-error
      _base = {} as Field.Base<Entity, "detachable" | "tried">;

      let _detachable: Field<Entity, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field.Base<Account | User, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field.Base<Account, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field.Base<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field.Base<User, "detachable">;

      let _mixed: Field<Entity, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Account | User, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Account, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Account, "detachable" | "tried" | "bound">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Entity, "detachable">;
      // @ts-expect-error
      _mixed = {} as Field.Base<Entity, "tried">;
    }

    // Parent
    {
      // @ts-expect-error
      _entity = {} as Field.Base<Entity, never, ContainerParent>;
      // @ts-expect-error
      _entity = {} as Field.Base<Entity, never, OrganizationParent>;

      let _container: Field<Entity, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Base<Entity, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Base<Account | User, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Base<Account, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Base<Account>;
      // @ts-expect-error
      _container = {} as Field.Base<Entity, never, OrganizationParent>;

      let _organization: Field<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Base<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Base<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Base<
        Account | User,
        never,
        OrganizationParent
      >;
      // @ts-expect-error
      _organization = {} as Field.Base<User, never, ContainerParent>;
    }
  }
}
//#endregion

//#region Static

//#region Field.base
{
  // Basic
  {
    const entity = {} as Field<User> | Field<Account>;

    const result = Field.base(entity);

    result satisfies Field.Base<User | Account>;
    // @ts-expect-error
    result satisfies Field<User | Account>;
    // @ts-expect-error
    result satisfies Field.Base<Hello>;

    result.value satisfies User | Account;
    // @ts-expect-error
    result.value satisfies Hello;
  }

  // Qualifier
  {
    // Shared
    {
      const entity = {} as
        | Field<User, "detachable">
        | Field<Account, "detachable">;

      const result = Field.base(entity);

      result satisfies Field.Base<User | Account, "detachable">;
      // @ts-expect-error
      result satisfies Field.Base<User | Account, "detachable" | "bound">;
      // @ts-expect-error
      result satisfies Field.Base<User | Account, "bound">;
      // @ts-expect-error
      result satisfies Field<User | Account, "detachable">;
      // @ts-expect-error
      result satisfies Field.Base<Hello, "detachable">;

      result.value satisfies User | Account;
      // @ts-expect-error
      result.value satisfies Hello;
    }

    // Mixed
    {
      const entity = {} as
        | Field<User, "detachable">
        | Field<Account, "detachable" | "bound">;

      const result = Field.base(entity);

      result satisfies Field.Base<User | Account, "detachable">;
      // @ts-expect-error
      result satisfies Field.Base<User | Account, "detachable" | "bound">;
      // @ts-expect-error
      result satisfies Field<User | Account, "detachable">;
      // @ts-expect-error
      result satisfies Field.Base<Hello, "detachable">;

      result.value satisfies User | Account;
      // @ts-expect-error
      result.value satisfies Hello;
    }
  }
}
//#endregion

//#region Field.useEnsure
{
  // Basic
  {
    const field = new Field("hello") as Field<string> | undefined;

    const result = Field.useEnsure(field);
    result satisfies Field<string | undefined>;
    // @ts-expect-error
    result.any;
  }

  // Mapped
  {
    interface Parent {
      child: Child;
    }

    interface Child {
      hello: "world";
    }

    const field = new Field({}) as unknown as Field<Parent> | undefined;

    const result = Field.useEnsure(field, (field) => field.$.child);
    result satisfies Field<Child | undefined>;
    // @ts-expect-error
    result.any;
  }

  // Defined
  {
    // Basic
    {
      const field = new Field("hello");

      const result = Field.useEnsure(field);
      result satisfies Field<string>;
      // @ts-expect-error
      result.any;
    }

    // Mapped
    {
      interface Parent {
        child: Child;
      }

      interface Child {
        hello: "world";
      }

      const field = new Field({}) as unknown as Field<Parent>;

      const result = Field.useEnsure(field, (field) => field.$.child);
      result satisfies Field<Child>;
      // @ts-expect-error
      result.any;
    }
  }
}
//#endregion

//#endregion

//#region Value

//#region Field#value & Field#useValue
{
  function _value(field: Field<Hello>): Hello {
    return Math.random() > 0.5 ? field.value : field.useValue();
  }

  // Field.Base
  {
    // Primitive
    {
      const number = {} as Field.Base<number>;
      const boolean = {} as Field.Base<boolean>;
      const string = {} as Field.Base<string>;

      number.value satisfies number;
      boolean.value satisfies boolean;
      string.value satisfies string;
    }

    // Object
    {
      const entity = {} as Field.Base<Entity>;
      const account = {} as Field.Base<Account>;
      const user = {} as Field.Base<User>;

      entity.value satisfies Entity;
      // @ts-expect-error
      entity.value.any;

      account.value satisfies Account;
      // @ts-expect-error
      account.value satisfies User;
      // @ts-expect-error
      account.value.any;

      user.value satisfies User;
      // @ts-expect-error
      user.value satisfies Account;
      // @ts-expect-error
      user.value.any;

      // Parent

      const container = {} as Field.Base<Entity, never, ContainerParent>;
      const organization = {} as Field.Base<User, never, OrganizationParent>;

      if ("field" in container.parent) {
        container.parent.field satisfies Field.Immutable<Container>;

        container.value satisfies Entity;
        // @ts-expect-error
        container.value.any;
      }

      if ("field" in organization.parent) {
        organization.parent.field satisfies Field.Immutable<Organization>;

        organization.value satisfies User;
        // @ts-expect-error
        organization.value.any;
      }
    }

    // Union value
    {
      const entity = {} as Field.Base<Account | User>;

      entity.$.name satisfies Field<string>;
      // @ts-expect-error
      entity.$.name satisfies State<string>;
      entity.$.name.value satisfies string;
      // @ts-expect-error
      entity.$.name.value.any;

      // @ts-expect-error
      entity.$.paid;
    }

    // Union field
    {
      const entity = {} as Field.Base<Account> | Field.Base<User>;

      entity.$.name satisfies Field<string>;
      // @ts-expect-error
      entity.$.name satisfies State<string>;
      entity.$.name.value satisfies string;
      // @ts-expect-error
      entity.$.name.value.any;

      // @ts-expect-error
      entity.$.paid;
    }
  }

  // Field
  {
    // Primitive
    {
      const number = {} as Field<number>;
      const boolean = {} as Field<boolean>;
      const string = {} as Field<string>;

      number.value satisfies number;
      boolean.value satisfies boolean;
      string.value satisfies string;
    }

    // Object
    {
      const entity = {} as Field<Entity>;
      const account = {} as Field<Account>;
      const user = {} as Field<User>;

      entity.value satisfies Entity;
      // @ts-expect-error
      entity.value.any;

      account.value satisfies Account;
      // @ts-expect-error
      account.value satisfies User;
      // @ts-expect-error
      account.value.any;

      user.value satisfies User;
      // @ts-expect-error
      user.value satisfies Account;
      // @ts-expect-error
      user.value.any;

      // Parent

      const container = {} as Field<Entity, never, ContainerParent>;
      const organization = {} as Field<User, never, OrganizationParent>;

      if ("field" in container.parent) {
        container.parent.field satisfies Field.Immutable<Container>;

        container.value satisfies Entity;
        // @ts-expect-error
        container.value.any;
      }

      if ("field" in organization.parent) {
        organization.parent.field satisfies Field.Immutable<Organization>;

        organization.value satisfies User;
        // @ts-expect-error
        organization.value.any;
      }
    }

    // Union value
    {
      const entity = {} as Field<Account | User>;

      entity.$.name satisfies Field<string>;
      // @ts-expect-error
      entity.$.name satisfies State<string>;
      entity.$.name.value satisfies string;
      // @ts-expect-error
      entity.$.name.value.any;

      // @ts-expect-error
      entity.$.paid;
    }

    // Union field
    {
      const entity = {} as Field<Account> | Field<User>;

      entity.$.name satisfies Field<string>;
      // @ts-expect-error
      entity.$.name satisfies State<string>;
      entity.$.name.value satisfies string;
      // @ts-expect-error
      entity.$.name.value.any;

      // @ts-expect-error
      entity.$.paid;
    }
  }
}
//#endregion

//#region Field#compute & Field#useCompute
{
  const field = {} as Field<number>;

  let result = field.compute((value) => Number.isNaN(value));

  result satisfies boolean;
  // @ts-expect-error
  result satisfies number;
  // @ts-expect-error
  result.any;

  result = field.useCompute((value) => value > 0, []);
}
//#endregion

//#region Field#dirty
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  field.dirty satisfies boolean;
  // @ts-expect-error
  field.dirty.any;
}
//#endregion

//#region Field#useDirty
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  const result = field.useDirty();
  result satisfies boolean;
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Field#pave
{
  interface Settings {
    user?: UserSettings;
  }

  interface UserSettings {
    email: string;
    security?: SecuritySettings;
  }

  interface SecuritySettings {
    public?: boolean;
    twoFactor?: boolean;
  }

  // Basic
  {
    const field = new Field({} as Settings);

    const userResult = field.$.user.pave({ email: "user@example.com" });
    userResult satisfies Field<UserSettings>;
    // @ts-expect-error
    userResult.any;

    // @ts-expect-error
    field.$.user.pave({});
    // @ts-expect-error
    field.$.user.pave({ hello: "world" });
    // @ts-expect-error
    field.$.user.pave(undefined);

    const securityResult = userResult.$.security.pave({
      public: true,
    });
    securityResult satisfies Field<SecuritySettings>;
    // @ts-expect-error
    securityResult.any;

    // @ts-expect-error
    securityResult.pave({ email: "user@example.com" });
    // @ts-expect-error
    securityResult.pave(undefined);
  }

  // Union value
  {
    interface GlobalSettings extends Settings {
      global: true;
    }

    interface LocalSettings extends Settings {
      local: true;
    }

    const field = {} as Field<GlobalSettings | LocalSettings | undefined>;

    const result = field.pave({ global: true });
    result satisfies Field<GlobalSettings>;
    // @ts-expect-error
    result.any;
  }
}
//#endregion

//#region Field#commit
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  const result = field.commit();
  result satisfies void;
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Field#reset
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  const result = field.reset();
  result satisfies void;
  // @ts-expect-error
  result.any;
}
//#endregion

//#endregion

//#region Tree

//#region Field#root
{
  // Immutability
  {
    const user = {} as Field<User>;

    user.root satisfies Field.Immutable<unknown, "root">;
    // @ts-expect-error
    user.root satisfies Field.Exact<unknown, "root">;
  }
}
//#endregion

//#region Field#parent
{
  // Immutability
  {
    const organization = {} as Field<User, never, OrganizationParent>;

    if ("field" in organization.parent) {
      organization.parent.field satisfies Field.Immutable<Organization>;
      // @ts-expect-error
      organization.parent.field satisfies Field.Exact<Organization>;

      organization.parent.field.$.owner satisfies Field.Immutable<User>;
      // @ts-expect-error
      organization.parent.field.$.owner satisfies Field.Exact<User>;
    }
  }
}
//#endregion

//#region Field#$
{
  // Readonly array
  {
    const field = {} as Field<readonly number[]>;

    field.$[0]?.$;
    // @ts-expect-error
    field.$[0].$;

    field.$[0] satisfies Field.Base<number | undefined> | undefined;
    // @ts-expect-error
    field.$[0] satisfies
      | Field.Base<number | undefined, "detachable">
      | undefined;
    // @ts-expect-error
    field.$[0] satisfies Field<number | undefined> | undefined;
    // @ts-expect-error
    field.$[0] satisfies Field.Base<number>;
    // @ts-expect-error
    field.$[0] satisfies Field.Base<number>;
    // @ts-expect-error
    field.$[0] satisfies Field.Base<number | undefined>;
  }

  // Array
  {
    const field = {} as Field<number[]>;

    field.$[0]?.$;
    // @ts-expect-error
    field.$[0].$;

    field.$[0] satisfies Field<number | undefined, "detachable"> | undefined;
    // @ts-expect-error
    field.$[0] satisfies Field<number>;
    // @ts-expect-error
    field.$[0] satisfies Field<number> | undefined;
    // @ts-expect-error
    field.$[0] satisfies Field<number | undefined>;
  }

  // Record
  {
    const field = {} as Field<Record<string, number>>;

    field.$["key"]?.$;
    // @ts-expect-error
    field.$["key"].$;

    field.$["key"] satisfies
      | Field<number | undefined, "detachable">
      | undefined;
    // @ts-expect-error
    field.$["key"] satisfies Field<number>;
  }

  // Object
  {
    const field = {} as Field<User>;

    field.at("age").$;

    field.$.age satisfies Field<number>;
    // @ts-expect-error
    field.$.age satisfies State<number>;
    // @ts-expect-error
    field.$.age satisfies Field<string>;

    field.$.email satisfies Field<string | undefined> | undefined;
    // @ts-expect-error
    field.$.name satisfies State<string | undefined> | undefined;
    // @ts-expect-error
    field.$.email satisfies Field<string>;
  }

  // Union value
  {
    const field = {} as Field<User | Account>;

    field.$.name satisfies Field<string>;
    // @ts-expect-error
    field.$.name satisfies State<string>;
    // @ts-expect-error
    field.$.name satisfies Field<number>;
  }

  // Union field
  {
    const field = {} as Field<User> | Field<Account>;

    field.$.name satisfies Field<string>;
    // @ts-expect-error
    field.$.name satisfies State<string>;
    // @ts-expect-error
    field.$.name satisfies Field<number>;
  }

  // Key union
  {
    const field = {} as Field<Entity>;

    const result = field.$[{} as keyof Entity];
    result satisfies Field<string> | Field<boolean | undefined>;
    // @ts-expect-error
    result.any;
  }
}
//#endregion

//#region Field#at
{
  // Readonly array
  {
    const field = {} as Field<readonly number[]>;

    field.at(0).$;

    field.at(0) satisfies Field.Base<number | undefined>;
    // @ts-expect-error
    field.at(0) satisfies undefined;
    // @ts-expect-error
    field.at(0) satisfies Field.Base<number | undefined, "detachable">;
    // @ts-expect-error
    field.at(0) satisfies Field.Base<number> | undefined;
    // @ts-expect-error
    field.at(0) satisfies State.Base<number>;
    // @ts-expect-error
    field.at(0) satisfies Field.Base<string>;
  }

  // Array
  {
    const field = {} as Field<number[]>;

    field.at(0).$;

    field.at(0) satisfies Field<number | undefined, "detachable">;
    // @ts-expect-error
    field.at(0) satisfies undefined;
    // @ts-expect-error
    field.at(0) satisfies Field<number> | undefined;
    // @ts-expect-error
    field.at(0) satisfies State<number>;
    // @ts-expect-error
    field.at(0) satisfies Field<string>;
  }

  // Object
  {
    const field = {} as Field<User>;

    field.at("age").$;

    field.at("age") satisfies Field<number>;
    // @ts-expect-error
    field.at("age") satisfies undefined;
    // @ts-expect-error
    field.at("age") satisfies State<number>;
    // @ts-expect-error
    field.at("age") satisfies Field<string>;

    field.at("email") satisfies Field<string | undefined, "detachable">;
    // @ts-expect-error
    field.at("email") satisfies undefined;
    // @ts-expect-error
    field.at("email") satisfies State<string | undefined, "detachable">;
    // @ts-expect-error
    field.at("email") satisfies Field<string, "detachable">;
  }

  // Record
  {
    const field = {} as Field<Record<string, number>>;

    field.at("key").$;

    field.at("key") satisfies Field<number | undefined, "detachable">;
    // @ts-expect-error
    field.at("key") satisfies undefined;
    // @ts-expect-error
    field.at("key") satisfies Field<number>;
  }

  // Immutable
  {
    const field = {} as Field.Immutable<User>;

    field.at("age") satisfies Field.Immutable<number>;
    // @ts-expect-error
    field.at("age") satisfies State.Immutable<number>;
    // @ts-expect-error
    field.at("age") satisfies Field.Immutable<string>;

    field.at("email") satisfies Field.Immutable<
      string | undefined,
      "detachable"
    >;
    // @ts-expect-error
    field.at("email") satisfies State.Immutable<
      string | undefined,
      "detachable"
    >;
    // @ts-expect-error
    field.at("email") satisfies Field.Immutable<string, "detachable">;
  }

  // Union value
  {
    const field = {} as Field<User | Account>;

    field.at("name") satisfies Field<string>;
    // @ts-expect-error
    field.at("name") satisfies State<string>;
    // @ts-expect-error
    field.at("name") satisfies Field<number>;
  }

  // Union field
  {
    const field = {} as Field<User> | Field<Account>;

    Field.base(field).at("name") satisfies Field<string>;
    // @ts-expect-error
    Field.base(field).at("name") satisfies State<string>;
    // @ts-expect-error
    Field.base(field).at("name") satisfies Field<number>;
  }

  // Key union
  {
    const field = {} as Field<Entity>;

    const result = field.at({} as keyof Entity);
    result satisfies Field<string> | Field<boolean | undefined>;
    // @ts-expect-error
    result.any;
  }

  // Safe nullish key
  {
    const field = {} as Field<User>;

    field.at(Field.safeNullish({} as keyof User | undefined | null));
    field.at(Field.safeNullish({} as keyof User | null));
    field.at(Field.safeNullish({} as keyof User | undefined));
    field.at(Field.safeNullish({} as keyof User));

    // @ts-expect-error
    field.at({} as keyof User | undefined | null);
    // @ts-expect-error
    field.at({} as "nope" | undefined);
    // @ts-expect-error
    field.at(undefined);
    // @ts-expect-error
    field.at(null);

    const result = field.at(
      Field.safeNullish({} as keyof Entity | undefined | null),
    );
    result satisfies Field<string> | Field<boolean | undefined>;
    // @ts-expect-error
    result.any;
  }
}
//#endregion

//#region Field#try
{
  // Readonly array
  {
    const field = {} as Field<readonly number[]>;

    field.try(0)?.$;
    // @ts-expect-error
    field.try(0).$;

    field.try(0) satisfies Field.Base<number, "tried"> | undefined;
    // @ts-expect-error
    field.try(0) satisfies Field.Base<number>;
    // @ts-expect-error
    field.try(0) satisfies undefined;
    // @ts-expect-error
    field.try(0) satisfies
      | Field.Base<number, "tried" | "detachable">
      | undefined;
    // @ts-expect-error
    field.try(0) satisfies State.Base<number>;
    // @ts-expect-error
    field.try(0) satisfies Field.Base<string>;
  }

  // Array
  {
    const field = {} as Field<number[]>;

    field.try(0)?.$;
    // @ts-expect-error
    field.try(0).$;

    field.try(0) satisfies Field<number, "tried" | "detachable"> | undefined;
    // @ts-expect-error
    field.try(0) satisfies Field<number, "tried" | "detachable">;
    // @ts-expect-error
    field.try(0) satisfies undefined;
    // @ts-expect-error
    field.try(0) satisfies State<number>;
    // @ts-expect-error
    field.try(0) satisfies Field<string>;
  }

  // Object
  {
    const field = {} as Field<User>;

    field.try("age") satisfies Field<number, "tried">;
    field.try("age").id;
    // @ts-expect-error
    field.try("age") satisfies State<number, "tried">;

    field.try("email") satisfies
      | Field<string, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    field.try("email").id;
    // @ts-expect-error
    field.try("email") satisfies
      | State<string, "detachable" | "tried">
      | undefined;
  }

  // Immutable
  {
    const field = {} as Field.Immutable<User>;

    field.try("age") satisfies Field.Immutable<number, "tried">;
    field.try("age").id;
    // @ts-expect-error
    field.try("age") satisfies State.Immutable<number, "tried">;

    field.try("email") satisfies
      | Field.Immutable<string, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    field.try("email").id;
    // @ts-expect-error
    field.try("email") satisfies
      | State.Immutable<string, "detachable" | "tried">
      | undefined;
  }

  // Record
  {
    const field = {} as Field<Record<string, number>>;

    field.try("key")?.$;
    // @ts-expect-error
    field.try("key").$;

    field.try("key") satisfies
      | Field<number, "tried" | "detachable">
      | undefined;
    // @ts-expect-error
    field.try("key") satisfies Field<number>;
    // @ts-expect-error
    field.try("key") satisfies undefined;
  }

  // Union value
  {
    const entity = {} as Field<User | Account>;

    entity.try("name") satisfies Field<string, "tried">;
    entity.try("name").id;
    // @ts-expect-error
    entity.try("name") satisfies State<string, "tried">;

    entity.try("flag") satisfies
      | Field<boolean, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    entity.try("flag").id;
    // @ts-expect-error
    entity.try("flag") satisfies
      | State<boolean, "detachable" | "tried">
      | undefined;
  }

  // Union field
  {
    const field = {} as Field<User> | Field<Account>;

    Field.base(field).try("name") satisfies Field<string, "tried">;
    Field.base(field).try("name").id;
    // @ts-expect-error
    Field.base(field).try("name") satisfies State<string, "tried">;
    // @ts-expect-error
    Field.base(field).try("name") satisfies Field<number, "tried">;

    Field.base(field).try("flag") satisfies
      | Field<boolean, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    Field.base(field).try("flag").id;
    // @ts-expect-error
    Field.base(field).try("flag") satisfies
      | State<boolean, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    Field.base(field).try("flag") satisfies Field<
      number,
      "detachable" | "tried"
    >;
  }

  // Key union
  {
    const field = {} as Field<Entity>;

    const result = field.try({} as keyof Entity);
    result satisfies
      | Field<string, "tried">
      | Field<boolean, "tried">
      | undefined;
    // @ts-expect-error
    result.any;
  }

  // Safe nullish key
  {
    const field = {} as Field<Entity>;

    field.try(Field.safeNullish(undefined));
    field.try(Field.safeNullish(null));
    field.try(Field.safeNullish({} as keyof Entity | undefined | null));
    field.try(Field.safeNullish({} as keyof Entity | null));
    field.try(Field.safeNullish({} as keyof Entity | undefined));
    field.try(Field.safeNullish({} as keyof Entity));

    // @ts-expect-error
    field.try({} as keyof Entity | undefined | null);
    // @ts-expect-error
    field.try({} as "nope" | undefined);
    // @ts-expect-error
    field.try(undefined);
    // @ts-expect-error
    field.try(null);

    const result = field.try(
      Field.safeNullish({} as keyof Entity | undefined | null),
    );
    result satisfies
      | Field<string, "tried">
      | Field<boolean, "tried">
      | undefined;
    // @ts-expect-error
    result.any;
  }
}
//#endregion

//#region Field#self#try
{
  // Basic
  {
    const user = {} as Field<User>;

    user.self.try() satisfies Field<User>;
    user.self.try().id;
    // @ts-expect-error
    user.self.try() satisfies State<User>;

    user.at("age").self.try() satisfies Field<number, "tried">;
    user.at("age").self.try().id;
    // @ts-expect-error
    user.at("age").self.try() satisfies State<number, "tried">;

    user.at("email").self.try() satisfies Field<string, "tried"> | undefined;
    // @ts-expect-error
    user.at("email").self.try().id;
    // @ts-expect-error
    user.at("email").self.try() satisfies State<string, "tried"> | undefined;
  }

  // Qualifier
  {
    const user = {} as Field<User, "detachable">;

    user.self.try() satisfies Field<User>;
    user.self.try() satisfies Field<User, "detachable" | "tried">;
    user.self.try().id;
    // @ts-expect-error
    user.self.try() satisfies Field<User, "bound">;
    // @ts-expect-error
    user.self.try() satisfies State<User, "detachable" | "tried">;

    user.at("age").self.try() satisfies Field<number>;
    user.at("age").self.try() satisfies Field<number, "tried">;
    user.at("age").self.try().id;
    // @ts-expect-error
    user.at("age").self.try() satisfies Field<number, "detachable">;
    // @ts-expect-error
    user.at("age").self.try() satisfies State<number, "tried">;

    user.at("email").self.try() satisfies Field<string> | undefined;
    user.at("email").self.try() satisfies
      | Field<string, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    user.at("email").self.try() satisfies Field<string, "bound"> | undefined;
    // @ts-expect-error
    user.at("email").self.try().id;
    // @ts-expect-error
    user.at("email").self.try() satisfies
      | State<string, "detachable" | "tried">
      | undefined;
  }

  // Immutable
  {
    const user = {} as Field.Immutable<User>;

    user.self.try() satisfies Field.Immutable<User, "tried">;
    user.self.try().id;
    // @ts-expect-error
    user.self.try() satisfies State.Immutable<User, "tried">;

    user.at("age").self.try() satisfies Field.Immutable<number, "tried">;
    user.at("age").self.try().id;
    // @ts-expect-error
    user.at("age").self.try() satisfies State.Immutable<number, "tried">;

    user.at("email").self.try() satisfies
      | Field.Immutable<string, "tried">
      | undefined;
    // @ts-expect-error
    user.at("email").self.try().id;
    // @ts-expect-error
    user.at("email").self.try() satisfies
      | State.Immutable<string, "tried">
      | undefined;
  }

  // Union value
  {
    const entity = {} as Field<User | Account>;

    entity.self.try() satisfies Field<User | Account>;
    entity.self.try().id;
    // @ts-expect-error
    entity.self.try() satisfies State<User | Account>;

    entity.at("name").self.try() satisfies Field<string, "tried">;
    entity.at("name").self.try().id;
    // @ts-expect-error
    entity.at("name").self.try() satisfies State<string, "tried">;

    entity.at("flag").self.try() satisfies Field<boolean, "tried"> | undefined;
    // @ts-expect-error
    entity.at("flag").self.try().id;
    // @ts-expect-error
    entity.at("flag").self.try() satisfies State<boolean, "tried"> | undefined;
  }

  // Union field
  {
    const entity = {} as Field<User> | Field<Account>;

    Field.base(entity).self.try() satisfies Field.Base<User | Account, "tried">;
    Field.base(entity).self.try().id;
    // @ts-expect-error
    Field.base(entity).self.try() satisfies State.Base<User | Account, "tried">;

    Field.base(entity).at("name").self.try() satisfies Field.Base<
      string,
      "tried"
    >;
    Field.base(entity).at("name").self.try().id;
    // @ts-expect-error
    Field.base(entity).at("name").self.try() satisfies State.Base<
      string,
      "tried"
    >;
    // @ts-expect-error
    Field.base(entity).at("name").self.try() satisfies Field.Base<
      number,
      "tried"
    >;

    Field.base(entity).at("flag").self.try() satisfies
      | Field.Base<boolean, "tried">
      | undefined;
    // @ts-expect-error
    Field.base(entity).at("flag").self.try().id;
    // @ts-expect-error
    Field.base(entity).at("flag").self.try() satisfies
      | State.Base<boolean, "tried">
      | undefined;
    // @ts-expect-error
    Field.base(entity).at("flag").self.try() satisfies Field.Base<
      number,
      "tried"
    >;
  }
}
//#endregion

//#endregion

//#region Type

//#region Collection

const tuple = new Field<[string, boolean, symbol]>(["1", true, Symbol("3")]);
const tupleOrUnd = new Field<[string, boolean, symbol] | undefined>([
  "1",
  true,
  Symbol("3"),
]);
const tupleOrNum = new Field<[string, boolean, symbol] | number>([
  "1",
  true,
  Symbol("3"),
]);

const readonlyArr = new Field<readonly (string | boolean)[]>([]);

const arr = new Field<Array<string | boolean>>([]);
const arrOrUnd = new Field<Array<string | boolean> | undefined>([]);
const arrOrNum = new Field<Array<string | boolean> | number>([]);
const arrOrNumOrUnd = new Field<Array<string | boolean> | number | undefined>(
  [],
);

const obj = new Field<Hello>({ hello: "hi", world: true });
const objPart = new Field<Ok>({ ok: true });
const objOrUnd = new Field<Ok | undefined>({ ok: true });

const rec = new Field<Record<string, string | boolean>>({});
const prim = new Field<string | boolean>("hello");
const brandedPrim = new Field({} as Branded<string>);

//#region Field#size
{
  // Readonly array
  {
    const field = new Field([] as readonly string[]);
    field.size satisfies number;
    // @ts-expect-error
    field.size.any;
  }

  // Tuple
  {
    const field = new Field({} as [1, 2, 3]);
    field.size satisfies number;
    // @ts-expect-error
    field.size.any;
  }

  // Array
  {
    const field = new Field([] as string[]);
    field.size satisfies number;
    // @ts-expect-error
    field.size.any;
  }

  // Object
  {
    const field = new Field({ a: 1 });
    field.size satisfies number;
    // @ts-expect-error
    field.size.any;
  }

  // Record
  {
    const field = new Field({} as Record<string, string>);
    field.size satisfies number;
    // @ts-expect-error
    field.size.any;
  }

  // Primitive
  {
    const field = new Field(1);
    field.size satisfies never;
  }

  // Branded primitive
  {
    const field = new Field({} as Branded<string>);
    field.size satisfies never;
  }
}
//#endregion

//#region Field#forEach
{
  // Readonly array
  {
    const result = readonlyArr.forEach((item, index) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    result satisfies void;

    readonlyArr.forEach((item) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;
    });
    arr.forEach(() => {});
  }

  // Tuple
  {
    const result = tuple.forEach((item, index) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      // @ts-expect-error
      item satisfies
        | Field<string, "detachable">
        | Field<boolean, "detachable">
        | Field<symbol, "detachable">;
      // @ts-expect-error
      item.any;

      index satisfies 0 | 1 | 2;
      // @ts-expect-error
      index.any;

      if (index === 1) {
        item.value satisfies boolean;
        // @ts-expect-error
        item.value satisfies string;
      }
    });
    result satisfies void;

    tuple.forEach((item) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      // @ts-expect-error
      item satisfies
        | Field<string, "detachable">
        | Field<boolean, "detachable">
        | Field<symbol, "detachable">;
      // @ts-expect-error
      item.any;
    });
    tuple.forEach(() => {});
  }

  // Array
  {
    const result = arr.forEach((item, index) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;
    });
    result satisfies void;

    arr.forEach((item) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;
    });
    arr.forEach(() => {});
  }

  // Object
  {
    // Regular
    {
      const result = obj.forEach((item, key) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Hello;
        // @ts-expect-error
        key.any;

        if (key === "hello") {
          item.value satisfies string;
          // @ts-expect-error
          item.value satisfies number;
        } else {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string;
        }
      });
      result satisfies void;

      obj.forEach((item) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;
      });
      obj.forEach(() => {});
    }

    // Optional
    {
      objPart.forEach((item, key) => {
        item satisfies Field<boolean> | Field<string | undefined, "detachable">;
        // @ts-expect-error
        item satisfies
          | Field<boolean, "detachable">
          | Field<string | undefined, "detachable">;
        // @ts-expect-error
        item.any;

        key satisfies keyof Ok;
        // @ts-expect-error
        key.any;

        if (key === "ok") {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string | undefined;
        } else {
          item.value satisfies string | undefined;
          // @ts-expect-error
          item.value satisfies boolean;
        }
      });
      objPart.forEach((item) => {
        item satisfies Field<boolean> | Field<string | undefined, "detachable">;
        // @ts-expect-error
        item satisfies
          | Field<boolean, "detachable">
          | Field<string | undefined, "detachable">;
        // @ts-expect-error
        item.any;
      });
      objPart.forEach(() => {});
    }
  }

  // Record
  {
    const result = rec.forEach((item, key) => {
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;

      key satisfies string;
      // @ts-expect-error
      key.any;
    });
    result satisfies void;

    rec.forEach((item) => {
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;
    });
    rec.forEach(() => {});
  }

  // Primitive
  {
    // @ts-expect-error
    prim.forEach((item, index) => {});
  }

  // Branded primitive
  {
    // @ts-expect-error
    brandedPrim.forEach((item, index) => {});
  }
}
//#endregion

//#region Field#map
{
  // Readonly array
  {
    const result = readonlyArr.map((item, index) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.value);
    });
    result satisfies number[];

    readonlyArr.map((item) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;
    });
  }

  // Tuple
  {
    const result = tuple.map((item, index) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      // @ts-expect-error
      item.any;

      index satisfies 0 | 1 | 2;
      // @ts-expect-error
      index.any;

      if (index === 1) {
        item.value satisfies boolean;
        // @ts-expect-error
        item.value satisfies string;
      }

      return 0;
    });
    result satisfies number[];

    tuple.map((item) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      // @ts-expect-error
      item.any;
    });
    arr.map(() => {});
  }

  // Array
  {
    const result = arr.map((item, index) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;

      index satisfies number;
      // @ts-expect-error
      index.any;

      return Number(item.value);
    });
    result satisfies number[];

    arr.map((item) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;
    });
  }

  // Object
  {
    // Regular
    {
      const result = obj.map((item, key) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Hello;
        // @ts-expect-error
        key.any;

        if (key === "hello") {
          item.value satisfies string;
          // @ts-expect-error
          item.value satisfies number;
          return item.value.length;
        } else {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string;
          return item.value === true ? 1 : 0;
        }
      });
      result satisfies number[];

      obj.map((item) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;
        return 0;
      });
      obj.map(() => 0);
    }

    // Optional
    {
      const resultOpt = objPart.map((item, key) => {
        item satisfies Field<boolean> | Field<string | undefined>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Ok;
        // @ts-expect-error
        key.any;

        if (key === "ok") {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string | undefined;
          return item.value === true ? 1 : 0;
        } else {
          item.value satisfies string | undefined;
          // @ts-expect-error
          item.value satisfies boolean;
          return item.value?.length ?? 0;
        }
      });
      resultOpt satisfies number[];

      objPart.map((item) => {
        item satisfies Field<boolean> | Field<string | undefined>;
        // @ts-expect-error
        item.any;
      });
      objPart.map(() => 0);
    }
  }

  // Record
  {
    const result = rec.map((item, key) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;

      key satisfies string;
      // @ts-expect-error
      key.any;

      return 0;
    });
    result satisfies number[];

    rec.map((item) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;
    });
    obj.map(() => 0);
  }

  // Primitive
  {
    // @ts-expect-error
    prim.map((item, index) => {});
  }

  // Branded primitive
  {
    // @ts-expect-error
    brandedPrim.map((item, index) => {});
  }
}
//#endregion

//#region Field#find
{
  // Readonly array
  {
    const result = readonlyArr.find((item, index) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean>;
      index satisfies number;
      return item.value === "hello";
    });

    result satisfies Field.Base<string | boolean> | undefined;
    // @ts-expect-error
    result satisfies Field.Base<string | boolean, "detachable"> | undefined;
    // @ts-expect-error
    result satisfies Field<string | boolean> | undefined;
    // @ts-expect-error
    result satisfies Field.Base<string> | Field<boolean, "detachable">;
    // @ts-expect-error
    result satisfies Field.Base<string | boolean>;
    // @ts-expect-error
    result satisfies undefined;
    // @ts-expect-error
    result.any;

    readonlyArr.find((item) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean>;
      return true;
    });
    readonlyArr.find(() => true);

    readonlyArr.find((_item) => 0);
    readonlyArr.find((_item) => "");
    readonlyArr.find((_item) => null);
    // @ts-expect-error
    readonlyArr.find((item) => item.value.toExponential());
  }

  // Tuple
  {
    const result = tuple.find((item, index) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      index satisfies 0 | 1 | 2;

      if (index === 1) {
        item.value satisfies boolean;
        // @ts-expect-error
        item.value satisfies string;
        return true;
      }

      return false;
    });

    result satisfies Field<string> | Field<boolean> | Field<symbol> | undefined;
    // @ts-expect-error
    result satisfies Field<string> | Field<boolean> | Field<symbol>;
    // @ts-expect-error
    result satisfies undefined;
    // @ts-expect-error
    result.any;

    tuple.find((item) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      return true;
    });
    tuple.find(() => true);
    tuple.find((_item) => 0);
    tuple.find((_item) => "");
    tuple.find((_item) => null);
    // @ts-expect-error
    tuple.find((item) => item.value.toExponential());
  }

  // Array
  {
    const result = arr.find((item, index) => {
      item satisfies Field<string | boolean, "detachable">;
      index satisfies number;
      return item.value === "hello";
    });

    result satisfies Field<string | boolean, "detachable"> | undefined;
    // @ts-expect-error
    result satisfies Field<string, "detachable"> | Field<boolean, "detachable">;
    // @ts-expect-error
    result satisfies Field<string | boolean, "detachable">;
    // @ts-expect-error
    result satisfies undefined;
    // @ts-expect-error
    result.any;

    arr.find((item) => {
      item satisfies Field<string | boolean, "detachable">;
      return true;
    });
    arr.find(() => true);

    arr.find((_item) => 0);
    arr.find((_item) => "");
    arr.find((_item) => null);
    // @ts-expect-error
    arr.find((item) => item.value.toExponential());
  }

  // Object
  {
    // Regular
    {
      const result = obj.find((item, key) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Hello;
        // @ts-expect-error
        key.any;

        if (key === "hello") {
          item.value satisfies string;
          // @ts-expect-error
          item.value satisfies number;
          return item.value.length > 0;
        } else {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string;
          return item.value === true ? 1 : 0;
        }
      });

      result satisfies Field<string> | Field<boolean> | undefined;
      // @ts-expect-error
      result satisfies Field<string> | Field<boolean>;
      // @ts-expect-error
      resultOpt satisfies undefined;
      // @ts-expect-error
      result.any;

      obj.find((item) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;
        return true;
      });
      obj.find(() => true);

      obj.find((item) => item);
      obj.find((_item) => 0);
      obj.find((_item) => "");
      obj.find((_item) => null);
      // @ts-expect-error
      obj.find((item) => item.value.toExponential());
    }

    // Optional
    {
      const resultOpt = objPart.find((item, key) => {
        item satisfies Field<boolean> | Field<string | undefined>;
        // @ts-expect-error
        item.any;

        key satisfies keyof Ok;
        // @ts-expect-error
        key.any;

        if (key === "ok") {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string | undefined;
          return item.value;
        } else {
          item.value satisfies string | undefined;
          // @ts-expect-error
          item.value satisfies boolean;
          return !!item.value;
        }
      });
      resultOpt satisfies
        | Field<string | undefined>
        | Field<boolean>
        | undefined;
      // @ts-expect-error
      resultOpt satisfies Field<string | undefined> | Field<boolean>;
      // @ts-expect-error
      resultOpt satisfies undefined;
      // @ts-expect-error
      resultOpt.any;

      objPart.find((item) => {
        item satisfies Field<boolean> | Field<string | undefined>;
        // @ts-expect-error
        item.any;
        return true;
      });
      objPart.find(() => true);
    }
  }

  // Record
  {
    const result = rec.find((item, key) => {
      item satisfies Field<string | boolean>;
      // @ts-expect-error
      item.any;

      key satisfies string;
      // @ts-expect-error
      key.any;
    });

    result satisfies Field<string | boolean> | undefined;
    // @ts-expect-error
    result satisfies Field<string> | Field<boolean> | undefined;
    // @ts-expect-error
    result satisfies undefined;
    // @ts-expect-error
    result.any;
  }

  // Primitive
  {
    // @ts-expect-error
    prim.find((item, index) => {});
  }

  // Branded primitive
  {
    // @ts-expect-error
    brandedPrim.find((item, index) => {});
  }
}
//#endregion

//#region Field#filter
{
  // Array
  {
    const result = readonlyArr.find((item, index) => {
      item satisfies Field.Base<string | boolean>;
      // @ts-expect-error
      item satisfies Field.Base<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string | boolean, "detachable">;
      index satisfies number;
      return item.value === "hello";
    });

    result satisfies Field.Base<string | boolean> | undefined;
    // @ts-expect-error
    result satisfies Field.Base<string | boolean, "detachable"> | undefined;
    // @ts-expect-error
    result satisfies Field<string | boolean> | undefined;
    // @ts-expect-error
    result satisfies Field.Base<string> | Field.Base<boolean>;
    // @ts-expect-error
    result satisfies Field.Base<string | boolean>;
    // @ts-expect-error
    result satisfies undefined;
    // @ts-expect-error
    result.any;

    arr.find((item) => {
      item satisfies Field.Base<string | boolean>;
      return true;
    });
    arr.find(() => true);

    arr.find((_item) => 0);
    arr.find((_item) => "");
    arr.find((_item) => null);
    // @ts-expect-error
    arr.find((item) => item.value.toExponential());
  }

  // Tuple
  {
    const result = tuple.filter((item, index) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      // @ts-expect-error
      item satisfies
        | Field<string, "detachable">
        | Field<boolean, "detachable">
        | Field<symbol, "detachable">;
      index satisfies 0 | 1 | 2;
      if (index === 1) {
        item.value satisfies boolean;
        // @ts-expect-error
        item.value.any;
      }
      return false;
    });
    result satisfies Array<Field<string> | Field<boolean> | Field<symbol>>;
    // @ts-expect-error
    result satisfies Array<
      | Field<string, "detachable">
      | Field<boolean, "detachable">
      | Field<symbol, "detachable">
    >;
    // @ts-expect-error
    result satisfies Array<Field<string | boolean | symbol>>;
    // @ts-expect-error
    result.any;

    tuple.filter((item) => {
      item satisfies Field<string> | Field<boolean> | Field<symbol>;
      return true;
    });
    tuple.filter(() => true);
    tuple.filter((_item) => 0);
    tuple.filter((_item) => "");
    tuple.filter((_item) => null);
    // @ts-expect-error
    tuple.filter((item) => item.value.toExponential());
  }

  // Array
  {
    const result = arr.filter((item, index) => {
      item satisfies Field<string | boolean, "detachable">;
      index satisfies number;
      return true;
    });
    result satisfies Array<Field<string | boolean, "detachable">>;
    // @ts-expect-error
    result.any;

    arr.filter((item) => {
      item satisfies Field<string | boolean, "detachable">;
      return true;
    });
    arr.filter(() => true);
    arr.filter((_item) => 0);
    arr.filter((_item) => "");
    arr.filter((_item) => null);
    // @ts-expect-error
    arr.filter((item) => item.value.toExponential());
  }

  // Object
  {
    // Regular
    {
      const result = obj.filter((item, key) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item satisfies
          | Field<string, "detachable">
          | Field<boolean | "detachable">;
        // @ts-expect-error
        item.any;
        key satisfies keyof Hello;
        // @ts-expect-error
        key.any;
        if (key === "hello") {
          item.value satisfies string;
          // @ts-expect-error
          item.value satisfies number;
          return item.value.length > 0;
        } else {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string;
          return item.value === true ? 1 : 0;
        }
      });
      result satisfies Array<Field<string> | Field<boolean>>;
      // @ts-expect-error
      result.any;

      obj.filter((item) => {
        item satisfies Field<string> | Field<boolean>;
        // @ts-expect-error
        item.any;
        return true;
      });
      obj.filter(() => true);
      obj.filter((_item) => 0);
      obj.filter((_item) => "");
      obj.filter((_item) => null);
      // @ts-expect-error
      obj.filter((item) => item.value.toExponential());
    }

    // Optional
    {
      const result = objPart.filter((item, key) => {
        item satisfies Field<boolean> | Field<string | undefined, "detachable">;
        // @ts-expect-error
        item satisfies
          | Field<boolean, "detachable">
          | Field<string | undefined, "detachable">;
        // @ts-expect-error
        item.any;
        key satisfies keyof Ok;
        // @ts-expect-error
        key.any;
        if (key === "ok") {
          item.value satisfies boolean;
          // @ts-expect-error
          item.value satisfies string | undefined;
          return item.value;
        } else {
          item.value satisfies string | undefined;
          // @ts-expect-error
          item.value satisfies boolean;
          return !!item.value;
        }
      });
      result satisfies Array<Field<boolean> | Field<string | undefined>>;
      // @ts-expect-error
      result.any;

      objPart.filter((item) => {
        item satisfies Field<boolean> | Field<string | undefined>;
        // @ts-expect-error
        item.any;
        return true;
      });
      objPart.filter(() => true);
    }
  }

  // Record
  {
    const result = rec.filter((item, key) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item satisfies Field<string, "detachable"> | Field<boolean, "detachable">;
      // @ts-expect-error
      item.any;

      key satisfies string;
      // @ts-expect-error
      key.any;
    });
    result satisfies Array<Field<string | boolean>>;
    // @ts-expect-error
    result.any;

    rec.filter((item) => {
      item satisfies Field<string | boolean, "detachable">;
      // @ts-expect-error
      item.any;
      return true;
    });
    rec.filter(() => true);
    rec.filter((_item) => 0);
    rec.filter((_item) => "");
    rec.filter((_item) => null);
    // @ts-expect-error
    rec.filter((item) => item.value.toExponential());
  }

  // Primitive
  {
    // @ts-expect-error
    prim.filter((item, index) => {});
  }

  // Branded primitive
  {
    // @ts-expect-error
    brandedPrim.filter((item, index) => {});
  }
}
//#endregion

//#region Field#useCollection
{
  // Readonly array
  {
    const field = new Field({} as readonly string[]);
    const result = field.useCollection();
    result satisfies Field<readonly string[], "bound">;
    // @ts-expect-error
    result satisfies Field<string[], "bound">;
    // @ts-expect-error
    result.any;
  }

  // Tuple
  {
    const field = new Field({} as ["a", "b", "c"]);
    const result = field.useCollection();
    result satisfies Field<["a", "b", "c"], "bound">;
    // @ts-expect-error
    result satisfies Field<string[], "bound">;
    // @ts-expect-error
    result.any;
  }

  // Array
  {
    const field = new Field<string[]>([]);
    const result = field.useCollection();
    result satisfies Field<string[], "bound">;
    // @ts-expect-error
    result satisfies Field<number[], "bound">;
    // @ts-expect-error
    result.any;
  }

  // Object
  {
    const field = new Field({} as Hello);
    const result = field.useCollection();
    result satisfies Field<Hello, "bound">;
    // @ts-expect-error
    result satisfies Field<Blah, "bound">;
    // @ts-expect-error
    result.any;
  }

  // Record
  {
    const field = new Field({} as Record<string, string | boolean>);
    const result = field.useCollection();
    result satisfies Field<Record<string, string | boolean>, "bound">;
    // @ts-expect-error
    result satisfies Field<Record<string, string>, "bound">;
    // @ts-expect-error
    result.any;
  }

  // Qualifier
  {
    const field = {} as Field<Hello, "detachable">;
    const result = field.useCollection();
    result satisfies Field<Hello, "bound" | "detachable">;
    // @ts-expect-error
    result satisfies Field<Hello, "bound" | "tried">;
    // @ts-expect-error
    result satisfies Field<Blah, "bound" | "detachable">;
    // @ts-expect-error
    result.any;
  }

  // Primitive
  {
    const field = new Field("hello");
    // @ts-expect-error
    field.useCollection();
  }

  // Branded primitive
  {
    const field = new Field({} as Branded<string>);
    // @ts-expect-error
    field.useCollection();
  }
}
//#endregion

//#region Field#remove
{
  // Array
  {
    const field = new Field<string[]>(["hello", "world"]);

    const result = field.remove(0);

    result satisfies Field<DetachedValue | string, "detachable">;
    // @ts-expect-error
    result satisfies Field<string, "detachable">;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    field.remove("hello");
  }

  // Object
  {
    const field = new Field<{ a: 1; b?: 2 }>({ a: 1, b: 2 });

    const result = field.remove("b");
    result satisfies Field<DetachedValue | 2 | undefined, "detachable">;
    // @ts-expect-error
    result satisfies Field<2 | undefined, "detachable">;

    // @ts-expect-error
    field.remove("a");
    // @ts-expect-error
    field.remove(1);
  }

  // Record
  {
    const field = new Field({} as Record<string, string>);

    const result = field.remove("key");
    result satisfies Field<DetachedValue | string, "detachable">;
    // @ts-expect-error
    result satisfies Field<DetachedValue | string | undefined, "detachable">;

    // @ts-expect-error
    field.remove(1);
  }

  // Readonly array
  {
    const field = new Field<readonly string[]>([]);
    // @ts-expect-error
    field.remove.apply;
  }

  // Tuple
  {
    const field = new Field<[1, 2, 3]>([1, 2, 3]);
    // @ts-expect-error
    field.remove.apply;
  }

  // Primitive
  {
    const field = new Field(1);
    // @ts-expect-error
    field.remove.apply;
  }

  // Branded
  {
    const field = new Field(1 as Branded<number>);
    // @ts-expect-error
    field.remove.apply;
  }
}
//#endregion

//#region Field#self.remove
{
  // Detachable
  {
    const field = new Field("hello") as Field<string, "detachable">;

    const result = field.self.remove();

    result satisfies Field<DetachedValue, "detachable">;
    // @ts-expect-error
    result satisfies Field<string, "detachable">;
    // @ts-expect-error
    result.any;
  }

  // Non-detachable
  {
    const field = new Field("hello") as Field<string>;

    // @ts-expect-error
    field.self.remove();
  }
}
//#endregion

//#endregion

//#region Array

//#region Field#insert
{
  // Array
  {
    const field = new Field<string[]>([]);

    const result = field.insert(0, "hello");

    result satisfies Field<string, "detachable">;
    // @ts-expect-error
    result satisfies Field<string, "bound">;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    field.insert(123, 2);
  }

  // Readonly array
  {
    const field = new Field([] as readonly number[]);
    // @ts-expect-error
    field.insert(0, 4);
  }

  // Tuple
  {
    const field = new Field([1, 2, 3] as const);
    // @ts-expect-error
    field.insert(0, 4);
  }

  // Object
  {
    const field = new Field({ a: 1, b: 2 });
    // @ts-expect-error
    field.insert("a", 4);
  }

  // Record
  {
    const field = new Field({} as Record<string, number>);
    // @ts-expect-error
    field.insert("a", 4);
  }

  // Primitive
  {
    const field = new Field("") as Field<string>;
    // @ts-expect-error
    field.insert("length", 0);
  }

  // Branded primitive
  {
    const field = new Field({} as Field<Branded<string>>);
    // @ts-expect-error
    field.insert("length", 0);
  }

  // Base
  {
    const field = new Field([]) as Field.Base<string[]>;
    // @ts-expect-error
    field.insert(0, "hello");
  }

  // Immutable
  {
    const field = new Field([]) as Field.Immutable<string[]>;
    // @ts-expect-error
    field.insert(0, "hello");
  }
}
//#endregion

//#region Field#push
{
  // Array
  {
    const field = new Field<string[]>([]);

    const result = field.push("hello");

    result satisfies Field<string, "detachable">;
    // @ts-expect-error
    result satisfies Field<string, "bound">;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    field.push(2);
  }

  // Readonly array
  {
    const field = new Field([] as readonly number[]);
    // @ts-expect-error
    field.push(4);
  }

  // Tuple
  {
    const field = new Field([1, 2, 3] as const);
    // @ts-expect-error
    field.push(4);
  }

  // Object
  {
    const field = new Field({ a: 1, b: 2 });
    // @ts-expect-error
    field.push(4);
  }

  // Record
  {
    const field = new Field({} as Record<string, number>);
    // @ts-expect-error
    field.push(4);
  }

  // Primitive
  {
    const field = new Field("") as Field.Base<string>;
    // @ts-expect-error
    field.push("hello");
  }

  // Base
  {
    const field = new Field([]) as Field.Base<string[]>;
    // @ts-expect-error
    field.push("hello");
  }

  // Immutable
  {
    const field = new Field([]) as Field.Immutable<string[]>;
    // @ts-expect-error
    field.push("hello");
  }
}
//#endregion

//#endregion

//#endregion

//#region Events

//#region Field#watch
{
  const field = new Field("hello");
  const off = field.watch((newValue, event) => {
    newValue satisfies string;
    // @ts-expect-error
    newValue.any;

    event satisfies ChangesEvent;
    // @ts-expect-error
    event.any;
  });

  off();
  // @ts-expect-error
  off.any;
}
//#endregion

//#region Field#useWatch
{
  const field = new Field("hello");
  const off = field.useWatch((newValue, event) => {
    newValue satisfies string;
    // @ts-expect-error
    newValue.any;

    event satisfies ChangesEvent;
    // @ts-expect-error
    event.any;
  }, []);

  off();
  // @ts-expect-error
  off.any;
}
//#endregion

//#endregion

//#region Transform

const unionValue = new Field<Hello | Blah>({ hello: "world", world: true });
const unionField = new Field({ hello: "world", world: true }) as
  | Field<Hello>
  | Field<Blah>;

//#region Field#decompose
{
  // Value union
  {
    const decomposed = unionValue.decompose();
    decomposed satisfies
      | {
          value: Hello;
          field: Field<Hello>;
        }
      | {
          value: Blah;
          field: Field<Blah>;
        };
    // @ts-expect-error
    decomposed.any;

    const _manual: Field.Decomposed<Hello | Blah> = decomposed;
    // @ts-expect-error
    const _manualWrong: Field.Decomposed<Hello> = decomposed;
  }

  // Field union
  {
    const decomposed = unionField.decompose();
    decomposed satisfies
      | {
          value: Hello;
          field: Field<Hello>;
        }
      | {
          value: Blah;
          field: Field<Blah>;
        };
    // @ts-expect-error
    decomposed.any;

    const _manual: Field.Decomposed<Hello | Blah> = decomposed;
    // @ts-expect-error
    const _manualWrong: Field.Decomposed<Hello> = decomposed;
  }

  // Detachable
  {
    const decomposed = (
      unionValue as Field<Hello | Blah, "detachable">
    ).decompose();
    decomposed satisfies
      | {
          value: Hello;
          field: Field<Hello, "detachable">;
        }
      | {
          value: Blah;
          field: Field<Blah, "detachable">;
        };
    // @ts-expect-error
    decomposed.any;

    const _manual: Field.Decomposed<Hello | Blah, "detachable"> = decomposed;
    // @ts-expect-error
    const _manualWrong1: Field.Decomposed<Hello> = decomposed;
    // @ts-expect-error
    const _manualWrong2: Field.Decomposed<Hello | Blah, "bound"> = decomposed;
    // @ts-expect-error
    const _manualWrong3: Field.Decomposed<
      Hello | Blah,
      "detachable" | "bound"
    > = decomposed;
  }
}
//#endregion

//#region Field#useDecompose
{
  // Value union
  {
    const decomposed = unionValue.useDecompose((newValue, prevValue) => {
      newValue satisfies Hello | Blah;
      // @ts-expect-error
      newValue.any;

      prevValue satisfies Hello | Blah;
      // @ts-expect-error
      prevValue.any;

      return true;
    }, []);
    decomposed satisfies
      | {
          value: Hello;
          field: Field<Hello>;
        }
      | {
          value: Blah;
          field: Field<Blah>;
        };
    // @ts-expect-error
    decomposed.any;

    const _manual: Field.Decomposed<Hello | Blah> = decomposed;
    // @ts-expect-error
    const _manualWrong: Field.Decomposed<Hello> = decomposed;
  }

  // Field union
  {
    const decomposed = unionField.useDecompose((newValue, prevValue) => {
      newValue satisfies Hello | Blah;
      // @ts-expect-error
      newValue.any;

      prevValue satisfies Hello | Blah;
      // @ts-expect-error
      prevValue.any;

      return true;
    }, []);
    decomposed satisfies
      | {
          value: Hello;
          field: Field<Hello>;
        }
      | {
          value: Blah;
          field: Field<Blah>;
        };
    // @ts-expect-error
    decomposed.any;

    const _manual: Field.Decomposed<Hello | Blah> = decomposed;
    // @ts-expect-error
    const _manualWrong: Field.Decomposed<Hello> = decomposed;
  }

  // Detachable
  {
    const decomposed = (
      unionValue as Field<Hello | Blah, "detachable">
    ).useDecompose((newValue, prevValue) => {
      newValue satisfies Hello | Blah;
      // @ts-expect-error
      newValue.any;

      prevValue satisfies Hello | Blah;
      // @ts-expect-error
      prevValue.any;

      return true;
    }, []);
    decomposed satisfies
      | {
          value: Hello;
          field: Field<Hello, "detachable">;
        }
      | {
          value: Blah;
          field: Field<Blah, "detachable">;
        };
    // @ts-expect-error
    decomposed.any;

    const _manual: Field.Decomposed<Hello | Blah, "detachable"> = decomposed;
    // @ts-expect-error
    const _manualWrong1: Field.Decomposed<Hello> = decomposed;
    // @ts-expect-error
    const _manualWrong2: Field.Decomposed<Hello | Blah, "bound"> = decomposed;
    // @ts-expect-error
    const _manualWrong3: Field.Decomposed<
      Hello | Blah,
      "detachable" | "bound"
    > = decomposed;
  }
}
//#endregion

//#region Field["discriminate"] / Field["useDiscriminate"]
{
  function _discriminate<Value, Key extends keyof Value>(
    field: Field<Value>,
    key: Key,
  ): Field.Discriminated<Value, Key> {
    return Math.random() > 0.5
      ? field.discriminate(key)
      : field.useDiscriminate(key);
  }

  interface Named {
    type: string;
    name: string;
  }

  interface User extends Named {
    type: "user";
    email: string;
  }

  interface Organization extends Named {
    type: "organization";
    paid: boolean;
  }

  interface Unrelated {
    type: "unrelated";
    value: string;
  }

  const unionValue = new Field<User | Organization>({} as User);
  const unionField = new Field({} as User) as Field<User> | Field<Organization>;

  // Value union
  {
    const result = unionValue.discriminate("type");

    result satisfies
      | {
          discriminator: "user";
          field: Field<User>;
        }
      | {
          discriminator: "organization";
          field: Field<Organization>;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "detachable">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field<User, "tried">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "tried">;
        };
    // @ts-expect-error
    result.any;

    if (result.discriminator === "user") {
      result.field satisfies Field<User>;
      result.field satisfies Field.Base<User>;
      // @ts-expect-error
      result.field satisfies Field<Organization>;
      // @ts-expect-error
      result.field.any;

      result.field.value satisfies User;
    }

    const _manual1: Field.Discriminated<User | Organization, "type"> = result;
    const _manual2: Field.Base.Discriminated<User | Organization, "type"> =
      result;
    const _manual3: Field.Discriminated<
      User | Organization | Unrelated,
      "type"
    > = result;
    const _manual4: Field.Base.Discriminated<
      User | Organization | Unrelated,
      "type"
    > = result;
    // @ts-expect-error
    const _manualWrong1: Field.Discriminated<User, "type"> = result;
    // @ts-expect-error
    const _manualWrong2: Field.Discriminated<Named, "type"> = result;
    // @ts-expect-error
    const _manualWrong3: Field.Discriminated<Unrelated, "type"> = result;

    // @ts-expect-error
    unionValue.discriminate("paid");
  }

  // Field union
  {
    const result = Field.base(unionField).discriminate("type");

    result satisfies
      | {
          discriminator: "user";
          field: Field.Base<User>;
        }
      | {
          discriminator: "organization";
          field: Field.Base<Organization>;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown>;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field.Base<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field.Base<Organization, "detachable">;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown>;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field.Base<User, "tried">;
        }
      | {
          discriminator: "organization";
          field: Field.Base<Organization, "tried">;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown>;
        };
    // @ts-expect-error
    result.any;

    if (result.discriminator === "user") {
      result.field satisfies Field.Base<User>;
      // @ts-expect-error
      result.field satisfies Field<User>;
      // @ts-expect-error
      result.field satisfies Field.Base<Organization>;
      // @ts-expect-error
      result.field.any;

      result.field.value satisfies User;
    }

    const _manual1: Field.Base.Discriminated<User | Organization, "type"> =
      result;
    const _manual2: Field.Base.Discriminated<
      User | Organization | Unrelated,
      "type"
    > = result;
    // @ts-expect-error
    const _manualWrong1: Field.Discriminated<User | Organization, "type"> =
      result;
    // @ts-expect-error
    const _manualWrong2: Field.Base.Discriminated<User, "type"> = result;
    // @ts-expect-error
    const _manualWrong4: Field.Base.Discriminated<Unrelated, "type"> = result;
    // @ts-expect-error
    const _manualWrong5: Field.Base.Discriminated<Named, "type"> = result;

    // @ts-expect-error
    unionField.discriminate("paid");
  }

  // Undefined value
  {
    const result = (
      unionValue as Field<User | Organization | undefined>
    ).discriminate("type");

    result satisfies
      | {
          discriminator: undefined;
          field: Field<undefined>;
        }
      | {
          discriminator: "user";
          field: Field<User>;
        }
      | {
          discriminator: "organization";
          field: Field<Organization>;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: undefined;
          field: Field<undefined, "detachable">;
        }
      | {
          discriminator: "user";
          field: Field<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "detachable">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: undefined;
          field: Field<undefined, "tried">;
        }
      | {
          discriminator: "user";
          field: Field<User, "tried">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "tried">;
        };
    // @ts-expect-error
    result.any;

    if (result.discriminator === "user") {
      result.field satisfies Field<User>;
      result.field satisfies Field.Base<User>;
      // @ts-expect-error
      result.field satisfies Field<Organization>;
      // @ts-expect-error
      result.field.any;

      result.field.value satisfies User;
    }

    const _manual1: Field.Discriminated<
      User | Organization | undefined,
      "type"
    > = result;
    const _manual2: Field.Base.Discriminated<
      User | Organization | undefined,
      "type"
    > = result;
    const _manual3: Field.Base.Discriminated<
      User | Organization | undefined | Unrelated,
      "type"
    > = result;
    // @ts-expect-error
    const _manualWrong1: Field.Discriminated<User | Organization, "type"> =
      result;
    // @ts-expect-error
    const _manualWrong2: Field.Discriminated<Named | undefined, "type"> =
      result;
    // @ts-expect-error
    const _manualWrong3: Field.Discriminated<Unrelated | undefined, "type"> =
      result;
    // @ts-expect-error
    const _manualWrong4: Field.Discriminated<Named | undefined, "type"> =
      result;

    // @ts-expect-error
    unionValue.discriminate("paid");
  }

  // Detachable
  {
    const result = (
      unionValue as Field<User | Organization, "detachable">
    ).discriminate("type");

    result satisfies
      | {
          discriminator: "user";
          field: Field<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "detachable">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field<User, "tried">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "tried">;
        };
    // @ts-expect-error
    result.any;

    if (result.discriminator === "user") {
      result.field satisfies Field<User, "detachable">;
      result.field satisfies Field.Base<User, "detachable">;
      // @ts-expect-error
      result.field satisfies Field<User, "bound">;
      // @ts-expect-error
      result.field satisfies Field<Organization, "detachable">;
      // @ts-expect-error
      result.field.any;

      result.field.value satisfies User;
    }

    const _manual1: Field.Discriminated<
      User | Organization,
      "type",
      "detachable"
    > = result;
    const _manual2: Field.Discriminated<User | Organization, "type"> = result;
    const _manual3: Field.Base.Discriminated<
      User | Organization,
      "type",
      "detachable"
    > = result;
    const _manual4: Field.Discriminated<
      User | Organization | Unrelated,
      "type",
      "detachable"
    > = result;
    const _manual5: Field.Base.Discriminated<
      User | Organization | Unrelated,
      "type",
      "detachable"
    > = result;
    // @ts-expect-error
    const _manualWrong1: Field.Discriminated<User, "type", "detachable"> =
      result;
    // @ts-expect-error
    const _manualWrong2: Field.Discriminated<
      User | Organization,
      "type",
      "tried"
    > = result;
    // @ts-expect-error
    const _manualWrong3: Field.Discriminated<Named, "type", "detachable"> =
      result;
    // @ts-expect-error
    const _manualWrong4: Field.Discriminated<Unrelated, "type", "detachable"> =
      result;
  }

  // Mixed
  {
    const result = Field.base(
      unionField as
        | Field<User, "detachable" | "tried">
        | Field<Organization, "detachable">,
    ).discriminate("type");

    result satisfies
      | {
          discriminator: "user";
          field: Field.Base<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field.Base<Organization, "detachable">;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown, "detachable">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field.Base<User, "detachable" | "tried">;
        }
      | {
          discriminator: "organization";
          field: Field.Base<Organization, "detachable" | "tried">;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown, "detachable" | "tried">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field<User, "bound">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "bound">;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown, "detachable">;
        };
    // @ts-expect-error
    result.any;

    if (result.discriminator === "user") {
      result.field satisfies Field.Base<User, "detachable">;
      // @ts-expect-error
      result.field satisfies Field<User, "detachable">;
      // @ts-expect-error
      result.field satisfies Field.Base<User, "tried">;
      // @ts-expect-error
      result.field satisfies Field.Base<Organization, "detachable">;
      // @ts-expect-error
      result.field.any;

      result.field.value satisfies User;
    }

    const _manual1: Field.Base.Discriminated<
      User | Organization,
      "type",
      "detachable"
    > = result;
    const _manual2: Field.Base.Discriminated<
      User | Organization | Unrelated,
      "type",
      "detachable"
    > = result;
    // @ts-expect-error
    const _manualWrong1: Field.Base.Discriminated<
      User | Organization,
      "type",
      "bound"
    > = result;
    // @ts-expect-error
    const _manualWrong2: Field.Discriminated<
      User | Organization,
      "type",
      "detachable"
    > = result;
    // @ts-expect-error
    const _manualWrong3: Field.Base.Discriminated<User, "type", "detachable"> =
      result;
    // @ts-expect-error
    const _manualWrong5: Field.Base.Discriminated<
      Unrelated,
      "type",
      "detachable"
    > = result;
    // @ts-expect-error
    const _manualWrong6: Field.Base.Discriminated<Named, "type", "detachable"> =
      result;
  }

  // Immutable
  {
    const result = (
      unionValue as unknown as Field.Immutable<User | Organization, "bound">
    ).discriminate("type");

    result satisfies
      | {
          discriminator: "user";
          field: Field.Immutable<User, "bound">;
        }
      | {
          discriminator: "organization";
          field: Field.Immutable<Organization, "bound">;
        }
      | {
          discriminator: unknown;
          field: Field.Immutable<unknown, "bound">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field.Immutable<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field.Immutable<Organization, "detachable">;
        }
      | {
          discriminator: unknown;
          field: Field.Immutable<unknown, "detachable">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field.Base<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field.Base<Organization, "detachable">;
        }
      | {
          discriminator: unknown;
          field: Field.Base<unknown, "detachable">;
        };
    // @ts-expect-error
    result satisfies
      | {
          discriminator: "user";
          field: Field<User, "detachable">;
        }
      | {
          discriminator: "organization";
          field: Field<Organization, "detachable">;
        }
      | {
          discriminator: unknown;
          field: Field<unknown, "detachable">;
        };
    // @ts-expect-error
    result.any;

    if (result.discriminator === "user") {
      result.field satisfies Field.Immutable<User>;
      // @ts-expect-error
      result.field satisfies Field<User>;
      // @ts-expect-error
      result.field satisfies Field.Base<User>;
      // @ts-expect-error
      result.field satisfies Field.Immutable<Organization>;
      // @ts-expect-error
      result.field.any;

      result.field.value satisfies User;
    }

    const _manual1: Field.Immutable.Discriminated<
      User | Organization,
      "type",
      "bound"
    > = result;
    const _manual2: Field.Immutable.Discriminated<
      User | Organization | Unrelated,
      "type",
      "bound"
    > = result;
    // @ts-expect-error
    const _manualWrong1: Field.Discriminated<
      User | Organization,
      "type",
      "bound"
    > = result;
    // @ts-expect-error
    const _manualWrong2: Field.Immutable.Discriminated<User, "type", "bound"> =
      result;
    // @ts-expect-error
    const _manualWrong4: Field.Immutable.Discriminated<
      Unrelated,
      "type",
      "bound"
    > = result;
    // @ts-expect-error
    const _manualWrong5: Field.Immutable.Discriminated<Named, "type", "bound"> =
      result;

    // @ts-expect-error
    unionField.discriminate("paid");
  }
}
//#endregion

//#region Field["into"]
{
  // Exact
  {
    const field = new Field("hello");
    const result = field
      .into((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      })
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      });

    result satisfies Field<number, Field.Proxied<string>>;
    result satisfies Field<number>;
    result satisfies Field<number, Field.Proxied<any>>;
    result satisfies Field<number, Field.Proxied<unknown>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxied<number>>;

    const nestedResult = result
      .into((value) => {
        value satisfies number;
        // @ts-expect-error
        value.any;

        return value.toString();
      })
      .from((stringifiedValue, value) => {
        stringifiedValue satisfies string;
        // @ts-expect-error
        stringifiedValue.any;

        value satisfies number;
        // @ts-expect-error
        value.any;

        return Number(stringifiedValue);
      });
    nestedResult satisfies Field<string, Field.Proxied<number>>;
    // @ts-expect-error
    nestedResult.any;
  }

  // Base
  {
    const field = new Field("hello") as Field.Base<string>;
    const result = field
      .into((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      })
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      });

    result satisfies Field.Base<number, Field.Proxied<string>>;
    result satisfies Field.Base<number>;
    result satisfies Field.Base<number, Field.Proxied<any>>;
    result satisfies Field.Base<number, Field.Proxied<unknown>>;
    // @ts-expect-error
    result satisfies Field.Base<number, Field.Proxied<number>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxied<string>>;

    const nestedResult = result
      .into((value) => {
        value satisfies number;
        // @ts-expect-error
        value.any;

        return value.toString();
      })
      .from((stringifiedValue, value) => {
        stringifiedValue satisfies string;
        // @ts-expect-error
        stringifiedValue.any;

        value satisfies number;
        // @ts-expect-error
        value.any;

        return Number(stringifiedValue);
      });
    nestedResult satisfies Field.Base<string, Field.Proxied<number>>;
    // @ts-expect-error
    nestedResult.any;
  }

  // Immutable
  {
    const field = new Field("hello") as Field.Immutable<string>;
    const result = field
      .into((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      })
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      });

    result satisfies Field.Immutable<number, Field.Proxied<string>>;
    result satisfies Field.Immutable<number>;
    result satisfies Field.Immutable<number, Field.Proxied<any>>;
    result satisfies Field.Immutable<number, Field.Proxied<unknown>>;
    // @ts-expect-error
    result satisfies Field.Immutable<number, Field.Proxied<number>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxied<string>>;

    const nestedResult = result
      .into((value) => {
        value satisfies number;
        // @ts-expect-error
        value.any;

        return value.toString();
      })
      .from((stringifiedValue, value) => {
        stringifiedValue satisfies string;
        // @ts-expect-error
        stringifiedValue.any;

        value satisfies number;
        // @ts-expect-error
        value.any;

        return Number(stringifiedValue);
      });
    nestedResult satisfies Field.Immutable<string, Field.Proxied<number>>;
    // @ts-expect-error
    nestedResult.any;
  }

  // Qualifiers
  {
    const field = new Field("hello") as Field<string, "detachable" | "bound">;
    const result = field
      .into((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      })
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      });

    result satisfies Field<number, Field.Proxied<string>>;
    // @ts-expect-error
    result.any;
  }
}
//#endregion

//#region Field["useInto"]
{
  // Exact
  {
    const field = new Field("hello");
    const result = field
      .useInto((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      }, [])
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      }, []);

    result satisfies Field<number, Field.Proxied<string>>;
    result satisfies Field<number>;
    result satisfies Field<number, Field.Proxied<any>>;
    result satisfies Field<number, Field.Proxied<unknown>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxied<number>>;
  }

  // Base
  {
    const field = new Field("hello") as Field.Base<string>;
    const result = field
      .useInto((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      }, [])
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      }, []);

    result satisfies Field.Base<number, Field.Proxied<string>>;
    result satisfies Field.Base<number>;
    result satisfies Field.Base<number, Field.Proxied<any>>;
    result satisfies Field.Base<number, Field.Proxied<unknown>>;
    // @ts-expect-error
    result satisfies Field.Base<number, Field.Proxied<number>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxied<string>>;
  }

  // Immutable
  {
    const field = new Field("hello") as Field.Immutable<string>;
    const result = field
      .into((value) => {
        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.length;
      })
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string;
        // @ts-expect-error
        value.any;

        return value.slice(0, sizeValue);
      });

    result satisfies Field.Immutable<number, Field.Proxied<string>>;
    result satisfies Field.Immutable<number>;
    result satisfies Field.Immutable<number, Field.Proxied<any>>;
    result satisfies Field.Immutable<number, Field.Proxied<unknown>>;
    // @ts-expect-error
    result satisfies Field.Immutable<number, Field.Proxied<number>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxied<string>>;
  }
}
//#endregion

//#region Field#useDefined
{
  // String
  {
    // Basic
    {
      const field = new Field("hello") as Field<string | undefined | null>;

      const result = field.useDefined("string");
      result satisfies Field<string>;
      // @ts-expect-error
      result.any;
    }

    // Defined
    {
      const field = new Field("hello") as Field<string>;

      const result = field.useDefined("string");
      result satisfies Field<string>;
      // @ts-expect-error
      result.any;
    }

    // Mixed
    {
      const field = new Field("hello") as Field<string | number>;

      // @ts-expect-error
      field.useDefined("string");
    }

    // Number
    {
      const field = new Field(0) as Field<number | undefined>;

      // @ts-expect-error
      field.useDefined("string");
    }

    // Base
    {
      const field = new Field("hello") as Field.Base<string>;

      const result = field.useDefined("string");
      result satisfies Field.Base<string>;
      // @ts-expect-error
      result satisfies Field<string>;
      // @ts-expect-error
      result.any;
    }

    // Immutable
    {
      const field = new Field("hello") as Field.Base<string>;

      const result = field.useDefined("string");
      result satisfies Field.Base<string>;
      // @ts-expect-error
      result satisfies Field<string>;
      // @ts-expect-error
      result.any;
    }
  }
}
//#endregion

//#endregion

//#region Validation

//#region Field#errors
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  field.errors satisfies Field.Error[];
  // @ts-expect-error
  field.errors.any;
}
//#endregion

//#region Field#useErrors
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  const result = field.useErrors();
  result satisfies Field.Error[];
  // @ts-expect-error
  result.any;
}
//#endregion

//#region Field#valid
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  field.valid satisfies boolean;
  // @ts-expect-error
  field.valid.any;
}
//#endregion

//#region Field#useValid
{
  const field = new Field("hello") as
    | Field<string>
    | Field.Base<string>
    | Field.Immutable<string>;

  const result = field.useValid();
  result satisfies boolean;
  // @ts-expect-error
  result.any;
}
//#endregion

//#endregion

//#region Helpers

function tyst<Type>(_arg: Type): void {}

interface Hello {
  hello: string;
  world: boolean;
}

interface Ok {
  ok: boolean;
  message?: string;
}

interface Blah {
  blah: string;
}

interface Entity {
  name: string;
  flag?: boolean;
}

interface Account extends Entity {
  paid: boolean;
}

interface User extends Entity {
  age: number;
  email?: string;
}

interface Container {
  entity: Entity;
}

interface Organization {
  owner: User;
}

type Branded<Type> = Type & { [brand]: true };
declare const brand: unique symbol;

type ContainerParent = Field.Parent<Container, "entity">;

type OrganizationParent = Field.Parent<Organization, "owner">;

//#endregion
