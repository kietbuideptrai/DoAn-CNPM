import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";
import type { Language } from "../../../shared/types";
import { useTranslation } from "@/utils/i18n";

const speechLocales: Record<Language, string> = {
  vi: "vi-VN",
  en: "en-US",
  zh: "zh-CN",
  ja: "ja-JP",
  ko: "ko-KR",
};

export type SpeechStatus = "idle" | "speaking" | "paused";
export type VoiceAvailability = "checking" | "available" | "unavailable";

export interface UseSpeechResult {
  status: SpeechStatus;
  voiceAvailability: VoiceAvailability;
  error: string | null;
  checkVoices: () => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useSpeech(text: string, language: Language): UseSpeechResult {
  const { t } = useTranslation();
  const [statusState, setStatusState] = useState<{
    key: string;
    status: SpeechStatus;
  }>({ key: "", status: "idle" });
  const [voiceResult, setVoiceResult] = useState<{
    locale: string;
    availability: Exclude<VoiceAvailability, "checking">;
  } | null>(null);
  const [voiceCheckVersion, setVoiceCheckVersion] = useState(0);
  const [errorState, setErrorState] = useState<{
    key: string;
    error: string | null;
  } | null>(null);
  const sentences = useRef<string[]>([]);
  const currentSentenceIndex = useRef(0);
  const requestId = useRef(0);
  const androidPauseStop = useRef<Promise<void> | null>(null);
  const speakSentenceRef = useRef<(activeRequestId: number) => void>(() => {});
  const locale = speechLocales[language];
  const playbackKey = `${language}\u0000${text}`;
  const playbackKeyRef = useRef(playbackKey);
  const status =
    statusState.key === playbackKey ? statusState.status : "idle";
  const error =
    errorState?.key === playbackKey ? errorState.error : null;
  const voiceAvailability =
    voiceResult?.locale === locale ? voiceResult.availability : "checking";

  const checkVoices = useCallback(() => {
    setVoiceResult(null);
    setVoiceCheckVersion((version) => version + 1);
  }, []);

  const cancelSpeech = useCallback(() => {
    requestId.current += 1;
    sentences.current = [];
    currentSentenceIndex.current = 0;
    androidPauseStop.current = null;
    return Speech.stop();
  }, []);

  const stop = useCallback(() => {
    const stopRequest = cancelSpeech();
    setStatusState({ key: playbackKeyRef.current, status: "idle" });
    setErrorState({ key: playbackKeyRef.current, error: null });
    void stopRequest.catch(() => {
      setErrorState({
        key: playbackKeyRef.current,
        error: t("speechStopError"),
      });
    });
  }, [cancelSpeech, t]);

  useEffect(() => {
    let isActive = true;

    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (!isActive) {
          return;
        }

        const normalizedLocale = locale.toLowerCase();
        const hasVoice = voices.some((voice) => {
          const voiceLocale = voice.language.toLowerCase();
          return (
            voiceLocale === normalizedLocale ||
            voiceLocale.startsWith(`${normalizedLocale}-`) ||
            voiceLocale.split("-")[0] === normalizedLocale.split("-")[0]
          );
        });
        setVoiceResult({
          locale,
          availability: hasVoice ? "available" : "unavailable",
        });
      })
      .catch(() => {
        if (isActive) {
          setVoiceResult({ locale, availability: "unavailable" });
        }
      });

    return () => {
      isActive = false;
    };
  }, [locale, voiceCheckVersion]);

  useEffect(() => {
    return () => {
      void cancelSpeech().catch((error: unknown) => {
        console.error("Không thể dừng thuyết minh khi rời màn hình.", error);
      });
    };
  }, [text, language, cancelSpeech]);

  useEffect(() => {
    playbackKeyRef.current = playbackKey;
    speakSentenceRef.current = (activeRequestId) => {
      if (activeRequestId !== requestId.current) {
        return;
      }

      const sentence = sentences.current[currentSentenceIndex.current];
      if (!sentence) {
        setStatusState({ key: playbackKey, status: "idle" });
        return;
      }

      Speech.speak(sentence, {
        language: locale,
        onDone: () => {
          if (activeRequestId !== requestId.current) {
            return;
          }
          currentSentenceIndex.current += 1;
          speakSentenceRef.current(activeRequestId);
        },
        onError: () => {
          if (activeRequestId === requestId.current) {
            setStatusState({ key: playbackKey, status: "idle" });
            setErrorState({
              key: playbackKey,
              error: t("speechPlayError"),
            });
          }
        },
      });
    };
  }, [locale, playbackKey, t]);

  const play = useCallback(() => {
    if (voiceAvailability !== "available") {
      if (voiceAvailability === "unavailable") {
        setErrorState({
          key: playbackKey,
          error: t("speechLocaleUnavailable", { locale }),
        });
      }
      return;
    }

    if (sentences.current.length === 0) {
      sentences.current = splitIntoSentences(text);
    }

    if (sentences.current.length === 0) {
      setErrorState({ key: playbackKey, error: t("speechNoContent") });
      return;
    }

    const activeRequestId = ++requestId.current;
    const stopPreviousSpeech = Speech.stop();
    currentSentenceIndex.current = 0;
    setErrorState({ key: playbackKey, error: null });
    setStatusState({ key: playbackKey, status: "speaking" });
    void stopPreviousSpeech
      .then(() => {
        if (activeRequestId === requestId.current) {
          speakSentenceRef.current(activeRequestId);
        }
      })
      .catch(() => {
        if (activeRequestId === requestId.current) {
          setStatusState({ key: playbackKey, status: "idle" });
          setErrorState({
            key: playbackKey,
            error: t("speechStartError"),
          });
        }
      });
  }, [locale, playbackKey, t, text, voiceAvailability]);

  const pause = useCallback(() => {
    if (status !== "speaking") {
      return;
    }

    if (Platform.OS === "android") {
      requestId.current += 1;
      const stopCurrentSpeech = Speech.stop();
      androidPauseStop.current = stopCurrentSpeech;
      void stopCurrentSpeech.catch(() => {
        setStatusState({ key: playbackKey, status: "speaking" });
        setErrorState({
          key: playbackKey,
          error: t("speechPauseError"),
        });
      });
    } else {
      void Speech.pause().catch(() => {
        setStatusState({ key: playbackKey, status: "speaking" });
        setErrorState({
          key: playbackKey,
          error: t("speechPauseError"),
        });
      });
    }
    setStatusState({ key: playbackKey, status: "paused" });
  }, [playbackKey, status, t]);

  const resume = useCallback(() => {
    if (status !== "paused") {
      return;
    }

    if (Platform.OS === "android") {
      const activeRequestId = ++requestId.current;
      const stopCurrentSpeech = androidPauseStop.current ?? Promise.resolve();
      androidPauseStop.current = null;
      setStatusState({ key: playbackKey, status: "speaking" });
      void stopCurrentSpeech
        .then(() => {
          if (activeRequestId === requestId.current) {
            speakSentenceRef.current(activeRequestId);
          }
        })
        .catch(() => {
          if (activeRequestId === requestId.current) {
            setStatusState({ key: playbackKey, status: "idle" });
            setErrorState({
              key: playbackKey,
              error: t("speechResumeError"),
            });
          }
        });
      return;
    }

    void Speech.resume().catch(() => {
      setStatusState({ key: playbackKey, status: "idle" });
      setErrorState({
        key: playbackKey,
        error: t("speechResumeError"),
      });
    });
    setStatusState({ key: playbackKey, status: "speaking" });
  }, [playbackKey, status, t]);

  return {
    status,
    voiceAvailability,
    error,
    checkVoices,
    play,
    pause,
    resume,
    stop,
  };
}

function splitIntoSentences(content: string): string[] {
  return (
    content
      .match(/[^.!?。！？]+[.!?。！？]?/gu)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}
