/**
 * @file Typed helpers.
 */

import type { NonEmptyArray } from "./types.ts";

/**
 * A key of `T`.
 */
type ObjectKey<T extends object> = keyof T;

/**
 * Array of `T`'s keys.
 */
type ObjectKeys<T extends object> = ObjectKey<T>[];

/**
 * Array of `T`'s key/value entry tuples.
 */
type ObjectEntries<T extends object> = {
	[Key in ObjectKey<T>]: [Key, T[Key]];
}[ObjectKey<T>][];

/**
 * Typed wrapper over `Object.keys`.
 *
 * @param object Object whose keys to read.
 *
 * @returns The object's keys, typed as `ObjectKeys<T>`.
 */
export function objectKeys<T extends object>(object: T): ObjectKeys<T> {
	return Object.keys(object) as ObjectKeys<T>;
}

/**
 * Typed wrapper over `Object.entries`.
 *
 * @param object Object whose entries to read.
 *
 * @returns The object's key/value entry tuples, typed as `ObjectEntries<T>`.
 */
export function objectEntries<T extends object>(object: T): ObjectEntries<T> {
	return Object.entries(object) as ObjectEntries<T>;
}

/**
 * Type guard for whether `array` has at least one element.
 *
 * @param array Array to test.
 *
 * @returns Whether `array` is a {@link NonEmptyArray}.
 */
export function isNonEmptyArray<T>(
	array: readonly T[],
): array is NonEmptyArray<T> {
	return !!array.length;
}
