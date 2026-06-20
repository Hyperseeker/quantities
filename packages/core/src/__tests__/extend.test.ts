/**
 * @file Tests for `Quantity.extend()` prototype extension behavior.
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";

describe("Quantity.extend()", () => {
	it("adds an extension method to the prototype", () => {
		const double = {
			name: "_testDouble",
			method(this: Quantity): number {
				return this.scalar * 2;
			},
		} as const;

		const Extended = Quantity.extend(double);

		expect(Extended("5 m")._testDouble()).toBe(10);
	});

	it("is idempotent for same name and function", () => {
		const extension = {
			name: "_testIdempotent",
			method(): number {
				return 1;
			},
		} as const;

		expect(() => Quantity.extend(extension)).not.toThrow();

		const Extended = Quantity.extend(extension);

		expect(Extended("5 m")._testIdempotent()).toBe(1);
	});

	it("throws on name collision with existing prototype method", () => {
		const extension = {
			name: "add",
			method(): number {
				return 1;
			},
		};

		// * for coverage reports only
		// * nothing actual to test
		extension.method();

		expect(Quantity("5 m")).toHaveProperty("add");
		expect(() => Quantity.extend(extension)).toThrow();
	});

	it("throws on name collision with different function", () => {
		const extensionA = {
			name: "_testCollision",
			method(): number {
				return 1;
			},
		} as const;
		const extensionB = {
			name: "_testCollision",
			method(): number {
				return 2;
			},
		} as const;

		// * for coverage reports only
		// * nothing actual to test
		extensionB.method();

		const Extended = Quantity.extend(extensionA);

		expect(Extended("1 m")._testCollision).toBeDefined();
		expect(Extended("1 m")._testCollision()).toBe(1);
		expect(() => Extended.extend(extensionB)).toThrow();
	});

	it("throws when method is not a function", () => {
		const extension = {
			name: "_testBadMethod",
			method: "not a function",
		};

		// @ts-expect-error We are testing failure modes
		expect(() => Quantity.extend(extension)).toThrow();
	});

	it("extension is inherited by withRegistry subclasses", () => {
		const extension = {
			name: "_testInherited",
			method(this: Quantity): number {
				return this.scalar;
			},
		} as const;

		const Extended = Quantity.extend(extension);

		// * withRegistry creates a subclass: extensions should be inherited
		class Subclassed extends Extended {
			constructor(...args: ConstructorParameters<typeof Extended>) {
				super(...args);
			}
		}

		const quantity = new Subclassed("3 m");

		expect(quantity._testInherited()).toBe(3);
	});

	it("accepts multiple extensions at once", () => {
		const extensionA = {
			name: "_testMultiA",
			method(): string {
				return "a";
			},
		} as const;
		const extensionB = {
			name: "_testMultiB",
			method(): string {
				return "b";
			},
		} as const;

		const Extended = Quantity.extend(extensionA, extensionB);

		const quantity = Extended("1 m");

		expect(quantity._testMultiA()).toBe("a");
		expect(quantity._testMultiB()).toBe("b");
	});
});
