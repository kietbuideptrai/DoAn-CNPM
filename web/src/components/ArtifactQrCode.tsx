import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { Language } from "../../../shared/types";

interface ArtifactQrCodeProps {
  slug: string;
  title: string;
  language: Language;
}

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function ArtifactQrCode({ slug, title, language }: ArtifactQrCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const artifactUrl = useMemo(() => {
    const configuredBase = import.meta.env.VITE_PUBLIC_URL?.trim();
    const currentUrl = new URL(window.location.origin);
    const configuredUrl = configuredBase ? new URL(configuredBase) : null;
    const shouldUseCurrentOrigin =
      !configuredUrl ||
      (isLoopbackHost(configuredUrl.hostname) &&
        !isLoopbackHost(currentUrl.hostname));
    const baseUrl = shouldUseCurrentOrigin
      ? currentUrl.origin
      : configuredUrl.origin;
    const url = new URL(`/artifacts/${encodeURIComponent(slug)}`, baseUrl);
    url.searchParams.set("lang", language);
    return url.toString();
  }, [language, slug]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;
    setQrDataUrl(null);
    setError(null);
    QRCode.toDataURL(artifactUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 224,
    })
      .then((dataUrl) => {
        if (!isCancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError("Không thể tạo mã QR. Vui lòng thử lại.");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [artifactUrl, isOpen]);

  const qrHost = new URL(artifactUrl).hostname;
  const requiresLanUrl = isLoopbackHost(qrHost);

  return (
    <div className="artifact-qr-control">
      <button
        aria-expanded={isOpen}
        className="button button-qr"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? "Ẩn mã QR" : "Hiện QR để quét"}
      </button>
      {isOpen ? (
        <div className="artifact-qr-panel">
          <p>Quét mã để mở “{title}” trên điện thoại.</p>
          {qrDataUrl ? (
            <img alt={`Mã QR mở hiện vật ${title}`} src={qrDataUrl} />
          ) : error ? (
            <p role="alert">{error}</p>
          ) : (
            <p role="status">Đang tạo mã QR...</p>
          )}
          <a href={artifactUrl}>{artifactUrl}</a>
          {requiresLanUrl ? (
            <p className="artifact-qr-hint" role="note">
              Để điện thoại quét được, hãy mở web bằng địa chỉ IP LAN của máy tính
              hoặc đặt VITE_PUBLIC_URL thành địa chỉ đó rồi khởi động lại web.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
