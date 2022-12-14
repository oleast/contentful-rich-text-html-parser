import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS, Document } from "@contentful/rich-text-types";
import { htmlStringToDocument } from "../htmlStringToDocument";

import { describe, expect, it } from "vitest";
import { EXAMPLE_RICH_TEXT } from "./example";

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
});
