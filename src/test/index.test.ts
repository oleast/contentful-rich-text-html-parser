import { TagConverter } from "./../types";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import {
  Block,
  BLOCKS,
  Document,
  Inline,
  Text,
  TopLevelBlock,
} from "@contentful/rich-text-types";
import { htmlStringToDocument } from "../htmlStringToDocument";

import { describe, expect, it } from "vitest";
import { EXAMPLE_RICH_TEXT } from "./example";
import { createDocumentNode, getAsList } from "../utils";
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
  /*it("Parse string to generic HTML nodes", () => {
    const htmlNodes = parseHtml(CISION_EXAMPLE);
    expect(htmlNodes).toEqual([]);
  });*/

  /*it("Parse HTML string to Contentful Rich Text", () => {
    const htmlNodes = htmlStringToDocument(CISION_EXAMPLE);
    const newHtmlString = documentToHtmlString(htmlNodes);
    expect(newHtmlString).toEqual(CISION_EXAMPLE);
  });*/

  it("Parse HTML string to Contentful Rich Text", () => {
    const htmlNodes = htmlStringToDocument(htmlString);
    const newHtmlString = documentToHtmlString(htmlNodes);
    expect(newHtmlString).toEqual(htmlString);
  });

  it("Handles a simple convert option from 'div' to 'paragraph'", () => {
    const divToParagraphConverter: TagConverter = (node, next) => {
      const paragraph: Block = {
        nodeType: BLOCKS.PARAGRAPH,
        content: getAsList(next(node)) as Array<Block | Inline | Text>,
        data: {},
      };
      return paragraph;
    };
    const matchText = "This is text in a div";
    const htmlNodes = htmlStringToDocument(`<div>${matchText}</div>`, {
      convertTag: {
        div: divToParagraphConverter,
      },
    });

    const matchNode = helpers.createBlock(
      BLOCKS.PARAGRAPH,
      helpers.createText(matchText)
    );

    expect(htmlNodes).toMatchObject(
      createDocumentNode([matchNode as TopLevelBlock])
    );
  });
});
