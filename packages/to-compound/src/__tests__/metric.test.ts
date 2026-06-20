/**
 * @file Tests for metric prefix scaling and sub-unity prefix policy.
 */

import { Extended } from "./shared.ts";
import { describe, it, expect } from "bun:test";

describe("metric prefix scaling", () => {
	it("applies kilo prefix", () => {
		expect(Extended("1000 g").toCompound()).toBe("1 kg");
	});

	it("splits at prefix boundary", () => {
		expect(Extended("1200 g").toCompound()).toBe("1 kg 200 g");
	});

	it("folds valid units into smaller units for appropriate values", () => {
		expect(Extended("0.001 m").toCompound()).toBe("1 mm");
	});
});

describe("sub-unity prefix policy", () => {
	describe("seconds", () => {
		it("blocks supra-unity prefix for seconds", () => {
			const result = Extended("1000 s").toCompound();

			expect(result).not.toContain("ks");
		});

		it("decomposes 0.001 s into milliseconds", () => {
			expect(Extended("0.001 s").toCompound()).toBe("1 ms");
		});

		it("decomposes 0.000001 s into microseconds", () => {
			expect(Extended("0.000001 s").toCompound()).toBe("1 us");
		});

		it("chains prefix from milliseconds to microseconds", () => {
			expect(Extended("0.001 ms").toCompound()).toBe("1 us");
		});

		it("decomposes 1.5 s into seconds and milliseconds", () => {
			expect(Extended("1.5 s").toCompound()).toBe("1 s 500 ms");
		});

		it("decomposes 61.001 s into min, s, and ms", () => {
			expect(Extended("61.001 s").toCompound()).toBe("1 min 1 s 1 ms");
		});

		it("decomposes 3661 s using subsystem only", () => {
			expect(Extended("3661 s").toCompound()).toBe("1 h 1 min 1 s");
		});
	});

	describe("Kelvin", () => {
		it("blocks supra-unity prefix for kelvin", () => {
			const result = Extended("1000 degK").toCompound();

			expect(result).not.toContain("kdegK");
		});

		it("decomposes 0.001 degK into sub-unity prefixed form", () => {
			const result = Extended("0.001 degK").toCompound();

			expect(result).toBe("1 mdegK");
		});

		it("does not overshoot 1000 ms into supra-unity", () => {
			const result = Extended("1000 ms").toCompound();

			expect(result).not.toContain("ks");
		});
	});
});
