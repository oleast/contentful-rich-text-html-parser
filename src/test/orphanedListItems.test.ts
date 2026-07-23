import {
  BLOCKS,
  TopLevelBlock,
  validateRichTextDocument,
} from "@contentful/rich-text-types";
import { describe, expect, it } from "vitest";

import { htmlStringToDocument } from "../htmlStringToDocument.js";
import { createDocumentNode } from "../utils.js";
import * as helpers from "./helpers.js";

describe("Processing orphaned list items", () => {
  it("wraps single orphaned list item in UL_LIST", () => {
    const htmlNodes = htmlStringToDocument("<li>orphan</li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.UL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("orphan")),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps consecutive orphaned list items in single UL_LIST", () => {
    const htmlNodes = htmlStringToDocument("<li>A</li><li>B</li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.UL_LIST, [
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("A")),
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("B")),
      ]),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("creates separate lists when orphaned items are interrupted", () => {
    const htmlNodes = htmlStringToDocument("<li>A</li><p>break</p><li>B</li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.UL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("A")),
      ),
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText("break")),
      helpers.createBlock(
        BLOCKS.UL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("B")),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps nested orphaned list items within parent structure", () => {
    const htmlNodes = htmlStringToDocument(
      "<blockquote><li>nested</li></blockquote>",
      {
        postProcessing: { handleOrphanedListItems: "wrap-ul" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.QUOTE,
        helpers.createBlock(
          BLOCKS.UL_LIST,
          helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("nested")),
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("does not modify already valid list structures", () => {
    const htmlNodes = htmlStringToDocument("<ul><li>valid</li></ul>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.UL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("valid")),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("preserves empty list items when wrapped", () => {
    const htmlNodes = htmlStringToDocument("<li></li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.UL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, []),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps orphaned list items in OL_LIST when wrap-ol specified", () => {
    const htmlNodes = htmlStringToDocument("<li>ordered</li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ol" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.OL_LIST,
        helpers.createBlock(BLOCKS.LIST_ITEM, helpers.createText("ordered")),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("removes orphaned list items when remove option specified", () => {
    const htmlNodes = htmlStringToDocument("<li>removed</li><p>kept</p>", {
      postProcessing: { handleOrphanedListItems: "remove" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText("kept")),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("preserves orphaned list items by default (invalid document)", () => {
    const htmlNodes = htmlStringToDocument("<li>orphan</li>");

    // With default preserve, list item remains orphaned (invalid)
    expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.LIST_ITEM);
    expect(validateRichTextDocument(htmlNodes).length).toBeGreaterThan(0);
  });

  it("wraps consecutive empty list items", () => {
    const htmlNodes = htmlStringToDocument("<li></li><li></li>", {
      postProcessing: { handleOrphanedListItems: "wrap-ul" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.UL_LIST, [
        helpers.createBlock(BLOCKS.LIST_ITEM, []),
        helpers.createBlock(BLOCKS.LIST_ITEM, []),
      ]),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });
});
