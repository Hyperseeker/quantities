/**
 * @file Tests the swift-converter functionality.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("Quantity.swiftConverter()", () => {
	it("should return a function", () => {
		expect(typeof Quantity.swiftConverter("m/h", "ft/s")).toBe("function");
	});

	it("should throw when passing incompatible units", () => {
		expect(() => {
			Quantity.swiftConverter("m", "s");
		}).toThrow("Incompatible units: m and s");
	});

	describe("converter", () => {
		describe("single value", () => {
			it("should convert value", () => {
				const converter = Quantity.swiftConverter("m/h", "m/s");

				expect(converter(2500)).toEqual(
					Quantity("2500 m/h").to("m/s").scalar,
				);
			});

			it("should convert value inversely", () => {
				const converter = Quantity.swiftConverter("m/h", "ft/s");

				expect(converter(2500)).toEqual(
					Quantity("2500 m/h").to("ft/s").scalar,
				);
			});

			it("should returned value unchanged when units are identical", () => {
				const converter = Quantity.swiftConverter("m/h", "m/h");

				expect(converter(2500)).toEqual(2500);
			});

			it("should convert temperatures", () => {
				const converter = Quantity.swiftConverter("tempF", "tempC");

				expect(converter(32)).toEqual(0);
			});

			it("should convert degrees", () => {
				const converter = Quantity.swiftConverter("degC", "degF");

				expect(converter(10)).toEqual(18);
			});
		});

		describe("array of values", () => {
			it("should be converted", () => {
				const converter = Quantity.swiftConverter("MPa", "bar");
				const values = [250, 10, 15];
				const expected = [2500, 100, 150];

				expect(converter(values)).toEqual(expected);
			});
		});
	});
});
