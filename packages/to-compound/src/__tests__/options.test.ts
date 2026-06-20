/**
 * @file Tests for compound formatting options.
 */

import { describe, expect, it } from "bun:test";
import { Extended } from "./shared.ts";

describe("options", () => {
	it("shows zero with original unit when quantity is zero", () => {
		expect(Extended("0 g").toCompound()).toBe("0 g");
		expect(Extended("0 kg").toCompound()).toBe("0 kg");
	});

	it("shows zero in the smallest target unit when all components vanish", () => {
		expect(Extended("0 ml").toCompound(["L", "ml"], { precision: 0 })).toBe(
			"0 ml",
		);
	});

	it("handles precision option", () => {
		const result = Extended("1020.56 g").toCompound(["kg", "g"], {
			precision: 1,
		});

		expect(result).toBe("1 kg 20.6 g");
	});

	it("includes zero components when skipZeros is false", () => {
		const result = Extended("1000 g").toCompound(["kg", "g"], {
			skipZeros: false,
		});

		expect(result).toBe("1 kg 0 g");
	});

	it("filters small remainders with threshold", () => {
		const result = Extended("1000.001 g").toCompound(["kg", "g"], {
			threshold: 0.01,
		});

		expect(result).toBe("1 kg");
	});

	it("applies custom formatter", () => {
		const simple = Extended("5 m").toCompound(["m"], {
			formatter: (scalar, unit) => `${scalar} ${unit}(s)`,
		});
		const compound = Extended("1200 g").toCompound(["kg", "g"], {
			formatter: (scalar, unit) => `${scalar}${unit}`,
		});

		expect(simple).toBe("5 m(s)");
		expect(compound).toBe("1kg 200g");
	});

	it("applies precision on single-unit explicit target", () => {
		const result = Extended("1.23456 m").toCompound(["m"], {
			precision: 2,
		});

		expect(result).toBe("1.23 m");
	});
});

describe("step option", () => {
	it("uses step 1 for finer prefix tiers", () => {
		const result = Extended("50 g").toCompound(undefined, { step: 1 });

		// * deca- is the next power of 10
		expect(result).toBe("5 dag");
	});
});
