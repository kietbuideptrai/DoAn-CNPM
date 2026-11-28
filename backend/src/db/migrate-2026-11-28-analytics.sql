-- Thêm bảng thống kê lượt xem vào database đã có dữ liệu.
-- An toàn chạy lại nhiều lần. Chỉ lưu visitor_id, path, artifact_slug, viewed_at.
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL,
  path TEXT NOT NULL,
  artifact_slug TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS page_views_viewed_at_idx ON page_views (viewed_at);
