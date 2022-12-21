# Contentful Rich Text HTML Parser

_Convert just about any HTML document to the Contentful Rich Text format!_

This library aims to make it easy to convert any HTML to the Contentful Rich Text format. It will convert relevant HTML elements without any configuration and can be configured to support different styles of rich text formats.

## Installation

```bash
npm install contentful-rich-text-html-parser
```

## Usage

```typescript
import { htmlStringToDocument } from "contentful-rich-text-html-parser";

const htmlString = `<p>Hello world!</p>`;

htmlStringToDocument(htmlString);

// {
//   nodeType: 'document',
//   content: [
//     {
//       nodeType: 'paragraph',
//       content: [
//         {
//           nodeType: 'text',
//           value: 'Hello world!',
//           marks: [],
//         },
//       ],
//     },
//   ],
// };
```

## HTML tag and rich text node support

The default configuration supports the following list of HTML tags which by default map to the corresponding rich text node type.

- `"h1" => BLOCKS.HEADING_1`
- `"h2" => BLOCKS.HEADING_2`
- `"h3" => BLOCKS.HEADING_3`
- `"h4" => BLOCKS.HEADING_4`
- `"h5" => BLOCKS.HEADING_5`
- `"h6" => BLOCKS.HEADING_6`
- `"hr" => BLOCKS.HR`
- `"li" => BLOCKS.LIST_ITEM`
- `"ol" => BLOCKS.OL_LIST`
- `"p" => BLOCKS.PARAGRAPH`
- `"blockquote" => BLOCKS.QUOTE`
- `"table" => BLOCKS.TABLE`
- `"td" => BLOCKS.TABLE_CELL`
- `"th" => BLOCKS.TABLE_HEADER_CELL`
- `"tr" => BLOCKS.TABLE_ROW`
- `"ul" => BLOCKS.UL_LIST`
- `"b" => MARKS.BOLD`
- `"strong" => MARKS.BOLD`
- `"pre" => MARKS.CODE`
- `"i" => MARKS.ITALIC`
- `"sub" => MARKS.SUBSCRIPT`
- `"sup" => MARKS.SUPERSCRIPT`
- `"u" => MARKS.UNDERLINE`
- `"a" => INLINES.HYPERLINK`

## Adding support for other HTML elements or node types

This library can be configured to support custom HTML structures to fit your needs by using a custom `options`-object.

```typescript
import {
  htmlStringToDocument,
  Options,
  TagConverter,
} from "contentful-rich-text-html-parser";

const myConverter: TagConverter = (node, next) => {
  // My converter logic here...
};

const options: Options = {
  convertTag: {
    "any-html-tag-name-here": myConverter,
  },
};

htmlStringToDocument(htmlString, options);
```

### Writing custom converter functions

Custom converters can be written as functions taking two arguments:

- The `node`-object which represents the current HTML element.
- The `next`-function which continues converting the child nodes of the HTML element.

The converter function should return a Contentful rich text node or a list of nodes.

```typescript
import { BLOCKS } from "@contentful/rich-text-types";

const converter = (node, next) => ({
  nodeType: BLOCKS.PARAGRAPH,
  content: next(node),
  data: {},
});
```

Adding marks can be done by passing them to the `next`-function. Marks can be added as either a single mark or an array of marks.

```typescript
import { BLOCKS } from "@contentful/rich-text-types";

const converter = (node, next) => ({
  nodeType: BLOCKS.PARAGRAPH,
  content: next(node, { type: "bold" }),
  data: {},
});
```

Skipping an element can be done by returning the result of the `next`-function. Ignoring an element AND its' children can be done by just returning an empty array. **Skipping is the default behavior of any tag that is not supported.**

```typescript
const skippingConverter = (node, next) => next(node);

const ignoringConverter = (node, next) => [];
```

### Example: Change all "div" elements to "p" elements

```typescript
import { Block, BLOCKS } from "@contentful/rich-text-types";
import {
  htmlStringToDocument,
  Options,
  TagConverter,
} from "contentful-rich-text-html-parser";

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
```

### Example: Use a CSS class name to add a mark

```typescript
import { Inline, Mark } from "@contentful/rich-text-types";
import {
  htmlStringToDocument,
  Options,
  TagConverter,
} from "contentful-rich-text-html-parser";

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
```

## Assets, images, videos, other media, and files

By default, all `img`, `video`, `source`, and other media elements are ignored by the parser.

It is however possible to add a `convertTag` option to configure support for these elements yourself!

**It is however important to note that you would have to find your own way of converting these images to valid assets that could be uploaded to Contentful if that is your goal"**

### Example: Custom "img" converter

```typescript
import { Block, BLOCKS } from "@contentful/rich-text-types";
import {
  htmlStringToDocument,
  Options,
  TagConverter,
} from "contentful-rich-text-html-parser";

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
```
