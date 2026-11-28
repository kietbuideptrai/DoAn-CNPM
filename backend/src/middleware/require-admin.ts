import type { RequestHandler } from "express";
import { HttpError } from "./errors";
import {
  verifyAdminToken,
  type AdminTokenPayload,
} from "../services/admin-auth";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export const requireAdmin: RequestHandler = (request, _response, next) => {
  const authorization = request.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    next(new HttpError(401, "Yêu cầu đăng nhập quản trị."));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    next(new HttpError(401, "Yêu cầu đăng nhập quản trị."));
    return;
  }

  try {
    request.admin = verifyAdminToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
