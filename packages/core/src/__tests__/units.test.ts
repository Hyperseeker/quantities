/**
 * @file Tests unit parsing and definitions.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("units", () => {
	it("should accept string as parameter for compatibility tests", () => {
		const millimeters = Quantity("1 mm");

		expect(millimeters.isCompatible("2 mm")).toBe(true);
		expect(millimeters.isCompatible("2 mm^3")).toBe(false);
	});

	it("should return kind", () => {
		const force = Quantity("1 N");
		const length = Quantity("1 mm");

		expect(force.kind()).toBe("force");
		expect(length.kind()).toBe("length");
	});

	it("should know if a quantity is in base units", () => {
		const base = Quantity("1m");
		const notBase = Quantity("100 cm");

		expect(base.isBase()).toBe(true);
		expect(notBase.isBase()).toBe(false);
	});

	it("should return unit part of quantities", () => {
		const unitless = Quantity("1");
		const denominator = Quantity("1 /s");
		const length = Quantity("100 cm");
		const speed = Quantity("100 cm/s");
		const area = Quantity("1 cm^2");
		const specificEnergy = Quantity("1 cm^2/s^2");
		const complex = Quantity("1 cm^2*J^3/s^2*A^2");

		expect(unitless.units()).toBe("");
		expect(denominator.units()).toBe("1/s");
		expect(length.units()).toBe("cm");
		expect(speed.units()).toBe("cm/s");
		expect(area.units()).toBe("cm2");
		expect(specificEnergy.units()).toBe("cm2/s2");
		expect(complex.units()).toBe("cm2*J3/s2*A2");
	});
});
