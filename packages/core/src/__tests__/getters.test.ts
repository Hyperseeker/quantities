/**
 * @file Tests quantity getter accessors.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("getter functions", () => {
	describe("Quantity.getKinds", () => {
		it("should return an array of kind names", () => {
			expect(Quantity.getKinds()).toContain("resistance");
		});

		it("should not contain duplicate kind names", () => {
			const kinds = Quantity.getKinds();
			const map: Record<string, number> = {};

			kinds.forEach((kind) => {
				map[kind] = 1;
			});

			expect(kinds.length).toEqual(Object.keys(map).length);
		});
	});

	describe("Quantity.getUnits", () => {
		it("should return an array of units of kind", () => {
			expect(Quantity.getUnits("currency")).toContain("dollar");
		});

		it("should return correct units for molar_concentration", () => {
			expect(Quantity.getUnits("molar_concentration")).toContain("molar");
		});

		it("should return an array of all units without arg", () => {
			expect(Quantity.getUnits()).toContain("sievert");
		});
		it("should throw unknown kind", () => {
			expect(() => {
				Quantity.getUnits("bogusKind");
			}).toThrow("Kind not recognized");
		});
	});

	describe("Quantity.getAliases", () => {
		it("should return array of alternative names for unit", () => {
			expect(Quantity.getAliases("m")).toContain("meter");
			expect(Quantity.getAliases("meter")).toContain("metre");
			expect(Quantity.getAliases("N")).toContain("newton");
		});
	});
});
