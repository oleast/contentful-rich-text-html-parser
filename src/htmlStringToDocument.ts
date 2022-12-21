import {
  convertTagToMark,
  convertTagToBlock,
  convertTagToHyperlink,
  convertTextNodeToText,
  convertTagToChildren,
} from "./converters";
import { parseHtml } from "./parseHtml";
import { TopLevelBlock, Document } from "@contentful/rich-text-types";
import type {
  HTMLNode,
  HTMLTagName,
  Next,
  Options,
  OptionsWithDefaults,
  TagConverter,
} from "./types";
import { createDocumentNode } from "./utils";

const DEFAULT_TAG_CONVERTERS: Partial<Record<HTMLTagName, TagConverter>> = {
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
  options: OptionsWithDefaults
) => {
  const { convertText, convertTag } = options;
  if (node.type === "text") {
    return convertText(node);
  }

  const mapChildren = (node: HTMLNode) => {
    if (node.type === "element") {
      return node.children.flatMap((child) =>
        mapHtmlNodeToRichTextNode(child, options)
      );
    }
    return mapHtmlNodeToRichTextNode(node, options);
  };

  const next: Next = (node) => {
    return mapChildren(node);
  };

  const tagConverter = convertTag?.[node.tagName] ?? convertTagToChildren;
  const convertedNode = tagConverter(node, next);
  return convertedNode;
};

export const htmlStringToDocument = (
  htmlString: string,
  options: Options = {}
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
    mapHtmlNodeToRichTextNode(node, optionsWithDefaults)
  );
  return createDocumentNode(richTextNodes as TopLevelBlock[]);
};
