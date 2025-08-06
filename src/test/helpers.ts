import {
  Block,
  BLOCKS,
  Inline,
  INLINES,
  Mark,
  Text,
} from "@contentful/rich-text-types";

import { getAsList } from "../utils.js";

export const createText = (value: string, marks?: Mark | Mark[]): Text => {
  return {
    nodeType: "text",
    value,
    marks: getAsList(marks ?? []),
    data: {},
  };
};

export const createBlock = (
  nodeType: BLOCKS,
  content: Text | Block | Inline | Array<Text | Block | Inline>,
): Block => {
  return {
    nodeType,
    content: getAsList(content),
    data: {},
  };
};

export const createInline = (
  nodeType: INLINES,
  content: Text | Inline | Array<Text | Inline>,
  data: { [key: string]: string } = {},
): Inline => {
  return {
    nodeType,
    content: getAsList(content),
    data,
  };
};
