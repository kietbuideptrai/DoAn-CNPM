import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, useLocation } from "react-router";
import apiSamples from "../../../docs/api-samples.json";
import type {
  MuseumMapArtifact,
  MuseumMapData,
  MuseumZone,
} from "../../../shared/types";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { FontSizeProvider } from "../context/FontSizeContext";

function CurrentLocation() {
  const location = useLocation();
  return (
    <output data-testid="current-location">
      {location.pathname}
      {location.search}
    </output>
  );
}

function zone(
  id: string,
  name: string,
  short_name: string,
  kind: MuseumZone["kind"],
  sort_order: number,
  x: number,
  y: number,
  width = 280,
  height = 180,
): MuseumZone {
  return {
    id,
    name,
    short_name,
    description: "",
    kind,
    x,
    y,
    width,
    height,
    color: "#EAF2EC",
    sort_order,
  };
}

function artifact(
  slug: string,
  title: string,
  zone_id: string,
  x: number,
  y: number,
): MuseumMapArtifact {
  return {
    slug,
    title,
    summary: `Mô tả ${title}`,
    image_url: "/images/artifacts/museum-placeholder.svg",
    zone_id,
    x,
    y,
  };
}

function buildMapData(): MuseumMapData {
  return {
    zones: [
      zone("sanh", "Sảnh chính", "Sảnh", "lobby", 1, 390, 460, 220, 120),
      zone(
        "phong-1",
        "Phòng Kháng chiến và Độc lập",
        "Kháng chiến",
        "gallery",
        2,
        60,
        60,
      ),
      zone(
        "phong-2",
        "Phòng Đời sống Chủ tịch",
        "Đời sống",
        "gallery",
        3,
        360,
        60,
      ),
      zone("phong-3", "Phòng Ký ức và Hội ngộ", "Ký ức", "gallery", 4, 660, 60),
      zone(
        "phong-4",
        "Phòng Nghệ thuật và Báo chí",
        "Nghệ thuật",
        "gallery",
        5,
        60,
        270,
        280,
        150,
      ),
      zone(
        "hanh-lang",
        "Hành lang trung tâm",
        "Hành lang",
        "walkway",
        6,
        360,
        270,
        280,
        150,
      ),
      zone(
        "phong-5",
        "Khu trải nghiệm số",
        "Trải nghiệm",
        "gallery",
        7,
        660,
        270,
        280,
        150,
      ),
    ],
    artifacts: [
      artifact("dong-hai-dong-1946", "Đồng Hai đồng năm 1946", "phong-1", 120, 130),
      artifact("bao-linh-kach-menh-so-2", "Báo Lính kách mệnh số 2", "phong-1", 260, 130),
      artifact(
        "bo-do-an-chu-tich-ho-chi-minh",
        "Bộ đồ ăn của Chủ tịch Hồ Chí Minh",
        "phong-2",
        430,
        125,
      ),
      artifact(
        "tui-dung-com-nuoc-ho-chi-minh",
        "Túi đựng cơm và nước uống",
        "phong-2",
        570,
        125,
      ),
      artifact("doi-guoc-go-ho-chi-minh", "Đôi guốc gỗ mộc", "phong-2", 500, 195),
      artifact("me-con-ngay-gap-mat", "Mẹ con ngày gặp mặt", "phong-3", 730, 125),
      artifact("tap-tho-trong-tuyen", "Tập thơ Trọng Tuyển", "phong-3", 870, 125),
      artifact(
        "tranh-co-dong-cach-mang-thang-tam",
        "Tranh cổ động cách mạng tháng Tám",
        "phong-4",
        200,
        345,
      ),
    ],
  };
}

function renderMap(path = "/map?lang=vi") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CurrentLocation />
      <FontSizeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FontSizeProvider>
    </MemoryRouter>,
  );
}

let fetchMock: ReturnType<typeof vi.fn>;
let mapData: MuseumMapData;

beforeEach(() => {
  window.localStorage.clear();
  vi.stubEnv("VITE_DEMO_MODE", "false");
  mapData = buildMapData();
  fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    const body =
      url.pathname === "/api/museum/map"
        ? mapData
        : apiSamples.artifactDetail;
    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("public museum map page", () => {
  it("renders seven zones, eight numbered pins and the grouped artifact list", async () => {
    renderMap();

    expect(
      await screen.findByRole("heading", { name: "Bản đồ bảo tàng" }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/museum/map?lang=vi",
        expect.anything(),
      ),
    );

    const svg = screen.getByRole("img", { name: /Sơ đồ bảo tàng/u });
    for (const label of [
      "Kháng chiến",
      "Đời sống",
      "Ký ức",
      "Nghệ thuật",
      "Hành lang",
      "Trải nghiệm",
      "Sảnh",
      "Cửa vào",
    ]) {
      expect(svg.textContent).toContain(label);
    }

    const pins = screen.getAllByRole("link", { name: /^Ghim \d+:/u });
    expect(pins).toHaveLength(8);
    expect(pins[0].getAttribute("aria-label")).toContain(
      "Ghim 1: Đồng Hai đồng năm 1946",
    );
    expect(pins[0].getAttribute("href")).toBe(
      "/artifacts/dong-hai-dong-1946?lang=vi",
    );

    expect(
      screen.getAllByRole("link", { name: /^Xem chi tiết:/u }),
    ).toHaveLength(8);
    expect(
      screen.getByRole("heading", {
        name: "Phòng Kháng chiến và Độc lập",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Sảnh chính" })).toBeNull();

    const firstGroup = screen
      .getByRole("heading", { name: "Phòng Kháng chiến và Độc lập" })
      .closest(".map-zone-group");
    expect(firstGroup?.querySelector(".map-artifact-number")?.textContent).toBe(
      "1",
    );
  });

  it("opens the artifact detail when a pin is activated", async () => {
    renderMap();

    const pin = await screen.findByRole("link", {
      name: /^Ghim 1:/u,
    });
    fireEvent.click(pin);

    expect(screen.getByTestId("current-location").textContent).toBe(
      "/artifacts/dong-hai-dong-1946?lang=vi",
    );
  });

  it("shows a load error and retries", async () => {
    fetchMock.mockRejectedValueOnce(
      new Error("Không thể kết nối máy chủ. Hãy kiểm tra mạng."),
    );
    renderMap();

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("Không thể kết nối máy chủ. Hãy kiểm tra mạng."),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    await waitFor(() =>
      expect(screen.getAllByRole("link", { name: /^Ghim \d+:/u })).toHaveLength(
        8,
      ),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("notes artifacts that have no position on the map", async () => {
    mapData.unplaced_artifacts = [
      {
        slug: "chua-co-vi-tri",
        title: "Hiện vật chưa đặt vị trí",
        summary: "",
        image_url: "/images/artifacts/museum-placeholder.svg",
      },
    ];
    renderMap();

    expect(
      await screen.findByText(/Hiện vật chưa có vị trí trên sơ đồ:/u),
    ).toBeTruthy();
  });
});
