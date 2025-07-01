import { Field } from "../index.tsx";
import { fieldDecompose, useFieldDecompose } from "./index.ts";

const unionValue = new Field<Hello | Blah>({ hello: "world" });
const unionField = new Field({
  hello: "world",
}) as Field<Hello> | Field<Blah>;

// `decompose`
{
  // Field
  {
    // Value union
    {
      const decomposed = fieldDecompose(unionValue);
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
      const decomposed = fieldDecompose(unionField);
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
        unionValue as Field.Detachable<Hello | Blah>,
      );
      decomposed satisfies
        | {
            value: Hello;
            field: Field.Detachable<Hello>;
          }
        | {
            value: Blah;
            field: Field.Detachable<Blah>;
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
        unionValue,
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
        unionField,
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
        unionValue as Field.Detachable<Hello | Blah>,
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
            field: Field.Detachable<Hello>;
          }
        | {
            value: Blah;
            field: Field.Detachable<Blah>;
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
