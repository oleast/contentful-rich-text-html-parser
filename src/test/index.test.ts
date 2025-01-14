import { TagConverter } from "./../types";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import {
  Block,
  BLOCKS,
  INLINES,
  Mark,
  TopLevelBlock,
  validateRichTextDocument,
} from "@contentful/rich-text-types";
import {
  DEFAULT_TAG_CONVERTER,
  htmlStringToDocument,
} from "../htmlStringToDocument";

import { describe, expect, it } from "vitest";
import { EXAMPLE_RICH_TEXT } from "./example";
import { createDocumentNode } from "../utils";
import * as helpers from "./helpers";

const htmlString = documentToHtmlString(EXAMPLE_RICH_TEXT);

describe("Parse HTML string to Contentful Document", () => {
  it("Parse HTML string to Contentful Rich Text and back again", () => {
    const htmlNodes = htmlStringToDocument(htmlString);
    const newHtmlString = documentToHtmlString(htmlNodes);
    expect(newHtmlString).toEqual(htmlString);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });
});

describe("Parse with custom converter functions", () => {
  it("Handles a simple convert option from 'div' to 'paragraph'", () => {
    const divToParagraphConverter: TagConverter<Block> = (node, next) => {
      return {
        nodeType: BLOCKS.PARAGRAPH,
        content: next(node),
        data: {},
      };
    };
    const matchText = "This is text in a div";
    const htmlNodes = htmlStringToDocument(`<div>${matchText}</div>`, {
      convertTag: {
        div: divToParagraphConverter,
      },
    });

    const matchNode = helpers.createBlock(
      BLOCKS.PARAGRAPH,
      helpers.createText(matchText),
    );

    expect(htmlNodes).toMatchObject(
      createDocumentNode([matchNode as TopLevelBlock]),
    );
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("Handles a complex convert option from 'span' with bold class to 'paragraph' and 'bold' mark", () => {
    const styledSpanToMarkedParagraphConverter: TagConverter<Block> = (
      node,
      next,
    ) => {
      const isBold = node.attrs.class === "bold";
      const marks = isBold ? ({ type: "bold" } satisfies Mark) : undefined;
      return {
        nodeType: BLOCKS.PARAGRAPH,
        content: next(node, marks),
        data: {},
      };
    };
    const matchText = "text";
    const htmlNodes = htmlStringToDocument(
      `<span class="bold">${matchText}</span>`,
      {
        convertTag: {
          span: styledSpanToMarkedParagraphConverter,
        },
      },
    );

    const matchNode = createDocumentNode([
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createText(matchText, { type: "bold" }),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });
});

describe("Parse unsupported tags", () => {
  it("Skips element by default", () => {
    const matchText = "This is text in a custom tag";
    const htmlNodes = htmlStringToDocument(
      `<p><custom-tag>${matchText}</custom-tag></p>`,
    );

    const matchNode = createDocumentNode([
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText(matchText)),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("Uses default converter when specified", () => {
    const defaultConverter: TagConverter<Block> = (node, next) => {
      return {
        nodeType: BLOCKS.PARAGRAPH,
        content: next(node),
        data: {},
      };
    };
    const matchText = "This is text in a custom tag";
    const htmlNodes = htmlStringToDocument(
      `<custom-tag>${matchText}</custom-tag>`,
      {
        convertTag: {
          [DEFAULT_TAG_CONVERTER]: defaultConverter,
        },
      },
    );

    const matchNode = createDocumentNode([
      helpers.createBlock(BLOCKS.PARAGRAPH, helpers.createText(matchText)),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    console.log(validateRichTextDocument(htmlNodes));
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });
});

describe("Processing top level inline nodes to valid formats", () => {
  it("Keeps an invalid top level inline node by default", () => {
    const htmlNodes = htmlStringToDocument(
      `<a href="http://example.com">Top level hyperlink</a>`,
    );
    const matchNode = createDocumentNode([
      helpers.createInline(
        INLINES.HYPERLINK,
        helpers.createText("Top level hyperlink"),
        { uri: "http://example.com" },
      ),
    ] as unknown as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(1);
  });

  it("Removes an invalid top level inline node", () => {
    const htmlNodes = htmlStringToDocument(
      `<a href="http://example.com">Top level hyperlink</a>`,
      {
        postProcessing: { handleTopLevelInlines: "remove" },
      },
    );
    const matchNode = createDocumentNode([] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("Wraps an invalid top level inline node in a paragraph", () => {
    const htmlNodes = htmlStringToDocument(
      `<a href="http://example.com">Top level hyperlink</a>`,
      {
        postProcessing: { handleTopLevelInlines: "wrap-paragraph" },
      },
    );
    const matchNode = createDocumentNode([
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createInline(
          INLINES.HYPERLINK,
          helpers.createText("Top level hyperlink"),
          { uri: "http://example.com" },
        ),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });
});

describe("Processing top level text nodes to valid formats", () => {
  it("Keeps an invalid top level text node by default", () => {
    const htmlNodes = htmlStringToDocument(
      "<div>Text under top level div</div>",
    );
    const matchNode = createDocumentNode([
      helpers.createText(
        "Text under top level div",
      ) as unknown as TopLevelBlock,
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(1);
  });

  it("Converts an invalid top level text node to a paragraph node", () => {
    const htmlNodes = htmlStringToDocument(
      "<div>Text under top level div</div>",
      {
        postProcessing: { handleTopLevelText: "wrap-paragraph" },
      },
    );
    const matchNode = createDocumentNode([
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createText("Text under top level div"),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("Removes an invalid top level text node", () => {
    const htmlNodes = htmlStringToDocument(
      "<div>Text under top level div</div>",
      {
        postProcessing: { handleTopLevelText: "remove" },
      },
    );
    const matchNode = createDocumentNode([] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("Handles a combination of valid top level nodes and top level text nodes.", () => {
    const htmlNodes = htmlStringToDocument(
      "Some unwrapped text prefixing a p tag." +
        "<p>Paragraph content <span>I am a text node</span></p>" +
        "Some unwrapped text suffixing a p tag",
      {
        postProcessing: { handleTopLevelText: "wrap-paragraph" },
      },
    );

    const matchNode = createDocumentNode([
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createText("Some unwrapped text prefixing a p tag."),
      ),
      helpers.createBlock(BLOCKS.PARAGRAPH, [
        helpers.createText("Paragraph content "),
        helpers.createText("I am a text node"),
      ]),
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createText("Some unwrapped text suffixing a p tag"),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });
});

describe("Parsing options for whitespace", () => {
  it("Handles text nodes with only whitespace by removing them", () => {
    const html = `<h2>Heading on the first line</h2>\n\n<p>Text on the third line.</p>`;

    const htmlNodes = htmlStringToDocument(html, {
      parserOptions: {
        handleWhitespaceNodes: "remove",
      },
    });

    const matchNode = createDocumentNode([
      helpers.createBlock(
        BLOCKS.HEADING_2,
        helpers.createText("Heading on the first line"),
      ),
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createText("Text on the third line."),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(0);
  });

  it("Handles text nodes with only whitespace by preserving them", () => {
    const html = `<h2>Heading on the first line</h2>\n\n<p>Text on the third line.</p>`;

    const htmlNodes = htmlStringToDocument(html, {
      parserOptions: {
        handleWhitespaceNodes: "preserve",
      },
    });

    const matchNode = createDocumentNode([
      helpers.createBlock(
        BLOCKS.HEADING_2,
        helpers.createText("Heading on the first line"),
      ),
      helpers.createText("\n\n"),
      helpers.createBlock(
        BLOCKS.PARAGRAPH,
        helpers.createText("Text on the third line."),
      ),
    ] as TopLevelBlock[]);

    expect(htmlNodes).toMatchObject(matchNode);
    expect(validateRichTextDocument(htmlNodes).length).toEqual(1);
    expect(validateRichTextDocument(htmlNodes)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          details: "Value must be one of expected values",
          expected: [
            "blockquote",
            "embedded-asset-block",
            "embedded-entry-block",
            "embedded-resource-block",
            "heading-1",
            "heading-2",
            "heading-3",
            "heading-4",
            "heading-5",
            "heading-6",
            "hr",
            "ordered-list",
            "paragraph",
            "table",
            "unordered-list",
          ],
          name: "in",
          path: ["content", 1, "nodeType"],
          value: "text",
        }),
      ]),
    );
  });
});
