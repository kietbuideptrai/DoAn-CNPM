import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../middleware/errors";
import {
  isValidSlug,
  parseAdminArtifactInput,
  parseAdminArtifactPatch,
  parseAdminTranslationInput,
} from "./admin-artifacts.validation";

function assertBadRequest(action: () => unknown): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof HttpError && error.statusCode === 400,
  );
}

describe("admin artifact input", () => {
  it("accepts the payload sent by the admin form", () => {
    assert.deepEqual(
      parseAdminArtifactInput({
        name: "Hiện vật mới",
        slug: "hien-vat-moi",
        category: "Lịch sử",
        image_url: "https://example.test/image.jpg",
      }),
      {
        name: "Hiện vật mới",
        slug: "hien-vat-moi",
        category: "Lịch sử",
        image_url: "https://example.test/image.jpg",
      },
    );
  });

  it("rejects malformed slugs and missing names", () => {
    assert.equal(isValidSlug("hien-vat-1"), true);
    assert.equal(isValidSlug("Hien Vat"), false);
    assertBadRequest(() =>
      parseAdminArtifactInput({ name: "", slug: "hien-vat" }),
    );
    assertBadRequest(() =>
      parseAdminArtifactInput({ name: "Tên", slug: "slug khong hop le" }),
    );
  });

  it("parses partial patches including the publication flag", () => {
    assert.deepEqual(
      parseAdminArtifactPatch({ is_published: false, category: "" }),
      { is_published: false, category: "" },
    );
    assertBadRequest(() => parseAdminArtifactPatch({ is_published: "false" }));
    assertBadRequest(() => parseAdminArtifactPatch({}));
  });

  it("validates translation language and required title", () => {
    const parsed = parseAdminTranslationInput("vi", {
      title: "Tiêu đề",
      summary: "",
      content: "Nội dung",
    });
    assert.deepEqual(parsed, {
      language: "vi",
      fields: { title: "Tiêu đề", summary: "", content: "Nội dung" },
    });
    assertBadRequest(() =>
      parseAdminTranslationInput("fr", { title: "Titre", summary: "", content: "" }),
    );
    assertBadRequest(() =>
      parseAdminTranslationInput("en", { title: "", summary: "", content: "" }),
    );
  });
});
