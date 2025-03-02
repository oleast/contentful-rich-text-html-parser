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
export type AsyncNext<
  TNodeType extends AnyContentfulNode = Block | Inline | Text,
> = (
  node: HTMLNode,
  marks?: Mark | Mark[],
) => MaybePromise<Array<ContentfulNodeContent<TNodeType>>>;

export type TextConverter = (node: HTMLTextNode, marks: Mark[]) => Text;
export type AsyncTextConverter = (
  node: HTMLTextNode,
  marks: Mark[],
) => MaybePromise<Text>;

export type TagConverter<
  TNodeType extends AnyContentfulNode = Block | Inline | Text,
> = (
  node: HTMLElementNode,
  next: Next<TNodeType>,
) => ConverterResult<TNodeType>;
export type AsyncTagConverter<
  TNodeType extends AnyContentfulNode = Block | Inline | Text,
> = (
  node: HTMLElementNode,
  next: AsyncNext<TNodeType>,
) => MaybePromise<ConverterResult<TNodeType>>;

export type ConvertTagOptions = Record<HTMLTagName | string, TagConverter>;
export type AsyncConvertTagOptions = Record<
  HTMLTagName | string,
  AsyncTagConverter
>;

export type HandleWhitespaceNodes = "preserve" | "remove";
export type HandleTopLevelText = "preserve" | "remove" | "wrap-paragraph";
export type HandleTopLevelInlines = "preserve" | "remove" | "wrap-paragraph";

export interface ParserOptions {
  handleWhitespaceNodes: HandleWhitespaceNodes;
}

export interface PostProcessingOptions {
  handleTopLevelInlines: HandleTopLevelInlines;
  handleTopLevelText: HandleTopLevelText;
}

interface OptionsWithDefaultsBase<
  ConvertTagOptions,
  TagConverter,
  TextConverter,
> {
  convertTag: ConvertTagOptions;
  defaultTagConverter: TagConverter;
  convertText: TextConverter;
  parserOptions: ParserOptions;
  postProcessing: PostProcessingOptions;
}
export type OptionsWithDefaults = OptionsWithDefaultsBase<
  ConvertTagOptions,
  TagConverter,
  TextConverter
>;
export type AsyncOptionsWithDefaults = OptionsWithDefaultsBase<
  AsyncConvertTagOptions,
  AsyncTagConverter,
  AsyncTextConverter
>;

type OptionsBase<T> = Partial<
  Omit<T, "parserOptions" | "postProcessing"> & {
    parserOptions: Partial<ParserOptions>;
    postProcessing: Partial<PostProcessingOptions>;
  }
>;
export type Options = OptionsBase<OptionsWithDefaults>;
export type AsyncOptions = OptionsBase<AsyncOptionsWithDefaults>;

export type MaybePromise<T> = T | Promise<T>;
