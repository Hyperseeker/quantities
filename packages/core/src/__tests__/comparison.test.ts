/**
 * @file Tests for quantity comparison operators and equality.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("comparison", () => {
	it("should return true when comparing equal quantities", () => {
		const centimeters = Quantity("1cm");
		const millimeters = Quantity("10mm");

		expect(centimeters.equals(millimeters)).toBe(true);
	});

	it("should compare compatible quantities", () => {
		const centimeter = Quantity("1cm");
		const millimeter = Quantity("1mm");
		const millimeters = Quantity("10mm");
		const amperage = Quantity("28A");

		expect(centimeter.compareTo(millimeter)).toBe(1);
		expect(millimeter.compareTo(centimeter)).toBe(-1);
		expect(centimeter.compareTo(millimeters)).toBe(0);
		expect(() => {
			centimeter.compareTo(amperage);
		}).toThrow("Incompatible units: cm and A");

		expect(centimeter.lessThan(millimeter)).toBe(false);
		expect(centimeter.lessThan(millimeters)).toBe(false);
		expect(centimeter.lessThanOrEqual(millimeters)).toBe(true);
		expect(centimeter.greaterThanOrEqual(millimeters)).toBe(true);
		expect(centimeter.greaterThan(millimeter)).toBe(true);
		expect(millimeter.greaterThan(centimeter)).toBe(false);
	});

	it("should compare identical quantities", () => {
		const firstCentimeter = Quantity("1cm");
		const otherCentimeter = Quantity("1cm");
		const tenMillimetersInATrenchCoat = Quantity("10mm");

		expect(firstCentimeter.same(otherCentimeter)).toBe(true);
		expect(firstCentimeter.same(tenMillimetersInATrenchCoat)).toBe(false);
	});

	it("should accept strings as parameter", () => {
		const centimeter = Quantity("1 cm");

		expect(centimeter.lessThan("0.5 cm")).toBe(false);
		expect(centimeter.lessThanOrEqual("1 cm")).toBe(true);
		expect(centimeter.greaterThanOrEqual("3 mm")).toBe(true);
		expect(centimeter.greaterThan("5 m")).toBe(false);
	});

	it("should work via short aliases", () => {
		const centimeter = Quantity("1 cm");
		const millimeters = Quantity("10 mm");
		const meter = Quantity("1 m");

		expect(centimeter.eq(millimeters)).toBe(true);
		expect(centimeter.eq(meter)).toBe(false);

		expect(centimeter.lt(meter)).toBe(true);
		expect(centimeter.lt(millimeters)).toBe(false);

		expect(centimeter.lte(millimeters)).toBe(true);
		expect(centimeter.lte(meter)).toBe(true);

		expect(centimeter.gt("0.5 cm")).toBe(true);
		expect(centimeter.gt(meter)).toBe(false);

		expect(centimeter.gte(millimeters)).toBe(true);
		expect(centimeter.gte(meter)).toBe(false);

		expect(centimeter.compare(meter)).toBe(-1);
	});

	describe("min/max", () => {
		it("should return the smallest quantity", () => {
			const result = Quantity.min(
				Quantity("5 m"),
				Quantity("10 m"),
				Quantity("3 m"),
			);

			expect(result.scalar).toBe(3);
			expect(result.units()).toBe("m");
		});

		it("should return the largest quantity", () => {
			const result = Quantity.max(
				Quantity("5 m"),
				Quantity("10 m"),
				Quantity("3 m"),
			);

			expect(result.scalar).toBe(10);
			expect(result.units()).toBe("m");
		});

		it("should accept mixed input types", () => {
			const min = Quantity.min(
				Quantity("100 cm"),
				"2 m",
				Quantity("50 cm"),
			);
			const max = Quantity.max(
				Quantity("100 cm"),
				"2 m",
				Quantity("50 cm"),
			);

			expect(min.scalar).toBe(50);
			expect(min.units()).toBe("cm");

			expect(max.scalar).toBe(2);
			expect(max.units()).toBe("m");
		});

		it("should return the winning instance, not a reconstruction", () => {
			const first = Quantity("5 m");
			const second = Quantity("10 m");

			expect(Quantity.max(first, second)).toBe(second);
			expect(Quantity.min(first, second)).toBe(first);
		});

		it("should throw with incompatible units", () => {
			expect(() => {
				Quantity.min(Quantity("1 m"), Quantity("1 s"));
			}).toThrow("Incompatible units");
			expect(() => {
				Quantity.max(Quantity("1 m"), Quantity("1 s"));
			}).toThrow("Incompatible units");
		});

		it("should work with a single argument", () => {
			const result = Quantity.min(Quantity("5 m"));

			expect(result.scalar).toBe(5);
			expect(result.units()).toBe("m");
		});
	});
});
