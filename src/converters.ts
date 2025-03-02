import { isBlockType, isInlineType, isMarkType } from "./utils";
import type {
  AnyContentfulNode,
  AsyncNext,
  AsyncTagConverter,
  AsyncTextConverter,
  HTMLElementNode,
  HTMLTagName,
  Next,
  TagConverter,
  TextConverter,
} from "./types";
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

export function createConvertTagToBlock(async: false): TagConverter<Block>;
export function createConvertTagToBlock(async: true): AsyncTagConverter<Block>;
export function createConvertTagToBlock(
  async: boolean,
): TagConverter<Block> | AsyncTagConverter<Block> {
  return (node: HTMLElementNode, next: Next<Block> | AsyncNext<Block>) => {
    const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
    if (!nodeType || !isBlockType(nodeType)) {
      return [];
    }
    return isSync(async, next)
      ? {
          nodeType,
          content: next(node),
          data: {},
        }
      : Promise.resolve(next(node)).then((content) => ({
          nodeType,
          content,
          data: {},
        }));
  };
}

export function createConvertTagToInline(async: false): TagConverter<Inline>;
export function createConvertTagToInline(
  async: true,
): AsyncTagConverter<Inline>;
export function createConvertTagToInline(
  async: boolean,
): TagConverter<Inline> | AsyncTagConverter<Inline> {
  return (node: HTMLElementNode, next: Next<Inline> | AsyncNext<Inline>) => {
    const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
    if (!nodeType || !isInlineType(nodeType)) {
      return [];
    }
    return isSync(async, next)
      ? {
          nodeType,
          content: (next as Next<Inline>)(node),
          data: {},
        }
      : Promise.resolve(next(node)).then((content) => ({
          nodeType,
          content,
          data: {},
        }));
  };
}

export function createConvertTagToHyperlink(async: false): TagConverter<Inline>;
export function createConvertTagToHyperlink(
  async: true,
): AsyncTagConverter<Inline>;
export function createConvertTagToHyperlink(
  async: boolean,
): TagConverter<Inline> | AsyncTagConverter<Inline> {
  return (node: HTMLElementNode, next: Next<Inline> | AsyncNext<Inline>) => {
    return isSync(async, next)
      ? {
          nodeType: INLINES.HYPERLINK,
          content: next(node),
          data: {
            uri: node.attrs.href,
          },
        }
      : Promise.resolve(next(node)).then((content) => ({
          nodeType: INLINES.HYPERLINK,
          content,
          data: {
            uri: node.attrs.href,
          },
        }));
  };
}

export const convertTagToMark: TagConverter | AsyncTagConverter = (
  node: HTMLElementNode,
  next: Next | AsyncNext,
) => {
  const nodeType = getDefaultNodeTypeForHtmlTag(node.tagName);
  if (!nodeType || !isMarkType(nodeType)) {
    return [];
  }
  const mark: Mark = {
    type: nodeType,
  };
  return next(node, mark);
};

export const convertTagToChildren:
  | TagConverter<Block>
  | AsyncTagConverter<Block> = (
  node: HTMLElementNode,
  next: Next<Block> | AsyncNext<Block>,
) => {
  return next(node);
};

export const convertTextNodeToText: TextConverter | AsyncTextConverter = (
  node,
  marks,
) => {
  return {
    nodeType: "text",
    marks,
    value: node.value,
    data: {},
  };
};

export function createConvertTextNodeToParagraphedText(
  async: false,
): TagConverter<Block>;
export function createConvertTextNodeToParagraphedText(
  async: true,
): AsyncTagConverter<Block>;
export function createConvertTextNodeToParagraphedText(
  async: boolean,
): TagConverter<Block> | AsyncTagConverter<Block> {
  return (node: HTMLElementNode, next: Next<Block> | AsyncNext<Block>) => {
    return isSync(async, next)
      ? {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: next(node),
        }
      : Promise.resolve(next(node)).then((content) => ({
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content,
        }));
  };
}

function isSync<T extends AnyContentfulNode>(
  async: boolean,
  next: Next<T> | AsyncNext<T>,
): next is Next<T> {
  return !async;
}
