/**
 * @file Power unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Power units.
 */
export const POWER = {
	"<watt>": [
		["W", "watt", "watts"],
		1.0,
		"power",
		["<kilo>", "<gram>", "<meter>", "<meter>"],
		["<second>", "<second>", "<second>"],
	],
	"<volt-ampere>": [
		["VA", "volt-ampere"],
		1.0,
		"power",
		["<volt>", "<ampere>"],
	],
	"<horsepower>": [
		["hp", "horsepower"],
		33_000,
		"power",
		["<foot>", "<pound-force>"],
		["<minute>"],
	],
} as const satisfies UnitMap;
