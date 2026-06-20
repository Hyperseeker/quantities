/**
 * @file Tests compatibility checks between quantities.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("isCompatible", () => {
	it("should return true with compatible quantities", () => {
		const metrical = Quantity("1 m*kg/s");
		const imperial = Quantity("1 in*pound/min");
		const speeeeed = Quantity("1 in/min");

		expect(metrical.isCompatible(imperial)).toBe(true);
		expect(metrical.isCompatible(speeeeed)).toBe(false);
	});

	it("should return true with dimensionless quantities", () => {
		const one = Quantity("1");
		const two = Quantity("2");

		expect(one.isCompatible(two)).toBe(true);
	});

	it("should throw with non-finite and non-quantities", () => {
		const metric = Quantity("1 m*kg/s");

		// @ts-expect-error `undefined` is used to verify results
		expect(() => metric.isCompatible(undefined)).toThrow();
		// @ts-expect-error `null` is used to verify results
		expect(() => metric.isCompatible(null)).toThrow();
		// @ts-expect-error empty object is used to verify results
		expect(() => metric.isCompatible({})).toThrow();
	});
});
