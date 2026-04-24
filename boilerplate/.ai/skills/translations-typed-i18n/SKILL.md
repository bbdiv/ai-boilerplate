---
name: translations-typed-i18n
description: >-
  Manage i18n translation keys, locale JSON files, and the TypeScript type
  that keeps them type-safe. Apply when adding, editing, or removing
  translation keys or locale files.
last_reviewed: 2026-04-22
source: boilerplate
source_version: 1.4.0
---

# Typed i18n translations

This pattern pairs translation JSON files with a TypeScript type so every `t()` call is validated at compile time. Adapt the exact file paths to match this project's `src/locale/` layout.

## Key files (adapt paths to this project)

| File | Role |
|------|------|
| `src/locale/translations/<locale>/index.json` (one per supported locale) | Translation values per locale. |
| `src/locale/translationsKeyType.ts` (or similar) | TypeScript type mirroring the default-locale JSON structure. **Must stay in sync.** |
| `src/@hook/useTypedTranslation.ts` (or similar) | Typed `t()` hook for React components. |
| `src/utils/strings/translateString.ts` (or similar) | Typed `t()` for use outside React. |

The typed key file exists so `t('UNKNOWN_KEY')` is a compile error rather than a silent runtime fallback to the literal string.

## How it works

The typed key definition mirrors the JSON shape. A utility type flattens it into a dot-notation union (e.g., `'COMPONENTS.MODAL.UNSAVED_CHANGES_DESCRIPTION'`). Both the React hook and the non-React helper accept only keys from this union.

- Key in JSON but missing from the type → `t()` rejects it at compile time.
- Key in the type but missing from JSON → silently falls back to the literal string at runtime.

## Mandatory rule for user-facing strings

Any user-facing text (buttons, labels, modals, notifications, tooltips) **must** go through a translation key. Raw inline strings are only acceptable when the user explicitly asks for them.

## Adding a new key — always update these together

1. **Every locale JSON file** under `src/locale/translations/<locale>/`.
2. **The TypeScript key type** (`translationsKeyType.ts` or equivalent).

Failing to update both sides causes silent drift.

## Nested keys

Flat keys map to `KEY: string;`. Nested JSON objects become nested type blocks:

```ts
type TranslationsTypeKey = {
  SAVE_CHANGES: string;
  COMPONENTS: {
    MODAL: {
      UNSAVED_CHANGES_DESCRIPTION: string;
    };
    NOTIFICATION: {
      CHANGES_SAVED_WITH_SUCCESS: string;
    };
  };
};
```

Keep keys **alphabetically sorted** within each nesting level.

## Interpolation

Use `{{VARIABLE}}` placeholders and pass values in the options object:

```json
"USER_CREATED_WITH_SUCCESS": "{{COUNT}} user(s) created successfully"
```

```ts
t('USER_CREATED_WITH_SUCCESS', { COUNT: 3 });
```

## Plurals (i18next)

Define both the base key and the `_other` variant in JSON and in the type:

```json
"MODULE": "Module",
"MODULE_other": "Modules"
```

```ts
MODULE: string;
MODULE_other: string;
```

## Checklist

1. Key added to every locale JSON file.
2. Key added to the typed-key definition.
3. Alphabetical order within each nesting level.
4. `t('NEW_KEY')` compiles without errors.
5. No raw user-facing strings introduced in the diff.
