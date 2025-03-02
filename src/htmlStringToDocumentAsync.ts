import { Document } from "@contentful/rich-text-types";
import { htmlStringToDocument as htmlStringToDocumentImpl } from "./htmlStringToDocument";
import type { AsyncOptions } from "./types";

export const htmlStringToDocument = (
  htmlString: string,
  options: AsyncOptions = {},
): Promise<Document> => {
  return htmlStringToDocumentImpl(true, htmlString, options);
};
