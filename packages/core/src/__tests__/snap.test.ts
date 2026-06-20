/**
 * @file Test fixtures and cases for the snap numeric-cleanup function.
 */

import { describe, expect, it } from "bun:test";
import { snap } from "../quantities/snap.ts";

/** A single snap test case: input value, expected output, and a label. */
export type SnapCase = [value: number, expected: number, label: string];

/** Values that snap should clean up to a nearby canonical number. */
export const SHOULD_SNAP = {
	NEAR_INTEGER: [
		[1.0000000000000002, 1, "1.0000000000000002 → 1"],
		[2.9999999999999996, 3, "2.9999999999999996 → 3"],
		[-1.0000000000000002, -1, "-1.0000000000000002 → -1"],
		[1.000000001, 1, "1.000000001 → 1"],
		[1.00000000001, 1, "1.00000000001 → 1"],
		[1.0000000000001, 1, "1.0000000000001 → 1"],
		[1.000000000000001, 1, "1.000000000000001 → 1"],
		[2.0000000000001, 2, "2.0000000000001 → 2"],
	] as SnapCase[],

	ARITHMETIC: [
		[0.1 + 0.2, 0.3, "0.1 + 0.2 → 0.3"],
		[-(0.1 + 0.2), -0.3, "-(0.1 + 0.2) → -0.3"],
		[1.2 + 0.005, 1.205, "1.2 + 0.005 → 1.205"],
		[1.1 * 1.1, 1.21, "1.1 * 1.1 → 1.21"],
		[-1.1 * 1.1, -1.21, "-1.1 * 1.1 → -1.21"],
		[3.3 + 0.3, 3.6, "3.3 + 0.3 → 3.6"],
		[0.1 * 3, 0.3, "0.1 * 3 → 0.3"],
		[0.01 + 0.02, 0.03, "0.01 + 0.02 → 0.03"],
		[0.5000000000000001, 0.5, "0.5000000000000001 → 0.5"],
		[0.7000000000000001, 0.7, "0.7000000000000001 → 0.7"],
		[0.7 + 0.1, 0.8, "0.7 + 0.1 → 0.8"],
		[1.1 + 0.01, 1.11, "1.1 + 0.01 → 1.11"],
		[0.2 * 0.2, 0.04, "0.2 * 0.2 → 0.04"],
		[1.005 * 100, 100.5, "1.005 * 100 → 100.5"],
		[0.1 + 0.1 + 0.1, 0.3, "0.1 + 0.1 + 0.1 → 0.3"],
		[1.1 * 1.1 * 1.1, 1.331, "1.1 * 1.1 * 1.1 → 1.331"],
		[Math.sqrt(2) ** 2, 2, "√2² → 2"],
		[Math.sqrt(3) ** 2, 3, "√3² → 3"],
	] as SnapCase[],

	CONVERSION: [
		[3.280839895013124 * 0.3048, 1, "m → ft → m round-trip"],
		[-3.280839895013124 * 0.3048, -1, "negative m → ft → m round-trip"],
	] as SnapCase[],

	EPSILON: [
		[1 + Number.EPSILON, 1, "1 + ε → 1"],
		[1 - Number.EPSILON, 1, "1 - ε → 1"],
		[-1 - Number.EPSILON, -1, "-1 - ε → -1"],
	] as SnapCase[],

	SMALL_MAGNITUDE: [
		[1e-7 + 1e-15, 1e-7, "1e-7 + 1e-15 → 1e-7"],
		[1e-6 + 1e-14, 1e-6, "1e-6 + 1e-14 → 1e-6"],
		[1e-8 + 1e-16, 1e-8, "1e-8 + 1e-16 → 1e-8"],
		[-(1e-7 + 1e-15), -1e-7, "-(1e-7 + 1e-15) → -1e-7"],
		[6e-12 * 100_000, 6e-7, "6e-12 * 100000 → 6e-7"],
		[1e-7 + 2e-15, 1e-7, "1e-7 + 2e-15 → 1e-7"],
		[1e-7 + 5e-15, 1e-7, "1e-7 + 5e-15 → 1e-7"],
		[1e-7 + 1e-14, 1e-7, "1e-7 + 1e-14 → 1e-7"],
		[1.0000000000000002e-12, 1e-12, "nanofarad"],
		[5.0000001e-9, 5e-9, "5.0000001e-9"],
		[7.0000000100000005e-9, 7e-9, "7.0000000100000005e-9"],
		[
			6.674300000000007e-11,
			6.6743e-11,
			"gravitational constant with ε noise",
		],
	] as SnapCase[],

	LARGE_MAGNITUDE: [
		// eslint-disable-next-line no-loss-of-precision
		[999999999999.99999, 1000000000000, "999999999999.99999 → 1e12"],
		[(1e12 / 5280) * 5280, 1e12, "1e12 ft ↔ mi round-trip"],
		[(1e11 / 5280) * 5280, 1e11, "1e11 ft ↔ mi round-trip"],
		[(6e9 / 5280) * 5280, 6e9, "6e9 ft ↔ mi round-trip"],
		[(1e12 / 365.25) * 365.25, 1e12, "1e12 days ↔ years round-trip"],
	] as SnapCase[],

	SUBNORMAL: [[Number.MIN_VALUE, 0, "MIN_VALUE → 0"]] as SnapCase[],
};

/** Values that snap should preserve exactly without modification. */
export const SHOULD_PRESERVE = {
	MATHEMATICAL_CONSTANTS: [
		[Math.PI, Math.PI, "π unchanged"],
		[Math.E, Math.E, "e unchanged"],
		[Math.SQRT2, Math.SQRT2, "√2 unchanged"],
		[Math.LN2, Math.LN2, "ln(2) unchanged"],
		[Math.LOG10E, Math.LOG10E, "log10(e) unchanged"],
	] as SnapCase[],

	PHYSICAL_CONSTANTS: [
		[1.602176634e-19, 1.602176634e-19, "electron volt"],
		[6.62607015e-34, 6.62607015e-34, "Planck constant"],
		[1.380649e-23, 1.380649e-23, "Boltzmann constant"],
		[6.6743e-11, 6.6743e-11, "gravitational constant"],
		[9.1093837015e-31, 9.1093837015e-31, "electron mass"],
		[0.0072973525693, 0.0072973525693, "fine structure constant"],
	] as SnapCase[],

	REPEATING_DECIMALS: [
		[1 / 3, 0.3333333333333333, "1/3 unchanged"],
		[2 / 3, 0.6666666666666666, "2/3 unchanged"],
		[5 / 6, 0.8333333333333334, "5/6 unchanged"],
	] as SnapCase[],

	CLEAN_LITERALS: [
		[1.005, 1.005, "1.005 unchanged"],
		[2.675, 2.675, "2.675 unchanged"],
		[0.58, 0.58, "0.58 unchanged"],
		[1.000001, 1.000001, "1.000001 unchanged"],
		[123456789.1234567, 123456789.1234567, "large decimal unchanged"],
		[1.23456789e-10, 1.23456789e-10, "tiny decimal unchanged"],
	] as SnapCase[],

	CLEAN_VALUES: [
		[0, 0, "zero"],
		[42, 42, "integer"],
		[1.5, 1.5, "clean half"],
	] as SnapCase[],

	NON_FINITE: [
		[Infinity, Infinity, "Infinity"],
		[-Infinity, -Infinity, "-Infinity"],
		[NaN, NaN, "NaN"],
	] as SnapCase[],

	SAFE_INTEGER_BOUNDARY: [
		[Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "MAX_SAFE_INTEGER"],
		[Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, "MIN_SAFE_INTEGER"],
		[
			Number.MAX_SAFE_INTEGER + 1,
			Number.MAX_SAFE_INTEGER + 1,
			"MAX_SAFE_INTEGER + 1",
		],
	] as SnapCase[],
};

describe("snap", () => {
	describe("should snap", () => {
		describe("near-integer", () => {
			for (const [value, expected, label] of SHOULD_SNAP.NEAR_INTEGER) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("arithmetic", () => {
			for (const [value, expected, label] of SHOULD_SNAP.ARITHMETIC) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("conversion", () => {
			for (const [value, expected, label] of SHOULD_SNAP.CONVERSION) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("epsilon", () => {
			for (const [value, expected, label] of SHOULD_SNAP.EPSILON) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("small magnitude", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_SNAP.SMALL_MAGNITUDE) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("large magnitude", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_SNAP.LARGE_MAGNITUDE) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("subnormal", () => {
			for (const [value, expected, label] of SHOULD_SNAP.SUBNORMAL) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});
	});

	describe("should preserve", () => {
		describe("mathematical constants", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_PRESERVE.MATHEMATICAL_CONSTANTS) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("physical constants", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_PRESERVE.PHYSICAL_CONSTANTS) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("repeating decimals", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_PRESERVE.REPEATING_DECIMALS) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("clean literals", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_PRESERVE.CLEAN_LITERALS) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("clean values", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_PRESERVE.CLEAN_VALUES) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("non-finite", () => {
			for (const [value, expected, label] of SHOULD_PRESERVE.NON_FINITE) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});

		describe("safe integer boundary", () => {
			for (const [
				value,
				expected,
				label,
			] of SHOULD_PRESERVE.SAFE_INTEGER_BOUNDARY) {
				it(label, () => {
					expect(snap(value)).toBe(expected);
				});
			}
		});
	});

	describe("large-value scale branches", () => {
		it("should snap with 1e6 scale (MAX_S7 < value <= MAX_S6)", () => {
			expect(snap(2e9 + 0.5)).toBe(2e9 + 0.5);
		});

		it("should preserve values above MAX_S6 via large-value early return", () => {
			expect(snap(2e10 + 0.5)).toBe(2e10 + 0.5);
			expect(snap(2e11 + 0.5)).toBe(2e11 + 0.5);
			expect(snap(2e12 + 0.5)).toBe(2e12 + 0.5);
			expect(snap(2e13 + 0.5)).toBe(2e13 + 0.5);
			expect(snap(2e14 + 0.5)).toBe(2e14 + 0.5);
		});
	});

	describe("ULP near-integer snap for large values", () => {
		it("should snap large near-integers via ULP check", () => {
			const value = (1e12 / 5280) * 5280;

			expect(snap(value)).toBe(1e12);
		});
	});
});
