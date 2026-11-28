import QRCode from "qrcode";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { AuthProvider } from "../context/AuthContext";
import { AdminArtifactFormPage } from "./AdminArtifactForm";

const mocks = vi.hoisted(() => ({
  getAdminArtifact: vi.fn(),
  deleteAdminArtifact: vi.fn(),
  getMuseumZones: vi.fn(),
  updateAdminArtifact: vi.fn(),
  saveAdminArtifactTranslation: vi.fn(),
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
    getMuseumZones: mocks.getMuseumZones,
    createAdminArtifact: vi.fn(),
    updateAdminArtifact: mocks.updateAdminArtifact,
    saveAdminArtifactTranslation: mocks.saveAdminArtifactTranslation,
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
    zone_id: "phong-1",
    map_x: 120,
    map_y: 130,
    translations: [],
  });
  mocks.getMuseumZones.mockResolvedValue([
    {
      id: "phong-1",
      name: "Phòng Kháng chiến và Độc lập",
      short_name: "Kháng chiến",
      description: "",
      kind: "gallery",
      x: 60,
      y: 60,
      width: 280,
      height: 180,
      color: "#EAF2EC",
      sort_order: 1,
    },
    {
      id: "sanh",
      name: "Sảnh chính",
      short_name: "Sảnh",
      description: "",
      kind: "lobby",
      x: 390,
      y: 460,
      width: 220,
      height: 120,
      color: "#E6F0EE",
      sort_order: 6,
    },
  ]);
  mocks.deleteAdminArtifact.mockResolvedValue(undefined);
  mocks.updateAdminArtifact.mockResolvedValue(undefined);
  mocks.saveAdminArtifactTranslation.mockResolvedValue(undefined);
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

  it("loads the saved zone and pin, then saves manual coordinates", async () => {
    renderEditForm();
    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });

    const zoneSelect = screen.getByLabelText("Khu vực") as HTMLSelectElement;
    const xInput = screen.getByLabelText("Tọa độ x") as HTMLInputElement;
    const yInput = screen.getByLabelText("Tọa độ y") as HTMLInputElement;
    expect(zoneSelect.value).toBe("phong-1");
    expect(xInput.value).toBe("120");
    expect(yInput.value).toBe("130");

    fireEvent.change(xInput, { target: { value: "200" } });
    fireEvent.change(yInput, { target: { value: "150" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu hiện vật" }));

    await vi.waitFor(() => {
      expect(mocks.updateAdminArtifact).toHaveBeenCalledWith(
        "artifact-id",
        expect.objectContaining({
          zone_id: "phong-1",
          map_x: 200,
          map_y: 150,
        }),
        "admin-token",
      );
    });
  });

  it("rejects coordinates outside the map before calling the API", async () => {
    renderEditForm();
    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });

    fireEvent.change(screen.getByLabelText("Tọa độ x"), {
      target: { value: "1200" },
    });
    const form = screen.getByRole("button", { name: "Lưu hiện vật" }).closest(
      "form",
    );
    if (!form) {
      throw new Error("Admin form not found");
    }
    fireEvent.submit(form);

    expect((await screen.findByRole("alert")).textContent).toContain("0–1000");
    expect(mocks.updateAdminArtifact).not.toHaveBeenCalled();
  });

  it("places the pin when the map is clicked", async () => {
    renderEditForm();
    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });

    const map = document.querySelector("svg.admin-map-svg");
    if (!(map instanceof SVGSVGElement)) {
      throw new Error("Mini map not found");
    }
    vi.spyOn(map, "getBoundingClientRect").mockReturnValue({
      bottom: 600,
      height: 600,
      left: 0,
      right: 1000,
      top: 0,
      width: 1000,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.click(map, { clientX: 250, clientY: 150 });

    expect((screen.getByLabelText("Tọa độ x") as HTMLInputElement).value).toBe(
      "250",
    );
    expect((screen.getByLabelText("Tọa độ y") as HTMLInputElement).value).toBe(
      "150",
    );
  });

  it("centers the pin inside the selected zone", async () => {
    renderEditForm();
    await screen.findByRole("heading", { name: "Chỉnh sửa hiện vật" });

    fireEvent.change(screen.getByLabelText("Khu vực"), {
      target: { value: "phong-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Về giữa khu" }));

    expect((screen.getByLabelText("Tọa độ x") as HTMLInputElement).value).toBe(
      "200",
    );
    expect((screen.getByLabelText("Tọa độ y") as HTMLInputElement).value).toBe(
      "150",
    );
  });
});
