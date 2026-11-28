import { useCallback, useEffect, useState } from "react";
import type { Language, MuseumMapData } from "../../../shared/types";
import { ApiRequestError } from "../api/client";
import { getMuseumMap } from "../api/museumClient";
import type { AsyncData } from "./useArtifacts";

export interface UseMuseumMapResult {
  state: AsyncData<MuseumMapData>;
  isRetrying: boolean;
  retry: () => void;
}

export function useMuseumMap(language: Language): UseMuseumMapResult {
  const [state, setState] = useState<AsyncData<MuseumMapData>>({
    status: "loading",
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });

    getMuseumMap(language, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", data });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          error: {
            message:
              error instanceof Error
                ? error.message
                : "Đã xảy ra lỗi khi tải bản đồ.",
          },
          statusCode: error instanceof ApiRequestError ? error.status : null,
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsRetrying(false);
        }
      });

    return () => controller.abort();
  }, [language, requestVersion]);

  const retry = useCallback(() => {
    setIsRetrying(true);
    setRequestVersion((version) => version + 1);
  }, []);

  return { state, isRetrying, retry };
}
