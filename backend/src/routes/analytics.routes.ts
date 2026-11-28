import { Router } from "express";
import { analyticsQuery } from "../db/analytics-query";
import { asyncHandler } from "../middleware/errors";
import { parsePageViewInput } from "../services/analytics.validation";
import { recordPageView } from "../services/analytics.service";

export const analyticsRouter = Router();

analyticsRouter.post(
  "/pageview",
  asyncHandler(async (request, response) => {
    const input = parsePageViewInput(request.body);
    await recordPageView(input, analyticsQuery);
    response.status(204).end();
  }),
);
