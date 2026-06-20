/**
 * @file Tests for subsystem-walk unit selection.
 */

import { describe, expect, it } from "bun:test";
import { Extended } from "./shared.ts";

describe("subsystem walk", () => {
	describe("time", () => {
		it("converts seconds to minutes", () => {
			expect(Extended("600 s").toCompound()).toBe("10 min");
		});

		it("converts seconds to hours", () => {
			expect(Extended("3600 s").toCompound()).toBe("1 h");
		});

		it("preserves values without clean fit", () => {
			expect(Extended("30 s").toCompound()).toBe("30 s");
		});

		it("walks siblings when input has a parent", () => {
			expect(Extended("90 min").toCompound()).toBe("1 h 30 min");
		});

		it("selects integer-fit larger unit", () => {
			expect(Extended("720 min").toCompound()).toBe("12 h");
		});

		it("cascades through three units from minutes", () => {
			expect(Extended("1501 min").toCompound()).toBe("1 d 1 h 1 min");
		});

		it("cascades through three units from hours", () => {
			expect(Extended("25.5 h").toCompound()).toBe("1 d 1 h 30 min");
		});
	});

	describe("lengths", () => {
		it("folds inches into feet", () => {
			expect(Extended("12 in").toCompound()).toBe("1 ft");
		});

		it("preserves inches under the fold", () => {
			expect(Extended("11 in").toCompound()).toBe("11 in");
		});

		it("folds feet into miles", () => {
			expect(Extended("5280 ft").toCompound()).toBe("1 mi");
		});

		it("folds more feet into miles and feet", () => {
			expect(Extended("5281 ft").toCompound()).toBe("1 mi 1 ft");
		});

		it("folds inches into miles", () => {
			expect(Extended("63360 in").toCompound()).toBe("1 mi");
		});

		it("preserves boundary between metric and imperial", () => {
			expect(Extended("10 ft").toCompound()).not.toBe("3.048 m");
		});
	});
});
