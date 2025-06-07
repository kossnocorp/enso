# Enso

🚧 Work in progress

## Glossary

- **Field**: [TODO]

  **Field types**:

  Here we refer to regular fields as "normal" whereas everywhere else simply say "field".

  - **Computed field**: A field that is derived from a normal field (**source field** in this context). It defines rules for computing its value based on the normal field value and other data, and how it is converted back when the computed value is changed.

  - **Detached field**: A field that doesn't represent data, but still **accessible** through the tree API, e.g., `arr[42]` in `arr = ["a", "b", "c"]`. It allows to listen to its changes, alas won't receive any until it is attached to a normal field, e.g. when it is set `arr[42] = "x"`.

  - **Shadow field**: A field that is not attached to a normal field and also **not** **accessible** through the tree API, e.g., `obj["x"]["y"]` in `obj : { x?: { y?: string } } = {}`. It doesn't have any code representation except for the **tree path**, but referred to when working with **maybe field references**. It may have associated **validation errors**, e.g., when a field must set to specific value when another condition is met, but it is nested into an **optional tree**

  - **Field reference**: A readonly field wrapper around a normal field that is used during validation.

  - **Maybe field reference**: Similar to normal **reference**, but it can point to a **shadow field**. It refers to a **accessible field** or a **shadow field** by its **tree path**.

  **Field properties**:

  - **Accessible field**: A field that is accessible through normal field **tree** API, i.e. `$` or `at`. A **detached** field is still accessible, while a **shadow** field referenced by a **maybe field reference** is not.

  - **Source field**: A field that is used as a source for a **computed field**. It can be a normal, a **detached** or a **computed** field.

- **Tree**: [TODO]

  **Tree concepts**:

  - **Tree path**: A path to a field in the tree, e.g., `["x", "y"]` in `obj : { x: { y: string } }`. It is used to access and refer to **fields** in the tree.

- **Validation error**: [TODO]

### Supporting Terms

While not directly related to the Enso library nor its implementation, these terms are helpful when discussing the library behavior or other concepts.

- **Optional tree**: A tree where all fields are defined as optional, e.g., `{ x?: { y?: string } }`.

## Changelog

See [the changelog](./CHANGELOG.md).

## License

[MIT © Sasha Koss](https://kossnocorp.mit-license.org/)
