import { afterEach, describe, expect, it, vi } from "vitest";
import { getArtifact, getArtifacts, isDemoMode } from "./client";

const supportedLanguages = ["vi", "en", "zh", "ja", "ko"] as const;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("local web demo data", () => {
  it("loads localized artifacts without calling fetch", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect(isDemoMode()).toBe(true);
    const artifacts = await getArtifacts("ja");
    expect(artifacts).toHaveLength(8);
    expect(artifacts[0].title).toBe("1946年発行の2ドン硬貨");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("filters demo artifacts by the localized title", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");

    await expect(getArtifacts("en", "coin")).resolves.toMatchObject([
      { slug: "dong-hai-dong-1946", title: "The 1946 Two-Dong Coin" },
    ]);
  });

  it.each(supportedLanguages)(
    "provides all eight artifacts in %s",
    async (language) => {
      vi.stubEnv("VITE_DEMO_MODE", "true");

      const artifacts = await getArtifacts(language);

      expect(artifacts).toHaveLength(8);
      expect(artifacts.every((artifact) => artifact.title.length > 0)).toBe(true);
      expect(
        artifacts.every(
          (artifact) =>
            artifact.image_url === "/images/artifacts/museum-placeholder.svg",
        ),
      ).toBe(true);
    },
  );

  it("returns localized detail data and rejects unknown slugs with 404", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");

    await expect(getArtifact("tap-tho-trong-tuyen", "ko")).resolves.toMatchObject({
      slug: "tap-tho-trong-tuyen",
      translation: { language_code: "ko", title: "쫑뚜옌 시집" },
    });
    await expect(getArtifact("unknown", "vi")).rejects.toMatchObject({
      status: 404,
      message: "Không tìm thấy hiện vật",
    });
  });
});
