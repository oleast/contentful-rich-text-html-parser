import { describe, expect, it } from "vitest";

import { parseHtml } from "../parseHtml.js";
import type { HTMLElementNode } from "../types.js";

// These tests document parse5 v8 parseFragment() behavior for orphaned table
// elements. If parse5 is upgraded and its behavior changes, these tests will
// catch it.
describe("Parse5 fragment behavior for orphaned table elements", () => {
  it("consecutive orphaned <td> elements remain bare (not wrapped in <tr>)", () => {
    const nodes = parseHtml("<td>A</td><td>B</td>", {
      ignoreWhiteSpace: true,
    });

    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "td" });
    expect(nodes[1]).toMatchObject({ type: "element", tagName: "td" });
    expect((nodes[0] as HTMLElementNode).children).toMatchObject([
      { type: "text", value: "A" },
    ]);
    expect((nodes[1] as HTMLElementNode).children).toMatchObject([
      { type: "text", value: "B" },
    ]);
  });

  it("single orphaned <td> remains bare", () => {
    const nodes = parseHtml("<td>A</td>", { ignoreWhiteSpace: true });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "td" });
  });

  it("orphaned <th> remains bare", () => {
    const nodes = parseHtml("<th>Header</th>", { ignoreWhiteSpace: true });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "th" });
  });

  it("trailing <td> after explicit </tr> gets wrapped in fake <tr>", () => {
    const nodes = parseHtml("<tr><td>A</td></tr><td>B</td>", {
      ignoreWhiteSpace: true,
    });

    expect(nodes).toHaveLength(2);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "tr" });
    expect(nodes[1]).toMatchObject({ type: "element", tagName: "tr" });

    const firstTr = nodes[0] as HTMLElementNode;
    expect(firstTr.children).toMatchObject([
      { type: "element", tagName: "td" },
    ]);

    const secondTr = nodes[1] as HTMLElementNode;
    expect(secondTr.children).toMatchObject([
      { type: "element", tagName: "td" },
    ]);
  });

  it("orphaned <tr> with <td> children preserves structure", () => {
    const nodes = parseHtml("<tr><td>A</td><td>B</td></tr>", {
      ignoreWhiteSpace: true,
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "tr" });

    const tr = nodes[0] as HTMLElementNode;
    expect(tr.children).toHaveLength(2);
    expect(tr.children[0]).toMatchObject({ type: "element", tagName: "td" });
    expect(tr.children[1]).toMatchObject({ type: "element", tagName: "td" });
  });

  it("<table> wrapped elements are fully nested", () => {
    const nodes = parseHtml("<table><tr><td>A</td></tr></table>", {
      ignoreWhiteSpace: true,
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "table" });

    // parse5 automatically inserts <tbody>
    const table = nodes[0] as HTMLElementNode;
    expect(table.children).toHaveLength(1);
    expect(table.children[0]).toMatchObject({
      type: "element",
      tagName: "tbody",
    });

    const tbody = table.children[0] as HTMLElementNode;
    expect(tbody.children).toHaveLength(1);
    expect(tbody.children[0]).toMatchObject({
      type: "element",
      tagName: "tr",
    });

    const tr = tbody.children[0] as HTMLElementNode;
    expect(tr.children).toHaveLength(1);
    expect(tr.children[0]).toMatchObject({ type: "element", tagName: "td" });
  });

  it("consecutive orphaned <td> are not grouped with adjacent <tr>", () => {
    const nodes = parseHtml("<td>A</td><tr><td>B</td></tr><td>C</td>", {
      ignoreWhiteSpace: true,
    });

    // In fragment/template context, a leading bare <td> doesn't trigger
    // table-mode parsing, so the explicit <tr> is treated as an unknown tag
    // and its children are hoisted out — all three end up as bare <td>
    // elements. Compare with the test above where <tr> comes first.
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toMatchObject({ type: "element", tagName: "td" });
    expect(nodes[1]).toMatchObject({ type: "element", tagName: "td" });
    expect(nodes[2]).toMatchObject({ type: "element", tagName: "td" });
  });
});
