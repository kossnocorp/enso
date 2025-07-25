/**
 * @module change
 *
 * State changes module. It defines event types, changes bit maps and helpers
 * that help to identify the changes.
 */

//#region Events

/**
 * Changes event class. It extends the native `Event` class and adds
 * the `changes` property to it.
 */
export class ChangesEvent extends Event {
  /** Current batch of changes. It collects all changes that happened during
   * the batch and allows to dispatch them as a single event for each target.
   * @internal */
  static #batch: ChangesEvent.Batch | undefined;

  /**
   * Batches changes events and dispatches them as a single event for each
   * target after callstack is empty.
   *
   * @param target - Event target to dispatch the changes to.
   * @param changes - Changes to dispatch.
   */
  static batch(target: EventTarget, changes: FieldChange) {
    const currentContext = {};
    for (const ctx of this.#context) {
      Object.assign(currentContext, ctx);
    }

    // Create a new batch if it doesn't exist.
    if (!this.#batch) this.#batch = new Map();

    const [batchedChanges, batchedContext] = this.#batch.get(target) || [
      0n,
      {},
    ];

    let newChanges = batchedChanges | changes;

    // Cancel out opposite changes

    // valid/invalid
    if (changes & fieldChange.valid && batchedChanges & fieldChange.invalid)
      newChanges &= ~fieldChange.invalid;
    if (changes & fieldChange.invalid && batchedChanges & fieldChange.valid)
      newChanges &= ~fieldChange.valid;

    // attach/detach
    if (changes & fieldChange.attach && batchedChanges & fieldChange.detach)
      newChanges &= ~fieldChange.detach;
    if (changes & fieldChange.detach && batchedChanges & fieldChange.attach)
      newChanges &= ~fieldChange.attach;

    const newContext = Object.assign({}, batchedContext, currentContext);
    this.#batch.set(target, [newChanges, newContext]);

    queueMicrotask(() => {
      // Check if the batch was consumed
      if (!this.#batch) return;

      // Clear the batch so when new events are chain-batched, they will
      // postpone until the next microtask.
      const batch = this.#batch;
      this.#batch = undefined;

      // Dispatch currently batched events
      batch.forEach(([changes, context], target) =>
        target.dispatchEvent(new ChangesEvent(changes, context)),
      );
    });
  }

  /** Stack of contexts.
   * @internal */
  static #context: ChangesEvent.Context[] = [];

  /**
   * Provides context for the changes events. Nesting contexts will result
   * in the context being merged.
   *
   * @param context - Context to assign.
   */
  static context<Result>(
    context: ChangesEvent.Context,
    callback: () => Result,
  ): Result extends Promise<infer PromisedResult>
    ? Promise<PromisedResult>
    : Result {
    this.#context.push(context);
    const result = callback();
    // TODO: Add tests
    if (result instanceof Promise) {
      // @ts-ignore TODO:
      return result.finally(() => {
        this.#context.pop();
      });
    }

    this.#context.pop();
    // @ts-ignore TODO:
    return result;
  }

  /** Changes bitmask. */
  changes: FieldChange;

  /** Context record. */
  context: ChangesEvent.Context = {};

  /**
   * Creates a new changes event.
   *
   * @param changes - Changes that happened.
   */
  constructor(changes: FieldChange, context?: ChangesEvent.Context) {
    super("change");

    // TODO: Join context building with the batched context so it's computed
    // in the same place.
    // TODO: Add tests
    if (!context) {
      context = {};
      for (const ctx of ChangesEvent.#context) {
        Object.assign(context, ctx);
      }
    }

    Object.assign(this.context, context);
    this.changes = changes;
  }
}

export namespace ChangesEvent {
  export type Batch = Map<EventTarget, [FieldChange, Context]>;

  export type Context = Record<string | number | symbol, any>;
}

//#endregion

//#region Changes

//#region Bitmask

/**
 * Field change type. It aliases the `bigint` type to represent the changes
 * type.
 */
// TODO: Consider making it opaque.
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
 * Field changes mask. It allows to isolate the field changes bits.
 */
export const fieldChangesMask = 2n ** changesBits - 1n;

/**
 * Structural field changes mask. It allows to isolate the structural field
 * changes bits.
 */
export const structuralFieldChangesMask = 2n ** structuralChangesBits - 1n;

/**
 * Meta field changes mask. It allows to isolate the meta field changes bits.
 */
export const metaFieldChangesMask =
  (2n ** metaChangesBits - 1n) << structuralChangesBits;

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
  key: takeBit(),
  /** Current field value committed as initial. */
  // TODO: Utilize this flag
  commit: takeBit(),
  /** Field value reset to initial. */
  // TODO: Utilize this flag
  reset: takeBit(),
  /** Field become invalid. */
  invalid: takeBit(),
  /** Field become valid. */
  valid: takeBit(),
  /** Errors change. A new error was inserted or removed. */
  errors: takeBit(),
  /** Field lost focus. */
  blur: takeBit(),

  //#endregion
};

if (process.env.NODE_ENV !== "production") {
  // Test the changes bits overflow.
  const bits = BigInt(Object.keys(fieldChange).length);
  if (bits > changesBits)
    throw new Error(
      `Field changes bits overflow. Maximum changes bits is ${changesBits} but got ${bits}.`,
    );
}

/**
 * Field change map. It maps the human-readable field change names to
 * the corresponding bit mask.
 */
// NOTE: Without using this type to define `childChange` and `subtreeChange`,
// the LSP actions such as "rename" will not work.
export type FieldChangeMap = typeof fieldChange;

/**
 * Child changes shift.
 */
export const childChangesShift = changesBits;

/**
 * Child changes bits mask. It allows to isolate the child changes bits.
 */
export const childChangesMask =
  (2n ** (changesBits + childChangesShift) - 1n) & ~fieldChangesMask;

/**
 * Structural child changes mask. It allows to isolate the structural child
 * changes bits.
 */
export const structuralChildChangesMask =
  structuralFieldChangesMask << childChangesShift;

/**
 * Meta child changes mask. It allows to isolate the meta child changes bits.
 */
export const metaChildChangesMask = metaFieldChangesMask << childChangesShift;

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
 * Subtree changes bits mask. It allows to isolate the subtree changes bits.
 */
export const subtreeChangesMask =
  (2n ** (changesBits + subtreeChangesShift) - 1n) &
  ~(fieldChangesMask | childChangesMask);

/**
 * Structural subtree changes mask. It allows to isolate the structural subtree
 * changes bits.
 */
export const structuralSubtreeChangesMask =
  structuralFieldChangesMask << subtreeChangesShift;

/**
 * Meta subtree changes mask. It allows to isolate the meta subtree changes
 * bits.
 */
export const metaSubtreeChangesMask =
  metaFieldChangesMask << subtreeChangesShift;

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
 * Structural changes mask. It allows to isolate the structural changes bits on
 * all levels.
 */
export const structuralChangesMask =
  structuralFieldChangesMask |
  structuralChildChangesMask |
  structuralSubtreeChangesMask;

/**
 * Meta changes mask. It allows to isolate the meta changes bits on all levels.
 */
export const metaChangesMask =
  metaFieldChangesMask | metaChildChangesMask | metaSubtreeChangesMask;

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

//#endregion

//#region Manipulations

/**
 * Shifts field changes to child changes. The subtree changes get merged with
 * existing subtree changes.
 *
 * @param changes - Changes to shift.
 */
export function shiftChildChanges(changes: FieldChange): FieldChange {
  const subtreeChanges = isolateSubtreeChanges(changes);
  return ((changes & ~subtreeChanges) << childChangesShift) | subtreeChanges;
}

/**
 * Isolates the field changes from the changes map.
 *
 * @param changes - Changes to isolate the field changes from.
 * @returns Isolated field changes.
 */
export function isolateFieldChanges(changes: FieldChange): FieldChange {
  return changes & fieldChangesMask;
}

/**
 * Isolates the child changes from the changes map.
 *
 * @param changes - Changes to isolate the child changes from.
 * @returns Isolated child changes.
 */
export function isolateChildChanges(changes: FieldChange): FieldChange {
  return changes & childChangesMask;
}

/**
 * Isolates the field changes from the changes map.
 *
 * @param changes - Changes to isolate the subtree changes from.
 * @returns Isolated subtree changes.
 */
export function isolateSubtreeChanges(changes: FieldChange): FieldChange {
  return changes & subtreeChangesMask;
}

//#endregion

//#region Checks

/**
 * Checks if child changes affect field shape and returns shape change if so.
 *
 * @param changes - Changes to check.
 * @returns Shape change if child changes affect field shape or `0n` otherwise.
 */
export function shapeChanges(changes: FieldChange): FieldChange {
  return (
    maskedChanges(
      changes,
      change.child.attach | change.child.detach | change.child.key,
    ) && fieldChange.shape
  );
}

/**
 * Isolates structural changes.
 *
 * @param changes - Changes to check.
 * @returns Isolates structural changes if found or `0n` otherwise.
 */
export function structuralChanges(changes: FieldChange): FieldChange {
  return changes & structuralChangesMask;
}

/**
 * Isolates meta changes.
 *
 * @param changes - Changes to check
 * @returns Isolated meta changes if found or `0n` otherwise.
 */
export function metaChanges(changes: FieldChange): FieldChange {
  return changes & metaChangesMask;
}

/**
 * Checks if changes contain any of changes in the given mask.
 *
 * @param changes - Changes to check.
 * @param mask - Changes mask to check against.
 * @returns Detected changes if found or `0n` otherwise.
 */
export function maskedChanges(
  changes: FieldChange,
  mask: FieldChange,
): FieldChange {
  return changes & mask;
}

//#endregion

//#endregion

//#region Private

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
function takeBit(): FieldChange {
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
    [`reserved${bitIdx + 1n}`]: takeBit(),
  };
}

//#endregion
