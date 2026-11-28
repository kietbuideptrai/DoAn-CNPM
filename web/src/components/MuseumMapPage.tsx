import { Link, useLocation } from "react-router";
import type { Language, MuseumMapData } from "../../../shared/types";
import { useLanguage } from "../context/LanguageContext";
import { useMuseumMap } from "../hooks/useMuseumMap";
import { groupMapArtifacts } from "../utils/mapGroups";
import { MuseumMap } from "./MuseumMap";

export function MuseumMapPage() {
  const { language } = useLanguage();
  const { search } = useLocation();
  const { state, isRetrying, retry } = useMuseumMap(language);

  return (
    <section
      aria-labelledby="map-page-title"
      className="page-section content-width map-page"
    >
      <p className="eyebrow">SƠ ĐỒ BẢO TÀNG</p>
      <h1 id="map-page-title">Bản đồ bảo tàng</h1>
      <p className="map-description">
        Chạm vào ghim hoặc chọn tên hiện vật để xem thuyết minh chi tiết.
      </p>

      {state.status === "loading" ? (
        <div className="loading-state" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Đang tải bản đồ...</span>
        </div>
      ) : state.status === "error" ? (
        <div className="empty-state error-state" role="alert">
          <span className="empty-icon" aria-hidden="true">
            !
          </span>
          <h2>Không thể tải bản đồ</h2>
          <p>{state.error.message}</p>
          <button
            className="button button-primary"
            disabled={isRetrying}
            onClick={retry}
            type="button"
          >
            {isRetrying ? "Đang thử lại..." : "Thử lại"}
          </button>
        </div>
      ) : (
        <MapContent
          data={state.data}
          search={search}
          language={language}
        />
      )}
    </section>
  );
}

interface MapContentProps {
  data: MuseumMapData;
  search: string;
  language: Language;
}

function MapContent({ data, search, language }: MapContentProps) {
  const { groups, items } = groupMapArtifacts(data);

  return (
    <>
      <MuseumMap zones={data.zones} items={items} search={search} />

      {data.unplaced_artifacts && data.unplaced_artifacts.length > 0 ? (
        <p className="map-unplaced-note" role="status">
          Hiện vật chưa có vị trí trên sơ đồ:{" "}
          {data.unplaced_artifacts.map((artifact) => artifact.title).join(", ")}.
        </p>
      ) : null}

      <section
        aria-labelledby="map-list-title"
        className="map-artifact-section"
      >
        <h2 id="map-list-title">Hiện vật theo khu vực</h2>
        <p className="map-language-note" lang={language}>
          Tên hiện vật theo ngôn ngữ bạn đang chọn.
        </p>

        {groups.length === 0 ? (
          <p className="map-empty" role="status">
            Chưa có hiện vật nào được đặt trên sơ đồ.
          </p>
        ) : (
          <div className="map-artifact-groups">
            {groups.map((group) => {
              const zoneId = group.zone?.id ?? "khac";
              return (
                <section
                  aria-labelledby={`map-zone-${zoneId}`}
                  className="map-zone-group"
                  key={zoneId}
                >
                  <h3 id={`map-zone-${zoneId}`}>{group.title}</h3>
                  <ol className="map-artifact-list">
                    {group.items.map(({ artifact, number }) => (
                      <li key={artifact.slug}>
                        <Link
                          aria-label={`Xem chi tiết: ${artifact.title}`}
                          className="map-artifact-link"
                          to={{
                            pathname: `/artifacts/${encodeURIComponent(artifact.slug)}`,
                            search,
                          }}
                        >
                          <span aria-hidden="true" className="map-artifact-number">
                            {number}
                          </span>
                          <span className="map-artifact-text">
                            <strong>{artifact.title}</strong>
                            <span>{artifact.summary}</span>
                          </span>
                          <span aria-hidden="true" className="map-artifact-arrow">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
