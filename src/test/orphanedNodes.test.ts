import {
  BLOCKS,
  TopLevelBlock,
  validateRichTextDocument,
} from "@contentful/rich-text-types";
import { describe, expect, it } from "vitest";

import { htmlStringToDocument } from "../htmlStringToDocument.js";
import { createDocumentNode } from "../utils.js";
import * as helpers from "./helpers.js";

describe("Backwards compatibility", () => {
  it("default options preserve orphaned list items (backwards compatible)", () => {
    const htmlNodes = htmlStringToDocument("<li>item</li>");
    // No options = preserve behavior = orphaned elements kept as-is

    expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.LIST_ITEM);
    // Document is invalid (expected for preserve mode)
    expect(validateRichTextDocument(htmlNodes).length).toBeGreaterThan(0);
  });

  it("default options preserve orphaned table elements (backwards compatible)", () => {
    const htmlNodes = htmlStringToDocument("<tr><td>cell</td></tr>");
    // No options = preserve behavior = orphaned elements kept as-is

    expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.TABLE_ROW);
    // Document is invalid (expected for preserve mode)
    expect(validateRichTextDocument(htmlNodes).length).toBeGreaterThan(0);
  });

  it("wrapping produces correct structure for lists", () => {
    const inputs = ["<li>item</li>", "<li>A</li><li>B</li>"];

    for (const input of inputs) {
      const htmlNodes = htmlStringToDocument(input, {
        postProcessing: { handleOrphanedListItems: "wrap-ul" },
      });
      // Verify list items are wrapped in a list
      expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.UL_LIST);
    }
  });

  it("wrapping produces correct structure for tables", () => {
    const inputs = ["<tr><td>cell</td></tr>", "<td>cell</td>"];

    for (const input of inputs) {
      const htmlNodes = htmlStringToDocument(input, {
        postProcessing: { handleOrphanedTableElements: "wrap-table" },
      });
      // Verify table elements are wrapped in a table
      expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.TABLE);
    }
  });
});

describe("Wrapped output produces valid Rich Text documents", () => {
  it("wrap-ul produces valid document", () => {
    const htmlNodes = htmlStringToDocument("<li><p>A</p></li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("wrap-ol produces valid document", () => {
    const htmlNodes = htmlStringToDocument("<li><p>A</p></li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ol" },
    });
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("wrap-table produces valid document", () => {
    const htmlNodes = htmlStringToDocument("<tr><td><p>A</p></td></tr>", {
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });
});

describe("Mixed orphan types", () => {
  it("handles list items and table rows at same level independently", () => {
    // Note: parse5 may reorder elements. Testing with table elements first.
    const htmlNodes = htmlStringToDocument(
      "<tr><td>cell</td></tr><li>item</li>",
      {
        postProcessing: {
          handleOrphanedListItems: "wrap-ul",
          handleOrphanedTableElements: "wrap-table",
        },
      },
    );

    // Table elements and list items are in different orphan groups
    // Table row comes first, then list item
    const tableNode = htmlNodes.content.find(
      (n) => n.nodeType === BLOCKS.TABLE,
    );
    const listNode = htmlNodes.content.find(
      (n) => n.nodeType === BLOCKS.UL_LIST,
    );

    expect(tableNode).toBeDefined();
    expect(listNode).toBeDefined();
  });

  it("wraps orphaned list items inside blockquote", () => {
    // Known limitation: QUOTE > UL_LIST is invalid Contentful RT
    // (QUOTE only allows PARAGRAPH children), but orphan processing
    // correctly wraps the list items regardless of parent constraints.
    const htmlNodes = htmlStringToDocument(
      "<blockquote><li>A</li><li>B</li></blockquote>",
      {
        postProcessing: { handleOrphanedListItems: "wrap-ul" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.QUOTE,
        helpers.createBlock(BLOCKS.UL_LIST, [
          helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("A")),
          helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("B")),
        ]),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });
});

describe("Custom converter interaction", () => {
  it("wraps orphaned LIST_ITEM produced by custom converter", () => {
    const htmlNodes = htmlStringToDocument("<div>custom</div>", {
      convertTag: {
        div: (node, next) => ({
          nodeType: BLOCKS.LIST_ITEM,
          content: next(node),
          data: {},
        }),
      },
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.UL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("custom")),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps consecutive TABLE_CELL nodes produced by custom converter", () => {
    const htmlNodes = htmlStringToDocument("<div>A</div><div>B</div>", {
      convertTag: {
        div: (node, next) => ({
          nodeType: BLOCKS.TABLE_CELL,
          content: next(node),
          data: {},
        }),
      },
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(BLOCKS.TABLE_ROW, [
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("A")),
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("B")),
        ]),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });
});
