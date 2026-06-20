/**
 * @file Tests quantity behavior at extreme/boundary values.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("extreme values handling", () => {
	it("should handle extremely long strings without hanging", () => {
		const veryLongString = "m".repeat(10000);
		const startTime = Date.now();

		try {
			Quantity(veryLongString);
		} catch {
			// * expected to throw
		}

		const duration = Date.now() - startTime;

		expect(duration).toBeLessThan(1000);
	});

	it("should handle deeply nested exponents without stack overflow", () => {
		const deeplyNested = "m^2^2^2^2^2^2^2^2";

		expect(() => {
			Quantity(deeplyNested);
		}).toThrow();
	});
});
