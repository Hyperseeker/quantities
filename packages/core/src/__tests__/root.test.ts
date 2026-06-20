/**
 * @file Tests for the `root()`/`sqrt()` operation on quantities.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";
import UnitRegistry from "../quantities/registry.ts";
import type { UnitMap } from "../types.ts";

describe("root", () => {
	describe("identity", () => {
		it("should return equivalent quantity for root(1)", () => {
			const quantity = Quantity("5 m");
			const result = quantity.root(1);

			expect(result.scalar).toBe(5);
			expect(result.units()).toBe("m");

			expect(result.numerator).toEqual(quantity.numerator);
			expect(result.denominator).toEqual(quantity.denominator);
		});
	});

	describe("surface units divisible", () => {
		it("should handle unitless quantities", () => {
			const result = Quantity("8").root(3);

			expect(result.scalar).toBe(2);
			expect(result.isUnitless()).toBe(true);
		});

		it("should handle quantities with scalar 0", () => {
			const result = Quantity("0 m^2").root(2);

			expect(result.scalar).toBe(0);
			expect(result.units()).toBe("m");
		});

		it("should compute square root of cm^2", () => {
			const result = Quantity("9 cm^2").root(2);

			expect(result.scalar).toBe(3);
			expect(result.units()).toBe("cm");
		});

		it("should compute cube root", () => {
			const result = Quantity("27 ft^3").root(3);

			expect(result.scalar).toBe(3);
			expect(result.units()).toBe("ft");
		});

		it("should compute square root of compound units", () => {
			const result = Quantity("4 m^2*kg^2").root(2);

			expect(result.scalar).toBe(2);
			expect(result.units()).toBe("m*kg");
		});

		it("should handle denominator", () => {
			const result = Quantity("4 m^2/s^2").root(2);

			expect(result.scalar).toBe(2);
			expect(result.units()).toBe("m/s");
		});

		it("should handle very small scalars", () => {
			const result = Quantity("1e-18 m^2").root(2);

			expect(result.scalar).toBe(1e-9);
			expect(result.units()).toBe("m");
		});

		it("should work via sqrt() alias", () => {
			const result = Quantity("4 m^2").sqrt();

			expect(result.scalar).toBe(2);
			expect(result.units()).toBe("m");
		});
	});

	describe("divisible with expansion", () => {
		it("should compute cube root of 8 ml", () => {
			const result = Quantity("8 ml").root(3);

			expect(result.scalar).toBe(2);
			expect(result.units()).toBe("cm");
		});

		it("should compute cube root of 1 L", () => {
			const result = Quantity("1 L").root(3);

			expect(result.scalar).toBe(1);
			expect(result.units()).toBe("dm");
		});

		it("should compute square root of 1 acre", () => {
			const result = Quantity("1 acre").root(2);

			expect(result.scalar).toBe(208.71032557111303);
			expect(result.units()).toBe("ft");
		});

		it("should compute square root of 1 hectare", () => {
			const result = Quantity("1 hectare").root(2);

			expect(result.scalar).toBe(1);
			expect(result.units()).toBe("hm");
		});

		it("should compute cube root of 1 gallon", () => {
			const result = Quantity("1 gallon").root(3);

			expect(result.scalar).toBe(6.135792439661959);
			expect(result.units()).toBe("in");
		});

		it("should preserve unit system", () => {
			expect(Quantity("1 gallon").root(3).units()).toBe("in");
		});
	});

	describe("error cases", () => {
		it("should reject root of linear meter", () => {
			expect(() => Quantity("1 m").root(2)).toThrow(
				"unit exponents not divisible by 2",
			);
		});

		it("should reject cube root of joule", () => {
			expect(() => Quantity("1 J").root(3)).toThrow(
				"unit exponents not divisible by 3",
			);
		});

		it("should reject root of m/s", () => {
			expect(() => Quantity("1 m/s").root(2)).toThrow(
				"unit exponents not divisible by 2",
			);
		});

		it("should reject non-integer root", () => {
			expect(() => Quantity("4 m^2").root(2.5)).toThrow(
				"Root power must be a positive integer",
			);
		});

		it("should reject negative root", () => {
			expect(() => Quantity("4 m^2").root(-2)).toThrow(
				"Root power must be a positive integer",
			);
		});

		it("should reject zero root", () => {
			expect(() => Quantity("4 m^2").root(0)).toThrow(
				"Root power must be a positive integer",
			);
		});

		it("should reject negative scalar with units", () => {
			expect(() => Quantity("-4 m^2").root(2)).toThrow(
				"Even root of a negative quantity is not supported",
			);
		});

		it("should reject temperature root", () => {
			expect(() => Quantity("100 tempC").root(2)).toThrow(
				"temperature units cannot have fractional exponents",
			);
		});
	});

	describe("general nth root", () => {
		it("should compute 4th root", () => {
			expect(Quantity("16").root(4).scalar).toBe(2);
		});

		it("should compute 5th root", () => {
			expect(Quantity("243").root(5).scalar).toBe(3);
		});
	});
});

describe("root with prefix-free registry", () => {
	const units: UnitMap = {
		"<meter>": [["m", "meter"], 1, "length", ["<meter>"]],
		"<kilogram>": [["kg", "kilogram"], 1, "mass", ["<kilogram>"]],
		"<second>": [["s", "second"], 1, "time", ["<second>"]],
		"<liter>": [
			["L", "l", "liter", "litre"],
			0.001,
			"volume",
			["<meter>", "<meter>", "<meter>"],
		],
	};

	class PrefixFreeQuantity extends Quantity {
		static override registry = new UnitRegistry(units);

		constructor(...args: ConstructorParameters<typeof Quantity>) {
			super(...args);
		}
	}

	it("should handle derivePrefix fallback with no prefixes", () => {
		const quantity = new PrefixFreeQuantity("8 L");

		expect(quantity.root(3).scalar).toBe(0.2);
	});
});
