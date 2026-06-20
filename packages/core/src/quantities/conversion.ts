/**
 * @file Unit conversion functions.
 */

import type {
	Denominator,
	Numerator,
	QuantityString,
	UnitString,
} from "../types.ts";
import type Quantity from "./constructor.ts";
import { ensureQuantity } from "./constructor.ts";
import { IncompatibleUnitsError, QuantityError } from "./error.ts";
import { divideSafely, multiplySafely, roundSafely } from "./math.ts";
import { identity, isNumber, isString } from "./predicates.ts";
import type UnitRegistry from "./registry.ts";
import { TEMPERATURE_SIGNATURE } from "./signature.ts";
import {
	toDegrees,
	toTemperature,
	toTemperatureInKelvin,
} from "./temperature.ts";

/**
 * A converter predicate that maps a single numeric value.
 */
interface ConverterSingleFunction {
	(value: number): number;
}

/**
 * A converter predicate that maps either a single number or an array of numbers.
 */
interface ConverterFunction extends ConverterSingleFunction {
	(value: number[]): number[];
}

/**
 * Base scalar and signature pair computed for a quantity.
 */
interface BaseValues {
	baseScalar: number;
	signature: number;
}

/**
 * Computes the display scalar for a base expansion, adjusting the scalar to match any prefixed units present in the unit arrays.
 *
 * @param scalar The absolute base scalar to adjust.
 * @param numerator Base numerator tokens.
 * @param denominator Base denominator tokens.
 * @param registry Registry used to resolve prefix values.
 *
 * @returns The scalar adjusted for prefixed units.
 */
function computeDisplayScalar(
	scalar: number,
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
	registry: UnitRegistry,
): number {
	const afterNumerator = numerator
		.filter((token) => registry.isPrefix(token))
		.reduce(
			(result, token) =>
				divideSafely(result, registry.getPrefixValue(token)),
			scalar,
		);

	return denominator
		.filter((token) => registry.isPrefix(token))
		.reduce(
			(result, token) =>
				multiplySafely(result, registry.getPrefixValue(token)),
			afterNumerator,
		);
}

/**
 * Converts quantity to the target units or to units of the provided {@link Quantity}.
 *
 * @param self Quantity to convert.
 * @param input Target units, or a quantity whose units to convert to.
 *
 * @returns A new {@link Quantity} expressed in the target units.
 *
 * @throws {QuantityError} Units are incompatible.
 */
export function toUnits(
	self: Quantity,
	input?: UnitString | Quantity,
): Quantity {
	if (input === undefined || input === null) return self;

	if (!isString(input)) return toUnits(self, input.units());

	// * instantiating target to normalize units
	const target = ensureQuantity(input, self);

	if (target.units() === self.units()) return self;

	if (!self.isCompatible(target)) {
		if (self.isInverse(target)) return toUnits(self.invert(), input);

		throw new IncompatibleUnitsError(self.units(), target.units());
	}

	if (target.isTemperature()) return toTemperature(self, target);
	if (target.isDegrees()) return toDegrees(self, target);

	return new (self.constructor as typeof Quantity)({
		scalar: divideSafely(self.baseScalar, target.baseScalar),
		numerator: target.numerator,
		denominator: target.denominator,
	});
}

/**
 * Calculates the base scalar and signature for a quantity.
 *
 * @internal
 *
 * @param self Bound {@link Quantity}.
 *
 * @returns The base scalar and signature for the quantity.
 */
export function _toBaseValues(self: Quantity): BaseValues {
	if (self.isBase())
		return {
			baseScalar: self.scalar,
			signature: self.registry.getSignature(
				self.numerator,
				self.denominator,
			),
		};

	if (self.isTemperature()) {
		// * temperature requires special handling
		const base = toTemperatureInKelvin(self);

		return {
			baseScalar: base.scalar,
			signature: base.signature ?? TEMPERATURE_SIGNATURE,
		};
	}

	const expanded = self.registry.expandToBase(
		self.numerator,
		self.denominator,
	);

	const baseScalar = multiplySafely(expanded.scalar, self.scalar);

	const signature = self.registry.getSignature(
		expanded.numerator,
		expanded.denominator,
	);

	return { baseScalar, signature };
}

/**
 * Converts quantity to base SI units.
 *
 * @param self Quantity to convert.
 *
 * @returns A new {@link Quantity} expressed in base SI units.
 */
export function toBase(self: Quantity): Quantity {
	if (self.isBase()) return self;

	if (self.isTemperature()) return toTemperatureInKelvin(self);

	const cached = self.registry.expandToBase(self.numerator, self.denominator);

	const displayScalar = computeDisplayScalar(
		multiplySafely(cached.scalar, self.scalar),
		cached.numerator,
		cached.denominator,
		self.registry,
	);

	return new (self.constructor as typeof Quantity)({
		scalar: displayScalar,
		numerator: cached.numerator,
		denominator: cached.denominator,
	});
}

/**
 * Extracts the scalar as a plain number if and only if the quantity is unitless.
 *
 * @returns Scalar.
 *
 * @throws {QuantityError} Can't convert quantity with units to float.  Use `Quantity().scalar` to get the value.
 */
export function toFloat(self: Quantity): number {
	if (self.isUnitless()) return self.scalar;

	throw new QuantityError(
		"toFloat(): Can't convert quantity with units to float.  Use `Quantity.scalar` to get the value.",
	);
}

/**
 * Snaps the scalar to the nearest multiple of a precision quantity.
 * Preserves units.
 *
 * @param self Quantity to round.
 * @param precision Precision step as a `Quantity`, `string`, or `number`.
 *
 * @returns A new {@link Quantity} rounded to the nearest multiple of the precision.
 *
 * @throws {QuantityError} On divide by zero or incompatible precision units.
 */
export function toPrecision(
	self: Quantity,
	precision: QuantityString | number | Quantity,
): Quantity {
	const quantity = isString(precision)
		? ensureQuantity(precision, self)
		: isNumber(precision)
			? new (self.constructor as typeof Quantity)(
					`${precision} ${self.units()}`,
				)
			: precision;

	const normalized = self.isUnitless()
		? quantity
		: quantity.toUnits(self.units());

	if (normalized.scalar === 0)
		throw new QuantityError("toPrecision(): Attempted to divide by zero");

	const roundedScalar = multiplySafely(
		roundSafely(self.scalar / normalized.scalar),
		normalized.scalar,
	);

	return new (self.constructor as typeof Quantity)(
		roundedScalar + self.units(),
	);
}

/**
 * Creates a fast converter function from source units to destination units.
 *
 * @param sourceUnits Units to convert from.
 * @param destinationUnits Units to convert to.
 *
 * @returns A converter function accepting a number or an array of numbers.
 *
 * @example
 *   const convert = swiftConverter("m/h", "ft/s");
 *   convert([1000, 2000]) // => [...]
 */
export function swiftConverter(
	this: typeof Quantity,
	sourceUnits: UnitString,
	destinationUnits: UnitString,
): ConverterFunction {
	const source = new this(sourceUnits);
	const destination = new this(destinationUnits);

	if (source.equals(destination)) return identity;

	const convert: ConverterSingleFunction = source.isTemperature()
		? (value) => source.multiply(value).toUnits(destination).scalar
		: (value) => (value * source.baseScalar) / destination.baseScalar;

	return function converter(convertible: number | number[]) {
		if (Array.isArray(convertible))
			return convertible.map((value) => convert(value));

		return convert(convertible);
	} as ConverterFunction;
}
