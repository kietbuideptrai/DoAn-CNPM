import { Router } from "express";
import { asyncHandler, HttpError } from "../middleware/errors";
import { isLanguage, type Language } from "../services/artifacts.service";
import { getMuseumMap, getMuseumZones } from "../services/museum-map.service";

export const museumRouter = Router();

museumRouter.get(
  "/zones",
  asyncHandler(async (_request, response) => {
    response.json({ zones: await getMuseumZones() });
  }),
);

museumRouter.get(
  "/map",
  asyncHandler(async (request, response) => {
    response.json(await getMuseumMap(getRequestedLanguage(request.query.lang)));
  }),
);

function getRequestedLanguage(requestedLanguage: unknown): Language {
  if (requestedLanguage === undefined) {
    return "vi";
  }
  if (typeof requestedLanguage !== "string" || !isLanguage(requestedLanguage)) {
    throw new HttpError(400, "Ngôn ngữ không hợp lệ");
  }

  return requestedLanguage;
}
