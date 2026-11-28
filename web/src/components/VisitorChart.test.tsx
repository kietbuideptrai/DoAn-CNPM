import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { AnalyticsDailyPoint } from "../api/adminClient";
import { VisitorChart } from "./VisitorChart";

const daily: AnalyticsDailyPoint[] = [
  { date: "2026-11-25", pageviews: 40, unique_visitors: 20 },
  { date: "2026-11-26", pageviews: 92, unique_visitors: 31 },
  { date: "2026-11-27", pageviews: 10, unique_visitors: 5 },
];

const PLOT_HEIGHT = 300 - 18 - 48;

afterEach(() => {
  cleanup();
});

describe("VisitorChart", () => {
  it("scales bars and the visitor line to the data and offers a data table", () => {
    const { container } = render(<VisitorChart daily={daily} />);

    const bars = container.querySelectorAll(".visitor-chart-bar");
    expect(bars).toHaveLength(3);
    expect(Number(bars[0].getAttribute("height"))).toBeCloseTo(
      PLOT_HEIGHT * 0.4,
      1,
    );
    expect(Number(bars[1].getAttribute("height"))).toBeCloseTo(
      PLOT_HEIGHT * 0.92,
      1,
    );
    expect(Number(bars[2].getAttribute("height"))).toBeCloseTo(
      PLOT_HEIGHT * 0.1,
      1,
    );

    const points = container
      .querySelector(".visitor-chart-line")
      ?.getAttribute("points")
      ?.split(" ");
    expect(points).toHaveLength(3);
    const [firstX, firstY] = points![0].split(",").map(Number);
    expect(firstX).toBeCloseTo(174, 1);
    expect(firstY).toBeCloseTo(18 + PLOT_HEIGHT * 0.8, 1);

    const axisText = container.querySelector(".visitor-chart-axis")?.textContent;
    expect(axisText).toContain("25/11");
    expect(axisText).toContain("27/11");

    const table = screen.getByRole("table", {
      name: "Số liệu lượt xem và khách duy nhất theo ngày",
    });
    expect(table.querySelectorAll("tbody tr")).toHaveLength(3);
    expect(screen.getByRole("rowheader", { name: "26/11/2026" })).toBeTruthy();
    expect(screen.getByText("92")).toBeTruthy();
  });

  it("shows a tooltip on focus and supports arrow-key navigation", () => {
    const { container } = render(<VisitorChart daily={daily} />);
    const firstDay = screen.getByRole("img", {
      name: "25/11/2026: 40 lượt xem, 20 khách duy nhất",
    });
    const secondDay = screen.getByRole("img", {
      name: "26/11/2026: 92 lượt xem, 31 khách duy nhất",
    });

    fireEvent.focus(firstDay);
    expect(container.querySelector(".visitor-chart-tooltip")?.textContent).toContain(
      "40 lượt xem · 20 khách",
    );
    expect(screen.getByRole("status").textContent).toContain("25/11/2026");

    fireEvent.keyDown(firstDay, { key: "ArrowRight" });
    expect(document.activeElement).toBe(secondDay);
    expect(container.querySelector(".visitor-chart-tooltip")?.textContent).toContain(
      "92 lượt xem · 31 khách",
    );

    fireEvent.keyDown(secondDay, { key: "End" });
    expect(
      container.querySelector(".visitor-chart-tooltip")?.textContent,
    ).toContain("27/11/2026");

    fireEvent.keyDown(secondDay, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(firstDay);

    fireEvent.mouseLeave(firstDay);
    expect(container.querySelector(".visitor-chart-tooltip")).toBeNull();
  });

  it("explains an empty range instead of drawing an empty chart", () => {
    render(<VisitorChart daily={[]} />);
    expect(
      screen.getByText("Chưa có dữ liệu lượt xem trong khoảng này."),
    ).toBeTruthy();
  });
});
