import { Router } from "express";
import { pool } from "../db/pool";
import { asyncHandler, HttpError } from "../middleware/errors";
import { requireAdmin } from "../middleware/require-admin";
import {
  signAdminToken,
  verifyAdminPassword,
} from "../services/admin-auth";
import {
  createAdminArtifact,
  deleteAdminArtifact,
  getAdminArtifact,
  listAdminArtifacts,
  saveAdminArtifactTranslation,
  updateAdminArtifact,
} from "../services/admin-artifacts.service";
import {
  parseAdminArtifactInput,
  parseAdminArtifactPatch,
  parseAdminTranslationInput,
} from "../services/admin-artifacts.validation";

interface AdminAccountRow {
  id: string;
  email: string;
  password_hash: string;
}

export const adminRouter = Router();

adminRouter.post(
  "/auth/login",
  asyncHandler(async (request, response) => {
    const body = readLoginBody(request.body);
    const result = await pool.query<AdminAccountRow>(
      "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
      [body.email],
    );
    const account = result.rows[0];
    if (!account || !verifyAdminPassword(body.password, account.password_hash)) {
      throw new HttpError(401, "Email hoặc mật khẩu không chính xác.");
    }

    response.json({
      token: signAdminToken({ sub: account.id, email: account.email }),
      admin: { id: account.id, email: account.email },
    });
  }),
);

adminRouter.use(requireAdmin);

adminRouter.get(
  "/artifacts",
  asyncHandler(async (_request, response) => {
    response.json({ artifacts: await listAdminArtifacts() });
  }),
);

adminRouter.post(
  "/artifacts",
  asyncHandler(async (request, response) => {
    const created = await createAdminArtifact(
      parseAdminArtifactInput(request.body),
    );
    response.status(201).json(created);
  }),
);

adminRouter.get(
  "/artifacts/:id",
  asyncHandler(async (request, response) => {
    const artifact = await getAdminArtifact(request.params.id);
    if (!artifact) {
      throw new HttpError(404, "Không tìm thấy hiện vật");
    }
    response.json(artifact);
  }),
);

adminRouter.patch(
  "/artifacts/:id",
  asyncHandler(async (request, response) => {
    await updateAdminArtifact(
      request.params.id,
      parseAdminArtifactPatch(request.body),
    );
    response.status(204).end();
  }),
);

adminRouter.delete(
  "/artifacts/:id",
  asyncHandler(async (request, response) => {
    await deleteAdminArtifact(request.params.id);
    response.status(204).end();
  }),
);

adminRouter.put(
  "/artifacts/:id/translations/:language",
  asyncHandler(async (request, response) => {
    const parsed = parseAdminTranslationInput(
      request.params.language,
      request.body,
    );
    await saveAdminArtifactTranslation(
      request.params.id,
      parsed.language,
      parsed.fields,
    );
    response.status(204).end();
  }),
);

function readLoginBody(body: unknown): { email: string; password: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "Dữ liệu đăng nhập không hợp lệ");
  }

  const record = body as Record<string, unknown>;
  const email = record.email;
  const password = record.password;
  if (
    typeof email !== "string" ||
    email.trim().length === 0 ||
    typeof password !== "string" ||
    password.length === 0
  ) {
    throw new HttpError(400, "Vui lòng nhập email và mật khẩu");
  }

  return { email: email.trim(), password };
}
