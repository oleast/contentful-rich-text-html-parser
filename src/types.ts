import type {
  Block,
  Inline,
  Mark,
  Node,
  Text,
} from "@contentful/rich-text-types";

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

export type ContentfulNodeContent<TNodeType extends AnyContentfulNode> =
  TNodeType extends Block
    ? Block["content"][0]
    : TNodeType extends Inline
    ? Inline["content"][0]
    : TNodeType extends Mark
    ? Block["content"][0]
    : TNodeType extends Text
    ? Text
    : never;

export type AnyContentfulNode = Node | Mark | Text;
export type ConverterResult<TNodeType extends AnyContentfulNode> =
  | ContentfulNodeContent<TNodeType>
  | Array<ContentfulNodeContent<TNodeType>>;

export type Next<TNodeType extends AnyContentfulNode = Block | Inline | Text> =
  (
    node: HTMLNode,
    marks?: Mark | Mark[],
  ) => Array<ContentfulNodeContent<TNodeType>>;

export type TextConverter = (node: HTMLTextNode, marks: Mark[]) => Text;

export type TagConverter<
  TNodeType extends AnyContentfulNode = Block | Inline | Text,
> = (
  node: HTMLElementNode,
  next: Next<TNodeType>,
) => ConverterResult<TNodeType>;

export type ConvertTagOptions = Record<HTMLTagName | string, TagConverter>;

export interface OptionsWithDefaults {
  convertTag: ConvertTagOptions;
  convertText: TextConverter;
}

export type Options = Partial<OptionsWithDefaults>;
