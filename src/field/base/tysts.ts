import { ChangesEvent, fieldChange } from "../../change/index.ts";
import { type EventsTree } from "../../events/index.ts";
import { Field } from "../index.tsx";
import type { BaseField } from "./index.ts";

// It accepts any payload extensions
{
  // @ts-expect-error
  const _test1: Field<Hello> = new Field({ hello: "hi" }) as BaseField<Hello>;

  // Function argument

  testHello(new Field({ hello: "hi" }));
  testHello(new Field({ hello: "hello", who: "world" }));

  // @ts-expect-error
  testHello(new Field({ nope: false }));
  // @ts-expect-error
  testHello(new Field(1));

  // Variable declaration

  const _test2: BaseField<Hello> = new Field({ hello: "hi" });
  const _test3: BaseField<Hello> = new Field({ hello: "hello", who: "world" });

  // @ts-expect-error
  const _test4: BaseField<Hello> = new Field({ nope: false });
  // @ts-expect-error
  const _test5: BaseField<Hello> = new Field(1);
}

// It allows to read common fields
{
  function _test(_field: BaseField<Hello>) {
    // TODO
  }
}

// Mixes in unknown fields
{
  // TODO
}

// It disallows setting base field
{
  // TODO
}

// Base field children are basic fields
{
  // TODO
}

// It has Field-compatible API
{
  function _test(field: BaseField<Hello>) {
    // @ts-expect-error
    field.any;

    // Attributes

    // `id`
    field.id satisfies string;
    // @ts-expect-error
    field.id.any;

    // `parent`
    field.parent satisfies BaseField<unknown> | undefined;
    field.parent satisfies Field<unknown> | undefined;
    // @ts-expect-error
    field.parent.any;

    // `key`
    field.key satisfies string | undefined;
    // @ts-expect-error
    field.key.any;

    // `path`
    field.path satisfies string[];
    // @ts-expect-error
    field.path.any;

    // `name`
    field.name satisfies string;
    // @ts-expect-error
    field.name.any;

    // Value

    // `get`
    field.get() satisfies Hello;
    // @ts-expect-error
    field.get.any;

    // `useGet`
    field.useGet() satisfies Hello;
    field.useGet({ meta: true }) satisfies [
      Hello,
      {
        valid: boolean;
        errors: Field.Error[];
        dirty: boolean;
      },
    ];
    // @ts-expect-error
    field.useGet({ meta: true }).any;

    // `initial`
    field.initial satisfies Hello;
    // @ts-expect-error
    field.initial.any;

    // Meta

    // `dirty
    field.dirty satisfies boolean;
    // @ts-expect-error
    field.dirty.any;

    // `useDirty`
    field.useDirty() satisfies boolean;
    field.useDirty(true) satisfies boolean;
    field.useDirty(true as boolean) satisfies boolean | undefined;
    // @ts-expect-error
    field.useDirty.any;
    // @ts-expect-error
    field.useDirty("nope");

    // `useMeta`
    field.useMeta() satisfies {
      valid: boolean;
      errors: Field.Error[];
      dirty: boolean;
    };
    field.useMeta({ valid: false, errors: false }) satisfies {
      dirty: boolean;
    };
    // @ts-expect-error
    field.useMeta({ valid: false, errors: false }) satisfies {
      valid: boolean;
      errors: Field.Error[];
      dirty: boolean;
    };
    // @ts-expect-error
    field.useMeta.any;
    // @ts-expect-error
    field.useMeta("nope");

    // Tree

    // `root`
    field.root satisfies BaseField<unknown>;
    field.root satisfies Field<unknown>;
    // @ts-expect-error
    field.root.any;

    // `$`
    field.$.hello satisfies BaseField<string>;
    field.$.hello satisfies Field<string>;
    // @ts-expect-error
    field.$.hello.any;
    // @ts-expect-error
    field.$.nah;

    // `at`
    field.at("hello") satisfies BaseField<string>;
    field.at("hello") satisfies Field<string>;
    // @ts-expect-error
    field.at.any;
    // @ts-expect-error
    field.at("nah");

    // `try`
    const fieldNullish = {} as unknown as BaseField<Hello | null | undefined>;
    fieldNullish.try() satisfies BaseField<Hello> | null | undefined;
    fieldNullish.try("hello") satisfies BaseField<string> | undefined;
    // @ts-expect-error
    fieldNullish.try().any;
    // @ts-expect-error
    fieldNullish.try("hello").any;

    // Events

    // `eventsTree`
    field.eventsTree satisfies EventsTree;
    // @ts-expect-error
    field.eventsTree.any;

    // `trigger`
    field.trigger(fieldChange.attach);
    // @ts-expect-error
    field.trigger("any");
    // @ts-expect-error
    field.trigger.any;

    // `withhold`
    field.withhold();
    // @ts-expect-error
    field.withhold.any;

    // `unleash`
    field.unleash();
    // @ts-expect-error
    field.unleash.any;

    // Watch

    // `watch`
    const unsub = field.watch((value, event) => {
      value satisfies Hello;
      // @ts-expect-error
      value.any;

      event satisfies ChangesEvent;
      // @ts-expect-error
      event.any;
    });
    unsub satisfies () => void;
    // @ts-expect-error
    unsub.any;

    // `useWatch`
    field.useWatch((value, event) => {
      value satisfies Hello;
      // @ts-expect-error
      value.any;

      event satisfies ChangesEvent;
      // @ts-expect-error
      event.any;
    });
    // @ts-expect-error
    field.useWatch.any;

    // `unwatch`
    field.unwatch();
    // @ts-expect-error
    field.unwatch.any;

    // `useBind`
    field.useBind();
    // @ts-expect-error
    field.useBind.any;

    // Map

    // `useCompute`
    const computed = field.useCompute((value) => {
      value satisfies Hello;
      // @ts-expect-error
      value.any;
      return value.hello;
    }, []);
    computed satisfies string;
    // @ts-expect-error
    computed.any;

    // const fieldMixed = {} as unknown as BaseField<Hello | Blah>;
    //

    // Computed

    // TODO

    // Collection

    // // `forEach`
    // const fieldObj = {} as unknown as BaseField<Hello & { who?: string }>;
    // fieldObj.forEach((value, key) => {
    //   value satisfies Field<string | undefined> | Field<string>;
    //   // @ts-expect-error
    //   value.any;
    //   key satisfies "hello" | "who";
    //   // @ts-expect-error
    //   key.any;

    //   if (key === "hello") {
    //     value satisfies Field<string>;
    //   }
    // });
    // const fieldArr = {} as unknown as BaseField<Hello[]>;
    // fieldArr.forEach((value, index) => {
    //   value satisfies Field<Hello>;
    //   // @ts-expect-error
    //   value.any;
    //   index satisfies number;
    //   // @ts-expect-error
    //   index.any;
    // });

    // System

    field.deconstruct();
  }
}

//#region Helpers

interface Hello {
  hello: string;
}

function testHello(_field: BaseField<Hello>) {}

interface Blah {
  blah: string;
}

//#endregion

{
  testHello({} as BaseField<Hello>);
  testHello({} as BaseField<Hello & { who?: string }>);

  const _test1: BaseField<Hello> = {} as BaseField<Hello>;
  const _test2: BaseField<Hello> = {} as BaseField<Hello & { who?: string }>;
}

// 11111111111111

{
  class Fieldy<Payload> {
    constructor(public payload: Payload) {}

    hello(): Payload extends Payload ? { payload: Payload } : never {
      return {} as any;
    }
  }

  const _fieldy1: Fieldy<Hello> = new Fieldy<Hello>({ hello: "hi" });
  const _fieldy2: Fieldy<Hello> = new Fieldy<Hello & { who: "me" }>({
    hello: "hi",
    who: "me",
  });
  // @ts-expect-error
  const _fieldy3: Fieldy<Hello> = new Fieldy<Hello | Blah>({ hello: "hi" });
  const _fieldy4 = new Fieldy<Hello | Blah>({ hello: "hi" });
  const _fieldy5: Fieldy<Hello | Blah> = new Fieldy<Hello | Blah>({
    hello: "hi",
  });
  const _fieldy6: Fieldy<Hello> | Fieldy<Blah> = new Fieldy<Hello>({
    hello: "hi",
  });
}

// 22222222222222

{
  class Fieldy<Payload> {
    constructor(public payload: Payload) {}

    hello(): Payload {
      return {} as any;
    }
  }

  const _fieldy1: Fieldy<Hello> = new Fieldy<Hello>({ hello: "hi" });
  const _fieldy2: Fieldy<Hello> = new Fieldy<Hello & { who: "me" }>({
    hello: "hi",
    who: "me",
  });
  // @ts-expect-error
  const _fieldy3: Fieldy<Hello> = new Fieldy<Hello | Blah>({ hello: "hi" });
  const _fieldy4 = new Fieldy<Hello | Blah>({ hello: "hi" });
  const _fieldy5: Fieldy<Hello | Blah> = new Fieldy<Hello | Blah>({
    hello: "hi",
  });
  const _fieldy6: Fieldy<Hello> | Fieldy<Blah> = new Fieldy<Hello>({
    hello: "hi",
  });
}

// 33333333333333

{
  class Fieldy<Payload> {
    constructor(public payload: Payload) {}

    static hello<Payload>(
      _field: Fieldy<Payload>,
    ): Payload extends Payload ? { payload: Payload } : never {
      return {} as any;
    }

    _ = Fieldy;
  }

  const _fieldy1: Fieldy<Hello> = new Fieldy<Hello>({ hello: "hi" });
  const _fieldy2: Fieldy<Hello> = new Fieldy<Hello & { who: "me" }>({
    hello: "hi",
    who: "me",
  });
  // @ts-expect-error
  const _fieldy3: Fieldy<Hello> = new Fieldy<Hello | Blah>({ hello: "hi" });
  const _fieldy4 = new Fieldy<Hello | Blah>({ hello: "hi" });
  const _fieldy5: Fieldy<Hello | Blah> = new Fieldy<Hello | Blah>({
    hello: "hi",
  });
  const _fieldy6: Fieldy<Hello> | Fieldy<Blah> = new Fieldy<Hello>({
    hello: "hi",
  });

  Fieldy.hello(_fieldy1);

  _fieldy1._.hello(_fieldy1);
}

{
  class Fieldy<Payload> {
    constructor(public payload: Payload) {}

    hello(): Payload extends Payload ? { fieldy: Fieldy<Payload> } : never {
      return {} as any;
    }
  }

  const _fieldy1: Fieldy<Hello> = new Fieldy<Hello>({ hello: "hi" });
  const _fieldy2: Fieldy<Hello> = new Fieldy<Hello & { who: "me" }>({
    hello: "hi",
    who: "me",
  });
}

{
  class Fieldy<Payload> {
    constructor(public payload: Payload) {}

    hello: FieldyHello<Payload> = (() => "hi") as any;
  }

  type FieldyHello<Payload> = Payload extends string ? () => string : never;

  const _fieldy1: Fieldy<Hello> = new Fieldy<Hello>({ hello: "hi" });
  const _fieldy2: Fieldy<Hello> = new Fieldy<Hello & { who: "me" }>({
    hello: "hi",
    who: "me",
  });
  const _fieldy3: Fieldy<string> = new Fieldy<string>("hello");
  const _fieldy4: Fieldy<string> = new Fieldy<"yo">("yo");
}

{
  type Hello1<Type> = Type extends Type ? { hi: Type } : never;

  const _hello1 = {} as Hello1<string | number>;

  type Hello2<Type> = { hi: Type } & {};

  const _hello2 = {} as Hello2<string | number>;

  type Hello1Type = { hi: string } | { hi: number };

  type Hello2Type = { hi: string | number };

  const _test1: Hello2Type = {} as Hello1Type;

  const _test2: Hello1Type = {} as Hello2Type;
}

type Hi = string | number | undefined;

// 1.

const fn1 = <Type extends Hi>(
  hi1: Type,
  // 1. Return type
): {
  value: Type;
  set: (value: Type) => void;
} => ({
  value: hi1,
  set: (_value: Type) => {},
});

const test1 = fn1({} as Hi);

if (typeof test1.value === "string") {
  test1.set("hello");
  // @ts-expect-error
  test1.set(42);
}

// 2.

const fn2 = <Type extends Hi>(
  hi1: Type,
  // 2. Return type with Type extends Type
): Type extends Type
  ? {
      value: Type;
      set: (value: Type) => void;
    }
  : never =>
  ({
    value: hi1,
    set: (_value: Type) => {},
  }) as any;

const test2 = fn2({} as Hi);

if (typeof test2.value === "string") {
  test2.set("hello");
  // @ts-expect-error
  test2.set(42);
}

{
  function staticImplements<T>() {
    return <U extends T>(constructor: U) => {
      constructor;
    };
  }

  interface Wutish<Payload> {
    yeah(hm: Payload): boolean;
  }

  @staticImplements<Wutish<any>>()
  class _Wut<Payload> {
    constructor(public payload: Payload) {}

    static hell(): boolean {
      return true;
    }

    static yeah(_hm: string): boolean {
      return true;
    }

    nah(): boolean {
      return true;
    }
  }
}
