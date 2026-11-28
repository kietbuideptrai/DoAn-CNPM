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
    expect(artifacts[0].title).toBe("A-1スカイレイダー攻撃機");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("filters demo artifacts by the localized title", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");

    await expect(getArtifacts("en", "skyraider")).resolves.toMatchObject([
      { slug: "a-1-skyraider", title: "A-1 Skyraider attack aircraft" },
    ]);
  });

  it("searches Vietnamese names regardless of the display language", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");

    await expect(getArtifacts("ja", "Skyraider")).resolves.toMatchObject([
      { slug: "a-1-skyraider", title: "A-1スカイレイダー攻撃機" },
    ]);
    await expect(getArtifacts("en", "tiger cages")).resolves.toMatchObject([
      { slug: "chuong-cop-con-dao" },
    ]);
  });

  it("searches English titles regardless of the display language", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");

    await expect(getArtifacts("vi", "guillotine")).resolves.toMatchObject([
      {
        slug: "may-chem",
        title: "Máy chém thời Pháp thuộc và chính quyền Ngô Đình Diệm",
      },
    ]);
    await expect(getArtifacts("ko", "M48")).resolves.toMatchObject([
      { slug: "m48-patton" },
    ]);
  });

  it("matches partial names without case sensitivity", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");

    await expect(getArtifacts("zh", "blu-82")).resolves.toMatchObject([
      { slug: "blu-82" },
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

    await expect(getArtifact("m48-patton", "ko")).resolves.toMatchObject({
      slug: "m48-patton",
      translation: { language_code: "ko", title: "M48 패튼 전차" },
    });
    await expect(getArtifact("unknown", "vi")).rejects.toMatchObject({
      status: 404,
      message: "Không tìm thấy hiện vật",
    });
  });
});
