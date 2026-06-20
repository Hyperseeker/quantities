/**
 * @file Tests for custom registry creation and bound constructors.
 */

import type { UnitEntry } from "@quantities/core";
import { DEFAULT_REGISTRY } from "@quantities/core";
import { describe, expect, it } from "bun:test";
import { createRegistry, withRegistry } from "../index.ts";
import { UNIT_WIDGET, UNIT_SUPER_WIDGET } from "./shared.ts";

describe("Registry creation", () => {
	it("creates a registry extending the default", () => {
		const registry = createRegistry(UNIT_WIDGET);

		expect(registry.parseUnits("widget")).toEqual(["<widget>"]);
		expect(registry.parseUnits("m")).toEqual(["<meter>"]);
	});

	it("accepts an array of entries", () => {
		const registry = createRegistry([UNIT_WIDGET, UNIT_SUPER_WIDGET]);

		expect(registry.parseUnits("super-widget")).toEqual(["<super-widget>"]);
	});

	it("accepts nested arrays of entries", () => {
		const registry = createRegistry([[UNIT_WIDGET], [UNIT_SUPER_WIDGET]]);

		expect(registry.parseUnits("widgets")).toEqual(["<widget>"]);
		expect(registry.parseUnits("super-widget")).toEqual(["<super-widget>"]);
	});

	it("creates a registry from null source", () => {
		const only: UnitEntry = {
			key: "<only>",
			aliases: ["only"],
			scalar: 1,
			kind: "test",
			numerator: ["<only>"],
		};

		const registry = createRegistry(only, null);

		expect(registry.parseUnits("only")).toEqual(["<only>"]);
		expect(() => registry.parseUnits("m")).toThrow("Unit not recognized");
	});

	it("creates a default registry when called with no arguments", () => {
		const registry = createRegistry();

		expect(registry.parseUnits("m")).toEqual(["<meter>"]);
	});

	it("extends from a custom source registry", () => {
		const base = createRegistry(UNIT_WIDGET);
		const extended = createRegistry(UNIT_SUPER_WIDGET, base);

		expect(extended.parseUnits("widget")).toEqual(["<widget>"]);
		expect(extended.parseUnits("super-widget")).toEqual(["<super-widget>"]);
	});

	it("rejects non-finite scalar", () => {
		const bad: UnitEntry = {
			key: "<bad>",
			aliases: ["bad"],
			scalar: Infinity,
			kind: "test",
		};

		expect(() => createRegistry(bad)).toThrow("finite number");
	});

	it("rejects NaN scalar", () => {
		const bad: UnitEntry = {
			key: "<bad>",
			aliases: ["bad"],
			scalar: NaN,
			kind: "test",
		};

		expect(() => createRegistry(bad)).toThrow("finite number");
	});

	it("rejects references to non-existent units", () => {
		const bad: UnitEntry = {
			key: "<bad>",
			aliases: ["bad"],
			scalar: 1,
			kind: "test",
			numerator: ["<nonexistent>"],
		};

		expect(() => createRegistry(bad)).toThrow("not recognized");
	});

	it("rejects references to non-existent denominator units", () => {
		const bad: UnitEntry = {
			key: "<bad>",
			aliases: ["bad"],
			scalar: 1,
			kind: "test",
			numerator: ["<meter>"],
			denominator: ["<nonexistent>"],
		};

		expect(() => createRegistry(bad)).toThrow("not recognized");
	});

	it("rejects cyclic definitions", () => {
		const alpha: UnitEntry = {
			key: "<alpha>",
			aliases: ["alpha"],
			scalar: 1,
			kind: "test",
			numerator: ["<beta>"],
		};

		const beta: UnitEntry = {
			key: "<beta>",
			aliases: ["beta"],
			scalar: 1,
			kind: "test",
			numerator: ["<alpha>"],
		};

		expect(() => createRegistry([alpha, beta])).toThrow("Cycle detected");
	});

	it("rejects alias collisions between custom units", () => {
		const first: UnitEntry = {
			key: "<first>",
			aliases: ["dupe"],
			scalar: 1,
			kind: "test",
			numerator: ["<each>"],
		};

		const second: UnitEntry = {
			key: "<second-unit>",
			aliases: ["dupe"],
			scalar: 2,
			kind: "test",
			numerator: ["<each>"],
		};

		expect(() => createRegistry([first, second])).toThrow(
			"Alias collision",
		);
	});
});

describe("Prefix registration via createRegistry", () => {
	/** A prefix authored as a `kind: "prefix"` unit entry. */
	const PREFIX: UnitEntry = {
		key: "<myprefix>",
		aliases: ["my"],
		scalar: 42,
		kind: "prefix",
	};

	it("registers a prefix passed alongside units", () => {
		const registry = createRegistry([UNIT_WIDGET, PREFIX]);

		expect(registry.parseUnits("mym")).toEqual(["<myprefix>", "<meter>"]);
		expect(registry.parseUnits("widget")).toEqual(["<widget>"]);
	});

	it("registers multiple prefixes", () => {
		const other: UnitEntry = {
			key: "<other>",
			aliases: ["oth"],
			scalar: 7,
			kind: "prefix",
		};

		const registry = createRegistry([PREFIX, other]);

		expect(registry.parseUnits("mym")).toEqual(["<myprefix>", "<meter>"]);
		expect(registry.parseUnits("othm")).toEqual(["<other>", "<meter>"]);
	});

	it("rejects prefix alias collisions", () => {
		const colliding: UnitEntry = {
			key: "<fake-kilo>",
			aliases: ["k"],
			scalar: 999,
			kind: "prefix",
		};

		expect(() => createRegistry(colliding)).toThrow(
			"Prefix alias collision",
		);
	});

	it("rejects non-finite prefix scalar", () => {
		const bad: UnitEntry = {
			key: "<bad>",
			aliases: ["bad"],
			scalar: Infinity,
			kind: "prefix",
		};

		expect(() => createRegistry(bad)).toThrow("finite number");
	});
});

describe("Custom-registry instances", () => {
	it("returns a Quantity constructor bound to the custom registry", () => {
		const registry = createRegistry(UNIT_WIDGET);
		const { default: Quantity } = withRegistry(registry);

		const quantity = Quantity("5 widgets");

		expect(quantity.scalar).toBe(5);
		expect(quantity.units()).toBe("widget");
	});

	it("provides getUnits helper", () => {
		const registry = createRegistry(UNIT_WIDGET);
		const { getUnits } = withRegistry(registry);

		expect(getUnits("counting")).toContain("widget");
	});

	it("provides getAliases helper", () => {
		const registry = createRegistry(UNIT_WIDGET);
		const { getAliases } = withRegistry(registry);

		expect(getAliases("widget")).toEqual(["widget", "widgets"]);
	});

	it("supports conversion between custom and built-in units", () => {
		const registry = createRegistry(UNIT_WIDGET);
		const { default: Quantity } = withRegistry(registry);

		expect(Quantity("5 widgets").to("each").scalar).toBe(5);
	});

	it("supports new via the proxy", () => {
		const registry = createRegistry(UNIT_WIDGET);
		const { default: Quantity } = withRegistry(registry);

		const quantity = new Quantity("3 widgets");

		expect(quantity.scalar).toBe(3);
	});

	it("isolates registries between constructors", () => {
		const registry = createRegistry(UNIT_WIDGET);
		const { default: Custom } = withRegistry(registry);

		// custom constructor can parse the custom unit
		expect(Custom("1 widget").scalar).toBe(1);

		// default Quantity cannot parse the custom unit
		const { default: Quantity } = withRegistry(DEFAULT_REGISTRY);

		expect(() => Quantity("1 widget")).toThrow();
	});
});
