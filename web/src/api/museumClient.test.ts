import { afterEach, describe, expect, it, vi } from "vitest";
import { getMuseumMap, MUSEUM_MAP_PATH } from "./museumClient";

const payload = {
  zones: [
    {
      id: "phong-1",
      name: "Phòng Kháng chiến",
      short_name: "Kháng chiến",
      description: "",
      kind: "gallery",
      x: 60,
      y: 60,
      width: 280,
      height: 180,
      color: "#EAF2EC",
      sort_order: 2,
    },
  ],
  artifacts: [
    {
      slug: "dong-hai-dong-1946",
      title: "1946年発行の2ドン硬貨",
      summary: "",
      image_url: "/images/artifacts/museum-placeholder.svg",
      zone_id: "phong-1",
      x: 120,
      y: 130,
    },
  ],
  unplaced_artifacts: [
    {
      slug: "chua-co-vi-tri",
      title: "Chưa có vị trí",
      summary: "",
      image_url: "/images/artifacts/museum-placeholder.svg",
    },
  ],
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("museum map client", () => {
  it("requests the documented endpoint with the selected language", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "false");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();

    const result = await getMuseumMap("ja", controller.signal);

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/museum/map?lang=ja`,
      expect.objectContaining({ signal: controller.signal }),
    );
    expect(MUSEUM_MAP_PATH).toBe("/api/museum/map");
    expect(result).toEqual(payload);
  });

  it("rejects an incomplete map response", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "false");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ zones: [], artifacts: [{}] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(getMuseumMap("vi")).rejects.toThrow(
      "Dữ liệu hiện vật từ máy chủ không đầy đủ.",
    );
  });

  it("serves the seven-zone demo map without calling fetch", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const map = await getMuseumMap("ja");

    expect(map.zones).toHaveLength(7);
    expect(map.artifacts).toHaveLength(8);
    expect(map.artifacts[0].title).toBe("1946年発行の2ドン硬貨");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
