import {
  convertTagToMark as convertTagToMarkAsync,
  convertTagToBlock as convertTagToBlockAsync,
  convertTagToHyperlink as convertTagToHyperlinkAsync,
  convertTextNodeToText as convertTextNodeToTextAsync,
  convertTagToChildren as convertTagToChildrenAsync,
} from "./convertersAsync";
import {
  convertTagToMark,
  convertTagToBlock,
  convertTagToHyperlink,
  convertTextNodeToText,
  convertTagToChildren,
} from "./convertersSync";
import { parseHtml, ParserOptions } from "./parseHtml";
import {
  Document,
  Mark,
  Text,
  Inline,
  Block,
} from "@contentful/rich-text-types";
import type {
  AnyContentfulNode,
  AsyncNext,
  AsyncOptions,
  AsyncOptionsWithDefaults,
  AsyncTagConverter,
  ConverterResult,
  HTMLNode,
  HTMLTagName,
  MaybePromise,
  Next,
  Options,
  OptionsWithDefaults,
  TagConverter,
} from "./types";
import { createDocumentNode, getAsList, isNotNull } from "./utils";
import { processConvertedNodesFromTopLevel } from "./processConvertedNodesFromTopLevel";

const DEFAULT_TAG_CONVERTERS: Partial<
  Record<
    HTMLTagName,
    [
      TagConverter<Block | Inline | Text>,
      AsyncTagConverter<Block | Inline | Text>,
    ]
  >
> = {
  h1: [convertTagToBlock, convertTagToBlockAsync],
  h2: [convertTagToBlock, convertTagToBlockAsync],
  h3: [convertTagToBlock, convertTagToBlockAsync],
  h4: [convertTagToBlock, convertTagToBlockAsync],
  h5: [convertTagToBlock, convertTagToBlockAsync],
  h6: [convertTagToBlock, convertTagToBlockAsync],
  hr: [convertTagToBlock, convertTagToBlockAsync],
  li: [convertTagToBlock, convertTagToBlockAsync],
  ol: [convertTagToBlock, convertTagToBlockAsync],
  p: [convertTagToBlock, convertTagToBlockAsync],
  blockquote: [convertTagToBlock, convertTagToBlockAsync],
  table: [convertTagToBlock, convertTagToBlockAsync],
  td: [convertTagToBlock, convertTagToBlockAsync],
  th: [convertTagToBlock, convertTagToBlockAsync],
  tr: [convertTagToBlock, convertTagToBlockAsync],
  ul: [convertTagToBlock, convertTagToBlockAsync],
  b: [convertTagToMark, convertTagToMarkAsync],
  strong: [convertTagToMark, convertTagToMarkAsync],
  pre: [convertTagToMark, convertTagToMarkAsync],
  i: [convertTagToMark, convertTagToMarkAsync],
  sub: [convertTagToMark, convertTagToMarkAsync],
  sup: [convertTagToMark, convertTagToMarkAsync],
  u: [convertTagToMark, convertTagToMarkAsync],
  a: [convertTagToHyperlink, convertTagToHyperlinkAsync],
};
const DEFAULT_SYNC_TAG_CONVERTERS = Object.fromEntries(
  Object.entries(DEFAULT_TAG_CONVERTERS).map(([tagName, [tagConverter]]) => [
    tagName,
    tagConverter,
  ]),
);
const DEFAULT_ASYNC_TAG_CONVERTERS = Object.fromEntries(
  Object.entries(DEFAULT_TAG_CONVERTERS).map(([tagName, [_, tagConverter]]) => [
    tagName,
    tagConverter,
  ]),
);

function mapHtmlNodeToRichTextNode(
  async: false,
  node: HTMLNode,
  marks: Mark[],
  options: OptionsWithDefaults,
): ConverterResult<AnyContentfulNode>;
function mapHtmlNodeToRichTextNode(
  async: true,
  node: HTMLNode,
  marks: Mark[],
  options: AsyncOptionsWithDefaults,
): Promise<ConverterResult<AnyContentfulNode>>;
function mapHtmlNodeToRichTextNode(
  async: boolean,
  node: HTMLNode,
  marks: Mark[],
  options: OptionsWithDefaults | AsyncOptionsWithDefaults,
) {
  const { convertText, convertTag, defaultTagConverter } = options;

  const mapChildren: AsyncNext | Next = (node, mark) => {
    const newMarks = mark ? getAsList(mark) : [];
    const allMarks = newMarks.concat(marks);
    if (node.type === "element") {
      return isSync(async, options)
        ? node.children.flatMap((child) =>
            mapHtmlNodeToRichTextNode(false, child, allMarks, options),
          )
        : Promise.all(
            node.children.map((child) =>
              mapHtmlNodeToRichTextNode(true, child, allMarks, options),
            ),
          ).then((r) => r.flat());
    }
    return isSync(async, options)
      ? getAsList(mapHtmlNodeToRichTextNode(false, node, allMarks, options))
      : mapHtmlNodeToRichTextNode(true, node, allMarks, options).then(
          getAsList,
        );
  };
  const next = mapChildren;

  if (node.type === "text") {
    return convertText(node, marks);
  }

  const tagConverter = convertTag[node.tagName] ?? defaultTagConverter;
  const convertedNode = tagConverter(node, next as Next);
  return convertedNode;
}

export function htmlStringToDocument(
  async: false,
  htmlString: string,
  options: Options,
): Document;
export function htmlStringToDocument(
  async: true,
  htmlString: string,
  options: AsyncOptions,
): Promise<Document>;
export function htmlStringToDocument(
  async: boolean,
  htmlString: string,
  options: Options | AsyncOptions,
): MaybePromise<Document> {
  const commonOptions = {
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
  const optionsWithDefaults: OptionsWithDefaults | AsyncOptionsWithDefaults =
    isSync(async, options)
      ? {
          convertTag: {
            ...DEFAULT_SYNC_TAG_CONVERTERS,
            ...options.convertTag,
          },
          defaultTagConverter:
            options.defaultTagConverter ?? convertTagToChildren,
          convertText: options.convertText ?? convertTextNodeToText,
          ...commonOptions,
        }
      : {
          convertTag: {
            ...DEFAULT_ASYNC_TAG_CONVERTERS,
            ...options.convertTag,
          },
          defaultTagConverter:
            options.defaultTagConverter ?? convertTagToChildrenAsync,
          convertText: options.convertText ?? convertTextNodeToTextAsync,
          ...commonOptions,
        };

  const parserOptions: ParserOptions = {
    ignoreWhiteSpace:
      optionsWithDefaults.parserOptions.handleWhitespaceNodes == "remove",
  };

  const parsedHtml = parseHtml(htmlString, parserOptions);

  if (isSync(async, optionsWithDefaults)) {
    const richTextNodes = parsedHtml.flatMap((node) =>
      mapHtmlNodeToRichTextNode(false, node, [], optionsWithDefaults),
    );
    const processedRichTextNodes = richTextNodes
      .map((node) =>
        processConvertedNodesFromTopLevel(
          node,
          optionsWithDefaults.postProcessing,
        ),
      )
      .filter(isNotNull);

    return createDocumentNode(processedRichTextNodes);
  }

  return Promise.all(
    parsedHtml.map((node) =>
      mapHtmlNodeToRichTextNode(true, node, [], optionsWithDefaults),
    ),
  ).then((richTextNodes) => {
    const processedRichTextNodes = richTextNodes
      .flat()
      .map((node) =>
        processConvertedNodesFromTopLevel(
          node,
          optionsWithDefaults.postProcessing,
        ),
      )
      .filter(isNotNull);

    return createDocumentNode(processedRichTextNodes);
  });
}

function isSync(
  async: boolean,
  options: Options | AsyncOptions,
): options is Options;
function isSync(
  async: boolean,
  options: OptionsWithDefaults | AsyncOptionsWithDefaults,
): options is OptionsWithDefaults;
function isSync(async: boolean): boolean {
  return !async;
}
