import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getVisitorId,
  resetNavigationTracking,
  trackNavigation,
  trackPageView,
} from "./analyticsClient";

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

beforeEach(() => {
  window.localStorage.clear();
  vi.stubEnv("VITE_DEMO_MODE", "false");
  resetNavigationTracking();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("page view tracking client", () => {
  it("creates and reuses an anonymous UUID v4 in localStorage", () => {
    const visitorId = getVisitorId();

    expect(visitorId).toMatch(UUID_V4);
    expect(window.localStorage.getItem("museumVisitorId")).toBe(visitorId);
    expect(getVisitorId()).toBe(visitorId);
  });

  it("keeps a stored valid id and replaces an invalid one", () => {
    window.localStorage.setItem(
      "museumVisitorId",
      "00000000-0000-4000-8000-000000000000",
    );
    expect(getVisitorId()).toBe("00000000-0000-4000-8000-000000000000");

    window.localStorage.setItem("museumVisitorId", "not-a-uuid");
    expect(getVisitorId()).toMatch(UUID_V4);
  });

  it("posts the anonymous visitor id and path to the analytics endpoint", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    trackPageView("/artifacts/dong-hai-dong-1946");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics/pageview",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
        body: JSON.stringify({
          visitor_id: getVisitorId(),
          path: "/artifacts/dong-hai-dong-1946",
        }),
      }),
    );
    expect(
      new Headers(fetchMock.mock.calls[0][1]?.headers).get("Content-Type"),
    ).toBe("application/json");
  });

  it("never tracks admin pages or demo mode", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    trackPageView("/admin/analytics");
    expect(fetchMock).not.toHaveBeenCalled();

    vi.stubEnv("VITE_DEMO_MODE", "true");
    trackPageView("/artifacts");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("swallows network failures", () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(() => trackPageView("/")).not.toThrow();

    vi.stubGlobal(
      "fetch",
      vi.fn(() => {
        throw new Error("fetch is blocked");
      }),
    );
    expect(() => trackPageView("/map")).not.toThrow();
  });

  it("sends once per navigation despite StrictMode and query-only changes", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    trackNavigation("key-1", "/");
    trackNavigation("key-1", "/");
    trackNavigation("key-2", "/");
    trackNavigation("key-3", "/map");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      fetchMock.mock.calls.map(([, options]) => JSON.parse(String(options?.body))),
    ).toEqual([
      { visitor_id: getVisitorId(), path: "/" },
      { visitor_id: getVisitorId(), path: "/map" },
    ]);
  });
});
