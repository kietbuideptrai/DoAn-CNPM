import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const seed = readFileSync(join(process.cwd(), "src/db/seed.sql"), "utf8");
const imageSources = JSON.parse(
  readFileSync(join(process.cwd(), "src/db/image-sources.json"), "utf8"),
) as {
  images: Array<{
    slug: string;
    developmentPlaceholderUrl: string;
    sourceUrl: string | null;
    licenseOrPermission: string | null;
    status: string;
  }>;
};

const supportedLanguages = ["vi", "en", "zh", "ja", "ko"];

describe("development seed safety", () => {
  it("adds artifacts as unpublished and does not update existing rows", () => {
    const artifactRows = [
      ...seed.matchAll(
        /VALUES \('([^']+)', '[^']+', '[^']+', '[^']+', (TRUE|FALSE)\)\s+ON CONFLICT \(slug\) (DO NOTHING|DO UPDATE)/g,
      ),
    ];

    assert.equal(artifactRows.length, 8);
    assert.ok(artifactRows.every(([, , published, conflict]) =>
      published === "FALSE" && conflict === "DO NOTHING",
    ));
    assert.doesNotMatch(seed, /ON CONFLICT \(slug\) DO UPDATE/);
    assert.doesNotMatch(seed, /ON CONFLICT \(artifact_id, language_code\) DO UPDATE/);
  });

  it("seeds all five draft languages for each artifact without overwriting translations", () => {
    const translationStatements = seed.split(
      /(?=INSERT INTO artifact_translations)/,
    );
    const entries = translationStatements
      .map((statement) => {
        const language = statement.match(/SELECT id, '(vi|en|zh|ja|ko)'/)?.[1];
        const slug = statement.match(/FROM artifacts WHERE slug = '([^']+)'/)?.[1];
        return language && slug ? { language, slug, statement } : undefined;
      })
      .filter(
        (entry): entry is { language: string; slug: string; statement: string } =>
          entry !== undefined,
      );
    const slugs = [...new Set(entries.map(({ slug }) => slug))];

    assert.equal(slugs.length, 8);
    assert.equal(entries.length, 8 * supportedLanguages.length);
    for (const slug of slugs) {
      assert.deepEqual(
        entries
          .filter((entry) => entry.slug === slug)
          .map(({ language }) => language)
          .sort(),
        [...supportedLanguages].sort(),
      );
    }
    assert.ok(
      entries.every(({ statement }) =>
        /ON CONFLICT \(artifact_id, language_code\) DO NOTHING/.test(statement),
      ),
    );
  });

  it("tracks source and permission status for every development image placeholder", () => {
    assert.equal(imageSources.images.length, 8);
    assert.ok(
      imageSources.images.every(
        (image) =>
          image.developmentPlaceholderUrl.startsWith("https://placehold.co/") &&
          image.sourceUrl === null &&
          image.licenseOrPermission === null &&
          image.status === "pending",
      ),
    );
    assert.deepEqual(
      imageSources.images.map(({ slug }) => slug).sort(),
      [
        "uh-1-huey",
        "f-5a",
        "m48-patton",
        "a-1-skyraider",
        "may-chem",
        "chuong-cop-con-dao",
        "blu-82",
        "phao-155mm",
      ].sort(),
    );
  });
});
