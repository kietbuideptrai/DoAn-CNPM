-- Synthetic demo seed: 8 published sample artifacts with all five languages.
-- This data is fictional and exists only for UI/API demonstrations. It is not
-- museum content and does not require content or image-rights approval.
-- Adds missing rows only. Use a dedicated demo/non-production Supabase project.

BEGIN;

INSERT INTO artifacts (slug, name, image_url, category, is_published)
VALUES
  ('demo-binh-gom-men-lam', 'Bình gốm men lam (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+01', 'Gốm sứ', TRUE),
  ('demo-trong-dong', 'Trống đồng (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+02', 'Kim loại', TRUE),
  ('demo-sach-chu-han', 'Sách chữ Hán (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+03', 'Sách, báo', TRUE),
  ('demo-den-dau', 'Đèn dầu (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+04', 'Đồ dùng sinh hoạt', TRUE),
  ('demo-quat-giay', 'Quạt giấy (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+05', 'Đồ dùng sinh hoạt', TRUE),
  ('demo-hop-go-cham-khac', 'Hộp gỗ chạm khắc (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+06', 'Mỹ thuật', TRUE),
  ('demo-tranh-lua', 'Tranh lụa (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+07', 'Mỹ thuật', TRUE),
  ('demo-guoc-moc', 'Guốc mộc (minh họa)', 'https://placehold.co/800x600?text=Demo+Artifact+08', 'Đồ dùng sinh hoạt', TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO artifact_translations (artifact_id, language_code, title, summary, content)
SELECT artifacts.id, translation.language_code, translation.title, translation.summary, translation.content
FROM (VALUES
  ('demo-binh-gom-men-lam', 'vi', 'Bình gốm men lam (minh họa)', 'Bình gốm dáng cao, trang trí họa tiết hoa lá bằng men xanh.', 'Đây là hiện vật minh họa cho bản demo. Bình có thân tròn, cổ cao và họa tiết hoa lá tượng trưng; nội dung không mô tả một hiện vật thật tại bảo tàng.'),
  ('demo-binh-gom-men-lam', 'en', 'Blue-and-white ceramic vase (sample)', 'A tall ceramic vase decorated with floral motifs in blue underglaze.', 'This is a sample artifact for the demo. The vase has a rounded body, tall neck and representative floral decoration; it does not describe a real museum object.'),
  ('demo-binh-gom-men-lam', 'zh', '青花瓷瓶（示例）', '一件饰有青花花鸟纹样的高式瓷瓶。', '这是用于演示的示例文物。瓶身圆润、瓶颈修长，纹样仅作示意，并不对应真实的博物馆藏品。'),
  ('demo-binh-gom-men-lam', 'ja', '青花磁器の花瓶（サンプル）', '青い下絵で草花文様を描いた、細身の磁器の花瓶です。', 'これはデモ用のサンプル資料です。丸みのある胴、長い首、草花文様は代表的なイメージであり、実在の博物館資料ではありません。'),
  ('demo-binh-gom-men-lam', 'ko', '청화백자 꽃병(예시)', '청화 안료로 꽃무늬를 장식한 키 큰 도자기 꽃병입니다.', '이것은 데모용 예시 유물입니다. 둥근 몸체와 긴 목, 꽃무늬 장식은 대표적인 이미지를 보여 주기 위한 것이며 실제 박물관 소장품이 아닙니다.'),
  ('demo-trong-dong', 'vi', 'Trống đồng (minh họa)', 'Trống đồng có mặt trời ở giữa và các vòng hoa văn đồng tâm.', 'Hiện vật minh họa cho bản demo. Mặt trống hình tròn, chính giữa là hình mặt trời, xung quanh là các vòng hoa văn và chim thú cách điệu. Nội dung không đại diện cho một chiếc trống cụ thể.'),
  ('demo-trong-dong', 'en', 'Bronze drum (sample)', 'A bronze drum with a central sun motif and concentric decorative bands.', 'This is a sample artifact for the demo. The round drum face has a central sun, concentric patterns and stylized birds and animals. It does not represent a specific historical drum.'),
  ('demo-trong-dong', 'zh', '铜鼓（示例）', '鼓面中央有太阳纹，周围环绕同心装饰带。', '这是用于演示的示例文物。圆形鼓面中央为太阳纹，周围是同心纹样和程式化的鸟兽图案，并不对应某件具体文物。'),
  ('demo-trong-dong', 'ja', '銅鼓（サンプル）', '中央に太陽文、周囲に同心円状の文様帯を持つ銅鼓です。', 'これはデモ用のサンプル資料です。円形の鼓面の中央に太陽文、その周囲に同心円文と様式化した鳥獣を配したイメージで、特定の歴史資料ではありません。'),
  ('demo-trong-dong', 'ko', '청동 북(예시)', '중앙에 태양 문양과 동심원 장식 띠가 있는 청동 북입니다.', '이것은 데모용 예시 유물입니다. 둥근 북면 중앙에는 태양 문양이 있고 주변에는 동심원 무늬와 양식화한 새와 짐승이 배치되어 있으며 특정 역사 유물을 나타내지 않습니다.'),
  ('demo-sach-chu-han', 'vi', 'Sách chữ Hán (minh họa)', 'Cuốn sách bìa giấy, chữ viết theo lối Hán tự và đóng chỉ.', 'Hiện vật minh họa cho bản demo. Sách mỏng, bìa giấy, các trang viết theo hàng dọc. Nội dung chỉ mô phỏng hình thức một cuốn sách cổ, không trích dẫn văn bản lịch sử.'),
  ('demo-sach-chu-han', 'en', 'Book in Han characters (sample)', 'A paper-bound book with vertical Han-character text and thread binding.', 'This is a sample artifact for the demo. The thin paper book has vertical columns of characters and thread binding. It only suggests the appearance of an old book and does not quote historical text.'),
  ('demo-sach-chu-han', 'zh', '汉文书籍（示例）', '纸封面、竖排汉字并以线装订的书籍。', '这是用于演示的示例文物。这本薄薄的纸书采用竖排文字和线装形式，仅用来示意古籍外观，并未引用历史文本。'),
  ('demo-sach-chu-han', 'ja', '漢字の書物（サンプル）', '紙の表紙に漢字を縦書きし、糸で綴じた書物です。', 'これはデモ用のサンプル資料です。薄い紙の書物で、漢字を縦に並べ、糸で綴じた外観を示しています。歴史的な文章を引用したものではありません。'),
  ('demo-sach-chu-han', 'ko', '한자 책(예시)', '종이 표지에 한자를 세로로 쓰고 실로 묶은 책입니다.', '이것은 데모용 예시 유물입니다. 얇은 종이 책에 한자를 세로로 배열하고 실로 묶은 모습을 보여 줍니다. 역사적 문헌을 인용한 것은 아닙니다.'),
  ('demo-den-dau', 'vi', 'Đèn dầu (minh họa)', 'Đèn dầu bằng kim loại có bầu chứa dầu và bấc vải.', 'Hiện vật minh họa cho bản demo. Đèn gồm bầu chứa nhiên liệu, nắp và bấc vải; ánh sáng được tạo ra khi đốt bấc. Nội dung không gắn với một địa điểm hay nhân vật cụ thể.'),
  ('demo-den-dau', 'en', 'Oil lamp (sample)', 'A metal oil lamp with a fuel reservoir and fabric wick.', 'This is a sample artifact for the demo. The lamp has a fuel reservoir, a cover and a fabric wick that produced light when lit. It is not associated with a specific place or person.'),
  ('demo-den-dau', 'zh', '油灯（示例）', '带有储油壶和布灯芯的金属油灯。', '这是用于演示的示例文物。油灯由储油壶、盖子和布灯芯组成，点燃灯芯即可照明，并不对应具体地点或人物。'),
  ('demo-den-dau', 'ja', '石油ランプ（サンプル）', '燃料を入れる胴と布の芯を持つ金属製のランプです。', 'これはデモ用のサンプル資料です。燃料を蓄える胴、ふた、布の芯を備え、芯に火を付けて明かりをともす形を示しています。特定の場所や人物に結び付くものではありません。'),
  ('demo-den-dau', 'ko', '기름등(예시)', '연료를 담는 몸체와 천 심지가 있는 금속 기름등입니다.', '이것은 데모용 예시 유물입니다. 연료를 담는 몸체, 뚜껑, 천 심지로 이루어져 있으며 심지에 불을 붙여 빛을 냅니다. 특정 장소나 인물과 연결되지 않습니다.'),
  ('demo-quat-giay', 'vi', 'Quạt giấy (minh họa)', 'Quạt giấy gấp gọn, nan tre và mặt giấy vẽ họa tiết.', 'Hiện vật minh họa cho bản demo. Quạt có các nan tre xếp lớp, mặt giấy nhẹ và họa tiết trang trí đơn giản. Nội dung mô tả một vật dụng dân gian mang tính tượng trưng.'),
  ('demo-quat-giay', 'en', 'Paper fan (sample)', 'A folding paper fan with bamboo ribs and a decorated paper leaf.', 'This is a sample artifact for the demo. The fan has layered bamboo ribs, a light paper leaf and simple decoration. It represents a familiar folk object rather than a specific item.'),
  ('demo-quat-giay', 'zh', '纸扇（示例）', '以竹骨和绘有简单纹样的纸面制成的折扇。', '这是用于演示的示例文物。纸扇由层叠的竹骨、轻薄的纸面和简单纹样组成，表现常见的民间用品形象，并非某件具体物品。'),
  ('demo-quat-giay', 'ja', '紙扇（サンプル）', '竹の骨と絵柄を施した紙面を持つ折りたたみ扇子です。', 'これはデモ用のサンプル資料です。重ねた竹の骨、軽い紙面、簡単な装飾を持つ扇子で、身近な民具のイメージを表したもので、特定の品ではありません。'),
  ('demo-quat-giay', 'ko', '종이 부채(예시)', '대나무 살과 무늬를 넣은 종이 면으로 만든 접부채입니다.', '이것은 데모용 예시 유물입니다. 여러 겹의 대나무 살, 가벼운 종이 면, 단순한 장식을 갖춘 부채로 친숙한 민속 물품의 이미지를 보여 주며 특정 물건이 아닙니다.'),
  ('demo-hop-go-cham-khac', 'vi', 'Hộp gỗ chạm khắc (minh họa)', 'Hộp gỗ hình chữ nhật, nắp chạm nổi họa tiết hoa lá.', 'Hiện vật minh họa cho bản demo. Hộp có nắp đậy, bề mặt chạm nổi các đường cong và họa tiết hoa lá. Nội dung không xác định niên đại hay nguồn gốc của một hiện vật thật.'),
  ('demo-hop-go-cham-khac', 'en', 'Carved wooden box (sample)', 'A rectangular wooden box with a lid carved with floral motifs.', 'This is a sample artifact for the demo. The lidded box has curved relief carving and floral motifs on its surface. It does not assign a date or provenance to a real object.'),
  ('demo-hop-go-cham-khac', 'zh', '木雕盒（示例）', '长方形木盒，盒盖上有花卉浮雕。', '这是用于演示的示例文物。带盖木盒表面有曲线浮雕和花卉纹样，并未标明真实文物的年代或来源。'),
  ('demo-hop-go-cham-khac', 'ja', '木彫りの箱（サンプル）', 'ふたに草花文様を浮き彫りした長方形の木箱です。', 'これはデモ用のサンプル資料です。ふた付きの箱の表面に曲線的な浮き彫りと草花文様を施した形を示しています。実在する資料の年代や由来を示すものではありません。'),
  ('demo-hop-go-cham-khac', 'ko', '조각된 나무 상자(예시)', '뚜껑에 꽃무늬를 새긴 직사각형 나무 상자입니다.', '이것은 데모용 예시 유물입니다. 뚜껑이 있는 상자 표면에 곡선 조각과 꽃무늬를 새긴 모습을 보여 줍니다. 실제 유물의 연대나 출처를 밝히는 것은 아닙니다.'),
  ('demo-tranh-lua', 'vi', 'Tranh lụa (minh họa)', 'Tranh lụa mô tả phong cảnh làng quê với gam màu nhẹ.', 'Hiện vật minh họa cho bản demo. Tranh được vẽ trên nền lụa, khung đơn giản, mô tả cây cối và mái nhà. Nội dung chỉ nhằm giới thiệu bố cục và chất liệu, không phải tác phẩm có thật.'),
  ('demo-tranh-lua', 'en', 'Silk painting (sample)', 'A silk painting of a rural landscape in soft colors.', 'This is a sample artifact for the demo. The painting on silk, with a simple frame, shows trees and rooftops. It introduces a representative composition and material, not a real artwork.'),
  ('demo-tranh-lua', 'zh', '绢画（示例）', '以柔和色调描绘乡村景色的绢本画。', '这是用于演示的示例文物。画作以绢为底，配简单画框，描绘树木和屋顶，仅用于展示具有代表性的构图和材质，并非真实作品。'),
  ('demo-tranh-lua', 'ja', '絹絵（サンプル）', '淡い色調で農村の風景を描いた絹本の絵です。', 'これはデモ用のサンプル資料です。簡単な額に入った絹本の絵で、木々と屋根を描いています。代表的な構図と素材を示すもので、実在の作品ではありません。'),
  ('demo-tranh-lua', 'ko', '비단 그림(예시)', '부드러운 색조로 시골 풍경을 그린 비단 그림입니다.', '이것은 데모용 예시 유물입니다. 단순한 액자에 담긴 비단 그림으로 나무와 지붕을 표현했습니다. 대표적인 구도와 재료를 소개하기 위한 것이며 실제 작품이 아닙니다.'),
  ('demo-guoc-moc', 'vi', 'Guốc mộc (minh họa)', 'Đôi guốc làm từ gỗ, quai đơn giản và bề mặt đã mòn.', 'Hiện vật minh họa cho bản demo. Guốc có đế gỗ, quai ngang và vết mòn tượng trưng cho quá trình sử dụng. Nội dung không gắn với một nhân vật lịch sử cụ thể.'),
  ('demo-guoc-moc', 'en', 'Wooden clogs (sample)', 'A pair of wooden clogs with simple straps and worn surfaces.', 'This is a sample artifact for the demo. The clogs have wooden soles, simple straps and wear marks that suggest use. They are not linked to a specific historical figure.'),
  ('demo-guoc-moc', 'zh', '木屐（示例）', '木制鞋底、简单鞋带并带有磨损痕迹的一双木屐。', '这是用于演示的示例文物。木屐有木质鞋底和简单鞋带，表面磨损用来表现使用过程，并不对应具体历史人物。'),
  ('demo-guoc-moc', 'ja', '木製の下駄（サンプル）', '木の台に簡単な鼻緒を付け、使い込んだ跡がある下駄です。', 'これはデモ用のサンプル資料です。木の台と簡単な鼻緒を持ち、使用感を表す摩耗跡があります。特定の歴史上の人物に結び付くものではありません。'),
  ('demo-guoc-moc', 'ko', '나무 나막신(예시)', '나무 바닥과 단순한 끈, 사용 흔적이 있는 나막신 한 켤레입니다.', '이것은 데모용 예시 유물입니다. 나무 바닥과 단순한 끈이 있고 사용 흔적을 표현했습니다. 특정 역사적 인물과 연결되지 않습니다.')
) AS translation(slug, language_code, title, summary, content)
JOIN artifacts ON artifacts.slug = translation.slug
ON CONFLICT (artifact_id, language_code) DO NOTHING;

COMMIT;
