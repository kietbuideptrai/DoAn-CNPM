import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getTtsLocale,
  getVoiceStatus,
  splitSentences,
  useSpeech,
} from "./useSpeech";

interface MockUtterance {
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror:
    | ((event: Pick<SpeechSynthesisErrorEvent, "error">) => void)
    | null;
}

function stubSpeechSynthesis(voices: SpeechSynthesisVoice[]) {
  const utterances: Array<MockUtterance & { text: string }> = [];
  const speechSynthesis = {
    getVoices: vi.fn(() => voices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    cancel: vi.fn(),
    speak: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  };

  class MockSpeechSynthesisUtterance implements MockUtterance {
    lang = "";
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror:
      | ((event: Pick<SpeechSynthesisErrorEvent, "error">) => void)
      | null = null;

    constructor(readonly text: string) {
      utterances.push(this);
    }
  }

  vi.stubGlobal("speechSynthesis", speechSynthesis);
  vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);

  return { speechSynthesis, utterances };
}

describe("getVoiceStatus", () => {
  const getVoices = vi.fn<() => SpeechSynthesisVoice[]>();

  afterEach(() => {
    vi.unstubAllGlobals();
    getVoices.mockReset();
  });

  describe("speech language and sentence helpers", () => {
    it.each([
      ["vi", "vi-VN"],
      ["en", "en-US"],
      ["zh", "zh-CN"],
      ["ja", "ja-JP"],
      ["ko", "ko-KR"],
    ] as const)("maps %s to the %s TTS locale", (language, locale) => {
      expect(getTtsLocale(language)).toBe(locale);
    });

    it("splits sentences, trims whitespace, and omits empty sentences", () => {
      expect(
        splitSentences("  First sentence.  Second sentence! ?  Third sentence。"),
      ).toEqual([
        "First sentence.",
        "Second sentence!",
        "?",
        "Third sentence。",
      ]);
    });

    it("splits CJK sentence terminators without requiring spaces", () => {
      expect(splitSentences("第一句。第二句！第三句？")).toEqual([
        "第一句。",
        "第二句！",
        "第三句？",
      ]);
    });
  });

  it.each([
    ["vi-VN", "vi-VN"],
    ["en-US", "en-US"],
    ["zh-CN", "zh-CN"],
    ["ja-JP", "ja-JP"],
    ["ko-KR", "ko-KR"],
  ])("returns available for a matching %s voice", (ttsLang, voiceLang) => {
    getVoices.mockReturnValue([{ lang: voiceLang } as SpeechSynthesisVoice]);
    vi.stubGlobal("window", {
      speechSynthesis: { getVoices },
    });

    expect(getVoiceStatus(ttsLang)).toBe("available");
    expect(getVoices).toHaveBeenCalledOnce();
  });

  it("matches language codes case-insensitively when the voice has a locale suffix", () => {
    getVoices.mockReturnValue([
      { lang: "EN-us-x-variant" } as SpeechSynthesisVoice,
    ]);
    vi.stubGlobal("window", {
      speechSynthesis: { getVoices },
    });

    expect(getVoiceStatus("en-US")).toBe("available");
  });

  it("accepts another regional voice for the requested language", () => {
    getVoices.mockReturnValue([{ lang: "en-GB" } as SpeechSynthesisVoice]);
    vi.stubGlobal("window", {
      speechSynthesis: { getVoices },
    });

    expect(getVoiceStatus("en-US")).toBe("available");
  });

  it("returns loading while the browser has not loaded any voices", () => {
    getVoices.mockReturnValue([]);
    vi.stubGlobal("window", {
      speechSynthesis: { getVoices },
    });

    expect(getVoiceStatus("ja-JP")).toBe("loading");
  });

  it("returns unavailable when voices exist but none match the TTS locale", () => {
    getVoices.mockReturnValue([
      { lang: "en-US" } as SpeechSynthesisVoice,
      { lang: "fr-FR" } as SpeechSynthesisVoice,
    ]);
    vi.stubGlobal("window", {
      speechSynthesis: { getVoices },
    });

    expect(getVoiceStatus("ko-KR")).toBe("unavailable");
  });
});

describe("useSpeech", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not report playing until the speech engine starts and ignores overlapping play requests", () => {
    const { speechSynthesis, utterances } = stubSpeechSynthesis([
      { lang: "en-US" } as SpeechSynthesisVoice,
    ]);
    const { result, unmount } = renderHook(() => useSpeech("Hello.", "en"));

    act(() => result.current.play());
    expect(result.current.status).toBe("starting");
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);

    act(() => result.current.play());
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);

    act(() => utterances[0].onstart?.());
    expect(result.current.status).toBe("playing");
    unmount();
  });

  it("stops the current utterance and queue when the language changes", () => {
    const { speechSynthesis, utterances } = stubSpeechSynthesis([
      { lang: "en-US" } as SpeechSynthesisVoice,
      { lang: "vi-VN" } as SpeechSynthesisVoice,
    ]);
    const { result, rerender, unmount } = renderHook(
      ({ language }: { language: "en" | "vi" }) =>
        useSpeech("First sentence. Second sentence.", language),
      { initialProps: { language: "en" as "en" | "vi" } },
    );

    act(() => result.current.play());
    act(() => utterances[0].onstart?.());
    expect(result.current.status).toBe("playing");

    rerender({ language: "vi" });

    expect(speechSynthesis.cancel).toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    act(() => utterances[0].onend?.());
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
    unmount();
  });

  it("cancels the utterance queue on unmount", () => {
    const { speechSynthesis } = stubSpeechSynthesis([
      { lang: "en-US" } as SpeechSynthesisVoice,
    ]);
    const { result, unmount } = renderHook(() =>
      useSpeech("First sentence. Second sentence.", "en"),
    );

    act(() => result.current.play());
    unmount();

    expect(speechSynthesis.cancel).toHaveBeenCalled();
  });

  it("reports a missing voice and rechecks availability when the user retries", () => {
    let voices = [{ lang: "fr-FR" } as SpeechSynthesisVoice];
    const speechEnvironment = stubSpeechSynthesis(voices);
    const hook = renderHook(() => useSpeech("Hello.", "en"));
    act(() => hook.result.current.play());

    expect(hook.result.current.voiceStatus).toBe("unavailable");
    expect(hook.result.current.error).toBe(
      "Thiết bị chưa có giọng đọc cho ngôn ngữ này. Hãy cài voice trong cài đặt hệ điều hành.",
    );
    expect(speechEnvironment.speechSynthesis.speak).not.toHaveBeenCalled();

    voices = [{ lang: "en-US" } as SpeechSynthesisVoice];
    speechEnvironment.speechSynthesis.getVoices.mockImplementation(() => voices);
    act(() => hook.result.current.play());

    expect(speechEnvironment.speechSynthesis.speak).toHaveBeenCalledOnce();
    expect(hook.result.current.voiceStatus).toBe("available");
    expect(hook.result.current.status).toBe("starting");
    hook.unmount();
  });

  it("shows the missing voice message when playback reports an unavailable voice", () => {
    const { utterances } = stubSpeechSynthesis([
      { lang: "en-US" } as SpeechSynthesisVoice,
    ]);
    const hook = renderHook(() => useSpeech("Hello.", "en"));

    act(() => hook.result.current.play());
    act(() =>
      utterances[0].onerror?.({
        error: "voice-unavailable",
      }),
    );

    expect(hook.result.current.status).toBe("idle");
    expect(hook.result.current.voiceStatus).toBe("unavailable");
    expect(hook.result.current.error).toBe(
      "Thiết bị chưa có giọng đọc cho ngôn ngữ này. Hãy cài voice trong cài đặt hệ điều hành.",
    );
    act(() => utterances[0].onstart?.());
    expect(hook.result.current.status).toBe("idle");
    hook.unmount();
  });

  it("explains when the browser blocks speech playback", () => {
    const { utterances } = stubSpeechSynthesis([
      { lang: "en-US" } as SpeechSynthesisVoice,
    ]);
    const hook = renderHook(() => useSpeech("Hello.", "en"));

    act(() => hook.result.current.play());
    act(() => utterances[0].onerror?.({ error: "not-allowed" }));

    expect(hook.result.current.error).toBe(
      "Trình duyệt hoặc hệ điều hành đang chặn giọng đọc. Hãy cho phép âm thanh, rồi bấm phát lại.",
    );
    hook.unmount();
  });
});
