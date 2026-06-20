/**
 * @file Corrects floating-point arithmetic noise (e.g., 0.1 + 0.2) while preserving intentional decimal values.
 */

/**
 * Absolute fractional distance from an integer treated as noise.
 */
const FRACTION_THRESHOLD = 1e-6 - Number.EPSILON * 1e6;

/**
 * Relative tolerance for accepting a snapped candidate.
 */
const MAX_RELATIVE_SNAP = 2 * Number.EPSILON;

/**
 * Relative tolerance for considering a scaled value close to an integer.
 */
const RELATIVE_THRESHOLD = 1e-7;

/**
 * Largest exactly representable integer.
 */
const { MAX_SAFE_INTEGER } = Number;

/**
 * Upper bound for which a 1e8 scale stays within safe-integer range.
 */
const MAX_S8 = MAX_SAFE_INTEGER / 1e8;

/**
 * Upper bound for which a 1e7 scale stays within safe-integer range.
 */
const MAX_S7 = MAX_SAFE_INTEGER / 1e7;

/**
 * Upper bound for which a 1e6 scale stays within safe-integer range.
 */
const MAX_S6 = MAX_SAFE_INTEGER / 1e6;

/**
 * Largest value safe for 32-bit bitwise truncation.
 */
const MAX_BITWISE = 2147483647;

/**
 * Lower bound of the fractional band considered a significant decimal.
 */
const SIGNIFICANT_FRACTION_LOW = 0.1;

/**
 * Upper bound of the fractional band considered a significant decimal.
 */
const SIGNIFICANT_FRACTION_HIGH = 0.9;

/**
 * Corrects floating-point arithmetic noise while preserving intentional decimals.
 *
 * @param value Value to correct.
 *
 * @returns The snapped value, or the original value when no correction applies.
 */
export function snap(value: number): number {
	if (!Number.isFinite(value)) return value;
	if (value === 0) return 0;
	if (Number.isInteger(value)) return value;

	const sign = value < 0 ? -1 : 1;
	const absolute = value < 0 ? -value : value;

	if (absolute < 1e-300) return 0;

	const whole = absolute | 0;
	const fractional = absolute - whole;

	const significant =
		absolute < MAX_BITWISE &&
		fractional > SIGNIFICANT_FRACTION_LOW &&
		fractional < SIGNIFICANT_FRACTION_HIGH;

	if (!significant) {
		if (absolute >= 1) {
			const fractional = absolute - Math.floor(absolute);

			if (
				fractional < FRACTION_THRESHOLD ||
				fractional > 1 - FRACTION_THRESHOLD
			)
				return Math.round(value);
		} else if (absolute > 1 - FRACTION_THRESHOLD) {
			return sign;
		}
	}

	if (absolute >= 5e9) {
		const candidate = Math.round(value);
		const relDiff = Math.abs(value - candidate) / absolute;

		if (relDiff < MAX_RELATIVE_SNAP) return candidate;

		// * not within 2*EPSILON of integer: not noise at this magnitude
		// * skip scaled path to avoid snapping to a wrong decimal
		return value;
	}

	let scale: number;

	if (absolute <= MAX_S8) scale = 1e8;
	else if (absolute <= MAX_S7) scale = 1e7;
	else if (absolute <= MAX_S6) scale = 1e6;
	else return value;

	const scaled = absolute * scale;

	if (scaled < 1) {
		const exponent = Math.floor(Math.log10(absolute));

		const maxScaleExponent = Math.floor(
			Math.log10(MAX_SAFE_INTEGER / absolute),
		);

		for (
			let scaleExponent = -exponent;
			scaleExponent <= maxScaleExponent && scaleExponent <= 15;
			scaleExponent++
		) {
			const dynamicScale = 10 ** scaleExponent;
			const dynamicScaled = absolute * dynamicScale;
			const dynamicRounded = Math.round(dynamicScaled);
			const dynamicDifference = dynamicScaled - dynamicRounded;

			const dynamicAbsoluteDifference =
				dynamicDifference < 0 ? -dynamicDifference : dynamicDifference;

			if (dynamicScaled * RELATIVE_THRESHOLD <= dynamicAbsoluteDifference)
				continue;

			const candidate = (sign * dynamicRounded) / dynamicScale;

			if (dynamicAbsoluteDifference < dynamicScaled * MAX_RELATIVE_SNAP)
				return candidate;

			const fraction =
				dynamicDifference < 0
					? 1 + dynamicDifference
					: dynamicDifference;

			if (fraction < 1e-6 || fraction > 0.999999) return candidate;
		}

		return value;
	}

	const rounded =
		scaled < MAX_BITWISE ? (scaled + 0.5) | 0 : Math.round(scaled);

	const difference = scaled - rounded;
	const absoluteDifference = difference < 0 ? -difference : difference;

	if (scaled * RELATIVE_THRESHOLD > absoluteDifference) {
		const candidate = (sign * rounded) / scale;

		if (absoluteDifference < scaled * MAX_RELATIVE_SNAP) return candidate;

		const fraction = difference < 0 ? 1 + difference : difference;

		if (fraction < 1e-6 || fraction > 0.999999) return candidate;

		if (scale > 10) {
			const fallback = scale / 10;
			const scaledFallback = absolute * fallback;

			if (scaledFallback >= 0.1) {
				const roundedFallback =
					scaledFallback < MAX_BITWISE
						? (scaledFallback + 0.5) | 0
						: Math.round(scaledFallback);

				const differenceFallback = scaledFallback - roundedFallback;

				const absoluteDifferenceFallback =
					differenceFallback < 0
						? -differenceFallback
						: differenceFallback;

				if (
					scaledFallback * RELATIVE_THRESHOLD >
					absoluteDifferenceFallback
				) {
					const candidateFallback =
						(sign * roundedFallback) / fallback;

					if (
						absoluteDifferenceFallback <
						scaledFallback * MAX_RELATIVE_SNAP
					)
						return candidateFallback;

					const fractionFallback =
						differenceFallback >= 0
							? differenceFallback
							: 1 + differenceFallback;

					if (fractionFallback < 1e-6 || fractionFallback > 0.999999)
						return candidateFallback;
				}
			}
		}
	}

	return value;
}
