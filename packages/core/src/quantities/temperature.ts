/**
 * @file Temperature and degree conversion helpers between absolute scales and deltas.
 */

import type { Scalar, UnitString } from "../types.ts";
import type Quantity from "./constructor.ts";
import { ensureQuantity } from "./constructor.ts";
import { TemperatureConversionError } from "./error.ts";
import {
	addSafely,
	divideSafely,
	multiplySafely,
	subtractSafely,
} from "./math.ts";

/**
 * Names of the supported degree units.
 */
type Degree = "degC" | "degF" | "degR" | "degK";

/**
 * Names of the supported absolute temperature units.
 */
type Temperature = "tempC" | "tempF" | "tempR" | "tempK";

/**
 * Converts a Kelvin delta into a target degree scale.
 */
type DegreeConverter = (kelvin: Scalar) => Scalar;

/**
 * Converts a Kelvin scalar into a target temperature scale.
 */
type TemperatureConverter = (baseScalar: Scalar) => Scalar;

/**
 * Converts a temperature quantity into an absolute Kelvin scalar.
 */
type KelvinConverter = (quantity: Quantity) => Scalar;

/**
 * Map of `tempX` to `degX` correspondence.
 */
const TEMP_TO_DEGREE: Record<UnitString, UnitString> = {
	tempC: "degC",
	tempF: "degF",
	tempR: "degR",
	tempK: "degK",
};

/**
 * Map of degree→Kelvin converters.
 */
const TO_DEGREE_SCALAR: Record<Degree, DegreeConverter> = {
	degC: (kelvin) => kelvin,
	degF: (kelvin) => divideSafely(multiplySafely(kelvin, 9), 5),
	degR: (kelvin) => divideSafely(multiplySafely(kelvin, 9), 5),
	degK: (kelvin) => kelvin,
};

/**
 * Map of temperature→Kelvin converters.
 */
const TO_TEMPERATURE_SCALAR: Record<Temperature, TemperatureConverter> = {
	tempC: (baseScalar) => subtractSafely(baseScalar, 273.15),
	tempF: (baseScalar) =>
		subtractSafely(divideSafely(multiplySafely(baseScalar, 9), 5), 459.67),
	tempR: (baseScalar) => divideSafely(multiplySafely(baseScalar, 9), 5),
	tempK: (baseScalar) => baseScalar,
};

/**
 * Map of temperature→Kelvin converters.
 */
const TO_KELVIN_ABSOLUTE: Record<Temperature, KelvinConverter> = {
	tempC: (quantity) => addSafely(quantity.scalar, 273.15),
	tempF: (quantity) =>
		divideSafely(multiplySafely(addSafely(quantity.scalar, 459.67), 5), 9),
	tempR: (quantity) => divideSafely(multiplySafely(quantity.scalar, 5), 9),
	tempK: (quantity) => quantity.scalar,
};

/**
 * Resolves the degree unit corresponding to a temperature unit.
 *
 * @param unit Temperature unit to resolve.
 *
 * @returns The corresponding degree unit.
 *
 * @throws {TemperatureConversionError} when the unit has no degree equivalent.
 */
function getDegreeUnits(unit: UnitString): UnitString {
	const degree = TEMP_TO_DEGREE[unit];

	if (!degree) throw new TemperatureConversionError("from", unit);

	return degree;
}

/**
 * Builds a Kelvin-delta quantity from a quantity's base scalar.
 *
 * @param quantity Quantity to read the base scalar from.
 *
 * @returns A new degree quantity in Kelvin.
 */
function toDegreesKelvin(quantity: Quantity): Quantity {
	return new (quantity.constructor as typeof Quantity)({
		scalar: quantity.baseScalar,
		numerator: ["<kelvin>"],
	});
}

/**
 * Subtracts two temperatures returning a degrees quantity in the source temperature's degree units.
 *
 * @param source Temperature to subtract from.
 * @param destination Temperature to subtract.
 *
 * @returns A new degree quantity in the source's degree units.
 */
export function subtractTemperatures(
	source: Quantity,
	destination: Quantity,
): Quantity {
	const sourceUnits = source.units();

	const { numerator, denominator } = ensureQuantity(
		getDegreeUnits(sourceUnits),
		source,
	);

	return new (source.constructor as typeof Quantity)({
		scalar: subtractSafely(
			source.scalar,
			destination.toUnits(sourceUnits).scalar,
		),
		numerator,
		denominator,
	});
}

/**
 * Subtracts a degree delta from a temperature.
 * Keeps the temperature's units.
 *
 * @param self Temperature to subtract from.
 * @param source Degree delta to subtract.
 *
 * @returns A new temperature quantity in the original units.
 */
export function subtractTemperatureDegrees(
	self: Quantity,
	source: Quantity,
): Quantity {
	const temperatureDegrees = source.toUnits(getDegreeUnits(self.units()));

	return new (self.constructor as typeof Quantity)({
		scalar: subtractSafely(self.scalar, temperatureDegrees.scalar),
		numerator: self.numerator,
		denominator: self.denominator,
	});
}

/**
 * Adds a degree delta to a temperature.
 * Keeps the temperature's units.
 *
 * @param self Temperature to add to.
 * @param source Degree delta to add.
 *
 * @returns A new temperature quantity in the original units.
 */
export function addTemperatureDegrees(
	self: Quantity,
	source: Quantity,
): Quantity {
	const temperatureDegrees = source.toUnits(getDegreeUnits(self.units()));

	return new (self.constructor as typeof Quantity)({
		scalar: addSafely(self.scalar, temperatureDegrees.scalar),
		numerator: self.numerator,
		denominator: self.denominator,
	});
}

/**
 * Converts a temperature or degree quantity to target degree units (`deg[CFRK]`).
 *
 * @param source Temperature or degree quantity to convert.
 * @param destination Quantity whose degree units to convert to.
 *
 * @returns A new degree quantity in the destination units.
 */
export function toDegrees(source: Quantity, destination: Quantity): Quantity {
	// * we know this is appropriate typing because upstream validation means `destination` will always be a valid degree unit
	const destinationUnits = destination.units() as Degree;

	// * temperature sources use 0-relative delta (scalar × unit scale factor)
	// * degree sources already have a Kelvin delta as baseScalar
	const kelvinDelta = source.isTemperature()
		? multiplySafely(
				source.scalar,
				source.registry.getScalar(source.numerator[0]) ?? 1,
			)
		: toDegreesKelvin(source).scalar;

	return new (destination.constructor as typeof Quantity)({
		scalar: TO_DEGREE_SCALAR[destinationUnits](kelvinDelta),
		numerator: destination.numerator,
		denominator: destination.denominator,
	});
}

/**
 * Converts a quantity to an absolute temperature in the requested scale (`temp[CFRK]`).
 *
 * @param source Quantity to convert.
 * @param destination Quantity whose temperature units to convert to.
 *
 * @returns A new temperature quantity in the destination units.
 */
export function toTemperature(
	source: Quantity,
	destination: Quantity,
): Quantity {
	// * we know this will be valid because upstream validation means `target` will always be a valid temperature
	const target = destination.units() as Temperature;

	return new (destination.constructor as typeof Quantity)({
		scalar: TO_TEMPERATURE_SCALAR[target](source.baseScalar),
		numerator: destination.numerator,
		denominator: destination.denominator,
	});
}

/**
 * Converts any temperature or degree quantity to Kelvin (`temp-K`).
 *
 * @param quantity Quantity to convert.
 *
 * @returns A new temperature quantity in Kelvin.
 */
export function toTemperatureInKelvin(quantity: Quantity): Quantity {
	// * we know this typing is accurate because we only call this function on temperature operations
	const units = quantity.units() as Temperature;

	return new (quantity.constructor as typeof Quantity)({
		scalar: TO_KELVIN_ABSOLUTE[units](quantity),
		numerator: ["<temp-K>"],
	});
}
