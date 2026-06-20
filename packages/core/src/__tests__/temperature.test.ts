/**
 * @file Tests temperature units and conversions.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("math with temperatures", () => {
	it("should add temperature degrees", () => {
		const celsius = Quantity("2degC");
		const kelvin = Quantity("2degK");
		const celsiusSpaced = Quantity("2 degC");

		const celsiheit = celsiusSpaced.add("2 degF");
		const kelvius = kelvin.add("3degC");
		const celvin = celsius.add(kelvin);

		expect(celsius.add("3degF").scalar).toBeCloseTo(11 / 3, 10);
		expect(celsius.add("-1degC").scalar).toBe(1);

		expect(celsiheit.scalar).toBe(28 / 9);
		expect(celsiheit.units()).toBe("degC");

		expect(kelvius.scalar).toBe(5);
		expect(kelvius.units()).toBe("degK");

		expect(celvin.scalar).toBe(4);
		expect(celvin.units()).toBe("degC");
	});

	it("should not add two temperatures", () => {
		const celsiusTemp = Quantity("2tempC");

		expect(() => {
			celsiusTemp.add("1 tempF");
		}).toThrow("Cannot add two temperatures");
		expect(() => {
			celsiusTemp.add("1 tempC");
		}).toThrow("Cannot add two temperatures");
	});

	it("should add temperatures to degrees", () => {
		const celsius = Quantity("2degC");
		const celsiusTemp = Quantity("2 tempC");

		const celsiusMinusTemp = celsius.add("-1tempC");
		const celsiusPlusTempF = celsius.add("3tempF");
		const celsiusTempPlusDegF = celsiusTemp.add("2 degF");

		expect(celsiusPlusTempF.scalar).toBe(33 / 5);
		expect(celsiusPlusTempF.units()).toBe("tempF");

		expect(celsiusMinusTemp.scalar).toBe(1);
		expect(celsiusMinusTemp.units()).toBe("tempC");

		expect(celsiusTempPlusDegF.scalar).toBe(28 / 9);
		expect(celsiusTempPlusDegF.units()).toBe("tempC");
	});

	it("should subtract degrees from degrees", () => {
		const celsius = Quantity("2degC");

		const lessius = celsius.sub("degC");

		expect(celsius.sub("1.5degK").scalar).toBe(0.5);
		expect(celsius.sub("-2degC").scalar).toBe(4);
		expect(celsius.sub("1degF").scalar).toBe(2 - 5 / 9);
		expect(celsius.sub("-1degC").scalar).toBe(3);

		expect(lessius.scalar).toBe(1);
		expect(lessius.units()).toBe("degC");
	});

	it("should subtract degrees from temperatures", () => {
		const celsiusTemp = Quantity("2tempC");

		const tempMinusDegrees = celsiusTemp.sub("degC");

		expect(celsiusTemp.sub("1.5degK").scalar).toBe(0.5);
		expect(celsiusTemp.sub("-2degC").scalar).toBe(4);
		expect(celsiusTemp.sub("1degF").scalar).toBe(2 - 5 / 9);
		expect(celsiusTemp.sub("-1degC").scalar).toBe(3);

		expect(tempMinusDegrees.scalar).toBe(1);
		expect(tempMinusDegrees.units()).toBe("tempC");
	});

	it("should subtract temperatures from temperatures", () => {
		const celsiusTemp = Quantity("2tempC");

		const cTempMinusKTemp = celsiusTemp.sub("1.5tempK");
		const zeroCelsius = celsiusTemp.sub("-2tempC");
		const cTempMinusFTemp = celsiusTemp.sub("32tempF");

		expect(cTempMinusKTemp.scalar).toBe(273.65);
		expect(cTempMinusKTemp.units()).toBe("degC");

		expect(zeroCelsius.scalar).toBe(4);
		expect(zeroCelsius.units()).toBe("degC");

		expect(cTempMinusFTemp.scalar).toBe(2);
		expect(cTempMinusFTemp.units()).toBe("degC");
	});

	it("should not subtract temperatures from degrees", () => {
		const celsius = Quantity("2degC");

		expect(() => {
			celsius.sub("1 tempF");
		}).toThrow(
			"Cannot subtract a temperature from a differential degree unit",
		);
		expect(() => {
			celsius.sub("1 tempC");
		}).toThrow(
			"Cannot subtract a temperature from a differential degree unit",
		);
	});

	it("should multiply temperature degrees", () => {
		const celsius = Quantity("2degC");
		const fahrenheit = Quantity("2degF");

		const celsiusMinusKelvin = celsius.multiply("2degK");
		const celsiusMinusFahrenheit = celsius.multiply("degF");

		const tripleFahrenheit = fahrenheit.multiply(3);
		const alsoTripleFahrenheit = fahrenheit.multiply("3degF");

		expect(tripleFahrenheit.scalar).toBe(6);
		expect(tripleFahrenheit.units()).toBe("degF");

		expect(alsoTripleFahrenheit.scalar).toBe(6);
		expect(alsoTripleFahrenheit.units()).toBe("degF2");

		expect(celsiusMinusKelvin.scalar).toBe(4);
		expect(celsiusMinusKelvin.units()).toBe("degC*degK");

		expect(celsiusMinusFahrenheit.scalar).toBe(2);
		expect(celsiusMinusFahrenheit.units()).toBe("degC*degF");
	});

	it("should not multiply temperatures except by scalar", () => {
		const fahrenheitTemp = Quantity("2tempF");
		const fahrenheitDoubled = fahrenheitTemp.multiply(2);
		const doubleFahrenheits = Quantity("2").multiply(fahrenheitTemp);

		expect(() => {
			fahrenheitTemp.multiply("1 tempC");
		}).toThrow("Cannot multiply by temperatures");
		expect(() => {
			fahrenheitTemp.multiply("1 degC");
		}).toThrow("Cannot multiply by temperatures");
		expect(() => {
			Quantity("1 tempC*s");
		}).toThrow("Cannot multiply by temperatures");

		expect(fahrenheitDoubled.scalar).toBe(4);
		expect(fahrenheitDoubled.units()).toBe("tempF");

		expect(doubleFahrenheits.scalar).toBe(4);
		expect(doubleFahrenheits.units()).toBe("tempF");
	});

	it("should multiply temperature degrees with unlike quantities", () => {
		const fahrenheit = Quantity("2.5 degF");
		const kilosPerFahrenheit = Quantity("3 kg/degF");
		const meters = Quantity("3 m");

		const justKilos = fahrenheit.multiply(kilosPerFahrenheit);
		const fahrenmeters = fahrenheit.multiply(meters);

		expect(fahrenmeters.scalar).toBe(7.5);

		expect(justKilos.scalar).toBe(7.5);
		expect(justKilos.units()).toBe("kg");
	});

	it("should divide temperature degrees with unlike quantities", () => {
		const area = Quantity("2.5m^2");
		const fahrenheit = Quantity("7.5degF");

		const fahrenheitPerArea = fahrenheit.divide(area);

		expect(fahrenheitPerArea.scalar).toBe(3);
		expect(fahrenheitPerArea.units()).toBe("degF/m2");
	});

	it("should divide temperature degree quantities", () => {
		const zeroFahrenheit = Quantity("0 degF");
		const fahrenheit = Quantity("2.5 degF");

		const nothingAtAll = zeroFahrenheit.divide(fahrenheit);
		const unitless = fahrenheit.divide("3 degF");
		const lessHeat = fahrenheit.divide(3);
		const fahrencelsius = fahrenheit.divide("2 degC");

		expect(() => {
			fahrenheit.divide("0 degF");
		}).toThrow("Attempted to divide by zero");
		expect(() => {
			fahrenheit.divide(0);
		}).toThrow("Attempted to divide by zero");

		expect(nothingAtAll.scalar).toBe(0);
		expect(nothingAtAll.units()).toBe("");

		expect(unitless.scalar).toBe(2.5 / 3);
		expect(unitless.units()).toBe("");
		expect(unitless.kind()).toBe("unitless");

		expect(lessHeat.scalar).toBe(2.5 / 3);
		expect(lessHeat.units()).toBe("degF");
		expect(lessHeat.kind()).toBe("temperature");

		expect(fahrencelsius.scalar).toBe(1.25);
		expect(fahrencelsius.units()).toBe("degF/degC");
	});

	it("should not divide with temperatures except by scalar", () => {
		const halvedFahrenheit = Quantity("4 tempF").divide(2);

		expect(() => {
			Quantity("tempF").divide("1 tempC");
		}).toThrow("Cannot divide with temperatures");
		expect(() => {
			Quantity("tempF").divide("1 degC");
		}).toThrow("Cannot divide with temperatures");
		expect(() => {
			Quantity("2").divide("tempF");
		}).toThrow("Cannot divide with temperatures");
		expect(() => {
			Quantity("2 tempF/s");
		}).toThrow("Cannot divide with temperatures");
		expect(() => {
			Quantity("2 s/tempF");
		}).toThrow("Cannot divide with temperatures");

		// * inverse is division
		expect(() => {
			Quantity("tempF").inverse();
		}).toThrow("Cannot divide with temperatures");

		expect(halvedFahrenheit.scalar).toBe(2);
		expect(halvedFahrenheit.units()).toBe("tempF");
	});

	describe("tempK base conversion", () => {
		it("should convert tempK to base (Kelvin)", () => {
			const result = Quantity("100 tempK").toBase();

			expect(result.scalar).toBe(100);
		});
	});

	describe("tempR conversions", () => {
		it("should convert tempR to tempK", () => {
			const result = Quantity("9 tempR").to("tempK");

			expect(result.scalar).toBe(5);
		});

		it("should convert tempR to tempC", () => {
			const result = Quantity("491.67 tempR").to("tempC");

			expect(result.scalar).toBeCloseTo(0, 5);
		});

		it("should convert tempR to tempF", () => {
			const result = Quantity("459.67 tempR").to("tempF");

			expect(result.scalar).toBeCloseTo(0, 5);
		});

		it("should convert degR to degK", () => {
			const result = Quantity("9 degR").to("degK");

			expect(result.scalar).toBe(5);
		});

		it("should convert degR to degF", () => {
			const result = Quantity("5 degR").to("degF");

			expect(result.scalar).toBe(5);
		});
	});
});
