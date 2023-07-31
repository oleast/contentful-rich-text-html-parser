import { parseFragment } from "parse5";
import {
  ChildNode,
  Template,
  DocumentType,
  TextNode,
  CommentNode,
} from "parse5/dist/tree-adapters/default";
import { isNotNull } from "./utils";

import type { HTMLNode, HTMLTagName } from "./types";

const isChildNodeComment = (childNode: ChildNode): childNode is CommentNode => {
  return childNode.nodeName === "#comment";
};

const isChildNodeTextNode = (childNode: ChildNode): childNode is TextNode => {
  return childNode.nodeName === "#text";
};

const isChildNodeTemplate = (childNode: ChildNode): childNode is Template => {
  return childNode.nodeName === "template";
};

const isChildNodeDocumentType = (
  childNode: ChildNode,
): childNode is DocumentType => {
  return childNode.nodeName === "#documentType";
};

const mapChildNodeToHtmlNode = (childNode: ChildNode): HTMLNode | null => {
  if (
    isChildNodeComment(childNode) ||
    isChildNodeDocumentType(childNode) ||
    isChildNodeTemplate(childNode)
  ) {
    return null;
  }
  if (isChildNodeTextNode(childNode)) {
    return {
      type: "text",
      value: childNode.value,
    };
  }

  return {
    type: "element",
    tagName: childNode.tagName as HTMLTagName,
    children: childNode.childNodes
      .map((c) => mapChildNodeToHtmlNode(c))
      .filter(isNotNull),
    attrs: Object.fromEntries(
      childNode.attrs.map((attr) => [attr.name, attr.value]),
    ),
  };
};

export const parseHtml = (htmlString: string): HTMLNode[] => {
  const parsedHtml = parseFragment(htmlString);
  return parsedHtml.childNodes
    .map((node) => mapChildNodeToHtmlNode(node))
    .filter(isNotNull);
};
