/**
 * @file Non-regression tests guarding against previously fixed bugs.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("non regression tests", () => {
	describe("Wh", () => {
		it("should be parsed", () => {
			expect(Quantity("Wh").equals(Quantity("3600 J"))).toBe(true);
		});

		it("should be parsed when prefixed", () => {
			expect(Quantity("kWh").equals(Quantity("1000 Wh"))).toBe(true);
		});
	});

	describe("Ah", () => {
		it("should be parsed", () => {
			expect(Quantity("Ah").equals(Quantity("3600 C"))).toBe(true);
		});

		it("should be parsed when prefixed", () => {
			expect(Quantity("mAh").equals(Quantity("3.6 C"))).toBe(true);
		});
	});

	describe("Farad", () => {
		it("should be equal to its definition", () => {
			expect(
				Quantity("1 F").equals(Quantity("1 C").divide(Quantity("1 V"))),
			).toBe(true);
		});

		it("should not be defined as base unit", () => {
			const farad = Quantity("F");

			expect(farad.isBase()).toBe(false);
			expect(farad.toBase().units()).toEqual("A2*s4/kg*m2");
		});

		it("should be parsed when prefixed", () => {
			const nanofarad = Quantity("100 nF");
			const faradsNanofied = Quantity("100 F").divide(1e9);

			expect(nanofarad.equals(faradsNanofied)).toBe(true);
			expect(nanofarad.baseScalar).toEqual(1e-10);
		});
	});

	describe("elementary charge (#141)", () => {
		// * elementary charge (`e`) and electronvolt (`eV`) parsing moved with
		// * their definitions to @quantities/units; this guards that the `e`
		// * exponent notation still parses without an `e`-aliased unit present.
		it("should not impact exponent notation", () => {
			expect(Quantity("1e2").equals(Quantity("100"))).toBe(true);
			expect(Quantity("3e8 m/s").equals(Quantity("300000 km/s"))).toBe(
				true,
			);
		});
	});

	describe("Square foot definition (#146)", () => {
		it("should not be equal to square meter", () => {
			expect(Quantity("1 sqft").equals(Quantity("1 m2"))).toBe(false);
		});

		it("should be correctly defined", () => {
			expect(
				Quantity("1 sqft").equals(
					Quantity("1 ft").multiply(Quantity("1 ft")),
				),
			).toBe(true);
			expect(Quantity(1, "sqft").to("m2").format()).toBe("0.09290304 m2");
		});
	});
});
