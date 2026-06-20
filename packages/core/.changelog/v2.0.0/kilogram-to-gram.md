# Kilogram → gram as base weight

The base unit of weight in the library is now `<gram>`, rather than `<kilogram>`. While misaligned against SI, it is necessary for internal consistency. All output values are preserved accurately.

All uses of `<kilogram>` are replaced with `<kilo>, <gram>`, which is equivalent. All units that used to be defined in `<kilogram>` have been defined with either imperial/US units (see: [non-metric unit definitions](non-metric-unit-definitions.md)) or with `<kilo>, <gram>`. Extensive testing ensured that no unintended side effects occur as a result of this change.

Folding values would previously produce nonsensical results: e.g. `1 ukg` where `1 g` was appropriate. Handling this while maintaining `<kilogram>` would require special cases. We've decided against the added mental load and for streamlining the system.

As a result of this change, the unit `<kilogram>` has been removed entirely. `kg` is now parsed as `<kilo>, <gram>`.
