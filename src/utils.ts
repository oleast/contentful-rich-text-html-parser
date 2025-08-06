import {
  Block,
  BLOCKS,
  Document,
  Inline,
  INLINES,
  Mark,
  MARKS,
  Node,
  NodeData,
  Text,
  TOP_LEVEL_BLOCKS,
  TopLevelBlock,
  TopLevelBlockEnum,
} from "@contentful/rich-text-types";
import { MARK_TYPES, INLINE_TYPES, BLOCK_TYPES } from "./constants.js";

export const isNotNull = <T>(value: T): value is Exclude<T, null> =>
  value !== null;

export const isWhiteSpace = (content: string): boolean => /^\s*$/.test(content);

export const getAsList = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
};

export const isBlockType = (
  nodeType: BLOCKS | MARKS | INLINES,
): nodeType is BLOCKS => BLOCK_TYPES.includes(nodeType as BLOCKS);
export const isInlineType = (
  nodeType: BLOCKS | MARKS | INLINES,
): nodeType is INLINES => INLINE_TYPES.includes(nodeType as INLINES);
export const isMarkType = (
  nodeType: BLOCKS | MARKS | INLINES,
): nodeType is MARKS => MARK_TYPES.includes(nodeType as MARKS);
export const isTopLevelBlock = (
  nodeType: BLOCKS | MARKS | INLINES,
): nodeType is TopLevelBlockEnum =>
  TOP_LEVEL_BLOCKS.includes(nodeType as TopLevelBlockEnum);
export const isNodeTypeBlock = (node: Node): node is Block =>
  isBlockType(node.nodeType as BLOCKS);
export const isNodeTypeTopLevelBlock = (node: Node): node is TopLevelBlock =>
  isTopLevelBlock(node.nodeType as BLOCKS);
export const isNodeTypeInline = (node: Node): node is Inline =>
  isInlineType(node.nodeType as INLINES);

export const isNodeTypeMark = (node: Node | Text | Mark): node is Mark => {
  return isMarkType((<Mark>node).type as MARKS);
};

export const isNodeTypeText = (node: Node | Text | Mark): node is Text => {
  if (isNodeTypeMark(node)) {
    return false;
  }
  if (node.nodeType === "text") {
    return true;
  }
  return false;
};

export const createDocumentNode = (
  content: TopLevelBlock[],
  data: NodeData = {},
): Document => ({
  nodeType: BLOCKS.DOCUMENT,
  data,
  content,
});
