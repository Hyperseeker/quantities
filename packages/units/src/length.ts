/**
 * @file Length unit definitions.
 *
 * Includes historical lengths, light-distance units, and cosmological lengths.
 *
 * @example
 * ```ts
 * import LENGTH from "@quantities/units/length";
 * import { league, furlong, hubbleLength } from "@quantities/units/length";
 * ```
 */

import type { UnitEntry } from "@quantities/core";

export const league: UnitEntry = {
	key: "<league>",
	aliases: ["league", "leagues"],
	scalar: 4828,
	kind: "length",
	numerator: ["<meter>"],
};

export const mil: UnitEntry = {
	key: "<mil>",
	aliases: ["mil", "mils"],
	scalar: 0.0000254,
	kind: "length",
	numerator: ["<meter>"],
};

export const furlong: UnitEntry = {
	key: "<furlong>",
	aliases: ["furlong", "furlongs"],
	scalar: 660,
	kind: "length",
	numerator: ["<foot>"],
};

export const rod: UnitEntry = {
	key: "<rod>",
	aliases: ["rd", "rod", "rods"],
	scalar: 16.5,
	kind: "length",
	numerator: ["<foot>"],
};

export const fathom: UnitEntry = {
	key: "<fathom>",
	aliases: ["fathom", "fathoms"],
	scalar: 6,
	kind: "length",
	numerator: ["<foot>"],
};

export const lightMinute: UnitEntry = {
	key: "<light-minute>",
	aliases: ["lmin", "light-minute"],
	scalar: 17_987_547_480,
	kind: "length",
	numerator: ["<meter>"],
};

export const lightSecond: UnitEntry = {
	key: "<light-second>",
	aliases: ["ls", "light-second"],
	scalar: 299_792_458,
	kind: "length",
	numerator: ["<meter>"],
};

export const datamile: UnitEntry = {
	key: "<datamile>",
	aliases: ["DM", "datamile"],
	scalar: 1828.8,
	kind: "length",
	numerator: ["<meter>"],
};

export const hubbleLength: UnitEntry = {
	key: "<hubble-length>",
	aliases: ["hl", "lh", "l-hubble", "hubble-length"],
	scalar: 1,
	kind: "length",
	numerator: ["<cee>"],
	denominator: ["<hubble-constant>"],
};

export const redshift: UnitEntry = {
	key: "<redshift>",
	aliases: ["z", "red-shift", "redshift"],
	scalar: 1,
	kind: "length",
	numerator: ["<cee>"],
	denominator: ["<hubble-constant-70>"],
};

export default [
	league,
	mil,
	furlong,
	rod,
	fathom,
	lightMinute,
	lightSecond,
	datamile,
	hubbleLength,
	redshift,
];
