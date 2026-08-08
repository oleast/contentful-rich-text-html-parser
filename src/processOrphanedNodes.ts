import { Block, BLOCKS, Inline, Text } from "@contentful/rich-text-types";

import type { NodeGroup, OptionsWithDefaults } from "./types.js";
import {
  isListContainer,
  isListItem,
  isNodeTypeBlock,
  isTableCell,
  isTableContainer,
  isTableRow,
  isTableRowContainer,
} from "./utils.js";
import { wrapOrphanedListItems } from "./wrapOrphanedListItems.js";
import { wrapOrphanedTableElements } from "./wrapOrphanedTableElements.js";

// Cells and rows share the "orphaned-table-elements" group type because they
// participate in the same table-wrapping structure: wrapOrphanedTableElements
// re-discriminates between them, grouping consecutive cells into TABLE_ROWs
// alongside any existing TABLE_ROW nodes before wrapping everything in a TABLE.
const groupConsecutiveOrphans = (
  nodes: Array<Block | Inline | Text>,
): NodeGroup[] => {
  const groups: NodeGroup[] = [];

  for (const node of nodes) {
    if (isListItem(node)) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === "orphaned-list-items") {
        lastGroup.nodes.push(node);
      } else {
        groups.push({ type: "orphaned-list-items", nodes: [node] });
      }
    } else if (isTableRow(node) || isTableCell(node)) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === "orphaned-table-elements") {
        lastGroup.nodes.push(node);
      } else {
        groups.push({ type: "orphaned-table-elements", nodes: [node] });
      }
    } else {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.type === "other") {
        lastGroup.nodes.push(node);
      } else {
        groups.push({ type: "other", nodes: [node] });
      }
    }
  }

  return groups;
};

export const processOrphanedNodes = (
  nodes: Array<Block | Inline | Text>,
  options: OptionsWithDefaults,
  parentNodeType?: BLOCKS,
): Array<Block | Inline | Text> => {
  // 1. Recursively process children of each node (bottom-up)
  const processedNodes = nodes.map((node) => {
    if (isNodeTypeBlock(node)) {
      const processedContent = processOrphanedNodes(
        node.content,
        options,
        node.nodeType,
      );
      return {
        ...node,
        content: processedContent,
      } as Block;
    }
    return node;
  });

  // 2. Skip orphan wrapping if current context is a valid parent
  if (parentNodeType && isListContainer(parentNodeType)) {
    return processedNodes;
  }
  if (parentNodeType && isTableContainer(parentNodeType)) {
    return processedNodes;
  }
  if (parentNodeType && isTableRowContainer(parentNodeType)) {
    return processedNodes;
  }

  // 3. Group consecutive orphaned nodes
  const groups = groupConsecutiveOrphans(processedNodes);

  // 4. Process each group according to its type and options
  return groups.flatMap((group) => {
    if (group.type === "orphaned-list-items") {
      return wrapOrphanedListItems(
        group.nodes,
        options.postProcessing.handleOrphanedListItems,
      );
    }
    if (group.type === "orphaned-table-elements") {
      return wrapOrphanedTableElements(
        group.nodes,
        options.postProcessing.handleOrphanedTableElements,
      );
    }
    return group.nodes;
  });
};
