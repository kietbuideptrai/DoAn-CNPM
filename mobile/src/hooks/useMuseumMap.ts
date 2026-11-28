import { useCallback, useEffect, useState } from "react";
import type { Language, MuseumMapData } from "../../../shared/types";
import { ApiRequestError, getMuseumMap } from "@/api/client";
import type { AsyncData } from "@/hooks/apiState";
import { getErrorMessage } from "@/hooks/apiState";

export interface UseMuseumMapResult {
  state: AsyncData<MuseumMapData>;
  isRetrying: boolean;
  retry: () => void;
}

interface MuseumMapRequestState {
  key: string;
  state: AsyncData<MuseumMapData>;
}

export function useMuseumMap(language: Language): UseMuseumMapResult {
  const [requestState, setRequestState] =
    useState<MuseumMapRequestState | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${language}\u0000${requestVersion}`;

  useEffect(() => {
    const controller = new AbortController();

    getMuseumMap(language, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }

        setRequestState({
          key: requestKey,
          state: { status: "success", data },
        });
        setIsRetrying(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setRequestState({
          key: requestKey,
          state: {
            status: "error",
            error: {
              message: getErrorMessage(
                error,
                "Đã xảy ra lỗi khi tải bản đồ.",
              ),
            },
            statusCode: error instanceof ApiRequestError ? error.status : null,
          },
        });
        setIsRetrying(false);
      });

    return () => controller.abort();
  }, [language, requestKey]);

  const retry = useCallback(() => {
    setIsRetrying(true);
    setRequestVersion((version) => version + 1);
  }, []);

  return {
    state:
      requestState?.key === requestKey
        ? requestState.state
        : { status: "loading" },
    isRetrying,
    retry,
  };
}
