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
import type { AsyncTagConverter, AsyncTextConverter } from "types";

export const convertTagToBlock = createConvertTagToBlock(true);

export const convertTagToInline = createConvertTagToInline(true);

export const convertTagToHyperlink = createConvertTagToHyperlink(true);

export const convertTagToMark = convertTagToMarkImpl as AsyncTagConverter;

export const convertTagToChildren =
  convertTagToChildrenImpl as AsyncTagConverter<Block>;

export const convertTextNodeToText =
  convertTextNodeToTextImpl as AsyncTextConverter;

export const convertTextNodeToParagraphedText =
  createConvertTextNodeToParagraphedText(true);
