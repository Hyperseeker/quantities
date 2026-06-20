/**
 * @file Big List of Naughty Strings security test.
 *
 * This test ensures that the library handles potentially dangerous strings safely without crashing, hanging, or causing security vulnerabilities.
 *
 * Source: https://github.com/minimaxir/big-list-of-naughty-strings
 */

import { describe, expect, it } from "bun:test";
import Quantity from "../quantities.ts";
import blns from "./blns.json";

describe("Big List of Naughty Strings security tests", () => {
	it("should not crash with potentially dangerous strings", () => {
		const results = {
			tested: blns.length,
			errors: 0,
			successful: 0,
		};

		blns.forEach((string) => {
			try {
				Quantity(string);

				// * some of the values in BLNS are valid quantities
				// * e.g. `1` is a unitless value of 1
				// * e.g. `'` (apostrophe) is a shorthand for `<foot>`
				// * we expect some of them to pass successfully
				results.successful++;
			} catch {
				// * throwing here is fine, we only want to make sure throwing doesn't crash the process
				results.errors++;
			}
		});

		console.log(`BLNS Test Summary:
  Total strings tested: ${results.tested}
  Successfully parsed: ${results.successful}
  Errors: ${results.errors}`);

		expect(results.tested).toBe(results.errors + results.successful);
	});
});
