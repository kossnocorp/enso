/**
 * @module change
 *
 * State changes module. It defines event types, changes bit maps and helpers
 * that help to identify the changes.
 */

/**
 * Changes event class. It extends the native `Event` class and adds
 * the `changes` property to it.
 */
export class ChangesEvent extends Event {
  /** Changes bitmask. */
  changes: FieldChange;

  /**
   * Creates a new changes event.
   *
   * @param changes - Changes that happened.
   */
  constructor(changes: FieldChange) {
    super("change");
    this.changes = changes;
  }
}

/**
 * Field change type. It aliases the `bigint` type to represent the changes
 * type.
 */
// [TODO] Consider making it opaque.
export type FieldChange = bigint;

/**
 * Structural changes bits. It defines the allocate size for the structural
 * changes. It allows to access the structural changes bits range.
 */
export const structuralChangesBits = 8n;

/**
 * Meta changes bits. It defines the allocate size for the meta changes. It
 * allows to access the meta changes bits range which goes after the structural
 * changes.
 */
export const metaChangesBits = 8n;

/**
 * Allocated change bits.
 */
export const changesBits = structuralChangesBits + metaChangesBits;

/**
 * Allocated core changes bits. It defines the allocated bits for the core
 * changes. It allows extensions to allocate additional bits for their own
 * changes after the core changes.
 */
export const coreChangesBits = changesBits * 3n;

/**
 * Bit index used to generate the next bit in the sequence.
 *
 * @private
 */
let bitIdx = 0n;

/**
 * Field changes map.
 *
 * It represents the changes for the field itself.
 */
export const fieldChange = {
  //#region Structural changes
  // Changes that affect the inner value of the field.

  // [TODO] Decide what is the application of subtree changes.
  //
  // Initially I though that would allow to distinquish children events and
  // have granularity to react to the changes. For instance when using as
  // a collection, arrays/objects need to know when immediate children receive
  // `attach`/`detach` but not about the subtree changes.
  //
  // Subtree changes are useful when handling `blur` in particular. Right now
  // it is handled by a special case, but with the new bit regions approach it
  // is easy to define the children/subtree changes by simply shifting the bits
  // so it feel appropriate to have them.
  //
  // Another example could be validation changes, but it's not utilized at
  // the moment.

  /** Field type changed. It indicates that field type(array/object/number/etc.)
   * is now different. */
  type: takeBit(),
  /** Field value changed. It applies only to primitive field type as
   * object/array fields value is a reference. */
  value: takeBit(),
  /** Field attached (inserted) to object/array. Before it gets created
   * the field might be in the detached state. */
  attach: takeBit(),
  /** Field detached from object/array. Rather than removing, the field will
   * be in detached state and won't receive any updates until it gets attached
   * again. */
  detach: takeBit(),
  /** Shape of object/array changed. It means one of the following: a child
   * got attached, detached or moved. */
  shape: takeBit(),

  // [TODO] Decide on how to handle the `key` event.
  //
  // It is helpful to indicate that the field got moved, i.e. the parent array
  // or object got reordered. It is particularly helpful to parents rather than
  // children.
  //
  // The problem with it is that it is not a structural change for the field
  // itself and it is misleading to have it in the structural changes category.
  //
  // I feel like it should be in the meta changes category, but for the parent
  // array/object this change is helpful when determing if the children got
  // reordered.
  //
  // However `key` change on immediate children is a kind of structural change
  // and having it in the meta changes makes it inconsistent.
  //
  // One approach it to keep `child` change but apply it only to the immediate
  // children movements, either `key`, `attach`, or `detach`.
  //
  // This approach however makes it a bit harder to resolve as these changes
  // will need to be separately handled, so `child` can be properly applied.
  //
  // Additionally `children` is probably the best name for the event.

  //#endregion

  // Structural changes padding
  ...reserveBit(),
  ...reserveBit(),
  ...reserveBit(),

  //#region Meta changes
  // Changes that affect the meta state of the field.

  /** Field id changed. It happens when the field watched by a hook is replaced
   * with a new field. */
  id: takeBit(),
  /** Field key changed. It indicates that the field got moved. It doesn't
   * apply to the field getting detached and attached. */
  // [TODO] Utilize this flag
  key: takeBit(),
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
};

if (process.env.NODE_ENV !== "production") {
  // Test the changes bits overflow.
  const bits = BigInt(Object.keys(fieldChange).length);
  if (bits > changesBits)
    throw new Error(
      `Field changes bits overflow. Maximum changes bits is ${changesBits} but got ${bits}.`
    );
}

/**
 * Field change map. It maps the human-readable field change names to
 * the corresponding bit mask.
 */
// [NOTE] Without using this type to define `childChange` and `subtreeChange`,
// the LSP actions such as "rename" will not work.
export type FieldChangeMap = typeof fieldChange;

/**
 * Child changes shift.
 */
export const childChangesShift = changesBits;

/**
 * Child changes map.
 *
 * It represents the changes for the immediate children of the field.
 */
export const childChange: FieldChangeMap = {
  ...fieldChange,
};

// Shift child field changes to its dedicated category bits range.
shiftCategoryBits(childChange, childChangesShift);

/**
 * Subtree changes shift.
 */
export const subtreeChangesShift = changesBits * 2n;

/**
 * Subtree changes map.
 *
 * It represents the changes for the deeply nested children of the field.
 */
export const subtreeChange: FieldChangeMap = {
  ...fieldChange,
};

// Shift child field changes to its dedicated category bits range.
shiftCategoryBits(subtreeChange, subtreeChangesShift);

/**
 * Field changes map. Each bit indicates a certain type of change in the field.
 *
 * The changes are represented as a bit mask, which allows to combine multiple
 * change types into a single value. BigInt is used to represent the changes
 * as bitwise operations on numbers convert their operands to 32-bit integers
 * and limit the available bits range.
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
 *
 * Here is the visual representation of the changes map:
 *
 *   Subtree         Child           Field
 *   v               v               v
 * 0b000000000000000000000000000000000000000000000000n
 *   ^       ^       ^       ^       ^       ^
 *   Meta    Struct. Meta    Struct. Meta    Struct.
 *
 * The structural field changes range is exclusive meaning that only one of
 * the flags can be set at a time. This allows to simplify the logic and
 * make it easier to understand. Initially that was not the case and
 * `detach` and `attach` flags were always set with `type` change, but this
 * logic warrants always setting `value` flag as well. The possible combinations
 * made it harder to understand and test the logic, so it was decided to make
 * the structural changes exclusive.
 *
 * The meta field changes as well as any child and subtree changes are not
 * exclusive and can be combined, as there might be multiple children having
 * conflicting changes i.e. `detach` and `attach` at the same time.
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
 *
 * @private
 */
function shiftCategoryBits(changes: typeof fieldChange, shift: bigint) {
  for (const key in fieldChange) {
    changes[key as keyof typeof fieldChange] <<= shift;
  }
}

/**
 * Takes the next bit in the sequence and increments the global `bitIdx`.
 *
 * @returns The next bit in the sequence.
 */
function takeBit() {
  return 2n ** bitIdx++;
}

/**
 * Generates object to assign to the changes map, it uses the global `baseBits`
 * variable to generate the next reserved change and increments it.
 *
 * @returns Object to assign to the changes map.
 *
 * @private
 */
function reserveBit() {
  return {
    /** Reserved for future use.
     * @deprecated */
    [`reserved${bitIdx}`]: takeBit(),
  };
}
