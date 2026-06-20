/**
 * @file Tests the default unit registry behavior.
 */

import { describe, expect, it } from "bun:test";
import { DEFAULT_REGISTRY } from "../quantities/registry.ts";

describe("registry", () => {
	describe("parseUnits()", () => {
		it("should match exact unit aliases", () => {
			const meter = DEFAULT_REGISTRY.parseUnits("m");
			const foot = DEFAULT_REGISTRY.parseUnits("ft");
			const pascal = DEFAULT_REGISTRY.parseUnits("Pa");

			expect(meter).toEqual(["<meter>"]);
			expect(foot).toEqual(["<foot>"]);
			expect(pascal).toEqual(["<pascal>"]);
		});

		it("should parse prefix + unit combinations", () => {
			const millimeter = DEFAULT_REGISTRY.parseUnits("mm");
			const kilopascal = DEFAULT_REGISTRY.parseUnits("kPa");
			const megahertz = DEFAULT_REGISTRY.parseUnits("MHz");
			const nanometer = DEFAULT_REGISTRY.parseUnits("nm");
			const microsecond = DEFAULT_REGISTRY.parseUnits("us");

			expect(millimeter).toEqual(["<milli>", "<meter>"]);
			expect(kilopascal).toEqual(["<kilo>", "<pascal>"]);
			expect(megahertz).toEqual(["<mega>", "<hertz>"]);
			expect(nanometer).toEqual(["<nano>", "<meter>"]);
			expect(microsecond).toEqual(["<micro>", "<second>"]);
		});

		it("should prefer unit over prefix + unit when alias matches exactly", () => {
			const meterNotMilli = DEFAULT_REGISTRY.parseUnits("m");
			const footNotFemtoTon = DEFAULT_REGISTRY.parseUnits("ft");
			const mileNotMilliInch = DEFAULT_REGISTRY.parseUnits("mi");
			const minuteNotMilliNewton = DEFAULT_REGISTRY.parseUnits("min");

			expect(meterNotMilli).toEqual(["<meter>"]);
			expect(footNotFemtoTon).toEqual(["<foot>"]);
			expect(mileNotMilliInch).toEqual(["<mile>"]);
			expect(minuteNotMilliNewton).toEqual(["<minute>"]);
		});

		it("should handle aliases that are both prefix and unit", () => {
			const teslaTheUnit = DEFAULT_REGISTRY.parseUnits("T");
			const molarNotMega = DEFAULT_REGISTRY.parseUnits("M");
			const hourNotHecto = DEFAULT_REGISTRY.parseUnits("h");
			const dayNotDeci = DEFAULT_REGISTRY.parseUnits("d");
			const yearNotYocto = DEFAULT_REGISTRY.parseUnits("y");

			expect(teslaTheUnit).toEqual(["<tesla>"]);
			expect(molarNotMega).toEqual(["<molar>"]);
			expect(hourNotHecto).toEqual(["<hour>"]);
			expect(dayNotDeci).toEqual(["<day>"]);
			expect(yearNotYocto).toEqual(["<year>"]);
		});

		it("should use longest matching prefix", () => {
			const decameter = DEFAULT_REGISTRY.parseUnits("dam");
			const hectometer = DEFAULT_REGISTRY.parseUnits("hm");

			expect(decameter).toEqual(["<deca>", "<meter>"]);
			expect(hectometer).toEqual(["<hecto>", "<meter>"]);
		});

		it("should parse binary prefixes", () => {
			const kibibyte = DEFAULT_REGISTRY.parseUnits("KiB");
			const mebibyte = DEFAULT_REGISTRY.parseUnits("MiB");
			const gibibyte = DEFAULT_REGISTRY.parseUnits("GiB");
			const tebibyteTheBigOne = DEFAULT_REGISTRY.parseUnits("TiB");

			expect(kibibyte).toEqual(["<kibi>", "<byte>"]);
			expect(mebibyte).toEqual(["<mebi>", "<byte>"]);
			expect(gibibyte).toEqual(["<gibi>", "<byte>"]);
			expect(tebibyteTheBigOne).toEqual(["<tebi>", "<byte>"]);
		});

		it("should parse space-separated unit products", () => {
			const meterSecondSecond = DEFAULT_REGISTRY.parseUnits("m s s");
			const kiloGramMeter = DEFAULT_REGISTRY.parseUnits("kg m");

			expect(meterSecondSecond).toEqual([
				"<meter>",
				"<second>",
				"<second>",
			]);
			expect(kiloGramMeter).toEqual(["<kilo>", "<gram>", "<meter>"]);
		});

		it("should parse asterisk-separated unit products", () => {
			const newtonMeter = DEFAULT_REGISTRY.parseUnits("N*m");
			const kiloWattHour = DEFAULT_REGISTRY.parseUnits("kW*h");

			expect(newtonMeter).toEqual(["<newton>", "<meter>"]);
			expect(kiloWattHour).toEqual(["<kilo>", "<watt>", "<hour>"]);
		});
	});

	describe("getUnitKeys()", () => {
		it("should return keys for a specific kind", () => {
			const keys = DEFAULT_REGISTRY.getUnitKeys("length");

			expect(keys).toContain("<meter>");
			expect(keys).toContain("<foot>");
		});

		it("should return all non-prefix keys without kind argument", () => {
			const keys = DEFAULT_REGISTRY.getUnitKeys();

			expect(keys).toContain("<meter>");
			expect(keys).toContain("<second>");
			expect(keys.every((key) => key.startsWith("<"))).toBe(true);
		});
	});

	describe("getPrimaryAlias()", () => {
		it("should return the first alias for a unit key", () => {
			expect(DEFAULT_REGISTRY.getPrimaryAlias("<meter>")).toBe("m");
			expect(DEFAULT_REGISTRY.getPrimaryAlias("<second>")).toBe("s");
		});

		it("should return undefined for unknown keys", () => {
			expect(
				DEFAULT_REGISTRY.getPrimaryAlias("<nonexistent>"),
			).toBeUndefined();
		});
	});

	describe("getScalar()", () => {
		it("should return the scalar for a unit key", () => {
			expect(DEFAULT_REGISTRY.getScalar("<meter>")).toBe(1);
		});

		it("should return undefined for unknown keys", () => {
			expect(DEFAULT_REGISTRY.getScalar("<nonexistent>")).toBeUndefined();
		});
	});

	describe("getBaseScalar()", () => {
		it("should return the base scalar for a unit string", () => {
			expect(DEFAULT_REGISTRY.getBaseScalar("km")).toBe(1000);
			expect(DEFAULT_REGISTRY.getBaseScalar("cm")).toBe(0.01);
		});
	});

	describe("getPrefixValue()", () => {
		it("should return prefix scalar", () => {
			expect(DEFAULT_REGISTRY.getPrefixValue("<kilo>")).toBe(1000);
			expect(DEFAULT_REGISTRY.getPrefixValue("<milli>")).toBe(0.001);
		});

		it("should return 1 for unknown prefix", () => {
			expect(DEFAULT_REGISTRY.getPrefixValue("<nonexistent>")).toBe(1);
		});
	});

	describe("getUnitValue()", () => {
		it("should return unit value for known unit", () => {
			const value = DEFAULT_REGISTRY.getUnitValue("<meter>");

			expect(value).toBeDefined();
			expect(value!.scalar).toBe(1);
		});

		it("should return undefined for unknown unit", () => {
			expect(
				DEFAULT_REGISTRY.getUnitValue("<nonexistent>"),
			).toBeUndefined();
		});
	});

	describe("getOutputName()", () => {
		it("should return output name for known key", () => {
			expect(DEFAULT_REGISTRY.getOutputName("<meter>")).toBe("m");
			expect(DEFAULT_REGISTRY.getOutputName("<second>")).toBe("s");
		});

		it("should return empty string for unknown key", () => {
			expect(DEFAULT_REGISTRY.getOutputName("<nonexistent>")).toBe("");
		});
	});

	describe("getKindForKey()", () => {
		it("should return kind for known unit", () => {
			expect(DEFAULT_REGISTRY.getKindForKey("<meter>")).toBe("length");
			expect(DEFAULT_REGISTRY.getKindForKey("<second>")).toBe("time");
		});

		it("should return undefined for unknown key", () => {
			expect(
				DEFAULT_REGISTRY.getKindForKey("<nonexistent>"),
			).toBeUndefined();
		});
	});

	describe("prefix-preserving expansion", () => {
		it("should preserve prefix on base unit (Newton)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<newton>"]);

			expect(result.numerator).toEqual(["<kilo>", "<gram>", "<meter>"]);
			expect(result.denominator).toEqual(["<second>", "<second>"]);
		});

		it("should preserve prefix on base unit in denominator (Farad)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<farad>"]);

			expect(result.denominator).toContain("<kilo>");
			expect(result.denominator).toContain("<gram>");
		});

		it("should fold prefix on derived unit (Bar = 100 kPa)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<bar>"]);

			// <kilo> on <pascal> is folded, pascal's own <kilo><gram> preserved
			expect(result.numerator).toEqual(["<kilo>", "<gram>"]);
		});

		it("should preserve embedded prefixes (Angstrom)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<angstrom>"]);

			expect(result.numerator).toEqual(["<nano>", "<meter>"]);
			expect(result.denominator).toEqual([]);
		});

		it("should store absolute scalar in UNIT_VALUES (Newton)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<newton>"]);

			// scalar includes the kilo factor (1000), same as before the change
			expect(result.scalar).toBe(1000);
		});

		it("should store absolute scalar in UNIT_VALUES (Farad)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<farad>"]);

			expect(result.scalar).toBe(0.001);
		});

		it("should store absolute scalar in UNIT_VALUES (Bar)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<bar>"]);

			// 100 (def scalar) × 1000 (kilo on pascal) × 1 (pascal expansion) × 1000 (kilo on gram in arrays)
			expect(result.scalar).toBe(1e8);
		});

		it("should store absolute scalar in UNIT_VALUES (Angstrom)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<angstrom>"]);

			expect(result.scalar).toBe(1e-10);
		});

		it("should not change units without prefixes on base units (Hertz)", () => {
			const result = DEFAULT_REGISTRY.expandToBase(["<hertz>"]);

			expect(result.numerator).toEqual([]);
			expect(result.denominator).toEqual(["<second>"]);
		});
	});

	describe("isValidUnitProduct()", () => {
		it("should return true for valid unit products", () => {
			expect(DEFAULT_REGISTRY.isValidUnitProduct("m")).toBe(true);
			expect(DEFAULT_REGISTRY.isValidUnitProduct("m s")).toBe(true);
		});

		it("should throw for invalid unit products", () => {
			expect(() => DEFAULT_REGISTRY.isValidUnitProduct("zzz")).toThrow(
				"Unit not recognized",
			);
		});
	});
});
