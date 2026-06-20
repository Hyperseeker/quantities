# Exponents and roots

Quantities can be exponentiated and have their roots extracted.

`Quantity(quantity).pow(power: number)`, alias `.exponent(power: number)`, allows raising a unit or a unitless value to the exponent:

- `Quantity("2 m").pow(2)` → `Quantity("4 m2")`
- `Quantity(6).pow(3)` → `Quantity(216)`
- `Quantity("5").exponent(2)` → `Quantity(25)`

The behavior of these methods is consistent with JavaScript's native `Math.pow()`. Note that there are a few additional limitations in place related to unit math:

- cannot raise a unit value to a non-integer power: e.g. `Quantity("2 m").exponent(2.5)`
- cannot raise a negative unitless value to a non-integer power: e.g. `Quantity(-2).pow(2.5)`
- cannot raise a zero unit value to a negative power: e.g. `Quantity("0 m").exponent(-2)`

`Quantity(quantity).root(power: number)` allows extracting the Nth root from the quantity. `Quantity(quantity).sqrt()` and `Quantity.cbrt()` are available as shorthands for `.root(2)` and `.root(3)`, respectively:

- `Quantity("9 m2").root(2)` === `Quantity("9 m2").sqrt()` → `Quantity("3 m")`
- `Quantity("8 m3").root(3)` === `Quantity("8 m3").cbrt()` → `Quantity("2 m")`

These methods' behavior is consistent with JavaScript's native `Math.pow()` where the exponent is defined as `1 / exponent`. For cases of `.root(2)` and `.root(3)`, the methods use `Math.sqrt()` and `Math.cbrt()`, respectively, which produce more-accurate results. Odd roots of negative quantities are supported (e.g. `Quantity("-8 m3").cbrt()` → `Quantity("-2 m")`), but even roots of negative quantities are not, as these produce complex numbers. Like for `.pow()`, unit exponents must be evenly divisible by the root power.

In addition, both exponentiation and root extraction put extra limits on operations with temperatures. This is consistent with how the rest of the library handles temperature units. Specifically, only `.pow(0)` and `.pow(1)`, as well as `.root(1)`, are allowed on any temperature.
