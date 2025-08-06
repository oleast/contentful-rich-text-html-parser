import { Inline, Mark } from "@contentful/rich-text-types";

import { htmlStringToDocument, Options, TagConverter } from "../index.js";

const boldMark: Mark = {
  type: "bold",
};

const spanWithMarksConverter: TagConverter<Inline> = (node, next) => {
  const isBold = node.attrs.class === "bold";

  // Ignore the "span" element while adding marks to all text element children.
  return next(node, isBold ? boldMark : undefined);
};

const options: Options = {
  convertTag: {
    span: spanWithMarksConverter,
  },
};

const htmlString = `<p><span class="bold">Bold text in a span!</span></p>`;

htmlStringToDocument(htmlString, options);

// {
//   nodeType: 'document',
//   content: [
//     {
//       nodeType: 'paragraph',
//       content: [
//         {
//           nodeType: 'text',
//           value: 'Bold text in a span!',
//           marks: [{ type: 'bold' }],
//         },
//       ],
//     },
//   ],
// };
