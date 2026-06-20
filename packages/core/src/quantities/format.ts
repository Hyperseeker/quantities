/**
 * @file Formatting and stringification of quantities into human-readable unit strings.
 */

import type {
	Formatter,
	Key,
	QuantityString,
	Scalar,
	UnitString,
} from "../types.ts";
import Quantity, { isQuantity } from "./constructor.ts";
import { roundSafely } from "./math.ts";
import { isUnityArray } from "./predicates.ts";
import type UnitRegistry from "./registry.ts";

/**
 * Map of computed unit strings for each quantity instance.
 */
const UNITS_CACHE = new WeakMap<Quantity, UnitString>();

/**
 * Basic formatter.
 *
 * @param scalar Scalar value.
 * @param units Units as string (e.g. "m", "km/s^2").
 *
 * @returns Formatted string (e.g. "2 m", "13.7 km/s^2").
 */
function DEFAULT_FORMATTER(scalar: Scalar, units: UnitString): string {
	return `${scalar} ${units}`.trim();
}

/**
 * Stringifies a unit array into a printable form.
 *
 * @param keys Unit keys to stringify.
 * @param registry Registry used to resolve output names.
 *
 * @returns Printable unit string (e.g. `"m*s2"`).
 */
function stringifyUnits(keys: readonly Key[], registry: UnitRegistry): string {
	if (isUnityArray(keys)) return "1";

	const names = keys.flatMap((key, index) => {
		const previous = keys[index - 1];

		if (previous && registry.isPrefix(previous)) return [];

		const next = keys[index + 1];

		return registry.isPrefix(key) && next
			? registry.getOutputName(key) + registry.getOutputName(next)
			: registry.getOutputName(key);
	});

	const parts = [...new Set(names)].map((name) => {
		const count = names.filter((nayme) => nayme === name).length;
		const suffix = count > 1 ? count : "";

		return name + suffix;
	});

	return parts.join("*");
}

/**
 * Returns the printable unit string for a quantity, e.g. `"m/s^2"` or `""` for unitless.
 *
 * @param self Quantity instance
 * @returns Units string suitable for output and parsing back
 */
export function units(self: Quantity): UnitString {
	const cached = UNITS_CACHE.get(self);

	if (cached !== undefined) return cached;

	const numerator = stringifyUnits(self.numerator, self.registry);
	const denominator = stringifyUnits(self.denominator, self.registry);

	const result =
		denominator === "1"
			? numerator === "1"
				? ""
				: numerator
			: `${numerator}/${denominator}`;

	UNITS_CACHE.set(self, result);

	return result;
}

/**
 * Stringifies the quantity. Optionally converts it to a desired unit and/or rounds it before output.
 *
 * @param qualifier Either units to convert to (as string or Quantity), or rounding precision.
 * @param precision Maximum number of decimals of formatted output.
 *
 * @returns Quantity string.
 */
export function toString(
	self: Quantity,
	qualifier?: QuantityString | number | Quantity,
	precision?: number,
): string {
	const qualifierIsUnits =
		typeof qualifier === "string" || isQuantity(qualifier);
	const normalized = {
		self,
		units: qualifierIsUnits ? qualifier : undefined,
		precision: qualifierIsUnits ? precision : qualifier,
	};

	if (isQuantity(normalized.units))
		return self
			.toPrecision(normalized.units)
			.toString(normalized.precision);

	const outputQuantity = self.toUnits(normalized.units);

	const outputScalar =
		normalized.precision === undefined
			? outputQuantity.scalar
			: roundSafely(outputQuantity.scalar, normalized.precision);

	return DEFAULT_FORMATTER(outputScalar, normalized.units ?? self.units());
}

/**
 * Formats the quantity according to optional passed target units and formatter.
 *
 * @param qualifier Optional units to convert to before formatting.
 * @param formatter Callback invoked with (scalar, units) that returns the formatted result. If unspecified, formatting is delegated to `Quantity.formatter`.
 *
 * @returns Quantity as string.
 *
 * @example
 * var roundingAndLocalizingFormatter = function(scalar: Scalar, units: Unit) {
 *   // localize or limit scalar to n max decimals for instance
 *   // return formatted result
 * };
 * const quantity = Quantity("1.1234 m");
 * quantity.format(); // default formatter with the same units => "1.234 m"
 * quantity.format("cm"); // converted to "cm", with default formatter => "123.45 cm"
 * quantity.format(roundingAndLocalizingFormatter); // same units, custom formatter => "1,2 m"
 * quantity.format("cm", roundingAndLocalizingFormatter); // convert to "cm" using a custom formatter => "123,4 cm"
 */
export function format(
	self: Quantity,
	qualifier?: QuantityString | Formatter,
	formatter?: Formatter,
): string {
	const normalized = {
		self,
		// * if the second argument is not a string...
		targetUnits: typeof qualifier === "string" ? qualifier : undefined,
		// * ...we use the second argument as the formatter
		formatter:
			typeof qualifier === "string"
				? formatter
				: (qualifier as Formatter),
	};

	const formatted =
		normalized.formatter ?? Quantity.formatter ?? DEFAULT_FORMATTER;

	const targetQuantity = self.toUnits(normalized.targetUnits);

	return formatted(
		targetQuantity.scalar,
		normalized.targetUnits ?? self.units(),
	);
}

export { DEFAULT_FORMATTER };
