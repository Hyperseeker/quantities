/**
 * @file Local oxlint config for `/to-compound`.
 */

import baseConfig from "../../oxlint.config.ts";
import { defineConfig } from "oxlint";

export default defineConfig({
	extends: [baseConfig],
	rules: {
		"frontier-style/module-const-screaming-snake": [
			"error",
			{ exceptions: ["name", "Extended"] },
		],
	},
});
