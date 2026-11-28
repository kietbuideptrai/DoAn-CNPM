import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { HttpError } from "../middleware/errors";
import {
  ADMIN_TOKEN_TTL_SECONDS,
  hashAdminPassword,
  signAdminToken,
  verifyAdminPassword,
  verifyAdminToken,
} from "./admin-auth";

const TEST_SECRET = "test-secret-with-at-least-thirty-two-characters";
process.env.ADMIN_JWT_SECRET = TEST_SECRET;

function assertHttpError(action: () => unknown, statusCode: number): void {
  assert.throws(
    action,
    (error: unknown) => error instanceof HttpError && error.statusCode === statusCode,
  );
}

describe("admin password hashing", () => {
  it("accepts the matching password and rejects a wrong one", () => {
    const hash = hashAdminPassword("Admin@12345");
    assert.notEqual(hash, "Admin@12345");
    assert.equal(verifyAdminPassword("Admin@12345", hash), true);
    assert.equal(verifyAdminPassword("wrong-password", hash), false);
  });
});

describe("admin JWT", () => {
  it("signs a token carrying sub and email with an 8 hour lifetime", () => {
    const token = signAdminToken({
      sub: "8a9e1c2d-3b4f-4a1e-9c8d-1f2e3a4b5c6d",
      email: "admin@disan.local",
    });
    const claims = jwt.decode(token);

    assert.ok(claims && typeof claims === "object");
    const record = claims as Record<string, unknown>;
    assert.equal(record.sub, "8a9e1c2d-3b4f-4a1e-9c8d-1f2e3a4b5c6d");
    assert.equal(record.email, "admin@disan.local");
    assert.equal(
      Number(record.exp) - Number(record.iat),
      ADMIN_TOKEN_TTL_SECONDS,
    );
  });

  it("verifies a signed token and rejects tampered or expired ones", () => {
    const token = signAdminToken({
      sub: "admin-id",
      email: "admin@disan.local",
    });
    assert.deepEqual(verifyAdminToken(token), {
      sub: "admin-id",
      email: "admin@disan.local",
    });

    assertHttpError(() => verifyAdminToken(`${token}tampered`), 401);
    assertHttpError(
      () =>
        verifyAdminToken(
          jwt.sign({ email: "admin@disan.local" }, TEST_SECRET, {
            subject: "admin-id",
            expiresIn: -1,
          }),
        ),
      401,
    );
  });

  it("refuses to sign without a configured secret", () => {
    const original = process.env.ADMIN_JWT_SECRET;
    delete process.env.ADMIN_JWT_SECRET;
    try {
      assertHttpError(
        () => signAdminToken({ sub: "admin-id", email: "admin@disan.local" }),
        500,
      );
    } finally {
      process.env.ADMIN_JWT_SECRET = original;
    }
  });
});
