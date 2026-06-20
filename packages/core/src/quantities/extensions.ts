/**
 * @file Registers user-defined extension methods on the Quantity prototype.
 */

import type { QuantityExtension } from "../types.ts";
import type Quantity from "./constructor.ts";
import { QuantityError } from "./error.ts";

/**
 * Registers extension methods on the Quantity prototype.
 *
 * @param extensions Extension descriptors to register.
 *
 * @returns The Quantity constructor, for chaining.
 *
 * @throws {QuantityError} if a method is not a function or collides with an existing property.
 */
export function extend(
	this: typeof Quantity,
	...extensions: QuantityExtension[]
): typeof Quantity {
	for (const extension of extensions) {
		if (typeof extension.method !== "function")
			throw new QuantityError(
				`Quantity.extend(): \`${extension.name}\` method must be a function`,
			);

		const existing = Object.getOwnPropertyDescriptor(
			this.prototype,
			extension.name,
		);

		if (existing) {
			// * if extension was already added, ignore it
			if (existing.value === extension.method) continue;

			throw new QuantityError(
				`Quantity.extend(): \`${extension.name}\` with different value already exists on Quantity`,
			);
		}

		Object.defineProperty(this.prototype, extension.name, {
			value: extension.method,
			writable: true,
			configurable: true,
			enumerable: false,
		});
	}

	return this;
}
