import {
  getAsList,
  isBlockType,
  isInlineType,
  isMarkType,
  isNodeTypeText,
} from "./utils";
import type { HTMLTagName, TagConverter } from "./types";
import {
  Block,
  BLOCKS,
  Inline,
  INLINES,
  Mark,
  MARKS,
  Text,
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
  sub: MARKS.SUBSCRIPT,
  sup: MARKS.SUPERSCRIPT,
  u: MARKS.UNDERLINE,
  a: INLINES.HYPERLINK,
  img: BLOCKS.EMBEDDED_ASSET,
  video: BLOCKS.EMBEDDED_ASSET,
  audio: BLOCKS.EMBEDDED_ASSET,
};

const getDefaultNodeTypeForHtmlTag = (
  tagName: HTMLTagName
): BLOCKS | MARKS | INLINES | undefined => {
  return DEFAULT_NODE_TYPE_FOR_HTML_TAG[tagName];
};

export const convertTagToBlock: TagConverter = (node, next) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isBlockType(nodeType)) {
    return [];
  }
  const block: Block = {
    nodeType,
    content: next(node) as Array<Block | Inline | Text>,
    data: {},
  };
  return block;
};

export const convertTagToInline: TagConverter = (node, next) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isInlineType(nodeType)) {
    return [];
  }
  const inline: Inline = {
    nodeType,
    content: next(node) as Array<Inline | Text>,
    data: {},
  };
  return inline;
};

export const convertTagToHyperlink: TagConverter = (node, next) => {
  const inline: Inline = {
    nodeType: INLINES.HYPERLINK,
    content: next(node) as Array<Inline | Text>,
    data: {
      uri: node.attrs.href,
    },
  };
  return inline;
};

export const convertTagToMark: TagConverter = (node, next) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isMarkType(nodeType)) {
    return [];
  }
  const mark: Mark = {
    type: nodeType,
  };
  const children = next(node);
  const childrenAsList = getAsList(children);
  return childrenAsList.map((child) => {
    if (isNodeTypeText(child)) {
      child.marks = [...child.marks, mark];
    }
    return child;
  });
};
