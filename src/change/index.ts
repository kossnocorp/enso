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
  static batch(target: EventTarget, changes: AtomChange) {
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
    if (changes & atomChange.valid && batchedChanges & atomChange.invalid)
      newChanges &= ~atomChange.invalid;
    if (changes & atomChange.invalid && batchedChanges & atomChange.valid)
      newChanges &= ~atomChange.valid;

    // attach/detach
    if (changes & atomChange.attach && batchedChanges & atomChange.detach)
      newChanges &= ~atomChange.detach;
    if (changes & atomChange.detach && batchedChanges & atomChange.attach)
      newChanges &= ~atomChange.attach;

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
  changes: AtomChange;

  /** Context record. */
  context: ChangesEvent.Context = {};

  /**
   * Creates a new changes event.
   *
   * @param changes - Changes that happened.
   */
  constructor(changes: AtomChange, context?: ChangesEvent.Context) {
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
  export type Batch = Map<EventTarget, [AtomChange, Context]>;

  export type Context = Record<string | number | symbol, any>;
}

//#endregion

//#region Changes

//#region Bitmask

/**
 * Atom change type. It aliases the `bigint` type to represent the changes
 * type.
 */
// TODO: Consider making it opaque.
export type AtomChange = bigint;

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
 * Atom changes mask. It allows to isolate the atom changes bits.
 */
export const atomChangesMask = 2n ** changesBits - 1n;

/**
 * Structural atom changes mask. It allows to isolate the structural atom
 * changes bits.
 */
export const structuralAtomChangesMask = 2n ** structuralChangesBits - 1n;

/**
 * Meta atom changes mask. It allows to isolate the meta atom changes bits.
 */
export const metaAtomChangesMask =
  (2n ** metaChangesBits - 1n) << structuralChangesBits;

/**
 * Bit index used to generate the next bit in the sequence.
 *
 * @private
 */
let bitIdx = 0n;

/**
 * Atom changes map.
 *
 * It represents the changes for the atom itself.
 */
export const atomChange = {
  //#region Structural changes

  // Changes that affect the inner value of the atom.

  /** Atom type changed. It indicates that atom type(array/object/number/etc.)
   * is now different. */
  type: takeBit(),
  /** Atom value changed. It applies only to primitive atom type as
   * object/array atoms value is a reference. */
  value: takeBit(),
  /** Atom attached (inserted) to object/array. Before it gets created
   * the atom might be in the detached state. */
  attach: takeBit(),
  /** Atom detached from object/array. Rather than removing, the atom will
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

  // Changes that affect the meta state of the atom.

  /** Atom id changed. It happens when the atom watched by a hook is replaced
   * with a new atom. */
  id: takeBit(),
  /** Atom key changed. It indicates that the atom got moved. It doesn't
   * apply to the atom getting detached and attached. */
  key: takeBit(),
  /** Current atom value committed as initial. */
  // TODO: Utilize this flag
  commit: takeBit(),
  /** Atom value reset to initial. */
  // TODO: Utilize this flag
  reset: takeBit(),
  /** Atom become invalid. */
  invalid: takeBit(),
  /** Atom become valid. */
  valid: takeBit(),
  /** Errors change. A new error was inserted or removed. */
  errors: takeBit(),
  /** Atom lost focus. */
  blur: takeBit(),

  //#endregion
};

/**
 * Atom change map. It maps the human-readable atom change names to
 * the corresponding bit mask.
 */
// NOTE: Without using this type to define `childChange` and `subtreeChange`,
// the LSP actions such as "rename" will not work.
export type AtomChangeMap = typeof atomChange;

/**
 * Child changes shift.
 */
export const childChangesShift = changesBits;

/**
 * Child changes bits mask. It allows to isolate the child changes bits.
 */
export const childChangesMask =
  (2n ** (changesBits + childChangesShift) - 1n) & ~atomChangesMask;

/**
 * Structural child changes mask. It allows to isolate the structural child
 * changes bits.
 */
export const structuralChildChangesMask =
  structuralAtomChangesMask << childChangesShift;

/**
 * Meta child changes mask. It allows to isolate the meta child changes bits.
 */
export const metaChildChangesMask = metaAtomChangesMask << childChangesShift;

/**
 * Child changes map.
 *
 * It represents the changes for the immediate children of the atom.
 */
export const childChange: AtomChangeMap = {
  ...atomChange,
};

// Shift child atom changes to its dedicated category bits range.
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
  ~(atomChangesMask | childChangesMask);

/**
 * Structural subtree changes mask. It allows to isolate the structural subtree
 * changes bits.
 */
export const structuralSubtreeChangesMask =
  structuralAtomChangesMask << subtreeChangesShift;

/**
 * Meta subtree changes mask. It allows to isolate the meta subtree changes
 * bits.
 */
export const metaSubtreeChangesMask =
  metaAtomChangesMask << subtreeChangesShift;

/**
 * Subtree changes map.
 *
 * It represents the changes for the deeply nested children of the atom.
 */
export const subtreeChange: AtomChangeMap = {
  ...atomChange,
};

// Shift child atom changes to its dedicated category bits range.
shiftCategoryBits(subtreeChange, subtreeChangesShift);

/**
 * Structural changes mask. It allows to isolate the structural changes bits on
 * all levels.
 */
export const structuralChangesMask =
  structuralAtomChangesMask |
  structuralChildChangesMask |
  structuralSubtreeChangesMask;

/**
 * Meta changes mask. It allows to isolate the meta changes bits on all levels.
 */
export const metaChangesMask =
  metaAtomChangesMask | metaChildChangesMask | metaSubtreeChangesMask;

/**
 * Atom changes map. Each bit indicates a certain type of change in the atom.
 *
 * The changes are represented as a bit mask, which allows to combine multiple
 * change types into a single value. BigInt is used to represent the changes
 * as bitwise operations on numbers convert their operands to 32-bit integers
 * and limit the available bits range.
 *
 * All changes are divided into three main categories:
 *
 * - **Atom changes** that affect the atom itself.
 * - **Child changes** that affect the immediate children of the atom.
 * - **Subtree changes** that affect the deeply nested children of the atom.
 *
 * We allocate first 48 bits (16*3) for the category changes.
 *
 * Each category bit further divided into subcategories (8 bits each):
 *
 * - **Structural changes** that affect the inner value of the atom.
 * - **Meta changes** that affect the meta state of the atom.
 *
 * Here is the visual representation of the changes map:
 *
 *   Subtree         Child           Atom
 *   v               v               v
 * 0b000000000000000000000000000000000000000000000000n
 *   ^       ^       ^       ^       ^       ^
 *   Meta    Struct. Meta    Struct. Meta    Struct.
 *
 * The structural atom changes range is exclusive meaning that only one of
 * the flags can be set at a time. This allows to simplify the logic and
 * make it easier to understand. Initially that was not the case and
 * `detach` and `attach` flags were always set with `type` change, but this
 * logic warrants always setting `value` flag as well. The possible combinations
 * made it harder to understand and test the logic, so it was decided to make
 * the structural changes exclusive.
 *
 * The meta atom changes as well as any child and subtree changes are not
 * exclusive and can be combined, as there might be multiple children having
 * conflicting changes i.e. `detach` and `attach` at the same time.
 */
export const change = {
  /** Atom changes that affect the atom itself. */
  atom: atomChange,
  /** Child changes that affect the immediate children of the atom. */
  child: childChange,
  /** Subtree changes that affect the deeply nested children of the atom. */
  subtree: subtreeChange,
};

//#endregion

//#region Manipulations

/**
 * Shifts atom changes to child changes. The subtree changes get merged with
 * existing subtree changes.
 *
 * @param changes - Changes to shift.
 */
export function shiftChildChanges(changes: AtomChange): AtomChange {
  const subtreeChanges = isolateSubtreeChanges(changes);
  return ((changes & ~subtreeChanges) << childChangesShift) | subtreeChanges;
}

/**
 * Isolates the atom changes from the changes map.
 *
 * @param changes - Changes to isolate the atom changes from.
 * @returns Isolated atom changes.
 */
export function isolateAtomChanges(changes: AtomChange): AtomChange {
  return changes & atomChangesMask;
}

/**
 * Isolates the child changes from the changes map.
 *
 * @param changes - Changes to isolate the child changes from.
 * @returns Isolated child changes.
 */
export function isolateChildChanges(changes: AtomChange): AtomChange {
  return changes & childChangesMask;
}

/**
 * Isolates the atom changes from the changes map.
 *
 * @param changes - Changes to isolate the subtree changes from.
 * @returns Isolated subtree changes.
 */
export function isolateSubtreeChanges(changes: AtomChange): AtomChange {
  return changes & subtreeChangesMask;
}

//#endregion

//#region Checks

/**
 * Checks if child changes affect atom shape and returns shape change if so.
 *
 * @param changes - Changes to check.
 * @returns Shape change if child changes affect atom shape or `0n` otherwise.
 */
export function shapeChanges(changes: AtomChange): AtomChange {
  return (
    maskedChanges(
      changes,
      change.child.attach | change.child.detach | change.child.key,
    ) && atomChange.shape
  );
}

/**
 * Isolates structural changes.
 *
 * @param changes - Changes to check.
 * @returns Isolates structural changes if found or `0n` otherwise.
 */
export function structuralChanges(changes: AtomChange): AtomChange {
  return changes & structuralChangesMask;
}

/**
 * Isolates meta changes.
 *
 * @param changes - Changes to check
 * @returns Isolated meta changes if found or `0n` otherwise.
 */
export function metaChanges(changes: AtomChange): AtomChange {
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
  changes: AtomChange,
  mask: AtomChange,
): AtomChange {
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
function shiftCategoryBits(changes: typeof atomChange, shift: bigint) {
  for (const key in atomChange) {
    changes[key as keyof typeof atomChange] <<= shift;
  }
}

/**
 * Takes the next bit in the sequence and increments the global `bitIdx`.
 *
 * @returns The next bit in the sequence.
 */
function takeBit(): AtomChange {
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
