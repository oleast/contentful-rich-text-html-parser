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

Skipping an element can be done by returning the result of the `next`-function. Ignoring an element AND its' children can be done by just returning an empty array.

```typescript
const skippingConverter = (node, next) => next(node);

const ignoringConverter = (node, next) => [];
```

### Unsupported tags

Skipping an element is the default behavior of any tag that is not supported. However, this can be overridden as follows:

```typescript
import {
  htmlStringToDocument,
  Options,
  TagConverter,
} from "contentful-rich-text-html-parser";
import { convertTagToChildren } from "contentful-rich-text-html-parser/converters";

const logAndConvertTagToChildren: TagConverter = (node, next) => {
  console.log(`Unsupported tag: ${node.tagName}`);
  return convertTagToChildren(node, next); // skip element
};

const options: Options = {
  convertTag: {
    [DEFAULT_TAG_CONVERTER]: defaultConverter,
  },
};

htmlStringToDocument(htmlString, options);
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

## invalid Rich Text Documents

The Contentful Rich Text format requires the `Document` adhere to a specific format.
The full ruleset can be found in the [Contentful Documentation](https://www.contentful.com/developers/docs/concepts/rich-text/#rules-of-rich-text).

By default this library will convert any HTML node by node to create a rich text document. This means that the result can be an invalid document.

Uploading an invalid document to Contentful will result in an error. The `@contentful/rich-text-types` package from Contentful includes a `validateRichTextDocument` as of version `17.0.0`.

**To mitigate invalid documents you have a few options:**

- Use the built in `parserOptions` and/or `postProcessing` options. (Currently useful for removing whitespace, and fixing top level nodes).
- Add a custom `TagConverter` og `TextConverter` that handles your case. (To handle cases like wrong child elements of `Inline` nodes, list elements, or tables).
- Change your HTML to a valid format before converting it.

### Handling invalid top level nodes

Some elements can not be at the top level of a `Document`. This includes `Text`-nodes, `Inline`-nodes, `li`-elements, and any child element of `table` (like a `tr` or `td`).

To handle cases where this appears this library includes a few utilities that process document after it has been created.

These options are:

- `options.postProcessing.handleTopLevelText: "preserve" | "remove" | "wrap-paragraph"`. Default: `"preserve"`.
- `options.postProcessing.handleTopLevelInlines: "preserve" | "remove" | "wrap-paragraph"`. Default: `"preserve"`.

Examples of usage:

```typescript
const htmlNodes = htmlStringToDocument(html, {
  postProcessing: {
    handleTopLevelText: "wrap-paragraph",
    handleTopLevelInlines: "remove",
  },
});
```

How it works:

- `"preserve"`: Keep top level nodes as they are, even if it results in an invalid `Document`.
- `"remove"`: Remove the node with all its child nodes from the document.
- `"wrap-paragraph"`: Wrap the node in a simple `paragraph`-node to make it valid.

### Handling extra whitespace nodes

A formatted HTML string might include whitespace that will be parsed and added to the document output. This can result in unwanted text nodes or an invalid document.

Whitespace can be removed by using the `handleWhitespaceNodes` option.

- `optons.parserOptions.handleWhitespaceNodes: "preserve" | "remove"`. Default: `"preserve"`.

```typescript
const htmlNodes = htmlStringToDocument(html, {
  parserOptions: {
    handleWhitespaceNodes: "preserve",
  },
});
```

How it works:

- `"preserve"`: Keep all whitespace text nodes as they are in the original html string.
- `"remove"`: Remove any text node that consist purely of whitespace from the HTML node tree. Uses the following Regex `/^\s*$/`.
