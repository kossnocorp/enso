import { State } from "../state/index.ts";
import { Field } from "./definition.tsx";

// Variance
{
  // `Field.Common` as `Field.Common`
  {
    // Basic

    let _entity: Field.Common<Entity>;
    _entity = {} as Field.Common<Account | User>;
    _entity = {} as Field.Common<Account>;
    _entity = {} as Field.Common<User>;

    let _account: Field.Common<Account>;
    // @ts-expect-error
    _account = {} as Field.Common<Account | User>;
    _account = {} as Field.Common<Account>;
    // @ts-expect-error
    _account = {} as Field.Common<User>;

    // Qualifiers

    let _detachable: Field.Common<Entity, "detachable">;
    _detachable = {} as Field.Common<Account | User, "detachable">;
    _detachable = {} as Field.Common<Account, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field.Common<Entity>;

    let _mixed: Field.Common<Entity, "detachable" | "tried">;
    _mixed = {} as Field.Common<Account | User, "detachable" | "tried">;
    _mixed = {} as Field.Common<Account, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field.Common<Entity, "detachable">;
    // @ts-expect-error
    _mixed = {} as Field.Common<Entity, "tried">;

    // Parent

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

  // `State` as `Field.Common`
  {
    // Basic

    let _entity: Field.Common<Entity>;
    _entity = {} as Field<Account | User>;
    _entity = {} as Field<Account>;
    _entity = {} as Field<User>;

    let _account: Field.Common<Account>;
    // @ts-expect-error
    _account = {} as Field<Account | User>;
    _account = {} as Field<Account>;
    // @ts-expect-error
    _account = {} as Field<User>;

    // Qualifiers

    let _detachable: Field.Common<Entity, "detachable">;
    _detachable = {} as Field<Account | User, "detachable">;
    _detachable = {} as Field<Account, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field<Entity>;

    let _mixed: Field.Common<Entity, "detachable" | "tried">;
    _mixed = {} as Field<Account | User, "detachable" | "tried">;
    _mixed = {} as Field<Account, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field<Entity, "detachable">;
    // @ts-expect-error
    _mixed = {} as Field<Entity, "tried">;

    // Parent

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

  // `State` as `State`
  {
    // Basic

    let _entity: Field<Entity>;
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

    // Qualifiers

    let _detachable: Field<Entity, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field<Account | User, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field<Account, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field<User, "detachable">;

    let _mixed: Field<Entity, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field<Account | User, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field<Account, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field<Entity, "detachable">;
    // @ts-expect-error
    _mixed = {} as Field<Entity, "tried">;

    // Parent

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

  // `Field.Common` as `State`
  {
    // Basic

    let _entity: Field<Entity>;
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

    // Qualifiers

    let _detachable: Field<Entity, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field.Common<Account | User, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field.Common<Account, "detachable">;
    // @ts-expect-error
    _detachable = {} as Field.Common<User, "detachable">;

    let _mixed: Field<Entity, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field.Common<Account | User, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field.Common<Account, "detachable" | "tried">;
    // @ts-expect-error
    _mixed = {} as Field.Common<Entity, "detachable">;
    // @ts-expect-error
    _mixed = {} as Field.Common<Entity, "tried">;

    // Parent

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

  // `State`
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

//#region Helpers

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

interface Container {
  entity: Entity;
}

interface Organization {
  owner: User;
}

type ContainerParent = Field.Parent<Container, "entity">;

type OrganizationParent = Field.Parent<Organization, "owner">;

//#endregion
