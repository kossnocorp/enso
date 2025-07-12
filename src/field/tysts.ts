import { State } from "../state/index.ts";
import { Field } from "./index.js";

// Variance
{
  // `Field.Common` as `Field.Common`
  {
    let _entity: Field.Common<Entity>;

    // Basic
    {
      _entity = {} as Field.Common<Account | User>;
      _entity = {} as Field.Common<Account>;
      _entity = {} as Field.Common<User>;

      let _account: Field.Common<Account>;
      // @ts-expect-error
      _account = {} as Field.Common<Account | User>;
      _account = {} as Field.Common<Account>;
      // @ts-expect-error
      _account = {} as Field.Common<User>;
    }

    // Qualifiers
    {
      let _common: Field.Common<Entity>;
      _common = {} as Field.Common<Account | User, "detachable">;
      _common = {} as Field.Common<Account | User, "detachable" | "tried">;

      let _detachable: Field.Common<Entity, "detachable">;
      _detachable = {} as Field.Common<Account | User, "detachable">;
      _detachable = {} as Field.Common<Account, "detachable">;
      _detachable = {} as Field.Common<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field.Common<Entity>;

      let _mixed: Field.Common<Entity, "detachable" | "tried">;
      _mixed = {} as Field.Common<Account | User, "detachable" | "tried">;
      _mixed = {} as Field.Common<Account, "detachable" | "tried">;
      _mixed = {} as Field.Common<Account, "detachable" | "tried" | "bound">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Entity, "detachable">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Entity, "tried">;
    }

    // Parent
    {
      _entity = {} as Field.Common<Entity, never, ContainerParent>;
      _entity = {} as Field.Common<Entity, never, OrganizationParent>;

      let _container: Field.Common<Entity, never, ContainerParent>;
      _container = {} as Field.Common<Entity, never, ContainerParent>;
      _container = {} as Field.Common<Account | User, never, ContainerParent>;
      _container = {} as Field.Common<Account, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Common<Account>;
      // @ts-expect-error
      _container = {} as Field.Common<Entity, never, OrganizationParent>;

      let _organization: Field.Common<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Common<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Common<
        Account | User,
        never,
        OrganizationParent
      >;
      // @ts-expect-error
      _organization = {} as Field.Common<User, never, ContainerParent>;
    }
  }

  // `Field` as `Field.Common`
  {
    let _entity: Field.Common<Entity>;

    // Basic
    {
      _entity = {} as Field<Account | User>;
      _entity = {} as Field<Account>;
      _entity = {} as Field<User>;

      let _account: Field.Common<Account>;
      // @ts-expect-error
      _account = {} as Field<Account | User>;
      _account = {} as Field<Account>;
      // @ts-expect-error
      _account = {} as Field<User>;
    }

    // Qualifiers
    {
      let _common: Field.Common<Entity>;
      _common = {} as Field<Account | User, "detachable">;
      _common = {} as Field<Account | User, "detachable" | "tried">;

      let _detachable: Field.Common<Entity, "detachable">;
      _detachable = {} as Field<Account | User, "detachable">;
      _detachable = {} as Field<Account, "detachable">;
      _detachable = {} as Field<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field<Entity>;

      let _mixed: Field.Common<Entity, "detachable" | "tried">;
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

      let _container: Field.Common<Entity, never, ContainerParent>;
      _container = {} as Field<Account | User, never, ContainerParent>;
      _container = {} as Field<Account, never, ContainerParent>;
      _container = {} as Field<User, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field<Account>;
      // @ts-expect-error
      _container = {} as Field<Entity, never, OrganizationParent>;

      let _organization: Field.Common<User, never, OrganizationParent>;
      _organization = {} as Field<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Account | User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<User, never, ContainerParent>;
    }
  }

  // `Field` as `Field`
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

    // Qualifiers
    {
      let _common: Field<Entity>;
      _common = {} as Field<Entity, "detachable">;
      _common = {} as Field<Entity, "detachable" | "tried">;

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
  }

  // `Field.Common` as `Field`
  {
    let _entity: Field<Entity>;

    // Basic
    {
      // @ts-expect-error
      _entity = {} as Field.Common<Account | User>;
      // @ts-expect-error
      _entity = {} as Field.Common<Account>;
      // @ts-expect-error
      _entity = {} as Field.Common<User>;

      let _account: Field<Account>;
      // @ts-expect-error
      _account = {} as Field.Common<Account | User>;
      // @ts-expect-error
      _account = {} as Field.Common<Account>;
      // @ts-expect-error
      _account = {} as Field.Common<User>;
    }

    // Qualifiers
    {
      let _common: Field<Entity>;
      // @ts-expect-error
      _common = {} as Field.Common<Entity, "detachable">;
      // @ts-expect-error
      _common = {} as Field.Common<Entity, "detachable" | "tried">;

      let _detachable: Field<Entity, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field.Common<Account | User, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field.Common<Account, "detachable">;
      // @ts-expect-error
      _detachable = {} as Field.Common<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field.Common<User, "detachable">;

      let _mixed: Field<Entity, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Account | User, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Account, "detachable" | "tried">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Account, "detachable" | "tried" | "bound">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Entity, "detachable">;
      // @ts-expect-error
      _mixed = {} as Field.Common<Entity, "tried">;
    }

    // Parent
    {
      // @ts-expect-error
      _entity = {} as Field.Common<Entity, never, ContainerParent>;
      // @ts-expect-error
      _entity = {} as Field.Common<Entity, never, OrganizationParent>;

      let _container: Field<Entity, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Common<Entity, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Common<Account | User, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Common<Account, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field.Common<Account>;
      // @ts-expect-error
      _container = {} as Field.Common<Entity, never, OrganizationParent>;

      let _organization: Field<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Common<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Common<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field.Common<
        Account | User,
        never,
        OrganizationParent
      >;
      // @ts-expect-error
      _organization = {} as Field.Common<User, never, ContainerParent>;
    }
  }
}

// Field.common
{
  const entity = {} as Field<User> | Field<Account>;

  Field.common(entity) satisfies Field.Common<User | Account>;
  // @ts-expect-error
  Field.common(entity) satisfies Field<User | Account>;
  // @ts-expect-error
  Field.common(entity) satisfies Field.Common<Hello>;

  Field.common(entity).value satisfies User | Account;
  // @ts-expect-error
  Field.common(entity).value satisfies Hello;
}

// `Field["value"]`
{
  // `Field.Common`
  {
    // Primitive
    {
      const number = {} as Field.Common<number>;
      const boolean = {} as Field.Common<boolean>;
      const string = {} as Field.Common<string>;

      number.value satisfies number;
      boolean.value satisfies boolean;
      string.value satisfies string;
    }

    // Object
    {
      const entity = {} as Field.Common<Entity>;
      const account = {} as Field.Common<Account>;
      const user = {} as Field.Common<User>;

      entity.value satisfies Entity;
      // @ts-expect-error
      entity.any;

      account.value satisfies Account;
      // @ts-expect-error
      account.value satisfies User;
      // @ts-expect-error
      account.any;

      user.value satisfies User;
      // @ts-expect-error
      user.value satisfies Account;
      // @ts-expect-error
      user.any;

      // Parent

      const container = {} as Field.Common<Entity, never, ContainerParent>;
      const organization = {} as Field.Common<User, never, OrganizationParent>;

      if ("field" in container.parent) {
        container.parent.field satisfies Field.Immutable<Container>;

        container.value satisfies Entity;
        // @ts-expect-error
        container.any;
      }

      if ("field" in organization.parent) {
        organization.parent.field satisfies Field.Immutable<Organization>;

        organization.value satisfies User;
        // @ts-expect-error
        organization.any;
      }
    }

    // Union value
    {
      const entity = {} as Field.Common<Account | User>;

      entity.$.name satisfies Field<string>;
      // @ts-expect-error
      entity.$.name satisfies State<string>;
      entity.$.name.value satisfies string;
      // @ts-expect-error
      entity.$.name.any;

      // @ts-expect-error
      entity.$.paid;
    }

    // Union field
    {
      const entity = {} as Field.Common<Account> | Field.Common<User>;

      entity.$.name satisfies Field<string>;
      // @ts-expect-error
      entity.$.name satisfies State<string>;
      entity.$.name.value satisfies string;
      // @ts-expect-error
      entity.$.name.any;

      // @ts-expect-error
      entity.$.paid;
    }
  }

  // `Field`
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
      entity.any;

      account.value satisfies Account;
      // @ts-expect-error
      account.value satisfies User;
      // @ts-expect-error
      account.any;

      user.value satisfies User;
      // @ts-expect-error
      user.value satisfies Account;
      // @ts-expect-error
      user.any;

      // Parent

      const container = {} as Field<Entity, never, ContainerParent>;
      const organization = {} as Field<User, never, OrganizationParent>;

      if ("field" in container.parent) {
        container.parent.field satisfies Field.Immutable<Container>;

        container.value satisfies Entity;
        // @ts-expect-error
        container.any;
      }

      if ("field" in organization.parent) {
        organization.parent.field satisfies Field.Immutable<Organization>;

        organization.value satisfies User;
        // @ts-expect-error
        organization.any;
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
      entity.$.name.any;

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
      entity.$.name.any;

      // @ts-expect-error
      entity.$.paid;
    }
  }
}

// `Field["root"]`
{
  // Immutability
  {
    const user = {} as Field<User>;

    user.root satisfies Field.Immutable<unknown, "root">;
    // @ts-expect-error
    user.root satisfies Field.Invariant<unknown, "root">;
  }
}

// `Field["parent"]`
{
  // Immutability
  {
    const organization = {} as Field<User, never, OrganizationParent>;

    if ("field" in organization.parent) {
      organization.parent.field satisfies Field.Immutable<Organization>;
      // @ts-expect-error
      organization.parent.field satisfies Field.Invariant<Organization>;

      organization.parent.field.$.owner satisfies Field.Immutable<User>;
      // @ts-expect-error
      organization.parent.field.$.owner satisfies Field.Invariant<User>;
    }
  }
}

// `Field["$"]`
{
  // Basic
  {
    const user = {} as Field<User>;

    user.$.age satisfies Field<number>;
    // @ts-expect-error
    user.$.age satisfies State<number>;
    // @ts-expect-error
    user.$.age satisfies Field<string>;

    user.$.email satisfies Field<string | undefined> | undefined;
    // @ts-expect-error
    user.$.name satisfies State<string | undefined> | undefined;
    // @ts-expect-error
    user.$.email satisfies Field<string>;
  }

  // Union value
  {
    const entity = {} as Field<User | Account>;

    entity.$.name satisfies Field<string>;
    // @ts-expect-error
    entity.$.name satisfies State<string>;
    // @ts-expect-error
    entity.$.name satisfies Field<number>;
  }

  // Union field
  {
    const entity = {} as Field<User> | Field<Account>;

    entity.$.name satisfies Field<string>;
    // @ts-expect-error
    entity.$.name satisfies State<string>;
    // @ts-expect-error
    entity.$.name satisfies Field<number>;
  }
}

// `Field["at"]`
{
  // Basic
  {
    const user = {} as Field<User>;

    user.at("age") satisfies Field<number>;
    // @ts-expect-error
    user.at("age") satisfies State<number>;
    // @ts-expect-error
    user.at("age") satisfies Field<string>;

    user.at("email") satisfies Field<string | undefined, "detachable">;
    // @ts-expect-error
    user.at("email") satisfies State<string | undefined, "detachable">;
    // @ts-expect-error
    user.at("email") satisfies Field<string, "detachable">;
  }

  // Immutable
  {
    const user = {} as Field.Immutable<User>;

    user.at("age") satisfies Field.Immutable<number>;
    // @ts-expect-error
    user.at("age") satisfies State.Immutable<number>;
    // @ts-expect-error
    user.at("age") satisfies Field.Immutable<string>;

    user.at("email") satisfies Field.Immutable<
      string | undefined,
      "detachable"
    >;
    // @ts-expect-error
    user.at("email") satisfies State.Immutable<
      string | undefined,
      "detachable"
    >;
    // @ts-expect-error
    user.at("email") satisfies Field.Immutable<string, "detachable">;
  }

  // Union value
  {
    const entity = {} as Field<User | Account>;

    entity.at("name") satisfies Field<string>;
    // @ts-expect-error
    entity.at("name") satisfies State<string>;
    // @ts-expect-error
    entity.at("name") satisfies Field<number>;
  }

  // Union field
  {
    const entity = {} as Field<User> | Field<Account>;

    Field.common(entity).at("name") satisfies Field<string>;
    // @ts-expect-error
    Field.common(entity).at("name") satisfies State<string>;
    // @ts-expect-error
    Field.common(entity).at("name") satisfies Field<number>;
  }
}

// `Field["try"]`
{
  // Basic
  {
    const user = {} as Field<User>;

    user.try("age") satisfies Field<number, "tried">;
    user.try("age").id;
    // @ts-expect-error
    user.try("age") satisfies State<number, "tried">;

    user.try("email") satisfies
      | Field<string, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    user.try("email").id;
    // @ts-expect-error
    user.try("email") satisfies
      | State<string, "detachable" | "tried">
      | undefined;
  }

  // Immutable
  {
    const user = {} as Field.Immutable<User>;

    user.try("age") satisfies Field.Immutable<number, "tried">;
    user.try("age").id;
    // @ts-expect-error
    user.try("age") satisfies State.Immutable<number, "tried">;

    user.try("email") satisfies
      | Field.Immutable<string, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    user.try("email").id;
    // @ts-expect-error
    user.try("email") satisfies
      | State.Immutable<string, "detachable" | "tried">
      | undefined;
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
    const entity = {} as Field<User> | Field<Account>;

    Field.common(entity).try("name") satisfies Field<string, "tried">;
    Field.common(entity).try("name").id;
    // @ts-expect-error
    Field.common(entity).try("name") satisfies State<string, "tried">;
    // @ts-expect-error
    Field.common(entity).try("name") satisfies Field<number, "tried">;

    Field.common(entity).try("flag") satisfies
      | Field<boolean, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    Field.common(entity).try("flag").id;
    // @ts-expect-error
    Field.common(entity).try("flag") satisfies
      | State<boolean, "detachable" | "tried">
      | undefined;
    // @ts-expect-error
    Field.common(entity).try("flag") satisfies Field<
      number,
      "detachable" | "tried"
    >;
  }
}

// `Field["self"]["try"]`
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

  // Qualifiers
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

    Field.common(entity).self.try() satisfies Field.Common<
      User | Account,
      "tried"
    >;
    Field.common(entity).self.try().id;
    // @ts-expect-error
    Field.common(entity).self.try() satisfies State.Common<
      User | Account,
      "tried"
    >;

    Field.common(entity).at("name").self.try() satisfies Field.Common<
      string,
      "tried"
    >;
    Field.common(entity).at("name").self.try().id;
    // @ts-expect-error
    Field.common(entity).at("name").self.try() satisfies State.Common<
      string,
      "tried"
    >;
    // @ts-expect-error
    Field.common(entity).at("name").self.try() satisfies Field.Common<
      number,
      "tried"
    >;

    Field.common(entity).at("flag").self.try() satisfies
      | Field.Common<boolean, "tried">
      | undefined;
    // @ts-expect-error
    Field.common(entity).at("flag").self.try().id;
    // @ts-expect-error
    Field.common(entity).at("flag").self.try() satisfies
      | State.Common<boolean, "tried">
      | undefined;
    // @ts-expect-error
    Field.common(entity).at("flag").self.try() satisfies Field.Common<
      number,
      "tried"
    >;
  }
}

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

// `Field["forEach"]`
{
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
}

//#endregion Collection

//#endregion Type

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

type ContainerParent = Field.Parent<Container, "entity">;

type OrganizationParent = Field.Parent<Organization, "owner">;

//#endregion
