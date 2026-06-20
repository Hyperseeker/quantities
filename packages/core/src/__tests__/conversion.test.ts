/**
 * @file Tests for quantity unit conversion.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";
import { divideSafely } from "../quantities/math.ts";

describe("conversion", () => {
	it("should convert to base units", () => {
		const meter = Quantity("100 cm");
		const centimeters = Quantity("10 cm");
		const microspeed = Quantity("0.3 mm^2 ms^-2");

		expect(meter.toBase().scalar).toBe(1);
		expect(meter.toBase().units()).toBe("m");

		expect(centimeters.toBase().scalar).toBe(0.1);
		expect(centimeters.toBase().units()).toBe("m");

		expect(microspeed.toBase().scalar).toBe(0.3);
		expect(microspeed.toBase().units()).toBe("m2/s2");
	});

	it("should show prefix-preserving base units for SI derived units", () => {
		expect(Quantity("1 N").toBase().scalar).toBe(1);
		expect(Quantity("1 N").toBase().units()).toBe("kg*m/s2");

		expect(Quantity("1 J").toBase().scalar).toBe(1);
		expect(Quantity("1 J").toBase().units()).toBe("kg*m2/s2");

		expect(Quantity("1 Pa").toBase().scalar).toBe(1);
		expect(Quantity("1 Pa").toBase().units()).toBe("kg/m*s2");

		expect(Quantity("1 W").toBase().scalar).toBe(1);
		expect(Quantity("1 W").toBase().units()).toBe("kg*m2/s3");

		expect(Quantity("1 F").toBase().scalar).toBe(1);
		expect(Quantity("1 F").toBase().units()).toBe("A2*s4/kg*m2");
	});

	it("should show prefix-preserving base units for units with embedded prefixes", () => {
		expect(Quantity("1 angstrom").toBase().scalar).toBe(0.1);
		expect(Quantity("1 angstrom").toBase().units()).toBe("nm");

		expect(Quantity("1 carat").toBase().scalar).toBe(200);
		expect(Quantity("1 carat").toBase().units()).toBe("mg");
	});

	it("should still strip user-input prefixes in toBase()", () => {
		expect(Quantity("100 cm").toBase().scalar).toBe(1);
		expect(Quantity("100 cm").toBase().units()).toBe("m");

		expect(Quantity("10 cm").toBase().scalar).toBe(0.1);
		expect(Quantity("10 cm").toBase().units()).toBe("m");
	});

	it("should convert to compatible units", () => {
		const centimeters = Quantity("10 cm");
		const metersCubed = Quantity("2m^3");
		const meterCubed = Quantity("1 m3");
		const centimeterCubed = Quantity("1 cm3");
		const centimetersCubed = Quantity("550 cm3");
		const quantity = Quantity("0.000773 m3");
		const tons = Quantity("10 t");
		const kilograms = Quantity("5 kg");

		expect(centimeters.to("ft").scalar).toBe(divideSafely(0.1, 0.3048));
		expect(centimeters.to(Quantity("m")).scalar).toBe(0.1);
		expect(centimeters.to(Quantity("20m")).scalar).toBe(0.1);

		expect(metersCubed.to("l").scalar).toBe(2000);

		expect(meterCubed.to("cm3").scalar).toBe(1000000);

		expect(centimeterCubed.to("mm3").scalar).toBe(1000);

		expect(centimetersCubed.to("cm^3").scalar).toBe(550);

		expect(quantity.to("cm^3").scalar).toBe(773);

		expect(tons.to("kg").scalar).toBe(10000);

		expect(kilograms.to("g").scalar).toBe(5000);
	});

	describe("percents", () => {
		const decimal = Quantity("0.1");
		const percentage = Quantity("10 %");

		it("should convert from % to unitless", () => {
			expect(percentage.to("").isSame(decimal)).toBe(true);
		});

		it("should convert from unitless to %", () => {
			expect(decimal.to("%").isSame(percentage)).toBe(true);
		});
	});

	it("should convert temperatures to compatible units", () => {
		const kelvin = Quantity("0 tempK");
		const fahrenheit = Quantity("0 tempF");
		const moreFahrenheit = Quantity("32 tempF");
		const celsius = Quantity("0 tempC");

		expect(kelvin.to("tempC").scalar).toBe(-273.15);
		expect(fahrenheit.to("tempK").scalar).toBe(255.3722222222222);
		expect(moreFahrenheit.to("tempC").scalar).toBe(0);
		expect(celsius.to("tempF").scalar).toBe(32);
	});

	it("should convert temperature degrees to compatible units", () => {
		const zeroDegK = Quantity("0 degK");
		const degKPerSecond = Quantity("1 degK/s");
		const cmPerDegF = Quantity("100 cm/degF");
		const tenDegC = Quantity("10 degC");
		const nineDegF = Quantity("9 degF");

		expect(zeroDegK.to("degC").scalar).toBe(0);
		expect(degKPerSecond.to("degC/min").scalar).toBe(60);
		expect(cmPerDegF.to("m/degF").scalar).toBe(1);
		expect(tenDegC.to("degF").scalar).toBe(18);
		expect(nineDegF.to("degC").scalar).toBe(5);
	});

	it("should convert temperature degrees to temperatures", () => {
		// * degree → temperature conversion adds the degress to 0 Kelvin before converting
		const hundredDegC = Quantity("100 degC");
		const absoluteZeroDegC = Quantity("273.15 degC");
		const absoluteZeroDegF = Quantity("460.67 degF");

		expect(hundredDegC.to("tempC").scalar).toBe(-173.15);
		expect(absoluteZeroDegC.to("tempC").scalar).toBe(0);
		expect(absoluteZeroDegF.to("tempF").scalar).toBe(1);
	});

	it("should convert temperatures to temperature degrees", () => {
		// * temperature → degree conversion always uses the 0 relative degrees
		const hundredTempC = Quantity("100 tempC");
		const zeroTempK = Quantity("0 tempK");
		const zeroTempF = Quantity("0 tempF");
		const eighteenTempF = Quantity("18 tempF");
		const tenTempC = Quantity("10 tempC");

		expect(hundredTempC.to("degC").scalar).toBe(100);
		expect(zeroTempK.to("degC").scalar).toBe(0);
		expect(zeroTempF.to("degK").scalar).toBe(0);
		expect(eighteenTempF.to("degC").scalar).toBe(10);
		expect(tenTempC.to("degF").scalar).toBe(18);
	});

	it("should calculate inverses", () => {
		const oneOhm = Quantity("1 ohm");
		const tenOhm = Quantity("10 ohm");
		const zeroOhm = Quantity("0 ohm");
		const tenSiemens = Quantity("10 siemens");

		const invertedTenOhm = Quantity("10 ohm").inverse();
		const invertedTwelveInch = Quantity("12 in").inverse();

		expect(oneOhm.to("siemens").scalar).toBe(1);
		expect(oneOhm.to("siemens").kind()).toBe("conductance");

		expect(tenOhm.to("siemens").scalar).toBe(0.1);
		expect(tenOhm.to("siemens").kind()).toBe("conductance");

		expect(tenSiemens.to("ohm").scalar).toBe(0.1);
		expect(tenSiemens.to("ohm").kind()).toBe("resistance");

		expect(tenSiemens.inverse().equals(".1 ohm")).toBe(true);
		expect(tenSiemens.inverse().kind()).toBe("resistance");

		// * cannot inverse a quantity with a 0 scalar
		expect(() => zeroOhm.inverse()).toThrow("Attempted to divide by zero");

		expect(invertedTenOhm.to("S").scalar).toBe(0.1);
		expect(invertedTenOhm.to("S").kind()).toBe("conductance");

		expect(invertedTwelveInch.to("ft").scalar).toBe(1);
	});

	it("should throw when converting quantity with units to float", () => {
		const quantity = Quantity("5 m");

		expect(() => quantity.toFloat()).toThrow(
			"Can't convert quantity with units to float",
		);
	});

	it("should convert Rankine temperatures", () => {
		const rankine = Quantity("180 tempR");
		const kelvin = rankine.to("tempK");

		expect(kelvin.scalar).toBe(100);
		expect(kelvin.units()).toBe("tempK");

		const toRankine = Quantity("100 tempK").to("tempR");

		expect(toRankine.scalar).toBe(180);
		expect(toRankine.units()).toBe("tempR");
	});

	it("should convert Rankine degrees", () => {
		const degreeRankine = Quantity("9 degC").to("degR");

		expect(degreeRankine.scalar).toBe(16.2);
		expect(degreeRankine.units()).toBe("degR");
	});

	it("should convert tempR to degree units via toDegreesKelvin", () => {
		const result = Quantity("9 tempR").to("degK");

		expect(result.scalar).toBe(5);
		expect(result.units()).toBe("degK");
	});

	it("should convert via .toUnits() alias", () => {
		const centimeters = Quantity("10 cm");

		expect(centimeters.toUnits("m").scalar).toBe(0.1);
	});

	it("should return itself if target units are the same", () => {
		const volume = Quantity("123 cm3");
		const weight = Quantity("123 mcg");

		expect(volume.to("cm3")).toBe(volume);
		expect(volume.to("cm^3")).toBe(volume);

		expect(weight.to("ug")).toBe(weight);
	});
});
