import { Block, BLOCKS } from "@contentful/rich-text-types";

import { htmlStringToDocument, Options, TagConverter } from "../index.js";

const imgToEmbeddedAssetConverter: TagConverter<Block> = (node, next) => {
  return {
    nodeType: BLOCKS.EMBEDDED_ASSET,
    content: next(node),
    data: {
      src: node.attrs.src,
    },
  };
};

const options: Options = {
  convertTag: {
    img: imgToEmbeddedAssetConverter,
  },
};

const htmlString = `<img src="https://path-to-image" />`;

htmlStringToDocument(htmlString, options);

// {
//   nodeType: 'document',
//   content: [
//     {
//       nodeType: 'embedded-asset-block',
//       content: [],
//       data: { src: 'https://path-to-image' }
//     },
//   ],
// };
