import {
  convertTagToMark,
  convertTagToBlock,
  convertTagToHyperlink,
  convertTextNodeToText,
  convertTagToChildren,
} from "./converters";
import { parseHtml, ParserOptions } from "./parseHtml";
import {
  Document,
  Mark,
  Text,
  Inline,
  Block,
} from "@contentful/rich-text-types";
import type {
  HTMLNode,
  HTMLTagName,
  Next,
  Options,
  OptionsWithDefaults,
  TagConverter,
} from "./types";
import { createDocumentNode, getAsList, isNotNull } from "./utils";
import { processConvertedNodesFromTopLevel } from "./processConvertedNodesFromTopLevel";

const DEFAULT_TAG_CONVERTERS: Partial<
  Record<HTMLTagName, TagConverter<Block | Inline | Text>>
> = {
  h1: convertTagToBlock,
  h2: convertTagToBlock,
  h3: convertTagToBlock,
  h4: convertTagToBlock,
  h5: convertTagToBlock,
  h6: convertTagToBlock,
  hr: convertTagToBlock,
  li: convertTagToBlock,
  ol: convertTagToBlock,
  p: convertTagToBlock,
  blockquote: convertTagToBlock,
  table: convertTagToBlock,
  td: convertTagToBlock,
  th: convertTagToBlock,
  tr: convertTagToBlock,
  ul: convertTagToBlock,
  b: convertTagToMark,
  strong: convertTagToMark,
  pre: convertTagToMark,
  i: convertTagToMark,
  sub: convertTagToMark,
  sup: convertTagToMark,
  u: convertTagToMark,
  a: convertTagToHyperlink,
};

const mapHtmlNodeToRichTextNode = (
  node: HTMLNode,
  marks: Mark[],
  options: OptionsWithDefaults,
) => {
  const { convertText, convertTag, defaultTagConverter } = options;

  const mapChildren: Next = (node, mark) => {
    const newMarks = mark ? getAsList(mark) : [];
    const allMarks = newMarks.concat(marks);
    if (node.type === "element") {
      return node.children.flatMap((child) =>
        mapHtmlNodeToRichTextNode(child, allMarks, options),
      );
    }
    return getAsList(mapHtmlNodeToRichTextNode(node, allMarks, options));
  };
  const next = mapChildren;

  if (node.type === "text") {
    return convertText(node, marks);
  }

  const tagConverter = convertTag[node.tagName] ?? defaultTagConverter;
  const convertedNode = tagConverter(node, next);
  return convertedNode;
};

export const htmlStringToDocument = (
  htmlString: string,
  options: Options = {},
): Document => {
  const optionsWithDefaults: OptionsWithDefaults = {
    convertTag: {
      ...DEFAULT_TAG_CONVERTERS,
      ...options.convertTag,
    },
    defaultTagConverter: options.defaultTagConverter ?? convertTagToChildren,
    convertText: options.convertText ?? convertTextNodeToText,
    parserOptions: {
      handleWhitespaceNodes:
        options?.parserOptions?.handleWhitespaceNodes ?? "preserve",
    },
    postProcessing: {
      handleTopLevelInlines:
        options?.postProcessing?.handleTopLevelInlines ?? "preserve",
      handleTopLevelText:
        options?.postProcessing?.handleTopLevelText ?? "preserve",
    },
  };

  const parserOptions: ParserOptions = {
    ignoreWhiteSpace:
      optionsWithDefaults.parserOptions.handleWhitespaceNodes == "remove",
  };

  const parsedHtml = parseHtml(htmlString, parserOptions);
  const richTextNodes = parsedHtml.flatMap((node) =>
    mapHtmlNodeToRichTextNode(node, [], optionsWithDefaults),
  );
  const processedRichTextNodes = richTextNodes
    .map((node) => processConvertedNodesFromTopLevel(node, optionsWithDefaults))
    .filter(isNotNull);

  return createDocumentNode(processedRichTextNodes);
};
