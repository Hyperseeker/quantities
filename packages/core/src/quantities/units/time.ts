/**
 * @file Time unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Time units.
 */
export const TIME = {
	"<second>": [
		["s", "sec", "secs", "second", "seconds"],
		1.0,
		"time",
		["<second>"],
	],
	"<minute>": [
		["min", "mins", "minute", "minutes"],
		60.0,
		"time",
		["<second>"],
	],
	"<hour>": [
		["h", "hr", "hrs", "hour", "hours"],
		60 * 60,
		"time",
		["<second>"],
	],
	"<day>": [["d", "day", "days"], 60 * 60 * 24, "time", ["<second>"]],
	"<week>": [["wk", "week", "weeks"], 60 * 60 * 24 * 7, "time", ["<second>"]],
	"<year>": [
		["y", "yr", "year", "years", "annum"],
		31556926,
		"time",
		["<second>"],
	],
	"<decade>": [["decade", "decades"], 10, "time", ["<year>"]],
	"<century>": [["century", "centuries"], 100, "time", ["<year>"]],
} as const satisfies UnitMap;
