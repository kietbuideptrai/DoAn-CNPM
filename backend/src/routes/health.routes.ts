import { Router } from "express";
import { pool } from "../db/pool";
import { asyncHandler } from "../middleware/errors";
import { getHealthStatus } from "../services/health.service";

export const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_request, response) => {
    const result = await getHealthStatus(() => pool.query("SELECT 1"));
    response.status(result.httpStatus).json(result.status);
  }),
);
