import QRCode from "qrcode";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { AdminArtifactFormPage } from "./AdminArtifactForm";

const mocks = vi.hoisted(() => ({
  getAdminArtifact: vi.fn(),
  deleteAdminArtifact: vi.fn(),
}));

vi.mock("qrcode", () => ({
  default: { toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,") },
}));

vi.mock("../api/adminClient", async () => {
  const actual = await vi.importActual<typeof import("../api/adminClient")>(
    "../api/adminClient",
  );
  return {
    ...actual,
    getAdminArtifact: mocks.getAdminArtifact,
    deleteAdminArtifact: mocks.deleteAdminArtifact,
    createAdminArtifact: vi.fn(),
    updateAdminArtifact: vi.fn(),
    saveAdminArtifactTranslation: vi.fn(),
  };
});

function AdminDestination() {
  const location = useLocation();
  const state = location.state as { successMessage?: string } | null;
  return (
    <div>
      <h1>Quản lý nội dung</h1>
      {state?.successMessage ? <p role="status">{state.successMessage}</p> : null}
    </div>
  );
}

function renderEditForm() {
  return render(
    <MemoryRouter initialEntries={["/admin/artifacts/artifact-id/edit"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/admin/artifacts/:id/edit"
            element={<AdminArtifactFormPage mode="edit" />}
          />
          <Route path="/admin" element={<AdminDestination />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem("adminToken", "admin-token");
  vi.clearAllMocks();
  vi.mocked(
    QRCode.toDataURL as unknown as () => Promise<string>,
  ).mockResolvedValue("data:image/png;base64,");
  mocks.getAdminArtifact.mockResolvedValue({
    id: "artifact-id",
    name: "Hiện vật cần xóa",
    slug: "hien-vat-can-xoa",
    category: "Demo",
    image_url: "",
    is_published: true,
    translations: [],
  });
  mocks.deleteAdminArtifact.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("admin artifact deletion", () => {
  it("does not delete when the confirmation is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    renderEditForm();

    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });
    fireEvent.click(screen.getByRole("button", { name: "Xóa hiện vật" }));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("Hiện vật cần xóa"),
    );
    expect(mocks.deleteAdminArtifact).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: "Chỉnh sửa hiện vật" }),
    ).toBeTruthy();
  });

  it("deletes after confirmation and returns to the admin list with a notice", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    renderEditForm();

    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });
    fireEvent.click(screen.getByRole("button", { name: "Xóa hiện vật" }));

    expect(
      await screen.findByRole("heading", { name: "Quản lý nội dung" }),
    ).toBeTruthy();
    expect(mocks.deleteAdminArtifact).toHaveBeenCalledWith(
      "artifact-id",
      "admin-token",
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Hiện vật cần xóa",
    );
  });

  it("shows the error inline and stays on the edit page when deletion fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mocks.deleteAdminArtifact.mockRejectedValue(
      new Error("Không thể xóa hiện vật."),
    );
    renderEditForm();

    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });
    fireEvent.click(screen.getByRole("button", { name: "Xóa hiện vật" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Không thể xóa hiện vật.",
    );
    expect(
      screen.getByRole("heading", { name: "Chỉnh sửa hiện vật" }),
    ).toBeTruthy();
  });
});
