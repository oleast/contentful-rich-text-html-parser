import { Document } from "@contentful/rich-text-types";
import { htmlStringToDocument as htmlStringToDocumentImpl } from "./htmlStringToDocument";
import type { Options } from "./types";

export const htmlStringToDocument = (
  htmlString: string,
  options: Options = {},
): Document => {
  return htmlStringToDocumentImpl(false, htmlString, options);
};
