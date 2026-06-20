/**
 * @file Tests arithmetic operations on quantities.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";
import {
	divideSafely,
	multiplySafely,
	roundSafely,
} from "../quantities/math.ts";

describe("math", () => {
	it("should add quantities", () => {
		const twoAndAHalfMeters = Quantity("2.5m");
		const threeMeters = Quantity("3m");
		const threeCentimeters = Quantity("3cm");

		const twoMetersAndChange = twoAndAHalfMeters.add(threeCentimeters);

		const fiveMetersAndChange = threeMeters
			.add(twoAndAHalfMeters)
			.add(threeCentimeters);

		const eightCentimeters = Quantity("5cm").add(threeCentimeters);

		expect(twoAndAHalfMeters.add(threeMeters).scalar).toBe(5.5);
		expect(twoAndAHalfMeters.add("3m").scalar).toBe(5.5);

		expect(twoMetersAndChange.scalar).toBe(2.53);
		expect(twoMetersAndChange.units()).toBe("m");

		expect(fiveMetersAndChange.scalar).toBe(5.53);
		expect(fiveMetersAndChange.units()).toBe("m");

		// * make sure adding 2 of the same non-base units works
		expect(eightCentimeters.scalar).toBe(8);
		expect(eightCentimeters.units()).toBe("cm");
	});

	it("should fail to add unlike quantities", () => {
		const meters = Quantity("3m");
		const seconds = Quantity("2s");

		expect(() => {
			meters.add(seconds);
		}).toThrow("Incompatible units: m and s");
		expect(() => {
			seconds.add(meters);
		}).toThrow("Incompatible units: s and m");
	});

	it("should fail to add inverse quantities", () => {
		const seconds = Quantity("10S");
		const frequency = seconds.inverse();
		const resistance = Quantity("0.1ohm");

		expect(() => {
			seconds.add(frequency);
		}).toThrow("Incompatible units: S and 1/S");
		expect(() => {
			frequency.add(seconds);
		}).toThrow("Incompatible units: 1/S and S");

		expect(() => {
			seconds.add(resistance);
		}).toThrow("Incompatible units: S and Ohm");
		expect(() => {
			resistance.add(seconds);
		}).toThrow("Incompatible units: Ohm and S");
	});

	it("should subtract quantities", () => {
		const twoAndAHalfMeters = Quantity("2.5m");
		const threeMeters = Quantity("3m");
		const threeCentimeters = Quantity("3cm");

		const lessThanTwoAndAHalfMeters =
			twoAndAHalfMeters.sub(threeCentimeters);

		// * also check the alias while we're at it
		const halfAMeter = threeMeters.subtract(twoAndAHalfMeters);

		expect(twoAndAHalfMeters.sub(threeMeters).scalar).toBe(-0.5);

		expect(twoAndAHalfMeters.subtract("2m").scalar).toBe(0.5);
		expect(twoAndAHalfMeters.subtract("-2m").scalar).toBe(4.5);

		expect(lessThanTwoAndAHalfMeters.scalar).toBe(2.47);
		expect(lessThanTwoAndAHalfMeters.units()).toBe("m");

		expect(halfAMeter.scalar).toBe(0.5);
		expect(halfAMeter.units()).toBe("m");
	});

	it("should fail to subtract unlike quantities", () => {
		const meters = Quantity("3m");
		const seconds = Quantity("2s");

		expect(() => {
			meters.sub(seconds);
		}).toThrow("Incompatible units: m and s");
		expect(() => {
			seconds.subtract(meters);
		}).toThrow("Incompatible units: s and m");
	});

	it("should fail to subtract inverse quantities", () => {
		const siemens = Quantity("10S");
		const inverted = siemens.inverse();
		const ohm = Quantity("0.1ohm");

		expect(() => {
			siemens.sub(inverted);
		}).toThrow("Incompatible units: S and 1/S");
		expect(() => {
			inverted.sub(siemens);
		}).toThrow("Incompatible units: 1/S and S");

		expect(() => {
			siemens.sub(ohm);
		}).toThrow("Incompatible units: S and Ohm");
		expect(() => {
			ohm.sub(siemens);
		}).toThrow("Incompatible units: Ohm and S");
	});

	it("should multiply quantities", () => {
		const qty1 = Quantity("2.5m");

		let qty2 = Quantity("3m");
		let result = qty1.multiply(qty2);

		expect(result.scalar).toBe(7.5);
		expect(result.units()).toBe("m2");
		expect(result.kind()).toBe("area");

		qty2 = Quantity("3cm");

		result = qty1.multiply(qty2);

		expect(result.scalar).toBe(750);
		expect(result.units()).toBe("cm2");

		result = qty2.multiply(qty1);

		expect(result.scalar).toBe(750);
		expect(result.units()).toBe("cm2");

		result = qty1.multiply(3.5);

		expect(result.scalar).toBe(8.75);
		expect(result.units()).toBe("m");

		result = qty1.multiply(0);

		expect(result.scalar).toBe(0);
		expect(result.units()).toBe("m");

		result = qty1.multiply(Quantity("0m"));

		expect(result.scalar).toBe(0);
		expect(result.units()).toBe("m2");

		qty2 = Quantity("1.458 m");

		result = qty1.multiply(qty2);

		expect(result.scalar).toBe(3.645);
		expect(result.units()).toBe("m2");
	});

	it("should multiply unlike quantities", () => {
		let qty1 = Quantity("2.5 m");
		let qty2 = Quantity("3 N");
		let result = qty1.multiply(qty2);

		expect(result.scalar).toBe(7.5);

		qty1 = Quantity("2.5 m^2");
		qty2 = Quantity("3 kg/m^2");

		result = qty1.multiply(qty2);

		expect(result.scalar).toBe(7.5);
		expect(result.units()).toBe("kg");
	});

	it("should multiply inverse quantities", () => {
		const qty1 = Quantity("10S");
		const qty2 = Quantity(".5S").inverse(); // 2/S
		const qty3 = qty1.inverse(); // .1/S

		let result = qty1.multiply(qty2);

		expect(result.scalar).toBe(20);
		expect(result.isUnitless()).toBe(true);
		expect(result.units()).toBe("");

		// swapping operands should give the same outcome
		result = qty2.multiply(qty1);

		expect(result.scalar).toBe(20);
		expect(result.isUnitless()).toBe(true);
		expect(result.units()).toBe("");

		result = qty1.multiply(qty3);

		expect(result.scalar).toBe(1);
		expect(result.isUnitless()).toBe(true);
		expect(result.units()).toBe("");

		// swapping operands should give the same outcome
		result = qty3.multiply(qty1);

		expect(result.scalar).toBe(1);
		expect(result.isUnitless()).toBe(true);
		expect(result.units()).toBe("");
	});

	it("should multiply quantities and their inverses with prefixes", () => {
		let qty1 = Quantity("3m");
		let qty2 = Quantity("4 1/km");
		let result = qty1.multiply(qty2);

		expect(result.scalar).toBe(0.012);
		expect(result.isUnitless()).toBe(true);

		qty1 = Quantity("3 A/km");
		qty2 = Quantity("4 m");
		result = qty1.multiply(qty2);

		expect(result.scalar).toBe(0.012);
		expect(result.units()).toBe("A");

		qty1 = Quantity("3 1/km2");
		qty2 = Quantity("4 m");
		result = qty1.multiply(qty2);

		expect(result.scalar).toBe(0.012);
		expect(result.units()).toBe("1/km");

		qty1 = Quantity("4 m");
		qty2 = Quantity("3 1/km2");
		result = qty1.multiply(qty2);

		expect(result.scalar).toBe(0.000012);
		expect(result.units()).toBe("1/m");
	});

	it("should divide quantities", () => {
		const qty1 = Quantity("2.5m");
		const qty2 = Quantity("3m");
		const qty3 = Quantity("0m");

		expect(() => {
			qty1.divide(qty3);
		}).toThrow("Attempted to divide by zero");
		expect(() => {
			qty1.divide(0);
		}).toThrow("Attempted to divide by zero");
		expect(qty3.divide(qty1).scalar).toBe(0);

		let result = qty1.divide(qty2);

		expect(result.scalar).toBe(2.5 / 3);
		expect(result.units()).toBe("");
		expect(result.kind()).toBe("unitless");

		const qty4 = Quantity("3cm");

		result = qty1.divide(qty4);

		expect(result.scalar).toBe(2.5 / 0.03);
		expect(result.units()).toBe("");

		result = qty4.divide(qty1);

		expect(result.scalar).toBe(0.012);
		expect(result.units()).toBe("");

		result = qty1.divide(3.5);

		expect(result.scalar).toBe(2.5 / 3.5);
		expect(result.units()).toBe("m");
	});

	it("should divide unlike quantities", () => {
		const weight = Quantity("7.5kg");
		const area = Quantity("2.5m^2");
		const pressure = weight.divide(area);

		expect(pressure.scalar).toBe(3);
		expect(pressure.units()).toBe("kg/m2");
	});

	it("should divide inverse quantities", () => {
		const qty1 = Quantity("10 S");
		const qty2 = Quantity(".5 S").inverse(); // 2/S
		const qty3 = qty1.inverse(); // .1/S

		let result = qty1.divide(qty2);

		expect(result.scalar).toBe(5);
		expect(result.units()).toBe("S2");

		result = qty2.divide(qty1);

		expect(result.scalar).toBe(0.2);
		expect(result.units()).toBe("1/S2");

		result = qty1.divide(qty3);

		expect(result.scalar).toBe(100);
		expect(result.units()).toBe("S2");

		result = qty3.divide(qty1);

		expect(result.scalar).toBe(0.01);
		expect(result.units()).toBe("1/S2");
	});

	it("should divide quantities and their inverses with prefixes", () => {
		let qty1 = Quantity("3m*A");
		let qty2 = Quantity("4 km");
		let result = qty1.divide(qty2);

		expect(result.scalar).toBe(0.00075);
		expect(result.units()).toBe("A");

		qty1 = Quantity("3 m");
		qty2 = Quantity("4 km*A");
		result = qty1.divide(qty2);

		expect(result.scalar).toBe(0.00075);
		expect(result.units()).toBe("1/A");

		qty1 = Quantity("3 m");
		qty2 = Quantity("4 km*cA");
		result = qty1.divide(qty2);

		expect(result.scalar).toBe(0.00075);
		expect(result.units()).toBe("1/cA");
	});

	it("should multiply via mul alias", () => {
		const result = Quantity("2.5 m").mul(3);

		expect(result.scalar).toBe(7.5);
		expect(result.units()).toBe("m");
	});

	it("should divide via div alias", () => {
		const result = Quantity("7.5 m").div(3);

		expect(result.scalar).toBe(2.5);
		expect(result.units()).toBe("m");
	});

	it("should throw when multiplying with invalid input type", () => {
		expect(() => {
			// @ts-expect-error testing runtime type guard
			Quantity("2 m").multiply({});
		}).toThrow("Invalid input for multiplication");
	});

	it("should convert quantity's scalar to absolute value", () => {
		expect(Quantity("5 m").abs().scalar).toBe(5);
		expect(Quantity("-5 m").abs().scalar).toBe(5);
		expect(Quantity("0 m").abs().scalar).toBe(0);
	});

	it("should return sign of scalar", () => {
		expect(Quantity("5 m").sign()).toBe(1);
		expect(Quantity("-5 m").sign()).toBe(-1);
		expect(Quantity("0 m").sign()).toBe(0);
	});

	describe("exponent", () => {
		it("should raise quantities with units to integer powers", () => {
			const result = Quantity("2 m").pow(2);

			expect(result.scalar).toBe(4);
			expect(result.units()).toBe("m2");
		});

		it("should raise to the power of 3", () => {
			const result = Quantity("3 m").exponent(3);

			expect(result.scalar).toBe(27);
			expect(result.units()).toBe("m3");
		});

		it("should raise to the power of 0", () => {
			const result = Quantity("5 m").pow(0);

			expect(result.scalar).toBe(1);
			expect(result.isUnitless()).toBe(true);
		});

		it("should raise to negative integer powers", () => {
			const result = Quantity("2 m").pow(-2);

			expect(result.scalar).toBe(0.25);
			expect(result.units()).toBe("1/m2");
		});

		it("should throw on divide by zero for negative exponent", () => {
			expect(() => Quantity("0 m").pow(-1)).toThrow(
				"Attempted to divide by zero",
			);
		});

		it("should allow non-integer exponent for unitless quantities", () => {
			const result = Quantity("4").pow(1.5);

			expect(result.scalar).toBe(8);
			expect(result.isUnitless()).toBe(true);
		});

		it("should reject fractional exponent of negative unitless quantity", () => {
			expect(() => Quantity("-4").pow(1.5)).toThrow(
				"Fractional exponent of a negative quantity is not supported",
			);
		});

		it("should reject non-integer exponent for quantities with units", () => {
			expect(() => Quantity("2 m").pow(1.5)).toThrow(
				"Non-integer exponent not allowed for quantities with units",
			);
		});

		it("should reject non-finite exponent", () => {
			expect(() => Quantity("2 m").exponent(NaN)).toThrow(
				"Exponent must be a finite number",
			);
			expect(() => Quantity("2 m").exponent(Infinity)).toThrow(
				"Exponent must be a finite number",
			);
		});

		it("should reject negative exponent for temperatures", () => {
			expect(() => Quantity("100 tempC").pow(-1)).toThrow(
				"Cannot divide with temperatures",
			);
		});

		it("should reject exponent > 1 for temperatures", () => {
			expect(() => Quantity("100 tempC").pow(2)).toThrow(
				"Cannot multiply by temperatures",
			);
		});

		it("should allow exponent 1 identity for temperatures", () => {
			const result = Quantity("100 tempC").pow(1);

			expect(result.scalar).toBe(100);
			expect(result.units()).toBe("tempC");
		});
	});

	it("should compute cube root via cbrt alias", () => {
		const result = Quantity("27 ft^3").cbrt();

		expect(result.scalar).toBe(3);
		expect(result.units()).toBe("ft");
	});

	describe("exponent edge cases", () => {
		it("should throw for non-finite exponent result", () => {
			expect(() => Quantity("0").pow(-0.5)).toThrow(
				"Invalid exponent result: scalar is not finite",
			);
		});
	});

	describe("DefinitionObject guard paths", () => {
		it("should handle unknown tokens in numerator via expandUnits", () => {
			const bogus = new Quantity({
				scalar: 8,
				numerator: [
					"<liter>",
					"<nonexistent>",
					"<nonexistent>",
					"<nonexistent>",
				],
			});

			const result = bogus.root(3);

			expect(result.scalar).toBeCloseTo(2, 10);
			expect(result.numerator).toContain("<nonexistent>");
		});

		it("should handle unknown tokens in denominator via expandUnits", () => {
			const bogus = new Quantity({
				scalar: 8,
				numerator: ["<liter>"],
				denominator: [
					"<nonexistent>",
					"<nonexistent>",
					"<nonexistent>",
				],
			});

			const result = bogus.root(3);

			expect(result.scalar).toBeCloseTo(2, 10);
			expect(result.denominator).toContain("<nonexistent>");
		});

		it("should throw for trailing prefix in unit terms", () => {
			const broken = new Quantity({
				scalar: 1,
				numerator: ["<kilo>"],
			});

			expect(() => broken.multiply("2 m")).toThrow(
				"Invalid unit expression: prefix `<kilo>` must be followed by a unit",
			);
		});

		it("should handle prefix token in denominator during root expansion", () => {
			const bogus = new Quantity({
				scalar: 4,
				numerator: ["<meter>", "<meter>"],
				denominator: ["<kilo>", "<kilo>"],
			});

			const result = bogus.root(2);

			expect(result.scalar).toBeCloseTo(2, 10);
		});

		it("should handle derived unit in denominator during root expansion", () => {
			const result = Quantity("8 m^3/L").root(3);

			expect(result.scalar).toBeCloseTo(2, 10);
		});
	});

	describe("safe math functions", () => {
		describe("multiplySafely", () => {
			it("should multiply while trying to avoid numerical errors", () => {
				expect(multiplySafely(0.1, 0.1)).toBe(0.01);
				expect(multiplySafely(1e-11, 123.456789)).toBe(1.23456789e-9);
				expect(multiplySafely(6e-12, 100_000)).toBe(6e-7);
			});
		});

		describe("divideSafely", () => {
			it("should divide while trying to avoid numerical errors", () => {
				expect(divideSafely(0.000773, 0.000001)).toBe(773);
				expect(divideSafely(24.5, 0.2777777777777778)).toBe(88.2);
			});
		});

		describe("roundSafely", () => {
			it("should throw on non-integer decimals", () => {
				expect(() => roundSafely(1.5, 1.5)).toThrow(
					"non-integer decimals value",
				);
			});

			it("should throw on negative decimals", () => {
				expect(() => roundSafely(1.5, -1)).toThrow(
					"negative decimals value",
				);
			});
		});
	});
});
