import { ty } from "tysts";
import { change, type ChangesEvent } from "../change/index.ts";
import type { DetachedValue } from "../detached/index.ts";
import { EventsTree } from "../events/index.ts";
import { State } from "../state/index.ts";
import { Field } from "./definition.ts";
import { Atom } from "../atom/definition.ts";
import { EnsoUtils } from "../utils.ts";

const unionValue = new Field<Hello | Blah>({ hello: "world", world: true });
const unionField = new Field({ hello: "world", world: true }) as
  | Field<Hello>
  | Field<Blah>;

//#region Variance
{
  // Field.Base as Field.Base
  {
    let _entity: Field.Base<Entity>;

    // Basic
    {
      ty<Field.Base<Entity>>()
        .is(ty.assignableFrom<Field.Base<Account | User>>())
        .is(ty.assignableFrom<Field.Base<Account>>())
        .is(ty.assignableFrom<Field.Base<User>>());

      ty<Field.Base<Account>>()
        .is(ty.assignableFrom<Field.Base<Account>>())
        .is.not(ty.assignableFrom<Field.Base<Account | User>>())
        .is.not(ty.assignableFrom<Field.Base<User>>());
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

    // Shared
    {
      type EntityTuple = [Entity, Entity | undefined];
      let _entity: Field.Shared.Base<[Entity, Entity | undefined]>;
      const entity = {} as Field.Shared.Base<[Entity, Entity | undefined]>;
      // (property) Atom.Immutable<"base" | "field", Atom.Def<Atom<Flavor extends Atom.Flavor.Constraint, ValueDef extends Atom.Def.Constraint, Qualifier extends Atom.Qualifier.Constraint, Parent extends Atom.Parent.Constraint<ValueDef>>.Shared.Def<[Entity, Entity | undefined]>, Atom.Shared.Def<...>>, never, never>.value: {
      //     read: Entity | undefined;
      //     write: Entity;
      //     [defBrand]: true;
      // }

      const shared = ({} as Field.Base<Entity>).shared<EntityTuple>();
      // (property) Atom.Immutable<"base" | "field", Atom<Flavor extends Atom.Flavor.Constraint, ValueDef extends Atom.Def.Constraint, Qualifier extends Atom.Qualifier.Constraint, Parent extends Atom.Parent.Constraint<ValueDef>>.Shared.Def<[Entity, Entity | undefined]>, never, never>.value: Entity | undefined

      _entity = ({} as Field.Base<Entity>).shared<EntityTuple>();
      _entity = ({} as Field.Base<Account | User>).shared<EntityTuple>();
      _entity = ({} as Field.Base<Account>).shared<EntityTuple>();
      _entity = ({} as Field.Base<User>).shared<EntityTuple>();

      type AccountTuple = [Account, Account | undefined];
      let _account: Field.Shared.Base<[Account, Account | undefined]>;
      // @ts-expect-error
      _account = ({} as Field.Base<Account | User>).shared<AccountTuple>();
      _account = ({} as Field.Base<Account>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field.Base<User>).shared<AccountTuple>();
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

    // Shared
    {
      type EntityTuple = [Entity, Entity | undefined];
      let _entity: Field.Shared.Base<[Entity, Entity | undefined]>;
      _entity = ({} as Field<Entity>).shared<EntityTuple>();
      _entity = ({} as Field<Account | User>).shared<EntityTuple>();
      _entity = ({} as Field<Account>).shared<EntityTuple>();
      _entity = ({} as Field<User>).shared<EntityTuple>();

      type AccountTuple = [Account, Account | undefined];
      let _account: Field.Shared.Base<[Account, Account | undefined]>;
      _account = ({} as Field<Account>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field<Account | User>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field<User>).shared<AccountTuple>();
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
          Field.Proxy<{ abc: "a" | "b" | "c"; id: Branded<string> }>
        >,
      );
    }

    // Shared
    {
      type EntityTuple = [Entity, Entity | undefined];
      let _entity: Field.Shared<[Entity, Entity | undefined]>;
      _entity = ({} as Field<Entity>).shared<EntityTuple>();
      // @ts-expect-error
      _entity = ({} as Field<Account | User>).shared<EntityTuple>();
      // @ts-expect-error
      _entity = ({} as Field<Account>).shared<EntityTuple>();
      // @ts-expect-error
      _entity = ({} as Field<User>).shared<EntityTuple>();

      type AccountTuple = [Account, Account | undefined];
      let _account: Field.Shared<[Account, Account | undefined]>;
      _account = ({} as Field<Account>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field<Account | User>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field<User>).shared<AccountTuple>();
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

  // Field as Field.Immutable
  {
    let _entity: Field.Immutable<Entity>;

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
      let _base: Field.Immutable<Entity>;
      _base = {} as Field<Account | User, "detachable">;
      _base = {} as Field<Account | User, "detachable" | "tried">;

      let _detachable: Field.Immutable<Entity, "detachable">;
      _detachable = {} as Field<Account | User, "detachable">;
      _detachable = {} as Field<Account, "detachable">;
      _detachable = {} as Field<Account, "detachable" | "tried">;
      // @ts-expect-error
      _detachable = {} as Field<Entity>;

      let _mixed: Field.Immutable<Entity, "detachable" | "tried">;
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

      let _container: Field.Immutable<Entity, never, ContainerParent>;
      _container = {} as Field<Account | User, never, ContainerParent>;
      _container = {} as Field<Account, never, ContainerParent>;
      _container = {} as Field<User, never, ContainerParent>;
      // @ts-expect-error
      _container = {} as Field<Account>;
      // @ts-expect-error
      _container = {} as Field<Entity, never, OrganizationParent>;

      let _organization: Field.Immutable<User, never, OrganizationParent>;
      _organization = {} as Field<User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Entity, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<Account | User, never, OrganizationParent>;
      // @ts-expect-error
      _organization = {} as Field<User, never, ContainerParent>;
    }

    // Shared
    {
      type EntityTuple = [Entity, Entity | undefined];
      let _entity: Field.Shared.Immutable<[Entity, Entity | undefined]>;
      _entity = ({} as Field<Account | User>).shared<EntityTuple>();
      _entity = ({} as Field<Account>).shared<EntityTuple>();
      _entity = ({} as Field<User>).shared<EntityTuple>();

      type AccountTuple = [Account, Account | undefined];
      let _account: Field.Shared.Immutable<[Account, Account | undefined]>;
      _account = ({} as Field<Account>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field<Account | User>).shared<AccountTuple>();
      // @ts-expect-error
      _account = ({} as Field<User>).shared<AccountTuple>();
    }
  }

  // Interfaces
  {
    ty<Field<Entity>>()
      .is(ty.assignableFrom<Field<Entity>>())
      .is(ty.assignableFrom<Field<Entity, "detachable">>())
      .is(ty.assignableFrom<Field.Exact<Entity, "detachable">>())
      .is(
        ty.assignableFrom<
          Field.Exact.Internal<Atom.Def<Entity>, { detachable: true }>
        >(),
      );
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
      const result = Field.base(
        {} as
          | Field<User, "detachable">
          | Field<Account, "detachable" | "bound">,
      );
      ty(result).is(ty<Field.Base<User | Account, "detachable">>());
      ty(result.value).is(ty<User | Account>());
    }
  }

  // Shared
  {
    const field = {} as
      | Field.Shared<[User, User | undefined]>
      | Field.Shared<[Account, Account | undefined]>;

    const result = Field.base(field);
    result satisfies Field.Shared.Base<
      [User, User | undefined] | [Account, Account | undefined]
    >;
  }
}
//#endregion

//#region Field.useEnsure
{
  // Basic
  {
    const result = Field.useEnsure({} as Field<string> | undefined);
    ty(result).is(ty<Field<string | undefined>>());
  }

  // Mapped
  {
    interface Parent {
      child: Child;
    }

    interface Child {
      hello: "world";
    }

    const field = {} as Field<Parent> | undefined;
    const result = Field.useEnsure(field, (field) => field.$.child);
    ty(result).is(ty<Field<Child | undefined>>());
  }

  // Defined
  {
    // Basic
    {
      const field = new Field("hello");
      const result = Field.useEnsure(field);
      ty(result).is(ty<Field<string>>());
    }

    // Mapped
    {
      interface Parent {
        child: Child;
      }

      interface Child {
        hello: "world";
      }

      const field = {} as Field<Parent>;
      const result = Field.useEnsure(field, (field) => field.$.child);
      ty(result).is(ty<Field<Child>>());
    }
  }

  // Mixed
  {
    const field = {} as Field<string> | undefined;
    const result = Field.useEnsure(field);
    ty(result).is(ty<Field<string | undefined>>());
  }

  // Falsy
  {
    const field = {} as Field<string> | false;
    const result = Field.useEnsure(field);
    ty(result).is(ty<Field<string | undefined>>());
  }

  // Field.Exact
  {
    const result = Field.useEnsure({} as Field.Exact<string> | undefined);
    ty(result).is(ty<Field.Exact<string | undefined>>());
  }

  // Shared
  {
    const field = {} as
      | Field.Shared<[User, User | undefined]>
      | Field.Shared<[Account, Account | undefined]>;

    const result = Field.useEnsure(field);
    ty(result).is(ty<Field<unknown>>());
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

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    field.value satisfies string | undefined;
    // @ts-expect-error
    field.value.any;

    field.useValue() satisfies string | undefined;
    // @ts-expect-error
    field.useValue().any;
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useValue satisfies undefined;
    // @ts-expect-error
    field.useValue();
    // @ts-expect-error
    field.useValue?.();
  }
}
//#endregion

//#region Field#compute & Field#useCompute
{
  // Basic
  {
    const field = {} as Field<number>;

    let result = field.compute((value) => {
      value satisfies number;
      // @ts-expect-error
      value.any;

      return Number.isNaN(value);
    });

    result satisfies boolean;
    // @ts-expect-error
    result satisfies number;
    // @ts-expect-error
    result.any;

    result = field.useCompute((value) => {
      value satisfies number;
      // @ts-expect-error
      value.any;

      return value > 0;
    }, []);
  }

  // Shared
  {
    const field = ({} as Field<number>).shared<[number, number | undefined]>();

    let result = field.compute((value) => {
      value satisfies number | undefined;
      // @ts-expect-error
      value.any;

      return Number.isNaN(value);
    });

    result satisfies boolean;
    // @ts-expect-error
    result satisfies number;
    // @ts-expect-error
    result.any;

    result = field.useCompute((value) => {
      value satisfies number | undefined;
      // @ts-expect-error
      value.any;

      return (value ?? 0) > 0;
    }, []);
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useCompute satisfies undefined;
    // @ts-expect-error
    field.useCompute((_) => true);
    // @ts-expect-error
    field.useCompute?.((_) => true);
  }
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
  // Basic
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

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useDirty satisfies undefined;
    // @ts-expect-error
    field.useDirty();
    // @ts-expect-error
    field.useDirty?.();
  }
}
//#endregion

//#region Field#set
{
  // Primitive
  {
    const field = {} as Field<string>;

    const result = field.set("world");
    result satisfies Field<string>;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    field.set(0);
  }

  // Object
  {
    const field = {} as Field<User>;

    const result = field.set({
      name: "User Name",
      email: "user@example.com",
      age: 42,
    });

    result satisfies Field<User>;
    // @ts-expect-error
    result.any;
  }

  // Union value
  {
    const field = {} as Field<User | Account | undefined>;

    const result = field.set({
      name: "User Name",
      email: "user@example.com",
      age: 42,
    });

    result satisfies Field.Exact.Internal<
      Field.Def<User, User | Account | undefined>
    >;
    // @ts-expect-error
    result.any;

    result.remove("email");

    field.set(undefined);
    field.set({} as Account);
    // @ts-expect-error
    field.set(null);
  }

  // Union field
  {
    const field = {} as Field<User> | Field<Account>;

    // @ts-expect-error
    field.set({
      name: "User Name",
      email: "user@example.com",
      age: 42,
    });
  }

  // Shared
  {
    // Basic
    {
      const field = ({} as Field<User>).shared<[User, User | undefined]>();

      const result = field.set({
        name: "User Name",
        email: "user@example.com",
        age: 42,
      });

      result satisfies Field<User>;
      // @ts-expect-error
      result.any;

      // @ts-expect-error
      field.set(undefined);
    }

    // Mixed
    {
      const mixed = ({} as Field<User>).shared<
        [User | Entity, User | Entity | undefined]
      >();

      mixed.set({} as User);
      // @ts-expect-error
      mixed.set({} as Entity);
      // @ts-expect-error
      mixed.set(undefined);
    }
  }

  // Generic
  {
    interface Document<Id extends string> {
      id: Id;
      title: string;
      content: string;
    }

    const field = {} as Field<Document<any> | undefined>;
    const result = field.set({} as Document<string>);
    ty(result).is(
      ty<
        Field.Exact.Internal<
          Atom.Def<Document<string>, Document<any> | undefined>
        >
      >(),
    );
  }
}
//#endregion

//#region Field#pave
{
  // Basic
  {
    const field = new Field({} as Settings);

    const userResult = field.$.user.pave({ email: "user@example.com" });
    ty(userResult).is(ty<Field<UserSettings, "detachable">>());

    // @ts-expect-error
    field.$.user.pave({});
    // @ts-expect-error
    field.$.user.pave({ hello: "world" });
    // @ts-expect-error
    field.$.user.pave(undefined);

    const securityResult = userResult.$.security.pave({
      public: true,
    });
    securityResult satisfies Field<SecuritySettings, "detachable">;
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
      global: boolean;
    }

    interface LocalSettings extends Settings {
      local: boolean;
    }

    const field = {} as Field<GlobalSettings | LocalSettings | undefined>;

    const result = field.pave({ global: true });

    ty(result).is(ty<Field<GlobalSettings>>());
    result.$.global.set(false);
  }

  // Shared
  {
    const field = ({} as Field<SecuritySettings>).shared<
      [SecuritySettings, SecuritySettings | Settings | undefined]
    >();

    const result = field.pave({});

    result satisfies Field<SecuritySettings>;
    // @ts-expect-error
    result satisfies Field<undefined>;
    // @ts-expect-error
    result satisfies Field<Settings>;
    // @ts-expect-error
    result.any;

    // @ts-expect-error
    field.pave(undefined);
    // @ts-expect-error
    field.pave({} as Settings);
  }
}
//#endregion

//#region Field#commit
{
  // Exact
  {
    const field = {} as Field<string>;

    const result = field.commit();
    result satisfies void;
    // @ts-expect-error
    result.any;
  }

  // Base
  {
    const field = {} as Field.Base<string>;
    // @ts-expect-error
    field.commit();
    // @ts-expect-error
    field.commit?.();
  }

  // Immutable
  {
    const field = {} as Field.Immutable<string>;
    // @ts-expect-error
    field.commit();
    // @ts-expect-error
    field.commit?.();
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;
    // @ts-expect-error
    field.commit();
    // @ts-expect-error
    field.commit?.();
  }
}
//#endregion

//#region Field#reset
{
  // Exact
  {
    const field = {} as Field<string>;

    const result = field.reset();
    result satisfies void;
    // @ts-expect-error
    result.any;
  }

  // Base
  {
    const field = {} as Field.Base<string>;
    // @ts-expect-error
    field.reset();
    // @ts-expect-error
    field.reset?.();
  }

  // Immutable
  {
    const field = {} as Field.Immutable<string>;
    // @ts-expect-error
    field.reset();
    // @ts-expect-error
    field.reset?.();
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;
    // @ts-expect-error
    field.reset();
    // @ts-expect-error
    field.reset?.();
  }
}
//#endregion

//#endregion

//#region Tree

//#region Field#root
{
  // Immutability
  {
    const field = {} as
      | Field.Immutable<User>
      | Field.Base<User>
      | Field.Exact<User>;
    ty(field.root).is(ty<Field.Immutable<unknown, "root">>());
  }

  // Ref
  {
    const field = {} as Field.Ref<User>;
    ty(field.root).is(ty<Field.Immutable<unknown, "root" | "ref">>());
  }
}
//#endregion

//#region Field#parent
{
  // Immutablity
  {
    const field = {} as
      | Field.Base<User, never, OrganizationParent>
      | Field.Immutable<User, never, OrganizationParent>
      | Field.Exact<User, never, OrganizationParent>;
    if ("field" in field.parent) {
      ty(field.parent.field).is(ty<Field.Immutable<Organization>>());
      ty(field.parent.field.$.owner).is(ty<Field.Immutable<User>>());
    }
  }

  // Ref
  {
    const field = {} as Field<User, "ref", OrganizationParent>;
    if ("field" in field.parent) {
      ty(field.parent.field).is(ty<Field.Immutable<Organization, "ref">>());
      ty(field.parent.field.$.owner).is(ty<Field.Immutable<User, "ref">>());
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

    ty(field.$[0]).is(
      ty<Field<number | undefined, "detachable"> | undefined>(),
    );
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

  // Nullish
  {
    const field = {} as Field<Entity | null | undefined>;

    field.$?.flag satisfies Field<boolean | undefined> | undefined;
    // @ts-expect-error
    field.$.flag;
    // @ts-expect-error
    field.$?.flag.any;
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<User | Account>;

      field.$.name satisfies Field<string>;
      //@ts-expect-error
      field.$.name.any;

      // @ts-expect-error
      field.$.email;
    }

    // Field union
    {
      const field = {} as Field<User> | Field<Account>;

      field.$.name satisfies Field<string>;
      //@ts-expect-error
      field.$.name.any;

      // @ts-expect-error
      field.$.email;
    }

    // Null
    {
      const field = {} as Field<User | null>;

      const result = field.$?.name;
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.$.name;
    }

    // Undefined
    {
      const field = {} as Field<User | undefined>;

      const result = field.$?.name;
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.$.name;
    }

    // Primitive
    {
      const field = {} as Field<User | number>;

      const result = field.$?.name;
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.$.name;
    }

    // Branded primitive
    {
      const field = {} as Field<User | Branded<number>>;

      const result = field.$?.name;
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.$.name;
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<User>).shared<[User, User]>();

      field.$.name satisfies Field<string>;
      //@ts-expect-error
      field.$.name.any;
    }

    // Undefined
    {
      const field = ({} as Field<User>).shared<[User, User | undefined]>();

      const result = field.$?.name;
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.$.name;
    }
  }

  // Generic
  {
    // Defined
    {
      function _generic<EntityType extends Entity>(field: Field<EntityType>) {
        field.$.name satisfies Field<string>;
      }
    }

    // Undefined
    {
      function _generic<EntityType extends Entity | undefined>(
        field: Field<EntityType>,
      ) {
        field.$?.name satisfies Field<string> | undefined;
        // @ts-expect-error
        field.$.name;
      }
    }
  }

  // Base
  {
    // Basic
    {
      const field = {} as Field.Base<User>;
      ty(field.$.age).is(ty<Field<number>>());
      ty(field.$.email).is(ty<Field<string | undefined, "detachable">>());
    }

    // Nested
    {
      const field = {} as Field.Base<Nested>;
      ty(field.$.entities.$.user.$.age).is(ty<Field<number>>());
      ty(field.$.entities.$.user.$.email).is(
        ty<Field<string | undefined, "detachable">>(),
      );
    }
  }

  // Immutable
  {
    // Basic
    {
      const field = {} as Field.Immutable<User>;
      ty(field.$.age).is(ty<Field.Immutable<number>>());
      ty(field.$.email).is(
        ty<Field.Immutable<string | undefined, "detachable">>(),
      );
    }

    // Nested
    {
      const field = {} as Field.Immutable<Nested>;
      ty(field.$.entities.$.user.$.age).is(ty<Field.Immutable<number>>());
      ty(field.$.entities.$.user.$.email).is(
        ty<Field.Immutable<string | undefined, "detachable">>(),
      );
    }
  }

  // Ref
  {
    // Basic
    {
      const field = {} as Field.Ref<User>;
      ty(field.$.age).is(ty<Field.Ref<number>>());
      ty(field.$.email).is(ty<Field.Ref<string | undefined, "detachable">>());
    }

    // Nested
    {
      const field = {} as Field.Ref<Nested>;
      ty(field.$.entities.$.user.$.age).is(ty<Field.Ref<number>>());
      ty(field.$.entities.$.user.$.email).is(
        ty<Field.Ref<string | undefined, "detachable">>(),
      );
    }
  }

  // Optional
  {
    const field = {} as Field.Ref.Optional<Nested>;
    ty(field.$.settings.optional().$.user.$.email).is(
      ty<Field.Ref.Optional<string>>(),
    );
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

    const key: string = "key";

    field.at(key).$;
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

  // Any
  {
    const field = {} as Field<any>;

    const result = field.try?.(0);
    result satisfies Field<any, "tried" | "detachable"> | null | undefined;
    undefined satisfies typeof result;

    // @ts-expect-error
    field.at(0);
    // @ts-expect-error
    field.at(0).$.any;

    field.at?.({} as keyof any)?.$;
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<User | Account>;

      field.at("name") satisfies Field<string>;
      //@ts-expect-error
      field.at("name").any;

      // @ts-expect-error
      field.at("email");
    }

    // Field union
    {
      const field = {} as Field<User> | Field<Account>;
      //@ts-expect-error
      field.at?.("name");
    }

    // Undefined
    {
      const field = {} as Field<User | undefined>;

      const result = field.at?.("name");
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.at("name");
    }

    // Primitive
    {
      const field = {} as Field<User | number>;

      const result = field.at?.("name");
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.at("name");
    }

    // Branded primitive
    {
      const field = {} as Field<User | Branded<number>>;

      const result = field.at?.("name");
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.at("name");
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<User>).shared<[User, User]>();

      field.at("name") satisfies Field<string>;
      //@ts-expect-error
      field.at("name").any;
    }

    // Undefined
    {
      const field = ({} as Field<User>).shared<[User, User | undefined]>();

      const result = field.at?.("name");
      result satisfies Field<string> | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.at("name");
    }
  }

  // Generic
  {
    // Defined
    {
      function _generic<EntityType extends Entity>(field: Field<EntityType>) {
        // @ts-ignore -- WIP: Figure out if it is even possible
        field.at("name") satisfies Field<string>;
      }
    }

    // Undefined
    {
      function _generic<EntityType extends Entity | undefined>(
        field: Field<EntityType>,
      ) {
        // @ts-ignore -- WIP: Figure out if it is even possible
        field.at?.("name") satisfies Field<string> | undefined;
        // @ts-expect-error
        field.at("name");
      }
    }
  }

  // Base
  {
    // Basic
    {
      const field = {} as Field.Base<User>;
      ty(field.at("age")).is(ty<Field<number>>());
      ty(field.at("email")).is(ty<Field<string | undefined, "detachable">>());
    }

    // Nested
    {
      const field = {} as Field.Base<Nested>;
      ty(field.at("entities").at("user").at("age")).is(ty<Field<number>>());
      ty(field.at("entities").at("user").at("email")).is(
        ty<Field<string | undefined, "detachable">>(),
      );
    }
  }

  // Immutable
  {
    // Basic
    {
      const field = {} as Field.Immutable<User>;
      ty(field.at("age")).is(ty<Field.Immutable<number>>());
      ty(field.at("email")).is(
        ty<Field.Immutable<string | undefined, "detachable">>(),
      );
    }

    // Nested
    {
      const field = {} as Field.Immutable<Nested>;
      ty(field.at("entities").at("user").at("age")).is(
        ty<Field.Immutable<number>>(),
      );
      ty(field.at("entities").at("user").at("email")).is(
        ty<Field.Immutable<string | undefined, "detachable">>(),
      );
    }
  }

  // Ref
  {
    // Basic
    {
      const field = {} as Field.Ref<User>;
      ty(field.at("age")).is(ty<Field.Ref<number>>());
      ty(field.at("email")).is(
        ty<Field.Ref<string | undefined, "detachable">>(),
      );
    }

    // Nested
    {
      const field = {} as Field.Ref<Nested>;
      ty(field.at("entities").at("user").at("age")).is(ty<Field.Ref<number>>());
      ty(field.at("entities").at("user").at("email")).is(
        ty<Field.Ref<string | undefined, "detachable">>(),
      );
    }
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

  // Any
  {
    const field = {} as Field<any>;
    ty(field.try({} as keyof any)).is(
      ty<Field<any, "tried" | "detachable"> | null | undefined>(),
    );
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<User | Account>;
      ty(field.try("name")).is(ty<Field<string, "tried">>());

      // @ts-expect-error
      field.try("email");
    }

    // Field union
    {
      const field = {} as Field<User> | Field<Account>;
      //@ts-expect-error
      field.try?.("name");
    }

    // Undefined
    {
      const field = {} as Field<User | undefined>;
      ty(field.try("name")).is(ty<Field<string, "tried"> | undefined>());
    }

    // Primitive
    {
      const field = {} as Field<User | number>;
      ty(field.try("name")).is(ty<Field<string, "tried"> | undefined>());
    }

    // Branded primitive
    {
      const field = {} as Field<User | Branded<number>>;
      ty(field.try?.("name")).is(ty<Field<string, "tried"> | undefined>());
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<User>).shared<[User, User]>();
      ty(field.try("name")).is(ty<Field<string, "tried">>());
    }

    // Undefined
    {
      const field = ({} as Field<User>).shared<[User, User | undefined]>();
      ty(field.try("name")).is(ty<Field<string, "tried"> | undefined>());
    }
  }

  // Generic
  {
    // Defined
    {
      function _generic<EntityType extends Entity>(field: Field<EntityType>) {
        // @ts-ignore -- WIP: Figure out if it is even possible
        field.try("name") satisfies Field<string>;
      }
    }

    // Undefined
    {
      function _generic<EntityType extends Entity | undefined>(
        field: Field<EntityType>,
      ) {
        // @ts-ignore -- WIP: Figure out if it is even possible
        field.try?.("name") satisfies Field<string> | undefined;
        // @ts-expect-error
        field.try("name");
      }
    }
  }

  // Base
  {
    // Basic
    {
      const field = {} as Field.Base<User>;
      ty(field.try("age")).is(ty<Field<number, "tried">>());
      ty(field.try("email")).is(
        ty<Field<string, "detachable" | "tried"> | undefined>(),
      );
    }

    // Nested
    {
      const field = {} as Field.Base<Nested>;
      ty(field.try("entities").try("user").try("age")).is(
        ty<Field<number, "tried">>(),
      );
      ty(field.try("entities").try("user").try("email")).is(
        ty<Field<string, "detachable" | "tried"> | undefined>(),
      );
    }
  }

  // Immutable
  {
    // Basic
    {
      const field = {} as Field.Immutable<User>;
      ty(field.try("age")).is(ty<Field.Immutable<number, "tried">>());
      ty(field.try("email")).is(
        ty<Field.Immutable<string, "detachable" | "tried"> | undefined>(),
      );
    }

    // Nested
    {
      const field = {} as Field.Immutable<Nested>;
      ty(field.try("entities").try("user").try("age")).is(
        ty<Field.Immutable<number, "tried">>(),
      );
      ty(field.try("entities").try("user").try("email")).is(
        ty<Field.Immutable<string, "detachable" | "tried"> | undefined>(),
      );
    }
  }

  // Ref
  {
    // Basic
    {
      const field = {} as Field.Ref<User>;
      ty(field.try("age")).is(ty<Field.Ref<number, "tried">>());
      ty(field.try("email")).is(
        ty<Field.Ref<string, "detachable" | "tried"> | undefined>(),
      );
    }

    // Nested
    {
      const field = {} as Field.Ref<Nested>;
      ty(field.try("entities").try("user").try("age")).is(
        ty<Field.Ref<number, "tried">>(),
      );
      ty(field.try("entities").try("user").try("email")).is(
        ty<Field.Ref<string, "detachable" | "tried"> | undefined>(),
      );
    }
  }
}
//#endregion

//#region Field#self.try
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
    Field.base(entity).at("flag").self.try() satisfies Field.Base<
      number,
      "tried"
    >;
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<User | Account>;

      const result = field.self.try();
      result satisfies Field<User | Account, "tried">;
      //@ts-expect-error
      result.any;
    }

    // Field union
    {
      const field = {} as Field<User> | Field<Account>;

      const result = field.self.try();
      result satisfies Field<User, "tried"> | Field<Account, "tried">;
      //@ts-expect-error
      result.any;
    }
  }

  // Shared
  {
    const field = ({} as Field<User>).shared<[User, User | undefined]>();

    const result = field.self.try();
    result satisfies Field<User, "tried"> | undefined;
    undefined satisfies typeof result;
    // @ts-expect-error
    result.any;
  }

  // Ref
  {
    // Basic
    {
      const field = {} as Field.Ref<User>;
      ty(field.self.try()).is(ty<Field.Ref<User, "tried">>());
    }

    // Mixed
    {
      const field = {} as Field<User, "ref" | "detachable">;
      ty(field.self.try()).is(
        ty<Field<User, "ref" | "detachable" | "tried">>(),
      );
    }
  }
}
//#endregion

//#region Field#lookup
{
  // Exact
  {
    ty(({} as Field<User>).lookup(["name"])).is(ty<Field<unknown>>());
    ty(({} as Field<User, "detachable">).lookup(["name"])).is(
      ty<Field<unknown>>(),
    );
    ty(({} as Field<User, "ref">).lookup(["name"])).is(
      ty<Field<unknown, "ref">>(),
    );
  }

  // Base
  {
    ty(({} as Field.Base<User>).lookup(["name"])).is(ty<Field<unknown>>());
    ty(({} as Field.Base<User, "detachable">).lookup(["name"])).is(
      ty<Field<unknown>>(),
    );
    ty(({} as Field.Base<User, "ref">).lookup(["name"])).is(
      ty<Field<unknown, "ref">>(),
    );
  }

  // Optional
  {
    ty(({} as Field.Optional<User>).lookup(["name"])).is(
      ty<Field.Optional<unknown>>(),
    );
    ty(({} as Field.Optional<User, "detachable">).lookup(["name"])).is(
      ty<Field.Optional<unknown>>(),
    );
    ty(({} as Field.Optional<User, "ref">).lookup(["name"])).is(
      ty<Field.Optional<unknown, "ref">>(),
    );
  }

  // Immutable
  {
    ty(({} as Field.Immutable<User>).lookup(["name"])).is(
      ty<Field.Immutable<unknown>>(),
    );
    ty(({} as Field.Immutable<User, "detachable">).lookup(["name"])).is(
      ty<Field.Immutable<unknown>>(),
    );
    ty(({} as Field.Immutable<User, "ref">).lookup(["name"])).is(
      ty<Field.Immutable<unknown, "ref">>(),
    );
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
    field.size satisfies void;
  }

  // Branded primitive
  {
    const field = new Field({} as Branded<string>);
    field.size satisfies void;
  }

  // Union
  {
    // Value union
    {
      unionValue.size satisfies number;
    }

    // Field union
    {
      unionField.size satisfies number;
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;
      field.size satisfies number | undefined;
      undefined satisfies typeof field.size;
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;
      field.size satisfies number | undefined;
      undefined satisfies typeof field.size;
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;
      field.size satisfies number | undefined;
      undefined satisfies typeof field.size;
    }
  }

  // Shared
  {
    // Supported
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.size satisfies number;
    }

    // Unsupported
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();
      field.size satisfies number | undefined;
      undefined satisfies typeof field.size;
    }
  }
}
//#endregion

//#region Field#forEach
{
  // Readonly array
  {
    const result = readonlyArr.forEach((item, index) => {
      ty(item).is(ty<Field.Base<string | boolean>>());
      ty(index).is(ty<number>());
    });
    ty(result).is(ty<void>());

    readonlyArr.forEach((item) => {
      ty(item).is(ty<Field.Base<string | boolean>>());
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

  // Union
  {
    // Value union
    {
      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionValue.forEach?.((item) => {});

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionValue.forEach?.((item, index) => {});
    }

    // Field union
    {
      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionField.forEach?.((item) => {});

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionField.forEach?.((item, index) => {});
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;

      field.forEach?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.forEach((_item) => {});
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;

      field.forEach?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.forEach((_item) => {});
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      field.forEach?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.forEach((_item) => {});
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();

      field.forEach((item, index) => {
        item satisfies Field<string, "detachable">;
        // @ts-expect-error
        item.any;

        index satisfies number;
        // @ts-expect-error
        index.any;
      });
    }

    // Undefined
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();

      field.forEach?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.forEach((_) => {});
    }
  }

  // Ref
  {
    const field = {} as Field.Ref<(string | boolean)[]>;

    const result = field.forEach((item, index) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
      ty(index).is(ty<number>());
    });
    ty(result).is(ty<void>());

    field.forEach((item) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
    });

    field.forEach(() => {});
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

  // Union
  {
    // Value union
    {
      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionValue.map?.((item) => {});

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionValue.map?.((item, index) => {});
    }

    // Field union
    {
      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionField.map?.((item) => {});

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionField.map?.((item, index) => {});
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;

      const result = field.map?.((item) => {
        item satisfies Field<string, "detachable">;
        return 0;
      });
      result satisfies number[] | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.map((_item) => {});
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;

      const result = field.map?.((item) => {
        item satisfies Field<string, "detachable">;
        return 0;
      });
      result satisfies number[] | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.map((_item) => {});
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      const result = field.map?.((item) => {
        item satisfies Field<string, "detachable">;
        return 0;
      });
      result satisfies number[] | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.map((_item) => {});
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.map((item, index) => {
        item satisfies Field<string, "detachable">;
        // @ts-expect-error
        item.any;

        index satisfies number;
        // @ts-expect-error
        index.any;
      });
    }

    // Undefined
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();

      field.map?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.map((_) => {});
    }
  }

  // Ref
  {
    const field = {} as Field.Ref<(string | boolean)[]>;

    const result = field.map((item, index) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
      ty(index).is(ty<number>());
      return true as const;
    });
    ty(result).is(ty<true[]>());

    field.map((item) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
    });

    field.map(() => {});
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

  // Union
  {
    // Value union
    {
      unionValue.find((item) => {
        item satisfies Field<string> | Field<boolean>;
      });

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionValue.find?.((item, index) => {});
    }

    // Field union
    {
      unionField.find((item) => {
        item satisfies Field<string> | Field<boolean>;
      });

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionField.find?.((item, index) => {});
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;
      // @ts-expect-error
      field.find((item, index) => {});
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;
      // @ts-expect-error
      field.find((item, index) => {});
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      field.find?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.find((_item) => {});
    }
  }

  // Shared
  {
    // Supported
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.find((item, index) => {
        item satisfies Field<string, "detachable">;
        // @ts-expect-error
        item.any;

        index satisfies number;
        // @ts-expect-error
        index.any;
      });
    }

    // Unsupported
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();

      field.find?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.find((_item) => {});
    }
  }

  // Ref
  {
    const field = {} as Field.Ref<(string | boolean)[]>;

    const result = field.find((item, index) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
      ty(index).is(ty<number>());
      return true;
    });
    ty(result).is(ty<Field.Ref<string | boolean, "detachable"> | undefined>());

    field.find((item) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
    });

    field.find(() => {});
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

  // Union
  {
    // Value union
    {
      unionValue.filter((item) => {
        item satisfies Field<string> | Field<boolean>;
      });

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionValue.filter?.((item, index) => {});
    }

    // Field union
    {
      unionField.filter((item) => {
        item satisfies Field<string> | Field<boolean>;
      });

      // @ts-expect-error -- TODO: I'm sure it is possible to make it work
      unionField.filter?.((item, index) => {});
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;

      const result = field.filter?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      result satisfies Field<string, "detachable">[] | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.filter((_item) => {});
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;

      const result = field.filter?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      result satisfies Field<string, "detachable">[] | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.filter((_item) => {});
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      const result = field.filter?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      result satisfies Field<string, "detachable">[] | undefined;
      undefined satisfies typeof result;
      // @ts-expect-error
      field.filter((_item) => {});
    }
  }

  // Shared
  {
    // Supported
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.filter((item, index) => {
        item satisfies Field<string, "detachable">;
        // @ts-expect-error
        item.any;

        index satisfies number;
        // @ts-expect-error
        index.any;
      });
    }

    // Unsupported
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();

      field.filter?.((item) => {
        item satisfies Field<string, "detachable">;
      });
      // @ts-expect-error
      field.filter((_item) => {});
    }
  }

  // Ref
  {
    const field = {} as Field.Ref<(string | boolean)[]>;

    const result = field.filter((item, index) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
      ty(index).is(ty<number>());
      return true;
    });
    ty(result).is(ty<Field.Ref<string | boolean, "detachable">[]>());

    field.filter((item) => {
      ty(item).is(ty<Field.Ref<string | boolean, "detachable">>());
    });

    field.filter(() => {});
  }
}
//#endregion

//#region Field#useBind
{
  // Readonly array
  {
    const field = new Field({} as readonly string[]);
    const result = field.useBind();
    result satisfies Field<readonly string[], "bound">;
    // @ts-expect-error
    result satisfies Field<string[], "bound">;
    // @ts-expect-error
    result.any;
  }

  // Tuple
  {
    const field = new Field({} as ["a", "b", "c"]);
    const result = field.useBind();
    result satisfies Field<["a", "b", "c"], "bound">;
    // @ts-expect-error
    result satisfies Field<string[], "bound">;
    // @ts-expect-error
    result.any;
  }

  // Array
  {
    const field = new Field<string[]>([]);
    const result = field.useBind();
    result satisfies Field<string[], "bound">;
    // @ts-expect-error
    result satisfies Field<number[], "bound">;
    // @ts-expect-error
    result.any;
  }

  // Object
  {
    const field = new Field({} as Hello);
    const result = field.useBind();
    result satisfies Field<Hello, "bound">;
    // @ts-expect-error
    result satisfies Field<Blah, "bound">;
    // @ts-expect-error
    result.any;
  }

  // Record
  {
    const field = new Field({} as Record<string, string | boolean>);
    const result = field.useBind();
    result satisfies Field<Record<string, string | boolean>, "bound">;
    // @ts-expect-error
    result satisfies Field<Record<string, string>, "bound">;
    // @ts-expect-error
    result.any;
  }

  // Qualifier
  {
    const field = {} as Field<Hello, "detachable">;
    const result = field.useBind();
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
    const result = field.useBind();
    ty(result).is(ty<Field<string, "bound">>());
  }

  // Branded primitive
  {
    const field = new Field({} as Branded<string>);
    const result = field.useBind();
    ty(result).is(ty<Field<Branded<string>, "bound">>());
  }

  // Union
  {
    // Value union
    {
      const result = unionValue.useBind();
      ty(result).is(ty<Field<Hello | Blah, "bound">>());
    }

    // Field union
    {
      const result = unionField.useBind();
      ty(result).is(ty<Field<Hello, "bound"> | Field<Blah, "bound">>());
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;
      const result = field.useBind();
      ty(result).is(ty<Field<string[] | undefined, "bound">>());
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;
      const result = field.useBind();
      ty(result).is(ty<Field<string[] | number, "bound">>());
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;
      const result = field.useBind();
      ty(result).is(ty<Field<string[] | Branded<number>, "bound">>());
    }
  }

  // Shared
  {
    // Supported
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      const result = field.useBind();
      ty(result).is(ty<Field<string[], "bound">>());
    }

    // Unsupported
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();
      const result = field.useBind();
      ty(result).is(
        ty<Field.Shared<[string[], string[] | undefined], "bound">>(),
      );
    }
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;
    ty(field.useBind).is.undefined();
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

  // Union
  {
    // Value union
    {
      const field = {} as Field<Account | User>;
      // @ts-expect-error
      field.remove?.("flag");
    }

    // Field union
    {
      const field = {} as Field<Account> | Field<User>;
      // @ts-expect-error
      field.remove?.("flag");
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;

      const result = field.remove?.(0);
      result satisfies Field<string | DetachedValue, "detachable"> | undefined;
      // @ts-expect-error
      field.remove(0);
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;

      const result = field.remove?.(0);
      result satisfies Field<string | DetachedValue, "detachable"> | undefined;
      // @ts-expect-error
      field.remove(0);
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      const result = field.remove?.(0);
      result satisfies Field<string | DetachedValue, "detachable"> | undefined;
      // @ts-expect-error
      field.remove(0);
    }

    // Readonly array
    {
      const field = {} as Field<string[] | readonly string[]>;

      const result = field.remove?.(0);
      result satisfies Field<string | DetachedValue, "detachable"> | undefined;
      // @ts-expect-error
      field.remove(0);
    }

    // Tuple
    {
      const field = {} as Field<string[] | [string, string]>;

      const result = field.remove?.(0);
      result satisfies Field<string | DetachedValue, "detachable"> | undefined;
      // @ts-expect-error
      field.remove(0);
    }
  }

  // Shared
  {
    // Supported
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.remove(0);
    }

    // Unsupported
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();
      // @ts-expect-error
      field.remove(0);

      const result = field.remove?.(0);
      result satisfies Field<string | DetachedValue, "detachable"> | undefined;
      // @ts-expect-error
      field.remove(0);
    }
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

  // Qualifier
  {
    // never
    {
      const field = new Field("hello") as Field<string, never>;
      // @ts-expect-error
      field.self.remove();
    }

    // Mixed
    {
      const field = new Field("hello") as Field<string, "detachable" | "tried">;

      const result = field.self.remove();

      result satisfies Field<DetachedValue, "detachable">;
      // @ts-expect-error
      result satisfies Field<string, "detachable">;
      // @ts-expect-error
      result.any;
    }
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<Account | User, "detachable">;
      field.self.remove();
    }

    // Field union
    {
      // Detachable
      {
        const field = {} as
          | Field<Account, "detachable">
          | Field<User, "detachable">;
        field.self.remove();
      }

      // Non-detachable
      {
        const field = {} as Field<Account, "detachable"> | Field<User>;
        // @ts-expect-error
        field.self.remove();
      }
    }
  }

  // Shared
  {
    // Detachable
    {
      const field = ({} as Field<string[], "detachable">).shared<
        [string[], string[] | undefined]
      >();
      field.self.remove();
    }

    // Non-detachable
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();
      // @ts-expect-error
      field.self.remove();
    }
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
    const field = {} as Field.Base<string[]>;
    // @ts-expect-error
    field.insert(0, "hello");
  }

  // Immutable
  {
    const field = {} as Field.Immutable<string[]>;
    // @ts-expect-error
    field.insert(0, "hello");
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<string[] | number[]>;
      // @ts-expect-error
      field.insert?.(0, "hello");
    }

    // Field union
    {
      const field = {} as Field<string[]> | Field<number[]>;
      // @ts-expect-error
      field.insert?.(0, "hello");
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }

    // Readonly array
    {
      const field = {} as Field<string[] | readonly string[]>;

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }

    // Tuple
    {
      const field = {} as Field<string[] | [string, string]>;

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }

    // Object
    {
      const field = {} as Field<string[] | Hello>;

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.insert(0, "hello");
    }

    // Undefined
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();

      const result = field.insert?.(0, "hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.insert(0, "hello");
    }
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
    const field = {} as Field.Base<string[]>;
    // @ts-expect-error
    field.push("hello");
  }

  // Immutable
  {
    const field = {} as Field.Immutable<string[]>;
    // @ts-expect-error
    field.push("hello");
  }

  // Union
  {
    // Value union
    {
      const field = {} as Field<string[] | number[]>;
      // @ts-expect-error
      field.push?.("hello");
    }

    // Field union
    {
      const field = {} as Field<string[]> | Field<number[]>;
      // @ts-expect-error
      field.push?.("hello");
    }

    // Undefined
    {
      const field = {} as Field<string[] | undefined>;

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }

    // Primitive
    {
      const field = {} as Field<string[] | number>;

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }

    // Branded primitive
    {
      const field = {} as Field<string[] | Branded<number>>;

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }

    // Readonly array
    {
      const field = {} as Field<string[] | readonly string[]>;

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }

    // Tuple
    {
      const field = {} as Field<string[] | [string, string]>;

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }

    // Object
    {
      const field = {} as Field<string[] | Hello>;

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }
  }

  // Shared
  {
    // Defined
    {
      const field = ({} as Field<string[]>).shared<[string[], string[]]>();
      field.push("hello");
    }

    // Undefined
    {
      const field = ({} as Field<string[]>).shared<
        [string[], string[] | undefined]
      >();

      const result = field.push?.("hello");
      result satisfies Field<string, "detachable"> | undefined;
      // @ts-expect-error
      field.push("hello");
    }
  }
}
//#endregion

//#endregion

//#endregion

//#region Events

//#region Field#watch
{
  // Basic
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

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    const off = field.watch((newValue, event) => {
      newValue satisfies string | undefined;
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
}
//#endregion

//#region Field#useWatch
{
  // Basic
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

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    const off = field.useWatch((newValue, event) => {
      newValue satisfies string | undefined;
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

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useWatch satisfies undefined;
    // @ts-expect-error
    field.useWatch((_value, _event) => {}, []);
    // @ts-expect-error
    field.useWatch?.((_value, _event) => {}, []);
  }
}
//#endregion

//#region #events
{
  // Basic
  {
    const field = new Field("hello");
    ty(field.events).is(ty<EventsTree<"field">>());
  }

  // Ref
  {
    const field = {} as Field.Ref<"hello">;
    ty(field.events).is.undefined();
  }
}
//#endregion

//#region #trigger
{
  // Basic
  {
    const field = new Field("hello");
    field.trigger(change.field.blur);
  }

  // Ref
  {
    const field = {} as Field.Ref<"hello">;
    ty(field.trigger).is.undefined();
  }
}
//#endregion

//#endregion

//#region Transform

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

  // Shared
  {
    const field = ({} as Field<Hello | Blah>).shared<
      [Hello | Blah, Hello | Blah | undefined]
    >();

    const result = field.decompose();
    result satisfies
      | {
          value: Hello;
          field: Field<Hello>;
        }
      | {
          value: Blah;
          field: Field<Blah>;
        }
      | {
          value: undefined;
          field: Field<undefined>;
        };
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

  // Shared
  {
    const field = ({} as Field<Hello | Blah>).shared<
      [Hello | Blah, Hello | Blah | undefined]
    >();

    const result = field.useDecompose((newValue, prevValue) => {
      newValue satisfies Hello | Blah | undefined;
      // @ts-expect-error
      newValue.any;

      prevValue satisfies Hello | Blah | undefined;
      // @ts-expect-error
      prevValue.any;

      return true;
    }, []);

    result satisfies
      | {
          value: Hello;
          field: Field<Hello>;
        }
      | {
          value: Blah;
          field: Field<Blah>;
        }
      | {
          value: undefined;
          field: Field<undefined>;
        };
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useDecompose satisfies undefined;
    // @ts-expect-error
    field.useDecompose((_newValue, _prevValue) => true, []);
    // @ts-expect-error
    field.useDecompose?.((_newValue, _prevValue) => true, []);
  }
}
//#endregion

//#region Field#discriminate & Field#useDiscriminate
{
  function _discriminate<Key extends keyof User>(
    field: Field<User>,
    key: Key,
  ): Field.Discriminated<User, Key> {
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
    ty(result).is(
      ty<
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
          }
      >(),
    );

    if (result.discriminator === "user") {
      ty(result.field).is(ty.assignableFrom<Field.Base<User>>());
      ty(result.field.value).is(ty<User>());
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
      ty(result.field).is(ty.assignableFrom<Field.Base<User, "detachable">>());
      ty(result.field.value).is(ty<User>());
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

  // Shared
  {
    // Regular
    {
      const field = ({} as Field<User | Organization>).shared<
        [User | Organization, User | Organization | undefined]
      >();

      const result = field.discriminate("type");
      result satisfies
        | {
            discriminator: "user";
            field: Field<User>;
          }
        | {
            discriminator: "organization";
            field: Field<Organization>;
          }
        | {
            discriminator: undefined;
            field: Field<undefined>;
          };
    }

    // Hook
    {
      const field = ({} as Field<User | Organization>).shared<
        [User | Organization, User | Organization | undefined]
      >();

      const result = field.useDiscriminate("type");
      result satisfies
        | {
            discriminator: "user";
            field: Field<User>;
          }
        | {
            discriminator: "organization";
            field: Field<Organization>;
          }
        | {
            discriminator: undefined;
            field: Field<undefined>;
          };
    }
  }

  // Ref
  {
    const field = {} as Field.Ref<User | Organization>;

    // #discriminate
    {
      const result = field.discriminate("type");
      ty(result).is(
        ty<
          | {
              discriminator: "user";
              field: Field.Ref<User>;
            }
          | {
              discriminator: "organization";
              field: Field.Ref<Organization>;
            }
        >(),
      );
    }

    // #useDiscriminate
    {
      ty(field.useDiscriminate).is.undefined();
    }
  }
}
//#endregion

//#region Field#into
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

    result satisfies Field<number, Field.Proxy<string>>;
    result satisfies Field<number>;
    result satisfies Field<number, Field.Proxy<any>>;
    result satisfies Field<number, Field.Proxy<unknown>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxy<number>>;

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
    nestedResult satisfies Field<string, Field.Proxy<number>>;
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

    result satisfies Field.Base<number, Field.Proxy<string>>;
    result satisfies Field.Base<number>;
    result satisfies Field.Base<number, Field.Proxy<any>>;
    result satisfies Field.Base<number, Field.Proxy<unknown>>;
    // @ts-expect-error
    result satisfies Field.Base<number, Field.Proxy<number>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxy<string>>;

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
    nestedResult satisfies Field.Base<string, Field.Proxy<number>>;
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

    result satisfies Field.Immutable<number, Field.Proxy<string>>;
    result satisfies Field.Immutable<number>;
    result satisfies Field.Immutable<number, Field.Proxy<any>>;
    result satisfies Field.Immutable<number, Field.Proxy<unknown>>;
    // @ts-expect-error
    result satisfies Field.Immutable<number, Field.Proxy<number>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxy<string>>;

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
    nestedResult satisfies Field.Immutable<string, Field.Proxy<number>>;
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

    result satisfies Field<number, Field.Proxy<string>>;
    // @ts-expect-error
    result.any;
  }

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    const result = field
      .into((value) => {
        value satisfies string | undefined;
        // @ts-expect-error
        value.any;

        return value?.length ?? 0;
      })
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string | undefined;
        // @ts-expect-error
        value.any;

        return value?.slice(0, sizeValue) ?? "";
      });

    result satisfies Field<
      number,
      Field.Shared.Proxy<[string, string | undefined]>
    >;
    result satisfies Field<number>;
  }
}
//#endregion

//#region Field#useInto
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

    result satisfies Field<number, Field.Proxy<string>>;
    result satisfies Field<number>;
    result satisfies Field<number, Field.Proxy<any>>;
    result satisfies Field<number, Field.Proxy<unknown>>;
    // @ts-expect-error
    result satisfies Field<number, Field.Proxy<number>>;
  }

  // Base
  {
    const field = new Field("hello") as Field.Base<string>;

    // @ts-ignore -- WIP: @ts-expect-error
    field.useInto satisfies undefined;
    // @ts-ignore -- WIP: @ts-expect-error
    field.useInto((_value) => true, []);
    // @ts-ignore -- WIP: @ts-expect-error
    field.useInto?.((_value) => true, []);
  }

  // Immutable
  {
    const field = new Field("hello") as Field.Immutable<string>;

    // @ts-ignore -- WIP: @ts-expect-error
    field.useInto satisfies undefined;
    // @ts-ignore -- WIP: @ts-expect-error
    field.useInto((_value) => true, []);
    // @ts-ignore -- WIP: @ts-expect-error
    field.useInto?.((_value) => true, []);
  }

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    field.useInto;

    const result = field
      .useInto((value) => {
        value satisfies string | undefined;
        // @ts-expect-error
        value.any;

        return value?.length ?? 0;
      }, [])
      .from((sizeValue, value) => {
        sizeValue satisfies number;
        // @ts-expect-error
        sizeValue.any;

        value satisfies string | undefined;
        // @ts-expect-error
        value.any;

        return value?.slice(0, sizeValue) ?? "";
      }, []);

    result satisfies Field<
      number,
      Field.Shared.Proxy<[string, string | undefined]>
    >;
    result satisfies Field<number>;
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useInto satisfies undefined;
    // @ts-expect-error
    field.useInto((_value) => true, []);
    // @ts-expect-error
    field.useInto?.((_value) => true, []);
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

      const result = field.useDefined?.("string");
      result satisfies Field<string> | undefined;
      // @ts-expect-error
      field.useDefined("string");
    }

    // Number
    {
      const field = new Field(0) as Field<number | undefined>;

      // @ts-expect-error
      field.useDefined?.("string");
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

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    const result = field.useDefined("string");
    result satisfies Field<string>;
    // @ts-expect-error
    result.any;
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useDefined satisfies undefined;
    // @ts-expect-error
    field.useDefined("string");
    // @ts-expect-error
    field.useDefined?.("string");
  }
}
//#endregion

//#region Field#shared
{
  // Basic
  {
    const field = {} as Field<string>;

    field.shared<[string, string | undefined]>() satisfies Field.Shared<
      [string, string | undefined]
    >;
    field.shared<[string, string | undefined, string]>() satisfies Field.Shared<
      [string, string | undefined, string]
    >;
    field.shared<
      [string, string | undefined, string, string | null]
    >() satisfies Field.Shared<
      [string, string | undefined, string, string | null]
    >;

    field.shared<[number, string | undefined]>() satisfies Field<unknown>;
    field.shared<[number, string | undefined]>() satisfies Field<unknown>;
    field.shared<
      [string, string | undefined, number]
    >() satisfies Field<unknown>;
  }

  // Union
  {
    const field = {} as Field<string | number>;

    field.shared<
      [string | number, string | number | undefined]
    >() satisfies Field.Shared<[string | number, string | number | undefined]>;
    field.shared<
      [string | number, string | number | undefined, string | number]
    >() satisfies Field.Shared<
      [string | number, string | number | undefined, string | number]
    >;
    field.shared<
      [
        string | number,
        string | number | undefined,
        string | number,
        string | number | null,
      ]
    >() satisfies Field.Shared<
      [
        string | number,
        string | number | undefined,
        string | number,
        string | number | null,
      ]
    >;

    field.shared<
      [string | number, boolean | undefined]
    >() satisfies Field<unknown>;
    field.shared<[string, string | undefined]>() satisfies Field<unknown>;
    field.shared<
      [string, number | undefined, number | null, undefined | string]
    >() satisfies Field<unknown>;
  }

  // Narrow union
  {
    const field = {} as Field<string | number>;

    field.shared<
      [string | number, string | number | undefined]
    >() satisfies Field.Shared<[string | number, string | number | undefined]>;
  }

  // Variance
  {
    type ExactTuple = [User, User | undefined];
    type EntityTuple = [Entity, Entity | undefined];

    // Exact
    {
      const exact = ({} as Field<User>).shared<ExactTuple>();
      exact satisfies Field.Shared<ExactTuple>;

      const base = ({} as Field<User>).shared<EntityTuple>();
      base satisfies Field.Shared<ExactTuple>;

      const mixed = ({} as Field<User>).shared<
        [User | Entity, User | Entity | undefined]
      >();
      mixed satisfies Field.Shared<[User, User | undefined]>;
    }

    // Base
    {
      const exact = ({} as Field.Base<User>).shared<ExactTuple>();
      exact satisfies Field.Shared.Base<ExactTuple>;

      const base = ({} as Field.Base<User>).shared<EntityTuple>();
      base satisfies Field.Shared.Base<EntityTuple>;
    }

    // Immutable
    {
      const exact = ({} as Field.Immutable<User>).shared<ExactTuple>();
      exact satisfies Field.Shared.Immutable<ExactTuple>;

      const base = ({} as Field.Immutable<User>).shared<EntityTuple>();
      base satisfies Field.Shared.Immutable<EntityTuple>;
    }
  }
}
//#endregion

//#region Field#optional
{
  const field = {} as Field<Nested>;
  ty(field.$.settings).is(ty<Field<Settings | undefined, "detachable">>());
  ty(field.$.settings.optional()).is(
    ty<Field.Optional<Settings, "detachable">>(),
  );
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
  // Basic
  {
    const field = new Field("hello") as
      | Field<string>
      | Field.Base<string>
      | Field.Immutable<string>;

    const result = field.useErrors();
    result satisfies Field.Error[];
    // @ts-expect-error
    result.baseany;
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useErrors satisfies undefined;
    // @ts-expect-error
    field.useErrors();
    // @ts-expect-error
    field.useErrors?.();
  }
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
  // Basic
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

  // Ref
  {
    const field = {} as Field.Ref<string>;

    field.useValid satisfies undefined;
    // @ts-expect-error
    field.useValid();
    // @ts-expect-error
    field.useValid?.();
  }
}
//#endregion

//#region Field#validate
{
  // Basic
  {
    const field = new Field("hello") as
      | Field<string>
      | Field.Base<string>
      | Field.Immutable<string>;

    const result = field.validate((field) => {
      field satisfies Field.Immutable<string, "ref">;
      // @ts-expect-error
      field.any;
    });
    result satisfies Promise<void>;
    // @ts-expect-error
    result.any;

    field.validate(async (_) => {});
  }

  // Shared
  {
    const field = ({} as Field<string>).shared<[string, string | undefined]>();

    const result = field.validate((field) => {
      field satisfies Field.Immutable<string | undefined, "ref">;
      // @ts-expect-error
      field.any;
    });
    result satisfies Promise<void>;
    // @ts-expect-error
    result.any;

    field.validate(async (_) => {});
  }

  // Ref
  {
    const field = {} as Field.Ref<string>;
    // @ts-expect-error
    field.validate((_) => {});
    // @ts-expect-error
    field.validate?.((_) => {});
  }
}
//#endregion

//#region addError
{
  const field = {} as Field<string>;
  field.addError("Something went wrong");
  field.addError({ type: "unknown", message: "Something went wrong" });
  // @ts-expect-error
  field.addError();
}
//#endregion

//#endregion

//#region Helpers

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

interface Nested {
  entities: {
    user: User;
    account: Account;
  };
  organizations: Organization[];
  settings?: Settings;
}

type Branded<Type> = Type & { [brand]: true };
declare const brand: unique symbol;

type ContainerParent = Field.Parent<Container, "entity">;

type OrganizationParent = Field.Parent<Organization, "owner">;

//#endregion
