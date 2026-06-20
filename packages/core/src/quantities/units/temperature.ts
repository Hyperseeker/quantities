/**
 * @file Temperature unit definitions: absolute scales and offset (`temp-*`) scales.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Temperature units. The `temp-*` variants carry scale offsets handled during conversion.
 */
export const TEMPERATURE = {
	"<kelvin>": [
		["degK", "\u00B0K", "°K", "kelvin"],
		1.0,
		"temperature",
		["<kelvin>"],
	],
	"<celsius>": [
		["degC", "\u00B0C", "°C", "celsius", "centigrade"],
		1.0,
		"temperature",
		["<kelvin>"],
	],
	"<fahrenheit>": [
		["degF", "\u00B0F", "°F", "fahrenheit"],
		5 / 9,
		"temperature",
		["<kelvin>"],
	],
	"<rankine>": [
		["degR", "\u00B0R", "°R", "rankine"],
		5 / 9,
		"temperature",
		["<kelvin>"],
	],
	"<temp-K>": [["tempK", "temp-K"], 1.0, "temperature", ["<temp-K>"]],
	"<temp-C>": [["tempC", "temp-C"], 1.0, "temperature", ["<temp-K>"]],
	"<temp-F>": [["tempF", "temp-F"], 5 / 9, "temperature", ["<temp-K>"]],
	"<temp-R>": [["tempR", "temp-R"], 5 / 9, "temperature", ["<temp-K>"]],
} as const satisfies UnitMap;
