//#region Transform

import { ty } from "tyst";
import { State } from "./definition.ts";

//#region State.Decomposed
{
  // Default
  {
    const decomposed = {} as State.Decomposed<string[] | undefined>;

    if (decomposed.value) {
      ty(decomposed.state).is(ty<State<string[]>>());
    } else {
      ty(decomposed.state).is(ty<State<undefined>>());
    }

    ty(decomposed).is(
      ty.assignableTo<State.Exact.Decomposed<string[] | undefined>>(),
    );
  }

  // Exact
  {
    const decomposed = {} as State.Exact.Decomposed<string[] | undefined>;

    if (decomposed.value) {
      ty(decomposed.state).is(ty<State.Exact<string[]>>());
    } else {
      ty(decomposed.state).is(ty<State.Exact<undefined>>());
    }
  }

  // Base
  {
    const decomposed = {} as State.Base.Decomposed<string[] | undefined>;

    ty(decomposed.value).is(ty<unknown>());
    ty(decomposed.state).is(
      ty<State.Base<string[]> | State.Base<undefined> | State.Base<unknown>>(),
    );
  }

  // Optional
  {
    const decomposed = {} as State.Optional.Decomposed<string[] | undefined>;

    if (decomposed.value) {
      ty(decomposed.state).is(ty<State.Optional<string[]>>());
    } else {
      ty(decomposed.state).is(ty<State.Optional<undefined>>());
    }
  }

  // Immutable
  {
    const decomposed = {} as State.Immutable.Decomposed<string[] | undefined>;

    if (decomposed.value) {
      ty(decomposed.state).is(ty<State.Immutable<string[]>>());
    } else {
      ty(decomposed.state).is(ty<State.Immutable<undefined>>());
    }
  }
}
//#endregion

//#region State.DecomposedVariant
{
  // Default
  {
    const decomposed = {} as State.DecomposedVariant<
      string[] | undefined,
      undefined
    >;

    ty(decomposed).is(
      ty.assignableTo<State.Decomposed<string[] | undefined>>(),
    );

    ty(decomposed.value).is(ty<undefined>());
    ty(decomposed.state).is(ty<State<undefined>>());

    ty(decomposed).is(
      ty.assignableTo<
        State.Exact.DecomposedVariant<string[] | undefined, undefined>
      >(),
    );
  }

  // Exact
  {
    const decomposed = {} as State.Exact.DecomposedVariant<
      string[] | undefined,
      undefined
    >;

    ty(decomposed).is(
      ty.assignableTo<State.Exact.Decomposed<string[] | undefined>>(),
    );

    ty(decomposed.value).is(ty<undefined>());
    ty(decomposed.state).is(ty<State.Exact<undefined>>());
  }

  // Base
  {
    const decomposed = {} as State.Base.DecomposedVariant<
      string[] | undefined,
      undefined
    >;

    ty(decomposed).is(
      ty.assignableTo<State.Base.Decomposed<string[] | undefined>>(),
    );

    ty(decomposed.value).is(ty<undefined>());
    ty(decomposed.state).is(ty<State.Base<undefined> | State.Base<unknown>>());
  }

  // Optional
  {
    const decomposed = {} as State.Optional.DecomposedVariant<
      string[] | undefined,
      undefined
    >;

    ty(decomposed).is(
      ty.assignableTo<State.Optional.Decomposed<string[] | undefined>>(),
    );

    ty(decomposed.value).is(ty<undefined>());
    ty(decomposed.state).is(ty<State.Optional<undefined>>());
  }

  // Immutable
  {
    const decomposed = {} as State.Immutable.DecomposedVariant<
      string[] | undefined,
      undefined
    >;

    ty(decomposed).is(
      ty.assignableTo<State.Immutable.Decomposed<string[] | undefined>>(),
    );

    ty(decomposed.value).is(ty<undefined>());
    ty(decomposed.state).is(ty<State.Immutable<undefined>>());
  }
}
//#endregion

//#region State.Discriminated
{
  interface Square {
    type: "square";
    side: number;
  }

  interface Circle {
    type: "circle";
    radius: number;
  }

  // Default
  {
    const discriminated = {} as State.Discriminated<Square | Circle, "type">;

    if (discriminated.discriminator === "square") {
      ty(discriminated.state).is(ty<State<Square>>());
    } else {
      ty(discriminated.state).is(ty<State<Circle>>());
    }

    ty(discriminated).is(
      ty<State.Exact.Discriminated<Square | Circle, "type">>(),
    );
  }

  // Exact
  {
    const discriminated = {} as State.Exact.Discriminated<
      Square | Circle,
      "type"
    >;

    if (discriminated.discriminator === "square") {
      ty(discriminated.state).is(ty<State.Exact<Square>>());
    } else {
      ty(discriminated.state).is(ty<State.Exact<Circle>>());
    }
  }

  // Base
  {
    const discriminated = {} as State.Base.Discriminated<
      Square | Circle,
      "type"
    >;

    ty(discriminated.discriminator).is(ty<unknown>());
    ty(discriminated.state).is(
      ty<State.Base<Square> | State.Base<Circle> | State.Base<unknown>>(),
    );
  }

  // Optional
  {
    const discriminated = {} as State.Optional.Discriminated<
      Square | Circle,
      "type"
    >;

    if (discriminated.discriminator === "square") {
      ty(discriminated.state).is(ty<State.Optional<Square>>());
    } else {
      ty(discriminated.state).is(ty<State.Optional<Circle>>());
    }
  }

  // Immutable
  {
    const discriminated = {} as State.Immutable.Discriminated<
      Square | Circle,
      "type"
    >;

    if (discriminated.discriminator === "square") {
      ty(discriminated.state).is(ty<State.Immutable<Square>>());
    } else {
      ty(discriminated.state).is(ty<State.Immutable<Circle>>());
    }
  }
}
//#endregion

//#region State.DiscriminatedVariant
{
  interface Square {
    type: "square";
    side: number;
  }

  interface Circle {
    type: "circle";
    radius: number;
  }

  // Default
  {
    const discriminated = {} as State.DiscriminatedVariant<
      Square | Circle,
      "type",
      "circle"
    >;

    ty(discriminated.discriminator).is(ty<"circle">());
    ty(discriminated.state).is(ty<State<Circle>>());

    ty(discriminated).is(
      ty.assignableTo<State.Discriminated<Square | Circle, "type">>(),
    );

    ty(discriminated).is(
      ty<State.Exact.DiscriminatedVariant<Square | Circle, "type", "circle">>(),
    );
  }

  // Exact
  {
    const discriminated = {} as State.Exact.DiscriminatedVariant<
      Square | Circle,
      "type",
      "circle"
    >;

    ty(discriminated).is(
      ty.assignableTo<State.Exact.Discriminated<Square | Circle, "type">>(),
    );

    ty(discriminated.discriminator).is(ty<"circle">());
    ty(discriminated.state).is(ty<State<Circle>>());
  }

  // Base
  {
    const discriminated = {} as State.Base.DiscriminatedVariant<
      Square | Circle,
      "type",
      "circle"
    >;

    ty(discriminated).is(
      ty.assignableTo<State.Base.Discriminated<Square | Circle, "type">>(),
    );

    ty(discriminated.discriminator).is(ty<"circle">());
    ty(discriminated.state).is(ty<State.Base<Circle> | State.Base<unknown>>());
  }

  // Optional
  {
    const discriminated = {} as State.Optional.DiscriminatedVariant<
      Square | Circle,
      "type",
      "circle"
    >;

    ty(discriminated).is(
      ty.assignableTo<State.Optional.Discriminated<Square | Circle, "type">>(),
    );

    ty(discriminated.discriminator).is(ty<"circle">());
    ty(discriminated.state).is(ty<State.Optional<Circle>>());
  }

  // Immutable
  {
    const discriminated = {} as State.Immutable.DiscriminatedVariant<
      Square | Circle,
      "type",
      "circle"
    >;

    ty(discriminated).is(
      ty.assignableTo<State.Immutable.Discriminated<Square | Circle, "type">>(),
    );

    ty(discriminated.discriminator).is(ty<"circle">());
    ty(discriminated.state).is(ty<State.Immutable<Circle>>());
  }
}
//#endregion

//#endregion
