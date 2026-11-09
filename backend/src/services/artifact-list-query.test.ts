import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildArtifactListQuery } from "./artifact-list-query";
import type { Language } from "./artifacts.service";

const displayLanguages: Language[] = ["vi", "en", "ko"];

describe("buildArtifactListQuery", () => {
  for (const language of displayLanguages) {
    it(`searches Vietnamese artifact names when displaying ${language}`, () => {
      const { text, values } = buildArtifactListQuery(language, "  tăng  ");

      assert.deepEqual(values, [language, "tăng"]);
      assert.match(text, /LOWER\(artifacts\.name\)/);
      assert.match(text, /english_translation\.language_code = 'en'/);
      assert.match(text, /LOWER\(english_translation\.title\)/);
      assert.match(text, /WHERE artifacts\.is_published = TRUE/);
    });

    it(`searches English titles when displaying ${language}`, () => {
      const { text, values } = buildArtifactListQuery(language, "fighter");

      assert.deepEqual(values, [language, "fighter"]);
      assert.match(text, /english_translation\.language_code = 'en'/);
      assert.match(text, /LOWER\(english_translation\.title\)/);
      assert.match(text, /WHERE artifacts\.is_published = TRUE/);
    });
  }

  it("uses case-insensitive partial matching and skips empty queries", () => {
    const query = buildArtifactListQuery("vi", " FiGhTeR ");
    const noSearch = buildArtifactListQuery("vi", "   ");

    assert.deepEqual(query.values, ["vi", "FiGhTeR"]);
    assert.match(query.text, /POSITION\(LOWER\(\$2\) IN LOWER\(artifacts\.name\)\)/);
    assert.match(
      query.text,
      /POSITION\(LOWER\(\$2\) IN LOWER\(english_translation\.title\)\)/,
    );
    assert.deepEqual(noSearch.values, ["vi"]);
    assert.doesNotMatch(noSearch.text, /english_translation/);
  });
});
