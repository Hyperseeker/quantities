/**
 * @file Tests for unit validation helpers.
 */

import type { UnitEntry, UnitMap } from "@quantities/core";
import { DEFAULT_REGISTRY } from "@quantities/core";
import {
	checkUnitAliasCollisions,
	detectCycles,
	validateScalar,
	validateUnitEntry,
} from "../validation.ts";
import { describe, expect, it } from "bun:test";
import { UNIT_WIDGET } from "./shared.ts";

describe("Unit validation", () => {
	describe("Scalar validation", () => {
		it("accepts finite numbers", () => {
			expect(() => validateScalar(1, "<test>")).not.toThrow();
			expect(() => validateScalar(0, "<test>")).not.toThrow();
			expect(() => validateScalar(-100, "<test>")).not.toThrow();
		});

		it("rejects Infinity", () => {
			expect(() => validateScalar(Infinity, "<x>")).toThrow(
				"finite number",
			);
		});

		it("rejects NaN", () => {
			expect(() => validateScalar(NaN, "<x>")).toThrow("finite number");
		});
	});

	describe("Cycle detection", () => {
		it("allows self-referential base definitions", () => {
			const units: UnitMap = {
				"<base>": [["base"], 1, "test", ["<base>"]],
			};

			expect(() => detectCycles(units)).not.toThrow();
		});

		it("allows acyclic chains", () => {
			const units: UnitMap = {
				"<a>": [["a"], 1, "test", ["<a>"]],
				"<b>": [["b"], 2, "test", ["<a>"]],
				"<c>": [["c"], 3, "test", ["<b>"]],
			};

			expect(() => detectCycles(units)).not.toThrow();
		});

		it("detects two-node cycle", () => {
			const units: UnitMap = {
				"<a>": [["a"], 1, "test", ["<b>"]],
				"<b>": [["b"], 1, "test", ["<a>"]],
			};

			expect(() => detectCycles(units)).toThrow("Cycle detected");
		});

		it("detects three-node cycle", () => {
			const units: UnitMap = {
				"<a>": [["a"], 1, "test", ["<b>"]],
				"<b>": [["b"], 1, "test", ["<c>"]],
				"<c>": [["c"], 1, "test", ["<a>"]],
			};

			expect(() => detectCycles(units)).toThrow("Cycle detected");
		});
	});

	describe("Unit alias collision detection", () => {
		it("returns alias map when no collisions", () => {
			const units: UnitMap = {
				"<a>": [["alpha"], 1, "test", ["<a>"]],
				"<b>": [["beta"], 1, "test", ["<b>"]],
			};

			const map = checkUnitAliasCollisions(units);

			expect(map["alpha"]).toBe("<a>");
			expect(map["beta"]).toBe("<b>");
		});

		it("throws on collision by default", () => {
			const units: UnitMap = {
				"<a>": [["shared"], 1, "test", ["<a>"]],
				"<b>": [["shared"], 1, "test", ["<b>"]],
			};

			expect(() => checkUnitAliasCollisions(units)).toThrow(
				"Alias collision",
			);
		});

		it("allows collision with allowOverride", () => {
			const units: UnitMap = {
				"<a>": [["shared"], 1, "test", ["<a>"]],
				"<b>": [["shared"], 1, "test", ["<b>"]],
			};

			const map = checkUnitAliasCollisions(units, true);

			expect(map["shared"]).toBe("<b>");
		});

		it("skips prefix entries", () => {
			const units: UnitMap = {
				"<kilo>": [["k"], 1000, "prefix"],
				"<a>": [["k"], 1, "test", ["<a>"]],
			};

			expect(() => checkUnitAliasCollisions(units)).not.toThrow();
		});
	});

	describe("Unit entry validation", () => {
		it("accepts a valid entry", () => {
			expect(() =>
				validateUnitEntry(UNIT_WIDGET, DEFAULT_REGISTRY.units),
			).not.toThrow();
		});

		it("rejects entry with bad reference", () => {
			const bad: UnitEntry = {
				key: "<bad>",
				aliases: ["bad"],
				scalar: 1,
				kind: "test",
				numerator: ["<nonexistent>"],
			};

			expect(() =>
				validateUnitEntry(bad, DEFAULT_REGISTRY.units),
			).toThrow("not recognized");
		});
	});
});
