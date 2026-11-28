import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import App from "../App";
import { AuthProvider } from "../context/AuthContext";
import { FontSizeProvider } from "../context/FontSizeContext";

const DAY_MS = 86_400_000;
const formatter = new Intl.NumberFormat("vi-VN");
const seedNote =
  "Số liệu 30 ngày đầu là dữ liệu demo; từ ngày bật ghi nhận là số liệu thật.";

function buildSummary(days: number) {
  const to = Date.UTC(2026, 10, 27);
  const from = to - (days - 1) * DAY_MS;
  const iso = (time: number) => new Date(time).toISOString().slice(0, 10);
  const daily = Array.from({ length: days }, (_, index) => ({
    date: iso(from + index * DAY_MS),
    pageviews: 40 + index,
    unique_visitors: 20 + index,
  }));
  const peak = daily.reduce((best, point) =>
    point.pageviews > best.pageviews ? point : best,
  );

  return {
    range: { days, from: iso(from), to: iso(to) },
    totals: {
      pageviews: daily.reduce((total, point) => total + point.pageviews, 0),
      unique_visitors: daily.reduce(
        (total, point) => total + point.unique_visitors,
        0,
      ),
      today_pageviews: daily[daily.length - 1].pageviews,
      today_unique_visitors: daily[daily.length - 1].unique_visitors,
      peak_day: { date: peak.date, pageviews: peak.pageviews },
    },
    daily,
    top_artifacts: [
      { slug: "doi-guoc-go-ho-chi-minh", title: "Đôi guốc gỗ mộc", views: 120 },
      { slug: "dong-hai-dong-1946", title: "Đồng Hai đồng năm 1946", views: 85 },
    ],
  };
}

function summaryResponse(days: number): Response {
  return new Response(JSON.stringify(buildSummary(days)), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function renderAnalytics() {
  return render(
    <MemoryRouter initialEntries={["/admin/analytics"]}>
      <FontSizeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </FontSizeProvider>
    </MemoryRouter>,
  );
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem("adminToken", "admin-token");
  vi.restoreAllMocks();
  fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    return Promise.resolve(summaryResponse(Number(url.searchParams.get("days"))));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("admin analytics page", () => {
  it("loads the 30-day summary with totals, chart, fallback table and top artifacts", async () => {
    renderAnalytics();

    expect(
      await screen.findByRole("heading", { name: "Thống kê truy cập" }),
    ).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/admin/analytics/summary?days=30",
    );
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization"),
    ).toBe("Bearer admin-token");

    const summary = buildSummary(30);
    expect(screen.getByText(formatter.format(summary.totals.pageviews))).toBeTruthy();
    expect(
      screen.getByText(formatter.format(summary.totals.unique_visitors)),
    ).toBeTruthy();
    expect(screen.getByText("Từ 29/10/2026 đến 27/11/2026")).toBeTruthy();

    const todayCard = screen.getByText("Hôm nay").closest(".analytics-card");
    expect(todayCard?.textContent).toContain(
      formatter.format(summary.totals.today_pageviews),
    );
    expect(todayCard?.textContent).toContain(
      formatter.format(summary.totals.today_unique_visitors),
    );
    const peakCard = screen
      .getByText("Ngày cao nhất")
      .closest(".analytics-card");
    expect(peakCard?.textContent).toContain("27/11/2026");

    expect(
      screen.getAllByRole("img", {
        name: /lượt xem, \d+ khách duy nhất$/u,
      }),
    ).toHaveLength(30);
    const dataTable = screen.getByRole("table", {
      name: "Số liệu lượt xem và khách duy nhất theo ngày",
    });
    expect(dataTable.querySelectorAll("tbody tr")).toHaveLength(30);

    const topTable = screen.getByRole("table", {
      name: "Top hiện vật được xem",
    });
    expect(within(topTable).getByText("Đôi guốc gỗ mộc")).toBeTruthy();
    expect(within(topTable).getByText("120")).toBeTruthy();
    expect(screen.getByText(seedNote)).toBeTruthy();
    expect(
      screen.getByRole("navigation", { name: "Điều hướng quản trị" }),
    ).toBeTruthy();
  });

  it("refetches and redraws when switching between 30 and 7 days", async () => {
    renderAnalytics();

    await waitFor(() =>
      expect(
        screen.getAllByRole("img", { name: /lượt xem, \d+ khách duy nhất$/u }),
      ).toHaveLength(30),
    );

    fireEvent.click(screen.getByRole("radio", { name: "7 ngày" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/admin/analytics/summary?days=7",
        expect.anything(),
      ),
    );
    await waitFor(() =>
      expect(
        screen.getAllByRole("img", { name: /lượt xem, \d+ khách duy nhất$/u }),
      ).toHaveLength(7),
    );
    expect(screen.getByText("Từ 21/11/2026 đến 27/11/2026")).toBeTruthy();
    expect(
      screen.queryByText(
        formatter.format(buildSummary(30).totals.pageviews),
      ),
    ).toBeNull();
    expect(
      screen.getByRole("table", {
        name: "Số liệu lượt xem và khách duy nhất theo ngày",
      }).querySelectorAll("tbody tr"),
    ).toHaveLength(7);
  });

  it("shows an error and retries the summary request", async () => {
    fetchMock.mockRejectedValueOnce(
      new Error("Không thể kết nối máy chủ. Hãy kiểm tra mạng."),
    );
    renderAnalytics();

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("Không thể kết nối máy chủ. Hãy kiểm tra mạng."),
    ).toBeTruthy();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    await waitFor(() =>
      expect(
        screen.getAllByRole("img", { name: /lượt xem, \d+ khách duy nhất$/u }),
      ).toHaveLength(30),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
