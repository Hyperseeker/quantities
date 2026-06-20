/**
 * @file Rotation unit definitions.
 */

import type { UnitMap } from "../../types.ts";

/**
 * Rotational units and angular velocity.
 */
export const ROTATION = {
	"<rotation>": [["rotation", "rotations"], 360, "angle", ["<degree>"]],
	"<rpm>": [["rpm"], 1, "angular_velocity", ["<rotation>"], ["<minute>"]],
} as const satisfies UnitMap;
