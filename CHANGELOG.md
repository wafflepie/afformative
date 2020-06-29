# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
