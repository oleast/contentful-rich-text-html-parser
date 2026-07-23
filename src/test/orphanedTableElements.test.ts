import {
  Block,
  BLOCKS,
  TopLevelBlock,
  validateRichTextDocument,
} from "@contentful/rich-text-types";
import { describe, expect, it } from "vitest";

import { htmlStringToDocument } from "../htmlStringToDocument.js";
import { createDocumentNode } from "../utils.js";
import * as helpers from "./helpers.js";

describe("Processing orphaned table elements", () => {
  it("wraps orphaned table row in TABLE", () => {
    const htmlNodes = htmlStringToDocument("<tr><td>cell</td></tr>", {
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("cell")),
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps consecutive orphaned table rows in single TABLE", () => {
    const htmlNodes = htmlStringToDocument(
      "<tr><td>A</td></tr><tr><td>B</td></tr>",
      {
        postProcessing: { handleOrphanedTableElements: "wrap-table" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.TABLE, [
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("A")),
        ),
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("B")),
        ),
      ]),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("creates separate tables when orphaned rows are interrupted", () => {
    const htmlNodes = htmlStringToDocument(
      "<tr><td>A</td></tr><p>break</p><tr><td>B</td></tr>",
      {
        postProcessing: { handleOrphanedTableElements: "wrap-table" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("A")),
        ),
      ),
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText("break")),
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("B")),
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("handles mixed orphaned rows and cells correctly", () => {
    // Note: When orphaned <td> follows <tr>, HTML parser normalizes it to a row
    // So all three become consecutive rows and are grouped in single table
    const htmlNodes = htmlStringToDocument(
      "<tr><td>row1</td></tr><tr><td>row2</td></tr><td>lone</td>",
      {
        postProcessing: { handleOrphanedTableElements: "wrap-table" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.TABLE, [
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("row1")),
        ),
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("row2")),
        ),
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("lone")),
        ),
      ]),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps truly orphaned cell (not following rows) in separate table", () => {
    const htmlNodes = htmlStringToDocument("<td>A</td><p>break</p><td>B</td>", {
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("A")),
        ),
      ),
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText("break")),
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("B")),
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps orphaned table cell in TABLE_ROW and TABLE", () => {
    const htmlNodes = htmlStringToDocument("<td>lone cell</td>", {
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(
            BLOCKS.TABLE_CELL,
            helpers.createText("lone cell"),
          ),
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("does not modify already valid table structures", () => {
    const htmlNodes = htmlStringToDocument(
      "<table><tr><td>valid</td></tr></table>",
      {
        postProcessing: { handleOrphanedTableElements: "wrap-table" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(
          BLOCKS.TABLE_ROW,
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("valid")),
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("removes orphaned table elements when remove option specified", () => {
    const htmlNodes = htmlStringToDocument(
      "<tr><td>removed</td></tr><p>kept</p>",
      {
        postProcessing: { handleOrphanedTableElements: "remove" },
      },
    );

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText("kept")),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("preserves orphaned table elements by default (invalid document)", () => {
    const htmlNodes = htmlStringToDocument("<tr><td>orphan</td></tr>");

    // With default preserve, table row remains orphaned (invalid)
    expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.TABLE_ROW);
    expect(validateRichTextDocument(htmlNodes).length).toBeGreaterThan(0);
  });

  it("wraps orphaned table header cell in proper structure", () => {
    const htmlNodes = htmlStringToDocument("<th>Header</th>", {
      postProcessing: {
        handleOrphanedTableElements: "wrap-table",
      },
    });

    // Should create TABLE > TABLE_ROW > TABLE_HEADER_CELL
    expect(htmlNodes.content[0].nodeType).toEqual(BLOCKS.TABLE);
    const table = htmlNodes.content[0] as Block;
    expect(table.content[0].nodeType).toEqual(BLOCKS.TABLE_ROW);
    const row = table.content[0] as Block;
    expect(row.content[0].nodeType).toEqual(BLOCKS.TABLE_HEADER_CELL);
  });

  it("wraps consecutive orphaned cells into single TABLE_ROW", () => {
    const htmlNodes = htmlStringToDocument("<td>A</td><td>B</td>", {
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

  it("wraps mixed orphaned td and th cells into single TABLE_ROW", () => {
    const htmlNodes = htmlStringToDocument("<td>A</td><th>B</th>", {
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(
        BLOCKS.TABLE,
        helpers.createBlock(BLOCKS.TABLE_ROW, [
          helpers.createBlock(BLOCKS.TABLE_CELL, helpers.createText("A")),
          helpers.createBlock(
            BLOCKS.TABLE_HEADER_CELL,
            helpers.createText("B"),
          ),
        ]),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });

  it("wraps consecutive empty table rows", () => {
    const htmlNodes = htmlStringToDocument("<tr></tr><tr></tr>", {
      postProcessing: { handleOrphanedTableElements: "wrap-table" },
    });

    const expected = createDocumentNode([
      helpers.createBlock(BLOCKS.TABLE, [
        helpers.createBlock(BLOCKS.TABLE_ROW, []),
        helpers.createBlock(BLOCKS.TABLE_ROW, []),
      ]),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(expected);
  });
});
