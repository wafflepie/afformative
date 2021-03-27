# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 0.6.0-alpha.# [2021-03-27]

### Changed

- Formatters again fall back to `null` if used as React components.

## 0.6.0-alpha.2 [2021-03-27]

### Added

- The `formatAsPrimitive` method, supplying the `"primitive"` suggestion automatically.

### Changed

- Type signatures have been modified to better handle structural changes when using the `"primitive"` suggestion.

## 0.6.0-alpha.1 [2020-12-20]

### Added

- TypeScript support. Enjoy!
- Explicit support for passing arbitrary data to formatters: data context.

### Changed

- Using formatters as React components is now deprecated. Prefer using the `.format` method in all cases.
  - This is to make formatters more versatile, as the ability to use formatters as React components implies that hook usage within formatters is okay, when in reality it just makes using the formatters harder in some contexts.
- It is now necessary to pass the `"primitive"` suggestion manually when using the `.format` method.
- The format definition passed to `makeFormatter` and `.wrap` is no longer called with a single `suggestionTools` argument, but rather with `usageSuggestions` and `dataContext`.

### Removed

- The `SUGGESTIONS` export. Instead, pass suggestions directly as strings.
- All non-development dependencies, including React.

## 0.5.2 [2020-06-29]

### Changed

- Documentation has been updated.

## 0.5.1 [2020-06-26]

### Added

- `.wrap` now adds the static `.innerFormatter` property for debugging.

## 0.5.0 [2020-06-26]

### Changed

- `.override` static method of formatters has been renamed to `.wrap`.
- `.wrap` now defaults delegation of `suggestionTools`.

## O.4.0 [2020-06-25]

### Added

- All formatters now have the static `.override` method to allow easier overriding of formatter behaviour inside components that use them.

### Removed

- `FORMATTER_OVERRIDE` has been removed in favour of the static `.override` method.

## 0.3.1 [2020-06-25]

### Added

- Formatters now fall back to `null` if `format` returns `undefined`.

## 0.3.0 [2020-06-24]

### Added

- `FORMATTER_OVERRIDE` to allow overriding the behaviour of all formatters for certain values.

### Removed

- `makeUseFormatter` has been removed in favour of manual hook creation.

### Changed

- `Formatter.format` now adds `SUGGESTIONS.primitive` only if no suggestions are passed. This allows using `Formatter.format` as a way to delegate formatting without any additional logic.

## 0.2.0 [2020-05-14]

### Changed

- `withIcon` suggestion has been replaced with `icon`.

## 0.1.1 [2020-05-10]

### Fixed

- Optimizations regarding publishing to npm.

## 0.1.0 [2020-05-10]

### Added

- `makeFormatter`, `makeUseFormatter`, and `SUGGESTIONS`.
