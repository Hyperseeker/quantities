# Rounding error fixing

Some calculations used to introduce noise into the result, typically from the imprecision inherent to JavaScript's floating point handling. (One example is the infamous `0.1 + 0.2 === 0.30000000000000004`.) The library now attempts to fix these issues during safe-math operations, which have been used throughout the library's calculations anyway.

The calculations required for the rounding add a certain amount of overhead per operation, but the impact is typically small enough to be worth the precision. Over one million consecutive iterations, the rounding adds between 500% and 600% overhead on average over simple division, which translates to ~10ns (= 0.01us = 0.00001ms) per rounding operation. This is imperceptibly fast for one-off operations, though it may incure an overhead of a few milliseconds on high-volume conversions (100 000+ values in sequence).

This approach has been rigorously tested to maintain desired precision (i.e. not snap non-noisy decimals) over 1 000 000 random decimal values, as well as over both day-to-day and extreme values (i.e. 0.1, pi, the tiny scalar of the unit electronvolt, values approaching the safe integer limit...). It should be safe to use in production.
