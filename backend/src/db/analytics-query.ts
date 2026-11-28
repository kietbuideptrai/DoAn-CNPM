import type { AnalyticsQuery } from "../services/analytics.service";
import { pool } from "./pool";

/** Production adapter: keeps pool details out of the analytics service. */
export const analyticsQuery: AnalyticsQuery = <T>(
  sql: string,
  values?: unknown[],
): Promise<{ rows: T[] }> =>
  pool.query(sql, values) as unknown as Promise<{ rows: T[] }>;
