-- 7 khu vực trên sơ đồ một tầng 1000 x 600 và vị trí của 8 hiện vật mẫu.
-- Chỉ thêm khu còn thiếu và chỉ gán vị trí cho hiện vật chưa có tọa độ.
INSERT INTO museum_zones (id, name, short_name, description, kind, x, y, width, height, color, sort_order)
VALUES
  ('sanh', 'Sảnh chính', 'Sảnh', 'Cửa vào và khu tiếp nhận khách.', 'lobby', 390, 460, 220, 120, '#E6F0EE', 6),
  ('phong-1', 'Phòng Kháng chiến và Độc lập', 'Kháng chiến', 'Hiện vật về giai đoạn kháng chiến và độc lập.', 'gallery', 60, 60, 280, 180, '#EAF2EC', 1),
  ('phong-2', 'Phòng Đời sống Chủ tịch', 'Đời sống', 'Đồ dùng sinh hoạt và cuộc sống của Chủ tịch Hồ Chí Minh.', 'gallery', 360, 60, 280, 180, '#F3EFE3', 2),
  ('phong-3', 'Phòng Ký ức và Hội ngộ', 'Ký ức', 'Hình ảnh và kỷ niệm về ngày thống nhất đất nước.', 'gallery', 660, 60, 280, 180, '#E8EEF7', 3),
  ('phong-4', 'Phòng Nghệ thuật và Báo chí', 'Nghệ thuật', 'Báo chí, sách và tranh cổ động cách mạng.', 'gallery', 60, 270, 280, 150, '#F6E9E4', 4),
  ('hanh-lang', 'Hành lang trung tâm', 'Hành lang', 'Lối đi nối các phòng trưng bày.', 'walkway', 360, 270, 280, 150, '#F7F8F4', 7),
  ('phong-5', 'Khu trải nghiệm số', 'Trải nghiệm', 'Không gian trình chiếu và tương tác số.', 'gallery', 660, 270, 280, 150, '#EDEAF4', 5)
ON CONFLICT (id) DO NOTHING;

UPDATE artifacts
SET zone_id = positions.zone_id,
    map_x = positions.map_x,
    map_y = positions.map_y,
    updated_at = NOW()
FROM (VALUES
  ('dong-hai-dong-1946', 'phong-1', 120, 130),
  ('bao-linh-kach-menh-so-2', 'phong-1', 260, 130),
  ('bo-do-an-chu-tich-ho-chi-minh', 'phong-2', 430, 125),
  ('tui-dung-com-nuoc-ho-chi-minh', 'phong-2', 570, 125),
  ('doi-guoc-go-ho-chi-minh', 'phong-2', 500, 195),
  ('me-con-ngay-gap-mat', 'phong-3', 730, 125),
  ('tap-tho-trong-tuyen', 'phong-3', 870, 125),
  ('tranh-co-dong-cach-mang-thang-tam', 'phong-4', 200, 345)
) AS positions(slug, zone_id, map_x, map_y)
WHERE artifacts.slug = positions.slug
  AND artifacts.map_x IS NULL
  AND artifacts.map_y IS NULL;
