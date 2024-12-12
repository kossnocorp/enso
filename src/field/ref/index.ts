import { Field } from "../index.tsx";

export class FieldRef<Payload> {
  #external: Field<Payload>;

  constructor(external: Field<Payload>) {
    this.#external = external;
  }

  get value() {
    return this.#external.get();
  }

  error(error: Field.Error | string) {
    return this.#external.setError(error);
  }
}
