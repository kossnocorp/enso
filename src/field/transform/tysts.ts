import { FieldOld } from "../definition.tsx";
import { fieldDecompose, useFieldDecompose } from "./index.ts";

const unionValue = new FieldOld<Hello | Blah>({ hello: "world" });
const unionField = new FieldOld({
  hello: "world",
}) as FieldOld<Hello> | FieldOld<Blah>;

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
            field: FieldOld<Hello>;
          }
        | {
            value: Blah;
            field: FieldOld<Blah>;
          };
      // @ts-expect-error
      decomposed.any;

      const _manual: FieldOld.Decomposed<Hello | Blah> = decomposed;
      // @ts-expect-error
      const _manualWrong: FieldOld.Decomposed<Hello> = decomposed;
    }

    // Field union
    {
      const decomposed = fieldDecompose(unionField);
      decomposed satisfies
        | {
            value: Hello;
            field: FieldOld<Hello>;
          }
        | {
            value: Blah;
            field: FieldOld<Blah>;
          };
      // @ts-expect-error
      decomposed.any;

      const _manual: FieldOld.Decomposed<Hello | Blah> = decomposed;
      // @ts-expect-error
      const _manualWrong: FieldOld.Decomposed<Hello> = decomposed;
    }

    // Detachable
    {
      const decomposed = fieldDecompose(
        unionValue as FieldOld.Detachable<Hello | Blah>,
      );
      decomposed satisfies
        | {
            value: Hello;
            field: FieldOld.Detachable<Hello>;
          }
        | {
            value: Blah;
            field: FieldOld.Detachable<Blah>;
          };
      // @ts-expect-error
      decomposed.any;

      const _manual: FieldOld.Decomposed<Hello | Blah, "detachable"> =
        decomposed;
      // @ts-expect-error
      const _manualWrong1: FieldOld.Decomposed<Hello> = decomposed;
      // @ts-expect-error
      const _manualWrong2: FieldOld.Decomposed<Hello | Blah, "bound"> =
        decomposed;
      // @ts-expect-error
      const _manualWrong3: FieldOld.Decomposed<
        Hello | Blah,
        "detachable" | "bound"
      > = decomposed;
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
            field: FieldOld<Hello>;
          }
        | {
            value: Blah;
            field: FieldOld<Blah>;
          };
      // @ts-expect-error
      decomposed.any;

      const _manual: FieldOld.Decomposed<Hello | Blah> = decomposed;
      // @ts-expect-error
      const _manualWrong: FieldOld.Decomposed<Hello> = decomposed;
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
            field: FieldOld<Hello>;
          }
        | {
            value: Blah;
            field: FieldOld<Blah>;
          };
      // @ts-expect-error
      decomposed.any;

      const _manual: FieldOld.Decomposed<Hello | Blah> = decomposed;
      // @ts-expect-error
      const _manualWrong: FieldOld.Decomposed<Hello> = decomposed;
    }

    // Detachable
    {
      const decomposed = useFieldDecompose(
        unionValue as FieldOld.Detachable<Hello | Blah>,
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
            field: FieldOld.Detachable<Hello>;
          }
        | {
            value: Blah;
            field: FieldOld.Detachable<Blah>;
          };
      // @ts-expect-error
      decomposed.any;

      const _manual: FieldOld.Decomposed<Hello | Blah, "detachable"> =
        decomposed;
      // @ts-expect-error
      const _manualWrong1: FieldOld.Decomposed<Hello> = decomposed;
      // @ts-expect-error
      const _manualWrong2: FieldOld.Decomposed<Hello | Blah, "bound"> =
        decomposed;
      // @ts-expect-error
      const _manualWrong3: FieldOld.Decomposed<
        Hello | Blah,
        "detachable" | "bound"
      > = decomposed;
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
