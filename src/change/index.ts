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

  /** Field inserted into object/array. Before it gets created the field might
   * be in the detached state.  */
  attach: takeBit(),
  /** Field removed from object/array. */
  detach: takeBit(),
  /** Field type changed. It indicates that field type (array/object/primitive)
   * has changed. */
  type: takeBit(),
  /** Field value changed. It applies only to primitive field type as
   * object/array fields value is a reference. */
  value: takeBit(),
  /** Object/array field property/item changed. It indicates only structural
   * changes. */
  child: takeBit(),

  // Padding
  ...reserveBit(),
  ...reserveBit(),
  ...reserveBit(),

  //#endregion

  //#region Meta changes
  // Changes that affect the meta state of the field.

  /** Field id is not different. It happens when the field watched by a hook
   * is replaced with a new field. */
  id: takeBit(),
  /** Field value commited as initial. */
  // [TODO] This is not used, but the commit method is implemented, so we need
  // either remove it or utilize it.
  commit: takeBit(),
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
 * changes into a single value.
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
