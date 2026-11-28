import { HttpError } from "../middleware/errors";

export const ADMIN_LANGUAGES = ["vi", "en", "zh", "ja", "ko"] as const;
export type AdminLanguage = (typeof ADMIN_LANGUAGES)[number];

export interface AdminArtifactFields {
  name: string;
  slug: string;
  category: string;
  image_url: string;
}

export interface AdminArtifactPatch {
  name?: string;
  slug?: string;
  category?: string;
  image_url?: string;
  is_published?: boolean;
}

export interface AdminTranslationFields {
  title: string;
  summary: string;
  content: string;
}

export function isAdminLanguage(value: string): value is AdminLanguage {
  return ADMIN_LANGUAGES.some((language) => language === value);
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function readRecord(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "Dữ liệu gửi lên không hợp lệ");
  }

  return body as Record<string, unknown>;
}

function readString(
  value: unknown,
  label: string,
  maxLength: number,
  required: boolean,
): string | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new HttpError(400, `Vui lòng nhập ${label}`);
    }
    return undefined;
  }

  if (typeof value !== "string") {
    if (required) {
      throw new HttpError(400, `${label} không hợp lệ`);
    }
    return undefined;
  }

  if (required && value.trim().length === 0) {
    throw new HttpError(400, `${label} không hợp lệ`);
  }

  if (value.trim().length > maxLength) {
    throw new HttpError(400, `${label} quá dài`);
  }

  return value.trim();
}

export function parseAdminArtifactInput(body: unknown): AdminArtifactFields {
  const record = readRecord(body);
  const slug = readString(record.slug, "slug", 200, true) ?? "";
  if (!isValidSlug(slug)) {
    throw new HttpError(
      400,
      "Slug chỉ được dùng chữ thường, số và dấu gạch ngang",
    );
  }

  return {
    name: readString(record.name, "tên hiện vật", 200, true) ?? "",
    slug,
    category: readString(record.category, "danh mục", 200, false) ?? "",
    image_url: readString(record.image_url, "đường dẫn ảnh", 2048, false) ?? "",
  };
}

export function parseAdminArtifactPatch(body: unknown): AdminArtifactPatch {
  const record = readRecord(body);
  const patch: AdminArtifactPatch = {};

  if ("name" in record) {
    patch.name = readString(record.name, "tên hiện vật", 200, true);
  }
  if ("slug" in record) {
    const slug = readString(record.slug, "slug", 200, true) ?? "";
    if (!isValidSlug(slug)) {
      throw new HttpError(
        400,
        "Slug chỉ được dùng chữ thường, số và dấu gạch ngang",
      );
    }
    patch.slug = slug;
  }
  if ("category" in record) {
    patch.category = readString(record.category, "danh mục", 200, false);
  }
  if ("image_url" in record) {
    patch.image_url = readString(record.image_url, "đường dẫn ảnh", 2048, false);
  }
  if ("is_published" in record) {
    if (typeof record.is_published !== "boolean") {
      throw new HttpError(400, "Trạng thái xuất bản không hợp lệ");
    }
    patch.is_published = record.is_published;
  }

  if (Object.keys(patch).length === 0) {
    throw new HttpError(400, "Không có trường nào để cập nhật");
  }

  return patch;
}

export function parseAdminTranslationInput(
  language: string,
  body: unknown,
): { language: AdminLanguage; fields: AdminTranslationFields } {
  if (!isAdminLanguage(language)) {
    throw new HttpError(400, "Ngôn ngữ không hợp lệ");
  }

  const record = readRecord(body);
  return {
    language,
    fields: {
      title: readString(record.title, "tiêu đề", 300, true) ?? "",
      summary: readString(record.summary, "mô tả ngắn", 2000, false) ?? "",
      content: readString(record.content, "nội dung", 50_000, false) ?? "",
    },
  };
}
