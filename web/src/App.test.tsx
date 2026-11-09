import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import apiSamples from "../../docs/api-samples.json";
import { MemoryRouter, useLocation } from "react-router";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { FontSizeProvider } from "./context/FontSizeContext";

function CurrentLocation() {
  const location = useLocation();
  return (
    <output data-testid="current-location">
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderApp(path: string) {
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

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.stubEnv("VITE_DEMO_MODE", "false");
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("artifact detail page", () => {
  it("shows a not-found message when the API returns 404", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(apiSamples.notFound), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    renderApp("/artifacts/missing-artifact?lang=en");

    expect(
      await screen.findByRole("heading", {
        name: "Không tìm thấy hiện vật",
      }),
    ).toBeTruthy();
    expect(
      screen.getByText("Không có hiện vật với mã missing-artifact."),
    ).toBeTruthy();
  });

  it("asks before using the English fallback and keeps the selected language on cancel", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(apiSamples.artifactWithoutTranslation), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderApp("/artifacts/tank-001?lang=vi");

    await screen.findByRole("dialog");
    expect(
      screen.getByRole("heading", { name: "Chưa có bản dịch" }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        "Hiện chưa có nội dung bằng ngôn ngữ bạn chọn. Bạn có muốn xem nội dung bằng tiếng Anh không?",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Xem tiếng Anh" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Hủy" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "Chưa có thuyết minh bằng Tiếng Việt",
      }),
    ).toBeTruthy();
    expect(screen.getByTestId("current-location").textContent).toBe(
      "/artifacts/tank-001?lang=vi",
    );
    expect(window.localStorage.getItem("language")).toBe("vi");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("uses the documented artifact response as the fetch mock", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(apiSamples.artifactDetail), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    renderApp("/artifacts/tank-001?lang=en");

    expect(
      await screen.findByRole("heading", { name: "Historic tank" }),
    ).toBeTruthy();
    expect(
      screen.getByText("A historic vehicle in the collection."),
    ).toBeTruthy();
  });

  it("loads English only after confirmation without changing the selected language or auto-playing TTS", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const requestUrl = new URL(String(input), "http://localhost");
      const body =
        requestUrl.searchParams.get("lang") === "en"
          ? apiSamples.artifactDetail
          : apiSamples.artifactWithoutTranslation;
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    });
    const speak = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("speechSynthesis", {
      getVoices: () => [{ lang: "en-US" }],
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      cancel: vi.fn(),
      speak,
    });
    vi.stubGlobal("SpeechSynthesisUtterance", vi.fn());

    renderApp("/artifacts/tank-001?lang=vi");

    fireEvent.click(
      await screen.findByRole("button", { name: "Xem tiếng Anh" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Historic tank" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("article").querySelector(".artifact-language")?.textContent,
    ).toBe("English");
    expect(
      screen
        .getByText("This tank served during the war.")
        .closest("[lang]")
        ?.getAttribute("lang"),
    ).toBe("en");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(
      fetchMock.mock.calls.map(([input]) =>
        new URL(String(input), "http://localhost").searchParams.get("lang"),
      ),
    ).toEqual(["vi", "en"]);
    expect(screen.getByTestId("current-location").textContent).toBe(
      "/artifacts/tank-001?lang=vi",
    );
    expect(window.localStorage.getItem("language")).toBe("vi");
    expect(speak).not.toHaveBeenCalled();
  });

  it("shows an unavailable-content message without offering fallback when English is missing", async () => {
    const artifactWithoutEnglish = {
      ...apiSamples.artifactWithoutTranslation,
      available_languages: ["ja", "ko"],
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(artifactWithoutEnglish), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderApp("/artifacts/tank-001?lang=vi");

    expect(
      await screen.findByRole("heading", { name: "Nội dung chưa khả dụng" }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByText(
        "Hiện chưa có nội dung bằng Tiếng Việt hoặc tiếng Anh cho hiện vật này.",
      ),
    ).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows the exact missing-voice message, preserves the text, and allows rechecking", async () => {
    let voices = [{ lang: "fr-FR" } as SpeechSynthesisVoice];
    const speechSynthesis = {
      getVoices: vi.fn(() => voices),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      cancel: vi.fn(),
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };
    class MockSpeechSynthesisUtterance {
      lang = "";
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify(apiSamples.artifactDetail), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));
    vi.stubGlobal("speechSynthesis", speechSynthesis);
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);

    renderApp("/artifacts/tank-001?lang=en");

    expect(await screen.findByText("Hiện giờ chưa có voice")).toBeTruthy();
    expect(
      screen.getByText("This tank served during the war.").closest("[lang]"),
    ).toBeTruthy();
    expect(speechSynthesis.speak).not.toHaveBeenCalled();

    voices = [{ lang: "en-US" } as SpeechSynthesisVoice];
    fireEvent.click(
      screen.getByRole("button", { name: "Nghe thuyết minh bằng English" }),
    );

    await waitFor(() => {
      expect(speechSynthesis.speak).toHaveBeenCalledOnce();
    });
    expect(screen.queryByText("Hiện giờ chưa có voice")).toBeNull();
    expect(screen.getByText("This tank served during the war.")).toBeTruthy();
  });

  it("shows the exact missing-voice message when the engine reports voice-unavailable", async () => {
    let utterance: SpeechSynthesisUtterance | undefined;
    const speechSynthesis = {
      getVoices: vi.fn(() => [{ lang: "en-US" } as SpeechSynthesisVoice]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      cancel: vi.fn(),
      speak: vi.fn((nextUtterance: SpeechSynthesisUtterance) => {
        utterance = nextUtterance;
      }),
      pause: vi.fn(),
      resume: vi.fn(),
    };
    class MockSpeechSynthesisUtterance {
      lang = "";
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify(apiSamples.artifactDetail), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ));
    vi.stubGlobal("speechSynthesis", speechSynthesis);
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);

    renderApp("/artifacts/tank-001?lang=en");
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Nghe thuyết minh bằng English",
      }),
    );

    await waitFor(() => expect(utterance).toBeDefined());
    act(() =>
      utterance?.onerror?.(
        Object.assign(new Event("error"), {
          error: "voice-unavailable",
        }) as SpeechSynthesisErrorEvent,
      ),
    );

    expect(await screen.findByText("Hiện giờ chưa có voice")).toBeTruthy();
    expect(screen.getByText("This tank served during the war.")).toBeTruthy();
  });
});
