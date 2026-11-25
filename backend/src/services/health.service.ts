export interface HealthStatus {
  status: "ok" | "unavailable";
  checks: {
    backend: "ok";
    database: "ok" | "unavailable";
  };
}

export interface HealthCheckResult {
  status: HealthStatus;
  httpStatus: 200 | 503;
}

export async function getHealthStatus(
  checkDatabase: () => Promise<unknown>,
): Promise<HealthCheckResult> {
  try {
    await checkDatabase();
    return {
      status: {
        status: "ok",
        checks: { backend: "ok", database: "ok" },
      },
      httpStatus: 200,
    };
  } catch {
    return {
      status: {
        status: "unavailable",
        checks: { backend: "ok", database: "unavailable" },
      },
      httpStatus: 503,
    };
  }
}
