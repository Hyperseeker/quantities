# @quantities/registry

## 1.0.0 / 2026-06-20

Initial release.

### Added

- `createRegistry()`: build a registry from the default registry (augmenting or overriding existing units by key) or from scratch (pass `null` as the source for only the units you provide).
- `withRegistry()`: a factory to operate quantities with independent, isolated registries.

See [unit-registries.md](./.changelog/v1.0.0/unit-registries.md) for an overview of the registry system.
