import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { parse } from "csv-parse/sync";

const seed = readFileSync(join(process.cwd(), "src/db/seed.sql"), "utf8");
const csv = new TextDecoder("utf-8", { fatal: true }).decode(
  readFileSync(join(process.cwd(), "data/noi-dung-bao-tang.csv")),
);
const csvRows = parse(csv, {
  columns: true,
  skip_empty_lines: true,
}) as Array<{
  slug: string;
  language_code: string;
  title: string;
  summary: string;
  content: string;
}>;
const imageSources = JSON.parse(
  readFileSync(join(process.cwd(), "src/db/image-sources.json"), "utf8"),
) as {
  images: Array<{
    slug: string;
    articleUrl: string;
    imageUrl: string;
    sourceImageUrl: string | null;
    licenseOrPermission: string | null;
    status: string;
  }>;
};

const supportedLanguages = ["vi", "en", "zh", "ja", "ko"];

describe("development seed safety", () => {
  it("adds artifacts as unpublished and does not update existing rows", () => {
    const artifactRows = [
      ...seed.matchAll(
        /\('([^']+)', '[^']+', '([^']+)', '[^']+', (TRUE|FALSE)\)/g,
      ),
    ];

    assert.equal(artifactRows.length, 8);
    assert.ok(artifactRows.every(([, , imageUrl, published]) =>
      imageUrl.startsWith("https://placehold.co/") && published === "FALSE",
    ));
    assert.doesNotMatch(seed, /ON CONFLICT \(slug\) DO UPDATE/);
    assert.doesNotMatch(seed, /ON CONFLICT \(artifact_id, language_code\) DO UPDATE/);
    assert.match(seed, /ON CONFLICT \(slug\) DO NOTHING/);
  });

  it("seeds all five draft languages for each artifact without overwriting translations", () => {
    const entries = [...seed.matchAll(/^\s*\('([a-z0-9-]+)', '(vi|en|zh|ja|ko)',/gm)]
      .map(([, slug, language]) => ({ slug, language }));
    const slugs = [...new Set(entries.map(({ slug }) => slug))];

    assert.equal(slugs.length, 8);
    assert.equal(entries.length, 8 * supportedLanguages.length);
    assert.equal(csvRows.length, 8 * supportedLanguages.length);
    for (const slug of slugs) {
      assert.deepEqual(
        entries
          .filter((entry) => entry.slug === slug)
          .map(({ language }) => language)
          .sort(),
        [...supportedLanguages].sort(),
      );
      const csvLanguages = csvRows
        .filter((entry) => entry.slug === slug)
        .map((entry) => entry.language_code)
        .sort();
      assert.deepEqual(csvLanguages, [...supportedLanguages].sort());
    }
    assert.ok(csvRows.every((row) => row.title && row.summary && row.content));
    assert.match(seed, /ON CONFLICT \(artifact_id, language_code\) DO NOTHING/);
  });

  it("tracks source articles and placeholder images pending rights confirmation", () => {
    assert.equal(imageSources.images.length, 8);
    assert.ok(
      imageSources.images.every(
        (image) =>
          image.articleUrl.startsWith("https://baotanghochiminh.vn/") &&
          image.imageUrl.startsWith("https://placehold.co/") &&
          image.sourceImageUrl === null &&
          image.licenseOrPermission === null &&
          image.status === "placeholder-rights-unconfirmed" &&
          seed.includes(image.imageUrl),
      ),
    );
    assert.doesNotMatch(seed, /War Remnants Museum|Chứng tích Chiến tranh/);
    assert.deepEqual(
      imageSources.images.map(({ slug }) => slug).sort(),
      [
        "dong-hai-dong-1946",
        "me-con-ngay-gap-mat",
        "tap-tho-trong-tuyen",
        "bao-linh-kach-menh-so-2",
        "bo-do-an-chu-tich-ho-chi-minh",
        "tui-dung-com-nuoc-ho-chi-minh",
        "doi-guoc-go-ho-chi-minh",
        "tranh-co-dong-cach-mang-thang-tam",
      ].sort(),
    );
  });
});
