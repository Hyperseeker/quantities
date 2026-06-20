/**
 * @file Tests for compound unit matching.
 */

import { describe, expect, it } from "bun:test";
import { Extended } from "./shared.ts";

describe("compound unit matching", () => {
	it("matches a named compound unit", () => {
		expect(Extended("9.80665 m/s2").toCompound()).toBe("1 gee");
	});

	it("falls back to original units when no named unit matches", () => {
		expect(Extended("1 m/s").toCompound()).toBe("1 m/s");
	});

	it("matches compound unit with unity denominator", () => {
		expect(Extended("100 bpm").toCompound()).toBe("100 bpm");
	});

	it("selects from multiple matching compound units", () => {
		expect(Extended("1 J/kg").toCompound()).toBe("1 Gy");
	});
});
