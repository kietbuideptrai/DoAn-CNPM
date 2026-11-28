import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_UNAUTHORIZED_EVENT,
  createAdminArtifact,
  deleteAdminArtifact,
  getAdminAnalyticsSummary,
  getAdminArtifacts,
  loginAdmin,
  requestAdmin,
  saveAdminArtifactTranslation,
  updateAdminArtifact,
  updateAdminArtifactPublished,
} from "./adminClient";
import { ApiRequestError } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin API client", () => {
  it("posts the email and password to the PRD login endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: "admin-token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(loginAdmin("admin@example.com", "secret")).resolves.toEqual({
      token: "admin-token",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "admin@example.com", password: "secret" }),
      }),
    );
  });

  it("surfaces the message field returned by the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Thông tin đăng nhập không đúng." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(loginAdmin("admin@example.com", "wrong")).rejects.toMatchObject({
      message: "Thông tin đăng nhập không đúng.",
      status: 401,
    });
  });

  it("sends the bearer token and dispatches logout on an admin 401", async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("window", { dispatchEvent });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Phiên đăng nhập hết hạn." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(
      requestAdmin("/api/admin/artifacts", "admin-token"),
    ).rejects.toMatchObject({
      message: "Phiên đăng nhập hết hạn.",
      status: 401,
    } satisfies Partial<ApiRequestError>);

    expect(dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: ADMIN_UNAUTHORIZED_EVENT }),
    );
  });

  it("uses the PRD create, update, and translation endpoints", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "artifact-id" }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const artifact = {
      name: "Hiện vật",
      slug: "hien-vat",
      category: "Lịch sử",
      image_url: "https://example.test/image.jpg",
    };
    const translation = {
      language_code: "vi" as const,
      title: "Hiện vật",
      summary: "Mô tả",
      content: "Nội dung",
    };

    await expect(createAdminArtifact(artifact, "admin-token")).resolves.toEqual({
      id: "artifact-id",
    });
    await expect(
      updateAdminArtifact("artifact-id", artifact, "admin-token"),
    ).resolves.toBeUndefined();
    await expect(
      saveAdminArtifactTranslation(
        "artifact-id",
        translation,
        "admin-token",
      ),
    ).resolves.toBeUndefined();

    expect(fetchMock.mock.calls.map(([url, options]) => [url, options?.method])).toEqual([
      ["/api/admin/artifacts", "POST"],
      ["/api/admin/artifacts/artifact-id", "PATCH"],
      ["/api/admin/artifacts/artifact-id/translations/vi", "PUT"],
    ]);
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toEqual(
      translation,
    );
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization"),
    ).toBe("Bearer admin-token");
  });

  it("loads and validates the admin artifact list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            artifacts: [
              {
                id: "artifact-id",
                name: "Hiện vật",
                slug: "hien-vat",
                category: "Lịch sử",
                is_published: true,
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    await expect(getAdminArtifacts("admin-token")).resolves.toEqual([
      {
        id: "artifact-id",
        name: "Hiện vật",
        slug: "hien-vat",
        category: "Lịch sử",
        is_published: true,
      },
    ]);
  });

  it("patches the publication state with the expected payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      updateAdminArtifactPublished("artifact/id", false, "admin-token"),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/artifacts/artifact%2Fid",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ is_published: false }),
      }),
    );
  });

  it("deletes the artifact with a bearer token", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deleteAdminArtifact("artifact/id", "admin-token"),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/artifacts/artifact%2Fid",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization"),
    ).toBe("Bearer admin-token");
  });

  it("rejects malformed artifact list data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: "missing-fields" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(getAdminArtifacts("admin-token")).rejects.toThrow(
      "Dữ liệu hiện vật từ máy chủ không đầy đủ.",
    );
  });

  it("requests the analytics summary for the selected range with a bearer token", async () => {
    const payload = {
      range: { days: 7, from: "2026-11-21", to: "2026-11-27" },
      totals: {
        pageviews: 500,
        unique_visitors: 200,
        today_pageviews: 54,
        today_unique_visitors: 31,
        peak_day: { date: "2026-11-25", pageviews: 92 },
      },
      daily: [{ date: "2026-11-21", pageviews: 41, unique_visitors: 22 }],
      top_artifacts: [
        { slug: "doi-guoc-go-ho-chi-minh", title: "Đôi guốc gỗ mộc", views: 120 },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAdminAnalyticsSummary(7, "admin-token")).resolves.toEqual(
      payload,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/analytics/summary?days=7",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).get("Authorization"),
    ).toBe("Bearer admin-token");
  });

  it("accepts an empty peak day and rejects incomplete analytics data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            range: { days: 30, from: "2026-10-29", to: "2026-11-27" },
            totals: {
              pageviews: 0,
              unique_visitors: 0,
              today_pageviews: 0,
              peak_day: null,
            },
            daily: [],
            top_artifacts: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            range: { days: 30 },
            totals: { pageviews: 1 },
            daily: [{}],
            top_artifacts: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAdminAnalyticsSummary(30, "admin-token")).resolves.toMatchObject({
      totals: { peak_day: null, today_unique_visitors: 0 },
      daily: [],
    });
    await expect(getAdminAnalyticsSummary(30, "admin-token")).rejects.toThrow(
      "Dữ liệu thống kê từ máy chủ không đầy đủ.",
    );
  });
});
