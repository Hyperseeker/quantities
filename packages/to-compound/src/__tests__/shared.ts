/**
 * @file Shared test fixture: a Quantity constructor extended with `.toCompound()`.
 */

import Quantity from "@quantities/core";
import toCompound from "../index.ts";

/**
 * Quantity constructor extended with the `toCompound` method, for tests.
 */
export const Extended = Quantity.extend(toCompound);
