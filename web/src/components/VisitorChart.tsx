import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { AnalyticsDailyPoint } from "../api/adminClient";

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 300;
const PADDING = { top: 18, right: 16, bottom: 48, left: 52 };
const PLOT_WIDTH = VIEW_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = VIEW_HEIGHT - PADDING.top - PADDING.bottom;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_HEIGHT = 56;

interface VisitorChartProps {
  daily: AnalyticsDailyPoint[];
}

function formatDay(date: string): string {
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
}

function formatFullDate(date: string): string {
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : date;
}

export function VisitorChart({ daily }: VisitorChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hitAreas = useRef<Array<SVGRectElement | null>>([]);

  if (daily.length === 0) {
    return (
      <p className="chart-empty" role="status">
        Chưa có dữ liệu lượt xem trong khoảng này.
      </p>
    );
  }

  const maxValue = Math.max(
    1,
    ...daily.flatMap((point) => [point.pageviews, point.unique_visitors]),
  );
  const axisMax = Math.max(10, Math.ceil(maxValue / 10) * 10);
  const bandWidth = PLOT_WIDTH / daily.length;
  const barWidth = Math.min(28, bandWidth * 0.55);
  const gridValues = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
    Math.round(axisMax * ratio),
  );
  const labelStep = Math.ceil(daily.length / 6);
  const yFor = (value: number): number =>
    PADDING.top + PLOT_HEIGHT - (value / axisMax) * PLOT_HEIGHT;
  const centerFor = (index: number): number =>
    PADDING.left + bandWidth * (index + 0.5);

  const activePoint = activeIndex === null ? null : daily[activeIndex];

  function moveFocus(event: KeyboardEvent<SVGRectElement>, index: number): void {
    let nextIndex: number;
    if (event.key === "ArrowRight") {
      nextIndex = Math.min(daily.length - 1, index + 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = Math.max(0, index - 1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = daily.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    setActiveIndex(nextIndex);
    hitAreas.current[nextIndex]?.focus();
  }

  return (
    <div className="visitor-chart">
      <ul className="chart-legend" aria-hidden="true">
        <li>
          <span className="chart-legend-swatch" /> Lượt xem
        </li>
        <li>
          <span className="chart-legend-swatch chart-legend-line" /> Khách duy
          nhất
        </li>
      </ul>

      <svg
        aria-label="Biểu đồ lượt xem và khách duy nhất theo ngày"
        className="visitor-chart-svg"
        role="group"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      >
        <g className="visitor-chart-grid">
          {gridValues.map((value) => (
            <g key={value}>
              <line
                x1={PADDING.left}
                x2={PADDING.left + PLOT_WIDTH}
                y1={yFor(value)}
                y2={yFor(value)}
              />
              <text
                textAnchor="end"
                x={PADDING.left - 8}
                y={yFor(value) + 4}
              >
                {value}
              </text>
            </g>
          ))}
        </g>

        <g className="visitor-chart-bars">
          {daily.map((point, index) => {
            const barHeight = (point.pageviews / axisMax) * PLOT_HEIGHT;
            return (
              <rect
                className="visitor-chart-bar"
                height={barHeight}
                key={`bar-${point.date}-${index}`}
                rx={2}
                width={barWidth}
                x={centerFor(index) - barWidth / 2}
                y={yFor(point.pageviews)}
              />
            );
          })}
        </g>

        <polyline
          className="visitor-chart-line"
          points={daily
            .map(
              (point, index) =>
                `${centerFor(index)},${yFor(point.unique_visitors)}`,
            )
            .join(" ")}
        />

        <g className="visitor-chart-points">
          {daily.map((point, index) => (
            <circle
              className="visitor-chart-point"
              cx={centerFor(index)}
              cy={yFor(point.unique_visitors)}
              key={`point-${point.date}-${index}`}
              r={3}
            />
          ))}
        </g>

        <g className="visitor-chart-axis">
          {daily.map((point, index) =>
            index % labelStep === 0 || index === daily.length - 1 ? (
              <text
                key={`label-${point.date}-${index}`}
                textAnchor="middle"
                x={centerFor(index)}
                y={VIEW_HEIGHT - 14}
              >
                {formatDay(point.date)}
              </text>
            ) : null,
          )}
        </g>

        {activePoint && activeIndex !== null ? (
          <g
            aria-hidden="true"
            className="visitor-chart-tooltip"
            transform={`translate(${Math.min(
              Math.max(centerFor(activeIndex) - TOOLTIP_WIDTH / 2, PADDING.left),
              PADDING.left + PLOT_WIDTH - TOOLTIP_WIDTH,
            )} ${Math.max(
              PADDING.top,
              Math.min(
                yFor(activePoint.pageviews) - TOOLTIP_HEIGHT - 8,
                PADDING.top + PLOT_HEIGHT - TOOLTIP_HEIGHT,
              ),
            )})`}
          >
            <rect
              height={TOOLTIP_HEIGHT}
              rx={8}
              width={TOOLTIP_WIDTH}
              x={0}
              y={0}
            />
            <text x={12} y={22}>
              {formatFullDate(activePoint.date)}
            </text>
            <text x={12} y={43}>
              {activePoint.pageviews} lượt xem · {activePoint.unique_visitors} khách
            </text>
          </g>
        ) : null}

        <g className="visitor-chart-hit-areas">
          {daily.map((point, index) => (
            <rect
              aria-label={`${formatFullDate(point.date)}: ${point.pageviews} lượt xem, ${point.unique_visitors} khách duy nhất`}
              className="visitor-chart-hit"
              height={PLOT_HEIGHT}
              key={`hit-${point.date}-${index}`}
              onBlur={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => moveFocus(event, index)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              ref={(node) => {
                hitAreas.current[index] = node;
              }}
              role="img"
              tabIndex={0}
              width={bandWidth}
              x={PADDING.left + index * bandWidth}
              y={PADDING.top}
            />
          ))}
        </g>
      </svg>

      <p className="visually-hidden" role="status">
        {activePoint
          ? `${formatFullDate(activePoint.date)}: ${activePoint.pageviews} lượt xem, ${activePoint.unique_visitors} khách duy nhất`
          : ""}
      </p>

      <details className="visitor-chart-data">
        <summary>Xem bảng số liệu</summary>
        <div className="admin-artifact-table-wrapper">
          <table className="admin-artifact-table visitor-chart-table">
            <caption>Số liệu lượt xem và khách duy nhất theo ngày</caption>
            <thead>
              <tr>
                <th scope="col">Ngày</th>
                <th scope="col">Lượt xem</th>
                <th scope="col">Khách duy nhất</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((point, index) => (
                <tr key={`row-${point.date}-${index}`}>
                  <th scope="row">{formatFullDate(point.date)}</th>
                  <td>{point.pageviews}</td>
                  <td>{point.unique_visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
