import { Atom } from "../atom/index.js";

export class Field extends Atom {
  //#region Static

  static create(value, parent) {
    return new Field(value, parent);
  }

  static Component(props) {
    const { field } = props;
    const value = field.useGet();
    const meta = field.useMeta({
      dirty: props.meta || !!props.dirty,
      errors: props.meta || !!props.errors,
      valid: props.meta || !!props.valid,
    });

    const control = {
      name: field.name,
      value,
      onChange: field.set,
      onBlur: () => field.trigger(change.field.blur, true),
    };

    return props.render(control, meta);
  }

  // static use<Value>(
  //   initialValue: Value,
  //   deps: DependencyList,
  // ): Field.Envelop<never, Value> {
  //   const field = useMemo(() => new Field(initialValue), deps);
  //   useEffect(() => () => field.deconstruct(), [field]);
  //   return field;
  // }

  //#endregion
}
