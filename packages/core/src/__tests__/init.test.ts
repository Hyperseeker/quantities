/**
 * @file Tests for quantity initialization and construction.
 */

import { describe, expect, it } from "bun:test";
import Quantity, { QuantityError } from "../quantities.ts";
import { TemperatureConversionError } from "../quantities/error.ts";

describe("initialization", () => {
	it("should create unit only", () => {
		const quantity = Quantity("m");

		expect(quantity.numerator).toEqual(["<meter>"]);
		expect(quantity.scalar).toBe(1);
	});

	it("should create unitless from unitless string", () => {
		const quantity = Quantity("1");

		expect(quantity.toFloat()).toBe(1);
		expect(quantity.numerator).toEqual(["<1>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("should create unitless from numbers", () => {
		const quantity = Quantity(1.5);

		expect(quantity.toFloat()).toBe(1.5);
		expect(quantity.numerator).toEqual(["<1>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("should create from numbers with explicit units", () => {
		const quantity = Quantity(1.5, "m");

		expect(quantity.scalar).toBe(1.5);
		expect(quantity.numerator).toEqual(["<meter>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("temperatures should have base unit in kelvin", () => {
		const kelvin = Quantity("1 tempK").toBase();
		const rankine = Quantity("1 tempR").toBase();
		const celsius = Quantity("0 tempC").toBase();
		const fahrenheit = Quantity("0 tempF").toBase();

		expect(kelvin.scalar).toBe(1);
		expect(kelvin.units()).toBe("tempK");

		expect(rankine.scalar).toBe(5 / 9);
		expect(rankine.units()).toBe("tempK");

		expect(celsius.scalar).toBe(273.15);
		expect(celsius.units()).toBe("tempK");

		expect(fahrenheit.scalar).toBeCloseTo(255.372, 3);
		expect(fahrenheit.units()).toBe("tempK");
	});

	it("temperature degrees should have base unit in kelvin", () => {
		const kelvin = Quantity("1 degK").toBase();
		const rankine = Quantity("1 degR").toBase();
		const celsius = Quantity("1 degC").toBase();
		const fahrenheit = Quantity("1 degF").toBase();

		expect(kelvin.scalar).toBe(1);
		expect(kelvin.units()).toBe("degK");

		expect(rankine.scalar).toBe(5 / 9);
		expect(rankine.units()).toBe("degK");

		expect(celsius.scalar).toBe(1);
		expect(celsius.units()).toBe("degK");

		expect(fahrenheit.scalar).toBe(5 / 9);
		expect(fahrenheit.units()).toBe("degK");
	});

	it("should not create temperatures below absolute zero", () => {
		expect(() => {
			Quantity("-1 tempK");
		}).toThrow("Temperatures must not be less than absolute zero");
		expect(() => {
			Quantity("-273.16 tempC");
		}).toThrow("Temperatures must not be less than absolute zero");
		expect(() => {
			Quantity("-459.68 tempF");
		}).toThrow("Temperatures must not be less than absolute zero");
		expect(() => {
			Quantity("-1 tempR");
		}).toThrow("Temperatures must not be less than absolute zero");

		expect(() => {
			Quantity("1 tempK").multiply("-1");
		}).toThrow("Temperatures must not be less than absolute zero");

		expect(() => {
			Quantity("0 tempK").sub("1 degK");
		}).toThrow("Temperatures must not be less than absolute zero");

		expect(() => {
			Quantity("-273.15 tempC").sub("1 degC");
		}).toThrow("Temperatures must not be less than absolute zero");

		expect(() => {
			Quantity("-459.67 tempF").sub("1 degF");
		}).toThrow("Temperatures must not be less than absolute zero");

		expect(() => {
			Quantity("0 tempR").sub("1 degR");
		}).toThrow("Temperatures must not be less than absolute zero");
	});

	it("should create simple", () => {
		const quantity = Quantity("1m");

		expect(quantity.scalar).toBe(1);
		expect(quantity.numerator).toEqual(["<meter>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("should create negative", () => {
		const quantity = Quantity("-1m");

		expect(quantity.scalar).toBe(-1);
		expect(quantity.numerator).toEqual(["<meter>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("should create compound", () => {
		const quantity = Quantity("1 N*m");

		expect(quantity.scalar).toBe(1);
		expect(quantity.numerator).toEqual(["<newton>", "<meter>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("should create with denominator", () => {
		const velocity = Quantity("1 m/s");

		expect(velocity.scalar).toBe(1);
		expect(velocity.numerator).toEqual(["<meter>"]);
		expect(velocity.denominator).toEqual(["<second>"]);
	});

	it("should create with denominator only", () => {
		const hertz = Quantity("1 /s");
		const explicit = Quantity("1 1/s");
		const caret = Quantity("1 s^-1");

		expect(hertz.scalar).toBe(1);
		expect(hertz.numerator).toEqual(["<1>"]);
		expect(hertz.denominator).toEqual(["<second>"]);

		expect(explicit.scalar).toBe(1);
		expect(explicit.numerator).toEqual(["<1>"]);
		expect(explicit.denominator).toEqual(["<second>"]);

		expect(caret.scalar).toBe(1);
		expect(caret.numerator).toEqual(["<1>"]);
		expect(caret.denominator).toEqual(["<second>"]);
	});

	it("should create with powers", () => {
		const simple = Quantity("1 m^2/s^2");
		const complex = Quantity("1 m^2 kg^2 J^2/s^2");
		const irregular = Quantity("1 m^2/s^2*J^3");

		expect(simple.scalar).toBe(1);
		expect(simple.numerator).toEqual(["<meter>", "<meter>"]);
		expect(simple.denominator).toEqual(["<second>", "<second>"]);

		expect(complex.scalar).toBe(1);
		expect(complex.numerator).toEqual([
			"<meter>",
			"<meter>",
			"<kilo>",
			"<gram>",
			"<kilo>",
			"<gram>",
			"<joule>",
			"<joule>",
		]);
		expect(complex.denominator).toEqual(["<second>", "<second>"]);

		expect(irregular.scalar).toBe(1);
		expect(irregular.numerator).toEqual(["<meter>", "<meter>"]);
		expect(irregular.denominator).toEqual([
			"<second>",
			"<second>",
			"<joule>",
			"<joule>",
			"<joule>",
		]);
	});

	it("should create with zero power", () => {
		const quantity = Quantity("1 m^0");

		expect(quantity.scalar).toBe(1);
		expect(quantity.numerator).toEqual(["<1>"]);
		expect(quantity.denominator).toEqual(["<1>"]);
	});

	it("should create with negative powers", () => {
		const quantity = Quantity("1 m^2 s^-2");

		expect(quantity.scalar).toBe(1);
		expect(quantity.numerator).toEqual(["<meter>", "<meter>"]);
		expect(quantity.denominator).toEqual(["<second>", "<second>"]);
		expect(quantity.isSame(Quantity("1 m^2/s^2"))).toBe(true);
	});

	it("should accept powers without ^ syntax (simple)", () => {
		const implicit = Quantity("1 m2");
		const caret = Quantity("1 m^2");

		expect(implicit.equals(caret)).toBe(true);
	});

	it("should accept powers without ^ syntax (negative power)", () => {
		const implicit = Quantity("1 m-2");
		const caret = Quantity("1 m^-2");

		expect(implicit.equals(caret)).toBe(true);
	});

	it("should accept powers without ^ syntax (compound)", () => {
		const implicit = Quantity("1 m2 kg2 J2/s2");
		const caret = Quantity("1 m^2 kg^2 J^2/s^2");

		expect(implicit.equals(caret)).toBe(true);
	});

	it("should accept powers without ^ syntax (compound and negative power)", () => {
		const implicit = Quantity("1 m2 kg2 J2 s-2");
		const caret = Quantity("1 m^2 kg^2 J^2 s^-2");

		expect(implicit.equals(caret)).toBe(true);
	});

	it("should throw when parsing powers greater than 4", () => {
		// > https://github.com/gentooboontoo/js-quantities/issues/73
		expect(() => {
			Quantity("593720475cm^4939207503");
		}).toThrow("Unit not recognized");
		expect(() => {
			Quantity("593720475cm**4939207503");
		}).toThrow("Unit not recognized");
	});

	it("should throw 'Unit not recognized' error when initializing with an invalid unit", () => {
		const INVALID_UNITS = [
			"aa",
			"m/aa",
			"m-",
			// * `mm` is millimeter, but `mmm` is not a valid unit
			"mmm",
			// > https://github.com/gentooboontoo/js-quantities/issues/73
			"58261da44b642352442b8060",
			// > https://github.com/gentooboontoo/js-quantities/issues/73
			"A1EB12B4233021311SH",
		];

		for (const unit of INVALID_UNITS)
			expect(() => Quantity(unit)).toThrow("Unit not recognized");
	});

	it("should reject known problematic patterns", () => {
		const PROBLEMATIC_STRINGS = [
			// * previously this value caused infinitely long regex test when checking if unit is correct
			// * with multi-pair parsing, this is no longer a valid single-unit pair
			"0.11 180°/sec",
			"VL170111115924",
		];

		for (const input of PROBLEMATIC_STRINGS)
			expect(() => Quantity(input)).toThrow("Unit not recognized");
	});

	it("should reject invalid Unicode", () => {
		const UNICODE_TESTS = ["1 💩", "1 中文", "1 العربية"];

		for (const input of UNICODE_TESTS)
			expect(() => Quantity(input)).toThrow();
	});

	it("should reject injection attempts", () => {
		const INJECTION_ATTEMPTS = [
			"1'; DROP TABLE units;--",
			"1<script>alert('xss')</script>",
			"1../../../etc/passwd",
			"1%00null",
			"1\x00null",
		];

		for (const input of INJECTION_ATTEMPTS)
			expect(() => Quantity(input)).toThrow();
	});

	it("should accept empty string as unitless 1", () => {
		const unitless = Quantity("1");

		expect(Quantity("").isSame(unitless)).toBe(true);
		expect(Quantity("   ").isSame(unitless)).toBe(true);
	});

	it("should throw instance of QuantityError", () => {
		try {
			Quantity("aa");
		} catch (error: unknown) {
			expect(error instanceof QuantityError).toBeTruthy();
		}
	});

	it("should construct TemperatureConversionError", () => {
		const error = new TemperatureConversionError("from", "tempX");

		expect(error.message).toBe(
			"Unknown type for temperature conversion from `tempX`",
		);
		expect(error.name).toBe("TemperatureConversionError");
		expect(error instanceof QuantityError).toBe(true);
	});

	it("should throw error when passing a null value", () => {
		// @ts-expect-error `null` is used on purpose
		expect(() => Quantity(null)).toThrow(
			"Only `string`, `number` or `Quantity` is accepted as a single initialization value",
		);
	});

	it("should throw error when passing NaN", () => {
		// * we expect this to throw and mention number, even though `NaN` is technically a `number` in JS, because `NaN` itself says it isn't one
		expect(() => {
			Quantity(NaN);
		}).toThrow(
			"Only `string`, `number` or `Quantity` is accepted as a single initialization value",
		);
	});

	it("should throw 'Unit not recognized' error when initializing with an invalid unit and a 0 exponent", () => {
		expect(() => {
			Quantity("3p0");
		}).toThrow("Unit not recognized");
		expect(() => {
			Quantity("3p-0");
		}).toThrow("Unit not recognized");
	});

	it("should set baseScalar", () => {
		const megapascals = Quantity("0.018 MPa");
		const centimetersCubed = Quantity("66 cm3");

		expect(megapascals.baseScalar).toBe(18_000_000);
		expect(centimetersCubed.baseScalar).toBe(0.000_066);
	});

	it("should keep init value as is", () => {
		const value = "  66 cm3  ";
		const quantity = Quantity(value);

		expect(quantity.initialValue).toEqual(value);
	});

	it("should expose initValue as legacy alias for initialValue", () => {
		const quantity = Quantity("66 cm3");

		expect(quantity.initValue).toBe(quantity.initialValue);
	});

	it("should round via toPrec alias", () => {
		const quantity = Quantity("5.17 ft");

		expect(quantity.toPrec("1 ft").scalar).toBe(5);
	});

	it("should allow whitespace-wrapped value", () => {
		expect(() => {
			Quantity("  2 MPa  ");
		}).not.toThrow();
	});

	it("should allow whitespaces between sign and scalar", () => {
		const quantity = Quantity("-  1m");

		expect(quantity.scalar).toEqual(-1);
		expect(quantity.units()).toEqual("m");
	});

	it("should throw an error when parsing negative quantity with no scalar", () => {
		expect(() => {
			Quantity("-m");
		}).toThrow("Unit not recognized");
	});

	it("should parse valid signed scalars", () => {
		expect(Quantity("+1").scalar).toBe(1);
		expect(Quantity("-1").scalar).toBe(-1);
		expect(Quantity("+ 1").scalar).toBe(1);
		expect(Quantity("- 1").scalar).toBe(-1);
		expect(Quantity("+1.5 kg").scalar).toBe(1.5);
		expect(Quantity("-1.5 kg").scalar).toBe(-1.5);
	});

	it("should reject multiple signs as invalid numeric values", () => {
		const INVALID = [
			"--1",
			"++1",
			"+-1",
			"-+1",
			"--1 kg",
			"++1.5",
			"-+0",
			"+-1E2",
		];

		for (const input of INVALID)
			expect(() => Quantity(input)).toThrow("Invalid numeric value");
	});
});
