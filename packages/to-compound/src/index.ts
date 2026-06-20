/**
 * @file `toCompound` Quantity extension: registers compound formatting.
 */

import type Quantity from "@quantities/core";
import type { CompoundFormatOptions } from "./to-compound.ts";
import { toCompound } from "./to-compound.ts";

/**
 * Options for compound formatting.
 */
export interface ToCompoundOptions extends CompoundFormatOptions {
	metricPrefixPowerStep?: 1 | 3;
}

/**
 * Name of the extension method added to `Quantity`.
 */
const name = "toCompound" as const;

/**
 * Extension descriptor consumed by `Quantity.extend()`.
 */
const EXTENSION = {
	name,
	method,
};

/**
 * Formats this quantity as a compound string.
 */
function method(
	this: Quantity,
	targetUnits?: string[],
	options?: ToCompoundOptions,
): string {
	return toCompound(this, targetUnits, options);
}

export default EXTENSION;

declare module "@quantities/core" {
	interface Quantity {
		toCompound(targetUnits?: string[], options?: ToCompoundOptions): string;
	}
}
