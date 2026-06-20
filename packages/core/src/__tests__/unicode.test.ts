/**
 * @file Tests Unicode and special-character handling in quantity parsing.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("non-ASCII character", () => {
	describe("µ", () => {
		it("should be supported as prefix", () => {
			const micrometer = Quantity("1 um");

			// * µ as greek letter
			expect(Quantity("1 \u03BCm").equals(micrometer)).toBe(true);
			// * µ as micro sign
			expect(Quantity("1 \u00B5m").equals(micrometer)).toBe(true);
		});
	});

	describe("Ω", () => {
		it("should be accepted as unit for ohm", () => {
			const ohm = Quantity("1 ohm");

			// * Ω as greek letter
			expect(Quantity("1 \u03A9").equals(ohm)).toBe(true);
			// * Ω as ohm sign
			expect(Quantity("1 \u2126").equals(ohm)).toBe(true);
		});
	});
});
