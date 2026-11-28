import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles.css", "utf8");

function ruleBody(selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `Missing CSS rule for ${selector}`).toBeGreaterThanOrEqual(0);
  const end = css.indexOf("\n}", start);
  expect(end, `Unclosed CSS rule for ${selector}`).toBeGreaterThan(start);
  return css.slice(start, end);
}

function mediaBodies(query: string): string[] {
  const marker = `@media ${query} {`;
  const bodies: string[] = [];
  let from = 0;

  while (true) {
    const start = css.indexOf(marker, from);
    if (start < 0) {
      break;
    }

    let depth = 0;
    for (let index = start; index < css.length; index += 1) {
      if (css[index] === "{") depth += 1;
      if (css[index] === "}") {
        depth -= 1;
        if (depth === 0) {
          bodies.push(css.slice(start, index));
          from = index;
          break;
        }
      }
    }
  }

  expect(bodies.length, `Missing media query ${query}`).toBeGreaterThan(0);
  return bodies;
}

function mediaBody(query: string): string {
  return mediaBodies(query).join("\n");
}

describe("responsive web styles", () => {
  it("covers the required 320/375/390/768/1440 viewport bands", () => {
    expect(css).toContain("@media (max-width: 400px)");
    expect(css).toContain("@media (max-width: 680px)");
    expect(css).toContain("@media (min-width: 681px) and (max-width: 900px)");

    const small = mediaBody("(max-width: 680px)");
    expect(small).toContain(".map-artifact-groups");
    expect(small).toContain("grid-template-columns: 1fr");
    expect(small).toContain(".analytics-summary");

    const tablet = mediaBody("(min-width: 681px) and (max-width: 900px)");
    expect(tablet).toContain(".artifact-grid");
    expect(tablet).toContain("repeat(2, minmax(0, 1fr))");
  });

  it("keeps map and chart fluid without horizontal overflow", () => {
    expect(ruleBody(".map-frame")).toContain("width: 100%");
    expect(ruleBody(".map-frame")).toContain("max-width: 900px");
    expect(ruleBody(".map-frame")).toContain("overflow: hidden");
    expect(ruleBody(".museum-map-svg")).toContain("width: 100%");
    expect(ruleBody(".visitor-chart-svg")).toContain("width: 100%");
    expect(ruleBody(".visitor-chart-data")).toContain("overflow-x: auto");

    const narrowPins = mediaBody("(max-width: 680px)");
    expect(narrowPins).toMatch(/\.map-pin\s*\{[^}]*width: 32px/s);

    expect(ruleBody(".analytics-summary")).toContain(
      "repeat(4, minmax(0, 1fr))",
    );
    expect(mediaBody("(max-width: 680px)")).toContain(
      "repeat(2, minmax(0, 1fr))",
    );
    expect(mediaBody("(max-width: 400px)")).toContain(
      ".analytics-summary",
    );
    expect(mediaBody("(max-width: 400px)")).toMatch(
      /\.analytics-summary\s*\{[^}]*grid-template-columns: 1fr/s,
    );
  });
});
