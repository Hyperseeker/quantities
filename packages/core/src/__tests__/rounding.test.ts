/**
 * @file Tests rounding behavior of quantities.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("precision rounding", () => {
	it("should round according to precision passed as quantity with same units", () => {
		const feetNoNotThoseOnes = Quantity("5.17 ft");

		expect(feetNoNotThoseOnes.toPrecision(Quantity("ft")).toString()).toBe(
			"5 ft",
		);
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("2 ft")).toString(),
		).toBe("6 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("10 ft")).toString(),
		).toBe("10 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("0.5 ft")).toString(),
		).toBe("5 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("0.1 ft")).toString(),
		).toBe("5.2 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("0.05 ft")).toString(),
		).toBe("5.15 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("0.01 ft")).toString(),
		).toBe("5.17 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("0.0001 ft")).toString(),
		).toBe("5.17 ft");
		expect(
			feetNoNotThoseOnes.toPrecision(Quantity("0.25 ft")).toString(),
		).toBe("5.25 ft");
	});

	it("should allow string as precision parameter", () => {
		const feet = Quantity("5.17 ft");

		expect(feet.toPrecision("ft").toString()).toBe("5 ft");
		expect(feet.toPrecision("0.5 ft").toString()).toBe("5 ft");
		expect(feet.toPrecision("0.05 ft").toString()).toBe("5.15 ft");
	});

	it("should allow number as precision parameter", () => {
		const kilometers = Quantity("3.12 km");

		expect(kilometers.toPrecision(1).toString()).toBe("3 km");
		// oxlint-disable-next-line oxc/number-arg-out-of-range
		expect(kilometers.toPrecision(0.5).toString()).toBe("3 km");
		// oxlint-disable-next-line oxc/number-arg-out-of-range
		expect(kilometers.toPrecision(0.05).toString()).toBe("3.1 km");
		// oxlint-disable-next-line oxc/number-arg-out-of-range
		expect(kilometers.toPrecision(0.005).toString()).toBe("3.12 km");
	});

	it("should round according to precision passed as quantity with different prefixes", () => {
		const meters = Quantity("6.3782 m");

		expect(meters.toPrecision(Quantity("dm")).toString()).toBe("6.4 m");
		expect(meters.toPrecision(Quantity("cm")).toString()).toBe("6.38 m");
		expect(meters.toPrecision(Quantity("mm")).toString()).toBe("6.378 m");

		expect(meters.toPrecision(Quantity("5 cm")).toString()).toBe("6.4 m");
	});

	it("should round according to precision passed as quantity with different compatible units", () => {
		const pressure = Quantity("1.146 MPa");

		expect(pressure.toPrecision(Quantity("0.1 bar")).toString()).toBe(
			"1.15 MPa",
		);
		expect(pressure.toPrecision(Quantity("0.01 MPa")).toString()).toBe(
			"1.15 MPa",
		);
		expect(pressure.toPrecision(Quantity("dbar")).toString()).toBe(
			"1.15 MPa",
		);

		// * safety-net tests for regression tracking
		const feetsies = Quantity("5.171234568 ft");

		expect(feetsies.toPrecision(Quantity("m")).toString()).toBe(
			"6.561679790026246 ft",
		);
		expect(feetsies.toPrecision(Quantity("dm")).toString()).toBe(
			"5.2493438320209975 ft",
		);
		expect(feetsies.toPrecision(Quantity("cm")).toString()).toBe(
			"5.183727034120735 ft",
		);
		expect(feetsies.toPrecision(Quantity("mm")).toString()).toBe(
			"5.170603674540683 ft",
		);
	});

	it("should throw on 0 precision", () => {
		const kilometers = Quantity("3.12 km");

		// oxlint-disable-next-line oxc/number-arg-out-of-range
		expect(() => kilometers.toPrecision(0)).toThrow();
	});
});
