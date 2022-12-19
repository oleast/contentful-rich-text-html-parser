import {
  convertTagToMark,
  convertTagToBlock,
  convertTagToHyperlink,
  convertTextNodeToText,
} from "./converters";
import { parseHtml } from "./parseHtml";
import { TopLevelBlock, Document } from "@contentful/rich-text-types";
import type {
  HTMLNode,
  HTMLTagName,
  Next,
  Options,
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

const mapHtmlNodeToRichTextNode = (node: HTMLNode, options: Options) => {
  if (node.type === "text") {
    const textConverter = options.convertText ?? convertTextNodeToText;
    return textConverter(node);
  }

  const next: Next = (node) => {
    if (node.type === "element") {
      return node.children.flatMap((child) =>
        mapHtmlNodeToRichTextNode(child, options)
      );
    }
    return mapHtmlNodeToRichTextNode(node, options);
  };

  const tagConverter =
    options?.convertTag?.[node.tagName] ??
    DEFAULT_TAG_CONVERTERS[node.tagName] ??
    next;
  const convertedNode = tagConverter(node, next);
  return convertedNode;
};

export const htmlStringToDocument = (
  htmlString: string,
  options: Options = {}
): Document => {
  const parsedHtml = parseHtml(htmlString);
  const richTextNodes = parsedHtml.flatMap((node) =>
    mapHtmlNodeToRichTextNode(node, options)
  );
  return createDocumentNode(richTextNodes as TopLevelBlock[]);
};
