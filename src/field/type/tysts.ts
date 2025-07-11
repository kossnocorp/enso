import { FieldOld } from "../definition.tsx";
import { FieldRefOld, MaybeFieldRefOld } from "../ref/definition.ts";
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

  const unionValue = new FieldOld<User | Organization>({} as User);
  const unionField = new FieldOld({} as User) as
    | FieldOld<User>
    | FieldOld<Organization>;

  // Field
  {
    // Value union
    {
      const result = fieldDiscriminate(unionValue, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldOld<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldOld.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: FieldOld.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(unionValue, "paid");
    }

    // Field union
    {
      const result = fieldDiscriminate(unionField, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldOld<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldOld.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: FieldOld.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(unionField, "paid");
    }

    // Undefined field
    {
      const result = fieldDiscriminate(unionField.try(), "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Tried<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Detachable<Organization>;
          };

      const _manual: FieldOld.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldOld.Discriminated<User, "type", "tried"> =
        result;
    }

    // Undefined value
    {
      const result = fieldDiscriminate(
        unionField as FieldOld<User | Organization | undefined>,
        "type",
      );

      result satisfies
        | {
            discriminator: undefined;
            field: FieldOld<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldOld<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: FieldOld.Detachable<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: FieldOld.Tried<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldOld.Discriminated<
        User | Organization | undefined,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldOld.Discriminated<User | Organization, "type"> =
        result;

      // @ts-expect-error
      fieldDiscriminate(unionValue, "paid");
    }

    // Detachable
    {
      const result = fieldDiscriminate(
        unionField as
          | FieldOld.Detachable<User>
          | FieldOld.Detachable<Organization>,
        "type",
      );

      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldOld.Discriminated<
        User | Organization,
        "type",
        "detachable"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldOld.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
    }

    // Mixed
    {
      const result = fieldDiscriminate(
        unionField as
          | FieldOld.Branded<User, "detachable" | "tried">
          | FieldOld.Branded<Organization, "detachable" | "tried">,
        "type",
      );

      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Branded<User, "detachable" | "tried">;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Branded<Organization, "detachable" | "tried">;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldOld.Bound<User>;
          }
        | {
            discriminator: "organization";
            field: FieldOld.Bound<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldOld.Discriminated<
        User | Organization,
        "type",
        "detachable" | "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldOld.Discriminated<
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
      const refValue = new FieldRefOld(unionValue);
      const result = fieldDiscriminate(refValue, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRefOld.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: FieldRefOld.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(refValue, "paid");
    }

    // Field union
    {
      const refUnion = FieldRefOld.every(unionField);
      const result = fieldDiscriminate(refUnion, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRefOld.Discriminated<User | Organization, "type"> =
        result;
      // @ts-expect-error
      const _manualWrong: FieldRefOld.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(refUnion, "paid");
    }

    // Undefined field
    {
      const refTry = FieldRefOld.every(unionField.try());
      const result = fieldDiscriminate(refTry, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Detachable<Organization>;
          };

      const _manual: FieldRefOld.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRefOld.Discriminated<User, "type", "tried"> =
        result;
    }

    // Undefined value
    {
      const refUndef = new FieldRefOld(
        unionField as FieldOld<User | Organization | undefined>,
      );
      const result = fieldDiscriminate(refUndef, "type");

      result satisfies
        | {
            discriminator: undefined;
            field: FieldRefOld<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldRefOld<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: FieldRefOld.Detachable<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: FieldRefOld.Tried<undefined>;
          }
        | {
            discriminator: "user";
            field: FieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRefOld.Discriminated<
        User | Organization | undefined,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRefOld.Discriminated<
        User | Organization,
        "type"
      > = result;

      // @ts-expect-error
      fieldDiscriminate(refValue, "paid");
    }

    // Detachable
    {
      const refDetachable = FieldRefOld.every(
        unionField as
          | FieldOld.Detachable<User>
          | FieldOld.Detachable<Organization>,
      );
      const result = fieldDiscriminate(refDetachable, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRefOld.Discriminated<
        User | Organization,
        "type",
        "detachable"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRefOld.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
    }

    // Mixed
    {
      const refMixed = FieldRefOld.every(
        unionField as
          | FieldOld.Branded<User, "detachable" | "tried">
          | FieldOld.Branded<Organization, "detachable" | "tried">,
      );
      const result = fieldDiscriminate(refMixed, "type");

      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Branded<User, "detachable" | "tried">;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Branded<Organization, "detachable" | "tried">;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: FieldRefOld.Bound<User>;
          }
        | {
            discriminator: "organization";
            field: FieldRefOld.Bound<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: FieldRefOld.Discriminated<
        User | Organization,
        "type",
        "detachable" | "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: FieldRefOld.Discriminated<
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
      const maybeValue = new MaybeFieldRefOld({
        type: "direct",
        field: unionValue,
      });
      const result = fieldDiscriminate(maybeValue, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRefOld.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(maybeValue, "paid");
    }

    // Field union
    {
      const maybeUnion = MaybeFieldRefOld.every(unionField);
      const result = fieldDiscriminate(maybeUnion, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRefOld.Discriminated<User, "type"> = result;

      // @ts-expect-error
      fieldDiscriminate(maybeUnion, "paid");
    }

    // Undefined field
    {
      const maybeTry = MaybeFieldRefOld.every(unionField.try());
      const result = fieldDiscriminate(maybeTry, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Detachable<Organization>;
          };

      const _manual: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRefOld.Discriminated<
        User,
        "type",
        "tried"
      > = result;
    }

    // Undefined value
    {
      const maybeUndef = new MaybeFieldRefOld({
        type: "direct",
        field: unionField as FieldOld<User | Organization | undefined>,
      });
      const result = fieldDiscriminate(maybeUndef, "type");

      result satisfies
        | {
            discriminator: undefined;
            field: MaybeFieldRefOld<undefined>;
          }
        | {
            discriminator: "user";
            field: MaybeFieldRefOld<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: MaybeFieldRefOld.Detachable<undefined>;
          }
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: undefined;
            field: MaybeFieldRefOld.Tried<undefined>;
          }
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRefOld.Discriminated<
        User | Organization | undefined,
        "type"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type"
      > = result;

      // @ts-expect-error
      fieldDiscriminate(maybeValue, "paid");
    }

    // Detachable
    {
      const maybeDetachable = MaybeFieldRefOld.every(
        unionField as
          | FieldOld.Detachable<User>
          | FieldOld.Detachable<Organization>,
      );
      const result = fieldDiscriminate(maybeDetachable, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Detachable<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Detachable<Organization>;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Tried<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Tried<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type",
        "detachable"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type",
        "tried"
      > = result;
    }

    // Mixed
    {
      const maybeMixed = MaybeFieldRefOld.every(
        unionField as
          | FieldOld.Branded<User, "detachable" | "tried">
          | FieldOld.Branded<Organization, "detachable" | "tried">,
      );
      const result = fieldDiscriminate(maybeMixed, "type");

      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Branded<User, "detachable" | "tried">;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Branded<
              Organization,
              "detachable" | "tried"
            >;
          };
      // @ts-expect-error
      result satisfies
        | {
            discriminator: "user";
            field: MaybeFieldRefOld.Bound<User>;
          }
        | {
            discriminator: "organization";
            field: MaybeFieldRefOld.Bound<Organization>;
          };
      // @ts-expect-error
      result.any;

      const _manual: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type",
        "detachable" | "tried"
      > = result;
      // @ts-expect-error
      const _manualWrong: MaybeFieldRefOld.Discriminated<
        User | Organization,
        "type",
        "bound"
      > = result;
    }
  }
}
//#endregion
