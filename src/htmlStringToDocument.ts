import {
  convertTagToMark,
  convertTagToBlock,
  convertTagToHyperlink,
} from "./converters";
import { parseHtml } from "./parseHtml";
import {
  BLOCKS,
  NodeData,
  TopLevelBlock,
  Document,
  Text,
} from "@contentful/rich-text-types";
import type { HTMLTagName, Next, TagConverter } from "./types";

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

const createDocumentNode = (
  content: TopLevelBlock[],
  data: NodeData = {}
): Document => ({
  nodeType: BLOCKS.DOCUMENT,
  data,
  content,
});

const mapHtmlNodeToRichTextNode: Next = (node) => {
  if (node.type === "text") {
    const textNode: Text = {
      nodeType: "text",
      marks: [],
      value: node.value,
      data: {},
    };
    return [textNode];
  }

  const next: Next = (node) => {
    if (node.type === "element") {
      return node.children.flatMap((child) => mapHtmlNodeToRichTextNode(child));
    }
    return mapHtmlNodeToRichTextNode(node);
  };

  const converter = DEFAULT_TAG_CONVERTERS[node.tagName] ?? next;
  const convertedNode = converter(node, next);
  return convertedNode;
};

export const htmlStringToDocument = (htmlString: string): Document => {
  const parsedHtml = parseHtml(htmlString);
  const richTextNodes = parsedHtml.flatMap((node) =>
    mapHtmlNodeToRichTextNode(node)
  );
  return createDocumentNode(richTextNodes as TopLevelBlock[]);
};
