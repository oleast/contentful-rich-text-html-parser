import { TagConverter } from "./../types";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import {
  Block,
  BLOCKS,
  Document,
  Mark,
  TopLevelBlock,
} from "@contentful/rich-text-types";
import { htmlStringToDocument } from "../htmlStringToDocument";

import { describe, expect, it } from "vitest";
import { EXAMPLE_RICH_TEXT } from "./example";
import { createDocumentNode } from "../utils";
import * as helpers from "./helpers";

// https://www.contentful.com/developers/docs/tutorials/general/getting-started-with-rich-text-field-type/
const richTextDocument: Document = {
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [
    {
      nodeType: BLOCKS.PARAGRAPH,
      content: [
        {
          nodeType: "text",
          marks: [],
          value: "I am an odd paragraph.",
          data: {},
        },
      ],
      data: {},
    },
    {
      nodeType: BLOCKS.PARAGRAPH,
      content: [
        {
          nodeType: "text",
          marks: [],
          value: "I am even.",
          data: {},
        },
      ],
      data: {},
    },
  ],
};

const htmlString = documentToHtmlString(EXAMPLE_RICH_TEXT);

describe("Parse HTML string to Contentful Document", () => {
  it("Parse HTML string to Contentful Rich Text", () => {
    const htmlNodes = htmlStringToDocument(htmlString);
    const newHtmlString = documentToHtmlString(htmlNodes);
    expect(newHtmlString).toEqual(htmlString);
  });

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
  });

  it("converts an invalid top level text node to a paragraph node", () => {
    expect(
      htmlStringToDocument("<div>Text under top level div</div>"),
    ).toMatchObject({
      content: [
        {
          data: {},
          nodeType: BLOCKS.PARAGRAPH,
          content: [
            {
              data: {},
              marks: [],
              nodeType: "text",
              value: "Text under top level div",
            },
          ],
        },
      ],
      data: {},
      nodeType: "document",
    });
  });

  it("handles a combination of valid top level nodes and top level text nodes.", () => {
    expect(
      htmlStringToDocument(
        "Some unwrapped text prefixing a p tag." +
          "<p>Paragraph content <span>I am a text node</span></p>" +
          "Some unwrapped text suffixing a p tag",
      ),
    ).toMatchObject({
      content: [
        {
          data: {},
          nodeType: BLOCKS.PARAGRAPH,
          content: [
            {
              data: {},
              marks: [],
              nodeType: "text",
              value: "Some unwrapped text prefixing a p tag.",
            },
          ],
        },
        {
          data: {},
          nodeType: BLOCKS.PARAGRAPH,
          content: [
            {
              data: {},
              marks: [],
              nodeType: "text",
              value: "Paragraph content ",
            },
            {
              data: {},
              marks: [],
              nodeType: "text",
              value: "I am a text node",
            },
          ],
        },
        {
          data: {},
          nodeType: BLOCKS.PARAGRAPH,
          content: [
            {
              data: {},
              marks: [],
              nodeType: "text",
              value: "Some unwrapped text suffixing a p tag",
            },
          ],
        },
      ],
      data: {},
      nodeType: "document",
    });
  });
});
