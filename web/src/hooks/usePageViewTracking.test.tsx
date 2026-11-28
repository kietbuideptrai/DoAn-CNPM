import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import apiSamples from "../../../docs/api-samples.json";
import App from "../App";
import {
  resetNavigationTracking,
  trackPageView,
} from "../api/analyticsClient";
import { AuthProvider } from "../context/AuthContext";
import { FontSizeProvider } from "../context/FontSizeContext";

let fetchMock: ReturnType<typeof vi.fn>;

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderApp(path: string) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[path]}>
        <FontSizeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </FontSizeProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

function trackedPaths(): string[] {
  return fetchMock.mock.calls
    .filter(
      ([input]) =>
        new URL(String(input), "http://localhost").pathname ===
        "/api/analytics/pageview",
    )
    .map(([, options]) => JSON.parse(String(options?.body)).path);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubEnv("VITE_DEMO_MODE", "false");
  resetNavigationTracking();
  fetchMock = vi.fn((input: RequestInfo | URL) => {
    const pathname = new URL(String(input), "http://localhost").pathname;
    if (pathname === "/api/analytics/pageview") {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (pathname.startsWith("/api/artifacts/")) {
      return Promise.resolve(respond(apiSamples.artifactDetail));
    }
    if (pathname === "/api/artifacts") {
      return Promise.resolve(respond([]));
    }
    if (pathname === "/api/museum/map") {
      return Promise.resolve(respond({ zones: [], artifacts: [] }));
    }
    return Promise.resolve(respond({ artifacts: [] }));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("public page view tracking", () => {
  it("sends one page view per public navigation under StrictMode", async () => {
    renderApp("/");

    await waitFor(() => expect(trackedPaths()).toEqual(["/"]));
    expect(window.localStorage.getItem("museumVisitorId")).toMatch(
      /^[0-9a-f-]{36}$/iu,
    );

    fireEvent.click(screen.getByRole("link", { name: "Bản đồ" }));

    await waitFor(() => expect(trackedPaths()).toEqual(["/", "/map"]));
  });

  it("does not send anything from the admin area", async () => {
    window.localStorage.setItem("adminToken", "admin-token");
    renderApp("/admin");

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(trackedPaths()).toEqual([]);
  });

  it("does not send anything in demo mode", async () => {
    vi.stubEnv("VITE_DEMO_MODE", "true");
    renderApp("/artifacts");

    expect(
      await screen.findByRole("heading", { name: "Hiện vật" }),
    ).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reuses the visitor id stored by the client", async () => {
    trackPageView("/");
    const visitorId = window.localStorage.getItem("museumVisitorId");

    renderApp("/map");

    await waitFor(() => expect(trackedPaths()).toEqual(["/", "/map"]));
    const bodies = fetchMock.mock.calls
      .filter(
        ([input]) =>
          new URL(String(input), "http://localhost").pathname ===
          "/api/analytics/pageview",
      )
      .map(([, options]) => JSON.parse(String(options?.body)));
    expect(bodies.map((body) => body.visitor_id)).toEqual([
      visitorId,
      visitorId,
    ]);
  });
});
