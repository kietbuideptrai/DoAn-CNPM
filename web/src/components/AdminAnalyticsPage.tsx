import { useEffect, useState } from "react";
import {
  ANALYTICS_DAYS,
  getAdminAnalyticsSummary,
} from "../api/adminClient";
import type {
  AdminAnalyticsSummary,
  AnalyticsDays,
} from "../api/adminClient";
import { useAuth } from "../context/AuthContext";
import { VisitorChart } from "./VisitorChart";

const numberFormatter = new Intl.NumberFormat("vi-VN");
const SEED_NOTE =
  "Số liệu 30 ngày đầu là dữ liệu demo; từ ngày bật ghi nhận là số liệu thật.";

function formatDate(date: string): string {
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [days, setDays] = useState<AnalyticsDays>(30);
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!token) {
      setLoadError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setLoadError(null);

    getAdminAnalyticsSummary(days, token)
      .then((result) => {
        if (active) {
          setSummary(result);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Không thể tải số liệu thống kê.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          setIsRetrying(false);
        }
      });

    return () => {
      active = false;
    };
  }, [days, requestVersion, token]);

  function retryLoad(): void {
    setIsRetrying(true);
    setRequestVersion((version) => version + 1);
  }

  return (
    <main className="page-section content-width admin-content admin-analytics-page">
      <p className="eyebrow">KHU VỰC QUẢN TRỊ</p>
      <h1>Thống kê truy cập</h1>
      <p className="admin-dashboard-description">
        Xem lượt xem trang và số khách duy nhất của website bảo tàng.
      </p>

      <fieldset className="analytics-range">
        <legend>Khoảng thời gian</legend>
        {ANALYTICS_DAYS.map((option) => (
          <label className="analytics-range-option" key={option}>
            <input
              checked={days === option}
              name="analytics-days"
              onChange={() => setDays(option)}
              type="radio"
              value={option}
            />
            {option} ngày
          </label>
        ))}
      </fieldset>

      {isLoading ? (
        <div className="loading-state analytics-state" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Đang tải số liệu thống kê...</span>
        </div>
      ) : loadError || summary === null ? (
        <div className="empty-state error-state analytics-state" role="alert">
          <h2>Không thể tải số liệu thống kê</h2>
          <p>{loadError ?? "Không có dữ liệu để hiển thị."}</p>
          <button
            className="button button-primary"
            disabled={isRetrying}
            onClick={retryLoad}
            type="button"
          >
            {isRetrying ? "Đang thử lại..." : "Thử lại"}
          </button>
        </div>
      ) : (
        <>
          <p className="analytics-range-note" role="status">
            Từ {formatDate(summary.range.from)} đến {formatDate(summary.range.to)}
          </p>

          <dl className="analytics-summary">
            <div className="analytics-card">
              <dt>Lượt xem</dt>
              <dd>{formatNumber(summary.totals.pageviews)}</dd>
            </div>
            <div className="analytics-card">
              <dt>Khách duy nhất</dt>
              <dd>{formatNumber(summary.totals.unique_visitors)}</dd>
            </div>
            <div className="analytics-card">
              <dt>Hôm nay</dt>
              <dd>
                {formatNumber(summary.totals.today_pageviews)}
                <span className="analytics-card-detail">
                  {formatNumber(summary.totals.today_unique_visitors)} khách duy nhất
                </span>
              </dd>
            </div>
            <div className="analytics-card">
              <dt>Ngày cao nhất</dt>
              <dd>
                {summary.totals.peak_day
                  ? formatDate(summary.totals.peak_day.date)
                  : "—"}
                {summary.totals.peak_day ? (
                  <span className="analytics-card-detail">
                    {formatNumber(summary.totals.peak_day.pageviews)} lượt xem
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>

          <section
            aria-labelledby="analytics-chart-title"
            className="analytics-chart-section"
          >
            <h2 id="analytics-chart-title">Lượt xem theo ngày</h2>
            <div className="chart-panel">
              <VisitorChart daily={summary.daily} />
            </div>
          </section>

          <p className="analytics-seed-note">{SEED_NOTE}</p>

          <section
            aria-labelledby="analytics-top-title"
            className="analytics-top-section"
          >
            <h2 id="analytics-top-title">Top hiện vật được xem</h2>
            {summary.top_artifacts.length === 0 ? (
              <p className="analytics-empty" role="status">
                Chưa có hiện vật được xem trong khoảng này.
              </p>
            ) : (
              <div className="admin-artifact-table-wrapper">
                <table className="admin-artifact-table analytics-top-table">
                  <caption className="visually-hidden">
                    Top hiện vật được xem
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Hiện vật</th>
                      <th scope="col">Lượt xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.top_artifacts.map((artifact, index) => (
                      <tr key={`${artifact.slug}-${index}`}>
                        <th scope="row">{artifact.title}</th>
                        <td>{formatNumber(artifact.views)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
