import { demoArtifacts } from "./demoArtifacts";
import type {
  Language,
  MuseumMapArtifact,
  MuseumMapData,
  MuseumZone,
} from "./types";

/** Tọa độ sơ đồ dùng chung giữa web và mobile (viewBox 1000x600). */
export const MUSEUM_MAP_WIDTH = 1000;
export const MUSEUM_MAP_HEIGHT = 600;

export const demoZones: MuseumZone[] = [
  {
    id: "phong-1",
    name: "Phòng Kháng chiến và Độc lập",
    short_name: "Kháng chiến",
    description: "Hiện vật của thời kỳ kháng chiến và độc lập.",
    kind: "gallery",
    x: 60,
    y: 60,
    width: 280,
    height: 180,
    color: "#EAF2EC",
    sort_order: 2,
  },
  {
    id: "phong-2",
    name: "Phòng Đời sống Chủ tịch Hồ Chí Minh",
    short_name: "Đời sống",
    description: "Đồ vật đời thường gắn với Chủ tịch Hồ Chí Minh.",
    kind: "gallery",
    x: 360,
    y: 60,
    width: 280,
    height: 180,
    color: "#F3EFE3",
    sort_order: 3,
  },
  {
    id: "phong-3",
    name: "Phòng Ký ức và Hội ngộ",
    short_name: "Ký ức",
    description: "Kỷ niệm thống nhất đất nước và những cuộc hội ngộ.",
    kind: "gallery",
    x: 660,
    y: 60,
    width: 280,
    height: 180,
    color: "#E8EEF7",
    sort_order: 4,
  },
  {
    id: "phong-4",
    name: "Phòng Nghệ thuật và Báo chí",
    short_name: "Nghệ thuật",
    description: "Báo chí và nghệ thuật cách mạng.",
    kind: "gallery",
    x: 60,
    y: 270,
    width: 280,
    height: 150,
    color: "#F6E9E4",
    sort_order: 5,
  },
  {
    id: "hanh-lang",
    name: "Hành lang trung tâm",
    short_name: "Hành lang",
    description: "Hành lang nối các phòng trưng bày.",
    kind: "walkway",
    x: 360,
    y: 270,
    width: 280,
    height: 150,
    color: "#F7F8F4",
    sort_order: 6,
  },
  {
    id: "phong-5",
    name: "Khu trải nghiệm số",
    short_name: "Trải nghiệm",
    description: "Trải nghiệm số và các gian tương tác.",
    kind: "gallery",
    x: 660,
    y: 270,
    width: 280,
    height: 150,
    color: "#EDEAF4",
    sort_order: 7,
  },
  {
    id: "sanh",
    name: "Sảnh chính",
    short_name: "Sảnh",
    description: "Cửa vào chính và khu tiếp nhận.",
    kind: "lobby",
    x: 390,
    y: 460,
    width: 220,
    height: 120,
    color: "#E6F0EE",
    sort_order: 1,
  },
];

export const demoMapArtifactPositions: Record<
  string,
  { zone_id: string; x: number; y: number }
> = {
  "a-1-skyraider": { zone_id: "phong-1", x: 120, y: 130 },
  "blu-82": { zone_id: "phong-1", x: 260, y: 130 },
  "chuong-cop-con-dao": { zone_id: "phong-2", x: 430, y: 125 },
  "f-5a": { zone_id: "phong-2", x: 570, y: 125 },
  "m48-patton": { zone_id: "phong-2", x: 500, y: 195 },
  "may-chem": { zone_id: "phong-3", x: 730, y: 125 },
  "phao-155mm": { zone_id: "phong-3", x: 870, y: 125 },
  "uh-1-huey": { zone_id: "phong-4", x: 200, y: 345 },
};

export function getDemoMuseumMap(language: Language): MuseumMapData {
  const artifacts: MuseumMapArtifact[] = demoArtifacts.flatMap((artifact) => {
    const position = demoMapArtifactPositions[artifact.slug];
    if (!position) {
      return [];
    }

    const translation =
      artifact.translations[language] ?? artifact.translations.vi;
    return [
      {
        slug: artifact.slug,
        title: translation.title,
        summary: translation.summary,
        image_url: artifact.image_url,
        ...position,
      },
    ];
  });

  return { zones: demoZones, artifacts };
}
