/**
 * @file Tests for prefix registration and validation.
 */

import type { PrefixEntry, UnitMap } from "@quantities/core";
import { describe, expect, it } from "bun:test";
import { checkPrefixAliasCollisions, validatePrefixEntry } from "../index.ts";

/**
 * A minimal prefix used as a validation fixture.
 */
const PREFIX: PrefixEntry = {
	key: "<myprefix>",
	aliases: ["my"],
	scalar: 42,
};

describe("Prefix entry validation", () => {
	it("accepts a valid prefix", () => {
		expect(() => validatePrefixEntry(PREFIX)).not.toThrow();
	});

	it("rejects non-finite prefix scalar", () => {
		const bad: PrefixEntry = {
			key: "<bad>",
			aliases: ["bad"],
			scalar: NaN,
		};

		expect(() => validatePrefixEntry(bad)).toThrow("finite number");
	});
});

describe("Prefix alias collision detection", () => {
	it("returns alias map for prefixes", () => {
		const units: UnitMap = {
			"<kilo>": [["k"], 1000, "prefix"],
			"<mega>": [["M"], 1e6, "prefix"],
		};

		const map = checkPrefixAliasCollisions(units);

		expect(map["k"]).toBe("<kilo>");
		expect(map["M"]).toBe("<mega>");
	});

	it("throws on prefix collision", () => {
		const units: UnitMap = {
			"<a>": [["x"], 10, "prefix"],
			"<b>": [["x"], 20, "prefix"],
		};

		expect(() => checkPrefixAliasCollisions(units)).toThrow(
			"Prefix alias collision",
		);
	});

	it("allows prefix collision with allowOverride", () => {
		const units: UnitMap = {
			"<a>": [["x"], 10, "prefix"],
			"<b>": [["x"], 20, "prefix"],
		};

		const map = checkPrefixAliasCollisions(units, true);

		expect(map["x"]).toBe("<b>");
	});

	it("skips non-prefix entries", () => {
		const units: UnitMap = {
			"<meter>": [["m"], 1, "length", ["<meter>"]],
			"<milli>": [["m"], 0.001, "prefix"],
		};

		expect(() => checkPrefixAliasCollisions(units)).not.toThrow();
	});
});
