# AGENTS.md — extension-tao-itemqti (taoQtiItem)

> Shared pillars (standards, quality / `pr-ready-gate`, Make, commit/PR):
> [nextgen-stack `tao/AGENTS.md`](https://github.com/oat-sa/nextgen-stack/blob/main/tao/AGENTS.md)
> · local: [`../AGENTS.md`](../AGENTS.md).

## 01 — Project Context

**What / why:** `oat-sa/extension-tao-itemqti` (id `taoQtiItem`) is the QTI
**Item** stack over `taoItems`: Creator, parse/serialize, import/export,
compile/pack, runner glue, portable-element hooks.

**Not:** Items library, PCI Manager (`qtiItemPci`), Assets, or RM chrome
(`@oat-sa/tao-core-ui`).

**Key directories / stack / constraints:**

```text
manifest.php
controller/              # QtiCreator, Preview, Runner, REST, …
model/                   # ItemModel, model/qti/, …
views/js/qtiCreator/
views/js/controller/creator/
views/templates/QtiCreator/
test/
```

Entrypoints: `/taoQtiItem/QtiCreator/createItem`; `qtiCreator/itemCreator.js`.

- Stack: PHP item + `lib-tao-qti` + tao-core; large in-repo Creator; npm
  `@oat-sa/tao-qti-item` + item-runner*.
- Versions from manifests/CI only.

**Docs:** [`README.md`](README.md). Shared docs / decision-log rules → parent AGENTS.

## 02 — Standards & Conventions

Package-only below. Family patterns, quality SoT, `pr-ready-gate`, polar-star →
**parent AGENTS**.

**Patterns / structure:**

- Creator changes stay under `qtiCreator/**`; prefer fixing runner engines upstream.

**Never do (this package):**

- Paste RM search into Creator; absorb PCI Manager; hand-edit `*.min.js`.
- Bypass portable-element registries; opportunistic huge Creator refactors.

**Ownership**

| Surface | Own? |
|---------|------|
| QTI Item Creator | **Yes** |
| Items library | **No** |
| RM / asset search chrome | **No** (call sites **Yes**) |
| PCI Manager | **No** |
| Item-runner | **Boot/glue Yes** / **Engine npm** |

## 03 — Build & Test Commands

Shared Make / CI / readiness / commit policy → **parent AGENTS**
([commit/PR policy](https://oat-sa.atlassian.net/wiki/x/_oXmqQ)).

**This package** (from Composer platform root):

```bash
./vendor/bin/phpunit -c phpunit.xml.dist taoQtiItem/test
npx grunt eslint:extensionreport --extension=taoQtiItem --force
npx grunt taobundle --extension=taoQtiItem
```
