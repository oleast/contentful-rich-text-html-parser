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
