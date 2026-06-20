# `<redshift>` unit deprecation

The unit `<redshift>` has been deprecated and is no longer advised for use. It was defined in a version of `ruby-units` (the grandparent of this library) before 2009 (i.e. before `ruby-units` was first put on Github). Since then, much of the materials surrounding those earlier versions appear to be lost to history; as such, it is challenging to track down why exactly it appeared among the definitions.

Even so, the definition of the unit as it is is incorrect: it appears to define the Hubble constant for a particular value if `h` (specifically `h_70`), which does not represent the red-shifting of anything. It appears to have been derived via the Hubble law for small redshifts (`d ≈ (c/H₀) × z`, from `v = H₀ × d` and `z ≈ v/c`, for `z < 1`), which is inaccurate, as this calculates Hubble length: a separate value entirely.

Redshift is a ratio of wavelengths, and is thus unitless and can only be defined via two wavelengths.

Because of this, we've marked the `<redshift>` unit as deprecated. It will be removed in the next major version.

In its wake, we've added `<hubble-length>`: the value `<redshift>` actually defines. We calculate Hubble length using Planck 2018 cosmology, as it provides a stable and commonly-understood framework for calculating astronomical values. `<hubble-length>` is arguably more correct because it is honest about what it represents and is calculated using clear unit hierarchy.
