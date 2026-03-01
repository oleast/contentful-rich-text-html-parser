# Copilot Instructions — contentful-rich-text-html-parser

## Project Overview

`contentful-rich-text-html-parser` converts any HTML string into a Contentful Rich Text `Document`. It is the mirror of `@contentful/rich-text-html-renderer` (which does the reverse: Rich Text → HTML).

**Round-trip goal:** When using the default configuration, the round-trip `RT → HTML (official renderer) → this library → RT` should reproduce the original Rich Text document. The configuration style (`convertTag` options pattern) matches the official renderer so users see a familiar API.

- **Runtime dependencies:** `@contentful/rich-text-types` (^17.2.1), `parse5` (^8.0.0)
- **Environment:** Must work in both browser and Node.js
- **License:** MIT
- **Maintainer:** oleast

## Priority Hierarchy

When making decisions about behavior, follow this priority order:

1. **Valid HTML behavior** — This is an HTML parser; standard HTML semantics are the baseline because users expect HTML to be interpreted correctly.
2. **Contentful Rich Text structural rules** — Output must be structurally valid for the Contentful API because invalid documents are rejected by the API. See the full rules enumeration below.
3. **Invalid HTML best-effort** — Real-world HTML is messy. When HTML is malformed, do useful conversion rather than failing, because users often paste content from word processors, CMSes, and other sources that produce imperfect markup.

## Architecture & Processing Pipeline

### Pipeline

```
HTML String
  → parseHtml()                          # parse5.parseFragment() → HTMLNode tree
  → mapHtmlNodeToRichTextNode()          # recursive converter traversal → RT nodes
  → processOrphanedNodes()               # fix orphaned list items & table elements (bottom-up)
  → processConvertedNodesFromTopLevel()  # filter/wrap top-level nodes
  → createDocumentNode()                 # wrap in Document
```

### File Responsibilities

| File | Purpose |
|---|---|
| `parseHtml.ts` | Wraps parse5.parseFragment() to create internal HTMLNode tree |
| `htmlStringToDocument.ts` | Main pipeline orchestrator; recursive conversion via mapHtmlNodeToRichTextNode |
| `converters.ts` | Built-in converter functions: convertTagToBlock, convertTagToInline, convertTagToHyperlink, convertTagToMark, convertTagToChildren, convertTextNodeToText, convertTextNodeToParagraphedText |
| `processOrphanedNodes.ts` | Handles orphaned list items and table elements (bottom-up recursive) |
| `processConvertedNodesFromTopLevel.ts` | Filters/wraps top-level nodes (text, inline, non-top-level blocks) |
| `types.ts` | Core type definitions: Options, TagConverter, Next, etc. |
| `utils.ts` | Type guards and helpers: isBlockType, isInlineType, isNodeTypeText, etc. |
| `constants.ts` | Derived arrays from rich-text-types enums |
| `src/examples/` | Example custom converters: divToParagraphConverter, imgToEmbeddedAssetConverter, spanWithMarksConverter |

### Converter Pattern

Converters have the signature: `(node: HTMLElementNode, next: Next) => ConverterResult`

- `node` — the parsed HTML element with tagName, children, attrs
- `next(node)` — continues converting children, returns array of RT nodes
- `next(node, mark)` — adds mark(s) to all descendant text nodes
- **Return a RT node object** (Block, Inline) → becomes an output node
- **Return `next(node)`** → skip/unwrap the element, keep its children
- **Return `[]`** → ignore the element and all its children
- Default converter for unknown tags: `convertTagToChildren` (unwrap)
- **Unmapped mark tags:** `<code>`, `<del>`, `<s>`, `<strike>` have no default converter — they are unwrapped by the default converter. Users can map these via `convertTag` options if needed.

### Mark Propagation

Marks accumulate via the `marks` parameter in the recursive `mapHtmlNodeToRichTextNode` call. When `next(node, mark)` is called, the mark is added to the list and all marks are applied to descendant Text nodes. Multiple marks combine — they are all carried down through the tree.

### Options Structure

```typescript
{
  convertTag: Record<string, TagConverter>;           // HTML tag → converter function
  defaultTagConverter: TagConverter;                   // Fallback for unrecognized tags (default: convertTagToChildren)
  convertText: TextConverter;                          // Custom text node converter (default: convertTextNodeToText)
  parserOptions: {
    handleWhitespaceNodes: "preserve" | "remove";     // default: "preserve"
  };
  postProcessing: {
    handleTopLevelText: "preserve" | "remove" | "wrap-paragraph";
    handleTopLevelInlines: "preserve" | "remove" | "wrap-paragraph";
    handleOrphanedListItems: "preserve" | "remove" | "wrap-ul" | "wrap-ol";
    handleOrphanedTableElements: "preserve" | "remove" | "wrap-table";
  };
}
```

All options default to `"preserve"` for backward compatibility.

## Contentful Rich Text Structural Rules

Source: `@contentful/rich-text-types` (currently v17.2.5 — update if rules change) — derived from schemaConstraints, validator, and TypeScript types.

### Block Types (BLOCKS enum)

| Enum Key | String Value |
|---|---|
| DOCUMENT | `"document"` |
| PARAGRAPH | `"paragraph"` |
| HEADING_1 | `"heading-1"` |
| HEADING_2 | `"heading-2"` |
| HEADING_3 | `"heading-3"` |
| HEADING_4 | `"heading-4"` |
| HEADING_5 | `"heading-5"` |
| HEADING_6 | `"heading-6"` |
| OL_LIST | `"ordered-list"` |
| UL_LIST | `"unordered-list"` |
| LIST_ITEM | `"list-item"` |
| HR | `"hr"` |
| QUOTE | `"blockquote"` |
| EMBEDDED_ENTRY | `"embedded-entry-block"` |
| EMBEDDED_ASSET | `"embedded-asset-block"` |
| EMBEDDED_RESOURCE | `"embedded-resource-block"` |
| TABLE | `"table"` |
| TABLE_ROW | `"table-row"` |
| TABLE_CELL | `"table-cell"` |
| TABLE_HEADER_CELL | `"table-header-cell"` |

### Inline Types (INLINES enum)

| Enum Key | String Value |
|---|---|
| HYPERLINK | `"hyperlink"` |
| ENTRY_HYPERLINK | `"entry-hyperlink"` |
| ASSET_HYPERLINK | `"asset-hyperlink"` |
| RESOURCE_HYPERLINK | `"resource-hyperlink"` |
| EMBEDDED_ENTRY | `"embedded-entry-inline"` |
| EMBEDDED_RESOURCE | `"embedded-resource-inline"` |

### Mark Types (MARKS enum)

| Enum Key | String Value |
|---|---|
| BOLD | `"bold"` |
| ITALIC | `"italic"` |
| UNDERLINE | `"underline"` |
| CODE | `"code"` |
| SUPERSCRIPT | `"superscript"` |
| SUBSCRIPT | `"subscript"` |
| STRIKETHROUGH | `"strikethrough"` |

### Document-Level Rules (TOP_LEVEL_BLOCKS)

A Document node's `content` may only contain these block types as direct children:

- PARAGRAPH
- HEADING_1, HEADING_2, HEADING_3, HEADING_4, HEADING_5, HEADING_6
- OL_LIST, UL_LIST
- HR
- QUOTE
- EMBEDDED_ENTRY, EMBEDDED_ASSET, EMBEDDED_RESOURCE
- TABLE

**NOT valid at top level:** DOCUMENT (no self-nesting), LIST_ITEM, TABLE_ROW, TABLE_CELL, TABLE_HEADER_CELL, any Inline type, Text nodes.

### Text Containers (TEXT_CONTAINERS)

Only these block types can contain Inline nodes and Text nodes as direct children:

- PARAGRAPH
- HEADING_1, HEADING_2, HEADING_3, HEADING_4, HEADING_5, HEADING_6

These are the "leaf" container blocks in the tree — they hold the actual text content.

### List Structure

- **OL_LIST** → can only contain: LIST_ITEM
- **UL_LIST** → can only contain: LIST_ITEM
- **LIST_ITEM** → can contain LIST_ITEM_BLOCKS: PARAGRAPH, HEADING_1–6, OL_LIST, UL_LIST, HR, QUOTE, EMBEDDED_ENTRY, EMBEDDED_ASSET, EMBEDDED_RESOURCE
  - LIST_ITEM_BLOCKS is the same as TOP_LEVEL_BLOCKS **minus TABLE**

### Quote Structure

- **QUOTE** → can only contain: PARAGRAPH

### Table Structure

- **TABLE** → can only contain: TABLE_ROW (minimum 1 row required)
- **TABLE_ROW** → can only contain: TABLE_CELL, TABLE_HEADER_CELL (minimum 1 cell required)
- **TABLE_CELL** → can only contain: PARAGRAPH (minimum 1 paragraph required)
- **TABLE_HEADER_CELL** → can only contain: PARAGRAPH (minimum 1 paragraph required)
- TABLE_CELL and TABLE_HEADER_CELL support optional data: `colspan` (number), `rowspan` (number)

> **Discrepancy note:** The CONTAINERS map in rich-text-types says TABLE_CELL can contain [PARAGRAPH, UL_LIST, OL_LIST], but the validator (`assertTableCell`) and the TypeScript types (`content: Paragraph[]`) both restrict TABLE_CELL to PARAGRAPH only. The validator is the authoritative source. This discrepancy only affects TABLE_CELL; TABLE_HEADER_CELL does not appear in the CONTAINERS map.

### Void Blocks (VOID_BLOCKS — content must be empty `[]`)

- HR
- EMBEDDED_ENTRY (block)
- EMBEDDED_ASSET (block)
- EMBEDDED_RESOURCE (block)

### Inline Content Rules

- **HYPERLINK** → content: Text[] only; data: `{ uri: string }`
- **ENTRY_HYPERLINK** → content: Text[] only; data: `{ target: { sys: { type: 'Link', linkType: 'Entry', id: string } } }`
- **ASSET_HYPERLINK** → content: Text[] only; data: `{ target: { sys: { type: 'Link', linkType: 'Asset', id: string } } }`
- **RESOURCE_HYPERLINK** → content: Text[] only; data: `{ target: { sys: { type: 'ResourceLink', linkType: 'Contentful:Entry', urn: string } } }`
- **EMBEDDED_ENTRY (inline)** → void content (empty `[]`); data: `{ target: { sys: { type: 'Link', linkType: 'Entry', id: string } } }`
- **EMBEDDED_RESOURCE (inline)** → void content (empty `[]`); data: `{ target: { sys: { type: 'ResourceLink', linkType: 'Contentful:Entry', urn: string } } }`

### Text Nodes

- `nodeType`: `"text"` (literal string, not in BLOCKS or INLINES enum)
- `value`: string
- `marks`: `Mark[]` — each Mark is `{ type: string }` where type is one of the MARKS values
- `data`: `{}` (empty object, must be present)
- Valid properties only: `nodeType`, `data`, `value`, `marks`

### Data Requirements by Node Type

| Node Type | Required data fields |
|---|---|
| EMBEDDED_ENTRY (block) | `target: { sys: { type: 'Link', linkType: 'Entry', id: string } }` |
| EMBEDDED_ASSET (block) | `target: { sys: { type: 'Link', linkType: 'Asset', id: string } }` |
| EMBEDDED_RESOURCE (block) | `target: { sys: { type: 'ResourceLink', linkType: 'Contentful:Entry', urn: string } }` |
| EMBEDDED_ENTRY (inline) | Same as block EMBEDDED_ENTRY |
| EMBEDDED_RESOURCE (inline) | Same as block EMBEDDED_RESOURCE |
| HYPERLINK | `uri: string` |
| ENTRY_HYPERLINK | `target: { sys: { type: 'Link', linkType: 'Entry', id: string } }` |
| ASSET_HYPERLINK | `target: { sys: { type: 'Link', linkType: 'Asset', id: string } }` |
| RESOURCE_HYPERLINK | `target: { sys: { type: 'ResourceLink', linkType: 'Contentful:Entry', urn: string } }` |
| TABLE_CELL | Optional: `colspan: number`, `rowspan: number` |
| TABLE_HEADER_CELL | Optional: `colspan: number`, `rowspan: number` |
| All others | `{}` (empty object) |

### Minimum Valid Document

```
Document > Paragraph > Text("", marks: [])
```

### Exported Schema Constants

From `schemaConstraints` in `@contentful/rich-text-types`:

- `TOP_LEVEL_BLOCKS` — valid document children
- `LIST_ITEM_BLOCKS` — valid list item children (TOP_LEVEL_BLOCKS minus TABLE)
- `TABLE_BLOCKS` — [TABLE, TABLE_ROW, TABLE_CELL, TABLE_HEADER_CELL]
- `VOID_BLOCKS` — [HR, EMBEDDED_ENTRY, EMBEDDED_ASSET, EMBEDDED_RESOURCE]
- `CONTAINERS` — map of container nodeType → array of allowed child nodeTypes
- `HEADINGS` — [HEADING_1..HEADING_6]
- `TEXT_CONTAINERS` — [PARAGRAPH, ...HEADINGS]

## Breaking Change Policy

- **Never change existing output behavior** without adding an opt-in option, because downstream users depend on the current output shape. Even if the current behavior produces technically invalid RT, changing it silently breaks consumers.
- **New options always default to `"preserve"`** to maintain backward compatibility. Existing behavior should not change when upgrading patch or minor versions.
- **Defaults may change in semver major releases** after adequate deprecation notice.
- **Bug fixes to clearly wrong behavior** (e.g., crashes, data loss) are OK without an option.
- **Truly new features** (new converters for previously unhandled tags, new option modes) are fine — they add capability without changing existing output.

## Post-Processing Pattern

When the priority hierarchy creates a conflict — HTML parsing produces valid HTML structure but invalid Contentful RT structure — resolve it with a post-processing option rather than silently changing the output.

**The pattern:**

1. Add a new option under `postProcessing` (or `parserOptions`)
2. Default to `"preserve"` (existing behavior unchanged)
3. Provide additional modes like `"remove"`, `"wrap-*"` that fix the RT validity issue
4. Document the option and its modes

**Current examples:**

- `handleTopLevelText` — text nodes directly in document content (invalid RT, but valid HTML)
- `handleTopLevelInlines` — inline nodes directly in document content (invalid RT, but valid HTML)
- `handleOrphanedListItems` — `<li>` outside of `<ul>`/`<ol>` (invalid HTML too, but parse5 handles it)
- `handleOrphanedTableElements` — `<tr>`/`<td>` outside of `<table>` (similar to above)

**Processing order:** `processOrphanedNodes` runs first (bottom-up recursive), then `processConvertedNodesFromTopLevel` (top-level filtering/wrapping).

## Code Style & Conventions

- **Functional and pure** — Prefer pure functions without side effects because they are easier to test and reason about.
- **TypeScript strict mode** — The project uses strict TypeScript. Keep types precise; avoid `any`.
- **Naming patterns** — Follow existing conventions: `handle*`, `is*`, `convertTag*`, `process*`, `create*`. Use camelCase for variables/functions, PascalCase for types.
- **One concern per file** — Each file should have a clear single responsibility. Split freely when a file grows beyond one concern.
- **Imports** — Use `.js` extension for relative imports (ESM compatibility). Imports are sorted by `eslint-plugin-simple-import-sort`.
- **Linting** — ESLint must always pass. The config includes Prettier formatting, import sorting, and `.js` extension enforcement.
- **parse5 is locked in** — Do not replace the HTML parser. parse5 is spec-compliant and battle-tested.
- **No new runtime dependencies** without strong justification. The dependency footprint is intentionally small (`@contentful/rich-text-types` + `parse5`). Dev dependencies are OK if justified.
- **Correctness over performance** — Do not optimize for performance unless a bottleneck is proven with profiling. Correct, readable code is the priority.
- **Contentful SDK compatibility** — Follow the `@contentful/rich-text-types` peer dependency range in package.json (currently ^17.2.1).
- **Dual CJS/ESM builds** — The project builds both CommonJS and ESM via `tsconfig.build.json` and `tsconfig.module.json`.
- **Error handling** — Follow existing patterns: best-effort conversion, don't throw on bad input. The library should be resilient.

## Testing Requirements

- **Tests are required for ALL changes** — every feature, bug fix, and new option must have test coverage. No exceptions.
- **Test framework:** vitest — run with `npm test` (or `vitest run`).
- **Test helpers** in `src/test/helpers.ts` provide `createText`, `createBlock`, `createInline` for building expected RT structures.
- **Round-trip tests** (RT → HTML via official renderer → parse back → compare) are nice to have but not required for every change.
- **Test organization** — Use `describe` block per feature, test each option value separately.

## Export & API Surface

- **Main export:** `htmlStringToDocument` function + types (from package root)
- **Secondary export:** `contentful-rich-text-html-parser/converters` — converter building blocks for custom converters
- **New export paths** need maintainer approval before adding, because they become part of the public API and are hard to remove.
- Exports are defined in the `exports` map in `package.json` with `types`/`import`/`require` fields.

## AI Usage Guidelines

- **Scope:** These guidelines cover code, tests, documentation, and CI — everything in this repository.
- **Code and tests:** AI may implement changes directly, following all conventions in this document.
- **Documentation and CI:** AI may draft changes to README, docs, and CI workflows, but the maintainer always reviews before commit because these affect the public-facing project and release pipeline.
- **Error handling:** Follow existing code patterns (best-effort, no throwing) rather than inventing new error handling strategies.
- **Principles over rules:** This document expresses principles with reasoning. When a situation isn't explicitly covered, reason from the principles rather than looking for a loophole.

## AI-Authored Code Tracking

AI-generated code must be tracked here so the maintainer knows what has and hasn't been human-reviewed.

### AI-Generated Files

| File | Status | Notes |
|---|---|---|
| `src/processOrphanedNodes.ts` | **AI-AUDITED** — pending maintainer review | AI-audited March 2026: cell-grouping bug fixed, inline recursion removed. Refactored March 2026: now thin orchestrator, logic extracted to dedicated files |
| `src/wrapOrphanedListItems.ts` | **AI-AUDITED** — pending maintainer review | NEW March 2026: extracted from `processOrphanedNodes.ts` |
| `src/wrapOrphanedTableElements.ts` | **AI-AUDITED** — pending maintainer review | NEW March 2026: extracted from `processOrphanedNodes.ts` |
| `src/test/orphanedNodes.test.ts` | **AI-AUDITED** — pending maintainer review | AI-audited March 2026: now shared/cross-cutting tests only. List item, table, and parse5 tests extracted to dedicated files |
| `src/test/orphanedListItems.test.ts` | **AI-AUDITED** — pending maintainer review | NEW March 2026: extracted from `orphanedNodes.test.ts` |
| `src/test/orphanedTableElements.test.ts` | **AI-AUDITED** — pending maintainer review | NEW March 2026: extracted from `orphanedNodes.test.ts` |
| `src/test/parse5Behavior.test.ts` | **AI-AUDITED** — pending maintainer review | NEW March 2026: parse5 behavior verification tests, extracted from `orphanedNodes.test.ts` |

### Human-Authored Files (NOT AI-generated)

- `src/processConvertedNodesFromTopLevel.ts` — This is **trusted production code**, written by the maintainer. It is NOT AI-generated despite being thematically similar to processOrphanedNodes.

### Tracking Policy

- All future AI-authored files or significant AI-authored features must be added to the table above with date and scope.
- AI-generated code starts as untrusted until the maintainer marks it as audited.
- Minor AI-assisted edits to existing human-authored files (e.g., small bug fixes, adding an option) do not need to be tracked individually.
