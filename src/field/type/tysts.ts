import { Field } from "../index.tsx";
import { FieldRef, MaybeFieldRef } from "../ref/index.ts";
import { fieldDiscriminate } from "./index.ts";

//#region fieldDiscriminate
{
  interface User {
    type: "user";
    name: string;
    email: string;
  }

  interface Organization {
    type: "organization";
    name: string;
    paid: boolean;
  }

  const unionValue = new Field<User | Organization>({} as User);
  const unionField = new Field({} as User) as Field<User> | Field<Organization>;

  // Field
  {
    // Value union
    {
      const result = fieldDiscriminate(unionValue, "type");

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
            field: Field.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: Field.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: Field.Discriminated<User | Organization, "type"> = result;
      // @ts-expect-error
      const _manualWrong: Field.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(unionValue, "paid");
    }

    // Field union
    {
      const result = fieldDiscriminate(unionField, "type");

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
            field: Field.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: Field.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: Field.Discriminated<User | Organization, "type"> = result;
      // @ts-expect-error
      const _manualWrong: Field.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(unionField, "paid");
    }

    // Undefined field
    {
      const result = fieldDiscriminate(unionField.try(), "type");

      result satisfies
        | {
            discriminator: "user";
            field: Field.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Tried<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: Field.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Detachable<Organization>;
          };

      const _manual: Field.Discriminated<User | Organization, "type", "tried"> =
        result;
      // @ts-expect-error
      const _manualWrong: Field.Discriminated<User, "type", "tried"> = result;
    }

    // Undefined value
    {
      const result = fieldDiscriminate(
        unionField as Field<User | Organization | undefined>,
        "type",
      );

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
            field: Field.Detachable<undefined>;
          }
        | {
            discriminator: "user";
            field: Field.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: Field.Tried<undefined>;
          }
        | {
            discriminator: "user";
            field: Field.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: Field.Discriminated<
        User | Organization | undefined,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: Field.Discriminated<User | Organization, "type"> =
        result;

      // @ts-expect-error
      fieldDiscriminate(unionValue, "paid");
    }

    // Detachable
    {
      const result = fieldDiscriminate(
        unionField as Field.Detachable<User> | Field.Detachable<Organization>,
        "type",
      );

      result satisfies
        | {
            discriminator: "user";
            field: Field.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: Field.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: Field.Discriminated<
        User | Organization,
        "type",
        "detachable"
      > = result;
      // @ts-expect-error
      const _manualWrong: Field.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
    }

    // Mixed
    {
      const result = fieldDiscriminate(
        unionField as
          | Field.Branded<User, "detachable" | "tried">
          | Field.Branded<Organization, "detachable" | "tried">,
        "type",
      );

      result satisfies
        | {
            discriminator: "user";
            field: Field.Branded<User, "detachable" | "tried">;
          }
        | {
            discriminator: "organization";
            field: Field.Branded<Organization, "detachable" | "tried">;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: Field.Bound<User>;
          }
        | {
            discriminator: "organization";
            field: Field.Bound<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: Field.Discriminated<
        User | Organization,
        "type",
        "detachable" | "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: Field.Discriminated<
        User | Organization,
        "type",
        "bound"
      > = result;
    }
  }

  // FieldRef
  {
    // Value union
    {
      const refValue = new FieldRef(unionValue);
      const result = fieldDiscriminate(refValue, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRef<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRef.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: FieldRef.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(refValue, "paid");
    }

    // Field union
    {
      const refUnion = FieldRef.every(unionField);
      const result = fieldDiscriminate(refUnion, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRef<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRef.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: FieldRef.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(refUnion, "paid");
    }

    // Undefined field
    {
      const refTry = FieldRef.every(unionField.try());
      const result = fieldDiscriminate(refTry, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Detachable<Organization>;
          };

      const _manual: FieldRef.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRef.Discriminated<User, "type", "tried"> =
        result;
    }

    // Undefined value
    {
      const refUndef = new FieldRef(
        unionField as Field<User | Organization | undefined>,
      );
      const result = fieldDiscriminate(refUndef, "type");

      result satisfies
        | {
            discriminator: undefined;
            field: FieldRef<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldRef<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: FieldRef.Detachable<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: FieldRef.Tried<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRef.Discriminated<
        User | Organization | undefined,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRef.Discriminated<User | Organization, "type"> =
        result;

      // @ts-expect-error
      fieldDiscriminate(refValue, "paid");
    }

    // Detachable
    {
      const refDetachable = FieldRef.every(
        unionField as Field.Detachable<User> | Field.Detachable<Organization>,
      );
      const result = fieldDiscriminate(refDetachable, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRef.Discriminated<
        User | Organization,
        "type",
        "detachable"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRef.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
    }

    // Mixed
    {
      const refMixed = FieldRef.every(
        unionField as
          | Field.Branded<User, "detachable" | "tried">
          | Field.Branded<Organization, "detachable" | "tried">,
      );
      const result = fieldDiscriminate(refMixed, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Branded<User, "detachable" | "tried">;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Branded<Organization, "detachable" | "tried">;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRef.Bound<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRef.Bound<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRef.Discriminated<
        User | Organization,
        "type",
        "detachable" | "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRef.Discriminated<
        User | Organization,
        "type",
        "bound"
      > = result;
    }
  }

  // MaybeFieldRef
  {
    // Value union
    {
      const maybeValue = new MaybeFieldRef({
        type: "direct",
        field: unionValue,
      });
      const result = fieldDiscriminate(maybeValue, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRef.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRef.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(maybeValue, "paid");
    }

    // Field union
    {
      const maybeUnion = MaybeFieldRef.every(unionField);
      const result = fieldDiscriminate(maybeUnion, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRef.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRef.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(maybeUnion, "paid");
    }

    // Undefined field
    {
      const maybeTry = MaybeFieldRef.every(unionField.try());
      const result = fieldDiscriminate(maybeTry, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Detachable<Organization>;
          };

      const _manual: MaybeFieldRef.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRef.Discriminated<User, "type", "tried"> =
        result;
    }

    // Undefined value
    {
      const maybeUndef = new MaybeFieldRef({
        type: "direct",
        field: unionField as Field<User | Organization | undefined>,
      });
      const result = fieldDiscriminate(maybeUndef, "type");

      result satisfies
        | {
            discriminator: undefined;
            field: MaybeFieldRef<undefined>;
          }
        | {
            discriminator: "user";
            field: MaybeFieldRef<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: MaybeFieldRef.Detachable<undefined>;
          }
        | {
            discriminator: "user";
            field: MaybeFieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: MaybeFieldRef.Tried<undefined>;
          }
        | {
            discriminator: "user";
            field: MaybeFieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRef.Discriminated<
        User | Organization | undefined,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRef.Discriminated<
        User | Organization,
        "type"
      > = result;

      // @ts-expect-error
      fieldDiscriminate(maybeValue, "paid");
    }

    // Detachable
    {
      const maybeDetachable = MaybeFieldRef.every(
        unionField as Field.Detachable<User> | Field.Detachable<Organization>,
      );
      const result = fieldDiscriminate(maybeDetachable, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRef.Discriminated<
        User | Organization,
        "type",
        "detachable"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRef.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
    }

    // Mixed
    {
      const maybeMixed = MaybeFieldRef.every(
        unionField as
          | Field.Branded<User, "detachable" | "tried">
          | Field.Branded<Organization, "detachable" | "tried">,
      );
      const result = fieldDiscriminate(maybeMixed, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Branded<User, "detachable" | "tried">;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Branded<Organization, "detachable" | "tried">;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRef.Bound<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRef.Bound<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRef.Discriminated<
        User | Organization,
        "type",
        "detachable" | "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRef.Discriminated<
        User | Organization,
        "type",
        "bound"
      > = result;
    }
  }
}
//#endregion
