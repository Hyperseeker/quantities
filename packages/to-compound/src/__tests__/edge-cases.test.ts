/**
 * @file Tests for edge-case handling.
 */

import { describe, expect, it } from "bun:test";
import { Extended } from "./shared.ts";

describe("temperature passthrough", () => {
	it("preserves degC as-is", () => {
		expect(Extended("100 degC").toCompound()).toBe("100 degC");
	});

	it("preserves degF as-is", () => {
		expect(Extended("212 degF").toCompound()).toBe("212 degF");
	});
});

describe("negative values", () => {
	it("preserves sign on single-unit output", () => {
		expect(Extended("-500 g").toCompound()).toBe("-500 g");
	});

	it("preserves sign on compound output", () => {
		expect(Extended("-1200 g").toCompound(["kg", "g"])).toBe("-1 kg 200 g");
	});
});

describe("chaining", () => {
	it("is chainable from core methods", () => {
		const result = Extended("600 g").add("600 g").toCompound();

		expect(result).toBe("1 kg 200 g");
	});
});
