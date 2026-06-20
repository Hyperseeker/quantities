/**
 * @file Local oxlint config for `/to-compound`.
 */

import baseConfig from "../../oxlint.config.ts";
import { defineConfig } from "oxlint";

export default defineConfig({
	extends: [baseConfig],
	rules: {
		// * this is much easier than configuring exceptions per-unit
		"frontier-style/module-const-screaming-snake": "off",
		// * ditto
		"frontier-style/require-jsdoc": "off",
	},
});
