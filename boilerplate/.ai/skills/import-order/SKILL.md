---
name: import-order
description: >-
  Enforce grouped and ordered imports in all code files. Apply whenever
  creating or editing any file that contains imports so they stay consistent
  and easy to review.
last_reviewed: 2026-04-22
source: boilerplate
source_version: 1.4.0
---

# Import Order

Apply this order every time you touch a file with imports. Adapt group names to match this project's aliases and package set, but keep the 5-group structure.

## Rules

1. Group imports by category (see below).
2. One blank line between groups.
3. Alphabetical order within each group (by module path).
4. Alphabetical order within named specifiers when practical (`{ A, B, C }`).
5. No unused imports.
6. Within the internal-alias group, add **sub-groups** when the first segment after the alias changes (e.g. `@app/@hook/*` separate from `@app/@query/*`). One blank line between sub-groups. Even if a file imports only internal modules, split them into sub-groups rather than keeping them in one solid block.

## Group order

1. **Framework core & ecosystem** — `react`, `react-dom`, router libraries, data libraries (`@tanstack/*`), i18n libraries.
2. **External packages** — third-party libraries (UI kits, utilities like `lodash`, `antd`, etc.).
3. **Icons** — icon imports. Prefer a centralized barrel (e.g. `@icons`) over importing `react-icons/*` directly.
4. **Internal absolute aliases** — project-specific aliases (`@app/*`, `@models/*`, `@components/*`, `@queries/*`, etc.). Split by first segment with blank lines between sub-groups.
5. **Relative imports** — `./*`, `../*` always last.

## Example

```ts
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Table } from '<ui-kit>';
import { debounce } from 'lodash';

import { MdAddCircleOutline } from '@icons';

import useTypedTranslation from '@app/@hook/useTypedTranslation';

import useGetSomething from '@app/@query/queries/x/useGetSomething';

import IFilters from '@app/@models/x/IFilters';

import MainLayout from '@app/components/Layout/MainLayout';

import Header from './Header';
import CountersSection from './CountersSection';
```

## Notes

- Do not mix relative imports with alias imports in the same group.
- If a file has only 2–3 imports, keep the same group priorities anyway.
- Preserve existing block-separator comments if they are still valid.

## Checklist

1. Grouped by category in the defined order.
2. Blank line between groups (and sub-groups inside the internal-alias block).
3. Alphabetical inside each group.
4. Relative imports at the end.
5. No unused imports.
