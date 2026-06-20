/**
 * @file Tests for quantity output formatting.
 */

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";
import type { Formatter } from "../types.ts";

describe("format", () => {
	describe("provided default formatter", () => {
		it("should be applied to output", () => {
			const quantity = Quantity(2.987654321, "m");

			expect(quantity.format()).toBe("2.987654321 m");
		});
	});

	describe("custom formatter", () => {
		const ROUNDING = (maxDecimals: number): Formatter => {
			return (scalar: number, units: string) => {
				const pow = Math.pow(10, maxDecimals);
				const rounded = Math.round(scalar * pow) / pow;

				return rounded + " " + units;
			};
		};

		const INTEGER_ROUNDING = ROUNDING(0);

		it("should be applied to output", () => {
			const quantity = Quantity("2.987654321 m");

			expect(quantity.format(ROUNDING(3))).toBe("2.988 m");
			expect(quantity.format(ROUNDING(0))).toBe("3 m");
		});

		it("should be applied after conversion to target units", () => {
			const twoThirdsOfAMeter = Quantity("2m").divide(3);

			expect(twoThirdsOfAMeter.format("cm", ROUNDING(2))).toBe(
				"66.67 cm",
			);

			const nearlyThreeMeters = Quantity("2.8m");

			expect(nearlyThreeMeters.format("m", INTEGER_ROUNDING)).toBe("3 m");
			expect(nearlyThreeMeters.format("cm", INTEGER_ROUNDING)).toBe(
				"280 cm",
			);

			const aBitCloserToThreeMeters = Quantity("2.818m");

			expect(aBitCloserToThreeMeters.format("cm", INTEGER_ROUNDING)).toBe(
				"282 cm",
			);
		});

		describe("globally set as default formatter", () => {
			let previousFormatter: Formatter;

			beforeEach(() => {
				previousFormatter = Quantity.formatter;
				Quantity.formatter = ROUNDING(3);
			});

			afterEach(() => {
				Quantity.formatter = previousFormatter;
			});

			it("should be applied when no formatter is passed", () => {
				const quantity = Quantity("2.987654321 m");

				expect(quantity.format()).toBe("2.988 m");
			});
		});
	});
});
