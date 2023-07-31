import {
  convertTagToMark,
  convertTagToBlock,
  convertTagToHyperlink,
  convertTextNodeToText,
  convertTagToChildren,
} from "./converters";
import { parseHtml } from "./parseHtml";
import {
  TopLevelBlock,
  Document,
  Mark,
  Text,
  Inline,
  Block,
} from "@contentful/rich-text-types";
import type {
  HTMLNode,
  HTMLTagName,
  Next,
  Options,
  OptionsWithDefaults,
  TagConverter,
} from "./types";
import { createDocumentNode, getAsList } from "./utils";

const DEFAULT_TAG_CONVERTERS: Partial<
  Record<HTMLTagName, TagConverter<Block | Inline | Text>>
> = {
  h1: convertTagToBlock,
  h2: convertTagToBlock,
  h3: convertTagToBlock,
  h4: convertTagToBlock,
  h5: convertTagToBlock,
  h6: convertTagToBlock,
  hr: convertTagToBlock,
  li: convertTagToBlock,
  ol: convertTagToBlock,
  p: convertTagToBlock,
  blockquote: convertTagToBlock,
  table: convertTagToBlock,
  td: convertTagToBlock,
  th: convertTagToBlock,
  tr: convertTagToBlock,
  ul: convertTagToBlock,
  b: convertTagToMark,
  strong: convertTagToMark,
  pre: convertTagToMark,
  i: convertTagToMark,
  sub: convertTagToMark,
  sup: convertTagToMark,
  u: convertTagToMark,
  a: convertTagToHyperlink,
};

const mapHtmlNodeToRichTextNode = (
  node: HTMLNode,
  marks: Mark[],
  options: OptionsWithDefaults,
) => {
  const { convertText, convertTag } = options;
  if (node.type === "text") {
    return convertText(node, marks);
  }

  const mapChildren: Next = (node, mark) => {
    const newMarks = mark ? getAsList(mark) : [];
    const allMarks = newMarks.concat(marks);
    if (node.type === "element") {
      return node.children.flatMap((child) =>
        mapHtmlNodeToRichTextNode(child, allMarks, options),
      );
    }
    return getAsList(mapHtmlNodeToRichTextNode(node, allMarks, options));
  };

  const next: Next = (node, marks) => {
    return mapChildren(node, marks);
  };

  const tagConverter = convertTag?.[node.tagName] ?? convertTagToChildren;
  const convertedNode = tagConverter(node, next);
  return convertedNode;
};

export const htmlStringToDocument = (
  htmlString: string,
  options: Options = {},
): Document => {
  const optionsWithDefaults: OptionsWithDefaults = {
    convertTag: {
      ...DEFAULT_TAG_CONVERTERS,
      ...options.convertTag,
    },
    convertText: options.convertText ?? convertTextNodeToText,
  };
  const parsedHtml = parseHtml(htmlString);
  const richTextNodes = parsedHtml.flatMap((node) =>
    mapHtmlNodeToRichTextNode(node, [], optionsWithDefaults),
  );
  return createDocumentNode(richTextNodes as TopLevelBlock[]);
};
