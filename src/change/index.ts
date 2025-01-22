export type FieldChange = bigint;

export class ChangeEvent extends Event {
  changes: FieldChange;

  constructor(changes: FieldChange) {
    super("change");
    this.changes = changes;
  }
}

// This is used to generate the bit mask for the changes.
let bitIdx = 0n;

/**
 * Field changes map.
 *
 * It represents the changes for the field itself.
 */
export const fieldChange = {
  //#region Structural changes
  // Changes that affect the inner value of the field.

  // [TODO] Decide if I want to allow mixed field-level changes.
  //
  // While it makes sense for children and subtree changes, it is inaccurate
  // e.g. to have both `attach` and `detach` flags set at the same time.
  //
  // Currently `attach`/`detach` always come with `type` change. While it does
  // make sense, if following the same logic, `value` should also be set.
  //
  // Having exclusive flag will simplify logic and make it easier to understand.
  // It also helps to set the boundary when defining the change logic.
  //
  // Allowing mixed flags will require extra work and tests to ensure all
  // the combinations are handled correctly.
  //
  // The big question is what to do when batching changes. It will still not be
  // possible to easily resolve the changes by using the latest flags.
  //
  // With exclusive flags, it will be trivial to descibe logic that defines
  // the priority of the changes and produce single flag for the structural
  // field changes.
  //
  // With mixed flags, it still possible to resolve, but given that each batched
  // change will have few flags, each of them will have to be merged separately.

  /** Field type changed. It indicates that field type(array/object/number/etc.)
   * is now different. */
  type: takeBit(),
  /** Field value changed. It applies only to primitive field type as
   * object/array fields value is a reference. */
  value: takeBit(),
  /** Field inserted into object/array. Before it gets created the field might
   * be in the detached state. It always comes with `type` and `value` changes [TODO] */
  // [TODO] Right now attach and detach always come with `type` which is correct,
  // however `type` is not always coming with `value` change, which also would
  // be accurate and follow the logic of the attach/detach changes. The only
  // case when value isn't changing is when an object/array child or subtree
  // are changed.
  attach: takeBit(),
  /** Field removed from object/array. */
  detach: takeBit(),
  /** Object/array field property/item changed. It indicates only structural
   * changes.
   * @deprecated */
  // [TODO] This flag is redundant, as the child change can be inferred from
  // `childChange` bits with better granularity.
  child: takeBit(),

  // Padding
  ...reserveBit(),
  ...reserveBit(),
  ...reserveBit(),

  //#endregion

  //#region Meta changes
  // Changes that affect the meta state of the field.

  /** Field id is now different. It happens when the field watched by a hook
   * is replaced with a new field. */
  id: takeBit(),
  /** Current field value commited as initial. */
  // [TODO] This is not used, but the commit method is implemented, so we need
  // either remove it or utilize it.
  commit: takeBit(),
  /** Field value resetted to initial. */
  // [TODO] This is not used, but the reset method is implemented, so we need
  // either remove it or utilize it.
  reset: takeBit(),
  /** Field become invalid. */
  invalid: takeBit(),
  /** Field become valid. */
  valid: takeBit(),
  // Reserved for focus change
  // [TODO] Decide if I want to implement focus change and remove this if not.
  ...reserveBit(),
  /** Field lost focus. */
  blur: takeBit(),

  //#endregion

  // Padding
  ...reserveBit(),
};

/**
 * Child field changes map.
 *
 * It represents the changes for the immediate children of the field.
 */
export const childChange = {
  ...fieldChange,
};

// Shift child field changes to its dedicated category bits range.
shiftCategoryBits(childChange);

/**
 * Subtree field changes map.
 *
 * It represents the changes for the deeply nested children of the field.
 */
export const subtreeChange = {
  ...childChange,
};

// Shift child field changes to its dedicated category bits range.
shiftCategoryBits(subtreeChange);

/**
 * Field changes map. Each bit indicates a certain type of change in the field.
 *
 * The changes are represented as a bit mask, which allows to combine multiple
 * change types into a single value.
 *
 * All changes are divided into three main categories:
 *
 * - **Field changes** that affect the field itself.
 * - **Child changes** that affect the immediate children of the field.
 * - **Subtree changes** that affect the deeply nested children of the field.
 *
 * We allocate first 48 bits (16*3) for the category changes.
 *
 * Each category bit further divided into subcategories (8 bits each):
 *
 * - **Structural changes** that affect the inner value of the field.
 * - **Meta changes** that affect the meta state of the field.
 */
export const change = {
  /** Field changes that affect the field itself. */
  field: fieldChange,
  /** Child changes that affect the immediate children of the field. */
  child: childChange,
  /** Subtree changes that affect the deeply nested children of the field. */
  subtree: subtreeChange,
};

/**
 * Shifts the changes map bits to the left by 16 bits, so it placed on
 * the dedicated category bits range.
 *
 * @param changes - Changes map to shift.
 */
function shiftCategoryBits(changes: typeof fieldChange) {
  for (const key in fieldChange) {
    changes[key as keyof typeof fieldChange] <<= 16n;
  }
}

function takeBit() {
  return 2n ** bitIdx++;
}

/**
 * Generates object to assign to the changes map, it uses the global `baseBits`
 * variable to generate the next reserved change and increments it.
 *
 * @returns Object to assign to the changes map.
 */
function reserveBit() {
  return {
    /** Reserved for future use.
     * @deprecated */
    [`reserved${bitIdx}`]: takeBit(),
  };
}
