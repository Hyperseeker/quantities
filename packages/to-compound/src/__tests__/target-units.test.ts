/**
 * @file Tests for explicit target-unit formatting.
 */

import { describe, expect, it } from "bun:test";
import { Extended } from "./shared.ts";

describe("explicit target units", () => {
	it("decomposes with no units", () => {
		expect(Extended("1200 g").toCompound()).toBe("1 kg 200 g");
	});

	it("respects provided units", () => {
		expect(Extended("1200 g").toCompound(["g"])).toBe("1200 g");
	});

	it("decomposes into a multitude of units", () => {
		expect(
			Extended("1234.56789 g").toCompound(["kg", "g", "mg", "ug"]),
		).toBe("1 kg 234 g 567 mg 890 ug");
	});

	it("skips units with zero value", () => {
		expect(Extended("1000 g").toCompound(["kg", "g"])).toBe("1 kg");
	});

	it("throws on incompatible units", () => {
		expect(() => Extended("1 m").toCompound(["kg"])).toThrow();
	});

	it("throws on incompatible units in multi-unit list", () => {
		expect(() => Extended("1 m").toCompound(["kg", "g"])).toThrow();
	});
});
