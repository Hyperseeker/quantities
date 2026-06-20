/**
 * @file Core functionality of the package.
 */

import type { Aliases, Kind, UnitEntry, UnitMap } from "@quantities/core";
import Quantity, { DEFAULT_REGISTRY, UnitRegistry } from "@quantities/core";
import {
	checkPrefixAliasCollisions,
	checkUnitAliasCollisions,
	detectCycles,
	validatePrefixEntry,
	validateReferences,
	validateScalar,
	validateUnitEntry,
} from "./validation.ts";

/**
 * A {@link Quantity} constructor bound to a custom registry, with registry helpers.
 */
interface RegistryBinding {
	default: typeof Quantity;
	getUnits: (kind?: string) => Kind[];
	getAliases: (name: string) => Aliases;
}

/**
 * Creates a custom unit registry.
 *
 * @param units Unit definitions to add to the registry. Accepts a single entry, a flat array, or an array of arrays.
 * @param source Base registry to extend from. If a registry is not provided, defaults to using the default registry (i.e. one from `@quantities/core`).
 *
 * @returns A new {@link UnitRegistry} with validated units.
 */
export function createRegistry(
	units?: UnitEntry | UnitEntry[] | (UnitEntry | UnitEntry[])[],
	source: UnitRegistry | null = DEFAULT_REGISTRY,
): UnitRegistry {
	const baseUnits: UnitMap = source ? structuredClone(source.units) : {};

	if (units) {
		const entries = [units].flat(2);

		for (const entry of entries) {
			validateScalar(entry.scalar, entry.key);

			baseUnits[entry.key] =
				entry.kind === "prefix"
					? [entry.aliases, entry.scalar, "prefix"]
					: [
							entry.aliases,
							entry.scalar,
							entry.kind,
							// * a `UnitEntry` without an explicit numerator registers a new base unit
							entry.numerator ?? [entry.key],
							entry.denominator,
						];
		}

		for (const entry of entries)
			if (entry.numerator || entry.denominator)
				validateReferences(
					entry.key,
					entry.numerator,
					entry.denominator,
					baseUnits,
				);

		detectCycles(baseUnits);

		checkUnitAliasCollisions(baseUnits);
		checkPrefixAliasCollisions(baseUnits);
	}

	return new UnitRegistry(baseUnits);
}

/**
 * Creates a Quantity constructor bound to a custom registry.
 *
 * @param registry Custom unit registry to use.
 *
 * @returns Object with default `Quantity` constructor and helper methods.
 */
export function withRegistry(registry: UnitRegistry): RegistryBinding {
	class CustomQuantity extends Quantity {
		static registry = registry;

		constructor(...args: ConstructorParameters<typeof Quantity>) {
			super(...args);
		}
	}

	const Qustom = new Proxy(CustomQuantity, {
		apply(
			target,
			_,
			args: ConstructorParameters<typeof CustomQuantity>,
		): CustomQuantity {
			return new target(...args);
		},
	});

	return {
		default: Qustom as typeof Quantity,
		getUnits: (kind?: string): Kind[] => registry.getUnits(kind),
		getAliases: (name: string): Aliases => registry.getAliases(name),
	};
}

export {
	checkPrefixAliasCollisions,
	checkUnitAliasCollisions,
	detectCycles,
	validatePrefixEntry,
	validateReferences,
	validateScalar,
	validateUnitEntry,
};
