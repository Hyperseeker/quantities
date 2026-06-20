/**
 * @file Length unit definitions: metric, imperial, typographic, and astronomical.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Length units.
 */
export const LENGTHS = {
	// * metric lengths
	"<meter>": [
		["m", "meter", "meters", "metre", "metres"],
		1.0,
		"length",
		["<meter>"],
	],
	"<naut-mile>": [["nmi", "naut-mile"], 1852, "length", ["<meter>"]],
	"<angstrom>": [
		["ang", "angstrom", "angstroms", "Å"],
		0.1,
		"length",
		["<nano>", "<meter>"],
	],

	// * US / imperial lengths
	"<foot>": [["ft", "foot", "feet", "'"], 0.3048, "length", ["<meter>"]],
	"<inch>": [["in", "inch", "inches", '"'], 1 / 12, "length", ["<foot>"]],
	"<yard>": [["yd", "yard", "yards"], 3, "length", ["<foot>"]],
	"<mile>": [["mi", "mile", "miles"], 5280, "length", ["<foot>"]],

	// * typographic lengths
	"<point>": [["pt", "point", "points"], 1 / 12, "length", ["<pica>"]],
	"<pica>": [["pica", "picas"], 1 / 6, "length", ["<inch>"]],

	// * astronomical lengths
	"<AU>": [
		["AU", "astronomical-unit"],
		149_597_870_700,
		"length",
		["<meter>"],
	],
	"<parsec>": [
		["pc", "parsec", "parsecs"],
		// * we choose to represent the parsec in AU because it provides the most precise value
		// * representing it in meters in JS produces the exact same level of error, and the formulaic representation is cleaner
		// * IEEE 754 floats can only cleanly represent the integer 30856775814913670, which is ~3 meters away from the actual value
		648_000 / Math.PI,
		"length",
		["<AU>"],
	],

	"<light-year>": [
		// * Wikipedia cites the following source for `lyr`:
		// > https://doi.org/10.1038%2F294236a0
		["ly", "lyr", "light-year"],
		// * we define this in kilometers to avoid immediate integer precision loss
		// * `0.8 km` === `800 m`, which both is correct to the definition and results in a clean decimal (not corrupted for floating-point error)
		9_460_730_472_580.8,
		"length",
		["<kilo>", "<meter>"],
	],
} as const satisfies UnitMap;
