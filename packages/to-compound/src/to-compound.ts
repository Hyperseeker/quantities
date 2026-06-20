/**
 * @file Compound formatting: selects units and decomposes a quantity into a largest-first chain of unit components (e.g. `1 kg 200 g`).
 */

import type Quantity from "@quantities/core";
import type {
	Alias,
	Denominator,
	Formatter,
	Key,
	Kind,
	Numerator,
	Scalar,
} from "@quantities/core";
import {
	DEFAULT_FORMATTER,
	divideSafely,
	isUnityArray,
	multiplySafely,
	objectEntries,
	objectKeys,
	roundSafely,
	SI_BASE_UNITS,
	snap,
	subtractSafely,
	TEMPERATURE_SIGNATURE,
	type UnitRegistry,
	UNITY,
} from "@quantities/core";

/**
 * Normalized `numerator/denominator` key for comparing unit expressions.
 */
type VectorKey = `${string}/${string}`;

/**
 * Options for compound formatting.
 */
export interface CompoundFormatOptions {
	/**
	 * Custom formatter for each component.
	 *
	 * @default {@link DEFAULT_FORMATTER}
	 */
	formatter?: Formatter;
	/** Maximum number of decimals for the smallest unit component. */
	precision?: number;
	/**
	 * Skip components with zero values. When the entire quantity is zero, the largest unit is shown.
	 *
	 * @default true
	 */
	skipZeros?: boolean;
	/**
	 * Exponent step between SI prefix tiers (e.g. 3 for kilo→mega→giga).
	 *
	 * @default
	 * 3
	 */
	step?: number;
	/** Minimum absolute value to include a component (useful for filtering very small remainders). */
	threshold?: number;
}

/**
 * Precomputed unit relationships used throughout selection.
 */
interface LineageIndex {
	parentByUnit: ReadonlyMap<Key, Key | null>;
	childrenByUnit: ReadonlyMap<Key, readonly Key[]>;
	simpleRootByUnit: ReadonlyMap<Key, Key>;
	siLinkedUnits: ReadonlySet<Key>;
}

/**
 * A candidate unit within the input's measurement subsystem.
 */
interface SubsystemCandidate {
	alias: Alias;
	baseScalar: Scalar;
	value: Scalar;
}

/**
 * A unit paired with its base scalar, ready for decomposition.
 */
interface DecompositionUnit {
	unit: Alias;
	baseScalar: Scalar;
}

/**
 * A single value/unit pair in a decomposed compound result.
 */
interface CompoundComponent {
	value: Scalar;
	unit: Alias;
}

/**
 * A unit alias ranked by its scalar factor.
 */
interface RankedUnit {
	alias: Alias;
	scalar: Scalar;
}

/**
 * Options passed to {@link decomposeIntoComponents}.
 */
interface DecomposeOptions
	extends
		Omit<
			CompoundFormatOptions,
			"formatter" | "skipZeros" | "step" | "threshold"
		>,
		Required<Pick<CompoundFormatOptions, "skipZeros" | "threshold">> {}

/**
 * A registry unit whose compound key matched the input quantity.
 */
interface MatchedEntry extends RankedUnit {
	key: Key;
}

/**
 * Per-registry cache of the computed {@link LineageIndex}.
 */
const LINEAGE_CACHE = new WeakMap<UnitRegistry, LineageIndex>();

/**
 * SI base units restricted to sub-unity prefixes only (`milli`, `micro`, `nano` etc.).
 * Supra-unity prefixes (`kilo`, `mega`, `giga`) are blocked during prefix selection.
 * - seconds use base-60 subdivisions (`min`, `h`, `d`) for large values
 * - kelvin with supra-unity metric prefixes is not in common use
 */
const SI_UNITS_SUB_UNITY_PREFIXES_ONLY: ReadonlySet<string> = new Set([
	"<second>",
	"<kelvin>",
]);

/**
 * An SI-coherent unit is defined directly from SI base units (e.g. `gee`, `Gy`, `Pa`).
 * Non-coherent named compounds (e.g. `kt` as `naut-mile`/`hour`) are excluded: they share a dimension with SI units but belong to a different measurement subsystem.
 */
const SI_BASE_UNIT_SET: ReadonlySet<Key> = new Set(SI_BASE_UNITS);

/**
 * Sorts unit keys and joins them into a stable, comparable string.
 */
function normalize(values: readonly Key[]): string {
	return values.toSorted().join(",");
}

/**
 * Checks whether `value` is an exact power of ten (within float tolerance).
 */
function isPowerOfTen(value: number): boolean {
	if (!Number.isFinite(value) || value === 0) return false;

	const log = Math.log10(Math.abs(value));

	return Math.abs(log - Math.round(log)) < 1e-10;
}

/**
 * Checks whether `key` is a non-prefix unit.
 */
function notPrefix(registry: UnitRegistry, key: Key): boolean {
	return !registry.isPrefix(key);
}

/**
 * Checks whether `key` has no parent unit, i.e. is a root of its lineage.
 */
function isBaseUnit(
	parentByUnit: ReadonlyMap<Key, Key | null>,
	key: Key,
): boolean {
	return parentByUnit.get(key) === null;
}

/**
 * Walks parent links from `key` to its root.
 */
function getAncestorChain(
	key: Key,
	parentByUnit: ReadonlyMap<Key, Key | null>,
	cache: Map<Key, Key[]>,
): Key[] {
	const cached = cache.get(key);

	if (cached) return cached;

	const chain: Key[] = [];
	const visited = new Set<Key>();

	let current: Key | null | undefined = key;

	// TODO: refactor chain length cutoff
	// * replace with chain length detection?
	while (current && !visited.has(current) && chain.length < 10) {
		chain.push(current);
		visited.add(current);

		current = parentByUnit.get(current) ?? null;
	}

	cache.set(key, chain);

	return chain;
}

/**
 * For each unit, finds the topmost non-base ancestor that has at least one descendant within its kind group: the subsystem root.
 *
 * Units that share a subsystem root are considered part of the same measurement subsystem.
 */
function computeSimpleRoots(
	registry: UnitRegistry,
	kindGroups: ReadonlyMap<string, Key[]>,
	parentByUnit: ReadonlyMap<Key, Key | null>,
): Map<Key, Key> {
	const chainCache = new Map<Key, Key[]>();
	const simpleRootByUnit = new Map<Key, Key>();

	for (const [, group] of kindGroups) {
		const hasDescendant = new Set<Key>(
			group.flatMap((key) =>
				getAncestorChain(key, parentByUnit, chainCache).slice(1),
			),
		);

		for (const key of group) {
			const chain = getAncestorChain(key, parentByUnit, chainCache);

			let topmostRoot: Key | null = null;

			for (let index = chain.length - 2; index >= 0; index--) {
				const ancestor = chain[index]!;
				const scalar = registry.units[ancestor]?.[1];

				if (
					isBaseUnit(parentByUnit, ancestor) ||
					!hasDescendant.has(ancestor) ||
					(scalar !== undefined && isPowerOfTen(scalar))
				)
					continue;

				topmostRoot = ancestor;

				break;
			}

			simpleRootByUnit.set(
				key,
				topmostRoot ?? chain[chain.length - 1] ?? key,
			);
		}
	}

	return simpleRootByUnit;
}

/**
 * Determines which units are eligible for SI prefix decomposition.
 *
 * A unit qualifies when its scalar is a power of ten and all of its non-prefix constituents trace back to an SI base unit or unity.
 */
function computeSILinkedUnits(
	registry: UnitRegistry,
	simpleRootByUnit: ReadonlyMap<Key, Key>,
): Set<Key> {
	const { units } = registry;

	const siRoots = new Set<Key>([...SI_BASE_UNITS, UNITY]);
	const siLinkedUnits = new Set<Key>();

	for (const key of objectKeys(units)) {
		const definition = units[key];

		if (!definition) continue;

		const [, scalar, , numerator = [], denominator = []] = definition;

		if (!isPowerOfTen(scalar)) continue;

		const parts = [...numerator, ...denominator].filter((key) =>
			notPrefix(registry, key),
		);

		if (!parts.length) continue;

		if (
			parts.every((part) =>
				siRoots.has(simpleRootByUnit.get(part) ?? part),
			)
		)
			siLinkedUnits.add(key);
	}

	return siLinkedUnits;
}

/**
 * Builds the full {@link LineageIndex} for a registry from scratch.
 */
function buildLineageIndex(registry: UnitRegistry): LineageIndex {
	const { units } = registry;
	const keys = registry.getUnitKeys();

	const parentByUnit = new Map(
		keys.map((key) => {
			const [, , , numerator = []] = units[key]!;
			const parent = numerator.find((key) => notPrefix(registry, key));

			return [key, parent && parent !== key ? parent : null] as const;
		}),
	);

	const kinds = Map.groupBy<Kind, Key>(keys, (key) => units[key]![2]);

	const childrenByUnit = new Map<Key, Key[]>();

	for (const [childKey, parentKey] of parentByUnit) {
		if (!parentKey) continue;

		const children = childrenByUnit.get(parentKey) ?? [];

		children.push(childKey);
		childrenByUnit.set(parentKey, children);
	}

	const simpleRootByUnit = computeSimpleRoots(registry, kinds, parentByUnit);
	const siLinkedUnits = computeSILinkedUnits(registry, simpleRootByUnit);

	return { parentByUnit, childrenByUnit, simpleRootByUnit, siLinkedUnits };
}

/**
 * Returns the cached {@link LineageIndex} for a registry, building it once.
 */
function getLineageIndex(registry: UnitRegistry): LineageIndex {
	const cached = LINEAGE_CACHE.get(registry);

	if (cached) return cached;

	const index = buildLineageIndex(registry);

	LINEAGE_CACHE.set(registry, index);

	return index;
}

/**
 * Checks whether `key` is itself a compound unit, i.e. it has a denominator.
 */
function isAtomicCompound(registry: UnitRegistry, key: Key): boolean {
	return !!registry.units[key]?.[4]?.length;
}

/**
 * Builds a {@link VectorKey} from a `numerator`/`denominator` pair.
 */
function getVectorKey(
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
): VectorKey {
	if (denominator.length && !isUnityArray(denominator))
		return `${normalize(numerator)}/${normalize(denominator)}`;

	return `${normalize(numerator)}/`;
}

/**
 * Expands a unit vector to base units, strips prefix tokens, and cancels common terms between numerator and denominator.
 */
function getBaseVectorKey(
	registry: UnitRegistry,
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
): VectorKey {
	const expanded = registry.expandToBase(numerator, denominator);

	const baseNumerator = expanded.numerator.filter((key) =>
		notPrefix(registry, key),
	);
	const baseDenominator = expanded.denominator.filter((key) =>
		notPrefix(registry, key),
	);

	// * cancel common terms between numerator and denominator
	const canceledNumerator = baseNumerator.filter((unit) => {
		const index = baseDenominator.indexOf(unit);

		if (index >= 0) {
			baseDenominator.splice(index, 1);

			return false;
		}

		return true;
	});

	return getVectorKey(canceledNumerator, baseDenominator);
}

/**
 * Builds the metric-prefix ladder for a unit.
 */
function selectPrefixedUnitsForKey(
	self: Quantity,
	key: Key,
	step: number,
	index: LineageIndex,
): Alias[] {
	const alias = self.registry.getPrimaryAlias(key);

	if (!alias || !self.isCompatible(alias)) return [];

	const root = index.simpleRootByUnit.get(key) ?? key;
	const absoluteUnitScalar = Math.abs(self.to(alias).scalar);
	const result: RankedUnit[] = [];

	for (const [, definition] of objectEntries(self.registry.units)) {
		const [aliases, factor, kind] = definition;

		// TODO: filter by isPrefix earlier
		if (kind !== "prefix") continue;

		const log = Math.log10(factor);
		const exponent = Math.round(log);

		if (Math.abs(log - exponent) >= 1e-10) continue;
		if (factor < 1e-24 || factor > 1e24) continue;
		if (step > 1 && exponent % step !== 0) continue;
		if (SI_UNITS_SUB_UNITY_PREFIXES_ONLY.has(root) && factor >= 1) continue;
		if (absoluteUnitScalar / factor < 1) continue;

		const prefixedAlias = aliases[0]! + alias;

		if (!self.isCompatible(prefixedAlias)) continue;

		result.push({ alias: prefixedAlias, scalar: factor });
	}

	result.push({ alias, scalar: 1 });
	result.sort((left, right) => right.scalar - left.scalar);

	return result.map((entry) => entry.alias);
}

/**
 * Returns the single SI-linked unit eligible for prefix decomposition, or `null` if none can be found.
 */
function getPrefixableUnitKey(self: Quantity, index: LineageIndex): Key | null {
	if (!isUnityArray(self.denominator)) return null;

	const nonPrefixNumerator = self.numerator.filter(
		(key) => !self.registry.isPrefix(key),
	);

	if (nonPrefixNumerator.length !== 1) return null;

	const key = nonPrefixNumerator[0]!;

	return index.siLinkedUnits.has(key) ? key : null;
}

/**
 * Gathers compatible units from the input's lineage, filtered to the same subsystem root.
 */
function collectSubsystemCandidates(
	inputKey: Key,
	inputRoot: Key,
	absoluteBaseScalar: number,
	self: Quantity,
	index: LineageIndex,
): SubsystemCandidate[] {
	const candidateKeys = new Set<Key>([inputKey]);
	const parentKey = index.parentByUnit.get(inputKey);

	if (parentKey) candidateKeys.add(parentKey);

	const children = index.childrenByUnit.get(inputKey);

	if (children) for (const child of children) candidateKeys.add(child);

	if (parentKey) {
		const siblings = index.childrenByUnit.get(parentKey);

		if (siblings)
			for (const sibling of siblings) candidateKeys.add(sibling);
	}

	return Array.from(candidateKeys)
		.flatMap((key) => {
			const root = index.simpleRootByUnit.get(key);
			const alias = self.registry.getPrimaryAlias(key);

			if (
				!root ||
				root !== inputRoot ||
				!alias ||
				!self.isCompatible(alias)
			)
				return [];

			const baseScalar = self.registry.getBaseScalar(alias);
			const value = divideSafely(absoluteBaseScalar, baseScalar);

			return [{ alias, baseScalar, value }];
		})
		.sort((left, right) => right.baseScalar - left.baseScalar);
}

/**
 * Returns units of the input's subsystem.
 */
function selectSubsystemUnits(self: Quantity, index: LineageIndex): Alias[] {
	const inputKey = self.numerator.find((key) => !self.registry.isPrefix(key));

	if (!inputKey) return [self.units()];

	const inputRoot = index.simpleRootByUnit.get(inputKey);

	if (!inputRoot) return [self.units()];

	const absoluteBaseScalar = Math.abs(self.baseScalar);

	const candidates = collectSubsystemCandidates(
		inputKey,
		inputRoot,
		absoluteBaseScalar,
		self,
		index,
	);

	return candidates.map((candidate) => candidate.alias);
}

/**
 * Reports whether a unit is SI-coherent, i.e. built from SI base units or their metric (power-of-ten) multiples.
 */
function isSICoherent(
	registry: UnitRegistry,
	siLinkedUnits: ReadonlySet<Key>,
	key: Key,
): boolean {
	const [, , , numerator = [], denominator = []] = registry.units[key]!;

	const parts = [...numerator, ...denominator].filter((part) =>
		notPrefix(registry, part),
	);

	return (
		parts.length > 0 &&
		parts.every(
			(part) => SI_BASE_UNIT_SET.has(part) || siLinkedUnits.has(part),
		)
	);
}

/**
 * Finds all registry units whose compound key matches the input quantity's compound key.
 */
function matchCompoundUnits(
	self: Quantity,
	numerator: readonly Numerator[],
	denominator: readonly Denominator[],
	siLinkedUnits: ReadonlySet<Key>,
): Alias[] | null {
	const baseInputKey = getBaseVectorKey(
		self.registry,
		numerator,
		denominator,
	);

	const absoluteBaseScalar = Math.abs(self.baseScalar);

	const matched: MatchedEntry[] = [];

	for (const unitKey of self.registry.getUnitKeys(self.kind())) {
		const alias = self.registry.getPrimaryAlias(unitKey);
		const scalar = self.registry.getScalar(unitKey);

		if (!alias || scalar === undefined || !self.isCompatible(alias))
			continue;

		const definition = self.registry.units[unitKey]!;

		const [, , , candidateNumerator = [], candidateDenominator = []] =
			definition;

		const candidateKey = getBaseVectorKey(
			self.registry,
			candidateNumerator,
			candidateDenominator,
		);

		if (candidateKey !== baseInputKey) continue;

		matched.push({ alias, scalar, key: unitKey });
	}

	if (!matched.length) return null;

	if (numerator.length === 1 && isUnityArray(denominator)) {
		const inputKey = numerator[0]!;

		if (!self.registry.isPrefix(inputKey)) {
			const inputAlias = self.registry.getPrimaryAlias(inputKey);

			if (
				inputAlias &&
				matched.some((entry) => entry.alias === inputAlias)
			)
				return [inputAlias];
		}
	}

	const promotable = matched.filter((entry) => {
		const unitBase = self.registry.getBaseScalar(entry.alias);

		return (
			isSICoherent(self.registry, siLinkedUnits, entry.key) &&
			unitBase >= 1 &&
			unitBase <= absoluteBaseScalar
		);
	});

	if (!promotable.length) return null;

	const best = promotable.reduce((largest, entry) =>
		self.registry.getBaseScalar(entry.alias) >
		self.registry.getBaseScalar(largest.alias)
			? entry
			: largest,
	);

	return [best.alias];
}

/**
 * Checks whether the numerator contains any atomic compound or a unit whose numerator contains one.
 */
function hasCompoundConstituents(
	registry: UnitRegistry,
	numerator: readonly Numerator[],
): boolean {
	return numerator
		.filter((key) => notPrefix(registry, key))
		.some((key) => {
			if (isAtomicCompound(registry, key)) return true;

			const [, , , unitNumerator = []] = registry.units[key]!;

			return unitNumerator.some((nested) =>
				isAtomicCompound(registry, nested),
			);
		});
}

/**
 * Chooses the units to format a quantity with.
 */
function selectUnitsForCompound(
	self: Quantity,
	index: LineageIndex,
	step: number,
): Alias[] {
	if (self.signature === TEMPERATURE_SIGNATURE) {
		const tempKey = self.numerator.find(
			(key) => !self.registry.isPrefix(key),
		);

		if (!tempKey || !index.siLinkedUnits.has(tempKey))
			return [self.registry.getPrimaryAlias(self.numerator[0]!) ?? UNITY];
	}

	// * try SI prefix decomposition first
	const prefixKey = getPrefixableUnitKey(self, index);

	if (prefixKey) {
		const root = index.simpleRootByUnit.get(prefixKey) ?? prefixKey;

		if (SI_UNITS_SUB_UNITY_PREFIXES_ONLY.has(root)) {
			const prefixUnits = selectPrefixedUnitsForKey(
				self,
				prefixKey,
				step,
				index,
			);

			const subsystemUnits = selectSubsystemUnits(self, index);

			const baseAlias = self.registry.getPrimaryAlias(prefixKey);

			const subUnityOnly = prefixUnits.filter(
				(unit) => unit !== baseAlias,
			);

			return [...subsystemUnits, ...subUnityOnly];
		}

		const units = selectPrefixedUnitsForKey(self, prefixKey, step, index);

		if (units.length > 1) return units;
	}

	// * compound expression: match by compound key
	const { numerator, denominator } = self;

	const hasNonUnityDenominator =
		denominator.length && !isUnityArray(denominator);

	const isCompound =
		hasNonUnityDenominator ||
		hasCompoundConstituents(self.registry, numerator);

	if (isCompound)
		return (
			matchCompoundUnits(
				self,
				numerator,
				denominator,
				index.siLinkedUnits,
			) ?? [self.units()]
		);

	return selectSubsystemUnits(self, index);
}

/**
 * Decomposes a base scalar into integer parts of each unit.
 */
function decomposeIntoComponents(
	baseScalar: Scalar,
	sortedUnits: DecompositionUnit[],
	options: DecomposeOptions,
): CompoundComponent[] {
	const components: CompoundComponent[] = [];
	const sign = Math.sign(baseScalar);

	let remainingBaseScalar = Math.abs(baseScalar);

	const dustThreshold = 2 * remainingBaseScalar * Number.EPSILON;

	for (let position = 0; position < sortedUnits.length; position++) {
		const { unit, baseScalar } = sortedUnits[position]!;
		const isLastUnit = position === sortedUnits.length - 1;
		const valueInUnit = divideSafely(remainingBaseScalar, baseScalar);
		const applySign = components.length ? 1 : sign;

		if (isLastUnit) {
			const finalValue =
				(options.precision !== undefined
					? roundSafely(valueInUnit, options.precision)
					: snap(valueInUnit)) * applySign;

			if (
				Math.abs(finalValue) >= options.threshold &&
				(!options.skipZeros || finalValue !== 0)
			)
				components.push({ value: finalValue, unit });
		} else {
			const wholePart = Math.floor(roundSafely(valueInUnit, 10));

			if (wholePart !== 0 || !options.skipZeros)
				components.push({ value: wholePart * applySign, unit });

			remainingBaseScalar = subtractSafely(
				remainingBaseScalar,
				multiplySafely(wholePart, baseScalar),
			);

			if (wholePart > 0 && Math.abs(remainingBaseScalar) < dustThreshold)
				remainingBaseScalar = 0;
		}
	}

	return components;
}

/**
 * Converts and formats a quantity as a single unit.
 */
function formatSingleUnit(
	self: Quantity,
	unit: Alias,
	isExplicitTarget: boolean,
	formatter: Formatter,
	precision: number | undefined,
): string {
	if (isExplicitTarget && !self.isCompatible(unit))
		throw new Error(
			`Incompatible unit: ${unit} is not compatible with ${self.units()}`,
		);

	let scalar = self.to(unit).scalar;

	if (precision !== undefined) scalar = roundSafely(scalar, precision);

	return formatter(scalar, unit);
}

/**
 * Decomposes a quantity across several units and joins the components.
 */
function formatCompoundUnits(
	self: Quantity,
	selectedUnits: Alias[],
	formatter: Formatter,
	options: DecomposeOptions,
	isExplicitTarget: boolean,
): string {
	for (const unit of selectedUnits)
		if (!self.isCompatible(unit))
			throw new Error(
				`Incompatible unit: ${unit} is not compatible with ${self.units()}`,
			);

	const sortedUnits = selectedUnits
		.map((unit) => ({
			unit,
			baseScalar: self.registry.getBaseScalar(unit),
		}))
		.sort((left, right) => right.baseScalar - left.baseScalar);

	const components = decomposeIntoComponents(
		self.baseScalar,
		sortedUnits,
		options,
	);

	if (!components.length)
		return formatter(
			0,
			isExplicitTarget
				? sortedUnits[sortedUnits.length - 1]!.unit
				: self.units(),
		);

	return components
		.map(({ value, unit }) => formatter(value, unit))
		.join(" ");
}

/**
 * Formats a quantity as a compound string.
 *
 * @param self Quantity to format from.
 * @param targetUnits Optional units to format the value with.
 * @param options Object with settings for the formatting.
 * @returns
 */
export function toCompound(
	self: Quantity,
	targetUnits?: string[],
	options?: CompoundFormatOptions,
): string {
	const {
		formatter = DEFAULT_FORMATTER,
		precision,
		skipZeros = true,
		threshold = 0,
		step = 3,
	} = options ?? {};

	const index = getLineageIndex(self.registry);

	const selectedUnits =
		targetUnits ?? selectUnitsForCompound(self, index, step);

	if (selectedUnits.length === 1)
		return formatSingleUnit(
			self,
			selectedUnits[0]!,
			!!targetUnits,
			formatter,
			precision,
		);

	return formatCompoundUnits(
		self,
		selectedUnits,
		formatter,
		{
			precision,
			skipZeros,
			threshold,
		},
		!!targetUnits,
	);
}
