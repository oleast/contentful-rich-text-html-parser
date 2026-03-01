import type { Block } from "@contentful/rich-text-types";

import type { OptionsWithDefaults } from "./types.js";
import {
  createTable,
  createTableRow,
  isTableCell,
  isTableRow,
} from "./utils.js";

export const wrapOrphanedTableElements = (
  nodes: Block[],
  option: OptionsWithDefaults["postProcessing"]["handleOrphanedTableElements"],
): Block[] => {
  switch (option) {
    case "preserve":
      return nodes;
    case "remove":
      return [];
    case "wrap-table": {
      const tableContent: Block[] = [];
      let currentCellGroup: Block[] = [];

      const flushCellGroup = () => {
        if (currentCellGroup.length > 0) {
          tableContent.push(createTableRow(currentCellGroup));
          currentCellGroup = [];
        }
      };

      for (const node of nodes) {
        if (isTableRow(node)) {
          flushCellGroup();
          tableContent.push(node);
        } else if (isTableCell(node)) {
          currentCellGroup.push(node);
        }
      }

      flushCellGroup();
      return tableContent.length > 0 ? [createTable(tableContent)] : [];
    }
  }
};
