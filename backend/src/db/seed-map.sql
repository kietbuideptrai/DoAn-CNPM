-- 7 khu vực trên sơ đồ một tầng 1000 x 600 và vị trí của 8 hiện vật mẫu.
-- Khớp shared/demoMap.ts để web/mobile demo dùng cùng thứ tự và tọa độ.
-- Chạy lại an toàn: chỉ cập nhật đúng 7 khu seed, không nhân bản và không
-- ghi đè vị trí hiện vật đã được chỉnh sửa.
INSERT INTO museum_zones (id, name, short_name, description, kind, x, y, width, height, color, sort_order)
VALUES
  ('sanh', 'Sảnh chính', 'Sảnh', 'Cửa vào chính và khu tiếp nhận.', 'lobby', 390, 460, 220, 120, '#E6F0EE', 1),
  ('phong-1', 'Phòng Kháng chiến và Độc lập', 'Kháng chiến', 'Hiện vật của thời kỳ kháng chiến và độc lập.', 'gallery', 60, 60, 280, 180, '#EAF2EC', 2),
  ('phong-2', 'Phòng Đời sống Chủ tịch Hồ Chí Minh', 'Đời sống', 'Đồ vật đời thường gắn với Chủ tịch Hồ Chí Minh.', 'gallery', 360, 60, 280, 180, '#F3EFE3', 3),
  ('phong-3', 'Phòng Ký ức và Hội ngộ', 'Ký ức', 'Kỷ niệm thống nhất đất nước và những cuộc hội ngộ.', 'gallery', 660, 60, 280, 180, '#E8EEF7', 4),
  ('phong-4', 'Phòng Nghệ thuật và Báo chí', 'Nghệ thuật', 'Báo chí và nghệ thuật cách mạng.', 'gallery', 60, 270, 280, 150, '#F6E9E4', 5),
  ('hanh-lang', 'Hành lang trung tâm', 'Hành lang', 'Hành lang nối các phòng trưng bày.', 'walkway', 360, 270, 280, 150, '#F7F8F4', 6),
  ('phong-5', 'Khu trải nghiệm số', 'Trải nghiệm', 'Trải nghiệm số và các gian tương tác.', 'gallery', 660, 270, 280, 150, '#EDEAF4', 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  kind = EXCLUDED.kind,
  x = EXCLUDED.x,
  y = EXCLUDED.y,
  width = EXCLUDED.width,
  height = EXCLUDED.height,
  color = EXCLUDED.color,
  sort_order = EXCLUDED.sort_order;

UPDATE artifacts
SET zone_id = positions.zone_id,
    map_x = positions.map_x,
    map_y = positions.map_y,
    updated_at = NOW()
FROM (VALUES
  ('a-1-skyraider', 'phong-1', 120, 130),
  ('blu-82', 'phong-1', 260, 130),
  ('chuong-cop-con-dao', 'phong-2', 430, 125),
  ('f-5a', 'phong-2', 570, 125),
  ('m48-patton', 'phong-2', 500, 195),
  ('may-chem', 'phong-3', 730, 125),
  ('phao-155mm', 'phong-3', 870, 125),
  ('uh-1-huey', 'phong-4', 200, 345)
) AS positions(slug, zone_id, map_x, map_y)
WHERE artifacts.slug = positions.slug
  AND artifacts.map_x IS NULL
  AND artifacts.map_y IS NULL;
