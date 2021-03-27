# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 0.6.0 [2021-03-27]

### Added

- TypeScript typings.
- Explicit support for passing arbitrary data to formatters: data context.
- The `Formatter.formatAsPrimitive` method was added to replace calling `Formatter.format` without any suggestions.

### Changed

- Using formatters as React components is now deprecated. Prefer using the `Formatter.format` method in all cases.
- The `"primitive"` suggestion is no longer passed automatically when using the `Formatter.format` method.
- The format definition passed to `makeFormatter` and `Formatter.wrap` is no longer called with a single `suggestionTools` argument, but rather with `usageSuggestions` and `dataContext`.

### Removed

- The `SUGGESTIONS` export. Instead, pass suggestions directly as strings.
- All non-development dependencies, including React.

## 0.5.2 [2020-06-29]

### Changed

- Documentation has been updated.

## 0.5.1 [2020-06-26]

### Added

- `Formatter.wrap` now adds the static `Formatter.innerFormatter` property for debugging.

## 0.5.0 [2020-06-26]

### Changed

- `Formatter.override` static method of formatters has been renamed to `Formatter.wrap`.
- `Formatter.wrap` now defaults delegation of `suggestionTools`.

## O.4.0 [2020-06-25]

### Added

- All formatters now have the static `Formatter.override` method to allow easier overriding of formatter behaviour inside components that use them.

### Removed

- `FORMATTER_OVERRIDE` has been removed in favour of the static `Formatter.override` method.

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
