/**
 * @file Tests string formatting and serialization of quantities.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("string input/output", () => {
	describe("Qty.parse", () => {
		it("should throw if parsed argument is not a string", () => {
			// @ts-expect-error We purposefully supply a number instead of the expected string to test the parser
			expect(() => Quantity.parse(5)).toThrow(
				"Argument must be a string",
			);
		});

		it("should not throw if parsed argument is a string", () => {
			expect(() => {
				Quantity.parse("foo");
			}).not.toThrow();
		});

		it("should return parsed quantity when passing a valid quantity", () => {
			expect(Quantity.parse("2.5 m") instanceof Quantity).toBe(true);
		});

		it("should return null when passing an invalid quantity", () => {
			expect(Quantity.parse("aa")).toBeNull();
		});

		it("should work", () => {
			expect(() => {
				Quantity.parse("VL170111115924");
			}).not.toThrow();
		});
	});

	describe("multi-pair parsing", () => {
		it("should parse compound length expressions", () => {
			const quantity = Quantity("5 ft 6 in");

			expect(quantity.scalar).toBe(5.5);
			expect(quantity.units()).toBe("ft");
		});

		it("should parse metric compound expressions", () => {
			const quantity = Quantity("1 m 20 cm");

			expect(quantity.scalar).toBe(1.2);
			expect(quantity.units()).toBe("m");
		});

		it("should reject temperature units in multi-pair", () => {
			expect(() => Quantity("1 tempC 2 tempC")).toThrow(
				"Multi-pair input cannot contain temperature units",
			);
		});

		it("should reject incompatible units in multi-pair", () => {
			expect(() => Quantity("1 m 2 s")).toThrow(
				"Incompatible units in multi-pair",
			);
		});

		it("should parse compound time expressions", () => {
			const quantity = Quantity("1 h 30 min");

			expect(quantity.scalar).toBe(1.5);
			expect(quantity.units()).toBe("h");
		});

		it("should reject temperature in subsequent pair of multi-pair", () => {
			expect(() => Quantity("1 m 2 tempC")).toThrow(
				"Multi-pair input cannot contain temperature units",
			);
		});

		it("should handle zero scalar in first pair of multi-pair", () => {
			const result = Quantity("0 m 20 cm");

			expect(result.scalar).toBe(20);
			expect(result.units()).toBe("m");
		});
	});

	describe("toString", () => {
		it("should generate readable human output", () => {
			const two = Quantity("2");
			const speed = Quantity("24.5m/s");
			const length = Quantity("2m");
			const pressure = Quantity("254kg/m^2");

			expect(two.toString()).toBe("2");

			expect(speed.toString()).toBe("24.5 m/s");
			expect(() => {
				speed.toString("m");
			}).toThrow("Incompatible units: m/s and m");
			expect(speed.toString("km/h")).toBe("88.2 km/h");

			expect(length.toString()).toBe("2 m");
			expect(length.toString("cm")).toBe("200 cm");
			expect(length.toString("km")).toBe("0.002 km");
			expect(() => {
				length.toString("A");
			}).toThrow("Incompatible units: m and A");

			expect(pressure.toString()).toBe("254 kg/m2");
		});

		it("should round readable human output when max decimals is specified", () => {
			const divided = Quantity("2m").divide(3);
			const precise = Quantity("2.818m");
			const decimal = Quantity("2.8m");

			expect(divided.toString("cm", 2)).toBe("66.67 cm");

			expect(precise.toString("cm", 0)).toBe("282 cm");

			expect(decimal.toString("m", 0)).toBe("3 m");
			expect(decimal.toString("cm", 0)).toBe("280 cm");
		});

		it("should round to max decimals", () => {
			const precise = Quantity("2.987654321 m");

			expect(precise.toString(3)).toBe("2.988 m");
			// oxlint-disable-next-line oxc/number-arg-out-of-range
			expect(precise.toString(0)).toBe("3 m");
		});

		it("should round according to precision passed as quantity", () => {
			const feet = Quantity("5.17 ft");

			expect(feet.toString(Quantity("ft"))).toBe("5 ft");
			expect(feet.toString(Quantity("2 ft"))).toBe("6 ft");
			expect(feet.toString(Quantity("0.5 ft"))).toBe("5 ft");
			expect(feet.toString(Quantity("0.1 ft"))).toBe("5.2 ft");
			expect(feet.toString(Quantity("0.05 ft"))).toBe("5.15 ft");
			expect(feet.toString(Quantity("0.01 ft"))).toBe("5.17 ft");
			expect(feet.toString(Quantity("0.0001 ft"))).toBe("5.17 ft");
		});

		it("should return same output with successive calls", () => {
			const volume = Quantity("123 cm3");

			expect(volume.toString("cm3", 0)).toBe("123 cm3");
			expect(volume.toString("cm3", 0)).toBe("123 cm3");
		});

		it("should return identical output when called with no parameters or same units", () => {
			const volume = Quantity("123 cm3");

			expect(volume.toString()).toBe(volume.toString("cm3"));
		});
	});
});
