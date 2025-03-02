import {
  Block,
  BLOCKS,
  Inline,
  Text,
  TopLevelBlock,
} from "@contentful/rich-text-types";
import type { PostProcessingOptions } from "./types";
import {
  isNodeTypeBlock,
  isNodeTypeInline,
  isNodeTypeText,
  isNodeTypeTopLevelBlock,
} from "./utils";

export const processConvertedNodesFromTopLevel = (
  node: Block | Inline | Text,
  options: PostProcessingOptions,
): TopLevelBlock | null => {
  if (isNodeTypeBlock(node)) {
    if (isNodeTypeTopLevelBlock(node)) {
      return node;
    }
    // Block types that can not be at the top level are: BLOCKS.DOCUMENT | BLOCKS.LIST_ITEM | BLOCKS.TABLE_ROW | BLOCKS.TABLE_CELL | BLOCKS.TABLE_HEADER_CELL
    if (node.nodeType === BLOCKS.DOCUMENT) {
      return null;
    }
    // TODO: Handle top level list items and table elements
    return node as unknown as TopLevelBlock;
  }
  if (isNodeTypeInline(node)) {
    if (options.handleTopLevelInlines === "remove") {
      return null;
    }
    if (options.handleTopLevelInlines === "wrap-paragraph") {
      return {
        nodeType: BLOCKS.PARAGRAPH,
        data: {},
        content: [node],
      };
    }
    return node as unknown as TopLevelBlock;
  }
  if (isNodeTypeText(node)) {
    if (options.handleTopLevelText === "remove") {
      return null;
    }
    if (options.handleTopLevelText === "wrap-paragraph") {
      return {
        nodeType: BLOCKS.PARAGRAPH,
        data: {},
        content: [node],
      };
    }
    return node as unknown as TopLevelBlock;
  }
  return null;
};
