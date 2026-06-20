/**
 * @file Tests for handling `e` correctly.
 */

import { createRegistry, withRegistry } from "@quantities/registry";
import { describe, expect, it } from "bun:test";
import { elementaryCharge } from "../charge.ts";
import { electronvolt } from "../energy.ts";

/**
 * Test registry containing `e` and `eV` units.
 */
const REGISTRY = createRegistry([elementaryCharge, electronvolt]);

/**
 * Test `Quantity` with the test units.
 */
const { default: Quantity } = withRegistry(REGISTRY);

describe("elementary charge (#141)", () => {
	it("should be parsed", () => {
		expect(Quantity("e").equals(Quantity("1.602176634e-19 C"))).toBe(true);
		expect(Quantity("1e").equals(Quantity("1.602176634e-19 C"))).toBe(true);
		expect(Quantity("1 e").equals(Quantity("1.602176634e-19 C"))).toBe(
			true,
		);
		expect(Quantity(1, "e").equals(Quantity("1.602176634e-19 C"))).toBe(
			true,
		);
		expect(Quantity("e2").isCompatible(Quantity("C^2"))).toBe(true);
	});

	it("should match electronvolt (eV) definition", () => {
		expect(
			Quantity("1 e").multiply(Quantity("1 V")).equals(Quantity("1 eV")),
		).toBe(true);
	});
});
