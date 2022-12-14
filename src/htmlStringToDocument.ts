import { parseHtml } from "./parseHtml";
import {
  BLOCKS,
  NodeData,
  TopLevelBlock,
  Document,
  MARKS,
  INLINES,
  Node,
  Text,
  Block,
  Inline,
  Mark,
} from "@contentful/rich-text-types";
import { HTMLElementNode, HTMLNode, HTMLTagName } from "./types";

const BLOCK_TYPES = Object.values(BLOCKS);
const INLINE_TYPES = Object.values(INLINES);
const MARK_TYPES = Object.values(MARKS);

const isBlockType = (nodeType: BLOCKS | MARKS | INLINES): nodeType is BLOCKS =>
  BLOCK_TYPES.includes(nodeType as BLOCKS);
const isInlineType = (
  nodeType: BLOCKS | MARKS | INLINES
): nodeType is INLINES => INLINE_TYPES.includes(nodeType as INLINES);
const isMarkType = (nodeType: BLOCKS | MARKS | INLINES): nodeType is MARKS =>
  MARK_TYPES.includes(nodeType as MARKS);

const isNodeTypeMark = (node: Node | Text | Mark): node is Mark => {
  return isMarkType((<Mark>node).type as MARKS);
};

const isNodeTypeText = (node: Node | Text | Mark): node is Text => {
  if (isNodeTypeMark(node)) {
    return false;
  }
  if (node.nodeType === "text") {
    return true;
  }
  return false;
};

const HTML_TAG_NODE_TYPES: Partial<
  Record<HTMLTagName, BLOCKS | MARKS | INLINES>
> = {
  h1: BLOCKS.HEADING_1,
  h2: BLOCKS.HEADING_2,
  h3: BLOCKS.HEADING_3,
  h4: BLOCKS.HEADING_4,
  h5: BLOCKS.HEADING_5,
  h6: BLOCKS.HEADING_6,
  hr: BLOCKS.HR,
  li: BLOCKS.LIST_ITEM,
  ol: BLOCKS.OL_LIST,
  p: BLOCKS.PARAGRAPH,
  blockquote: BLOCKS.QUOTE,
  table: BLOCKS.TABLE,
  td: BLOCKS.TABLE_CELL,
  th: BLOCKS.TABLE_HEADER_CELL,
  tr: BLOCKS.TABLE_ROW,
  ul: BLOCKS.UL_LIST,
  b: MARKS.BOLD,
  strong: MARKS.BOLD,
  pre: MARKS.CODE,
  i: MARKS.ITALIC,
  sub: MARKS.SUBSCRIPT,
  sup: MARKS.SUPERSCRIPT,
  u: MARKS.UNDERLINE,
  a: INLINES.HYPERLINK,
  img: BLOCKS.EMBEDDED_ASSET,
  video: BLOCKS.EMBEDDED_ASSET,
  audio: BLOCKS.EMBEDDED_ASSET,
};

type Next = (node: HTMLNode) => Array<Node | Text | Mark>;

const convertBlockNode =
  (nodeType: BLOCKS) =>
  (node: HTMLElementNode, next: Next): Array<Node | Mark | Text> => {
    const block: Block = {
      nodeType,
      content: next(node) as Array<Block | Inline | Text>,
      data: {},
    };
    return [block];
  };

const convertInlineNode =
  (nodeType: INLINES) =>
  (node: HTMLElementNode, next: Next): Array<Node | Mark | Text> => {
    const inline: Inline = {
      nodeType,
      content: next(node) as Array<Inline | Text>,
      data: {},
    };
    return [inline];
  };

const convertAnchorNode = (node: HTMLElementNode, next: Next) => {
  const anchor: Inline = {
    nodeType: INLINES.HYPERLINK,
    content: next(node) as Array<Inline | Text>,
    data: {
      uri: node.attrs.href,
    },
  };
  return [anchor];
};

const convertMarkNode = (nodeType: MARKS) => (_: HTMLElementNode, __: Next) => {
  const mark: Mark = {
    type: nodeType,
  };
  return [mark];
};

type ConvertNode = Record<
  HTMLTagName,
  (node: HTMLElementNode, next: Next) => Array<Node | Text | Mark>
>;

type ConvertMark = Record<
  HTMLTagName,
  (node: HTMLElementNode, next: Next) => Array<Node | Text | Mark>
>;

interface ConvertOptions {
  convertNode: Partial<ConvertNode>;
  convertMark: Partial<ConvertMark>;
}

const defaultConvertOptions: ConvertOptions = {
  convertNode: {
    h1: convertBlockNode(BLOCKS.HEADING_1),
    h2: convertBlockNode(BLOCKS.HEADING_2),
    h3: convertBlockNode(BLOCKS.HEADING_3),
    h4: convertBlockNode(BLOCKS.HEADING_4),
    h5: convertBlockNode(BLOCKS.HEADING_5),
    h6: convertBlockNode(BLOCKS.HEADING_6),
    hr: convertBlockNode(BLOCKS.HR),
    li: convertBlockNode(BLOCKS.LIST_ITEM),
    ol: convertBlockNode(BLOCKS.OL_LIST),
    p: convertBlockNode(BLOCKS.PARAGRAPH),
    blockquote: convertBlockNode(BLOCKS.QUOTE),
    table: convertBlockNode(BLOCKS.TABLE),
    td: convertBlockNode(BLOCKS.TABLE_CELL),
    th: convertBlockNode(BLOCKS.TABLE_HEADER_CELL),
    tr: convertBlockNode(BLOCKS.TABLE_ROW),
    ul: convertBlockNode(BLOCKS.UL_LIST),
    a: convertAnchorNode,
    img: convertBlockNode(BLOCKS.EMBEDDED_ASSET),
    video: convertBlockNode(BLOCKS.EMBEDDED_ASSET),
    audio: convertBlockNode(BLOCKS.EMBEDDED_ASSET),
  },
  convertMark: {
    b: convertMarkNode(MARKS.BOLD),
    strong: convertMarkNode(MARKS.BOLD),
    pre: convertMarkNode(MARKS.CODE),
    i: convertMarkNode(MARKS.ITALIC),
    sub: convertMarkNode(MARKS.SUBSCRIPT),
    sup: convertMarkNode(MARKS.SUPERSCRIPT),
    u: convertMarkNode(MARKS.UNDERLINE),
  },
};

const createDocumentNode = (
  content: TopLevelBlock[],
  data: NodeData = {}
): Document => ({
  nodeType: BLOCKS.DOCUMENT,
  data,
  content,
});

const mapHtmlNodeToRichTextNode: Next = (node) => {
  if (node.type === "text") {
    const textNode: Text = {
      nodeType: "text",
      marks: [],
      value: node.value,
      data: {},
    };
    return [textNode];
  }

  const next: Next = (node) => {
    if (node.type === "element") {
      return node.children.flatMap((child) => mapHtmlNodeToRichTextNode(child));
    }
    return mapHtmlNodeToRichTextNode(node);
  };

  const nodeType = HTML_TAG_NODE_TYPES[node.tagName];

  // Skip element if no node type is found
  if (!nodeType) {
    return next(node);
  }

  if (isBlockType(nodeType)) {
    const converter = defaultConvertOptions.convertNode[node.tagName] ?? next;
    const block = converter(node, next);
    return block;
  }

  if (isInlineType(nodeType)) {
    const converter = defaultConvertOptions.convertNode[node.tagName] ?? next;
    const inline = converter(node, next);
    return inline;
  }

  if (isMarkType(nodeType)) {
    const converter = defaultConvertOptions.convertMark[node.tagName] ?? next;
    const mark = converter(node, next);
    const children = next(node);
    return children.map((child) => {
      if (isNodeTypeText(child)) {
        child.marks = [...child.marks, ...mark.filter(isNodeTypeMark)];
      }
      return child;
    });
  }

  throw new Error(`Unknown nodeType ${nodeType}`);
};

export const htmlStringToDocument = (htmlString: string): Document => {
  const parsedHtml = parseHtml(htmlString);
  const richTextNodes = parsedHtml.flatMap((node) =>
    mapHtmlNodeToRichTextNode(node)
  );
  return createDocumentNode(richTextNodes as TopLevelBlock[]);
};
