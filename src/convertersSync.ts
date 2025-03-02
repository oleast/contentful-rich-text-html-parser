import { Block } from "@contentful/rich-text-types";
import {
  createConvertTagToBlock,
  convertTagToChildren as convertTagToChildrenImpl,
  createConvertTagToHyperlink,
  createConvertTagToInline,
  convertTagToMark as convertTagToMarkImpl,
  convertTextNodeToText as convertTextNodeToTextImpl,
  createConvertTextNodeToParagraphedText,
} from "./converters";
import type { TagConverter, TextConverter } from "./types";

export const convertTagToBlock = createConvertTagToBlock(false);

export const convertTagToInline = createConvertTagToInline(false);

export const convertTagToHyperlink = createConvertTagToHyperlink(false);

export const convertTagToMark = convertTagToMarkImpl as TagConverter;

export const convertTagToChildren =
  convertTagToChildrenImpl as TagConverter<Block>;

export const convertTextNodeToText = convertTextNodeToTextImpl as TextConverter;

export const convertTextNodeToParagraphedText =
  createConvertTextNodeToParagraphedText(false);
