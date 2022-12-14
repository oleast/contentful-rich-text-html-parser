import { Document } from "@contentful/rich-text-types";

export const EXAMPLE_RICH_TEXT = {
  nodeType: "document",
  data: {},
  content: [
    {
      nodeType: "heading-2",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Heading 2",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "heading-3",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Heading 3",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "heading-4",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Heading 4",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "heading-5",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Heading 5",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Normal Text",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Bold Text",
          marks: [
            {
              type: "bold",
            },
          ],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Italic Text",
          marks: [
            {
              type: "italic",
            },
          ],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Underlined Text",
          marks: [
            {
              type: "underline",
            },
          ],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Bold, Italic, and Underlined Sentence",
          marks: [
            {
              type: "underline",
            },
            {
              type: "italic",
            },
            {
              type: "bold",
            },
          ],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Mixed ",
          marks: [],
          data: {},
        },
        {
          nodeType: "text",
          value: "Bold",
          marks: [
            {
              type: "bold",
            },
          ],
          data: {},
        },
        {
          nodeType: "text",
          value: ", ",
          marks: [],
          data: {},
        },
        {
          nodeType: "text",
          value: "Italic",
          marks: [
            {
              type: "italic",
            },
          ],
          data: {},
        },
        {
          nodeType: "text",
          value: ", and ",
          marks: [],
          data: {},
        },
        {
          nodeType: "text",
          value: "Underlined",
          marks: [
            {
              type: "underline",
            },
          ],
          data: {},
        },
        {
          nodeType: "text",
          value: " Sentence",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "hr",
      data: {},
      content: [],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "",
          marks: [],
          data: {},
        },
        {
          nodeType: "hyperlink",
          data: {
            uri: "https://example.com",
          },
          content: [
            {
              nodeType: "text",
              value: "Hyperlink",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "text",
          value: " to a URL",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Sentence that is partially ",
          marks: [],
          data: {},
        },
        {
          nodeType: "text",
          value: "bold",
          marks: [
            {
              type: "bold",
            },
          ],
          data: {},
        },
        {
          nodeType: "text",
          value: " and partially a ",
          marks: [],
          data: {},
        },
        {
          nodeType: "hyperlink",
          data: {
            uri: "https://example.com",
          },
          content: [
            {
              nodeType: "text",
              value: "hyperlink",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "text",
          value: "",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "Sentence th",
          marks: [],
          data: {},
        },
        {
          nodeType: "text",
          value: "at is partially ",
          marks: [
            {
              type: "bold",
            },
          ],
          data: {},
        },
        {
          nodeType: "hyperlink",
          data: {
            uri: "https://example.com",
          },
          content: [
            {
              nodeType: "text",
              value: "overl",
              marks: [
                {
                  type: "bold",
                },
              ],
              data: {},
            },
            {
              nodeType: "text",
              value: "apping bold and",
              marks: [],
              data: {},
            },
          ],
        },
        {
          nodeType: "text",
          value: " hyperlink",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "unordered-list",
      data: {},
      content: [
        {
          nodeType: "list-item",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Unordered List Item 1",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        {
          nodeType: "list-item",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Unordered List Item 2",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nodeType: "ordered-list",
      data: {},
      content: [
        {
          nodeType: "list-item",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Ordered List Item 1",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
        {
          nodeType: "list-item",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: "Ordered List Item 2",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nodeType: "blockquote",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            {
              nodeType: "text",
              value: "Blockquote",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "",
          marks: [],
          data: {},
        },
      ],
    },
    {
      nodeType: "table",
      data: {},
      content: [
        {
          nodeType: "table-row",
          data: {},
          content: [
            {
              nodeType: "table-header-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Header Cell 1",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: "table-header-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Header Cell 2",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          nodeType: "table-row",
          data: {},
          content: [
            {
              nodeType: "table-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Cell AA",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: "table-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Cell BA",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          nodeType: "table-row",
          data: {},
          content: [
            {
              nodeType: "table-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Cell AB",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: "table-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Cell BB",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          nodeType: "table-row",
          data: {},
          content: [
            {
              nodeType: "table-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Cell ",
                      marks: [],
                      data: {},
                    },
                    {
                      nodeType: "hyperlink",
                      data: {
                        uri: "https://example.com",
                      },
                      content: [
                        {
                          nodeType: "text",
                          value: "Hyperlink",
                          marks: [],
                          data: {},
                        },
                      ],
                    },
                    {
                      nodeType: "text",
                      value: "",
                      marks: [],
                      data: {},
                    },
                  ],
                },
              ],
            },
            {
              nodeType: "table-cell",
              data: {},
              content: [
                {
                  nodeType: "paragraph",
                  data: {},
                  content: [
                    {
                      nodeType: "text",
                      value: "Table Cell Marks",
                      marks: [
                        {
                          type: "bold",
                        },
                        {
                          type: "italic",
                        },
                        {
                          type: "underline",
                        },
                      ],
                      data: {},
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nodeType: "paragraph",
      data: {},
      content: [
        {
          nodeType: "text",
          value: "",
          marks: [],
          data: {},
        },
      ],
    },
  ],
} as Document;
