import type { Block } from "@contentful/rich-text-types";
import { BLOCKS } from "@contentful/rich-text-types";

import type { OptionsWithDefaults } from "./types.js";
import { createList } from "./utils.js";

export const wrapOrphanedListItems = (
  nodes: Block[],
  option: OptionsWithDefaults["postProcessing"]["handleOrphanedListItems"],
): Block[] => {
  switch (option) {
    case "preserve":
      return nodes;
    case "remove":
      return [];
    case "wrap-ul":
      return [createList(nodes, BLOCKS.UL_LIST)];
    case "wrap-ol":
      return [createList(nodes, BLOCKS.OL_LIST)];
  }
};
