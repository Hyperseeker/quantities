# Unit registries

Units are now handled via the new registry system. Each `Quantity` can be used with a registry of augmented or entirely-custom units.

By default, `Quantity` imported from `@quantities/core` comes with a default registry attached. This registry contains a default set of units, which is a reduced set of units from v1.8.0 containing only the more-common and regular units (with the rest going into `@quantities/units`). Units-wise, `Quantity`'s behavior is not altered in the slightest by this change.

The `@quantities/registry` package allows users to create their own registries, either from scratch (no units but the ones user provides) or from the default registry (augmenting or changing it with custom units or overrides of existing ones). In short, this allows users to add the units they need (if those aren't part of the default registry) or edit existing units' properties, such as aliases. (See also: the Changed section.)

The `withRegistry()` factory allows users to operate quantities with independent, isolated registries each.
