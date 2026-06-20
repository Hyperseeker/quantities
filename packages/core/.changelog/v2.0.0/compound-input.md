# Compound input

Quantities now accept multi-unit string inputs for compatible units, such as `6 ft 4 in` or `1 hour 30 minutes`.

Multi-unit inputs are equivalent to several combined single-unit quantities: `Quantity("2 km 500 m")` === `Quantity("2 km").add(Quantity("500 m"))`. Units of any complexity can be used for multi-unit input, provided they are compatible with each other. Incompatible units will throw an error: `Quantity("2 m 2 s")` will error, while `Quantity("2 m/s 2 km/h")` is valid.

The resulting quantity will use the units of the first pair as its unit, and convert all subsequent pairs to that unit: in `Quantity("2 m/s 2 km/h")`, the unit will be `m/s`, and the scalar `2.5555555555555554`. (You can use `.toPrecision()` to compact the decimals to the desired precision on output.)

This is consistent with the parsing available in the original `ruby-units` library, of which `js-quantities` was a port, but expanded to cover any related units. `js-quantities` itself lacks this form of parsing.

To output a given quantity as a compound string, use `.toCompound()` from `@quantities/to-compound`.
