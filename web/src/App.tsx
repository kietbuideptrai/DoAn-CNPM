import {
  Link,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import { useArtifacts } from "./hooks/useArtifacts";
import { useArtifact } from "./hooks/useArtifact";
import { useSpeech } from "./hooks/useSpeech";
import { useViewHistory } from "./hooks/useViewHistory";
import type {
  ArtifactDetail,
  ArtifactListItem,
  Language,
} from "../../shared/types";
import { LanguagePicker } from "./components/LanguagePicker";
import { FontSizePicker } from "./components/FontSizePicker";
import {
  AdminDashboard,
  AdminLayout,
  AdminLoginPage,
  ProtectedRoute,
} from "./components/AdminPages";
import { AdminArtifactFormPage } from "./components/AdminArtifactForm";
import { LanguageProvider } from "./context/LanguageContext";
import { useLanguage } from "./context/LanguageContext";
import { getLanguageLabel } from "./utils/language";

function AppLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to={{ pathname: "/", search: location.search }}>
          <span className="brand-mark" aria-hidden="true">
            D
          </span>
          <span>Di sản kể chuyện</span>
        </Link>

        <nav className="primary-nav" aria-label="Điều hướng chính">
          <Link
            aria-current={currentPath === "/" ? "page" : undefined}
            to={{ pathname: "/", search: location.search }}
          >
            Trang chủ
          </Link>
          <Link
            aria-current={currentPath.startsWith("/artifacts") ? "page" : undefined}
            to={{ pathname: "/artifacts", search: location.search }}
          >
            Hiện vật
          </Link>
        </nav>

        <div className="header-preferences">
          <LanguagePicker />
          <FontSizePicker />
        </div>
      </header>

      <main id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/artifacts" element={<ArtifactListPage />} />
          <Route path="/artifacts/:slug" element={<ArtifactDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>Khám phá câu chuyện phía sau mỗi hiện vật.</span>
      </footer>
    </div>
  );
}

function HomePage() {
  const location = useLocation();
  const { language } = useLanguage();
  const { state, retry } = useArtifacts(language);
  const { slugs, clearHistory } = useViewHistory();
  const artifactsBySlug =
    state.status === "success"
      ? new Map(state.data.map((artifact) => [artifact.slug, artifact]))
      : null;
  const recentlyViewed =
    artifactsBySlug === null
      ? []
      : slugs.flatMap((slug) => {
          const artifact = artifactsBySlug.get(slug);
          return artifact ? [artifact] : [];
        });

  return (
    <>
      <section className="hero content-width">
        <p className="eyebrow">BẢO TÀNG TRONG TẦM TAY</p>
        <h1>Mỗi hiện vật đều có một câu chuyện.</h1>
        <p className="hero-copy">
          Khám phá những dấu mốc lịch sử qua thuyết minh bằng ngôn ngữ bạn chọn.
        </p>
        <Link
          className="button button-primary"
          to={{ pathname: "/artifacts", search: location.search }}
        >
          Khám phá hiện vật <span aria-hidden="true">→</span>
        </Link>
        <div className="hero-note">
          <span className="status-dot" aria-hidden="true" />
          <span>Khám phá câu chuyện bằng năm ngôn ngữ.</span>
        </div>
      </section>

      <section
        className="page-section content-width recent-history"
        aria-labelledby="recent-history-title"
      >
        <div className="recent-history-heading">
          <h2 id="recent-history-title">Đã xem gần đây</h2>
          {slugs.length > 0 ? (
            <button
              className="text-button recent-history-clear"
              onClick={clearHistory}
              type="button"
            >
              Xóa lịch sử
            </button>
          ) : null}
        </div>
        {state.status === "loading" ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="loading-spinner" aria-hidden="true" />
            <span>Đang tải hiện vật đã xem...</span>
          </div>
        ) : state.status === "error" ? (
          <div className="empty-state error-state" role="alert">
            <h2>Không thể tải hiện vật đã xem</h2>
            <p>{state.error.message}</p>
            <button
              className="button button-primary"
              onClick={retry}
              type="button"
            >
              Thử lại
            </button>
          </div>
        ) : recentlyViewed.length > 0 ? (
          <div className="artifact-grid recent-history-grid">
            {recentlyViewed.map((artifact) => (
              <ArtifactCard
                key={artifact.slug}
                artifact={artifact}
                language={language}
                search={location.search}
              />
            ))}
          </div>
        ) : (
          <div className="recent-history-empty" role="status">
            <p>
              {slugs.length === 0
                ? "Các hiện vật bạn đã xem sẽ xuất hiện tại đây."
                : `Không có hiện vật đã xem bằng ${getLanguageLabel(language)}.`}
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function ArtifactListPage() {
  const location = useLocation();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const { state, retry } = useArtifacts(language, searchQuery);

  return (
    <section className="page-section content-width">
      <p className="eyebrow">BỘ SƯU TẬP</p>
      <h1>Hiện vật</h1>
      <div className="artifact-toolbar">
        <label htmlFor="artifact-search">Tìm hiện vật theo tên</label>
        <input
          id="artifact-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          placeholder="Nhập tên hiện vật..."
        />
        {state.status === "success" && (
          <span className="results-count" aria-live="polite">
            {state.data.length} hiện vật
          </span>
        )}
      </div>
      {state.status === "loading" ? (
        <div className="loading-state" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Đang tải danh sách hiện vật...</span>
        </div>
      ) : state.status === "error" ? (
        <div className="empty-state error-state" role="alert">
          <span className="empty-icon" aria-hidden="true">
            !
          </span>
          <h2>Không thể tải danh sách hiện vật</h2>
          <p>{state.error.message}</p>
          <button className="button button-primary" type="button" onClick={retry}>
            Thử lại
          </button>
        </div>
      ) : state.data.length > 0 ? (
        <div className="artifact-grid">
          {state.data.map((artifact) => (
            <ArtifactCard
              key={artifact.slug}
              artifact={artifact}
              language={language}
              search={location.search}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <span className="empty-icon" aria-hidden="true">
            ◇
          </span>
          <h2>
            {searchQuery.trim()
              ? "Không tìm thấy hiện vật phù hợp"
              : "Chưa có hiện vật bằng ngôn ngữ này"}
          </h2>
          <p>
            {searchQuery.trim()
              ? `Không có kết quả cho “${searchQuery.trim()}”. Hãy thử từ khóa khác.`
              : `Chưa có hiện vật bằng ${getLanguageLabel(language)}.`}
          </p>
          {searchQuery.trim() && (
            <button
              className="text-button"
              type="button"
              onClick={() => setSearchQuery("")}
            >
              Xóa từ khóa tìm kiếm
            </button>
          )}
        </div>
      )}
    </section>
  );
}

interface ArtifactCardProps {
  artifact: ArtifactListItem;
  language: Language;
  search: string;
}

function ArtifactCard({ artifact, language, search }: ArtifactCardProps) {
  return (
    <article className="artifact-card">
      <Link
        className="artifact-card-link"
        to={{ pathname: `/artifacts/${artifact.slug}`, search }}
        aria-label={`Xem hiện vật: ${artifact.title}`}
      >
        <ArtifactImage
          className="artifact-image"
          source={artifact.image_url}
          alt={`Ảnh hiện vật ${artifact.title}`}
          loading="lazy"
        />
        <div className="artifact-card-content">
          <span className="artifact-language">{getLanguageLabel(language)}</span>
          <h2>{artifact.title}</h2>
          <p>{artifact.summary}</p>
          <span className="card-more">
            Xem thuyết minh <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

interface ArtifactImageProps {
  source: string;
  alt: string;
  className: string;
  loading?: "eager" | "lazy";
}

function ArtifactImage({
  source,
  alt,
  className,
  loading = "eager",
}: ArtifactImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  if (hasLoadError) {
    return (
      <div className={`${className} image-placeholder`} role="img" aria-label={alt}>
        <span aria-hidden="true">◇</span>
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={source}
      alt={alt}
      loading={loading}
      onError={() => setHasLoadError(true)}
    />
  );
}

function ArtifactDetailPage() {
  const { slug } = useParams();
  const { language } = useLanguage();
  const [fallbackChoice, setFallbackChoice] = useState<{
    slug: string | undefined;
    language: Language;
    choice: "accepted" | "dismissed";
  } | null>(null);
  const currentFallbackChoice =
    fallbackChoice?.slug === slug && fallbackChoice?.language === language
      ? fallbackChoice
      : null;
  const showingEnglishFallback = currentFallbackChoice?.choice === "accepted";
  const { state, isNotFound, retry } = useArtifact(
    slug,
    showingEnglishFallback ? "en" : language,
  );
  const { recordView } = useViewHistory();

  useEffect(() => {
    setFallbackChoice(null);
  }, [slug, language]);

  useEffect(() => {
    if (state.status === "success") {
      recordView(state.data.slug);
    }
  }, [recordView, state]);

  return (
    <section className="page-section content-width">
      <p className="eyebrow">THUYẾT MINH HIỆN VẬT</p>
      {state.status === "loading" ? (
        <div className="loading-state" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Đang tải thuyết minh...</span>
        </div>
      ) : state.status === "error" ? (
        <div className="empty-state error-state" role="alert">
          <span className="empty-icon" aria-hidden="true">
            !
          </span>
          <h1>{isNotFound ? "Không tìm thấy hiện vật" : "Không thể tải hiện vật"}</h1>
          <p>
            {isNotFound
              ? `Không có hiện vật với mã ${slug}.`
              : state.error.message}
          </p>
          {!isNotFound && (
            <button className="button button-primary" type="button" onClick={retry}>
              Thử lại
            </button>
          )}
          <Link className="text-link" to="/artifacts">
            Quay lại danh sách hiện vật
          </Link>
        </div>
      ) : state.data.translation ? (
        <ArtifactDetailContent artifact={state.data} />
      ) : !showingEnglishFallback &&
        state.data.available_languages.includes("en") &&
        currentFallbackChoice?.choice !== "dismissed" ? (
        <EnglishFallbackDialog
          onAccept={() => setFallbackChoice({ slug, language, choice: "accepted" })}
          onCancel={() =>
            setFallbackChoice({ slug, language, choice: "dismissed" })
          }
        />
      ) : (
        <MissingTranslation
          artifact={state.data}
          language={language}
          slug={slug}
        />
      )}
    </section>
  );
}

interface ArtifactDetailContentProps {
  artifact: ArtifactDetail;
}

function ArtifactDetailContent({ artifact }: ArtifactDetailContentProps) {
  const translation = artifact.translation;
  if (!translation) {
    return null;
  }

  const paragraphs = translation.content
    .split(/(?<=[.!?])\s+/u)
    .filter((paragraph) => paragraph.trim().length > 0);
  const speech = useSpeech(translation.content, translation.language_code);

  return (
    <article className="artifact-detail">
      <div className="detail-heading">
        <div>
          <span className="artifact-language">
            {getLanguageLabel(translation.language_code)}
          </span>
          <h1>{translation.title}</h1>
          <p className="detail-summary">{translation.summary}</p>
        </div>
        <div className="speech-controls">
          {speech.status === "idle" ? (
            <button
              className="button button-listen"
              type="button"
              onClick={speech.play}
              aria-label={`Nghe thuyết minh bằng ${getLanguageLabel(translation.language_code)}`}
            >
              <span aria-hidden="true">▶</span>{" "}
              {speech.voiceStatus === "unavailable"
                ? "Kiểm tra lại giọng đọc"
                : speech.error
                  ? "Thử lại"
                  : "Nghe thuyết minh"}
            </button>
          ) : speech.status === "starting" ? (
            <>
              <button className="button button-listen" type="button" disabled>
                Đang khởi tạo giọng đọc...
              </button>
              <button
                className="button button-stop"
                type="button"
                onClick={speech.stop}
              >
                Dừng
              </button>
            </>
          ) : (
            <>
              <button
                className="button button-listen"
                type="button"
                onClick={
                  speech.status === "paused" ? speech.resume : speech.pause
                }
              >
                <span aria-hidden="true">
                  {speech.status === "paused" ? "▶" : "Ⅱ"}
                </span>
                {speech.status === "paused" ? "Tiếp tục" : "Tạm dừng"}
              </button>
              <button
                className="button button-stop"
                type="button"
                onClick={speech.stop}
              >
                Dừng
              </button>
            </>
          )}
          {speech.voiceStatus === "unavailable" ? (
            <p className="speech-message" role="status">
              Hiện giờ chưa có voice
            </p>
          ) : speech.voiceStatus === "loading" ? (
            <p className="speech-message" role="status">
              Đang kiểm tra giọng đọc...
            </p>
          ) : speech.voiceStatus === "unknown" ? (
            <p className="speech-message" role="status">
              Chưa xác định được giọng đọc. Bạn vẫn có thể thử phát thuyết minh.
            </p>
          ) : null}
          {speech.error && speech.voiceStatus !== "unavailable" && (
            <p className="speech-message speech-error" role="alert">
              {speech.error}
            </p>
          )}
        </div>
      </div>
      <ArtifactImage
        className="detail-image"
        source={artifact.image_url}
        alt={`Ảnh hiện vật ${translation.title}`}
      />
      <div className="detail-content" lang={translation.language_code}>
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph}`}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

interface EnglishFallbackDialogProps {
  onAccept: () => void;
  onCancel: () => void;
}

function EnglishFallbackDialog({
  onAccept,
  onCancel,
}: EnglishFallbackDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className="translation-fallback-backdrop">
      <section
        aria-describedby="english-fallback-description"
        aria-labelledby="english-fallback-title"
        aria-modal="true"
        className="translation-fallback-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
            return;
          }

          if (event.key !== "Tab") {
            return;
          }

          const focusableElements =
            dialogRef.current?.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
          if (!focusableElements || focusableElements.length === 0) {
            return;
          }

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <span className="eyebrow">THUYẾT MINH HIỆN VẬT</span>
        <h1 id="english-fallback-title">Chưa có bản dịch</h1>
        <p id="english-fallback-description">
          Hiện chưa có nội dung bằng ngôn ngữ bạn chọn. Bạn có muốn xem nội dung
          bằng tiếng Anh không?
        </p>
        <div className="translation-fallback-actions">
          <button
            className="button button-primary"
            onClick={onAccept}
            type="button"
          >
            Xem tiếng Anh
          </button>
          <button
            className="button translation-fallback-cancel"
            onClick={onCancel}
            ref={cancelButtonRef}
            type="button"
          >
            Hủy
          </button>
        </div>
      </section>
    </div>
  );
}

interface MissingTranslationProps {
  artifact: ArtifactDetail;
  language: Language;
  slug: string | undefined;
}

function MissingTranslation({
  artifact,
  language,
  slug,
}: MissingTranslationProps) {
  return (
    <div className="translation-missing" role="status">
      <ArtifactImage
        className="missing-image"
        source={artifact.image_url}
        alt={`Ảnh hiện vật ${slug}`}
      />
      <div className="missing-message">
        <span className="eyebrow">BẢN DỊCH CHƯA CÓ</span>
        <h1>
          {artifact.available_languages.includes("en")
            ? `Chưa có thuyết minh bằng ${getLanguageLabel(language)}`
            : "Nội dung chưa khả dụng"}
        </h1>
        <p>
          {artifact.available_languages.includes("en")
            ? "Hiện vật này chưa có nội dung trong ngôn ngữ đã chọn. Bạn có thể xem thuyết minh bằng một trong các ngôn ngữ hiện có:"
            : `Hiện chưa có nội dung bằng ${getLanguageLabel(language)} hoặc tiếng Anh cho hiện vật này.`}
        </p>
        <div className="available-languages" aria-label="Ngôn ngữ có sẵn">
          {artifact.available_languages.map((availableLanguage) => (
            <Link
              className="language-chip"
              key={availableLanguage}
              to={{
                pathname: `/artifacts/${artifact.slug}`,
                search: `?lang=${availableLanguage}`,
              }}
              aria-current={availableLanguage === language ? "page" : undefined}
            >
              {getLanguageLabel(availableLanguage)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <section className="page-section content-width">
      <div className="empty-state" role="status">
        <h1>Không tìm thấy trang</h1>
        <p>Đường dẫn này không tồn tại.</p>
        <Link className="text-link" to="/">
          Về trang chủ
        </Link>
      </div>
    </section>
  );
}

function PublicApp() {
  return (
    <LanguageProvider>
      <AppLayout />
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route
            path="artifacts/new"
            element={<AdminArtifactFormPage mode="create" />}
          />
          <Route
            path="artifacts/:id/edit"
            element={<AdminArtifactFormPage mode="edit" />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
      <Route path="*" element={<PublicApp />} />
    </Routes>
  );
}
