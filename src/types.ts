import type { Mark, Node, Text } from "@contentful/rich-text-types";

export type HTMLTagName = keyof HTMLElementTagNameMap;

export interface HTMLTextNode {
  type: "text";
  value: string;
}

export interface HTMLElementNode {
  type: "element";
  tagName: HTMLTagName;
  children: HTMLNode[];
  attrs: { [attr: string]: string };
}

export type HTMLNode = HTMLElementNode | HTMLTextNode;

export type AnyContentfulNode = Node | Mark | Text;
export type ConverterResult = AnyContentfulNode | Array<AnyContentfulNode>;

export type Next = (node: HTMLNode) => ConverterResult;

export type TagConverter = (
  node: HTMLElementNode,
  next: Next
) => ConverterResult;

export type ConvertTagOptions = Record<HTMLTagName | string, TagConverter>;

export interface OptionsWithDefaults {
  convertTag: ConvertTagOptions;
  convertText: (node: HTMLTextNode) => Text;
}

export type Options = Partial<OptionsWithDefaults>;
