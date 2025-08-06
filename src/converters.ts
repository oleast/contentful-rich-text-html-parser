import { isBlockType, isInlineType, isMarkType } from "./utils.js";
import type { HTMLTagName, TagConverter, TextConverter } from "./types.js";
import {
  Block,
  BLOCKS,
  Inline,
  INLINES,
  Mark,
  MARKS,
} from "@contentful/rich-text-types";

const DEFAULT_NODE_TYPE_FOR_HTML_TAG: Partial<
  Record<HTMLTagName, BLOCKS | MARKS | INLINES>
> = {
  h1: BLOCKS.HEADING_1,
  h2: BLOCKS.HEADING_2,
  h3: BLOCKS.HEADING_3,
  h4: BLOCKS.HEADING_4,
  h5: BLOCKS.HEADING_5,
  h6: BLOCKS.HEADING_6,
  hr: BLOCKS.HR,
  li: BLOCKS.LIST_ITEM,
  ol: BLOCKS.OL_LIST,
  p: BLOCKS.PARAGRAPH,
  blockquote: BLOCKS.QUOTE,
  table: BLOCKS.TABLE,
  td: BLOCKS.TABLE_CELL,
  th: BLOCKS.TABLE_HEADER_CELL,
  tr: BLOCKS.TABLE_ROW,
  ul: BLOCKS.UL_LIST,
  b: MARKS.BOLD,
  strong: MARKS.BOLD,
  pre: MARKS.CODE,
  i: MARKS.ITALIC,
  em: MARKS.ITALIC,
  sub: MARKS.SUBSCRIPT,
  sup: MARKS.SUPERSCRIPT,
  u: MARKS.UNDERLINE,
  a: INLINES.HYPERLINK,
  img: BLOCKS.EMBEDDED_ASSET,
  video: BLOCKS.EMBEDDED_ASSET,
  audio: BLOCKS.EMBEDDED_ASSET,
};

const getDefaultNodeTypeForHtmlTag = (
  tagName: HTMLTagName,
): BLOCKS | MARKS | INLINES | undefined => {
  return DEFAULT_NODE_TYPE_FOR_HTML_TAG[tagName];
};

export const convertTagToBlock: TagConverter<Block> = (node, next) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isBlockType(nodeType)) {
    return [];
  }
  return {
    nodeType,
    content: next(node),
    data: {},
  };
};

export const convertTagToInline: TagConverter<Inline> = (node, next) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isInlineType(nodeType)) {
    return [];
  }
  return {
    nodeType,
    content: next(node),
    data: {},
  };
};

export const convertTagToHyperlink: TagConverter<Inline> = (node, next) => {
  return {
    nodeType: INLINES.HYPERLINK,
    content: next(node),
    data: {
      uri: node.attrs.href,
    },
  };
};

export const convertTagToMark: TagConverter = (node, next) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isMarkType(nodeType)) {
    return [];
  }
  const mark: Mark = {
    type: nodeType,
  };
  return next(node, mark);
};

export const convertTagToChildren: TagConverter<Block> = (node, next) => {
  return next(node);
};

export const convertTextNodeToText: TextConverter = (node, marks) => {
  return {
    nodeType: "text",
    marks,
    value: node.value,
    data: {},
  };
};

export const convertTextNodeToParagraphedText: TagConverter<Block> = (
  node,
  next,
) => {
  return {
    nodeType: BLOCKS.PARAGRAPH,
    data: {},
    content: next(node),
  };
};
