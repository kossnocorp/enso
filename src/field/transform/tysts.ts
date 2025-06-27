import { Field } from "../index.tsx";
import { fieldDecompose, useFieldDecompose } from "./index.ts";

const fieldUnionValue = new Field<Hello | Blah>({ hello: "world" });
const fieldUnionField = new Field({
  hello: "world",
}) as Field<Hello> | Field<Blah>;

// `decompose`
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
}

// `useDecompose`
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
}

//#region Helpers

interface Hello {
  hello: string;
}

interface Blah {
  blah: string;
}

//#endregion
