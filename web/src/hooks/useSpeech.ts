import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Language } from "../../../shared/types";

const ttsLocales: Record<Language, string> = {
  vi: "vi-VN",
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

export function getTtsLocale(language: Language): string {
  return ttsLocales[language];
}

export type SpeechStatus = "idle" | "starting" | "playing" | "paused";
export type VoiceStatus =
  | "loading"
  | "available"
  | "unavailable"
  | "unknown";

export interface UseSpeechResult {
  status: SpeechStatus;
  voiceStatus: VoiceStatus;
  error: string | null;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function getVoiceStatus(
  ttsLang: string,
): Exclude<VoiceStatus, "unknown"> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return "unavailable";
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    return "loading";
  }

  return voices.some((voice) => matchesVoiceLanguage(voice.lang, ttsLang))
    ? "available"
    : "unavailable";
}

function matchesVoiceLanguage(voiceLanguage: string, requestedLanguage: string) {
  const normalizedVoice = voiceLanguage.toLowerCase();
  const normalizedRequested = requestedLanguage.toLowerCase();
  const baseLanguage = normalizedRequested.split("-")[0];
  return (
    normalizedVoice === normalizedRequested ||
    normalizedVoice.startsWith(`${normalizedRequested}-`) ||
    normalizedVoice === baseLanguage ||
    normalizedVoice.startsWith(`${baseLanguage}-`)
  );
}

function getSpeechErrorMessage(error: string): string {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Trình duyệt hoặc hệ điều hành đang chặn giọng đọc. Hãy cho phép âm thanh, rồi bấm phát lại.";
    case "language-unavailable":
    case "voice-unavailable":
      return "Thiết bị chưa có giọng đọc cho ngôn ngữ này. Hãy cài voice trong cài đặt hệ điều hành.";
    case "network":
      return "Không thể tải dịch vụ giọng đọc. Hãy kiểm tra kết nối mạng rồi thử lại.";
    case "audio-busy":
    case "audio-hardware":
      return "Thiết bị âm thanh đang bận hoặc không khả dụng. Hãy kiểm tra âm lượng và thử lại.";
    case "synthesis-unavailable":
      return "Dịch vụ đọc văn bản hiện không khả dụng trên thiết bị này.";
    case "synthesis-failed":
      return "Trình đọc giọng nói gặp lỗi. Hãy thử lại hoặc chọn voice khác trong cài đặt thiết bị.";
    default:
      return "Không thể phát thuyết minh trên thiết bị này.";
  }
}

export function useSpeech(text: string, language: Language): UseSpeechResult {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const utteranceQueue = useRef<string[]>([]);
  const currentIndex = useRef(0);
  const requestId = useRef(0);
  const activeRequest = useRef<number | null>(null);
  const locale = getTtsLocale(language);

  const sentences = useMemo(() => splitSentences(text), [text]);

  const cancelCurrentRequest = useCallback((resetState: boolean) => {
    requestId.current += 1;
    activeRequest.current = null;
    utteranceQueue.current = [];
    currentIndex.current = 0;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (resetState) {
      setStatus("idle");
      setError(null);
    }
  }, []);

  const stop = useCallback(() => {
    cancelCurrentRequest(true);
  }, [cancelCurrentRequest]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setVoiceStatus("unavailable");
      return;
    }

    const speechSynthesis = window.speechSynthesis;
    let voicesLoadTimeout: number | undefined;
    let voicesLoadTimedOut = false;

    function updateVoiceAvailability() {
      const nextStatus = getVoiceStatus(locale);
      if (nextStatus === "loading") {
        if (voicesLoadTimedOut) {
          setVoiceStatus("unknown");
        } else {
          setVoiceStatus("loading");
        }
        return;
      }

      if (voicesLoadTimeout !== undefined) {
        window.clearTimeout(voicesLoadTimeout);
      }
      setVoiceStatus(nextStatus);
    }

    speechSynthesis.addEventListener("voiceschanged", updateVoiceAvailability);
    const initialStatus = getVoiceStatus(locale);
    setVoiceStatus(initialStatus);
    if (initialStatus === "loading") {
      voicesLoadTimeout = window.setTimeout(() => {
        voicesLoadTimedOut = true;
        updateVoiceAvailability();
      }, 2_000);
    }

    return () => {
      speechSynthesis.removeEventListener(
        "voiceschanged",
        updateVoiceAvailability,
      );
      if (voicesLoadTimeout !== undefined) {
        window.clearTimeout(voicesLoadTimeout);
      }
    };
  }, [locale]);

  useEffect(() => {
    cancelCurrentRequest(true);
    return () => cancelCurrentRequest(false);
  }, [text, language, cancelCurrentRequest]);

  const speakNextSentence = useCallback(
    (activeRequestId: number) => {
      if (
        activeRequestId !== requestId.current ||
        activeRequest.current !== activeRequestId ||
        currentIndex.current >= utteranceQueue.current.length
      ) {
        if (
          activeRequestId === requestId.current &&
          activeRequest.current === activeRequestId
        ) {
          activeRequest.current = null;
          setStatus("idle");
        }
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(
          utteranceQueue.current[currentIndex.current],
        );
        utterance.lang = locale;
        const voices = window.speechSynthesis.getVoices();
        const voice =
          voices.find((candidate) => candidate.lang.toLowerCase() === locale.toLowerCase()) ??
          voices.find((candidate) => matchesVoiceLanguage(candidate.lang, locale));
        if (voice) {
          utterance.voice = voice;
        }
        utterance.onstart = () => {
          if (
            activeRequestId === requestId.current &&
            activeRequest.current === activeRequestId
          ) {
            setStatus("playing");
          }
        };
        utterance.onend = () => {
          if (
            activeRequestId !== requestId.current ||
            activeRequest.current !== activeRequestId
          ) {
            return;
          }
          currentIndex.current += 1;
          window.setTimeout(() => speakNextSentence(activeRequestId), 0);
        };
        utterance.onerror = (event) => {
          if (
            activeRequestId !== requestId.current ||
            activeRequest.current !== activeRequestId ||
            event.error === "canceled"
          ) {
            return;
          }

          activeRequest.current = null;
          utteranceQueue.current = [];
          currentIndex.current = 0;
          setStatus("idle");
          if (event.error === "voice-unavailable" || event.error === "language-unavailable") {
            setVoiceStatus("unavailable");
          }
          setError(getSpeechErrorMessage(event.error));
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        if (
          activeRequestId === requestId.current &&
          activeRequest.current === activeRequestId
        ) {
          activeRequest.current = null;
          utteranceQueue.current = [];
          currentIndex.current = 0;
          setStatus("idle");
          setError("Không thể phát thuyết minh trên thiết bị này.");
        }
      }
    },
    [locale],
  );

  const play = useCallback(() => {
    if (
      !("speechSynthesis" in window) ||
      !("SpeechSynthesisUtterance" in window)
    ) {
      setVoiceStatus("unavailable");
      setError("Hiện giờ chưa có voice");
      return;
    }

    if (activeRequest.current !== null) {
      return;
    }

    if (sentences.length === 0) {
      setError("Không có nội dung để đọc.");
      return;
    }

    const currentVoiceStatus = getVoiceStatus(locale);
    setVoiceStatus(currentVoiceStatus);
    if (currentVoiceStatus === "unavailable") {
      setError(getSpeechErrorMessage("language-unavailable"));
      return;
    }

    window.speechSynthesis.cancel();
    requestId.current += 1;
    const requestForSpeech = requestId.current;
    activeRequest.current = requestForSpeech;
    utteranceQueue.current = sentences;
    currentIndex.current = 0;
    setError(null);
    setStatus("starting");
    speakNextSentence(requestForSpeech);
  }, [locale, sentences, speakNextSentence]);

  const pause = useCallback(() => {
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }, [status]);

  const resume = useCallback(() => {
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
    }
  }, [status]);

  return { status, voiceStatus, error, play, pause, resume, stop };
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?。！？])\s*/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
