/**
 * @file Prefix definitions: binary and metric multipliers applied to base units.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Binary and metric prefixes.
 */
export const PREFIXES = {
	// * binary prefixes
	"<kibi>": [["Ki", "Kibi", "kibi"], Math.pow(2, 10), "prefix"],
	"<mebi>": [["Mi", "Mebi", "mebi"], Math.pow(2, 20), "prefix"],
	"<gibi>": [["Gi", "Gibi", "gibi"], Math.pow(2, 30), "prefix"],
	"<tebi>": [["Ti", "Tebi", "tebi"], Math.pow(2, 40), "prefix"],
	"<pebi>": [["Pi", "Pebi", "pebi"], Math.pow(2, 50), "prefix"],
	"<exi>": [["Ei", "Exi", "exi"], Math.pow(2, 60), "prefix"],
	"<zebi>": [["Zi", "Zebi", "zebi"], Math.pow(2, 70), "prefix"],
	"<yebi>": [["Yi", "Yebi", "yebi"], Math.pow(2, 80), "prefix"],

	// * metric prefixes
	"<yotta>": [["Y", "Yotta", "yotta"], 1e24, "prefix"],
	"<zetta>": [["Z", "Zetta", "zetta"], 1e21, "prefix"],
	"<exa>": [["E", "Exa", "exa"], 1e18, "prefix"],
	"<peta>": [["P", "Peta", "peta"], 1e15, "prefix"],
	"<tera>": [["T", "Tera", "tera"], 1e12, "prefix"],
	"<giga>": [["G", "Giga", "giga"], 1e9, "prefix"],
	"<mega>": [["M", "Mega", "mega"], 1e6, "prefix"],
	"<kilo>": [["k", "kilo"], 1e3, "prefix"],
	"<hecto>": [["h", "Hecto", "hecto"], 1e2, "prefix"],
	"<deca>": [["da", "Deca", "deca", "deka"], 1e1, "prefix"],
	"<deci>": [["d", "Deci", "deci"], 1e-1, "prefix"],
	"<centi>": [["c", "Centi", "centi"], 1e-2, "prefix"],
	"<milli>": [["m", "Milli", "milli"], 1e-3, "prefix"],
	"<micro>": [
		["u", "\u03BC", "\u00B5", "Micro", "mc", "micro"],
		1e-6,
		"prefix",
	],
	"<nano>": [["n", "Nano", "nano"], 1e-9, "prefix"],
	"<pico>": [["p", "Pico", "pico"], 1e-12, "prefix"],
	"<femto>": [["f", "Femto", "femto"], 1e-15, "prefix"],
	"<atto>": [["a", "Atto", "atto"], 1e-18, "prefix"],
	"<zepto>": [["z", "Zepto", "zepto"], 1e-21, "prefix"],
	"<yocto>": [["y", "Yocto", "yocto"], 1e-24, "prefix"],
} as const satisfies UnitMap;
