import { Block, BLOCKS } from "@contentful/rich-text-types";

import { htmlStringToDocument, Options, TagConverter } from "../index.js";

const divToParagraphConverter: TagConverter<Block> = (node, next) => {
  return {
    nodeType: BLOCKS.PARAGRAPH,
    content: next(node),
    data: {},
  };
};

const options: Options = {
  convertTag: {
    div: divToParagraphConverter,
  },
};

const htmlString = `<div>Text in a div!</div>`;

htmlStringToDocument(htmlString, options);

// {
//   nodeType: 'document',
//   content: [
//     {
//       nodeType: 'paragraph',
//       content: [
//         {
//           nodeType: 'text',
//           value: 'Text in a div!',
//           marks: [],
//         },
//       ],
//     },
//   ],
// };
