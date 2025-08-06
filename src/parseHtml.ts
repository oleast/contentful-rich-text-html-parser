import { parseFragment } from "parse5";
import type { DefaultTreeAdapterTypes as T } from "parse5";
import { isNotNull, isWhiteSpace } from "./utils.js";

import type { HTMLNode, HTMLTagName } from "./types.js";

export interface ParserOptions {
  ignoreWhiteSpace: boolean;
}

const isChildNodeComment = (
  childNode: T.ChildNode,
): childNode is T.CommentNode => {
  return childNode.nodeName === "#comment";
};

const isChildNodeTextNode = (
  childNode: T.ChildNode,
): childNode is T.TextNode => {
  return childNode.nodeName === "#text";
};

const isChildNodeTemplate = (
  childNode: T.ChildNode,
): childNode is T.Template => {
  return childNode.nodeName === "template";
};

const isChildNodeDocumentType = (
  childNode: T.ChildNode,
): childNode is T.DocumentType => {
  return childNode.nodeName === "#documentType";
};

const isTextNodePureWhiteSpace = (textNode: T.TextNode): boolean => {
  return isWhiteSpace(textNode.value);
};

const mapChildNodeToHtmlNode = (
  childNode: T.ChildNode,
  options: ParserOptions,
): HTMLNode | null => {
  if (
    isChildNodeComment(childNode) ||
    isChildNodeDocumentType(childNode) ||
    isChildNodeTemplate(childNode)
  ) {
    return null;
  }
  if (isChildNodeTextNode(childNode)) {
    if (options.ignoreWhiteSpace && isTextNodePureWhiteSpace(childNode)) {
      return null;
    }
    return {
      type: "text",
      value: childNode.value,
    };
  }

  return {
    type: "element",
    tagName: childNode.tagName as HTMLTagName,
    children: childNode.childNodes
      .map((c) => mapChildNodeToHtmlNode(c, options))
      .filter(isNotNull),
    attrs: Object.fromEntries(
      childNode.attrs.map((attr) => [attr.name, attr.value]),
    ),
  };
};

export const parseHtml = (
  htmlString: string,
  options: ParserOptions,
): HTMLNode[] => {
  const parsedHtml = parseFragment(htmlString);
  return parsedHtml.childNodes
    .map((node) => mapChildNodeToHtmlNode(node, options))
    .filter(isNotNull);
};
