import { Enso } from "../../types.ts";
import { Field } from "../index.tsx";
import { fieldDecompose, useFieldDecompose } from "./index.ts";

const fieldUnionValue = new Field<Hello | Blah>({ hello: "world" });
const fieldUnionField = new Field({
  hello: "world",
}) as Field<Hello> | Field<Blah>;

// `decompose`
{
  // Field
  {
    // Value union
    {
      const decomposed = fieldDecompose(fieldUnionValue);
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
    }

    // Field union
    {
      const decomposed = fieldDecompose(fieldUnionField);
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
    }

    // Detachable
    {
      const decomposed = fieldDecompose(
        fieldUnionValue as Enso.Detachable<Field<Hello | Blah>>,
      );
      decomposed satisfies
        | {
            value: Hello;
            field: Enso.Detachable<Field<Hello>>;
          }
        | {
            value: Blah;
            field: Enso.Detachable<Field<Blah>>;
          };
      // @ts-expect-error
      decomposed.any;
    }
  }
}

// `useDecompose`
{
  // Field
  {
    // Value union
    {
      const decomposed = useFieldDecompose(
        fieldUnionValue,
        (newValue, prevValue) => {
          newValue satisfies Hello | Blah;
          // @ts-expect-error
          newValue.any;

          prevValue satisfies Hello | Blah;
          // @ts-expect-error
          prevValue.any;

          return true;
        },
        [],
      );
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
    }

    // Field union
    {
      const decomposed = useFieldDecompose(
        fieldUnionField,
        (newValue, prevValue) => {
          newValue satisfies Hello | Blah;
          // @ts-expect-error
          newValue.any;

          prevValue satisfies Hello | Blah;
          // @ts-expect-error
          prevValue.any;

          return true;
        },
        [],
      );
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
    }

    // Detachable
    {
      const decomposed = useFieldDecompose(
        fieldUnionValue as Enso.Detachable<Field<Hello | Blah>>,
        (newValue, prevValue) => {
          newValue satisfies Hello | Blah;
          // @ts-expect-error
          newValue.any;

          prevValue satisfies Hello | Blah;
          // @ts-expect-error
          prevValue.any;

          return true;
        },
        [],
      );
      decomposed satisfies
        | {
            value: Hello;
            field: Enso.Detachable<Field<Hello>>;
          }
        | {
            value: Blah;
            field: Enso.Detachable<Field<Blah>>;
          };
      // @ts-expect-error
      decomposed.any;
    }
  }
}

//#region Helpers

interface Hello {
  hello: string;
}

interface Blah {
  blah: string;
}

//#endregion
