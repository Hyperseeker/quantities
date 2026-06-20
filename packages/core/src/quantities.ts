/**
 * @file Public entry point: assembles the `Quantity` factory and exports the API.
 */

import QuantityClass from "./quantities/constructor.ts";
import { QuantityError } from "./quantities/error.ts";
import { DEFAULT_FORMATTER } from "./quantities/format.ts";
import {
	divideSafely,
	multiplySafely,
	roundSafely,
	subtractSafely,
} from "./quantities/math.ts";
import { isUnityArray } from "./quantities/predicates.ts";
import UnitRegistry, { DEFAULT_REGISTRY } from "./quantities/registry.ts";
import { TEMPERATURE_SIGNATURE } from "./quantities/signature.ts";
import { snap } from "./quantities/snap.ts";
import { SI_BASE_UNITS, UNITY } from "./quantities/units.ts";
import type {
	QuantityExtension,
	QuantityInitializer,
	UnitString,
} from "./types.ts";
import { objectEntries, objectKeys } from "./utils.ts";

/**
 * Extracts instance methods from extension descriptors for use in typed `.extend()`.
 */
type ExtractMethods<Extensions extends readonly QuantityExtension[]> = {
	[Entry in Extensions[number] as Entry["name"]]: OmitThisParameter<
		Entry["method"]
	>;
};

/**
 * A Quantity constructor. `Methods` carries any extension methods grafted on via `.extend()`.
 */
export type QuantityConstructor<Methods = unknown> = {
	(
		initialValue: QuantityInitializer,
		initialUnits?: UnitString,
	): Quantity & Methods;
	new (
		initialValue: QuantityInitializer,
		initialUnits?: UnitString,
	): Quantity & Methods;

	extend<const E extends QuantityExtension[]>(
		...extensions: E
	): QuantityConstructor<Methods & ExtractMethods<E>>;
} & WithExtendedReturns<Omit<typeof QuantityClass, "extend">, Methods>;

/**
 * Rewrites every base-`Quantity`-returning member of a constructor type so it returns the extended `Quantity & Methods` instead.
 */
type WithExtendedReturns<T, Methods> = {
	[Member in keyof T]: T[Member] extends (...args: infer Args) => infer Return
		? (...args: Args) => Return extends Quantity ? Return & Methods : Return
		: T[Member];
};

/**
 * Quantity instance type.
 *
 * Declaration merging lets `Quantity` be exported as both the type and the class.
 * Using `interface` gives `Quantity` its own identity for IDE hovers and lets polymorphic `this` resolve as `Quantity`.
 */
interface Quantity extends InstanceType<typeof QuantityClass> {}

// oxlint-disable-next-line frontier-style/require-jsdoc -- this value receives its docs from the merged interface
const Quantity = new Proxy(QuantityClass, {
	apply(
		target,
		_,
		args: ConstructorParameters<typeof QuantityClass>,
	): Quantity {
		return new target(...args) as Quantity;
	},
}) as QuantityConstructor;

/**
 * Current version of the library.
 */
export const VERSION = "2.0.0";

export type {
	Alias,
	Aliases,
	Denominator,
	Formatter,
	Key,
	Kind,
	Name,
	NonEmptyArray,
	Numerator,
	PrefixEntry,
	QuantityExtension,
	Scalar,
	UnitEntry,
	UnitMap,
	UnitString,
} from "./types.ts";

export {
	DEFAULT_FORMATTER,
	DEFAULT_REGISTRY,
	divideSafely,
	isUnityArray,
	multiplySafely,
	objectEntries,
	objectKeys,
	QuantityError,
	roundSafely,
	SI_BASE_UNITS,
	snap,
	subtractSafely,
	TEMPERATURE_SIGNATURE,
	UnitRegistry,
	UNITY,
};

export { QuantityClass };

export default Quantity;
