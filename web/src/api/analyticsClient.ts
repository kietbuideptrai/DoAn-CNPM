import { API_BASE_URL, isDemoMode } from "./client";

const VISITOR_KEY = "museumVisitorId";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

let lastTrackedKey: string | null = null;
let lastTrackedPath: string | null = null;

export function getVisitorId(): string {
  const stored = window.localStorage.getItem(VISITOR_KEY);
  if (stored && UUID_PATTERN.test(stored)) {
    return stored;
  }

  const visitorId = createUuid();
  window.localStorage.setItem(VISITOR_KEY, visitorId);
  return visitorId;
}

export function trackPageView(pathname: string): void {
  if (isDemoMode() || pathname.startsWith("/admin")) {
    return;
  }

  try {
    void fetch(`${API_BASE_URL}/api/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitor_id: getVisitorId(), path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never interrupt the visitor experience.
    });
  } catch {
    // A blocked or unavailable fetch API is not a page error.
  }
}

export function trackNavigation(key: string, pathname: string): void {
  // StrictMode runs effects twice with the same location key.
  if (key === lastTrackedKey) {
    return;
  }
  lastTrackedKey = key;

  // Language defaults only change the query string of the current page.
  if (pathname === lastTrackedPath) {
    return;
  }
  lastTrackedPath = pathname;
  trackPageView(pathname);
}

export function resetNavigationTracking(): void {
  lastTrackedKey = null;
  lastTrackedPath = null;
}

function createUuid(): string {
  const browserCrypto = globalThis.crypto;
  if (typeof browserCrypto?.randomUUID === "function") {
    try {
      return browserCrypto.randomUUID();
    } catch {
      // Fall through to the byte-based generator.
    }
  }

  const bytes = new Uint8Array(16);
  if (typeof browserCrypto?.getRandomValues === "function") {
    browserCrypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
